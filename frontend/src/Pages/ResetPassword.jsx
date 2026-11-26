import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { resetPassword } from '../utils/authApi'
import './Auth.css'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Password criteria check
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!token) {
      setError('Invalid or missing password reset link.')
      return
    }

    if (new TextEncoder().encode(password).length > 72) {
      setError('Password cannot exceed 72 bytes.')
      return
    }

    if (!isPasswordStrong) {
      setError(
        'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.'
      )
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)

    try {
      const data = await resetPassword({
        token,
        newPassword: password,
      })

      setMessage(data.message || 'Password reset successfully.')
      setPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        navigate('/auth')
      }, 2500)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-ambient-glow" aria-hidden="true" />

      <div className="auth-container">
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
            Create a new strong password to secure your DeFiLend account.
          </p>
        </div>

        <div className="auth-card">
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#f5f7ff' }}>
            Reset Password
          </h2>

          <p style={{ fontSize: '14px', color: '#8391af', marginBottom: '20px', lineHeight: '1.5' }}>
            Choose a strong new password that meets our protocol security requirements.
          </p>

          {message && (
            <div className="auth-success-banner" role="status">
              {message}
            </div>
          )}

          {error && (
            <div className="auth-error-banner" role="alert">
              <span className="auth-error-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {!token ? (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '16px' }}>
                This password reset link is missing a valid token.
              </p>
              <Link to="/forgot-password" className="auth-submit-btn" style={{ textDecoration: 'none' }}>
                Request New Reset Link →
              </Link>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="reset-new-password" className="auth-label">
                  New Password
                </label>

                <div className="auth-password-wrapper">
                  <input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input auth-password-input"
                    placeholder="Min 8 chars, Aa, 1, !@#"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isSubmitting}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '◉' : '◌'}
                  </button>
                </div>

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
              </div>

              <div className="auth-field">
                <label htmlFor="reset-confirm-password" className="auth-label">
                  Confirm New Password
                </label>

                <div className="auth-password-wrapper">
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="auth-input auth-password-input"
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={isSubmitting}
                    aria-label={
                      showConfirmPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    {showConfirmPassword ? '◉' : '◌'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="auth-btn-loading">
                    <span className="auth-spinner" />
                    <span>Resetting Password...</span>
                  </span>
                ) : (
                  <span>Reset Password →</span>
                )}
              </button>
            </form>
          )}

          <div className="auth-card-footer" style={{ marginTop: '20px' }}>
            <p>
              Remember your password?{' '}
              <Link to="/auth" className="auth-link-btn">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

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
