import { verifyJwt } from '../config/jwt.js'
import { dbGet } from '../config/db.js'

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication required. No token provided.',
      })
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required. Invalid token format.',
      })
    }

    let decoded
    try {
      decoded = verifyJwt(token)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          message: 'Session expired. Please log in again.',
        })
      }
      return res.status(401).json({
        message: 'Invalid authorization token.',
      })
    }

    if (!decoded?.id) {
      return res.status(401).json({
        message: 'Invalid token payload.',
      })
    }

    // Fetch user from DB (excluding passwordHash, including tokenVersion)
    const user = await dbGet(
      `SELECT id, name, email, walletAddress, isVerified, tokenVersion, createdAt FROM users WHERE id = ?`,
      [decoded.id]
    )

    if (!user) {
      return res.status(401).json({
        message: 'User account not found. Please log in again.',
      })
    }

    // Require email verification
    if (user.isVerified !== 1) {
      return res.status(403).json({
        message:
          'Email verification required. Please verify your email before accessing protected resources.',
        isUnverified: true,
      })
    }

    // Compare JWT tokenVersion with database value for session invalidation
    if (
      typeof decoded.tokenVersion !== 'number' ||
      decoded.tokenVersion !== user.tokenVersion
    ) {
      return res.status(401).json({
        message: 'Session invalidated. Please log in again.',
        isSessionInvalidated: true,
      })
    }

    // Attach user to request
    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error.message)
    return res.status(500).json({
      message: 'Authentication failed due to an internal server error.',
    })
  }
}
