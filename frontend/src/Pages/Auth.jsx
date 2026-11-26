import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Auth() {
  const navigate = useNavigate()
  const { isAuthenticated, loading, login, register, resendVerification } = useAuth()

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Unverified account state
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendStatus, setResendStatus] = useState('')

  // Show / hide password states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  const handleTabSwitch = (newMode) => {
    setMode(newMode)
    setErrorMessage('')
    setSuccessMessage('')
    setResendStatus('')
    setPassword('')
    setConfirmPassword('')

    // Reset password visibility when switching tabs
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  // Email format validator
  const isValidEmail = (val) => {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
      val.trim()
    )
  }

  // Password criteria verification
  const passwordCriteria = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password),
  }

  const isPasswordStrong =
    passwordCriteria.length &&
    passwordCriteria.upper &&
    passwordCriteria.lower &&
    passwordCriteria.number &&
    passwordCriteria.special

  const handleResendVerification = async () => {
    const targetEmail = unverifiedEmail || email.trim()
    if (!targetEmail || !isValidEmail(targetEmail)) {
      setErrorMessage('Please enter a valid email address to resend verification.')
      return
    }

    setResending(true)
    setResendStatus('')
    setErrorMessage('')

    try {
      const result = await resendVerification(targetEmail)
      setResendStatus(
        result.message ||
          `If an unverified account exists for ${targetEmail}, a verification link has been sent.`
      )
    } catch (err) {
      setErrorMessage(
        err.message || 'Unable to resend verification link right now.'
      )
    } finally {
      setResending(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setResendStatus('')

    // Client-side validations
    if (mode === 'register') {
      if (!name.trim() || name.trim().length < 2) {
        setErrorMessage('Please enter your full name (at least 2 characters).')
        return
      }

      if (!email.trim() || !isValidEmail(email)) {
        setErrorMessage('Please enter a valid email address.')
        return
      }

      if (new TextEncoder().encode(password).length > 72) {
        setErrorMessage('Password cannot exceed 72 bytes.')
        return
      }

      if (!isPasswordStrong) {
        setErrorMessage(
          'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.'
        )
        return
      }

      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please re-enter.')
        return
      }
    } else {
      if (!email.trim() || !isValidEmail(email)) {
        setErrorMessage('Please enter a valid email address.')
        return
      }

      if (!password) {
        setErrorMessage('Please enter your password.')
        return
      }
    }

    setIsSubmitting(true)

    try {
      if (mode === 'register') {
        const result = await register(name.trim(), email.trim(), password)
        // Registration succeeded - account requires email verification
        setSuccessMessage(
          result.message ||
            `Account created! A verification link has been sent to ${email.trim()}. Please verify your email before logging in.`
        )
        setUnverifiedEmail(email.trim())
        setPassword('')
        setConfirmPassword('')
        setMode('login')
      } else {
        await login(email.trim(), password)
        // Successful login navigates to dashboard
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      console.error('Authentication error:', err)

      if (err.data?.isUnverified || err.status === 403) {
        setUnverifiedEmail(email.trim())
        setErrorMessage(
          err.message ||
            'Your email address is not verified yet. Please check your inbox or click below to resend the verification link.'
        )
      } else {
        setErrorMessage(
          err.message || 'Authentication failed. Please check your credentials.'
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Background glow effects */}
      <div className="auth-ambient-glow" aria-hidden="true" />

      <div className="auth-container">
        {/* Header / Brand */}
        <div className="auth-header">
          <Link to="/" className="auth-brand">
            <div className="auth-brand-icon">◆</div>

            <div className="auth-brand-text">
              <span className="auth-brand-title">DeFiLend</span>
              <span className="auth-brand-subtitle">
                Protocol Security Portal
              </span>
            </div>
          </Link>

          <p className="auth-tagline">
            {mode === 'login'
              ? 'Sign in to access your lending portfolio, credit risk metrics, and assets.'
              : 'Create an account to securely supply ETH collateral and borrow USDC on-chain.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="auth-card">
          {/* Tabs */}
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('login')}
            >
              Sign In
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('register')}
            >
              Create Account
            </button>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="auth-success-banner" role="status">
              <span>{successMessage}</span>
            </div>
          )}

          {/* Resend Status Banner */}
          {resendStatus && (
            <div className="auth-success-banner" role="status">
              <span>{resendStatus}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="auth-error-banner" role="alert">
              <span className="auth-error-icon">⚠</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Unverified Account Action Box */}
          {unverifiedEmail && mode === 'login' && errorMessage && (
            <div className="auth-unverified-box">
              <span>
                Need a new verification link sent to{' '}
                <strong>{unverifiedEmail}</strong>?
              </span>
              <button
                type="button"
                className="auth-resend-inline-btn"
                onClick={handleResendVerification}
                disabled={resending}
              >
                {resending
                  ? 'Sending Link...'
                  : 'Resend Verification Email'}
              </button>
            </div>
          )}

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {mode === 'register' && (
              <div className="auth-field">
                <label htmlFor="auth-name" className="auth-label">
                  Full Name
                </label>

                <input
                  id="auth-name"
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Alice Nakamoto"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email" className="auth-label">
                Email Address
              </label>

              <input
                id="auth-email"
                type="email"
                className="auth-input"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="auth-password" className="auth-label">
                Password
              </label>

              <div className="auth-password-wrapper">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input auth-password-input"
                  placeholder={
                    mode === 'register'
                      ? 'Min 8 chars, Aa, 1, !@#'
                      : 'Enter your password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete={
                    mode === 'register'
                      ? 'new-password'
                      : 'current-password'
                  }
                  required
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  disabled={isSubmitting}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '◉' : '◌'}
                </button>
              </div>

              {/* Password Requirements Guide for Registration */}
              {mode === 'register' && (
                <div className="auth-password-requirements">
                  <span className="auth-requirement-title">
                    Password Requirements:
                  </span>
                  <div
                    className={`auth-requirement-item ${
                      passwordCriteria.length ? 'met' : ''
                    }`}
                  >
                    <span className="auth-req-dot">
                      {passwordCriteria.length ? '✓' : '○'}
                    </span>
                    <span>At least 8 characters</span>
                  </div>
                  <div
                    className={`auth-requirement-item ${
                      passwordCriteria.upper ? 'met' : ''
                    }`}
                  >
                    <span className="auth-req-dot">
                      {passwordCriteria.upper ? '✓' : '○'}
                    </span>
                    <span>At least one uppercase letter (A-Z)</span>
                  </div>
                  <div
                    className={`auth-requirement-item ${
                      passwordCriteria.lower ? 'met' : ''
                    }`}
                  >
                    <span className="auth-req-dot">
                      {passwordCriteria.lower ? '✓' : '○'}
                    </span>
                    <span>At least one lowercase letter (a-z)</span>
                  </div>
                  <div
                    className={`auth-requirement-item ${
                      passwordCriteria.number ? 'met' : ''
                    }`}
                  >
                    <span className="auth-req-dot">
                      {passwordCriteria.number ? '✓' : '○'}
                    </span>
                    <span>At least one number (0-9)</span>
                  </div>
                  <div
                    className={`auth-requirement-item ${
                      passwordCriteria.special ? 'met' : ''
                    }`}
                  >
                    <span className="auth-req-dot">
                      {passwordCriteria.special ? '✓' : '○'}
                    </span>
                    <span>At least one special symbol (!@#$%^&*)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Forgot Password */}
            {mode === 'login' && (
              <div className="auth-forgot-password">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
            )}

            {/* Confirm Password */}
            {mode === 'register' && (
              <div className="auth-field">
                <label
                  htmlFor="auth-confirm-password"
                  className="auth-label"
                >
                  Confirm Password
                </label>

                <div className="auth-password-wrapper">
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="auth-input auth-password-input"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    disabled={isSubmitting}
                    aria-label={
                      showConfirmPassword
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                    title={
                      showConfirmPassword
                        ? 'Hide password'
                        : 'Show password'
                    }
                  >
                    {showConfirmPassword ? '◉' : '◌'}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="auth-btn-loading">
                  <span className="auth-spinner" />
                  <span>
                    {mode === 'login'
                      ? 'Signing In...'
                      : 'Creating Account...'}
                  </span>
                </span>
              ) : (
                <span>
                  {mode === 'login'
                    ? 'Sign In to Dashboard →'
                    : 'Complete Registration →'}
                </span>
              )}
            </button>
          </form>

          {/* Footer inside card */}
          <div className="auth-card-footer">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => handleTabSwitch('register')}
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => handleTabSwitch('login')}
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="auth-bottom-nav">
          <Link to="/" className="auth-nav-link">
            ← Back to Welcome Page
          </Link>

          <span className="auth-nav-separator">•</span>

          <Link to="/terms" className="auth-nav-link">
            Terms & Conditions
          </Link>
        </div>
      </div>
    </div>
  )
}
