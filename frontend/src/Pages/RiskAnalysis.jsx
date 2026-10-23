import { useEffect, useState } from 'react'
import {
  BrowserProvider,
  Contract,
  formatEther,
  formatUnits,
  MaxUint256,
} from 'ethers'

import { useWallet } from '../context/WalletContext'

import {
  LENDING_POOL_ADDRESS,
  LENDING_POOL_ABI,
} from '../utils/contracts'

import { predictRisk } from '../utils/riskApi'


function RiskAnalysis() {

  const { walletAddress, walletError } = useWallet()

  const [collateral, setCollateral] = useState(0)
  const [borrowed, setBorrowed] = useState(0)
  const [collateralUSD, setCollateralUSD] = useState(0)

  const [ltv, setLtv] = useState(null)
  const [collateralRatio, setCollateralRatio] = useState(null)
  const [healthFactor, setHealthFactor] = useState(null)

  const [loanDuration, setLoanDuration] = useState(0)
  const [interestUSDC, setInterestUSDC] = useState(0)

  const [riskScore, setRiskScore] = useState(null)
  const [riskLevel, setRiskLevel] = useState('Awaiting Analysis')

  const [probabilities, setProbabilities] = useState({
    low: null,
    medium: null,
    high: null,
  })

  const [riskFactors, setRiskFactors] = useState([])

  const [recommendation, setRecommendation] = useState('')

  const [loading, setLoading] = useState(false)


  const [statusMessage, setStatusMessage] = useState('')


  // =========================================
  // Format helper
  // =========================================

  const formatNumber = (value, decimals = 2) => {

    if (
      value === null ||
      value === undefined ||
      Number.isNaN(value)
    ) {
      return '--'
    }

    if (!Number.isFinite(value)) {
      return '∞'
    }

    return Number(value).toFixed(decimals)
  }


  // =========================================
  // Risk progress
  // =========================================

  const getRiskProgress = () => {

    if (riskScore === null) {
      return 0
    }

    return Math.min(
      Math.max(Number(riskScore), 0),
      100
    )
  }


  // =========================================
  // Health progress
  // =========================================

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


  // =========================================
  // Load blockchain + AI risk data
  // =========================================

  const loadRiskData = async (address) => {

    if (!window.ethereum || !address) {
      return
    }


    // -----------------------------------------
    // Blockchain connection
    // -----------------------------------------

    const provider =
      new BrowserProvider(window.ethereum)

    const lendingPool =
      new Contract(
        LENDING_POOL_ADDRESS,
        LENDING_POOL_ABI,
        provider
      )


    // -----------------------------------------
    // Read loan
    // -----------------------------------------

    const loan =
      await lendingPool.loans(address)


    // -----------------------------------------
    // Collateral
    // ETH uses 18 decimals
    // -----------------------------------------

    const collateralAmount =
      Number(
        formatEther(
          loan.collateralAmount
        )
      )


    setCollateral(collateralAmount)


    // -----------------------------------------
    // Principal borrowed
    // USDC uses 6 decimals
    // -----------------------------------------

    const principalBorrowed =
      Number(
        formatUnits(
          loan.borrowedAmount,
          6
        )
      )


    // -----------------------------------------
    // Current debt including interest
    // -----------------------------------------

    const currentDebtRaw =
      await lendingPool.getCurrentDebt(address)


    const currentDebt =
      Number(
        formatUnits(
          currentDebtRaw,
          6
        )
      )


    setBorrowed(currentDebt)


    // -----------------------------------------
    // Collateral USD value
    // Contract returns 18-decimal USD
    // -----------------------------------------

    const collateralValueRaw =
      await lendingPool.getCollateralValue(address)


    const collateralValue =
      Number(
        formatUnits(
          collateralValueRaw,
          18
        )
      )


    setCollateralUSD(collateralValue)


    // -----------------------------------------
    // Maximum borrow amount
    // USDC, 6 decimals
    // -----------------------------------------

    const maxBorrowRaw =
      await lendingPool.getMaxBorrowAmount(address)


    const maxBorrow =
      Number(
        formatUnits(
          maxBorrowRaw,
          6
        )
      )


    // -----------------------------------------
    // Health factor
    // -----------------------------------------

    const healthFactorRaw =
      await lendingPool.getHealthFactor(address)


    let currentHealthFactor

    if (
      healthFactorRaw === MaxUint256 ||
      healthFactorRaw >= MaxUint256
    ) {

      currentHealthFactor = Infinity

    } else {

      currentHealthFactor =
        Number(
          formatUnits(
            healthFactorRaw,
            18
          )
        )

    }


    setHealthFactor(currentHealthFactor)


    // -----------------------------------------
    // LTV
    // -----------------------------------------

    let currentLTV = 0

    if (collateralValue > 0) {

      currentLTV =
        (currentDebt / collateralValue) * 100

    }


    setLtv(currentLTV)


    // -----------------------------------------
    // Collateral ratio
    // -----------------------------------------

    let currentCollateralRatio = Infinity

    if (currentDebt > 0) {

      currentCollateralRatio =
        (collateralValue / currentDebt) * 100

    }


    setCollateralRatio(
      currentCollateralRatio
    )


    // -----------------------------------------
    // Loan duration
    // -----------------------------------------

    let durationDays = 0

    if (
      loan.startTime &&
      loan.startTime > 0
    ) {

      const startTimestamp =
        Number(loan.startTime)

      const nowSeconds =
        Math.floor(
          Date.now() / 1000
        )

      durationDays =
        Math.max(
          0,
          (nowSeconds - startTimestamp) /
          86400
        )

    }


    setLoanDuration(durationDays)


    // -----------------------------------------
    // Interest
    // -----------------------------------------

    const interest =
      Math.max(
        0,
        currentDebt - principalBorrowed
      )


    setInterestUSDC(interest)


    // =========================================
    // No active borrowing position
    // =========================================

    if (
      collateralAmount <= 0 ||
      currentDebt <= 0
    ) {

      setRiskScore(null)
      setRiskLevel(
        collateralAmount > 0
          ? 'No Borrowing'
          : 'No Position'
      )

      setProbabilities({
        low: null,
        medium: null,
        high: null,
      })

      setRiskFactors([])

      setRecommendation(
        collateralAmount > 0
          ? 'Your collateral is supplied, but there is currently no outstanding borrowing position to analyze.'
          : 'Supply ETH collateral and borrow USDC to create a lending position for AI risk analysis.'
      )

      setStatusMessage(
        'Blockchain position loaded. No active borrowing position requires AI analysis.'
      )

      return
    }


    // =========================================
    // ETH price
    // =========================================
    //
    // collateral USD value comes directly from
    // the protocol, so derive ETH price from:
    //
    // collateral USD / collateral ETH
    //
    // =========================================

    let ethPriceUSD = 0

    if (collateralAmount > 0) {

      ethPriceUSD =
        collateralValue /
        collateralAmount

    }


    // =========================================
    // AI API request
    // =========================================

    setStatusMessage(
      'Blockchain data loaded. Running AI risk analysis...'
    )


    const aiResult =
      await predictRisk({

        collateral_eth:
          collateralAmount,

        eth_price_usd:
          ethPriceUSD,

        collateral_usd:
          collateralValue,

        borrowed_usdc:
          currentDebt,

        ltv:
          currentLTV / 100,

        loan_duration_days:
          durationDays,

        interest_usdc:
          interest,

        current_debt_usdc:
          currentDebt,

        max_borrow_usdc:
          maxBorrow,

        health_factor:
          Number.isFinite(currentHealthFactor)
            ? currentHealthFactor
            : 10,

      })


    // =========================================
    // Store AI result
    // =========================================

    setRiskLevel(
      aiResult.risk_level
    )


    setRiskScore(
      aiResult.risk_score
    )


    setProbabilities(
      aiResult.probabilities || {
        low: 0,
        medium: 0,
        high: 0,
      }
    )


    setRiskFactors(
      aiResult.risk_factors || []
    )


    setRecommendation(
      aiResult.recommendation || ''
    )


    setStatusMessage(
      'AI risk analysis completed successfully.'
    )

  }


  // =========================================
  // Connect wallet
  // =========================================

    useEffect(() => {
    if (!walletAddress) {
      setCollateral(0)
      setBorrowed(0)
      setCollateralUSD(0)
      setLtv(null)
      setCollateralRatio(null)
      setHealthFactor(null)
      setLoanDuration(0)
      setInterestUSDC(0)

      setRiskScore(null)
      setRiskLevel('Awaiting Analysis')

      setProbabilities({
        low: null,
        medium: null,
        high: null,
      })

      setRiskFactors([])
      setRecommendation('')
      setStatusMessage('')

      return
    }

    const runAnalysis = async () => {
      try {
        setLoading(true)
        setStatusMessage('')
        await loadRiskData(walletAddress)
      } catch (error) {
        console.error('Risk analysis error:', error)
        setStatusMessage(
          error?.message || 'Failed to load risk analysis.'
        )
      } finally {
        setLoading(false)
      }
    }

    runAnalysis()
  }, [walletAddress])


  return (

    <div className="risk-page">


      {/* =====================================
          PAGE HEADER
          ===================================== */}

      <div className="risk-page-header">

        <div>

          <p className="eyebrow">
            AI ANALYTICS
          </p>


          <h1>
            Risk Analysis
          </h1>


          <p className="subtitle">
            Monitor your collateral health, borrowing risk
            and AI-based lending risk assessment.
          </p>

        </div>


        <div className="risk-engine-status">

          <span className="risk-status-dot"></span>

          {walletAddress
            ? 'AI Analysis Active'
            : 'AI Risk Engine Ready'}

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
                AI RISK ASSESSMENT
              </p>

              <h2>
                Risk Score
              </h2>

            </div>


            <div className="risk-score-badge">

              {riskScore !== null
                ? formatNumber(riskScore, 0)
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
                    ? formatNumber(riskScore, 0)
                    : '--'}
                </strong>

                <span>
                  / 100
                </span>

              </div>

            </div>


            <div className="risk-summary">

              <span className="risk-level-label">
                CURRENT AI RISK LEVEL
              </span>

              <h3>
                {riskLevel}
              </h3>

              <p>

                {walletAddress
                  ? riskScore !== null
                    ? 'Risk is estimated by the trained Random Forest model using your current lending position.'
                    : recommendation || 'No active borrowing position.'
                  : 'Connect your wallet to run AI risk analysis on your current lending position.'}

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
              ? 'Protocol health factor read directly from the LendingPool contract.'
              : 'Connect your wallet to read your protocol health factor.'}

          </p>

        </div>


        {/* AI Risk Level */}

        <div className="risk-stat-card">

          <div className="risk-stat-top">

            <div>

              <p className="risk-card-label">
                AI RISK LEVEL
              </p>

              <h3>
                {riskScore === null
                  ? '--'
                  : riskLevel}
              </h3>

            </div>

            <div className="risk-stat-icon">
              AI
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

            {riskScore === null
              ? 'AI analysis will appear after a borrowing position is detected.'
              : 'Classification generated by the Random Forest risk model.'}

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
              Your Lending Position
            </h2>

          </div>


          <span className="risk-analysis-badge">

            {walletAddress
              ? riskScore !== null
                ? 'AI ANALYSIS COMPLETE'
                : 'NO ACTIVE BORROWING'
              : 'CONNECT WALLET'}

          </span>

        </div>


        <div className="position-analysis-grid">


          {/* Collateral */}

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


          {/* Collateral USD */}

          <div className="analysis-stat">

            <span>
              Collateral Value
            </span>

            <strong>
              {walletAddress
                ? `$${formatNumber(collateralUSD, 2)}`
                : '--'}
            </strong>

            <small>
              Protocol-reported USD value
            </small>

          </div>


          {/* Borrowed */}

          <div className="analysis-stat">

            <span>
              Current Debt
            </span>

            <strong>
              {walletAddress
                ? `${formatNumber(borrowed, 6)} USDC`
                : '-- USDC'}
            </strong>

            <small>
              Principal plus accrued interest
            </small>

          </div>


          {/* LTV */}

          <div className="analysis-stat">

            <span>
              Loan-to-Value
            </span>

            <strong>

              {walletAddress && ltv !== null
                ? ltv < 0.01
                  ? '<0.01 %'
                  : `${formatNumber(ltv, 4)} %`
                : '-- %'}

            </strong>

            <small>
              Current debt relative to collateral value
            </small>

          </div>


          {/* Collateral Ratio */}

          <div className="analysis-stat">

            <span>
              Collateral Ratio
            </span>

            <strong>

              {walletAddress && collateralRatio !== null
                ? collateralRatio > 1000
                  ? `${(collateralRatio / 100).toFixed(0)}×`
                  : `${formatNumber(collateralRatio, 2)} %`
                : '-- %'}

            </strong>

            <small>
              Collateral value compared with current debt
            </small>

          </div>


          {/* Loan Duration */}

          <div className="analysis-stat">

            <span>
              Loan Duration
            </span>

            <strong>
              {walletAddress
                ? `${formatNumber(loanDuration, 1)} days`
                : '--'}
            </strong>

            <small>
              Time since borrowing started
            </small>

          </div>


          {/* Interest */}

          <div className="analysis-stat">

            <span>
              Accrued Interest
            </span>

            <strong>
              {walletAddress
                ? `${formatNumber(interestUSDC, 6)} USDC`
                : '-- USDC'}
            </strong>

            <small>
              Current debt minus principal
            </small>

          </div>

        </div>

      </section>


      {/* =====================================
          AI RISK PROBABILITIES
          ===================================== */}

      {riskScore !== null && (

        <section className="risk-section">

          <div className="risk-section-header">

            <div>

              <p className="risk-card-label">
                MODEL OUTPUT
              </p>

              <h2>
                AI Risk Probabilities
              </h2>

            </div>

          </div>


          <div className="risk-factors-grid">

            <div className="risk-factor-card">

              <div className="risk-factor-icon">
                L
              </div>

              <div>

                <h3>
                  Low Risk
                </h3>

                <p>
                  Model probability for the Low risk class.
                </p>

              </div>

              <span className="factor-status">
                {formatNumber(
                  probabilities.low,
                  2
                )}%
              </span>

            </div>


            <div className="risk-factor-card">

              <div className="risk-factor-icon">
                M
              </div>

              <div>

                <h3>
                  Medium Risk
                </h3>

                <p>
                  Model probability for the Medium risk class.
                </p>

              </div>

              <span className="factor-status">
                {formatNumber(
                  probabilities.medium,
                  2
                )}%
              </span>

            </div>


            <div className="risk-factor-card">

              <div className="risk-factor-icon">
                H
              </div>

              <div>

                <h3>
                  High Risk
                </h3>

                <p>
                  Model probability for the High risk class.
                </p>

              </div>

              <span className="factor-status">
                {formatNumber(
                  probabilities.high,
                  2
                )}%
              </span>

            </div>

          </div>

        </section>

      )}


      {/* =====================================
          RISK FACTORS
          ===================================== */}

      <section className="risk-section">

        <div className="risk-section-header">

          <div>

            <p className="risk-card-label">
              AI RISK FACTORS
            </p>

            <h2>
              What Influences Your Risk?
            </h2>

          </div>

        </div>


        <div className="risk-factors-grid">


          {/* Health Factor */}

          <div className="risk-factor-card">

            <div className="risk-factor-icon">
              ♥
            </div>

            <div>

              <h3>
                Health Factor
              </h3>

              <p>
                {healthFactor !== null
                  ? `Current protocol health factor: ${formatNumber(healthFactor, 2)}.`
                  : 'Protocol health factor will be evaluated after wallet connection.'}
              </p>

            </div>

            <span className="factor-status">
              PROTOCOL
            </span>

          </div>


          {/* LTV */}

          <div className="risk-factor-card">

            <div className="risk-factor-icon">
              %
            </div>

            <div>

              <h3>
                Loan-to-Value
              </h3>

              <p>
                {ltv !== null
                  ? ltv < 0.01
                    ? 'Current LTV is below 0.01%.'
                    : `Current LTV is ${formatNumber(ltv, 4)}%.`
                  : 'LTV will be calculated from collateral value and current debt.'}
              </p>

            </div>

            <span className="factor-status">
              MODEL INPUT
            </span>

          </div>


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
                {collateralUSD > 0
                  ? `Current collateral value is approximately $${formatNumber(collateralUSD, 2)}.`
                  : 'Collateral value will be read from the lending protocol.'}
              </p>

            </div>

            <span className="factor-status">
              MODEL INPUT
            </span>

          </div>


          {/* ML */}

          <div className="risk-factor-card">

            <div className="risk-factor-icon">
              AI
            </div>

            <div>

              <h3>
                Random Forest
              </h3>

              <p>
                The trained ML model classifies the lending position
                into Low, Medium or High risk.
              </p>

            </div>

            <span className="factor-status">
              {riskScore !== null
                ? 'ACTIVE'
                : 'READY'}
            </span>

          </div>


          {/* Dynamic AI factors */}

          {riskFactors.map(
            (factor, index) => (

              <div
                className="risk-factor-card"
                key={`${factor}-${index}`}
              >

                <div className="risk-factor-icon">
                  !
                </div>

                <div>

                  <h3>
                    AI Risk Signal
                  </h3>

                  <p>
                    {factor}
                  </p>

                </div>

                <span className="factor-status">
                  AI
                </span>

              </div>

            )
          )}

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
            AI RISK RECOMMENDATION
          </p>


          <h3>

            {walletAddress
              ? recommendation ||
                'Run the AI analysis to receive a recommendation.'
              : 'Connect your wallet to begin AI risk analysis.'}

          </h3>


          <p>

            {walletAddress
              ? riskScore !== null
                ? 'This recommendation is generated from the current blockchain position and the trained Random Forest risk model.'
                : 'Your blockchain position has been loaded, but there is no active borrowing position to analyze.'
              : 'The AI service will analyze your actual LendingPool position after your wallet is connected.'}

          </p>

        </div>


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