// Verification test script for DeFiLend Auth Backend
import crypto from 'crypto'
import { initDatabase, db, dbGet, dbRun } from './config/db.js'
import app from './server.js'

async function runTests() {
  console.log('\n--- STARTING DEFILEND AUTH BACKEND VERIFICATION ---\n')
  const baseUrl = 'http://localhost:5000'

  try {
    // 1. Test Health Endpoint
    console.log('[1/6] Testing GET /api/health...')
    const healthRes = await fetch(`${baseUrl}/api/health`)
    const healthData = await healthRes.json()
    console.log('Health status:', healthRes.status, healthData)

    if (healthRes.status !== 200 || healthData.status !== 'ok') {
      throw new Error('Health check failed')
    }

    // 2. Test User Registration with Strong Password
    console.log('\n[2/6] Testing POST /api/auth/register (New User)...')
    const testEmail = `testuser_${Date.now()}@example.com`
    const registerPayload = {
      name: 'Test Borrower',
      email: testEmail,
      password: 'StrongPassword123!',
    }

    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload),
    })
    const regData = await regRes.json()
    console.log('Register response status:', regRes.status)
    console.log('Register response data:', regData)

    if (regRes.status !== 201 || !regData.requiresVerification) {
      throw new Error('User registration failed')
    }

    // Verify token was NOT leaked
    if (regData.token || regData.verificationLink || regData.verificationToken) {
      throw new Error('SECURITY VIOLATION: Verification token or link leaked in registration response!')
    }

    // Generate test verification token and insert hash into database
    const userRow = await dbGet('SELECT id FROM users WHERE email = ?', [testEmail])
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    await dbRun(
      'INSERT INTO email_verification_tokens (userId, tokenHash, expiresAt) VALUES (?, ?, ?)',
      [userRow.id, tokenHash, expiresAt]
    )

    const verifyRes = await fetch(`${baseUrl}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: rawToken }),
    })
    if (verifyRes.status !== 200) {
      throw new Error('Email verification failed')
    }

    // 3. Test Duplicate Registration Prevention
    console.log('\n[3/6] Testing Duplicate Registration Prevention...')
    const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerPayload),
    })
    const dupData = await dupRes.json()
    console.log('Duplicate register status:', dupRes.status, dupData.message)

    if (dupRes.status !== 400) {
      throw new Error('Duplicate registration should have returned 400 Bad Request')
    }

    // 4. Test User Login
    console.log('\n[4/6] Testing POST /api/auth/login...')
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'StrongPassword123!',
      }),
    })
    const loginData = await loginRes.json()
    console.log('Login response status:', loginRes.status)
    console.log('Login response user:', loginData.user)
    console.log('Login token received:', Boolean(loginData.token))

    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error('Login failed')
    }
    if (loginData.user.passwordHash) {
      throw new Error('SECURITY VIOLATION: passwordHash exposed in login response!')
    }

    const userToken = loginData.token

    // 5. Test Protected GET /api/auth/me with JWT
    console.log('\n[5/6] Testing GET /api/auth/me (Protected with JWT)...')
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    })
    const meData = await meRes.json()
    console.log('/api/auth/me response status:', meRes.status)
    console.log('/api/auth/me user data:', meData.user)

    if (meRes.status !== 200 || meData.user.email !== testEmail.toLowerCase()) {
      throw new Error('Failed to fetch authenticated user profile')
    }
    if (meData.user.passwordHash) {
      throw new Error('SECURITY VIOLATION: passwordHash exposed in /api/auth/me!')
    }

    // 6. Test GET /api/auth/me without JWT (Should Fail with 401)
    console.log('\n[6/6] Testing GET /api/auth/me WITHOUT token (Should return 401)...')
    const unauthRes = await fetch(`${baseUrl}/api/auth/me`)
    const unauthData = await unauthRes.json()
    console.log('Unauthenticated status:', unauthRes.status, unauthData.message)

    if (unauthRes.status !== 401) {
      throw new Error('Unauthenticated request did not return 401')
    }

    console.log('\n======================================================')
    console.log('>>> ALL AUTHENTICATION BACKEND TESTS PASSED CLEANLY <<<')
    console.log('======================================================\n')
  } catch (error) {
    console.error('\nVerification failed:', error.message, error.cause)
    process.exitCode = 1
  } finally {
    process.exit(process.exitCode || 0)
  }
}

// Give server 500ms to listen before probing
setTimeout(runTests, 600)
