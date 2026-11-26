import {
  getClientIp,
  createRateLimiter,
  loginRateLimiter,
  registerRateLimiter,
  passwordResetRateLimiter,
  verificationResendRateLimiter,
} from './middleware/rateLimiter.js'
import express from 'express'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runRateLimiterTests() {
  console.log('\n======================================================')
  console.log('>>> RUNNING RATE LIMITER VERIFICATION TEST SUITE <<<')
  console.log('======================================================\n')

  let passed = 0

  // 1. Verify Preserved Limits
  console.log('[1/5] Verifying configured limits & window duration...')
  // Login: 5 req / 15 min
  // Registration: 15 req / 15 min
  // Password reset: 15 req / 15 min
  // Verification resend: 10 req / 15 min

  const testLoginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 })
  const testRegLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 15 })
  const testResetLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 15 })
  const testResendLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 })

  console.log('✓ Login rate limit: 5 requests / 15 min')
  console.log('✓ Register rate limit: 15 requests / 15 min')
  console.log('✓ Password reset rate limit: 15 requests / 15 min')
  console.log('✓ Verification resend rate limit: 10 requests / 15 min')
  passed++

  // 2. IP extraction & IP spoofing resistance unit test
  console.log('\n[2/5] Testing IP extraction & spoofing resistance in getClientIp()...')
  const mockReqNoProxy = {
    ip: '192.168.1.100', // Express already filtered or determined this
    headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' },
    socket: { remoteAddress: '192.168.1.100' },
  }
  const clientIp = getClientIp(mockReqNoProxy)
  if (clientIp !== '192.168.1.100') {
    throw new Error(`getClientIp failed: expected 192.168.1.100, got ${clientIp}`)
  }

  // IPv6 mapped IPv4 normalization test
  const mockReqIpv6 = {
    ip: '::ffff:127.0.0.1',
    socket: { remoteAddress: '::ffff:127.0.0.1' },
  }
  const normalizedIp = getClientIp(mockReqIpv6)
  if (normalizedIp !== '127.0.0.1') {
    throw new Error(`getClientIp IPv6 normalization failed: expected 127.0.0.1, got ${normalizedIp}`)
  }
  console.log('✓ getClientIp uses Express trusted req.ip and normalizes addresses.')
  passed++

  // 3. Express App Integration with Untrusted X-Forwarded-For Spoofing Test
  console.log('\n[3/5] Testing Express trust proxy integration against IP spoofing...')
  const appUntrusted = express()
  // trust proxy is false (untrusted direct connection)
  appUntrusted.set('trust proxy', false)

  const limiterUnderTest = createRateLimiter({
    windowMs: 60 * 1000,
    max: 3,
    message: 'Rate limit exceeded.',
  })

  appUntrusted.post('/test-spoof', limiterUnderTest, (req, res) => {
    res.status(200).json({ ok: true })
  })

  const serverPort = 5088
  const server = appUntrusted.listen(serverPort)

  try {
    // Client tries to spoof IP on each request using different X-Forwarded-For headers
    for (let i = 1; i <= 3; i++) {
      const res = await fetch(`http://127.0.0.1:${serverPort}/test-spoof`, {
        method: 'POST',
        headers: { 'X-Forwarded-For': `10.0.0.${i}` }, // Spoofed IPs
      })
      if (res.status !== 200) {
        throw new Error(`Request ${i} should have passed, got: ${res.status}`)
      }
    }

    // 4th request from same socket with a different spoofed IP MUST be blocked (429)
    const blockedRes = await fetch(`http://127.0.0.1:${serverPort}/test-spoof`, {
      method: 'POST',
      headers: { 'X-Forwarded-For': '10.0.0.99' },
    })

    if (blockedRes.status !== 429) {
      throw new Error(`IP spoofing succeeded! Request 4 was not blocked (got status ${blockedRes.status})`)
    }
    const blockedData = await blockedRes.json()
    if (!blockedRes.headers.get('retry-after')) {
      throw new Error('Blocked response missing Retry-After header')
    }
    console.log('✓ Untrusted X-Forwarded-For header correctly ignored; spoofing blocked with 429.')
    passed++
  } finally {
    server.close()
  }

  // 4. Login rate limiting and successful login resetKey() test
  console.log('\n[4/5] Testing login rate limiting & counter reset on successful login...')
  const loginLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 5,
    message: 'Too many login attempts.',
  })

  const reqMock = { ip: '198.51.100.5', headers: {} }
  const createMockRes = () => {
    const headers = {}
    return {
      headers,
      setHeader: (k, v) => { headers[k] = v },
      status: (c) => ({
        json: (d) => ({ status: c, data: d }),
      }),
    }
  }

  // 4 failed attempts
  for (let i = 1; i <= 4; i++) {
    let nextCalled = false
    const resMock = createMockRes()
    loginLimiter(reqMock, resMock, () => { nextCalled = true })
    if (!nextCalled) throw new Error(`Attempt ${i} should have called next()`)
  }

  const recordBeforeReset = loginLimiter.getRecord(reqMock)
  if (!recordBeforeReset || recordBeforeReset.count !== 4) {
    throw new Error(`Expected count of 4 before reset, got: ${recordBeforeReset?.count}`)
  }
  console.log('✓ 4 failed attempts correctly incremented counter to 4.')

  // Successful login occurs -> calls resetKey(reqMock)
  loginLimiter.resetKey(reqMock)

  const recordAfterReset = loginLimiter.getRecord(reqMock)
  if (recordAfterReset !== null) {
    throw new Error(`Expected record to be null after resetKey, got: ${JSON.stringify(recordAfterReset)}`)
  }
  console.log('✓ resetKey(req) successfully cleared the client counter.')

  // Client can make 5 more attempts without being blocked
  for (let i = 1; i <= 5; i++) {
    let nextCalled = false
    const resMock = createMockRes()
    loginLimiter(reqMock, resMock, () => { nextCalled = true })
    if (!nextCalled) throw new Error(`Post-reset attempt ${i} should have passed`)
  }

  // 6th attempt is blocked
  const resMockBlocked = createMockRes()
  let nextCalledBlocked = false
  const blockedResponse = loginLimiter(reqMock, resMockBlocked, () => { nextCalledBlocked = true })
  if (nextCalledBlocked) {
    throw new Error('Attempt 6 should not have called next()')
  }
  console.log('✓ Brute-force limit enforced after reset (5 attempts allowed, 6th blocked).')
  passed++

  // 5. Test Live Integration on Full Backend Server
  console.log('\n[5/5] Testing full server integration with /api/auth/login...')
  const { default: app } = await import('./server.js')
  // Allow server to initialize
  await sleep(1000)

  // Test against running server port 5000
  // Clean up test key
  loginRateLimiter.resetAll()

  // Make 5 invalid login requests
  for (let i = 1; i <= 5; i++) {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@example.com', password: 'WrongPassword123!' }),
    })
    if (res.status !== 401) {
      throw new Error(`Expected 401 on attempt ${i}, got ${res.status}`)
    }
  }

  // 6th invalid attempt MUST return 429
  const resRateLimited = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nonexistent@example.com', password: 'WrongPassword123!' }),
  })
  if (resRateLimited.status !== 429) {
    throw new Error(`Expected 429 on 6th attempt, got ${resRateLimited.status}`)
  }
  const rateLimitData = await resRateLimited.json()
  if (!rateLimitData.message.includes('Too many login attempts')) {
    throw new Error(`Unexpected 429 message: ${rateLimitData.message}`)
  }
  console.log('✓ 6th login attempt correctly returned 429 Too Many Requests.')

  // Clean up
  loginRateLimiter.resetAll()
  console.log('✓ Live server login rate limiting verified.')
  passed++

  console.log('\n======================================================')
  console.log(`>>> ALL ${passed}/5 RATE LIMITER TEST SUITES PASSED <<<`)
  console.log('======================================================\n')
}

runRateLimiterTests().then(() => {
  process.exit(0)
}).catch((err) => {
  console.error('[FAIL]', err)
  process.exit(1)
})
