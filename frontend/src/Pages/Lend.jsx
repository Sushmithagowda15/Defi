function Lend() {
  return (
    <div className="lend-page">

      {/* Page Header */}
      <div className="page-header">
        <p className="eyebrow">LENDING</p>

        <h1>Lend ETH</h1>

        <p className="subtitle">
          Supply ETH to the protocol and earn lending returns.
        </p>
      </div>


      {/* Main Lending Layout */}
      <div className="lend-layout">


        {/* Supply Panel */}
        <div className="lend-panel">

          <div className="lend-panel-header">

            <div>
              <p className="panel-eyebrow">
                SUPPLY ASSET
              </p>

              <h2>Deposit ETH</h2>

              <p>
                Supply ETH to participate in the lending pool.
              </p>
            </div>

            <div className="lend-asset-icon">
              Ξ
            </div>

          </div>


          {/* Wallet Balance */}
          <div className="balance-row">

            <span>Available Balance</span>

            <strong>
              -- ETH
            </strong>

          </div>


          {/* Amount Input */}
          <div className="amount-section">

            <div className="amount-label-row">

              <label>
                Amount to Supply
              </label>

              <span>
                Balance: -- ETH
              </span>

            </div>


            <div className="amount-input">

              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
              />

              <button className="asset-selector">
                <span>Ξ</span>
                ETH
                <span className="selector-arrow">⌄</span>
              </button>

            </div>

          </div>


          {/* Supply Information */}
          <div className="lend-info-grid">

            <div className="lend-info-card">

              <span>Supply APY</span>

              <strong>
                -- %
              </strong>

            </div>


            <div className="lend-info-card">

              <span>Total Supplied</span>

              <strong>
                -- ETH
              </strong>

            </div>


            <div className="lend-info-card">

              <span>Your Supplied</span>

              <strong>
                -- ETH
              </strong>

            </div>

          </div>


          {/* Action */}
          <button className="lend-submit-btn">
            Connect Wallet
          </button>


          <p className="transaction-note">
            You will need to connect your wallet before supplying ETH.
          </p>

        </div>


        {/* Side Information */}
        <div className="lend-side">


          {/* Current Position */}
          <div className="lend-side-panel">

            <div className="side-panel-header">

              <div>
                <p className="panel-eyebrow">
                  YOUR POSITION
                </p>

                <h3>Lending Position</h3>
              </div>

              <span className="position-status">
                INACTIVE
              </span>

            </div>


            <div className="lend-position">

              <div className="lend-position-row">
                <span>Supplied</span>
                <strong>-- ETH</strong>
              </div>

              <div className="lend-position-row">
                <span>Current APY</span>
                <strong>-- %</strong>
              </div>

              <div className="lend-position-row">
                <span>Earned Interest</span>
                <strong>-- ETH</strong>
              </div>

            </div>

          </div>


          {/* How It Works */}
          <div className="lend-side-panel">

            <div className="side-panel-header">

              <div>
                <p className="panel-eyebrow">
                  HOW IT WORKS
                </p>

                <h3>Lending Process</h3>
              </div>

            </div>


            <div className="lending-steps">

              <div className="lending-step">

                <div className="step-number">
                  01
                </div>

                <div>
                  <strong>Deposit ETH</strong>

                  <p>
                    Supply ETH to the lending pool.
                  </p>
                </div>

              </div>


              <div className="lending-step">

                <div className="step-number">
                  02
                </div>

                <div>
                  <strong>Earn Interest</strong>

                  <p>
                    Earn returns from borrowers using the pool.
                  </p>
                </div>

              </div>


              <div className="lending-step">

                <div className="step-number">
                  03
                </div>

                <div>
                  <strong>Withdraw</strong>

                  <p>
                    Withdraw your supplied assets when available.
                  </p>
                </div>

              </div>

            </div>

          </div>


        </div>

      </div>


      {/* Protocol Information */}
      <div className="lend-protocol-note">

        <div className="lend-protocol-icon">
          ◆
        </div>

        <div>

          <strong>
            Powered by DeFiLend
          </strong>

          <p>
            Lending rates and pool information will be
            retrieved from the protocol once your wallet
            is connected.
          </p>

        </div>

      </div>

    </div>
  )
}

export default Lend