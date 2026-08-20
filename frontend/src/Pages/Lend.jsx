
import { useState } from 'react'
import {
  BrowserProvider,
  Contract,
  parseEther,
  formatEther,
} from 'ethers'

import { connectWallet } from '../utils/wallet'
import {
  LENDING_POOL_ADDRESS,
  LENDING_POOL_ABI,
} from '../utils/contracts'

function Lend() {
  const [walletAddress, setWalletAddress] = useState('')
  const [walletBalance, setWalletBalance] = useState('')
  const [amount, setAmount] = useState('')
  const [suppliedAmount, setSuppliedAmount] = useState('0')
  const [walletError, setWalletError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const loadSuppliedAmount = async (address) => {
    try {
      if (!window.ethereum || !address) {
        return
      }

      const provider = new BrowserProvider(window.ethereum)

      const lendingPool = new Contract(
        LENDING_POOL_ADDRESS,
        LENDING_POOL_ABI,
        provider
      )

      const loan = await lendingPool.loans(address)

      setSuppliedAmount(
        formatEther(loan.collateralAmount)
      )
    } catch (error) {
      console.error(
        'Failed to load supplied amount:',
        error
      )
    }
  }

  const handleConnectWallet = async () => {
    try {
      setWalletError('')
      setStatusMessage('')

      const wallet = await connectWallet()

      setWalletAddress(wallet.address)
      setWalletBalance(wallet.balance || '0')

      await loadSuppliedAmount(wallet.address)
    } catch (error) {
      console.error(error)

      setWalletError(
        error?.message ||
        'Failed to connect wallet.'
      )
    }
  }

  const handleMax = () => {
    if (!walletBalance) {
      return
    }

    const balance = Number(walletBalance)

    if (balance <= 0) {
      setWalletError(
        'Your wallet does not have enough ETH.'
      )
      return
    }

    const gasReserve = 0.001

    const maxAmount = Math.max(
      balance - gasReserve,
      0
    )

    if (maxAmount <= 0) {
      setWalletError(
        'Keep some ETH in your wallet for gas fees.'
      )
      return
    }

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
      setWalletError(
        'Please enter an amount greater than 0.'
      )
      return
    }

    if (enteredAmount > balance) {
      setWalletError(
        'Amount exceeds your available ETH balance.'
      )
    }
  }

  const handleSupply = async () => {
    setWalletError('')
    setStatusMessage('')

    try {
      if (!window.ethereum) {
        setWalletError(
          'MetaMask is not installed.'
        )
        return
      }

      if (!walletAddress) {
        await handleConnectWallet()
        return
      }

      if (!amount || Number(amount) <= 0) {
        setWalletError(
          'Please enter an ETH amount.'
        )
        return
      }

      if (Number(amount) > Number(walletBalance)) {
        setWalletError(
          'Amount exceeds your available ETH balance.'
        )
        return
      }

      setStatusMessage(
        'Confirm the transaction in MetaMask...'
      )

      const provider = new BrowserProvider(
        window.ethereum
      )

      const signer = await provider.getSigner()

      const lendingPool = new Contract(
        LENDING_POOL_ADDRESS,
        LENDING_POOL_ABI,
        signer
      )

      const transaction =
        await lendingPool.depositCollateral({
          value: parseEther(amount),
        })

      setStatusMessage(
        'Transaction submitted. Waiting for confirmation...'
      )

      await transaction.wait()

      setStatusMessage(
        'ETH supplied successfully!'
      )

      setAmount('')

      const updatedWallet =
        await connectWallet()

      setWalletAddress(
        updatedWallet.address
      )

      setWalletBalance(
        updatedWallet.balance || '0'
      )

      await loadSuppliedAmount(
        updatedWallet.address
      )
    } catch (error) {
      console.error(
        'Supply transaction failed:',
        error
      )

      setStatusMessage('')

      setWalletError(
        error?.reason ||
        error?.shortMessage ||
        error?.message ||
        'Supply transaction failed.'
      )
    }
  }

  return (
    <div className="lend-page">

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

      <div className="lend-layout">

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
                {Number(suppliedAmount).toFixed(6)} ETH
              </strong>
            </div>

          </div>

          <button
            type="button"
            className="lend-submit-btn"
            onClick={handleSupply}
          >
            {walletAddress
              ? 'Supply ETH'
              : 'Connect Wallet'}
          </button>

          {walletAddress && (
            <p className="transaction-note">
              Connected:{' '}
              {walletAddress.slice(0, 6)}
              ...
              {walletAddress.slice(-4)}
            </p>
          )}

          {walletError && (
            <p className="wallet-error">
              {walletError}
            </p>
          )}

          {statusMessage && (
            <p className="transaction-note">
              {statusMessage}
            </p>
          )}

          {!walletAddress &&
            !walletError &&
            !statusMessage && (
              <p className="transaction-note">
                You will need to connect your wallet before
                supplying ETH.
              </p>
            )}

        </div>

        <div className="lend-side">

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
                  {Number(suppliedAmount).toFixed(6)} ETH
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

