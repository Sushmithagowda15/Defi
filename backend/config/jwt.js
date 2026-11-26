import './env.js'
import jwt from 'jsonwebtoken'

const MIN_SECRET_LENGTH = 32
export const JWT_ALGORITHM = 'HS256'

/**
 * Retrieve and validate JWT_SECRET from environment.
 * Fails safely if missing or insecure. Never exposes the secret.
 */
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET

  if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
    throw new Error(
      'FATAL SECURITY ERROR: JWT_SECRET environment variable is missing or empty. Server cannot safely issue or verify tokens.'
    )
  }

  const trimmed = secret.trim()

  if (trimmed.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `FATAL SECURITY ERROR: JWT_SECRET is too short (${trimmed.length} chars). It must be at least ${MIN_SECRET_LENGTH} characters long.`
    )
  }

  const insecurePlaceholders = [
    'secret',
    'jwt_secret',
    'change_me',
    'your_secret_here',
    'default',
    '1234567890',
  ]

  if (insecurePlaceholders.includes(trimmed.toLowerCase())) {
    throw new Error(
      'FATAL SECURITY ERROR: JWT_SECRET is set to an insecure default placeholder.'
    )
  }

  return trimmed
}

/**
 * Sign JWT token explicitly restricted to HS256.
 * Enforces algorithm = HS256 even if caller provides custom signing options or custom headers.
 * @param {Object} payload - Token payload (id, tokenVersion)
 * @param {Object} [options] - Additional jwt.sign options
 */
export function signJwt(payload, options = {}) {
  const secret = getJwtSecret()
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h'

  // Explicitly prevent callers from overriding the required HS256 algorithm via options or header
  const {
    algorithm: _ignoredAlgorithm,
    header: customHeader,
    expiresIn: customExpiresIn,
    ...safeOptions
  } = options

  const safeHeader = customHeader
    ? { ...customHeader, alg: JWT_ALGORITHM }
    : undefined

  return jwt.sign(payload, secret, {
    expiresIn: customExpiresIn || expiresIn,
    ...safeOptions,
    ...(safeHeader ? { header: safeHeader } : {}),
    algorithm: JWT_ALGORITHM, // Enforce algorithm last so it cannot be overridden
  })
}

/**
 * Verify JWT token explicitly restricted to HS256
 * @param {string} token - Raw JWT token
 */
export function verifyJwt(token) {
  const secret = getJwtSecret()

  return jwt.verify(token, secret, {
    algorithms: [JWT_ALGORITHM],
  })
}
