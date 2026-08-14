import './App.css'

function App() {
  return (
    <div className="app">

      {/* Top Navigation */}
      <header className="topbar">

        <div className="brand">
          <div className="brand-icon">◆</div>

          <div>
            <h2>DeFiLend</h2>
            <span>ETH Lending Protocol</span>
          </div>
        </div>

        <div className="topbar-right">

          <div className="network">
            <span className="network-dot"></span>
            Ethereum
          </div>

          <button className="wallet-btn">
            Connect Wallet
          </button>

        </div>

      </header>


      <div className="layout">

        {/* Sidebar */}
        <aside className="sidebar">

          <div className="menu-section">

            <p className="menu-title">OVERVIEW</p>

            <button className="menu-item active">
              <span>⌂</span>
              Dashboard
            </button>

            <button className="menu-item">
              <span>◈</span>
              Markets
            </button>

            <button className="menu-item">
              <span>◉</span>
              Portfolio
            </button>

          </div>


          <div className="menu-section">

            <p className="menu-title">LENDING</p>

            <button className="menu-item">
              <span>↗</span>
              Lend
            </button>

            <button className="menu-item">
              <span>↙</span>
              Borrow
            </button>

            <button className="menu-item">
              <span>↻</span>
              Repay
            </button>

          </div>


          <div className="menu-section">

            <p className="menu-title">ANALYTICS</p>

            <button className="menu-item">
              <span>◒</span>
              Risk Analysis
            </button>

            <button className="menu-item">
              <span>≡</span>
              Transactions
            </button>

          </div>


          <div className="sidebar-bottom">

            <div className="protocol-status">
              <span className="status-dot"></span>

              <div>
                <strong>Protocol Online</strong>
                <small>All systems operational</small>
              </div>
            </div>

          </div>

        </aside>


        {/* Main Content */}
        <main className="main-content">

          <div className="page-heading">

            <div>
              <p className="eyebrow">OVERVIEW</p>

              <h1>Dashboard</h1>

              <p className="subtitle">
                Manage your ETH collateral and lending position.
              </p>
            </div>

            <div className="eth-price">
              <span>ETH PRICE</span>
              <strong>$4,320.24</strong>
              <small>+2.84%</small>
            </div>

          </div>


          {/* Statistics */}
          <section className="stats-grid">

            <div className="stat-card">
              <div className="stat-header">
                <span>Total Collateral</span>
                <div className="stat-icon">◆</div>
              </div>

              <h2>-- ETH</h2>

              <p>Connect wallet to view</p>
            </div>


            <div className="stat-card">
              <div className="stat-header">
                <span>Borrowed</span>
                <div className="stat-icon">↗</div>
              </div>

              <h2>--</h2>

              <p>Current borrowed amount</p>
            </div>


            <div className="stat-card">
              <div className="stat-header">
                <span>Health Factor</span>
                <div className="stat-icon safe">✓</div>
              </div>

              <h2>--</h2>

              <p>Position health</p>
            </div>


            <div className="stat-card">
              <div className="stat-header">
                <span>Risk Level</span>
                <div className="stat-icon safe">●</div>
              </div>

              <h2>--</h2>

              <p>AI risk assessment</p>
            </div>

          </section>


          {/* Main Dashboard Grid */}
          <section className="dashboard-grid">


            {/* Position */}
            <div className="panel position-panel">

              <div className="panel-heading">

                <div>
                  <p className="eyebrow">YOUR POSITION</p>
                  <h2>Collateral Overview</h2>
                </div>

                <button className="outline-btn">
                  Manage
                </button>

              </div>


              <div className="position-value">

                <div className="eth-symbol">Ξ</div>

                <div>
                  <span>Total Collateral</span>
                  <strong>-- ETH</strong>
                </div>

              </div>


              <div className="position-details">

                <div>
                  <span>Collateral Value</span>
                  <strong>--</strong>
                </div>

                <div>
                  <span>Borrowing Power</span>
                  <strong>--</strong>
                </div>

                <div>
                  <span>Available to Borrow</span>
                  <strong>--</strong>
                </div>

              </div>

            </div>


            {/* Quick Actions */}
            <div className="panel actions-panel">

              <div className="panel-heading">

                <div>
                  <p className="eyebrow">QUICK ACTIONS</p>
                  <h2>Manage Assets</h2>
                </div>

              </div>


              <button className="action-btn primary">
                <span>↗</span>

                <div>
                  <strong>Deposit ETH</strong>
                  <small>Add ETH as collateral</small>
                </div>

                <b>→</b>
              </button>


              <button className="action-btn">
                <span>↙</span>

                <div>
                  <strong>Borrow</strong>
                  <small>Borrow against collateral</small>
                </div>

                <b>→</b>
              </button>


              <button className="action-btn">
                <span>↻</span>

                <div>
                  <strong>Repay</strong>
                  <small>Repay your borrowed assets</small>
                </div>

                <b>→</b>
              </button>

            </div>

          </section>


          {/* Risk Section */}
          <section className="panel risk-panel">

            <div className="panel-heading">

              <div>
                <p className="eyebrow">INTELLIGENT RISK ANALYSIS</p>

                <h2>Position Risk</h2>
              </div>

              <span className="powered">
                Powered by ML
              </span>

            </div>


            <div className="risk-content">

              <div className="risk-score">

                <div className="score-circle">
                  <span>--</span>
                  <small>Risk Score</small>
                </div>

              </div>


              <div className="risk-info">

                <h3>Connect your wallet</h3>

                <p>
                  Your collateral, borrowing activity and market
                  conditions will be analyzed to estimate your
                  lending risk.
                </p>

                <button className="wallet-btn">
                  Connect Wallet
                </button>

              </div>


              <div className="risk-indicators">

                <div>
                  <span>Collateral Ratio</span>
                  <strong>--</strong>
                </div>

                <div>
                  <span>Liquidation Threshold</span>
                  <strong>--</strong>
                </div>

                <div>
                  <span>Health Factor</span>
                  <strong>--</strong>
                </div>

              </div>

            </div>

          </section>

        </main>

      </div>

    </div>
  )
}

export default App