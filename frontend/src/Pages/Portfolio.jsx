function Portfolio() {
  return (
    <div className="portfolio-page">

      {/* Page Header */}
      <div className="portfolio-header">

        <div>
          <p className="eyebrow">OVERVIEW</p>

          <h1>Portfolio</h1>

          <p className="subtitle">
            Track your supplied assets, borrowed positions and portfolio health.
          </p>
        </div>

        <div className="portfolio-status">
          <span className="network-dot"></span>
          Wallet Not Connected
        </div>

      </div>


      {/* Portfolio Summary */}
      <section className="portfolio-summary">

        <div className="portfolio-summary-card">

          <span>Portfolio Value</span>

          <strong>-- ETH</strong>

          <small>Total position value</small>

        </div>


        <div className="portfolio-summary-card">

          <span>Supplied</span>

          <strong>-- ETH</strong>

          <small>Assets supplied to protocol</small>

        </div>


        <div className="portfolio-summary-card">

          <span>Borrowed</span>

          <strong>-- ETH</strong>

          <small>Outstanding borrowed assets</small>

        </div>


        <div className="portfolio-summary-card">

          <span>Health Factor</span>

          <strong>--</strong>

          <small>Current portfolio health</small>

        </div>

      </section>


      {/* Main Portfolio Panel */}
      <section className="portfolio-panel">

        <div className="portfolio-panel-header">

          <div>
            <p className="risk-card-label">
              YOUR POSITIONS
            </p>

            <h2>Asset Positions</h2>
          </div>

          <span className="portfolio-live-badge">
            PORTFOLIO
          </span>

        </div>


        {/* ETH Position */}
        <div className="portfolio-asset">

          <div className="portfolio-asset-info">

            <div className="portfolio-eth-icon">
              Ξ
            </div>

            <div>

              <h3>Ethereum</h3>

              <span>ETH</span>

            </div>

          </div>


          <div className="portfolio-stat">

            <span>SUPPLIED</span>

            <strong>-- ETH</strong>

          </div>


          <div className="portfolio-stat">

            <span>BORROWED</span>

            <strong>-- ETH</strong>

          </div>


          <div className="portfolio-stat">

            <span>NET POSITION</span>

            <strong>-- ETH</strong>

          </div>


          <div className="portfolio-stat">

            <span>VALUE</span>

            <strong>--</strong>

          </div>

        </div>


        {/* Empty State */}
        <div className="portfolio-empty">

          <div className="portfolio-empty-icon">
            ◉
          </div>

          <h3>Connect your wallet to view your portfolio</h3>

          <p>
            Your supplied assets, borrowed positions and portfolio
            health will appear here after connecting your wallet.
          </p>

          <button className="wallet-btn">
            Connect Wallet
          </button>

        </div>

      </section>


      {/* Portfolio Health */}
      <section className="portfolio-health">

        <div className="portfolio-health-icon">
          +
        </div>

        <div>

          <p className="risk-card-label">
            PORTFOLIO HEALTH
          </p>

          <h3>Monitor your borrowing position</h3>

          <p>
            Your health factor and collateral ratio will help
            determine the safety of your borrowing position.
            Risk information will be updated from the protocol.
          </p>

        </div>

      </section>

    </div>
  )
}

export default Portfolio