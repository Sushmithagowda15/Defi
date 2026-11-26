import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../utils/authApi'
import './Auth.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isValidEmail = (val) => {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(
      val.trim()
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!email.trim() || !isValidEmail(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setIsSubmitting(true)

    try {
      const data = await forgotPassword(email.trim())
      setMessage(
        data.message ||
          'If an account exists with this email, a password reset link has been sent.'
      )
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
            Reset your password to securely access your DeFiLend account.
          </p>
        </div>

        <div className="auth-card">
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#f5f7ff' }}>
            Forgot Password?
          </h2>

          <p style={{ fontSize: '14px', color: '#8391af', marginBottom: '20px', lineHeight: '1.5' }}>
            Enter your registered email address to receive secure password reset instructions.
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

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="forgot-email" className="auth-label">
                Email Address
              </label>

              <input
                id="forgot-email"
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

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="auth-btn-loading">
                  <span className="auth-spinner" />
                  <span>Sending Instructions...</span>
                </span>
              ) : (
                <span>Send Reset Link →</span>
              )}
            </button>
          </form>

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
