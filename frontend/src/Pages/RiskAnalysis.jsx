function RiskAnalysis() {
  return (
    <div className="risk-page">

      {/* Page Header */}
      <div className="risk-page-header">

        <div>
          <p className="eyebrow">ANALYTICS</p>

          <h1>Risk Analysis</h1>

          <p className="subtitle">
            Monitor your collateral health, borrowing risk and liquidation exposure.
          </p>
        </div>

        <div className="risk-engine-status">
          <span className="risk-status-dot"></span>
          Risk Engine Active
        </div>

      </div>


      {/* Risk Overview */}
      <section className="risk-overview-grid">

        {/* Overall Risk */}
        <div className="risk-main-card">

          <div className="risk-card-header">

            <div>
              <p className="risk-card-label">
                OVERALL RISK
              </p>

              <h2>Risk Score</h2>
            </div>

            <div className="risk-score-badge">
              --
            </div>

          </div>


          <div className="risk-score-area">

            <div className="risk-circle">

              <div>
                <strong>--</strong>
                <span>/ 100</span>
              </div>

            </div>


            <div className="risk-summary">

              <span className="risk-level-label">
                CURRENT RISK LEVEL
              </span>

              <h3>Awaiting Analysis</h3>

              <p>
                Connect your wallet to calculate your current
                borrowing and collateral risk.
              </p>

            </div>

          </div>

        </div>


        {/* Health Factor */}
        <div className="risk-stat-card">

          <div className="risk-stat-top">

            <div>
              <p className="risk-card-label">
                HEALTH FACTOR
              </p>

              <h3>--</h3>
            </div>

            <div className="risk-stat-icon">
              ♥
            </div>

          </div>

          <div className="risk-progress">

            <div className="risk-progress-fill"></div>

          </div>

          <p className="risk-stat-description">
            Your health factor indicates how safely your
            collateral supports your outstanding debt.
          </p>

        </div>


        {/* Liquidation Risk */}
        <div className="risk-stat-card">

          <div className="risk-stat-top">

            <div>
              <p className="risk-card-label">
                LIQUIDATION RISK
              </p>

              <h3>--</h3>
            </div>

            <div className="risk-stat-icon">
              !
            </div>

          </div>

          <div className="risk-progress">

            <div className="risk-progress-fill"></div>

          </div>

          <p className="risk-stat-description">
            Estimated exposure based on your collateral
            value and current borrowing position.
          </p>

        </div>

      </section>


      {/* Position Analysis */}
      <section className="risk-section">

        <div className="risk-section-header">

          <div>
            <p className="risk-card-label">
              POSITION ANALYSIS
            </p>

            <h2>Your Collateral Position</h2>
          </div>

          <span className="risk-analysis-badge">
            LIVE ANALYSIS
          </span>

        </div>


        <div className="position-analysis-grid">

          <div className="analysis-stat">

            <span>Collateral</span>

            <strong>-- ETH</strong>

            <small>
              Current deposited collateral
            </small>

          </div>


          <div className="analysis-stat">

            <span>Borrowed</span>

            <strong>-- ETH</strong>

            <small>
              Outstanding borrowed amount
            </small>

          </div>


          <div className="analysis-stat">

            <span>Collateral Ratio</span>

            <strong>-- %</strong>

            <small>
              Collateral compared to debt
            </small>

          </div>


          <div className="analysis-stat">

            <span>Liquidation Threshold</span>

            <strong>-- %</strong>

            <small>
              Protocol liquidation threshold
            </small>

          </div>

        </div>

      </section>


      {/* Risk Factors */}
      <section className="risk-section">

        <div className="risk-section-header">

          <div>
            <p className="risk-card-label">
              RISK FACTORS
            </p>

            <h2>What Influences Your Risk?</h2>
          </div>

        </div>


        <div className="risk-factors-grid">


          <div className="risk-factor-card">

            <div className="risk-factor-icon">
              Ξ
            </div>

            <div>

              <h3>Collateral Value</h3>

              <p>
                Changes in the market value of your ETH
                collateral can affect your borrowing safety.
              </p>

            </div>

            <span className="factor-status">
              MONITOR
            </span>

          </div>


          <div className="risk-factor-card">

            <div className="risk-factor-icon">
              %
            </div>

            <div>

              <h3>Borrowing Ratio</h3>

              <p>
                Higher borrowing relative to collateral
                increases your liquidation exposure.
              </p>

            </div>

            <span className="factor-status">
              MONITOR
            </span>

          </div>


          <div className="risk-factor-card">

            <div className="risk-factor-icon">
              ↕
            </div>

            <div>

              <h3>Market Volatility</h3>

              <p>
                ETH price volatility can rapidly change
                your collateral health.
              </p>

            </div>

            <span className="factor-status">
              MONITOR
            </span>

          </div>


          <div className="risk-factor-card">

            <div className="risk-factor-icon">
              AI
            </div>

            <div>

              <h3>ML Risk Assessment</h3>

              <p>
                Our intelligent risk model will evaluate
                your position and estimate potential risk.
              </p>

            </div>

            <span className="factor-status">
              READY
            </span>

          </div>

        </div>

      </section>


      {/* Recommendation */}
      <section className="risk-recommendation">

        <div className="recommendation-icon">
          ◆
        </div>

        <div>

          <p className="risk-card-label">
            RISK RECOMMENDATION
          </p>

          <h3>Connect your wallet to begin analysis</h3>

          <p>
            Once your wallet is connected, DeFiLend will analyze
            your collateral, borrowed amount, health factor and
            market conditions to generate a personalized risk assessment.
          </p>

        </div>

        <button className="wallet-btn">
          Connect Wallet
        </button>

      </section>

    </div>
  )
}

export default RiskAnalysis