import { useState } from 'react'
import { BrowserProvider, Contract, formatEther } from 'ethers'

import { connectWallet } from '../utils/wallet'
import {
  LENDING_POOL_ADDRESS,
  LENDING_POOL_ABI,
} from '../utils/contracts'

function Borrow() {
  const [walletAddress, setWalletAddress] = useState('')
  const [collateral, setCollateral] = useState('0')
  const [borrowed, setBorrowed] = useState('0')
  const [active, setActive] = useState(false)

  const [borrowAmount, setBorrowAmount] = useState('')

  const [walletError, setWalletError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  // ==========================================
  // LOAD BORROW POSITION FROM SMART CONTRACT
  // ==========================================

  const loadBorrowPosition = async (address) => {
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

      const collateralAmount = formatEther(
        loan.collateralAmount
      )

      const borrowedAmount = formatEther(
        loan.borrowedAmount
      )

      setCollateral(collateralAmount)
      setBorrowed(borrowedAmount)
      setActive(loan.active)

    } catch (error) {
      console.error(
        'Failed to load borrow position:',
        error
      )

      setWalletError(
        'Failed to load your borrowing position.'
      )
    }
  }

  // ==========================================
  // CONNECT WALLET
  // ==========================================

  const handleConnectWallet = async () => {
    try {
      setWalletError('')
      setStatusMessage('')

      const wallet = await connectWallet()

      setWalletAddress(wallet.address)

      await loadBorrowPosition(wallet.address)

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

  // ==========================================
  // BORROWING CALCULATIONS
  // ==========================================

  /*
    Temporary frontend calculation.

    Until the backend/smart contract provides
    the actual borrowing rules, we use 70%
    of collateral as the maximum borrowing
    capacity for displaying the UI.

    This does NOT execute a real borrow.
  */

  const collateralValue = Number(collateral)

  const borrowedValue = Number(borrowed)

  const maximumBorrow =
    collateralValue * 0.7

  const availableToBorrow =
    Math.max(
      0,
      maximumBorrow - borrowedValue
    )

  // ==========================================
  // HEALTH FACTOR
  // ==========================================

  const healthFactor =
    borrowedValue > 0
      ? (collateralValue * 0.8) /
        borrowedValue
      : 999

  // ==========================================
  // INPUT HANDLER
  // ==========================================

  const handleBorrowAmountChange = (event) => {
    const value = event.target.value

    if (value === '') {
      setBorrowAmount('')
      return
    }

    if (Number(value) < 0) {
      return
    }

    setBorrowAmount(value)
  }

  // ==========================================
  // MAX BUTTON
  // ==========================================

  const handleMaxBorrow = () => {
    setBorrowAmount(
      availableToBorrow.toFixed(6)
    )
  }

  // ==========================================
  // BORROW BUTTON
  // ==========================================

  const handleBorrow = () => {
    setWalletError('')
    setStatusMessage('')

    if (!walletAddress) {
      setWalletError(
        'Please connect your wallet first.'
      )
      return
    }

    if (!borrowAmount || Number(borrowAmount) <= 0) {
      setWalletError(
        'Please enter an amount to borrow.'
      )
      return
    }

    if (Number(borrowAmount) > availableToBorrow) {
      setWalletError(
        'Borrow amount exceeds your available borrowing capacity.'
      )
      return
    }

    /*
      Your current LendingPool contract does not
      contain a borrow() function yet.

      Therefore we do not send a fake transaction.
    */

    setStatusMessage(
      'Borrow transaction will be enabled when the borrow function is added to the LendingPool smart contract.'
    )
  }

  return (
    <div className="borrow-page">

      {/* ==========================================
          PAGE HEADER
          ========================================== */}

      <div className="page-header">

        <p className="eyebrow">
          LENDING
        </p>

        <h1>
          Borrow
        </h1>

        <p className="subtitle">
          Borrow assets using your ETH as collateral.
        </p>

      </div>


      {/* ==========================================
          MAIN BORROW LAYOUT
          ========================================== */}

      <div className="borrow-layout">


        {/* ==========================================
            LEFT SIDE - BORROW PANEL
            ========================================== */}

        <div className="borrow-panel">


          {/* PANEL HEADER */}

          <div className="borrow-panel-header">

            <div>

              <p className="panel-eyebrow">
                BORROW ASSET
              </p>

              <h2>
                Borrow Against ETH
              </h2>

              <p>
                Deposit ETH as collateral and borrow
                available assets.
              </p>

            </div>

            <div className="borrow-asset-icon">
              Ξ
            </div>

          </div>


          {/* ==========================================
              COLLATERAL
              ========================================== */}

          <div className="collateral-box">

            <div className="collateral-header">

              <span>
                Your Collateral
              </span>

              <strong>
                {walletAddress
                  ? `${collateralValue.toFixed(6)} ETH`
                  : '-- ETH'}
              </strong>

            </div>


            <div className="collateral-bar">

              <div
                className="collateral-bar-fill"
                style={{
                  width:
                    walletAddress &&
                    collateralValue > 0
                      ? '70%'
                      : '0%'
                }}
              ></div>

            </div>


            <div className="collateral-footer">

              <span>
                Collateral Value
              </span>

              <strong>
                {walletAddress
                  ? `${collateralValue.toFixed(6)} ETH`
                  : '$--'}
              </strong>

            </div>

          </div>


          {/* ==========================================
              BORROW AMOUNT
              ========================================== */}

          <div className="borrow-amount-section">

            <div className="borrow-label-row">

              <label>
                Amount to Borrow
              </label>

              <span>
                Available:{' '}
                {walletAddress
                  ? `${availableToBorrow.toFixed(6)} ETH`
                  : '-- ETH'}
              </span>

            </div>


            <div className="borrow-input">

              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={borrowAmount}
                onChange={handleBorrowAmountChange}
              />

              <button
                type="button"
                className="borrow-asset-selector"
              >

                <span>
                  Ξ
                </span>

                ETH

                <span className="borrow-selector-arrow">
                  ⌄
                </span>

              </button>

            </div>

          </div>


          {/* ==========================================
              BORROW INFORMATION
              ========================================== */}

          <div className="borrow-info-grid">


            <div className="borrow-info-card">

              <span>
                Borrow APY
              </span>

              <strong>
                -- %
              </strong>

            </div>


            <div className="borrow-info-card">

              <span>
                Available to Borrow
              </span>

              <strong>
                {walletAddress
                  ? `${availableToBorrow.toFixed(6)} ETH`
                  : '-- ETH'}
              </strong>

            </div>


            <div className="borrow-info-card">

              <span>
                Liquidation Threshold
              </span>

              <strong>
                80 %
              </strong>

            </div>


          </div>


          {/* ==========================================
              HEALTH FACTOR
              ========================================== */}

          <div className="health-factor-box">

            <div className="health-factor-icon">
              ♥
            </div>

            <div className="health-factor-content">

              <div className="health-factor-heading">

                <span>
                  Health Factor
                </span>

                <strong>

                  {walletAddress
                    ? healthFactor >= 999
                      ? '∞'
                      : healthFactor.toFixed(2)
                    : '--'}

                </strong>

              </div>


              <div className="health-factor-bar">

                <div
                  className="health-factor-fill"
                  style={{
                    width:
                      walletAddress
                        ? `${
                            healthFactor >= 999
                              ? 100
                              : Math.min(
                                  100,
                                  (healthFactor / 2) * 100
                                )
                          }%`
                        : '0%'
                  }}
                ></div>

              </div>


              <p>
                Maintain a healthy collateral ratio
                to avoid liquidation.
              </p>

            </div>

          </div>


          {/* ==========================================
              ACTION BUTTON
              ========================================== */}

          {!walletAddress ? (

            <button
              type="button"
              className="borrow-submit-btn"
              onClick={handleConnectWallet}
            >
              Connect Wallet
            </button>

          ) : (

            <button
              type="button"
              className="borrow-submit-btn"
              onClick={handleBorrow}
            >
              Borrow ETH
            </button>

          )}


          <p className="borrow-note">

            {!walletAddress
              ? 'Connect your wallet to check your collateral and borrowing capacity.'
              : 'Your collateral and borrowing capacity are being read from the LendingPool contract.'}

          </p>


        </div>


        {/* ==========================================
            RIGHT SIDE
            ========================================== */}

        <div className="borrow-side">


          {/* ==========================================
              CURRENT BORROW POSITION
              ========================================== */}

          <div className="borrow-side-panel">

            <div className="side-panel-header">

              <div>

                <p className="panel-eyebrow">
                  YOUR POSITION
                </p>

                <h3>
                  Borrow Position
                </h3>

              </div>


              <span className="borrow-position-status">

                {walletAddress
                  ? active
                    ? 'ACTIVE'
                    : 'INACTIVE'
                  : 'INACTIVE'}

              </span>

            </div>


            <div className="borrow-position">


              <div className="borrow-position-row">

                <span>
                  Collateral
                </span>

                <strong>

                  {walletAddress
                    ? `${collateralValue.toFixed(6)} ETH`
                    : '-- ETH'}

                </strong>

              </div>


              <div className="borrow-position-row">

                <span>
                  Borrowed
                </span>

                <strong>

                  {walletAddress
                    ? `${borrowedValue.toFixed(6)} ETH`
                    : '-- ETH'}

                </strong>

              </div>


              <div className="borrow-position-row">

                <span>
                  Borrow APY
                </span>

                <strong>
                  -- %
                </strong>

              </div>


              <div className="borrow-position-row">

                <span>
                  Health Factor
                </span>

                <strong>

                  {walletAddress
                    ? healthFactor >= 999
                      ? '∞'
                      : healthFactor.toFixed(2)
                    : '--'}

                </strong>

              </div>


            </div>

          </div>


          {/* ==========================================
              BORROWING GUIDE
              ========================================== */}

          <div className="borrow-side-panel">

            <div className="side-panel-header">

              <div>

                <p className="panel-eyebrow">
                  BORROWING GUIDE
                </p>

                <h3>
                  How Borrowing Works
                </h3>

              </div>

            </div>


            <div className="borrowing-steps">


              <div className="borrowing-step">

                <div className="borrow-step-number">
                  01
                </div>

                <div>

                  <strong>
                    Deposit Collateral
                  </strong>

                  <p>
                    Supply ETH to secure your
                    borrowing position.
                  </p>

                </div>

              </div>


              <div className="borrowing-step">

                <div className="borrow-step-number">
                  02
                </div>

                <div>

                  <strong>
                    Borrow Assets
                  </strong>

                  <p>
                    Borrow within your available
                    collateral limit.
                  </p>

                </div>

              </div>


              <div className="borrowing-step">

                <div className="borrow-step-number">
                  03
                </div>

                <div>

                  <strong>
                    Monitor Risk
                  </strong>

                  <p>
                    Keep your health factor above
                    the liquidation threshold.
                  </p>

                </div>

              </div>


            </div>

          </div>


        </div>

      </div>


      {/* ==========================================
          RISK WARNING
          ========================================== */}

      <div className="borrow-warning">

        <div className="borrow-warning-icon">
          !
        </div>

        <div>

          <strong>
            Borrowing involves risk
          </strong>

          <p>
            If the value of your collateral falls
            below the required threshold, your
            position may become eligible for
            liquidation.
          </p>

        </div>

      </div>


      {/* ==========================================
          ERROR MESSAGE
          ========================================== */}

      {walletError && (

        <p className="wallet-error">
          {walletError}
        </p>

      )}


      {/* ==========================================
          STATUS MESSAGE
          ========================================== */}

      {statusMessage && (

        <p className="transaction-note">
          {statusMessage}
        </p>

      )}

    </div>
  )
}

export default Borrow