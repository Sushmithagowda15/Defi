import { createContext, useContext, useState, useEffect } from 'react'
import {
  registerUser,
  loginUser,
  getCurrentUser,
  verifyEmail as apiVerifyEmail,
  resendVerification as apiResendVerification,
} from '../utils/authApi'

const AuthContext = createContext(null)

const TOKEN_KEY = 'defilend_auth_token'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  // Restore authenticated session on page load
  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      const savedToken = localStorage.getItem(TOKEN_KEY)

      if (!savedToken) {
        if (isMounted) setLoading(false)
        return
      }

      try {
        const data = await getCurrentUser(savedToken)
        if (isMounted) {
          setUser(data.user)
          setToken(savedToken)
        }
      } catch (error) {
        console.warn('Session expired or invalid, clearing local session:', error.message)
        localStorage.removeItem(TOKEN_KEY)
        if (isMounted) {
          setUser(null)
          setToken(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  // Register
  const register = async (name, email, password) => {
    const data = await registerUser({ name, email, password })

    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(data.user)
    }

    return data
  }

  // Login
  const login = async (email, password) => {
    const data = await loginUser({ email, password })

    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(data.user)
    }

    return data
  }

  // Verify Email
  const verifyEmail = async (tokenString) => {
    return await apiVerifyEmail(tokenString)
  }

  // Resend Verification
  const resendVerification = async (emailAddress) => {
    return await apiResendVerification(emailAddress)
  }

  // Logout
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    register,
    login,
    logout,
    verifyEmail,
    resendVerification,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
