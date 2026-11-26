// End-to-end integration test verifying Backend + Vite Proxy + Auth Security Flow
import { spawn } from 'child_process'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { dbGet, dbRun } from './config/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runFlowTest() {
  console.log('\n--- STARTING DEFILEND FULL-STACK INTEGRATION TEST ---\n')

  let backendProcess = null
  let viteProcess = null
  let vitePort = 5173

  try {
    // 1. Start Backend on port 5000
    console.log('[1/6] Starting Backend Server on port 5000...')
    backendProcess = spawn('node server.js', {
      cwd: path.join(rootDir, 'backend'),
      stdio: 'pipe',
      shell: true,
    })

    backendProcess.stdout.on('data', (d) => console.log(`[BACKEND] ${d.toString().trim()}`))
    backendProcess.stderr.on('data', (d) => console.error(`[BACKEND ERR] ${d.toString().trim()}`))

    // 2. Start Vite Dev Server
    console.log('[2/6] Starting Vite Dev Server...')
    viteProcess = spawn('npx vite --no-open', {
      cwd: path.join(rootDir, 'frontend'),
      stdio: 'pipe',
      shell: true,
    })

    viteProcess.stdout.on('data', (d) => {
      const raw = d.toString()
      const clean = raw.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '')
      console.log(`[VITE] ${clean.trim()}`)
      const match = clean.match(/localhost:(\d+)/)
      if (match && match[1]) {
        vitePort = parseInt(match[1], 10)
      }
    })
    viteProcess.stderr.on('data', (d) => console.error(`[VITE ERR] ${d.toString().trim()}`))

    // Wait 4 seconds for servers to start and port to be resolved
    await sleep(4000)

    const viteBase = `http://localhost:${vitePort}`
    console.log(`\nConnecting to Vite on ${viteBase}...`)

    // 3. Test Vite Proxy to Backend
    console.log(`\n[3/6] Testing Vite Proxy (/api/health through ${viteBase})...`)
    const proxyRes = await fetch(`${viteBase}/api/health`)
    const proxyData = await proxyRes.json()
    console.log('Proxy Health Response:', proxyRes.status, proxyData)

    if (proxyRes.status !== 200 || proxyData.status !== 'ok') {
      throw new Error('Vite proxy to backend /api/health failed!')
    }

    // 4. Test Registration via Vite Proxy with Strong Password
    console.log(`\n[4/6] Testing Registration through Vite Proxy (/api/auth/register)...`)
    const testEmail = `e2e_user_${Date.now()}@example.com`
    const strongPassword = 'SecurePassword2026!'

    const regRes = await fetch(`${viteBase}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Fintech User',
        email: testEmail,
        password: strongPassword,
      }),
    })
    const regData = await regRes.json()
    console.log('Registration Status:', regRes.status)
    console.log('Registration Response:', regData)

    if (regRes.status !== 201 || !regData.requiresVerification) {
      throw new Error('Registration through Vite proxy failed!')
    }

    // 5. Test Unverified Login Block & Email Verification through Proxy
    console.log(`\n[5/6] Testing Verification through Vite Proxy...`)
    const preVerifyLogin = await fetch(`${viteBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: strongPassword }),
    })
    if (preVerifyLogin.status !== 403) {
      throw new Error('Unverified login was not blocked!')
    }

    const userRow = await dbGet('SELECT id FROM users WHERE email = ?', [testEmail])
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    await dbRun(
      'INSERT INTO email_verification_tokens (userId, tokenHash, expiresAt) VALUES (?, ?, ?)',
      [userRow.id, tokenHash, expiresAt]
    )

    const verifyRes = await fetch(`${viteBase}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: rawToken }),
    })
    if (verifyRes.status !== 200) {
      throw new Error('Verification through Vite proxy failed!')
    }

    // 6. Test Login & Profile retrieval via Vite Proxy
    console.log('\n[6/6] Testing Login & Profile retrieval through Vite Proxy...')
    const loginRes = await fetch(`${viteBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: strongPassword,
      }),
    })
    const loginData = await loginRes.json()
    console.log('Login Status:', loginRes.status)

    const meRes = await fetch(`${viteBase}/api/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    })
    const meData = await meRes.json()
    console.log('Current User (/api/auth/me) Status:', meRes.status)
    console.log('Current User Data:', meData.user)

    if (meRes.status !== 200 || meData.user.email !== testEmail.toLowerCase()) {
      throw new Error('Profile retrieval via Vite proxy failed!')
    }

    console.log('\n===============================================================')
    console.log('>>> VITE PROXY + FULL-STACK AUTH SECURITY FULLY FUNCTIONAL <<<')
    console.log('===============================================================\n')
  } catch (error) {
    console.error('E2E Test Failed:', error)
    process.exitCode = 1
  } finally {
    if (backendProcess) backendProcess.kill()
    if (viteProcess) viteProcess.kill()
    setTimeout(() => process.exit(process.exitCode || 0), 1000)
  }
}

runFlowTest()
