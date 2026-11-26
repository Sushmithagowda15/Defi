const AUTH_BASE_URL = '/api/auth'

/**
 * Register a new user
 * @param {Object} credentials - { name, email, password }
 */
export async function registerUser({ name, email, password }) {
  const response = await fetch(`${AUTH_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Registration failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

/**
 * Verify user email address with cryptographic token
 * @param {string} token
 */
export async function verifyEmail(token) {
  const response = await fetch(`${AUTH_BASE_URL}/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Email verification failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

/**
 * Resend verification email
 * @param {string} email
 */
export async function resendVerification(email) {
  const response = await fetch(`${AUTH_BASE_URL}/resend-verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to resend verification email')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

/**
 * Login user
 * @param {Object} credentials - { email, password }
 */
export async function loginUser({ email, password }) {
  const response = await fetch(`${AUTH_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Login failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

/**
 * Request password reset email
 * @param {string} email
 */
export async function forgotPassword(email) {
  const response = await fetch(`${AUTH_BASE_URL}/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Password reset request failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

/**
 * Reset password using token
 * @param {Object} payload - { token, newPassword }
 */
export async function resetPassword({ token, newPassword }) {
  const response = await fetch(`${AUTH_BASE_URL}/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, newPassword }),
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Password reset failed')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

/**
 * Get current authenticated user profile
 * @param {string} token - JWT token
 */
export async function getCurrentUser(token) {
  const response = await fetch(`${AUTH_BASE_URL}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch user session')
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}
