import { useState } from 'react'
import { BrowserProvider, Contract, formatEther } from 'ethers'

import { connectWallet } from '../utils/wallet'
import {
  LENDING_POOL_ADDRESS,
  LENDING_POOL_ABI,
} from '../utils/contracts'

function Repay() {
  const [walletAddress, setWalletAddress] = useState('')

  const [collateral, setCollateral] = useState('0')
  const [borrowed, setBorrowed] = useState('0')
  const [active, setActive] = useState(false)

  const [repayAmount, setRepayAmount] = useState('')

  const [walletError, setWalletError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const loadRepayData = async (address) => {
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

      // Read user's loan from LendingPool
      const loan = await lendingPool.loans(address)

      const collateralAmount = formatEther(
        loan.collateralAmount
      )

      const borrowedAmount = formatEther(
        loan.borrowedAmount
      )

      setCollateral(collateralAmount)
      setBorrowed(borrowedAmount)
      setActive(loan.active)

      console.log('Repay data:')
      console.log('Collateral:', collateralAmount)
      console.log('Borrowed:', borrowedAmount)
      console.log('Active:', loan.active)

    } catch (error) {
      console.error(
        'Failed to load repayment data:',
        error
      )

      setWalletError(
        'Failed to load your borrowing position.'
      )
    }
  }

  // Connect wallet
  const handleConnectWallet = async () => {
    try {
      setWalletError('')
      setStatusMessage('')

      const wallet = await connectWallet()

      setWalletAddress(wallet.address)

      await loadRepayData(wallet.address)

      setStatusMessage(
        'Repayment data loaded successfully.'
      )

    } catch (error) {
      console.error(error)

      setWalletError(
        error?.message ||
        'Failed to connect wallet.'
      )
    }
  }

  // Handle repayment input
  const handleRepayAmountChange = (event) => {
    const value = event.target.value

    if (value === '') {
      setRepayAmount('')
      return
    }

    if (Number(value) < 0) {
      return
    }

    setRepayAmount(value)
  }

  // Percentage repayment shortcuts
  const handlePercentage = (percentage) => {
    if (!walletAddress) {
      setWalletError('Please connect your wallet first.')
      return
    }

    const debt = Number(borrowed)

    if (debt <= 0) {
      setWalletError('You do not have any outstanding debt.')
      return
    }

    const amount = debt * percentage

    setRepayAmount(amount.toFixed(6))
    setWalletError('')
  }

  // MAX repayment
  const handleMaxRepay = () => {
    if (!walletAddress) {
      setWalletError('Please connect your wallet first.')
      return
    }

    if (Number(borrowed) <= 0) {
      setWalletError('You do not have any outstanding debt.')
      return
    }

    setRepayAmount(Number(borrowed).toFixed(6))
    setWalletError('')
  }

  // Calculate remaining debt
  const repaymentNumber =
    Number(repayAmount) || 0

  const borrowedNumber =
    Number(borrowed) || 0

  const afterRepayment = Math.max(
    borrowedNumber - repaymentNumber,
    0
  )

  // Prevent entering more than debt
  const handleRepaySubmit = () => {
    setWalletError('')
    setStatusMessage('')

    if (!walletAddress) {
      setWalletError(
        'Please connect your wallet first.'
      )
      return
    }

    if (borrowedNumber <= 0) {
      setWalletError(
        'You do not have any outstanding debt.'
      )
      return
    }

    if (repaymentNumber <= 0) {
      setWalletError(
        'Please enter an amount to repay.'
      )
      return
    }

    if (repaymentNumber > borrowedNumber) {
      setWalletError(
        'Repayment amount cannot be greater than your outstanding debt.'
      )
      return
    }

    /*
      The actual repayment transaction will be connected
      here once the LendingPool repay function is confirmed.
    */

    setStatusMessage(
      `Repayment amount ${repaymentNumber.toFixed(6)} ETH is ready.`
    )
  }

  return (
    <div className="repay-page">

      {/* ================================
          PAGE HEADER
          ================================ */}

      <div className="page-header">

        <p className="eyebrow">
          LENDING
        </p>

        <h1>
          Repay
        </h1>

        <p className="subtitle">
          Repay your outstanding borrowed assets and manage your debt.
        </p>

      </div>


      {/* ================================
          MAIN LAYOUT
          ================================ */}

      <div className="repay-layout">


        {/* ================================
            REPAY PANEL
            ================================ */}

        <div className="repay-panel">

          <div className="repay-panel-header">

            <div>

              <p className="panel-eyebrow">
                REPAY ASSET
              </p>

              <h2>
                Repay Borrowed ETH
              </h2>

              <p>
                Repay your outstanding debt to reduce your borrowing position.
              </p>

            </div>

            <div className="repay-asset-icon">
              Ξ
            </div>

          </div>


          {/* ================================
              OUTSTANDING DEBT
              ================================ */}

          <div className="debt-box">

            <div className="debt-header">

              <div>

                <span>
                  Outstanding Debt
                </span>

                <strong>
                  {walletAddress
                    ? `${borrowedNumber.toFixed(6)} ETH`
                    : '-- ETH'}
                </strong>

              </div>

              <div className="debt-status">

                {walletAddress
                  ? active
                    ? 'ACTIVE'
                    : 'INACTIVE'
                  : 'INACTIVE'}

              </div>

            </div>


            <div className="debt-details">

              <div>

                <span>
                  Borrowed
                </span>

                <strong>
                  {walletAddress
                    ? `${borrowedNumber.toFixed(6)} ETH`
                    : '-- ETH'}
                </strong>

              </div>


              <div>

                <span>
                  Accrued Interest
                </span>

                <strong>
                  -- ETH
                </strong>

              </div>


              <div>

                <span>
                  Total Due
                </span>

                <strong>
                  {walletAddress
                    ? `${borrowedNumber.toFixed(6)} ETH`
                    : '-- ETH'}
                </strong>

              </div>

            </div>

          </div>


          {/* ================================
              REPAYMENT AMOUNT
              ================================ */}

          <div className="repay-amount-section">

            <div className="repay-label-row">

              <label>
                Amount to Repay
              </label>

              <span>
                Outstanding:{' '}
                {walletAddress
                  ? `${borrowedNumber.toFixed(6)} ETH`
                  : '-- ETH'}
              </span>

            </div>


            <div className="repay-input">

              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.000001"
                value={repayAmount}
                onChange={handleRepayAmountChange}
              />

              <button
                type="button"
                className="repay-asset-selector"
              >

                <span>
                  Ξ
                </span>

                ETH

                <span className="repay-selector-arrow">
                  ⌄
                </span>

              </button>

            </div>


            {/* Percentage shortcuts */}

            <div className="repay-shortcuts">

              <button
                type="button"
                onClick={() => handlePercentage(0.25)}
              >
                25%
              </button>

              <button
                type="button"
                onClick={() => handlePercentage(0.50)}
              >
                50%
              </button>

              <button
                type="button"
                onClick={() => handlePercentage(0.75)}
              >
                75%
              </button>

              <button
                type="button"
                onClick={handleMaxRepay}
              >
                MAX
              </button>

            </div>

          </div>


          {/* ================================
              REPAYMENT INFORMATION
              ================================ */}

          <div className="repay-info-grid">

            <div className="repay-info-card">

              <span>
                Current Debt
              </span>

              <strong>
                {walletAddress
                  ? `${borrowedNumber.toFixed(6)} ETH`
                  : '-- ETH'}
              </strong>

            </div>


            <div className="repay-info-card">

              <span>
                Borrow APY
              </span>

              <strong>
                -- %
              </strong>

            </div>


            <div className="repay-info-card">

              <span>
                After Repayment
              </span>

              <strong>
                {walletAddress
                  ? `${afterRepayment.toFixed(6)} ETH`
                  : '-- ETH'}
              </strong>

            </div>

          </div>


          {/* ================================
              HEALTH FACTOR
              ================================ */}

          <div className="repay-health-box">

            <div className="repay-health-icon">
              ♥
            </div>

            <div className="repay-health-content">

              <div className="repay-health-heading">

                <span>
                  Health Factor
                </span>

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


          {/* ================================
              ACTION BUTTON
              ================================ */}

          <button
            type="button"
            className="repay-submit-btn"
            onClick={
              walletAddress
                ? handleRepaySubmit
                : handleConnectWallet
            }
          >

            {walletAddress
              ? 'Repay ETH'
              : 'Connect Wallet'}

          </button>


          <p className="repay-note">

            {walletAddress
              ? 'Your debt and collateral data are being read from the LendingPool contract.'
              : 'Connect your wallet to view your debt and make a repayment.'}

          </p>

        </div>


        {/* ================================
            RIGHT SIDE
            ================================ */}

        <div className="repay-side">


          {/* ================================
              CURRENT POSITION
              ================================ */}

          <div className="repay-side-panel">

            <div className="side-panel-header">

              <div>

                <p className="panel-eyebrow">
                  YOUR POSITION
                </p>

                <h3>
                  Debt Position
                </h3>

              </div>

              <span className="repay-position-status">

                {walletAddress
                  ? active
                    ? 'ACTIVE'
                    : 'INACTIVE'
                  : 'INACTIVE'}

              </span>

            </div>


            <div className="repay-position">

              <div className="repay-position-row">

                <span>
                  Collateral
                </span>

                <strong>
                  {walletAddress
                    ? `${Number(collateral).toFixed(6)} ETH`
                    : '-- ETH'}
                </strong>

              </div>


              <div className="repay-position-row">

                <span>
                  Outstanding Debt
                </span>

                <strong>
                  {walletAddress
                    ? `${borrowedNumber.toFixed(6)} ETH`
                    : '-- ETH'}
                </strong>

              </div>


              <div className="repay-position-row">

                <span>
                  Borrow APY
                </span>

                <strong>
                  -- %
                </strong>

              </div>


              <div className="repay-position-row">

                <span>
                  Health Factor
                </span>

                <strong>
                  --
                </strong>

              </div>

            </div>

          </div>


          {/* ================================
              REPAYMENT GUIDE
              ================================ */}

          <div className="repay-side-panel">

            <div className="side-panel-header">

              <div>

                <p className="panel-eyebrow">
                  REPAYMENT GUIDE
                </p>

                <h3>
                  How Repayment Works
                </h3>

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


      {/* ================================
          INFORMATION
          ================================ */}

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


      {/* ================================
          ERROR / STATUS
          ================================ */}

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

    </div>
  )
}

export default Repay