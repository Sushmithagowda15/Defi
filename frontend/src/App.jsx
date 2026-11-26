
import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'

import AIChatbot from './Components/AIChatbot'
import UserProfile from './Components/UserProfile'

import { useWallet } from './context/WalletContext'
import { useRisk } from './context/RiskContext'
import { useAuth } from './context/AuthContext'

import Welcome from './Pages/Welcome'
import Terms from './Pages/Terms'
import Auth from './Pages/Auth'
import ForgotPassword from './Pages/ForgotPassword'
import ResetPassword from './Pages/ResetPassword'
import VerifyEmail from './Pages/VerifyEmail'

import Dashboard from './pages/Dashboard'
import Lend from './pages/Lend'
import Borrow from './pages/Borrow'
import Repay from './pages/Repay'
import RiskAnalysis from './pages/RiskAnalysis'
import Transactions from './pages/Transactions'
import Markets from './pages/Markets'
import Portfolio from './pages/Portfolio'


function DashboardLayout() {
  const navigate = useNavigate()

  const {
    walletAddress,
    walletError,
    connectWallet,
    disconnectWallet,
  } = useWallet()

  const { setRiskData } = useRisk()

  const handleConnectWallet = async () => {
    try {
      await connectWallet()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDisconnectWallet = () => {
    disconnectWallet()
    setRiskData(null)
  }

  return (
    <div className="app">

      {/* TOP NAVIGATION */}

      <header className="topbar">

        <div className="brand">
          <div className="brand-icon">◆</div>

          <div className="brand-text">
            <h2>DeFiLend</h2>
            <span>ETH Lending Protocol</span>
          </div>
        </div>

        <div className="topbar-right">

          <div className="network">
            <span className="network-dot"></span>
            <span>Ethereum</span>
          </div>

          {/* USER PROFILE */}
          <UserProfile />

          {/* WALLET CONNECT */}
          <button
            className="wallet-btn"
            onClick={handleConnectWallet}
          >
            {walletAddress
              ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : 'Connect Wallet'}
          </button>

          {/* WALLET DISCONNECT */}
          {walletAddress && (
            <button
              type="button"
              className="wallet-disconnect-btn"
              onClick={handleDisconnectWallet}
              aria-label="Disconnect wallet from this application"
            >
              Disconnect
            </button>
          )}

          {/* WALLET ERROR */}
          {walletError && (
            <span className="wallet-error">
              {walletError}
            </span>
          )}

        </div>
      </header>


      {/* MAIN LAYOUT */}

      <div className="layout">

        {/* SIDEBAR */}

        <aside className="sidebar">

          {/* OVERVIEW */}

          <div className="menu-section">

            <p className="menu-title">OVERVIEW</p>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `menu-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="menu-icon">⌂</span>
              <span className="menu-label">Dashboard</span>
            </NavLink>

            <NavLink
              to="/markets"
              className={({ isActive }) =>
                `menu-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="menu-icon">◈</span>
              <span className="menu-label">Markets</span>
            </NavLink>

            <NavLink
              to="/portfolio"
              className={({ isActive }) =>
                `menu-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="menu-icon">◉</span>
              <span className="menu-label">Portfolio</span>
            </NavLink>

          </div>


          {/* LENDING */}

          <div className="menu-section">

            <p className="menu-title">LENDING</p>

            <NavLink
              to="/lend"
              className={({ isActive }) =>
                `menu-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="menu-icon">↗</span>
              <span className="menu-label">Lend</span>
            </NavLink>

            <NavLink
              to="/borrow"
              className={({ isActive }) =>
                `menu-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="menu-icon">↙</span>
              <span className="menu-label">Borrow</span>
            </NavLink>

            <NavLink
              to="/repay"
              className={({ isActive }) =>
                `menu-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="menu-icon">↻</span>
              <span className="menu-label">Repay</span>
            </NavLink>

          </div>


          {/* ANALYTICS */}

          <div className="menu-section">

            <p className="menu-title">ANALYTICS</p>

            <NavLink
              to="/risk-analysis"
              className={({ isActive }) =>
                `menu-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="menu-icon">◒</span>
              <span className="menu-label">Risk Analysis</span>
            </NavLink>

            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                `menu-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="menu-icon">≡</span>
              <span className="menu-label">Transactions</span>
            </NavLink>

          </div>


          {/* SIDEBAR STATUS */}

          <div className="sidebar-bottom">

            <div className="protocol-status">

              <span className="status-dot"></span>

              <div className="protocol-info">
                <strong>Protocol Online</strong>
                <small>All systems operational</small>
              </div>

            </div>

          </div>

        </aside>


        {/* PAGE CONTENT */}

        <main className="main-content">

          <div className="page-shell">

            <Routes>

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />

              <Route
                path="/lend"
                element={<Lend />}
              />

              <Route
                path="/borrow"
                element={<Borrow />}
              />

              <Route
                path="/repay"
                element={<Repay />}
              />

              <Route
                path="/risk-analysis"
                element={<RiskAnalysis />}
              />

              <Route
                path="/transactions"
                element={<Transactions />}
              />

              <Route
                path="/markets"
                element={<Markets />}
              />

              <Route
                path="/portfolio"
                element={<Portfolio />}
              />

              <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
              />

            </Routes>

          </div>

        </main>

      </div>

      <AIChatbot />

    </div>
  )
}


/* ROUTE PROTECTION WRAPPER */

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#070a12',
          color: '#f5f7ff',
          fontFamily: 'inherit',
        }}
      >
        <div style={{ textAlign: 'center' }}>

          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid rgba(8, 127, 202, 0.2)',
              borderTopColor: '#00c6a7',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 14px',
            }}
          />

          <p
            style={{
              color: '#8391af',
              fontSize: '14px',
              margin: 0,
            }}
          >
            Restoring DeFiLend session...
          </p>

        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return children
}


/* MAIN APP ROUTING */

function App() {
  return (
    <Routes>

      {/* WELCOME PAGE */}

      <Route
        path="/"
        element={<Welcome />}
      />


      {/* TERMS & CONDITIONS */}

      <Route
        path="/terms"
        element={<Terms />}
      />


      {/* LOGIN / REGISTER */}

      <Route
        path="/auth"
        element={<Auth />}
      />


      {/* FORGOT PASSWORD */}

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />


      {/* RESET PASSWORD */}

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />


      {/* EMAIL VERIFICATION */}

      <Route
        path="/verify-email"
        element={<VerifyEmail />}
      />


      {/* PROTECTED DASHBOARD APPLICATION */}

      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      />

    </Routes>
  )
}

export default App
