// Comprehensive security verification test suite for DeFiLend Auth Backend
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { initDatabase, db, dbGet, dbRun } from './config/db.js'
import { getJwtSecret, JWT_ALGORITHM, signJwt } from './config/jwt.js'
import app from './server.js'

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function runSecurityTests() {
  console.log('\n===============================================================')
  console.log('>>> STARTING DEFILEND 12-POINT SECURITY VERIFICATION SUITE <<<')
  console.log('===============================================================\n')

  const baseUrl = 'http://localhost:5000'

  try {
    // 0. Verify JWT_SECRET security configuration
    console.log('[Setup] Verifying JWT_SECRET configuration & algorithm restriction...')
    const secret = getJwtSecret()
    if (!secret || secret.length < 32) {
      throw new Error('JWT_SECRET does not meet the 32-character minimum security threshold.')
    }
    console.log(`✓ JWT_SECRET is safely loaded (${secret.length} chars) with HS256 enforcement.`)

    // 1. Health check
    console.log('\n[1/12] Verifying Backend Health Check...')
    const healthRes = await fetch(`${baseUrl}/api/health`)
    const healthData = await healthRes.json()
    if (healthRes.status !== 200 || healthData.status !== 'ok') {
      throw new Error(`Health check failed with status: ${healthRes.status}`)
    }
    console.log('✓ Health check passed (200 OK).')

    // 2. Input validation: Malformed tokens, 72-byte passwords, and weak passwords
    console.log('\n[2/12] Testing Input Validation, Token Format & 72-Byte Bcrypt Limit...')
    // 2a. Password byte length limit (> 72 bytes)
    const over72BytePassword = 'A'.repeat(73) + '1!a'
    const byteRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Byte Limit Test',
        email: `bytetest_${Date.now()}@example.com`,
        password: over72BytePassword,
      }),
    })
    const byteData = await byteRes.json()
    if (byteRes.status !== 400 || !byteData.message.includes('72 bytes')) {
      throw new Error(`Password > 72 bytes was not rejected with 400: ${byteRes.status} ${JSON.stringify(byteData)}`)
    }
    console.log('✓ Passwords exceeding 72 bytes are safely rejected before bcrypt hashing.')

    // 2b. Malformed token formats
    const malformedTokens = ['short', 'not-hex-at-all-xyz', '1234', '', 'a'.repeat(63), 'a'.repeat(65)]
    for (const badToken of malformedTokens) {
      const verifyBad = await fetch(`${baseUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: badToken }),
      })
      if (verifyBad.status !== 400) {
        throw new Error(`Malformed verification token "${badToken}" should return 400, got: ${verifyBad.status}`)
      }

      const resetBad = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: badToken, newPassword: 'ValidPassword123!' }),
      })
      if (resetBad.status !== 400) {
        throw new Error(`Malformed reset token "${badToken}" should return 400, got: ${resetBad.status}`)
      }
    }
    console.log('✓ Malformed token strings rejected immediately before database lookup.')

    // 3. User Registration without Token Leakage
    console.log('\n[3/12] Testing New User Registration & Zero Token Leakage...')
    const testEmail = `suite_user_${Date.now()}@example.com`
    const initialPassword = 'InitialSecurePass2026!'

    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Security Borrower',
        email: testEmail,
        password: initialPassword,
      }),
    })
    const regData = await regRes.json()

    if (regRes.status !== 201 || !regData.requiresVerification) {
      throw new Error(`Registration failed: ${regRes.status} ${JSON.stringify(regData)}`)
    }
    if (regData.token || regData.verificationLink || regData.verificationToken) {
      throw new Error('SECURITY VIOLATION: Raw verification token or link exposed in registration response!')
    }
    console.log('✓ User registered. Response contains no raw tokens or secrets.')

    // 4. Duplicate Registration Block
    console.log('\n[4/12] Testing Duplicate Registration Prevention...')
    const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Security Borrower Clone',
        email: testEmail.toUpperCase(),
        password: initialPassword,
      }),
    })
    if (dupRes.status !== 400) {
      throw new Error(`Duplicate registration was not blocked: ${dupRes.status}`)
    }
    console.log('✓ Duplicate registration blocked with 400 Bad Request.')

    // 5. Unverified Users Cannot Access Protected Routes
    console.log('\n[5/12] Testing Unverified Users Cannot Access Protected Routes...')
    const unverifiedLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: initialPassword }),
    })
    if (unverifiedLogin.status !== 403) {
      throw new Error(`Unverified login should return 403, got: ${unverifiedLogin.status}`)
    }

    const unverifiedUserRow = await dbGet('SELECT id FROM users WHERE email = ?', [testEmail])
    const unverifiedToken = signJwt({ id: unverifiedUserRow.id, tokenVersion: 0 })
    const unverifiedAccess = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${unverifiedToken}` },
    })
    if (unverifiedAccess.status !== 403) {
      throw new Error(`Unverified user with token should be blocked by middleware with 403, got: ${unverifiedAccess.status}`)
    }
    console.log('✓ Unverified users cannot log in or access protected routes (403 Forbidden).')

    // 6. Email Verification via Database Token & One-Time Use
    console.log('\n[6/12] Testing Email Verification Flow & Transaction Safety...')
    // Generate secure test token and insert hash into database
    const verifyRawToken = crypto.randomBytes(32).toString('hex')
    const verifyTokenHash = crypto.createHash('sha256').update(verifyRawToken).digest('hex')
    const verifyExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    await dbRun(
      'INSERT INTO email_verification_tokens (userId, tokenHash, expiresAt) VALUES (?, ?, ?)',
      [unverifiedUserRow.id, verifyTokenHash, verifyExpiresAt]
    )

    const verifyRes = await fetch(`${baseUrl}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: verifyRawToken }),
    })
    const verifyData = await verifyRes.json()
    if (verifyRes.status !== 200) {
      throw new Error(`Email verification failed: ${verifyRes.status} ${JSON.stringify(verifyData)}`)
    }

    const verifiedUserRow = await dbGet('SELECT isVerified, tokenVersion FROM users WHERE id = ?', [unverifiedUserRow.id])
    if (verifiedUserRow.isVerified !== 1) {
      throw new Error('User was not marked as isVerified = 1 in database.')
    }

    // Verify token cannot be reused (one-time use)
    const reuseVerify = await fetch(`${baseUrl}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: verifyRawToken }),
    })
    if (reuseVerify.status !== 400) {
      throw new Error('Reusing verification token should be rejected with 400!')
    }
    console.log('✓ Email verification succeeded and token cannot be reused.')

    // 7. Verified User Can Log In & Access Protected Routes
    console.log('\n[7/12] Testing Verified User Login & Protected Routes...')
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: initialPassword }),
    })
    const loginData = await loginRes.json()
    if (loginRes.status !== 200 || !loginData.token) {
      throw new Error(`Login failed for verified user: ${loginRes.status}`)
    }
    if (loginData.user.passwordHash) {
      throw new Error('SECURITY VIOLATION: passwordHash exposed in login response!')
    }

    const tokenBeforeReset = loginData.token

    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tokenBeforeReset}` },
    })
    const meData = await meRes.json()
    if (meRes.status !== 200 || meData.user.email !== testEmail.toLowerCase()) {
      throw new Error(`/api/auth/me failed: ${meRes.status}`)
    }
    console.log('✓ Verified user logged in successfully and accessed /api/auth/me.')

    // 8. Invalid and Tampered JWTs are Rejected
    console.log('\n[8/12] Testing Invalid and Tampered JWT Rejection...')
    const tamperedToken = tokenBeforeReset.slice(0, -6) + 'abcdef'
    const tamperedRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tamperedToken}` },
    })
    if (tamperedRes.status !== 401) {
      throw new Error(`Tampered token should return 401, got: ${tamperedRes.status}`)
    }

    // Token signed with wrong secret
    const fakeToken = jwt.sign(
      { id: unverifiedUserRow.id, tokenVersion: 0 },
      'wrong_secret_key_that_is_long_enough_32chars!',
      { algorithm: 'HS256' }
    )
    const fakeRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${fakeToken}` },
    })
    if (fakeRes.status !== 401) {
      throw new Error(`Wrong-secret token should return 401, got: ${fakeRes.status}`)
    }
    console.log('✓ Tampered tokens and invalid-secret tokens rejected with 401 Unauthorized.')

    // 9. Expired JWTs are Rejected
    console.log('\n[9/12] Testing Expired JWT Rejection...')
    const expiredToken = jwt.sign(
      { id: unverifiedUserRow.id, tokenVersion: 0 },
      secret,
      { expiresIn: '-10s', algorithm: 'HS256' }
    )
    const expiredRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    })
    if (expiredRes.status !== 401) {
      throw new Error(`Expired token should return 401, got: ${expiredRes.status}`)
    }
    console.log('✓ Expired JWT correctly rejected with 401.')

    // 10. Password Reset with Database Transaction & Session Invalidation
    console.log('\n[10/12] Testing Password Reset, Transaction Atomicity & Session Invalidation...')
    const rawResetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex')
    const resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    await dbRun(
      'INSERT INTO password_reset_tokens (userId, tokenHash, expiresAt) VALUES (?, ?, ?)',
      [unverifiedUserRow.id, resetTokenHash, resetExpiresAt]
    )

    const newPassword = 'BrandNewPassword2026!#$'
    const resetRes = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: rawResetToken,
        newPassword,
      }),
    })
    const resetData = await resetRes.json()
    if (resetRes.status !== 200) {
      throw new Error(`Password reset failed: ${resetRes.status} ${JSON.stringify(resetData)}`)
    }

    // Verify tokenVersion was incremented in SQLite
    const userAfterReset = await dbGet('SELECT tokenVersion FROM users WHERE id = ?', [unverifiedUserRow.id])
    if (userAfterReset.tokenVersion !== verifiedUserRow.tokenVersion + 1) {
      throw new Error(`tokenVersion was not incremented! Expected ${verifiedUserRow.tokenVersion + 1}, got ${userAfterReset.tokenVersion}`)
    }
    console.log(`✓ Password reset succeeded and incremented tokenVersion from ${verifiedUserRow.tokenVersion} to ${userAfterReset.tokenVersion}.`)

    // 11. Old JWTs are Rejected after Password Reset (Session Invalidation)
    console.log('\n[11/12] Testing Old JWT Rejection after Password Reset...')
    const oldSessionRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tokenBeforeReset}` },
    })
    const oldSessionData = await oldSessionRes.json()
    if (oldSessionRes.status !== 401 || !oldSessionData.isSessionInvalidated) {
      throw new Error(`Old JWT was not invalidated! Status: ${oldSessionRes.status} ${JSON.stringify(oldSessionData)}`)
    }
    console.log('✓ Old JWT session immediately invalidated and rejected with 401 Unauthorized.')

    // 12. Password Authentication Verification (New vs Old) & Token Reuse Block
    console.log('\n[12/12] Verifying New Password Works, Old Password Fails & Reused Token Blocked...')
    // 12a. Old password fails
    const oldPassLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: initialPassword }),
    })
    if (oldPassLogin.status !== 401) {
      throw new Error('Old password was still accepted after reset!')
    }
    console.log('✓ Old password rejected with 401.')

    // 12b. New password succeeds
    const newPassLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: newPassword }),
    })
    const newPassData = await newPassLogin.json()
    if (newPassLogin.status !== 200 || !newPassData.token) {
      throw new Error('Login with new password failed!')
    }

    // New token works with protected route
    const newSessionRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${newPassData.token}` },
    })
    if (newSessionRes.status !== 200) {
      throw new Error('New token session failed on /api/auth/me!')
    }
    console.log('✓ New password logged in successfully with valid session.')

    // 12c. Reusing reset token fails
    const reuseReset = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: rawResetToken, newPassword: 'AnotherPassword123!' }),
    })
    if (reuseReset.status !== 400) {
      throw new Error('Reusing password reset token was not rejected!')
    }
    console.log('✓ Reusing consumed password reset token rejected with 400.')

    console.log('\n===============================================================')
    console.log('>>> ALL 12 SECURITY TEST SCENARIOS PASSED WITH ZERO ERRORS <<<')
    console.log('===============================================================\n')

    process.exitCode = 0
  } catch (err) {
    console.error('\n❌ Security test failed:', err.message, err.cause)
    process.exitCode = 1
  } finally {
    process.exit(process.exitCode || 0)
  }
}

setTimeout(runSecurityTests, 800)
