function Borrow() {
  return (
    <div className="borrow-page">

      {/* Page Header */}
      <div className="page-header">
        <p className="eyebrow">LENDING</p>

        <h1>Borrow</h1>

        <p className="subtitle">
          Borrow assets using your ETH as collateral.
        </p>
      </div>


      {/* Main Borrow Layout */}
      <div className="borrow-layout">


        {/* Borrow Panel */}
        <div className="borrow-panel">

          <div className="borrow-panel-header">

            <div>
              <p className="panel-eyebrow">
                BORROW ASSET
              </p>

              <h2>Borrow Against ETH</h2>

              <p>
                Deposit ETH as collateral and borrow available assets.
              </p>
            </div>

            <div className="borrow-asset-icon">
              Ξ
            </div>

          </div>


          {/* Collateral */}
          <div className="collateral-box">

            <div className="collateral-header">

              <span>Your Collateral</span>

              <strong>
                -- ETH
              </strong>

            </div>

            <div className="collateral-bar">

              <div className="collateral-bar-fill"></div>

            </div>

            <div className="collateral-footer">

              <span>Collateral Value</span>

              <strong>
                $--
              </strong>

            </div>

          </div>


          {/* Borrow Amount */}
          <div className="borrow-amount-section">

            <div className="borrow-label-row">

              <label>
                Amount to Borrow
              </label>

              <span>
                Available: -- ETH
              </span>

            </div>


            <div className="borrow-input">

              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
              />

              <button className="borrow-asset-selector">
                <span>Ξ</span>
                ETH
                <span className="borrow-selector-arrow">⌄</span>
              </button>

            </div>

          </div>


          {/* Borrow Information */}
          <div className="borrow-info-grid">

            <div className="borrow-info-card">

              <span>Borrow APY</span>

              <strong>
                -- %
              </strong>

            </div>


            <div className="borrow-info-card">

              <span>Available to Borrow</span>

              <strong>
                -- ETH
              </strong>

            </div>


            <div className="borrow-info-card">

              <span>Liquidation Threshold</span>

              <strong>
                -- %
              </strong>

            </div>

          </div>


          {/* Health Factor */}
          <div className="health-factor-box">

            <div className="health-factor-icon">
              ♥
            </div>

            <div className="health-factor-content">

              <div className="health-factor-heading">
                <span>Health Factor</span>

                <strong>
                  --
                </strong>
              </div>

              <div className="health-factor-bar">

                <div className="health-factor-fill"></div>

              </div>

              <p>
                Maintain a healthy collateral ratio to avoid liquidation.
              </p>

            </div>

          </div>


          {/* Action */}
          <button className="borrow-submit-btn">
            Connect Wallet
          </button>


          <p className="borrow-note">
            Connect your wallet to check your collateral and borrowing capacity.
          </p>

        </div>


        {/* Right Side */}
        <div className="borrow-side">


          {/* Current Borrow Position */}
          <div className="borrow-side-panel">

            <div className="side-panel-header">

              <div>
                <p className="panel-eyebrow">
                  YOUR POSITION
                </p>

                <h3>Borrow Position</h3>
              </div>

              <span className="borrow-position-status">
                INACTIVE
              </span>

            </div>


            <div className="borrow-position">

              <div className="borrow-position-row">
                <span>Collateral</span>
                <strong>-- ETH</strong>
              </div>

              <div className="borrow-position-row">
                <span>Borrowed</span>
                <strong>-- ETH</strong>
              </div>

              <div className="borrow-position-row">
                <span>Borrow APY</span>
                <strong>-- %</strong>
              </div>

              <div className="borrow-position-row">
                <span>Health Factor</span>
                <strong>--</strong>
              </div>

            </div>

          </div>


          {/* Borrowing Guide */}
          <div className="borrow-side-panel">

            <div className="side-panel-header">

              <div>
                <p className="panel-eyebrow">
                  BORROWING GUIDE
                </p>

                <h3>How Borrowing Works</h3>
              </div>

            </div>


            <div className="borrowing-steps">

              <div className="borrowing-step">

                <div className="borrow-step-number">
                  01
                </div>

                <div>
                  <strong>Deposit Collateral</strong>

                  <p>
                    Supply ETH to secure your borrowing position.
                  </p>
                </div>

              </div>


              <div className="borrowing-step">

                <div className="borrow-step-number">
                  02
                </div>

                <div>
                  <strong>Borrow Assets</strong>

                  <p>
                    Borrow within your available collateral limit.
                  </p>
                </div>

              </div>


              <div className="borrowing-step">

                <div className="borrow-step-number">
                  03
                </div>

                <div>
                  <strong>Monitor Risk</strong>

                  <p>
                    Keep your health factor above the liquidation threshold.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* Risk Warning */}
      <div className="borrow-warning">

        <div className="borrow-warning-icon">
          !
        </div>

        <div>

          <strong>
            Borrowing involves risk
          </strong>

          <p>
            If the value of your collateral falls below the required
            threshold, your position may become eligible for liquidation.
          </p>

        </div>

      </div>

    </div>
  )
}

export default Borrow