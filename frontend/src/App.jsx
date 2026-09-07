import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

import { useWallet } from './context/WalletContext'

import Welcome from './pages/Welcome'
import Terms from './pages/Terms'
import Dashboard from './pages/Dashboard'
import Lend from './pages/Lend'
import Borrow from './pages/Borrow'
import Repay from './pages/Repay'
import RiskAnalysis from './pages/RiskAnalysis'
import Transactions from './pages/Transactions'
import Markets from './pages/Markets'
import Portfolio from './pages/Portfolio'


function DashboardLayout() {
  const {
    walletAddress,
    walletError,
    connectWallet
  } = useWallet()


  const handleConnectWallet = async () => {
    try {
      await connectWallet()
    } catch (error) {
      console.error(error)
    }
  }


  return (
    <div className="app">

      {/* =================================
          TOP NAVIGATION
          ================================= */}

      <header className="topbar">

        <div className="brand">

          <div className="brand-icon">
            ◆
          </div>

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


          <button
            className="wallet-btn"
            onClick={handleConnectWallet}
          >
            {walletAddress
              ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : 'Connect Wallet'}
          </button>


          {walletError && (
            <span className="wallet-error">
              {walletError}
            </span>
          )}

        </div>

      </header>


      {/* =================================
          MAIN LAYOUT
          ================================= */}

      <div className="layout">


        {/* =================================
            SIDEBAR
            ================================= */}

        <aside className="sidebar">


          {/* OVERVIEW */}

          <div className="menu-section">

            <p className="menu-title">
              OVERVIEW
            </p>


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

            <p className="menu-title">
              LENDING
            </p>


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

            <p className="menu-title">
              ANALYTICS
            </p>


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

                <strong>
                  Protocol Online
                </strong>

                <small>
                  All systems operational
                </small>

              </div>

            </div>

          </div>

        </aside>


        {/* =================================
            PAGE CONTENT
            ================================= */}

        <main className="main-content">

          <div className="page-shell">

            <Routes>

              {/* DASHBOARD */}

              <Route
                path="/dashboard"
                element={<Dashboard />}
              />


              {/* LEND */}

              <Route
                path="/lend"
                element={<Lend />}
              />


              {/* BORROW */}

              <Route
                path="/borrow"
                element={<Borrow />}
              />


              {/* REPAY */}

              <Route
                path="/repay"
                element={<Repay />}
              />


              {/* RISK ANALYSIS */}

              <Route
                path="/risk-analysis"
                element={<RiskAnalysis />}
              />


              {/* TRANSACTIONS */}

              <Route
                path="/transactions"
                element={<Transactions />}
              />


              {/* MARKETS */}

              <Route
                path="/markets"
                element={<Markets />}
              />


              {/* PORTFOLIO */}

              <Route
                path="/portfolio"
                element={<Portfolio />}
              />


              {/* INVALID DASHBOARD ROUTE */}

              <Route
                path="*"
                element={
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                }
              />

            </Routes>

          </div>

        </main>

      </div>

    </div>
  )
}


/* =================================
   MAIN APP ROUTING
   ================================= */

function App() {

  return (

    <Routes>

      {/* =================================
          WELCOME PAGE
          ================================= */}

      <Route
        path="/"
        element={<Welcome />}
      />


      {/* =================================
          TERMS & CONDITIONS
          ================================= */}

      <Route
        path="/terms"
        element={<Terms />}
      />


      {/* =================================
          DASHBOARD APPLICATION
          ================================= */}

      <Route
        path="/*"
        element={<DashboardLayout />}
      />

    </Routes>

  )
}


export default App