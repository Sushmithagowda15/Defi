function Repay() {
  return (
    <div className="repay-page">

      {/* Page Header */}
      <div className="page-header">
        <p className="eyebrow">LENDING</p>

        <h1>Repay</h1>

        <p className="subtitle">
          Repay your outstanding borrowed assets and manage your debt.
        </p>
      </div>


      {/* Main Repay Layout */}
      <div className="repay-layout">


        {/* Repayment Panel */}
        <div className="repay-panel">

          <div className="repay-panel-header">

            <div>
              <p className="panel-eyebrow">
                REPAY ASSET
              </p>

              <h2>Repay Borrowed ETH</h2>

              <p>
                Repay your outstanding debt to reduce your borrowing position.
              </p>
            </div>

            <div className="repay-asset-icon">
              Ξ
            </div>

          </div>


          {/* Outstanding Debt */}
          <div className="debt-box">

            <div className="debt-header">

              <div>
                <span>Outstanding Debt</span>

                <strong>-- ETH</strong>
              </div>

              <div className="debt-status">
                ACTIVE
              </div>

            </div>


            <div className="debt-details">

              <div>
                <span>Borrowed</span>
                <strong>-- ETH</strong>
              </div>

              <div>
                <span>Accrued Interest</span>
                <strong>-- ETH</strong>
              </div>

              <div>
                <span>Total Due</span>
                <strong>-- ETH</strong>
              </div>

            </div>

          </div>


          {/* Repayment Amount */}
          <div className="repay-amount-section">

            <div className="repay-label-row">

              <label>
                Amount to Repay
              </label>

              <span>
                Outstanding: -- ETH
              </span>

            </div>


            <div className="repay-input">

              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
              />

              <button className="repay-asset-selector">

                <span>Ξ</span>

                ETH

                <span className="repay-selector-arrow">
                  ⌄
                </span>

              </button>

            </div>


            <div className="repay-shortcuts">

              <button>25%</button>
              <button>50%</button>
              <button>75%</button>
              <button>MAX</button>

            </div>

          </div>


          {/* Repayment Information */}
          <div className="repay-info-grid">

            <div className="repay-info-card">

              <span>Current Debt</span>

              <strong>
                -- ETH
              </strong>

            </div>


            <div className="repay-info-card">

              <span>Borrow APY</span>

              <strong>
                -- %
              </strong>

            </div>


            <div className="repay-info-card">

              <span>After Repayment</span>

              <strong>
                -- ETH
              </strong>

            </div>

          </div>


          {/* Health Factor */}
          <div className="repay-health-box">

            <div className="repay-health-icon">
              ♥
            </div>

            <div className="repay-health-content">

              <div className="repay-health-heading">

                <span>Health Factor</span>

                <strong>
                  --
                </strong>

              </div>

              <div className="repay-health-bar">

                <div className="repay-health-fill"></div>

              </div>

              <p>
                Repaying your debt can improve your health factor
                and reduce liquidation risk.
              </p>

            </div>

          </div>


          {/* Action */}
          <button className="repay-submit-btn">
            Connect Wallet
          </button>


          <p className="repay-note">
            Connect your wallet to view your debt and make a repayment.
          </p>

        </div>


        {/* Right Side */}
        <div className="repay-side">


          {/* Current Position */}
          <div className="repay-side-panel">

            <div className="side-panel-header">

              <div>

                <p className="panel-eyebrow">
                  YOUR POSITION
                </p>

                <h3>Debt Position</h3>

              </div>

              <span className="repay-position-status">
                INACTIVE
              </span>

            </div>


            <div className="repay-position">

              <div className="repay-position-row">

                <span>Collateral</span>

                <strong>
                  -- ETH
                </strong>

              </div>


              <div className="repay-position-row">

                <span>Outstanding Debt</span>

                <strong>
                  -- ETH
                </strong>

              </div>


              <div className="repay-position-row">

                <span>Borrow APY</span>

                <strong>
                  -- %
                </strong>

              </div>


              <div className="repay-position-row">

                <span>Health Factor</span>

                <strong>
                  --
                </strong>

              </div>

            </div>

          </div>


          {/* Repayment Guide */}
          <div className="repay-side-panel">

            <div className="side-panel-header">

              <div>

                <p className="panel-eyebrow">
                  REPAYMENT GUIDE
                </p>

                <h3>How Repayment Works</h3>

              </div>

            </div>


            <div className="repayment-steps">


              <div className="repayment-step">

                <div className="repay-step-number">
                  01
                </div>

                <div>

                  <strong>
                    Check Your Debt
                  </strong>

                  <p>
                    Review your outstanding borrowed amount and interest.
                  </p>

                </div>

              </div>


              <div className="repayment-step">

                <div className="repay-step-number">
                  02
                </div>

                <div>

                  <strong>
                    Choose Amount
                  </strong>

                  <p>
                    Repay part or all of your outstanding debt.
                  </p>

                </div>

              </div>


              <div className="repayment-step">

                <div className="repay-step-number">
                  03
                </div>

                <div>

                  <strong>
                    Reduce Your Debt
                  </strong>

                  <p>
                    Your borrowing position updates after confirmation.
                  </p>

                </div>

              </div>


            </div>

          </div>

        </div>

      </div>


      {/* Repayment Information */}
      <div className="repay-info-note">

        <div className="repay-info-icon">
          ◆
        </div>

        <div>

          <strong>
            Why repay your loan?
          </strong>

          <p>
            Repaying your borrowed assets reduces outstanding debt,
            lowers interest exposure and can improve your overall
            collateral health.
          </p>

        </div>

      </div>

    </div>
  )
}

export default Repay