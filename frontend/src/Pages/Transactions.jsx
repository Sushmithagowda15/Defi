import { useState } from 'react'
import { connectWallet } from '../utils/wallet'

function Transactions() {
  const [walletAddress, setWalletAddress] = useState('')
  const [walletError, setWalletError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [filter, setFilter] = useState('All Transactions')

  const handleConnectWallet = async () => {
    try {
      setWalletError('')
      setStatusMessage('')

      const wallet = await connectWallet()

      setWalletAddress(wallet.address)

      setStatusMessage(
        'Wallet connected successfully.'
      )
    } catch (error) {
      console.error(
        'Wallet connection error:',
        error
      )

      setWalletError(
        error?.message ||
        'Failed to connect wallet.'
      )
    }
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  return (
    <div className="transactions-page">

      {/* ================================
          PAGE HEADER
          ================================ */}

      <div className="transactions-header">

        <div>

          <p className="eyebrow">
            ANALYTICS
          </p>

          <h1>
            Transactions
          </h1>

          <p className="subtitle">
            View your lending, borrowing and repayment activity.
          </p>

        </div>


        <div className="transaction-header-actions">

          <select
            className="transaction-filter-btn"
            value={filter}
            onChange={handleFilterChange}
          >

            <option value="All Transactions">
              All Transactions
            </option>

            <option value="Lend">
              Lend
            </option>

            <option value="Borrow">
              Borrow
            </option>

            <option value="Repay">
              Repay
            </option>

          </select>


          <div className="transaction-wallet-status">

            <span className="network-dot"></span>

            {walletAddress
              ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : 'Wallet Not Connected'}

          </div>

        </div>

      </div>


      {/* ================================
          TRANSACTION SUMMARY
          ================================ */}

      <section className="transaction-summary">

        <div className="transaction-summary-card">

          <span>
            Total Transactions
          </span>

          <strong>
            {walletAddress ? '0' : '--'}
          </strong>

          <small>
            Your protocol activity
          </small>

        </div>


        <div className="transaction-summary-card">

          <span>
            Total Supplied
          </span>

          <strong>
            {walletAddress
              ? '0.000000 ETH'
              : '-- ETH'}
          </strong>

          <small>
            ETH supplied to protocol
          </small>

        </div>


        <div className="transaction-summary-card">

          <span>
            Total Borrowed
          </span>

          <strong>
            {walletAddress
              ? '0.000000 ETH'
              : '-- ETH'}
          </strong>

          <small>
            Total borrowed through protocol
          </small>

        </div>


        <div className="transaction-summary-card">

          <span>
            Total Repaid
          </span>

          <strong>
            {walletAddress
              ? '0.000000 ETH'
              : '-- ETH'}
          </strong>

          <small>
            Amount repaid to protocol
          </small>

        </div>

      </section>


      {/* ================================
          TRANSACTION HISTORY
          ================================ */}

      <section className="transactions-panel">

        <div className="transactions-panel-header">

          <div>

            <p className="risk-card-label">
              ACTIVITY
            </p>

            <h2>
              Transaction History
            </h2>

          </div>


          <span className="transaction-live-badge">

            {walletAddress
              ? 'WALLET CONNECTED'
              : 'BLOCKCHAIN ACTIVITY'}

          </span>

        </div>


        {/* ================================
            TRANSACTION TABLE
            ================================ */}

        <div className="transaction-table">

          <div className="transaction-table-header">

            <span>
              TYPE
            </span>

            <span>
              ASSET
            </span>

            <span>
              AMOUNT
            </span>

            <span>
              STATUS
            </span>

            <span>
              DATE
            </span>

            <span>
              TRANSACTION
            </span>

          </div>


          {/* ================================
              WALLET NOT CONNECTED
              ================================ */}

          {!walletAddress && (

            <div className="transaction-empty">

              <div className="transaction-empty-icon">
                ≡
              </div>

              <h3>
                Connect your wallet
              </h3>

              <p>
                Connect your wallet to view your
                lending, borrowing and repayment activity.
              </p>


              <button
                type="button"
                className="wallet-btn"
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </button>

            </div>

          )}


          {/* ================================
              WALLET CONNECTED
              ================================ */}

          {walletAddress && (

            <div className="transaction-empty">

              <div className="transaction-empty-icon">
                ✓
              </div>

              <h3>
                No transactions found
              </h3>

              <p>
                Your wallet is connected, but there are
                no {filter.toLowerCase()} transactions
                available to display yet.
              </p>

              <span className="transaction-wallet-address">

                {walletAddress.slice(0, 10)}
                ...
                {walletAddress.slice(-8)}

              </span>

            </div>

          )}

        </div>

      </section>


      {/* ================================
          TRANSACTION INFORMATION
          ================================ */}

      <section className="transaction-info">

        <div className="transaction-info-icon">
          i
        </div>


        <div>

          <p className="risk-card-label">
            TRANSACTION DATA
          </p>

          <h3>
            Transparent on-chain activity
          </h3>

          <p>
            Every lending, borrowing and repayment
            operation will be recorded on the blockchain.
            Transaction hashes can be used to verify
            activity on the network.
          </p>

        </div>

      </section>


      {/* ================================
          ERROR MESSAGE
          ================================ */}

      {walletError && (

        <p className="wallet-error">
          {walletError}
        </p>

      )}


      {/* ================================
          SUCCESS MESSAGE
          ================================ */}

      {statusMessage && (

        <p className="transaction-note">
          {statusMessage}
        </p>

      )}

    </div>
  )
}

export default Transactions