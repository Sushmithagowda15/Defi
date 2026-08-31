import { useState } from 'react'
import { BrowserProvider, Contract, formatEther } from 'ethers'

import { connectWallet } from '../utils/wallet'
import {
  LENDING_POOL_ADDRESS,
  LENDING_POOL_ABI,
} from '../utils/contracts'

function RiskAnalysis() {

  const [walletAddress, setWalletAddress] = useState('')
  const [collateral, setCollateral] = useState(0)
  const [borrowed, setBorrowed] = useState(0)

  const [riskScore, setRiskScore] = useState(null)
  const [riskLevel, setRiskLevel] = useState('Awaiting Analysis')
  const [healthFactor, setHealthFactor] = useState(null)
  const [ltv, setLtv] = useState(null)
  const [collateralRatio, setCollateralRatio] = useState(null)

  const [loading, setLoading] = useState(false)
  const [walletError, setWalletError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const LIQUIDATION_THRESHOLD = 80

  // -----------------------------------------
  // Calculate frontend risk metrics
  // -----------------------------------------
  const calculateRisk = (collateralAmount, borrowedAmount) => {

    if (collateralAmount <= 0) {

      setRiskScore(null)
      setRiskLevel('No Position')
      setHealthFactor(null)
      setLtv(null)
      setCollateralRatio(null)

      return
    }

    // Loan-to-value
    const calculatedLtv =
      (borrowedAmount / collateralAmount) * 100

    // Collateral ratio
    let calculatedCollateralRatio

    if (borrowedAmount === 0) {
      calculatedCollateralRatio = Infinity
    } else {
      calculatedCollateralRatio =
        (collateralAmount / borrowedAmount) * 100
    }

    // Simple frontend health factor.
    // This will later be replaced by the protocol's
    // actual risk calculation / ML model.
    let calculatedHealthFactor

    if (borrowedAmount === 0) {
      calculatedHealthFactor = Infinity
    } else {
      calculatedHealthFactor =
        (collateralAmount * (LIQUIDATION_THRESHOLD / 100)) /
        borrowedAmount
    }

    // -----------------------------------------
    // Frontend risk score
    // -----------------------------------------

    let calculatedRiskScore

    if (calculatedLtv <= 30) {
      calculatedRiskScore = 15
    } else if (calculatedLtv <= 50) {
      calculatedRiskScore = 35
    } else if (calculatedLtv <= 65) {
      calculatedRiskScore = 55
    } else if (calculatedLtv <= 75) {
      calculatedRiskScore = 75
    } else {
      calculatedRiskScore = 90
    }

    let calculatedRiskLevel

    if (calculatedRiskScore <= 30) {
      calculatedRiskLevel = 'Low Risk'
    } else if (calculatedRiskScore <= 60) {
      calculatedRiskLevel = 'Moderate Risk'
    } else if (calculatedRiskScore <= 80) {
      calculatedRiskLevel = 'High Risk'
    } else {
      calculatedRiskLevel = 'Critical Risk'
    }

    setLtv(calculatedLtv)
    setCollateralRatio(calculatedCollateralRatio)
    setHealthFactor(calculatedHealthFactor)
    setRiskScore(calculatedRiskScore)
    setRiskLevel(calculatedRiskLevel)
  }


  // -----------------------------------------
  // Load portfolio/risk data
  // -----------------------------------------
  const loadRiskData = async (address) => {

    try {

      if (!window.ethereum || !address) {
        return
      }

      const provider =
        new BrowserProvider(window.ethereum)

      const lendingPool =
        new Contract(
          LENDING_POOL_ADDRESS,
          LENDING_POOL_ABI,
          provider
        )

      const loan =
        await lendingPool.loans(address)

      const collateralAmount =
        Number(formatEther(loan.collateralAmount))

      const borrowedAmount =
        Number(formatEther(loan.borrowedAmount))

      setCollateral(collateralAmount)
      setBorrowed(borrowedAmount)

      calculateRisk(
        collateralAmount,
        borrowedAmount
      )

    } catch (error) {

      console.error(
        'Failed to load risk data:',
        error
      )

      throw new Error(
        'Failed to load your risk information from the LendingPool contract.'
      )
    }
  }


  // -----------------------------------------
  // Connect wallet
  // -----------------------------------------
  const handleConnectWallet = async () => {

    try {

      setLoading(true)
      setWalletError('')
      setStatusMessage('')

      const wallet =
        await connectWallet()

      setWalletAddress(wallet.address)

      await loadRiskData(wallet.address)

      setStatusMessage(
        'Risk analysis loaded successfully.'
      )

    } catch (error) {

      console.error(error)

      setWalletError(
        error?.message ||
        'Failed to connect wallet.'
      )

    } finally {

      setLoading(false)
    }
  }


  // -----------------------------------------
  // Format helpers
  // -----------------------------------------
  const formatNumber = (value, decimals = 2) => {

    if (value === null || value === undefined) {
      return '--'
    }

    if (!Number.isFinite(value)) {
      return '∞'
    }

    return value.toFixed(decimals)
  }


  const getRiskProgress = () => {

    if (riskScore === null) {
      return 0
    }

    return Math.min(
      Math.max(riskScore, 0),
      100
    )
  }


  const getHealthProgress = () => {

    if (healthFactor === null) {
      return 0
    }

    if (!Number.isFinite(healthFactor)) {
      return 100
    }

    return Math.min(
      (healthFactor / 2) * 100,
      100
    )
  }


  return (
    <div className="risk-page">

      {/* =====================================
          PAGE HEADER
          ===================================== */}

      <div className="risk-page-header">

        <div>

          <p className="eyebrow">
            ANALYTICS
          </p>

          <h1>
            Risk Analysis
          </h1>

          <p className="subtitle">
            Monitor your collateral health, borrowing risk
            and liquidation exposure.
          </p>

        </div>


        <div className="risk-engine-status">

          <span className="risk-status-dot"></span>

          {walletAddress
            ? 'Wallet Connected'
            : 'Risk Engine Active'}

        </div>

      </div>


      {/* =====================================
          WALLET STATUS
          ===================================== */}

      {walletAddress && (

        <div className="risk-wallet-status">

          <span>
            Connected Wallet
          </span>

          <strong>
            {walletAddress.slice(0, 6)}
            ...
            {walletAddress.slice(-4)}
          </strong>

        </div>

      )}


      {/* =====================================
          RISK OVERVIEW
          ===================================== */}

      <section className="risk-overview-grid">


        {/* Overall Risk */}

        <div className="risk-main-card">

          <div className="risk-card-header">

            <div>

              <p className="risk-card-label">
                OVERALL RISK
              </p>

              <h2>
                Risk Score
              </h2>

            </div>


            <div className="risk-score-badge">

              {riskScore !== null
                ? riskScore
                : '--'}

            </div>

          </div>


          <div className="risk-score-area">

            <div
              className="risk-circle"
              style={{
                '--risk-progress': `${getRiskProgress()}%`
              }}
            >

              <div>

                <strong>
                  {riskScore !== null
                    ? riskScore
                    : '--'}
                </strong>

                <span>
                  / 100
                </span>

              </div>

            </div>


            <div className="risk-summary">

              <span className="risk-level-label">
                CURRENT RISK LEVEL
              </span>

              <h3>
                {riskLevel}
              </h3>

              <p>

                {walletAddress
                  ? riskScore !== null
                    ? 'Risk is currently estimated from your collateral and borrowing position.'
                    : 'You currently have no active collateral position.'
                  : 'Connect your wallet to calculate your current borrowing and collateral risk.'}

              </p>

            </div>

          </div>

        </div>


        {/* Health Factor */}

        <div className="risk-stat-card">

          <div className="risk-stat-top">

            <div>

              <p className="risk-card-label">
                HEALTH FACTOR
              </p>

              <h3>
                {formatNumber(healthFactor, 2)}
              </h3>

            </div>

            <div className="risk-stat-icon">
              ♥
            </div>

          </div>


          <div className="risk-progress">

            <div
              className="risk-progress-fill"
              style={{
                width: `${getHealthProgress()}%`
              }}
            ></div>

          </div>


          <p className="risk-stat-description">

            {walletAddress
              ? 'Higher health factor generally indicates a safer borrowing position.'
              : 'Connect your wallet to calculate your health factor.'}

          </p>

        </div>


        {/* Liquidation Risk */}

        <div className="risk-stat-card">

          <div className="risk-stat-top">

            <div>

              <p className="risk-card-label">
                LIQUIDATION RISK
              </p>

              <h3>

                {riskScore === null
                  ? '--'
                  : riskScore >= 80
                    ? 'High'
                    : riskScore >= 60
                      ? 'Medium'
                      : 'Low'}

              </h3>

            </div>

            <div className="risk-stat-icon">
              !
            </div>

          </div>


          <div className="risk-progress">

            <div
              className="risk-progress-fill"
              style={{
                width: `${getRiskProgress()}%`
              }}
            ></div>

          </div>


          <p className="risk-stat-description">

            Estimated from your current collateral
            and borrowing position.

          </p>

        </div>

      </section>


      {/* =====================================
          POSITION ANALYSIS
          ===================================== */}

      <section className="risk-section">

        <div className="risk-section-header">

          <div>

            <p className="risk-card-label">
              POSITION ANALYSIS
            </p>

            <h2>
              Your Collateral Position
            </h2>

          </div>


          <span className="risk-analysis-badge">

            {walletAddress
              ? 'LIVE ANALYSIS'
              : 'CONNECT WALLET'}

          </span>

        </div>


        <div className="position-analysis-grid">


          <div className="analysis-stat">

            <span>
              Collateral
            </span>

            <strong>
              {walletAddress
                ? `${formatNumber(collateral, 6)} ETH`
                : '-- ETH'}
            </strong>

            <small>
              Current deposited collateral
            </small>

          </div>


          <div className="analysis-stat">

            <span>
              Borrowed
            </span>

            <strong>
              {walletAddress
                ? `${formatNumber(borrowed, 6)} ETH`
                : '-- ETH'}
            </strong>

            <small>
              Outstanding borrowed amount
            </small>

          </div>


          <div className="analysis-stat">

            <span>
              Loan-to-Value
            </span>

            <strong>

              {walletAddress && ltv !== null
                ? `${formatNumber(ltv)} %`
                : '-- %'}

            </strong>

            <small>
              Borrowed amount relative to collateral
            </small>

          </div>


          <div className="analysis-stat">

            <span>
              Collateral Ratio
            </span>

            <strong>

              {walletAddress && collateralRatio !== null
                ? `${formatNumber(collateralRatio)} %`
                : '-- %'}

            </strong>

            <small>
              Collateral compared to outstanding debt
            </small>

          </div>


          <div className="analysis-stat">

            <span>
              Liquidation Threshold
            </span>

            <strong>
              80 %
            </strong>

            <small>
              Current protocol threshold
            </small>

          </div>

        </div>

      </section>


      {/* =====================================
          RISK FACTORS
          ===================================== */}

      <section className="risk-section">

        <div className="risk-section-header">

          <div>

            <p className="risk-card-label">
              RISK FACTORS
            </p>

            <h2>
              What Influences Your Risk?
            </h2>

          </div>

        </div>


        <div className="risk-factors-grid">


          {/* Collateral */}

          <div className="risk-factor-card">

            <div className="risk-factor-icon">
              Ξ
            </div>

            <div>

              <h3>
                Collateral Value
              </h3>

              <p>
                Changes in the market value of your ETH
                collateral can affect your borrowing safety.
              </p>

            </div>

            <span className="factor-status">
              MONITOR
            </span>

          </div>


          {/* Borrowing */}

          <div className="risk-factor-card">

            <div className="risk-factor-icon">
              %
            </div>

            <div>

              <h3>
                Borrowing Ratio
              </h3>

              <p>
                Higher borrowing relative to collateral
                increases your liquidation exposure.
              </p>

            </div>

            <span className="factor-status">
              MONITOR
            </span>

          </div>


          {/* Market */}

          <div className="risk-factor-card">

            <div className="risk-factor-icon">
              ↕
            </div>

            <div>

              <h3>
                Market Volatility
              </h3>

              <p>
                ETH price volatility can rapidly change
                your collateral health.
              </p>

            </div>

            <span className="factor-status">
              MONITOR
            </span>

          </div>


          {/* ML */}

          <div className="risk-factor-card">

            <div className="risk-factor-icon">
              AI
            </div>

            <div>

              <h3>
                ML Risk Assessment
              </h3>

              <p>
                The intelligent risk model will evaluate
                your position and estimate potential risk
                once the backend model is connected.
              </p>

            </div>

            <span className="factor-status">
              READY
            </span>

          </div>

        </div>

      </section>


      {/* =====================================
          RECOMMENDATION
          ===================================== */}

      <section className="risk-recommendation">

        <div className="recommendation-icon">
          ◆
        </div>


        <div>

          <p className="risk-card-label">
            RISK RECOMMENDATION
          </p>


          <h3>

            {walletAddress
              ? riskScore !== null
                ? riskScore <= 30
                  ? 'Your position currently appears healthy'
                  : riskScore <= 60
                    ? 'Monitor your borrowing position'
                    : riskScore <= 80
                      ? 'Consider reducing your borrowing exposure'
                      : 'High risk — review your borrowing position'
                : 'No active borrowing position'
              : 'Connect your wallet to begin analysis'}

          </h3>


          <p>

            {walletAddress
              ? 'Your collateral and borrowing data are being read from the LendingPool smart contract. Advanced ML-based risk analysis can be connected later.'
              : 'Once your wallet is connected, DeFiLend will analyze your collateral, borrowed amount and position metrics.'}

          </p>

        </div>


        {!walletAddress && (

          <button
            type="button"
            className="wallet-btn"
            onClick={handleConnectWallet}
            disabled={loading}
          >

            {loading
              ? 'Connecting...'
              : 'Connect Wallet'}

          </button>

        )}

      </section>


      {/* =====================================
          ERROR / STATUS
          ===================================== */}

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

export default RiskAnalysis