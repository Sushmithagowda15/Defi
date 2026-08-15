function Dashboard() {
  return (
    <div className="dashboard-page">

      {/* Page Header */}
      <div className="page-header">
        <p className="eyebrow">OVERVIEW</p>

        <h1>Dashboard</h1>

        <p className="subtitle">
          Manage your ETH collateral, lending position and borrowing activity.
        </p>
      </div>


      {/* Portfolio Summary */}
      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <h2>Portfolio Overview</h2>
            <p>Your current DeFi lending position.</p>
          </div>
        </div>


        <div className="stats-grid">

          {/* ETH Balance */}
          <div className="dashboard-card">

            <div className="card-top">
              <span className="card-label">
                ETH Balance
              </span>

              <span className="card-icon">
                Ξ
              </span>
            </div>

            <h3>-- ETH</h3>

            <p className="card-description">
              Wallet balance
            </p>

          </div>


          {/* Supplied */}
          <div className="dashboard-card">

            <div className="card-top">
              <span className="card-label">
                Supplied
              </span>

              <span className="card-icon">
                ↗
              </span>
            </div>

            <h3>-- ETH</h3>

            <p className="card-description">
              ETH supplied to protocol
            </p>

          </div>


          {/* Borrowed */}
          <div className="dashboard-card">

            <div className="card-top">
              <span className="card-label">
                Borrowed
              </span>

              <span className="card-icon">
                ↙
              </span>
            </div>

            <h3>-- ETH</h3>

            <p className="card-description">
              Outstanding borrowing
            </p>

          </div>


          {/* Health Factor */}
          <div className="dashboard-card">

            <div className="card-top">
              <span className="card-label">
                Health Factor
              </span>

              <span className="card-icon">
                ♥
              </span>
            </div>

            <h3>--</h3>

            <p className="card-description">
              Position safety
            </p>

          </div>

        </div>

      </section>


      {/* Position + Risk */}
      <section className="dashboard-section">

        <div className="dashboard-two-column">


          {/* Position */}
          <div className="dashboard-panel">

            <div className="panel-header">

              <div>
                <p className="panel-eyebrow">
                  POSITION
                </p>

                <h2>Your Position</h2>
              </div>

              <span className="status-badge">
                No Position
              </span>

            </div>


            <div className="position-details">

              <div className="detail-row">
                <span>Collateral</span>
                <strong>-- ETH</strong>
              </div>

              <div className="detail-row">
                <span>Borrowed</span>
                <strong>-- ETH</strong>
              </div>

              <div className="detail-row">
                <span>Utilization</span>
                <strong>-- %</strong>
              </div>

              <div className="detail-row">
                <span>Health Factor</span>
                <strong>--</strong>
              </div>

            </div>

          </div>


          {/* Risk */}
          <div className="dashboard-panel">

            <div className="panel-header">

              <div>
                <p className="panel-eyebrow">
                  RISK ANALYSIS
                </p>

                <h2>Risk Status</h2>
              </div>

              <span className="powered-badge">
                ML POWERED
              </span>

            </div>


            <div className="risk-summary">

              <div className="risk-circle">
                <span>--</span>
                <small>Risk Score</small>
              </div>


              <div className="risk-info">

                <h3>Risk analysis unavailable</h3>

                <p>
                  Connect your wallet and create a lending
                  position to receive your risk assessment.
                </p>

                <button className="secondary-btn">
                  View Risk Analysis
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* Quick Actions */}
      <section className="dashboard-section">

        <div className="section-heading">

          <div>
            <h2>Quick Actions</h2>

            <p>
              Manage your lending position.
            </p>
          </div>

        </div>


        <div className="quick-actions">

          <button className="quick-action">
            <span className="quick-action-icon">
              ↗
            </span>

            <span>
              <strong>Lend ETH</strong>
              <small>Supply ETH and earn returns</small>
            </span>

            <span className="arrow">
              →
            </span>
          </button>


          <button className="quick-action">
            <span className="quick-action-icon">
              ↙
            </span>

            <span>
              <strong>Borrow</strong>
              <small>Borrow assets against collateral</small>
            </span>

            <span className="arrow">
              →
            </span>
          </button>


          <button className="quick-action">
            <span className="quick-action-icon">
              ↻
            </span>

            <span>
              <strong>Repay</strong>
              <small>Manage your outstanding debt</small>
            </span>

            <span className="arrow">
              →
            </span>
          </button>

        </div>

      </section>


      {/* Protocol Information */}
      <section className="dashboard-section">

        <div className="protocol-banner">

          <div className="protocol-banner-icon">
            ◆
          </div>

          <div>

            <h3>DeFiLend Protocol</h3>

            <p>
              Decentralized ETH lending powered by blockchain,
              Chainlink price feeds and intelligent risk analysis.
            </p>

          </div>

          <span className="online-badge">
            ● Online
          </span>

        </div>

      </section>

    </div>
  )
}

export default Dashboard