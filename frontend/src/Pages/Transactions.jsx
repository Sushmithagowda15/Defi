function Transactions() {
  return (
    <div className="transactions-page">

      {/* Page Header */}
      <div className="transactions-header">

        <div>
          <p className="eyebrow">ANALYTICS</p>

          <h1>Transactions</h1>

          <p className="subtitle">
            View your lending, borrowing and repayment activity.
          </p>
        </div>

        <button className="transaction-filter-btn">
          All Transactions
          <span>⌄</span>
        </button>

      </div>


      {/* Transaction Summary */}
      <section className="transaction-summary">

        <div className="transaction-summary-card">

          <span>Total Transactions</span>

          <strong>--</strong>

          <small>Your protocol activity</small>

        </div>


        <div className="transaction-summary-card">

          <span>Total Supplied</span>

          <strong>-- ETH</strong>

          <small>ETH supplied to protocol</small>

        </div>


        <div className="transaction-summary-card">

          <span>Total Borrowed</span>

          <strong>-- ETH</strong>

          <small>Outstanding borrowed assets</small>

        </div>


        <div className="transaction-summary-card">

          <span>Total Repaid</span>

          <strong>-- ETH</strong>

          <small>Amount repaid to protocol</small>

        </div>

      </section>


      {/* Transaction History */}
      <section className="transactions-panel">

        <div className="transactions-panel-header">

          <div>
            <p className="risk-card-label">
              ACTIVITY
            </p>

            <h2>Transaction History</h2>
          </div>

          <span className="transaction-live-badge">
            BLOCKCHAIN ACTIVITY
          </span>

        </div>


        {/* Table Header */}
        <div className="transaction-table">

          <div className="transaction-table-header">

            <span>TYPE</span>

            <span>ASSET</span>

            <span>AMOUNT</span>

            <span>STATUS</span>

            <span>DATE</span>

            <span>TRANSACTION</span>

          </div>


          {/* Empty State */}
          <div className="transaction-empty">

            <div className="transaction-empty-icon">
              ≡
            </div>

            <h3>No transactions yet</h3>

            <p>
              Your lending, borrowing and repayment transactions
              will appear here once you connect your wallet.
            </p>

            <button className="wallet-btn">
              Connect Wallet
            </button>

          </div>

        </div>

      </section>


      {/* Transaction Information */}
      <section className="transaction-info">

        <div className="transaction-info-icon">
          i
        </div>

        <div>

          <p className="risk-card-label">
            TRANSACTION DATA
          </p>

          <h3>Transparent on-chain activity</h3>

          <p>
            Every lending, borrowing and repayment operation
            will be recorded on the blockchain. Transaction
            hashes can be used to verify activity on the network.
          </p>

        </div>

      </section>

    </div>
  )
}

export default Transactions