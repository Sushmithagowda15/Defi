import './App.css'

function App() {
  return (
    <div className="app">

      {/* Top Navigation */}
      <header className="navbar">
        <div className="logo">
          DeFi<span>Lend</span>
        </div>

        <button className="connect-btn">
          Connect Wallet
        </button>
      </header>

      <div className="main-layout">

        {/* Sidebar */}
        <aside className="sidebar">

          <button className="nav-item active">
            Dashboard
          </button>

          <button className="nav-item">
            Lend
          </button>

          <button className="nav-item">
            Borrow
          </button>

          <button className="nav-item">
            Repay
          </button>

          <button className="nav-item">
            Risk Analysis
          </button>

          <button className="nav-item">
            Transaction History
          </button>

        </aside>

        {/* Main Content */}
        <main className="content">

          <section className="welcome">
            <h1>Welcome to DeFiLend</h1>

            <p>
              Decentralized ETH lending powered by blockchain,
              Chainlink price feeds and intelligent risk analysis.
            </p>
          </section>

          {/* Action Cards */}
          <section className="action-grid">

            <div className="action-card">
              <h2>Lend ETH</h2>

              <p>
                Deposit your ETH and earn lending returns.
              </p>

              <button className="primary-btn">
                Deposit ETH
              </button>
            </div>

            <div className="action-card">
              <h2>Borrow</h2>

              <p>
                Use your ETH as collateral and borrow assets.
              </p>

              <button className="primary-btn">
                Borrow
              </button>
            </div>

          </section>

          {/* Position */}
          <section className="position">

            <h2>Your Position</h2>

            <div className="position-grid">

              <div className="stat-card">
                <p>Collateral</p>
                <h3>-- ETH</h3>
              </div>

              <div className="stat-card">
                <p>Borrowed</p>
                <h3>-- ETH</h3>
              </div>

              <div className="stat-card">
                <p>Health Factor</p>
                <h3>--</h3>
              </div>

              <div className="stat-card">
                <p>Risk Level</p>
                <h3>--</h3>
              </div>

            </div>

          </section>

        </main>

      </div>

    </div>
  )
}

export default App