import { useState } from 'react'
import { BrowserProvider, Contract, formatEther } from 'ethers'

import { useWallet } from '../context/WalletContext'

import {
  LENDING_POOL_ADDRESS,
  LENDING_POOL_ABI,
} from '../utils/contracts'

function Portfolio() {
  const {
    walletAddress,
    walletError,
    connectWallet,
  } = useWallet()

  const [collateral, setCollateral] = useState('0')
  const [borrowed, setBorrowed] = useState('0')
  const [active, setActive] = useState(false)

  const [statusMessage, setStatusMessage] = useState('')

  // ==========================================
  // LOAD PORTFOLIO DATA
  // ==========================================

  const loadPortfolio = async (address) => {
    try {
      if (!window.ethereum || !address) {
        return
      }

      const provider = new BrowserProvider(
        window.ethereum
      )

      const lendingPool = new Contract(
        LENDING_POOL_ADDRESS,
        LENDING_POOL_ABI,
        provider
      )

      const loan = await lendingPool.loans(address)

      setCollateral(
        formatEther(loan.collateralAmount)
      )

      setBorrowed(
        formatEther(loan.borrowedAmount)
      )

      setActive(loan.active)

    } catch (error) {
      console.error(
        'Failed to load portfolio:',
        error
      )

      setStatusMessage(
        'Wallet connected, but portfolio data could not be loaded.'
      )
    }
  }

  // ==========================================
  // CONNECT WALLET
  // ==========================================

  const handleConnectWallet = async () => {
    try {
      setStatusMessage(
        'Connecting wallet...'
      )

      const wallet = await connectWallet()

      if (wallet?.address) {
        await loadPortfolio(wallet.address)

        setStatusMessage(
          'Portfolio loaded successfully.'
        )
      }

    } catch (error) {
      console.error(
        'Portfolio wallet connection failed:',
        error
      )

      setStatusMessage('')
    }
  }

  // ==========================================
  // NET POSITION
  // ==========================================

  const netPosition =
    Number(collateral) - Number(borrowed)

  return (
    <div className="portfolio-page">

      {/* ======================================
          PAGE HEADER
          ====================================== */}

      <div className="portfolio-header">

        <div>

          <p className="eyebrow">
            OVERVIEW
          </p>

          <h1>
            Portfolio
          </h1>

          <p className="subtitle">
            Track your supplied assets, borrowed
            positions and portfolio health.
          </p>

        </div>

        <div className="portfolio-status">

          <span className="network-dot"></span>

          {walletAddress
            ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : 'Wallet Not Connected'}

        </div>

      </div>


      {/* ======================================
          PORTFOLIO SUMMARY
          ====================================== */}

      <section className="portfolio-summary">

        {/* PORTFOLIO VALUE */}

        <div className="portfolio-summary-card">

          <span>
            Portfolio Value
          </span>

          <strong>
            {walletAddress
              ? `${Number(collateral).toFixed(6)} ETH`
              : '-- ETH'}
          </strong>

          <small>
            ETH collateral position
          </small>

        </div>


        {/* SUPPLIED */}

        <div className="portfolio-summary-card">

          <span>
            Supplied
          </span>

          <strong>
            {walletAddress
              ? `${Number(collateral).toFixed(6)} ETH`
              : '-- ETH'}
          </strong>

          <small>
            Assets supplied to protocol
          </small>

        </div>


        {/* BORROWED */}

        <div className="portfolio-summary-card">

          <span>
            Borrowed
          </span>

          <strong>
            {walletAddress
              ? `${Number(borrowed).toFixed(6)} ETH`
              : '-- ETH'}
          </strong>

          <small>
            Outstanding borrowed assets
          </small>

        </div>


        {/* HEALTH FACTOR */}

        <div className="portfolio-summary-card">

          <span>
            Health Factor
          </span>

          <strong>
            --
          </strong>

          <small>
            Awaiting protocol risk logic
          </small>

        </div>

      </section>


      {/* ======================================
          MAIN PORTFOLIO PANEL
          ====================================== */}

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

            {walletAddress
              ? 'CONNECTED'
              : 'PORTFOLIO'}

          </span>

        </div>


        {/* ==================================
            ETH POSITION
            ================================== */}

        <div className="portfolio-asset">

          {/* ASSET */}

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


          {/* SUPPLIED */}

          <div className="portfolio-stat">

            <span>
              SUPPLIED
            </span>

            <strong>

              {walletAddress
                ? `${Number(collateral).toFixed(6)} ETH`
                : '-- ETH'}

            </strong>

          </div>


          {/* BORROWED */}

          <div className="portfolio-stat">

            <span>
              BORROWED
            </span>

            <strong>

              {walletAddress
                ? `${Number(borrowed).toFixed(6)} ETH`
                : '-- ETH'}

            </strong>

          </div>


          {/* NET POSITION */}

          <div className="portfolio-stat">

            <span>
              NET POSITION
            </span>

            <strong>

              {walletAddress
                ? `${netPosition.toFixed(6)} ETH`
                : '-- ETH'}

            </strong>

          </div>


          {/* STATUS */}

          <div className="portfolio-stat">

            <span>
              STATUS
            </span>

            <strong>

              {walletAddress
                ? active
                  ? 'ACTIVE'
                  : 'INACTIVE'
                : '--'}

            </strong>

          </div>

        </div>


        {/* ==================================
            CONNECTED STATE
            ================================== */}

        {walletAddress ? (

          <div className="portfolio-empty">

            <div className="portfolio-empty-icon">
              ✓
            </div>

            <h3>
              Portfolio Connected
            </h3>

            <p>
              Your collateral, borrowed amount and
              loan status are being read directly from
              the LendingPool smart contract.
            </p>

          </div>

        ) : (

          /* ==================================
             NOT CONNECTED STATE
             ================================== */

          <div className="portfolio-empty">

            <div className="portfolio-empty-icon">
              ◉
            </div>

            <h3>
              Connect your wallet to view your portfolio
            </h3>

            <p>
              Your supplied assets, borrowed positions
              and portfolio status will appear here
              after connecting your wallet.
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

      </section>


      {/* ======================================
          PORTFOLIO HEALTH
          ====================================== */}

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
            Your collateral and borrowed amounts are
            retrieved directly from the LendingPool
            contract. Health factor and risk information
            will be connected when the protocol's risk
            logic is implemented.
          </p>

        </div>

      </section>


      {/* ======================================
          WALLET ERROR
          ====================================== */}

      {walletError && (

        <p className="wallet-error">
          {walletError}
        </p>

      )}


      {/* ======================================
          STATUS MESSAGE
          ====================================== */}

      {statusMessage && (

        <p className="transaction-note">
          {statusMessage}
        </p>

      )}

    </div>
  )
}

export default Portfolio