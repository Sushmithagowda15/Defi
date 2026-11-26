import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useWallet } from '../context/WalletContext'
import './UserProfile.css'

function shortenAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function UserProfile() {
  const { user, logout } = useAuth()
  const { walletAddress, walletBalance } = useWallet()

  const [isOpen, setIsOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    setIsOpen(false)
    logout()
  }

  const handleProfileClick = () => {
    setIsOpen((previous) => !previous)
  }

  return (
    <div className="user-profile-wrapper" ref={profileRef}>
      {/* Profile Button */}
      <button
        type="button"
        className={`user-profile-trigger ${
          isOpen ? 'active' : ''
        }`}
        onClick={handleProfileClick}
      >
        <span className="user-profile-avatar-mini">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </span>

        <span className="user-profile-name">
          {user?.name || 'User'}
        </span>

        <span className="user-profile-chevron">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {/* Profile Dropdown */}
      {isOpen && (
        <div className="user-profile-panel">
          {/* Header */}
          <div className="profile-header-section">
            <div className="profile-avatar-large">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div className="profile-identity">
              <h3>{user?.name || 'User'}</h3>

              <p>{user?.email || 'No email available'}</p>

              <span className="profile-status-badge">
                <span className="profile-wallet-connected-dot" />
                Authenticated
              </span>
            </div>
          </div>

          {/* Account Information */}
          <div className="profile-section">
            <div className="profile-section-title">
              ACCOUNT
            </div>

            <div className="profile-item-row">
              <span className="profile-item-label">
                Name
              </span>

              <span className="profile-item-value">
                {user?.name || '-'}
              </span>
            </div>

            <div className="profile-item-row">
              <span className="profile-item-label">
                Email
              </span>

              <span className="profile-item-value">
                {user?.email || '-'}
              </span>
            </div>
          </div>

          {/* Wallet Information */}
          <div className="profile-section">
            <div className="profile-section-title">
              WALLET
            </div>

            <div className="profile-item-row">
              <span className="profile-item-label">
                Status
              </span>

              <span className="profile-item-value">
                {walletAddress ? (
                  <>
                    <span className="profile-wallet-connected-dot" />
                    Connected
                  </>
                ) : (
                  <>
                    <span className="profile-wallet-disconnected-dot" />
                    Not Connected
                  </>
                )}
              </span>
            </div>

            <div className="profile-item-row">
              <span className="profile-item-label">
                Address
              </span>

              <span className="profile-item-value mono">
                {walletAddress
                  ? shortenAddress(walletAddress)
                  : 'Not connected'}
              </span>
            </div>

            {walletAddress && (
              <div className="profile-item-row">
                <span className="profile-item-label">
                  ETH Balance
                </span>

                <span className="profile-item-value profile-balance-highlight">
                  {walletBalance
                    ? `${Number(walletBalance).toFixed(4)} ETH`
                    : 'Loading...'}
                </span>
              </div>
            )}
          </div>

          {/* DeFi Position */}
          <div className="profile-section">
            <div className="profile-section-title">
              DEFI POSITION
            </div>

            <div className="profile-position-grid">
              <div className="profile-position-card">
                <span className="profile-pos-label">
                  Supplied ETH
                </span>

                <span className="profile-pos-value">
                  —
                </span>
              </div>

              <div className="profile-position-card">
                <span className="profile-pos-label">
                  Borrowed USDC
                </span>

                <span className="profile-pos-value">
                  —
                </span>
              </div>

              <div className="profile-position-card">
                <span className="profile-pos-label">
                  Health Factor
                </span>

                <span className="profile-pos-value health">
                  —
                </span>
              </div>
            </div>
          </div>

          {/* Transaction PIN */}
          <div className="profile-section">
            <div className="profile-section-title">
              SECURITY
            </div>

            <div className="profile-item-row">
              <span className="profile-item-label">
                Transaction PIN
              </span>

              <span className="profile-pin-tag profile-badge-notset">
                Not Set
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="profile-footer-actions">
            <button
              type="button"
              className="profile-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}