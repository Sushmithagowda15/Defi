import { useEffect, useState } from 'react'
import {
  BrowserProvider,
  Contract,
  formatEther,
  formatUnits,
  parseUnits,
} from 'ethers'

import { connectWallet } from '../utils/wallet'

import {
  LENDING_POOL_ADDRESS,
  LENDING_POOL_ABI,
} from '../utils/contracts'


function Borrow() {
  // =========================================================
  // WALLET
  // =========================================================

  const [walletAddress, setWalletAddress] = useState('')


  // =========================================================
  // BORROW POSITION
  // =========================================================

  // ETH collateral
  const [collateral, setCollateral] = useState('0')

  // Current USDC debt
  const [borrowed, setBorrowed] = useState('0')

  // Maximum USDC that can be borrowed
  const [maxBorrow, setMaxBorrow] = useState('0')

  // Health factor
  const [healthFactor, setHealthFactor] = useState(null)

  // Borrow interest rate
  const [interestRate, setInterestRate] = useState('0')

  // Maximum LTV
  const [maxLTV, setMaxLTV] = useState('0')

  // Whether a borrowing position is active
  const [active, setActive] = useState(false)


  // =========================================================
  // INPUT
  // =========================================================

  const [borrowAmount, setBorrowAmount] = useState('')


  // =========================================================
  // UI STATE
  // =========================================================

  const [walletError, setWalletError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isBorrowing, setIsBorrowing] = useState(false)


  // =========================================================
  // LOAD BORROW POSITION
  // =========================================================

  const loadBorrowPosition = async (address) => {
    try {
      if (!window.ethereum || !address) {
        return
      }

      setWalletError('')

      const provider = new BrowserProvider(window.ethereum)

      const lendingPool = new Contract(
        LENDING_POOL_ADDRESS,
        LENDING_POOL_ABI,
        provider
      )


      // =====================================================
      // GET LOAN
      // =====================================================

      const loan = await lendingPool.loans(address)


      // =====================================================
      // ETH COLLATERAL
      // =====================================================

      const collateralAmount = formatEther(
        loan.collateralAmount
      )

      setCollateral(collateralAmount)


      // =====================================================
      // ACTIVE STATUS
      // =====================================================

      setActive(Boolean(loan.active))


      // =====================================================
      // CURRENT DEBT
      //
      // USDC = 6 decimals
      // =====================================================

      const currentDebt =
        await lendingPool.getCurrentDebt(address)

      const formattedDebt = formatUnits(
        currentDebt,
        6
      )

      setBorrowed(formattedDebt)


      // =====================================================
      // MAXIMUM BORROW AMOUNT
      //
      // USDC = 6 decimals
      // =====================================================

      const maxBorrowAmount =
        await lendingPool.getMaxBorrowAmount(address)

      const formattedMaxBorrow =
        formatUnits(
          maxBorrowAmount,
          6
        )

      setMaxBorrow(formattedMaxBorrow)


      // =====================================================
      // HEALTH FACTOR
      //
      // Contract value is expected to use 18 decimals.
      // =====================================================

      const health =
        await lendingPool.getHealthFactor(address)

      const formattedHealth =
        Number(
          formatUnits(
            health,
            18
          )
        )

      setHealthFactor(formattedHealth)


      // =====================================================
      // INTEREST RATE
      //
      // Contract uses 2 decimal places.
      // Example:
      // 500 -> 5.00%
      // =====================================================

      const rate =
        await lendingPool.INTEREST_RATE()

      const formattedRate =
        formatUnits(
          rate,
          2
        )

      setInterestRate(formattedRate)


      // =====================================================
      // MAXIMUM LTV
      //
      // Example:
      // 8000 -> 80.00%
      // =====================================================

      const ltv =
        await lendingPool.MAX_LTV()

      const formattedLTV =
        formatUnits(
          ltv,
          2
        )

      setMaxLTV(formattedLTV)


    } catch (error) {
      console.error(
        'Failed to load borrow position:',
        error
      )

      setWalletError(
        error?.reason ||
        error?.shortMessage ||
        error?.message ||
        'Failed to load your borrowing position.'
      )
    }
  }


  // =========================================================
  // CONNECT WALLET
  // =========================================================

  const handleConnectWallet = async () => {
    try {
      setWalletError('')
      setStatusMessage('')

      const wallet = await connectWallet()

      setWalletAddress(wallet.address)

      // Load data from blockchain
      await loadBorrowPosition(
        wallet.address
      )

      setStatusMessage(
        'Wallet connected successfully.'
      )

    } catch (error) {
      console.error(
        'Wallet connection error:',
        error
      )

      setWalletError(
        error?.reason ||
        error?.shortMessage ||
        error?.message ||
        'Failed to connect wallet.'
      )
    }
  }


  // =========================================================
  // LISTEN FOR WALLET ACCOUNT / NETWORK CHANGES
  // =========================================================

  useEffect(() => {
    if (!window.ethereum) {
      return
    }

    const handleAccountsChanged = async (accounts) => {
      if (!accounts || accounts.length === 0) {
        setWalletAddress('')
        setCollateral('0')
        setBorrowed('0')
        setMaxBorrow('0')
        setHealthFactor(null)
        setInterestRate('0')
        setMaxLTV('0')
        setActive(false)
        setBorrowAmount('')
        setStatusMessage('')
        setWalletError('')

        return
      }

      const newAddress = accounts[0]

      setWalletAddress(newAddress)
      setBorrowAmount('')
      setStatusMessage('')
      setWalletError('')

      await loadBorrowPosition(
        newAddress
      )
    }


    const handleChainChanged = () => {
      window.location.reload()
    }


    window.ethereum.on(
      'accountsChanged',
      handleAccountsChanged
    )

    window.ethereum.on(
      'chainChanged',
      handleChainChanged
    )


    return () => {
      window.ethereum.removeListener(
        'accountsChanged',
        handleAccountsChanged
      )

      window.ethereum.removeListener(
        'chainChanged',
        handleChainChanged
      )
    }

  }, [])


  // =========================================================
  // BORROW AMOUNT INPUT
  // =========================================================

  const handleBorrowAmountChange = (event) => {
    const value = event.target.value


    // Allow empty input
    if (value === '') {
      setBorrowAmount('')
      setWalletError('')
      return
    }


    // Only positive numbers
    if (Number(value) < 0) {
      return
    }


    // Prevent more than 6 decimal places
    if (value.includes('.')) {
      const decimalPart =
        value.split('.')[1]

      if (decimalPart.length > 6) {
        return
      }
    }


    setWalletError('')
    setStatusMessage('')

    setBorrowAmount(value)
  }


  // =========================================================
  // MAX BORROW
  // =========================================================

  const handleMaxBorrow = () => {
    if (!walletAddress) {
      setWalletError(
        'Please connect your wallet first.'
      )

      return
    }


    if (Number(maxBorrow) <= 0) {
      setWalletError(
        'You currently have no available borrowing capacity.'
      )

      return
    }


    setWalletError('')
    setStatusMessage('')

    setBorrowAmount(
      Number(maxBorrow).toFixed(6)
    )
  }


  // =========================================================
  // BORROW
  // =========================================================

  const handleBorrow = async () => {
    try {
      setWalletError('')
      setStatusMessage('')


      // =====================================================
      // WALLET CHECK
      // =====================================================

      if (!walletAddress) {
        setWalletError(
          'Please connect your wallet first.'
        )

        return
      }


      // =====================================================
      // AMOUNT CHECK
      // =====================================================

      if (
        !borrowAmount ||
        Number(borrowAmount) <= 0
      ) {
        setWalletError(
          'Please enter an amount to borrow.'
        )

        return
      }


      // =====================================================
      // MAXIMUM CAPACITY CHECK
      // =====================================================

      if (
        Number(borrowAmount) >
        Number(maxBorrow)
      ) {
        setWalletError(
          `Borrow amount exceeds your maximum borrowing capacity of ${Number(
            maxBorrow
          ).toFixed(6)} USDC.`
        )

        return
      }


      // =====================================================
      // VALIDATE DECIMAL PRECISION
      // =====================================================

      if (borrowAmount.includes('.')) {
        const decimals =
          borrowAmount.split('.')[1]

        if (decimals.length > 6) {
          setWalletError(
            'USDC supports a maximum of 6 decimal places.'
          )

          return
        }
      }


      setIsBorrowing(true)

      setStatusMessage(
        'Connecting to your wallet...'
      )


      // =====================================================
      // PROVIDER
      // =====================================================

      if (!window.ethereum) {
        throw new Error(
          'MetaMask or another compatible wallet was not found.'
        )
      }

      const provider =
        new BrowserProvider(
          window.ethereum
        )


      // =====================================================
      // CHECK CURRENT ACCOUNT
      // =====================================================

      const signer =
        await provider.getSigner()

      const signerAddress =
        await signer.getAddress()


      // =====================================================
      // MAKE SURE ACCOUNT DID NOT CHANGE
      // =====================================================

      if (
        signerAddress.toLowerCase() !==
        walletAddress.toLowerCase()
      ) {
        setWalletAddress(
          signerAddress
        )

        await loadBorrowPosition(
          signerAddress
        )

        throw new Error(
          'Wallet account changed. Please try the borrow transaction again.'
        )
      }


      // =====================================================
      // CONTRACT WITH SIGNER
      // =====================================================

      const lendingPool =
        new Contract(
          LENDING_POOL_ADDRESS,
          LENDING_POOL_ABI,
          signer
        )


      // =====================================================
      // CONVERT USDC TO SMALLEST UNIT
      //
      // 1 USDC = 1,000,000 units
      //
      // Example:
      //
      // 10 USDC
      //
      // becomes:
      //
      // 10000000
      // =====================================================

      const amountInUSDC =
        parseUnits(
          borrowAmount,
          6
        )


      // =====================================================
      // BORROW TRANSACTION
      // =====================================================

      setStatusMessage(
        'Confirm the borrowing transaction in your wallet...'
      )


      const transaction =
        await lendingPool.borrow(
          amountInUSDC
        )


      // =====================================================
      // TRANSACTION SUBMITTED
      // =====================================================

      setStatusMessage(
        'Borrow transaction submitted. Waiting for blockchain confirmation...'
      )


      // =====================================================
      // WAIT FOR CONFIRMATION
      // =====================================================

      await transaction.wait()


      // =====================================================
      // SUCCESS
      // =====================================================

      setBorrowAmount('')

      setStatusMessage(
        'Borrow successful! Your USDC has been borrowed.'
      )


      // =====================================================
      // REFRESH BLOCKCHAIN DATA
      // =====================================================

      await loadBorrowPosition(
        walletAddress
      )


    } catch (error) {
      console.error(
        'Borrow transaction failed:',
        error
      )


      let message =
        'Borrow transaction failed.'


      // User rejected transaction
      if (
        error?.code ===
        'ACTION_REJECTED'
      ) {
        message =
          'Transaction was rejected in your wallet.'
      }


      // Smart contract revert reason
      else if (error?.reason) {
        message =
          error.reason
      }


      // Ethers short message
      else if (error?.shortMessage) {
        message =
          error.shortMessage
      }


      // Normal error
      else if (error?.message) {
        message =
          error.message
      }


      setWalletError(message)

      setStatusMessage('')


    } finally {
      setIsBorrowing(false)
    }
  }


  // =========================================================
  // DISPLAY VALUES
  // =========================================================

  const collateralValue =
    Number(collateral)

  const borrowedValue =
    Number(borrowed)

  const maximumBorrowValue =
    Number(maxBorrow)

  const health =
    healthFactor === null
      ? null
      : Number(healthFactor)


  // =========================================================
  // BORROWING UTILIZATION
  //
  // Instead of the old hard-coded 70%,
  // calculate the percentage from actual
  // blockchain values.
  //
  // Example:
  //
  // borrowed = 20
  // available = 80
  //
  // utilization = 20%
  // =========================================================

  const totalBorrowCapacity =
    borrowedValue +
    maximumBorrowValue

  const borrowingUtilization =
    totalBorrowCapacity > 0
      ? Math.min(
          100,
          (borrowedValue /
            totalBorrowCapacity) *
            100
        )
      : collateralValue > 0
        ? 0
        : 0


  // =========================================================
  // HEALTH FACTOR BAR
  //
  // 2.0 or above = full bar
  // =========================================================

  const healthPercentage =
    health === null
      ? 0
      : !Number.isFinite(health)
        ? 100
        : Math.min(
            100,
            (health / 2) * 100
          )


  // =========================================================
  // HEALTH FACTOR DISPLAY
  // =========================================================

  const displayedHealthFactor =
    !walletAddress
      ? '--'
      : health === null
        ? '--'
        : !Number.isFinite(health) ||
            health >= 999
          ? '∞'
          : health.toFixed(2)


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="borrow-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="page-header">

        <p className="eyebrow">
          LENDING
        </p>

        <h1>
          Borrow
        </h1>

        <p className="subtitle">
          Borrow USDC using your ETH as collateral.
        </p>

      </div>


      {/* =====================================================
          MAIN BORROW LAYOUT
      ===================================================== */}

      <div className="borrow-layout">


        {/* ===================================================
            LEFT SIDE
        =================================================== */}

        <div className="borrow-panel">


          {/* =================================================
              PANEL HEADER
          ================================================= */}

          <div className="borrow-panel-header">

            <div>

              <p className="panel-eyebrow">
                BORROW ASSET
              </p>

              <h2>
                Borrow Against ETH
              </h2>

              <p>
                Use your ETH collateral to borrow
                USDC from the lending pool.
              </p>

            </div>


            <div className="borrow-asset-icon">
              $
            </div>

          </div>


          {/* =================================================
              COLLATERAL
          ================================================= */}

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
                      ? '100%'
                      : '0%',
                }}
              />

            </div>


            <div className="collateral-footer">

              <span>
                Collateral Value
              </span>

              <strong>
                {walletAddress
                  ? `${collateralValue.toFixed(6)} ETH`
                  : '-- ETH'}
              </strong>

            </div>

          </div>


          {/* =================================================
              BORROW AMOUNT
          ================================================= */}

          <div className="borrow-amount-section">

            <div className="borrow-label-row">

              <label>
                Amount to Borrow
              </label>

              <span>
                Available:{' '}

                {walletAddress
                  ? `${maximumBorrowValue.toFixed(6)} USDC`
                  : '-- USDC'}

              </span>

            </div>


            <div className="borrow-input">

              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={borrowAmount}
                onChange={
                  handleBorrowAmountChange
                }
                disabled={
                  !walletAddress ||
                  isBorrowing
                }
              />


              <button
                type="button"
                className="borrow-asset-selector"
                onClick={handleMaxBorrow}
                disabled={
                  !walletAddress ||
                  isBorrowing
                }
              >

                <span>
                  $
                </span>

                USDC

                <span className="borrow-selector-arrow">
                  ⌄
                </span>

              </button>

            </div>

          </div>


          {/* =================================================
              BORROW INFORMATION
          ================================================= */}

          <div className="borrow-info-grid">


            {/* INTEREST */}

            <div className="borrow-info-card">

              <span>
                Borrow Interest
              </span>

              <strong>
                {walletAddress
                  ? `${Number(
                      interestRate
                    ).toFixed(2)} %`
                  : '-- %'}
              </strong>

            </div>


            {/* AVAILABLE BORROW */}

            <div className="borrow-info-card">

              <span>
                Available to Borrow
              </span>

              <strong>
                {walletAddress
                  ? `${maximumBorrowValue.toFixed(
                      6
                    )} USDC`
                  : '-- USDC'}
              </strong>

            </div>


            {/* MAX LTV */}

            <div className="borrow-info-card">

              <span>
                Maximum LTV
              </span>

              <strong>
                {walletAddress
                  ? `${Number(
                      maxLTV
                    ).toFixed(2)} %`
                  : '-- %'}
              </strong>

            </div>

          </div>


          {/* =================================================
              HEALTH FACTOR
          ================================================= */}

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
                  {displayedHealthFactor}
                </strong>

              </div>


              <div className="health-factor-bar">

                <div
                  className="health-factor-fill"
                  style={{
                    width:
                      walletAddress
                        ? `${healthPercentage}%`
                        : '0%',
                  }}
                />

              </div>


              <p>
                Maintain a healthy collateral ratio
                to avoid liquidation.
              </p>

            </div>

          </div>


          {/* =================================================
              ACTION BUTTON
          ================================================= */}

          {!walletAddress ? (

            <button
              type="button"
              className="borrow-submit-btn"
              onClick={
                handleConnectWallet
              }
            >
              Connect Wallet
            </button>

          ) : (

            <button
              type="button"
              className="borrow-submit-btn"
              onClick={handleBorrow}
              disabled={
                isBorrowing ||
                maximumBorrowValue <= 0
              }
            >

              {isBorrowing
                ? 'Borrowing...'
                : maximumBorrowValue <= 0
                  ? 'No Borrowing Capacity'
                  : 'Borrow USDC'}

            </button>

          )}


          {/* =================================================
              NOTE
          ================================================= */}

          <p className="borrow-note">

            {!walletAddress

              ? 'Connect your wallet to check your collateral and borrowing capacity.'

              : 'Borrowing capacity, debt and health factor are read directly from the LendingPool smart contract.'}

          </p>


        </div>


        {/* ===================================================
            RIGHT SIDE
        =================================================== */}

        <div className="borrow-side">


          {/* =================================================
              CURRENT BORROW POSITION
          ================================================= */}

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


              {/* COLLATERAL */}

              <div className="borrow-position-row">

                <span>
                  Collateral
                </span>

                <strong>

                  {walletAddress
                    ? `${collateralValue.toFixed(
                        6
                      )} ETH`
                    : '-- ETH'}

                </strong>

              </div>


              {/* BORROWED */}

              <div className="borrow-position-row">

                <span>
                  Borrowed
                </span>

                <strong>

                  {walletAddress
                    ? `${borrowedValue.toFixed(
                        6
                      )} USDC`
                    : '-- USDC'}

                </strong>

              </div>


              {/* INTEREST */}

              <div className="borrow-position-row">

                <span>
                  Borrow Interest
                </span>

                <strong>

                  {walletAddress
                    ? `${Number(
                        interestRate
                      ).toFixed(2)} %`
                    : '-- %'}

                </strong>

              </div>


              {/* HEALTH */}

              <div className="borrow-position-row">

                <span>
                  Health Factor
                </span>

                <strong>
                  {displayedHealthFactor}
                </strong>

              </div>


            </div>

          </div>


          {/* =================================================
              BORROWING GUIDE
          ================================================= */}

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


              {/* STEP 1 */}

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


              {/* STEP 2 */}

              <div className="borrowing-step">

                <div className="borrow-step-number">
                  02
                </div>

                <div>

                  <strong>
                    Borrow USDC
                  </strong>

                  <p>
                    Borrow USDC within your
                    available collateral limit.
                  </p>

                </div>

              </div>


              {/* STEP 3 */}

              <div className="borrowing-step">

                <div className="borrow-step-number">
                  03
                </div>

                <div>

                  <strong>
                    Monitor Risk
                  </strong>

                  <p>
                    Keep your health factor
                    above the liquidation threshold.
                  </p>

                </div>

              </div>


            </div>

          </div>


        </div>

      </div>


      {/* =====================================================
          RISK WARNING
      ===================================================== */}

      <div className="borrow-warning">

        <div className="borrow-warning-icon">
          !
        </div>

        <div>

          <strong>
            Borrowing involves risk
          </strong>

          <p>
            If the value of your ETH collateral falls
            below the required threshold, your position
            may become eligible for liquidation.
          </p>

        </div>

      </div>


      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {walletError && (

        <p className="wallet-error">
          {walletError}
        </p>

      )}


      {/* =====================================================
          STATUS MESSAGE
      ===================================================== */}

      {statusMessage && (

        <p className="transaction-note">
          {statusMessage}
        </p>

      )}

    </div>
  )
}


export default Borrow