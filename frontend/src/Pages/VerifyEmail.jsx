import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmail, resendVerification } from '../utils/authApi'
import './Auth.css'
import './VerifyEmail.css'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState(token ? 'loading' : 'missing_token') // 'loading' | 'success' | 'error' | 'missing_token'
  const [message, setMessage] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [resendMessage, setResendMessage] = useState('')
  const [resendError, setResendError] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    let isMounted = true

    if (!token) {
      setStatus('missing_token')
      return
    }

    async function executeVerification() {
      try {
        const result = await verifyEmail(token)
        if (isMounted) {
          setStatus('success')
          setMessage(
            result.message ||
              'Email verified successfully! You can now sign in with your credentials.'
          )
        }
      } catch (err) {
        if (isMounted) {
          setStatus('error')
          setMessage(
            err.message ||
              'Verification failed. This link may have expired or already been used.'
          )
        }
      }
    }

    executeVerification()

    return () => {
      isMounted = false
    }
  }, [token])

  const handleResend = async (e) => {
    e.preventDefault()
    setResendMessage('')
    setResendError('')

    if (!resendEmail.trim()) {
      setResendError('Please enter your email address.')
      return
    }

    setIsResending(true)

    try {
      const result = await resendVerification(resendEmail.trim())
      setResendMessage(
        result.message ||
          'If an unverified account exists with this email, a new verification link has been sent.'
      )
      setResendEmail('')
    } catch (err) {
      setResendError(err.message || 'Failed to resend verification email.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="auth-page">
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
            Account email verification and security validation.
          </p>
        </div>

        {/* Card */}
        <div className="auth-card">
          <div className="verify-email-status-card">
            {status === 'loading' && (
              <>
                <div className="verify-icon-wrapper loading">
                  <div className="verify-spinner" />
                </div>
                <h2 className="verify-title">Verifying Your Email</h2>
                <p className="verify-description">
                  Please wait while we validate your secure verification token...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="verify-icon-wrapper success">✓</div>
                <h2 className="verify-title">Email Verified!</h2>
                <p className="verify-description">
                  {message ||
                    'Your email address has been successfully verified. You now have full access to the DeFiLend lending protocol.'}
                </p>
                <Link to="/auth" className="verify-action-btn">
                  Sign In to Dashboard →
                </Link>
              </>
            )}

            {(status === 'error' || status === 'missing_token') && (
              <>
                <div className="verify-icon-wrapper error">⚠</div>
                <h2 className="verify-title">
                  {status === 'missing_token'
                    ? 'Missing Verification Token'
                    : 'Verification Failed'}
                </h2>
                <p className="verify-description">
                  {message ||
                    'The verification link is invalid, incomplete, or has expired after 24 hours.'}
                </p>

                {resendMessage && (
                  <div className="auth-success-banner" role="status">
                    {resendMessage}
                  </div>
                )}

                {resendError && (
                  <div className="auth-error-banner" role="alert">
                    <span className="auth-error-icon">⚠</span>
                    <span>{resendError}</span>
                  </div>
                )}

                <div className="verify-resend-section">
                  <span className="verify-resend-label">
                    Request a New Verification Link:
                  </span>
                  <form onSubmit={handleResend} style={{ width: '100%' }}>
                    <div className="auth-field">
                      <input
                        type="email"
                        className="auth-input"
                        placeholder="Enter your registered email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        disabled={isResending}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="auth-submit-btn"
                      disabled={isResending}
                      style={{ marginTop: '10px' }}
                    >
                      {isResending ? 'Sending Link...' : 'Resend Verification Email'}
                    </button>
                  </form>
                </div>

                <div style={{ marginTop: '12px', width: '100%', textAlign: 'center' }}>
                  <Link to="/auth" className="auth-link-btn" style={{ fontSize: '14px' }}>
                    ← Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Nav */}
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
