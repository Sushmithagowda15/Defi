import { useEffect, useState } from 'react'
import {
  formatEther,
  formatUnits,
  MaxUint256
} from 'ethers'

import { connectWallet } from '../utils/wallet'
import { getLendingPool } from '../utils/contracts'

function Portfolio() {
  const [walletAddress, setWalletAddress] = useState('')
  const [ethBalance, setEthBalance] = useState('0')
  const [supplied, setSupplied] = useState('0')
  const [borrowed, setBorrowed] = useState('0')
  const [collateralValue, setCollateralValue] = useState('0')
  const [healthFactor, setHealthFactor] = useState(null)
  const [hasPosition, setHasPosition] = useState(false)

  const [walletError, setWalletError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const loadPortfolio = async () => {
    try {
      setIsLoading(true)
      setWalletError('')
      setStatusMessage('')

      const wallet = await connectWallet()

      const provider = wallet.provider
      const address = wallet.address

      setWalletAddress(address)

      // Wallet ETH balance
      const balanceWei =
        await provider.getBalance(address)

      setEthBalance(
        formatEther(balanceWei)
      )

      // LendingPool
      const lendingPool =
        getLendingPool(provider)

      // Loan
      const loan =
        await lendingPool.loans(address)

      const collateralAmount =
        loan.collateralAmount ??
        loan[0] ??
        0

      const active =
        loan.active ??
        loan[3] ??
        false

      // Supplied ETH
      const suppliedETH =
        formatEther(collateralAmount)

      setSupplied(suppliedETH)

      // Current USDC debt
      const currentDebt =
        await lendingPool.getCurrentDebt(
          address
        )

      const borrowedUSDC =
        formatUnits(
          currentDebt,
          6
        )

      setBorrowed(borrowedUSDC)

      // Collateral USD value
      const collateralValueRaw =
        await lendingPool.getCollateralValue(
          address
        )

      const collateralUSD =
        formatUnits(
          collateralValueRaw,
          18
        )

      setCollateralValue(collateralUSD)

      // Health factor
      const healthFactorRaw =
        await lendingPool.getHealthFactor(
          address
        )

      if (
        healthFactorRaw === MaxUint256
      ) {
        setHealthFactor(null)
      } else {
        setHealthFactor(
          Number(
            formatUnits(
              healthFactorRaw,
              18
            )
          )
        )
      }

      setHasPosition(
        Boolean(active) ||
        Number(suppliedETH) > 0 ||
        Number(borrowedUSDC) > 0
      )

    } catch (error) {
      console.error(
        'Failed to load portfolio:',
        error
      )

      setWalletError(
        error?.shortMessage ||
        error?.reason ||
        error?.message ||
        'Failed to load portfolio data.'
      )

      setSupplied('0')
      setBorrowed('0')
      setCollateralValue('0')
      setHealthFactor(null)
      setHasPosition(false)

    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPortfolio()
  }, [])

  const suppliedNumber =
    Number(supplied) || 0

  const borrowedNumber =
    Number(borrowed) || 0

  const collateralUSDNumber =
    Number(collateralValue) || 0

  const netPosition =
    collateralUSDNumber -
    borrowedNumber

  const healthFactorDisplay =
    healthFactor === null
      ? 'No Debt'
      : healthFactor.toFixed(2)

  return (
    <div className="portfolio-page">

      <div className="portfolio-header">

        <div>

          <p className="eyebrow">
            OVERVIEW
          </p>

          <h1>
            Portfolio
          </h1>

          <p className="subtitle">
            Track your supplied assets, borrowed positions and portfolio health.
          </p>

        </div>

        <div className="portfolio-status">

          <span className="network-dot"></span>

          {walletAddress
            ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : 'Wallet Not Connected'}

        </div>

      </div>


      {walletError && (
        <p className="wallet-error">
          {walletError}
        </p>
      )}


      {isLoading && (
        <p className="transaction-note">
          Loading portfolio data...
        </p>
      )}


      {statusMessage && (
        <p className="transaction-note">
          {statusMessage}
        </p>
      )}


      <section className="portfolio-summary">

        <div className="portfolio-summary-card">

          <span>
            Portfolio Value
          </span>

          <strong>
            {walletAddress
              ? `$${collateralUSDNumber.toFixed(2)}`
              : '--'}
          </strong>

          <small>
            Current collateral value
          </small>

        </div>


        <div className="portfolio-summary-card">

          <span>
            Supplied
          </span>

          <strong>
            {walletAddress
              ? `${suppliedNumber.toFixed(6)} ETH`
              : '-- ETH'}
          </strong>

          <small>
            ETH supplied to protocol
          </small>

        </div>


        <div className="portfolio-summary-card">

          <span>
            Borrowed
          </span>

          <strong>
            {walletAddress
              ? `${borrowedNumber.toFixed(6)} USDC`
              : '-- USDC'}
          </strong>

          <small>
            Outstanding USDC debt
          </small>

        </div>


        <div className="portfolio-summary-card">

          <span>
            Health Factor
          </span>

          <strong>
            {walletAddress
              ? healthFactorDisplay
              : '--'}
          </strong>

          <small>
            Protocol health factor
          </small>

        </div>

      </section>


      <section className="portfolio-panel">

        <div className="portfolio-panel-header">

          <div>

            <p className="risk-card-label">
              YOUR POSITIONS
            </p>

            <h2>
              Asset Positions
            </h2>

          </div>

          <span className="portfolio-live-badge">
            {hasPosition
              ? 'ACTIVE'
              : 'PORTFOLIO'}
          </span>

        </div>


        <div className="portfolio-asset">

          <div className="portfolio-asset-info">

            <div className="portfolio-eth-icon">
              Ξ
            </div>

            <div>

              <h3>
                Ethereum
              </h3>

              <span>
                ETH
              </span>

            </div>

          </div>


          <div className="portfolio-stat">

            <span>
              SUPPLIED
            </span>

            <strong>
              {walletAddress
                ? `${suppliedNumber.toFixed(6)} ETH`
                : '-- ETH'}
            </strong>

          </div>


          <div className="portfolio-stat">

            <span>
              BORROWED
            </span>

            <strong>
              {walletAddress
                ? `${borrowedNumber.toFixed(6)} USDC`
                : '-- USDC'}
            </strong>

          </div>


          <div className="portfolio-stat">

            <span>
              NET POSITION
            </span>

            <strong>
              {walletAddress
                ? `$${netPosition.toFixed(2)}`
                : '--'}
            </strong>

          </div>


          <div className="portfolio-stat">

            <span>
              VALUE
            </span>

            <strong>
              {walletAddress
                ? `$${collateralUSDNumber.toFixed(2)}`
                : '--'}
            </strong>

          </div>

        </div>


        <div className="portfolio-empty">

          <div className="portfolio-empty-icon">
            {hasPosition ? '✓' : '◉'}
          </div>

          <h3>
            {hasPosition
              ? 'Your portfolio is active'
              : 'No active lending position'}
          </h3>

          <p>
            {hasPosition
              ? 'Your supplied assets, borrowed positions and portfolio health are being read directly from the Sepolia lending protocol.'
              : 'Connect your wallet and supply ETH or borrow USDC to create a lending position.'}
          </p>

          {!hasPosition && !walletAddress && (
            <button
              className="wallet-btn"
              onClick={loadPortfolio}
              disabled={isLoading}
            >
              {isLoading
                ? 'Connecting...'
                : 'Connect Wallet'}
            </button>
          )}

          {!hasPosition && walletAddress && (
            <button
              className="wallet-btn"
              onClick={() => {
                window.location.href = '/lend'
              }}
            >
              Start Lending
            </button>
          )}

        </div>

      </section>


      <section className="portfolio-health">

        <div className="portfolio-health-icon">
          +
        </div>

        <div>

          <p className="risk-card-label">
            PORTFOLIO HEALTH
          </p>

          <h3>
            Monitor your borrowing position
          </h3>

          <p>
            Your health factor indicates the relationship
            between your available borrowing capacity and
            current debt. A health factor below 1.0 means
            the position is below the protocol's required
            collateral level.
          </p>

        </div>

      </section>

    </div>
  )
}

export default Portfolio