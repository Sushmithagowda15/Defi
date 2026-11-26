import express from 'express'
import {
  register,
  verifyEmail,
  resendVerification,
  login,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/authController.js'

import { requireAuth } from '../middleware/authMiddleware.js'
import {
  loginRateLimiter,
  registerRateLimiter,
  passwordResetRateLimiter,
  verificationResendRateLimiter,
} from '../middleware/rateLimiter.js'

const router = express.Router()

// Registration with rate limiting
router.post('/register', registerRateLimiter, register)

// Email verification endpoints
router.post('/verify-email', verifyEmail)
router.post('/resend-verification', verificationResendRateLimiter, resendVerification)

// Login with dedicated brute-force rate limiter
router.post('/login', loginRateLimiter, login)

// Forgot and Reset Password routes with dedicated rate limiting
router.post('/forgot-password', passwordResetRateLimiter, forgotPassword)
router.post('/reset-password', passwordResetRateLimiter, resetPassword)

// Protected user profile route
router.get('/me', requireAuth, getMe)

export default router
