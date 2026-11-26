import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { dbGet, dbRun, dbTransaction } from '../config/db.js'
import { signJwt } from '../config/jwt.js'
import { loginRateLimiter } from '../middleware/rateLimiter.js'

// Pre-computed bcrypt dummy hash for constant-time comparisons when user is not found
const DUMMY_HASH = '$2a$10$e8wZ8l1O3t.bVbV7GfDNu.7lU3P/nZvZt7v7nQ0fFk8UuE2vFwJ2y'

// Maximum password byte length allowed by bcrypt algorithm
const BCRYPT_MAX_BYTES = 72

/**
 * Validate password against strong security policy:
 * - Minimum 8 characters, maximum 128 characters
 * - Safe bcrypt byte length limit (max 72 bytes)
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 * - At least one special character (!@#$%^&*...)
 */
export function validateStrongPassword(password) {
  if (!password || typeof password !== 'string') {
    return {
      valid: false,
      message: 'Password is required.',
    }
  }

  if (password.length < 8) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters long.',
    }
  }

  if (password.length > 128) {
    return {
      valid: false,
      message: 'Password must not exceed 128 characters.',
    }
  }

  if (Buffer.byteLength(password, 'utf8') > BCRYPT_MAX_BYTES) {
    return {
      valid: false,
      message: 'Password cannot exceed 72 bytes.',
    }
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter (A-Z).',
    }
  }

  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter (a-z).',
    }
  }

  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number (0-9).',
    }
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)) {
    return {
      valid: false,
      message:
        'Password must contain at least one special character (e.g. !@#$%^&*).',
    }
  }

  return { valid: true }
}

/**
 * Validate email address format and length strictly
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  const trimmed = email.trim()
  if (trimmed.length < 3 || trimmed.length > 254) return false
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  return emailRegex.test(trimmed)
}

/**
 * Validate user name format and length
 */
export function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Full name is required.' }
  }

  const trimmed = name.trim()
  if (trimmed.length < 2) {
    return {
      valid: false,
      message: 'Full name must be at least 2 characters long.',
    }
  }

  if (trimmed.length > 60) {
    return {
      valid: false,
      message: 'Full name must not exceed 60 characters.',
    }
  }

  return { valid: true, sanitized: trimmed }
}

/**
 * Validate verification and reset token format (must be 64 hex characters)
 */
export function isValidTokenFormat(token) {
  if (!token || typeof token !== 'string') return false
  return /^[0-9a-fA-F]{64}$/.test(token.trim())
}

// Helper: Generate JWT Token with tokenVersion
function generateToken(user) {
  return signJwt({
    id: user.id,
    tokenVersion: user.tokenVersion ?? 0,
  })
}

// Helper: Create Gmail transporter
function createEmailTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    return null
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  })
}

// Helper: Escape HTML values used in emails
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }

    return entities[char]
  })
}

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
export async function register(req, res) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        message: 'Invalid request body.',
      })
    }

    const { name, email, password } = req.body

    // 1. Validate full name
    const nameValidation = validateName(name)
    if (!nameValidation.valid) {
      return res.status(400).json({
        message: nameValidation.message,
      })
    }

    // 2. Validate email format
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        message: 'Please provide a valid email address.',
      })
    }

    // 3. Validate strong password
    const passwordValidation = validateStrongPassword(password)
    if (!passwordValidation.valid) {
      return res.status(400).json({
        message: passwordValidation.message,
      })
    }

    const trimmedName = nameValidation.sanitized
    const normalizedEmail = email.trim().toLowerCase()

    // 4. Prevent duplicate email registration
    const existingUser = await dbGet(
      'SELECT id FROM users WHERE email = ?',
      [normalizedEmail]
    )

    if (existingUser) {
      return res.status(400).json({
        message: 'An account with this email address already exists.',
      })
    }

    // 5. Secure password hashing with bcryptjs (salt rounds: 10)
    const passwordHash = await bcrypt.hash(password, 10)

    // 6. Generate cryptographically secure verification token (32 bytes = 64 hex chars)
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Store only SHA-256 hash of token
    const tokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex')

    // Token expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // 7. Atomic transaction: create user and verification token together
    await dbTransaction(async ({ run }) => {
      const result = await run(
        'INSERT INTO users (name, email, passwordHash, isVerified, tokenVersion) VALUES (?, ?, ?, 0, 0)',
        [trimmedName, normalizedEmail, passwordHash]
      )

      await run(
        `
          INSERT INTO email_verification_tokens (userId, tokenHash, expiresAt)
          VALUES (?, ?, ?)
        `,
        [result.id, tokenHash, expiresAt]
      )
    })

    const frontendUrl = (
      process.env.FRONTEND_URL || 'http://localhost:5173'
    ).replace(/\/$/, '')

    const verificationLink = `${frontendUrl}/verify-email?token=${encodeURIComponent(
      verificationToken
    )}`

    // 8. Send verification email via Nodemailer ONLY after successful commit
    const transporter = createEmailTransporter()
    const safeName = escapeHtml(trimmedName)

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"DeFiLend Security" <${process.env.EMAIL_USER}>`,
          to: normalizedEmail,
          subject: 'Verify your DeFiLend account',
          text: `
Hello ${trimmedName},

Welcome to DeFiLend! Please verify your email address to activate your account.

Click the link below to verify your email:
${verificationLink}

This verification link will expire in 24 hours.

If you did not register for a DeFiLend account, please ignore this email.

Regards,
DeFiLend Security Team
          `,
          html: `
            <div style="
              font-family: Arial, sans-serif;
              line-height: 1.7;
              color: #202124;
              max-width: 560px;
              margin: 20px auto;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
            ">
              <h2 style="color: #6547f5; margin-top: 0;">DeFiLend Protocol</h2>
              <h3>Verify your email address</h3>
              <p>Hello ${safeName},</p>
              <p>Thank you for creating an account with DeFiLend. Please verify your email address to activate your account and access your lending dashboard.</p>
              <p style="margin: 28px 0;">
                <a
                  href="${verificationLink}"
                  style="
                    display: inline-block;
                    padding: 13px 26px;
                    background: #6547f5;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                  "
                >
                  Verify Email Address
                </a>
              </p>
              <p style="font-size: 14px; color: #6b7280;">
                This link will expire in <strong>24 hours</strong>.
              </p>
              <p style="word-break: break-all; font-size: 13px; color: #6b7280;">
                Or copy and paste this link into your browser:<br/>
                <a href="${verificationLink}">${verificationLink}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
              <p style="font-size: 13px; color: #6b7280;">
                If you did not sign up for DeFiLend, you can safely ignore this email.
              </p>
            </div>
          `,
        })
      } catch (emailErr) {
        console.error('Failed to send verification email:', emailErr.message)
      }
    }

    // Never return the raw verification token or link in the API response
    return res.status(201).json({
      message:
        'Account registered successfully. Please check your email to verify your account before logging in.',
      requiresVerification: true,
      email: normalizedEmail,
    })
  } catch (error) {
    console.error('Registration error:', error.message)

    return res.status(500).json({
      message: 'Registration failed due to a server error. Please try again.',
    })
  }
}

/**
 * POST /api/auth/verify-email
 * Body: { token }
 */
export async function verifyEmail(req, res) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        message: 'Invalid request body.',
      })
    }

    const { token } = req.body

    // Validate token format before querying database
    if (!isValidTokenFormat(token)) {
      return res.status(400).json({
        message: 'Invalid or expired verification link.',
      })
    }

    // SHA-256 hash the incoming raw token
    const tokenHash = crypto
      .createHash('sha256')
      .update(token.trim())
      .digest('hex')

    // Execute verification inside an SQLite transaction for atomicity and concurrency protection
    await dbTransaction(async ({ get, run }) => {
      // Find token record
      const tokenRecord = await get(
        `
          SELECT id, userId, expiresAt, usedAt
          FROM email_verification_tokens
          WHERE tokenHash = ?
        `,
        [tokenHash]
      )

      if (!tokenRecord) {
        const err = new Error('Invalid or expired verification link.')
        err.statusCode = 400
        throw err
      }

      // Check if token was already used
      if (tokenRecord.usedAt) {
        const err = new Error('This verification link has already been used.')
        err.statusCode = 400
        throw err
      }

      // Check expiration
      const expirationTime = new Date(tokenRecord.expiresAt).getTime()
      if (Number.isNaN(expirationTime) || Date.now() > expirationTime) {
        const err = new Error('This verification link has expired. Please request a new one.')
        err.statusCode = 400
        throw err
      }

      // Atomically mark token as used with concurrency check
      const updateTokenResult = await run(
        `
          UPDATE email_verification_tokens
          SET usedAt = CURRENT_TIMESTAMP
          WHERE id = ? AND usedAt IS NULL
        `,
        [tokenRecord.id]
      )

      if (updateTokenResult.changes === 0) {
        const err = new Error('This verification link has already been used.')
        err.statusCode = 400
        throw err
      }

      // Mark user as verified
      await run(
        'UPDATE users SET isVerified = 1 WHERE id = ?',
        [tokenRecord.userId]
      )

      // Invalidate any other unused verification tokens for this user
      await run(
        `
          UPDATE email_verification_tokens
          SET usedAt = CURRENT_TIMESTAMP
          WHERE userId = ? AND usedAt IS NULL
        `,
        [tokenRecord.userId]
      )
    })

    return res.status(200).json({
      message:
        'Email verified successfully! You can now sign in with your credentials.',
    })
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message })
    }

    console.error('Email verification error:', error.message)
    return res.status(500).json({
      message: 'Unable to verify email at this time. Please try again later.',
    })
  }
}

/**
 * POST /api/auth/resend-verification
 * Body: { email }
 */
export async function resendVerification(req, res) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        message: 'Invalid request body.',
      })
    }

    const { email } = req.body

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        message: 'Please provide a valid email address.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const user = await dbGet(
      'SELECT id, name, email, isVerified FROM users WHERE email = ?',
      [normalizedEmail]
    )

    // Generic response to prevent user enumeration
    const genericSuccess = {
      message:
        'If an unverified account exists with this email, a verification link has been sent.',
    }

    if (!user || user.isVerified === 1) {
      return res.status(200).json(genericSuccess)
    }

    // Generate new token (32 bytes = 64 hex chars)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex')

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    // Atomically invalidate previous unused verification tokens and insert new token
    await dbTransaction(async ({ run }) => {
      await run(
        `
          UPDATE email_verification_tokens
          SET usedAt = CURRENT_TIMESTAMP
          WHERE userId = ? AND usedAt IS NULL
        `,
        [user.id]
      )

      await run(
        `
          INSERT INTO email_verification_tokens (userId, tokenHash, expiresAt)
          VALUES (?, ?, ?)
        `,
        [user.id, tokenHash, expiresAt]
      )
    })

    const frontendUrl = (
      process.env.FRONTEND_URL || 'http://localhost:5173'
    ).replace(/\/$/, '')

    const verificationLink = `${frontendUrl}/verify-email?token=${encodeURIComponent(
      verificationToken
    )}`

    const transporter = createEmailTransporter()
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"DeFiLend Security" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: 'Verify your DeFiLend account',
          text: `
Hello ${user.name},

Please verify your email address to activate your DeFiLend account:
${verificationLink}

This link will expire in 24 hours.

Regards,
DeFiLend Security Team
          `,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #202124; max-width: 560px; margin: 20px auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
              <h2 style="color: #6547f5;">DeFiLend Protocol</h2>
              <h3>Verify your email address</h3>
              <p>Hello ${escapeHtml(user.name)},</p>
              <p>Click the button below to verify your email and activate your account:</p>
              <p style="margin: 28px 0;">
                <a href="${verificationLink}" style="display: inline-block; padding: 13px 26px; background: #6547f5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email Address</a>
              </p>
              <p style="font-size: 14px; color: #6b7280;">Expires in 24 hours.</p>
            </div>
          `,
        })
      } catch (err) {
        console.error('Resend verification email failed:', err.message)
      }
    }

    return res.status(200).json(genericSuccess)
  } catch (error) {
    console.error('Resend verification error:', error.message)
    return res.status(500).json({
      message: 'Unable to resend verification email at this time.',
    })
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req, res) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        message: 'Email and password are required.',
      })
    }

    const { email, password } = req.body

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({
        message: 'Email and password are required.',
      })
    }

    // Reject passwords exceeding safe bcrypt byte limit with generic error
    if (Buffer.byteLength(password, 'utf8') > BCRYPT_MAX_BYTES) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const user = await dbGet(
      'SELECT id, name, email, passwordHash, walletAddress, isVerified, tokenVersion, createdAt FROM users WHERE email = ?',
      [normalizedEmail]
    )

    // Timing-attack mitigation: run dummy bcrypt compare if user is not found
    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH)
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    )

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }

    // Require email verification before allowing sign-in
    if (user.isVerified !== 1) {
      return res.status(403).json({
        message:
          'Please verify your email address before signing in. Check your inbox for the verification link.',
        isUnverified: true,
        email: user.email,
      })
    }

    // Reset rate limiter on successful authentication
    loginRateLimiter.resetKey(req)

    const token = generateToken(user)

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      walletAddress: user.walletAddress,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    }

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: safeUser,
    })
  } catch (error) {
    console.error('Login error:', error.message)

    return res.status(500).json({
      message: 'Login failed due to a server error. Please try again.',
    })
  }
}

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 */
export async function forgotPassword(req, res) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        message: 'Please provide a valid email address.',
      })
    }

    const { email } = req.body

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return res.status(400).json({
        message: 'Please provide a valid email address.',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const user = await dbGet(
      'SELECT id, name, email FROM users WHERE email = ?',
      [normalizedEmail]
    )

    // Generic response to prevent user enumeration
    const genericResponse = {
      message:
        'If an account exists with this email, a password reset link has been sent.',
    }

    if (!user) {
      return res.status(200).json(genericResponse)
    }

    // Generate secure random token (32 bytes = 64 hex chars)
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Store only SHA-256 hash of the token
    const tokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    // 15-minute expiration
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    // Atomically invalidate previous unused reset tokens and insert new token
    await dbTransaction(async ({ run }) => {
      await run(
        `
          UPDATE password_reset_tokens
          SET usedAt = CURRENT_TIMESTAMP
          WHERE userId = ? AND usedAt IS NULL
        `,
        [user.id]
      )

      await run(
        `
          INSERT INTO password_reset_tokens (userId, tokenHash, expiresAt)
          VALUES (?, ?, ?)
        `,
        [user.id, tokenHash, expiresAt]
      )
    })

    const frontendUrl = (
      process.env.FRONTEND_URL || 'http://localhost:5173'
    ).replace(/\/$/, '')

    const resetLink = `${frontendUrl}/reset-password?token=${encodeURIComponent(
      resetToken
    )}`

    const transporter = createEmailTransporter()
    const safeName = escapeHtml(user.name || 'User')

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"DeFiLend Security" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: 'Reset your DeFiLend password',
          text: `
Hello ${user.name || 'User'},

We received a request to reset your DeFiLend password.

Use the link below to create a new password:
${resetLink}

This password reset link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
DeFiLend Security Team
          `,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #202124; max-width: 560px; margin: 20px auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
              <h2 style="color: #6547f5;">DeFiLend Security</h2>
              <h3>Reset your password</h3>
              <p>Hello ${safeName},</p>
              <p>We received a request to reset your DeFiLend account password.</p>
              <p>Click the button below to create a new password:</p>
              <p style="margin: 28px 0;">
                <a href="${resetLink}" style="display: inline-block; padding: 13px 24px; background: #6547f5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
              </p>
              <p>This link expires in <strong>15 minutes</strong>.</p>
              <p style="word-break: break-all; font-size: 13px; color: #6b7280;">
                <a href="${resetLink}">${resetLink}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />
              <p style="font-size: 13px; color: #6b7280;">If you did not request a password reset, you can safely ignore this email.</p>
            </div>
          `,
        })
      } catch (mailErr) {
        console.error('Password reset email sending error:', mailErr.message)
      }
    }

    return res.status(200).json(genericResponse)
  } catch (error) {
    console.error('Forgot password error:', error.message)
    return res.status(500).json({
      message:
        'Unable to send the password reset email right now. Please try again later.',
    })
  }
}

/**
 * POST /api/auth/reset-password
 * Body: { token, newPassword }
 */
export async function resetPassword(req, res) {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        message: 'Invalid request body.',
      })
    }

    const { token, newPassword } = req.body

    // Validate token format before database lookup
    if (!isValidTokenFormat(token)) {
      return res.status(400).json({
        message: 'Invalid or expired password reset link.',
      })
    }

    // Enforce strong password validation (including 72 byte limit)
    const passwordValidation = validateStrongPassword(newPassword)
    if (!passwordValidation.valid) {
      return res.status(400).json({
        message: passwordValidation.message,
      })
    }

    // Hash the token received from the reset link
    const tokenHash = crypto
      .createHash('sha256')
      .update(token.trim())
      .digest('hex')

    // Hash new password before acquiring write transaction
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Run password reset inside SQLite transaction
    await dbTransaction(async ({ get, run }) => {
      // Find matching token
      const resetRecord = await get(
        `
          SELECT id, userId, expiresAt, usedAt
          FROM password_reset_tokens
          WHERE tokenHash = ?
        `,
        [tokenHash]
      )

      if (!resetRecord) {
        const err = new Error('Invalid or expired password reset link.')
        err.statusCode = 400
        throw err
      }

      // Prevent reuse of the same reset link
      if (resetRecord.usedAt) {
        const err = new Error('This password reset link has already been used.')
        err.statusCode = 400
        throw err
      }

      // Check expiration
      const expirationTime = new Date(resetRecord.expiresAt).getTime()
      if (Number.isNaN(expirationTime) || Date.now() > expirationTime) {
        const err = new Error('This password reset link has expired.')
        err.statusCode = 400
        throw err
      }

      // Atomically mark reset token as used with concurrency check
      const updateTokenResult = await run(
        `
          UPDATE password_reset_tokens
          SET usedAt = CURRENT_TIMESTAMP
          WHERE id = ? AND usedAt IS NULL
        `,
        [resetRecord.id]
      )

      if (updateTokenResult.changes === 0) {
        const err = new Error('This password reset link has already been used.')
        err.statusCode = 400
        throw err
      }

      // Update user's password AND increment tokenVersion to invalidate existing sessions
      const updateUserResult = await run(
        `
          UPDATE users
          SET passwordHash = ?, tokenVersion = tokenVersion + 1
          WHERE id = ?
        `,
        [passwordHash, resetRecord.userId]
      )

      if (updateUserResult.changes !== 1) {
        const err = new Error('Failed to update password for user account.')
        err.statusCode = 500
        throw err
      }

      // Invalidate all other unused reset tokens for this user
      await run(
        `
          UPDATE password_reset_tokens
          SET usedAt = CURRENT_TIMESTAMP
          WHERE userId = ? AND usedAt IS NULL
        `,
        [resetRecord.userId]
      )
    })

    return res.status(200).json({
      message:
        'Password reset successfully. You can now sign in with your new password.',
    })
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message })
    }

    console.error('Reset password error:', error.message)
    return res.status(500).json({
      message:
        'Unable to reset your password right now. Please try again later.',
    })
  }
}

/**
 * GET /api/auth/me
 * Protected by requireAuth middleware
 */
export async function getMe(req, res) {
  try {
    return res.status(200).json({
      user: req.user,
    })
  } catch (error) {
    console.error('Get profile error:', error.message)

    return res.status(500).json({
      message: 'Failed to retrieve user profile.',
    })
  }
}
