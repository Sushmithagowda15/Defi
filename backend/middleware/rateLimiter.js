/**
 * In-memory sliding window rate limiter middleware
 * Provides brute-force and abuse protection without external dependencies.
 */

/**
 * Safely extracts client IP address using Express's trusted req.ip.
 * Never directly trusts raw X-Forwarded-For headers from untrusted clients,
 * relying on Express's configured 'trust proxy' setting.
 */
export function getClientIp(req) {
  if (!req) return '127.0.0.1'

  // Prefer Express's trusted req.ip (which validates proxy hops via app.set('trust proxy'))
  // Fall back to socket remoteAddress if req.ip is not available
  const rawIp = req.ip || req.socket?.remoteAddress || '127.0.0.1'

  // Normalize IPv6-mapped IPv4 addresses (e.g. "::ffff:127.0.0.1" -> "127.0.0.1")
  if (typeof rawIp === 'string' && rawIp.startsWith('::ffff:')) {
    return rawIp.slice(7)
  }

  return rawIp
}

export function createRateLimiter({
  windowMs = 15 * 60 * 1000, // 15 minutes default
  max = 5,                    // 5 attempts default
  message = 'Too many requests. Please try again later.',
  keyGenerator = getClientIp,
}) {
  const hits = new Map()

  // Periodic cleanup of expired entries (every 5 minutes)
  const timer = setInterval(() => {
    const now = Date.now()
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key)
      }
    }
  }, 5 * 60 * 1000)

  // Do not keep Node process alive just for the cleanup timer
  if (timer.unref) {
    timer.unref()
  }

  const middleware = (req, res, next) => {
    const key = keyGenerator(req)
    if (req) {
      req._rateLimitKey = key
    }
    const now = Date.now()
    const record = hits.get(key)

    if (!record || now > record.resetTime) {
      hits.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      res.setHeader('X-RateLimit-Limit', max)
      res.setHeader('X-RateLimit-Remaining', max - 1)
      return next()
    }

    if (record.count >= max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000)
      res.setHeader('Retry-After', retryAfterSeconds)
      res.setHeader('X-RateLimit-Limit', max)
      res.setHeader('X-RateLimit-Remaining', 0)
      return res.status(429).json({
        message,
        retryAfter: retryAfterSeconds,
      })
    }

    record.count += 1
    res.setHeader('X-RateLimit-Limit', max)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count))
    return next()
  }

  // Reset count for a specific client (e.g. on successful login)
  middleware.resetKey = (reqOrKey) => {
    if (!reqOrKey) return
    let key
    if (typeof reqOrKey === 'string') {
      key = reqOrKey
    } else if (reqOrKey._rateLimitKey) {
      key = reqOrKey._rateLimitKey
    } else {
      key = keyGenerator(reqOrKey)
    }
    if (key) {
      hits.delete(key)
    }
  }

  // Get current record for inspection/testing
  middleware.getRecord = (reqOrKey) => {
    if (!reqOrKey) return null
    let key
    if (typeof reqOrKey === 'string') {
      key = reqOrKey
    } else if (reqOrKey._rateLimitKey) {
      key = reqOrKey._rateLimitKey
    } else {
      key = keyGenerator(reqOrKey)
    }
    return hits.get(key) || null
  }

  // Reset all entries (useful in testing)
  middleware.resetAll = () => {
    hits.clear()
  }

  return middleware
}

// Rate limiter for login: 5 requests per 15 minutes
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please wait 15 minutes before trying again.',
})

// Rate limiter for registration: 15 requests per 15 minutes
export const registerRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many registration requests. Please wait a few minutes before trying again.',
})

// Rate limiter for password reset: 15 requests per 15 minutes
export const passwordResetRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many password reset requests. Please wait a few minutes before trying again.',
})

// Rate limiter for verification email resends: 10 requests per 15 minutes
export const verificationResendRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many verification requests. Please wait a few minutes before trying again.',
})
