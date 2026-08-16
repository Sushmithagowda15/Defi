import { useState } from 'react'
import { connectWallet } from '../utils/wallet'

function Lend() {
  const [walletAddress, setWalletAddress] = useState('')
  const [walletBalance, setWalletBalance] = useState('')
  const [amount, setAmount] = useState('')
  const [walletError, setWalletError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const handleConnectWallet = async () => {
    try {
      setWalletError('')
      setStatusMessage('')

      const wallet = await connectWallet()

      setWalletAddress(wallet.address)
      setWalletBalance(wallet.balance || '0')
    } catch (error) {
      console.error(error)
      setWalletError(error.message || 'Failed to connect wallet.')
    }
  }

  const handleMax = () => {
    if (!walletBalance || walletBalance === '--') {
      return
    }

    const balance = Number(walletBalance)

    if (balance <= 0) {
      setWalletError('Your wallet does not have enough ETH.')
      return
    }

    // Keep a small amount of ETH for gas fees.
    const gasReserve = 0.001

    const maxAmount = Math.max(balance - gasReserve, 0)

    setAmount(maxAmount.toFixed(6))
    setWalletError('')
    setStatusMessage('')
  }

  const handleAmountChange = (event) => {
    const value = event.target.value

    setAmount(value)
    setWalletError('')
    setStatusMessage('')

    if (!value) {
      return
    }

    const enteredAmount = Number(value)
    const balance = Number(walletBalance)

    if (enteredAmount <= 0) {
      setWalletError('Please enter an amount greater than 0.')
      return
    }

    if (enteredAmount > balance) {
      setWalletError('Amount exceeds your available ETH balance.')
      return
    }
  }

  const handleSupply = async () => {
    setWalletError('')
    setStatusMessage('')

    // Connect wallet if not connected
    if (!walletAddress) {
      await handleConnectWallet()
      return
    }

    // Check amount
    if (!amount || Number(amount) <= 0) {
      setWalletError('Please enter an ETH amount.')
      return
    }

    // Check balance
    if (Number(amount) > Number(walletBalance)) {
      setWalletError('Amount exceeds your available ETH balance.')
      return
    }

    // Smart contract will be connected here later
    setStatusMessage(
      'Wallet connected successfully. Supply transaction will be connected to the smart contract next.'
    )
  }

  return (
    <div className="lend-page">

      {/* PAGE HEADER */}
      <div className="page-header">

        <p className="eyebrow">
          LENDING
        </p>

        <h1>
          Lend ETH
        </h1>

        <p className="subtitle">
          Supply ETH to the protocol and earn lending returns.
        </p>

      </div>


      {/* MAIN LENDING LAYOUT */}
      <div className="lend-layout">

        {/* SUPPLY PANEL */}
        <div className="lend-panel">

          <div className="lend-panel-header">

            <div>

              <p className="panel-eyebrow">
                SUPPLY ASSET
              </p>

              <h2>
                Deposit ETH
              </h2>

              <p>
                Supply ETH to participate in the lending pool.
              </p>

            </div>

            <div className="lend-asset-icon">
              Ξ
            </div>

          </div>


          {/* WALLET BALANCE */}
          <div className="balance-row">

            <span>
              Available Balance
            </span>

            <strong>
              {walletBalance
                ? `${Number(walletBalance).toFixed(6)} ETH`
                : '-- ETH'}
            </strong>

          </div>


          {/* AMOUNT INPUT */}
          <div className="amount-section">

            <div className="amount-label-row">

              <label>
                Amount to Supply
              </label>

              <span>
                Balance:{' '}
                {walletBalance
                  ? `${Number(walletBalance).toFixed(6)} ETH`
                  : '-- ETH'}
              </span>

            </div>


            <div className="amount-input">

              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.000001"
                value={amount}
                onChange={handleAmountChange}
              />

              <button
                type="button"
                className="asset-selector"
                onClick={handleMax}
              >

                <span>
                  Ξ
                </span>

                ETH

                <span className="selector-arrow">
                  MAX
                </span>

              </button>

            </div>

          </div>


          {/* SUPPLY INFORMATION */}
          <div className="lend-info-grid">

            <div className="lend-info-card">

              <span>
                Supply APY
              </span>

              <strong>
                -- %
              </strong>

            </div>


            <div className="lend-info-card">

              <span>
                Total Supplied
              </span>

              <strong>
                -- ETH
              </strong>

            </div>


            <div className="lend-info-card">

              <span>
                Your Supplied
              </span>

              <strong>
                -- ETH
              </strong>

            </div>

          </div>


          {/* ACTION BUTTON */}
          <button
            className="lend-submit-btn"
            onClick={handleSupply}
          >

            {walletAddress
              ? 'Supply ETH'
              : 'Connect Wallet'}

          </button>


          {/* WALLET ADDRESS */}
          {walletAddress && (

            <p className="transaction-note">

              Connected:{' '}
              {walletAddress.slice(0, 6)}
              ...
              {walletAddress.slice(-4)}

            </p>

          )}


          {/* ERROR */}
          {walletError && (

            <p className="wallet-error">
              {walletError}
            </p>

          )}


          {/* STATUS */}
          {statusMessage && (

            <p className="transaction-note">
              {statusMessage}
            </p>

          )}


          {/* DEFAULT MESSAGE */}
          {!walletAddress && !walletError && !statusMessage && (

            <p className="transaction-note">
              You will need to connect your wallet before
              supplying ETH.
            </p>

          )}

        </div>


        {/* SIDE INFORMATION */}
        <div className="lend-side">

          {/* CURRENT POSITION */}
          <div className="lend-side-panel">

            <div className="side-panel-header">

              <div>

                <p className="panel-eyebrow">
                  YOUR POSITION
                </p>

                <h3>
                  Lending Position
                </h3>

              </div>

              <span className="position-status">
                {walletAddress
                  ? 'CONNECTED'
                  : 'INACTIVE'}
              </span>

            </div>


            <div className="lend-position">

              <div className="lend-position-row">

                <span>
                  Supplied
                </span>

                <strong>
                  -- ETH
                </strong>

              </div>


              <div className="lend-position-row">

                <span>
                  Current APY
                </span>

                <strong>
                  -- %
                </strong>

              </div>


              <div className="lend-position-row">

                <span>
                  Earned Interest
                </span>

                <strong>
                  -- ETH
                </strong>

              </div>

            </div>

          </div>


          {/* HOW IT WORKS */}
          <div className="lend-side-panel">

            <div className="side-panel-header">

              <div>

                <p className="panel-eyebrow">
                  HOW IT WORKS
                </p>

                <h3>
                  Lending Process
                </h3>

              </div>

            </div>


            <div className="lending-steps">

              <div className="lending-step">

                <div className="step-number">
                  01
                </div>

                <div>

                  <strong>
                    Deposit ETH
                  </strong>

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

                  <strong>
                    Earn Interest
                  </strong>

                  <p>
                    Earn returns from borrowers
                    using the pool.
                  </p>

                </div>

              </div>


              <div className="lending-step">

                <div className="step-number">
                  03
                </div>

                <div>

                  <strong>
                    Withdraw
                  </strong>

                  <p>
                    Withdraw your supplied assets
                    when available.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* PROTOCOL INFORMATION */}
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