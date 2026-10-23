import { useEffect, useState } from 'react'
import {
  BrowserProvider,
  Contract,
  formatEther,
  formatUnits,
} from 'ethers'

import { useWallet } from '../context/WalletContext'

import {
  LENDING_POOL_ADDRESS,
  LENDING_POOL_ABI,
} from '../utils/contracts'

function Markets() {
  const {
    walletAddress,
    walletError,
  } = useWallet()

  const [walletBalance, setWalletBalance] = useState('0')

  const [collateral, setCollateral] = useState(0)
  const [debt, setDebt] = useState(0)
  const [maxBorrow, setMaxBorrow] = useState(0)
  const [healthFactor, setHealthFactor] = useState(0)

  const [maxLTV, setMaxLTV] = useState(0)
  const [interestRate, setInterestRate] = useState(0)
  const [liquidationBonus, setLiquidationBonus] = useState(0)

  const [loading, setLoading] = useState(false)
  const [marketError, setMarketError] = useState('')

  /* =========================================
     LOAD DATA FROM LENDINGPOOL
  ========================================= */

  const loadMarketData = async (address) => {
    if (!address) {
      return
    }

    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed')
      }

      const provider = new BrowserProvider(window.ethereum)

      const lendingPool = new Contract(
        LENDING_POOL_ADDRESS,
        LENDING_POOL_ABI,
        provider
      )

      /* =====================================
         USER WALLET BALANCE
      ===================================== */

      try {
        const balance = await provider.getBalance(address)

        setWalletBalance(formatEther(balance))
      } catch (error) {
        console.error('Wallet balance error:', error)
        setWalletBalance('0')
      }

      /* =====================================
         USER COLLATERAL
      ===================================== */

      if (
        typeof lendingPool.getCollateralValue === 'function'
      ) {
        const collateralValue =
          await lendingPool.getCollateralValue(address)

        setCollateral(
          Number(formatEther(collateralValue))
        )
      } else {
        setCollateral(0)
      }

      /* =====================================
         USER CURRENT DEBT
      ===================================== */

      if (
        typeof lendingPool.getCurrentDebt === 'function'
      ) {
        const currentDebt =
          await lendingPool.getCurrentDebt(address)

        setDebt(
          Number(formatUnits(currentDebt, 6))
        )
      } else {
        setDebt(0)
      }

      /* =====================================
         MAXIMUM BORROW
      ===================================== */

      if (
        typeof lendingPool.getMaxBorrowAmount === 'function'
      ) {
        const maximumBorrow =
          await lendingPool.getMaxBorrowAmount(address)

        setMaxBorrow(
          Number(formatUnits(maximumBorrow, 6))
        )
      } else {
        setMaxBorrow(0)
      }

      /* =====================================
         HEALTH FACTOR
      ===================================== */

      if (
        typeof lendingPool.getHealthFactor === 'function'
      ) {
        const health =
          await lendingPool.getHealthFactor(address)

        setHealthFactor(
          Number(formatUnits(health, 18))
        )
      } else {
        setHealthFactor(0)
      }

      /* =====================================
         MAX LTV
      ===================================== */

      if (
        typeof lendingPool.MAX_LTV === 'function'
      ) {
        const ltv =
          await lendingPool.MAX_LTV()

        setMaxLTV(
          Number(ltv)
        )
      } else {
        setMaxLTV(0)
      }

      /* =====================================
         INTEREST RATE
      ===================================== */

      if (
        typeof lendingPool.INTEREST_RATE === 'function'
      ) {
        const rate =
          await lendingPool.INTEREST_RATE()

        setInterestRate(
          Number(rate)
        )
      } else {
        setInterestRate(0)
      }

      /* =====================================
         LIQUIDATION BONUS
      ===================================== */

      if (
        typeof lendingPool.LIQUIDATION_BONUS === 'function'
      ) {
        const bonus =
          await lendingPool.LIQUIDATION_BONUS()

        setLiquidationBonus(
          Number(bonus)
        )
      } else {
        setLiquidationBonus(0)
      }
    } catch (error) {
      console.error(
        'Market data error:',
        error
      )

      throw error
    }
  }

  /* =========================================
     AUTOMATICALLY LOAD WHEN WALLET CONNECTS
  ========================================= */

  useEffect(() => {
    if (!walletAddress) {
      setCollateral(0)
      setDebt(0)
      setMaxBorrow(0)
      setHealthFactor(0)
      setMaxLTV(0)
      setInterestRate(0)
      setLiquidationBonus(0)
      setWalletBalance('0')
      setMarketError('')
      return
    }

    const load = async () => {
      try {
        setLoading(true)
        setMarketError('')

        await loadMarketData(walletAddress)
      } catch (error) {
        console.error(
          'Automatic market load error:',
          error
        )

        setMarketError(
          error?.message ||
            'Failed to load market data.'
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [walletAddress])

  /* =========================================
     REFRESH MARKET DATA
  ========================================= */

  const handleRefresh = async () => {
    if (!walletAddress) {
      return
    }

    try {
      setLoading(true)
      setMarketError('')

      await loadMarketData(walletAddress)
    } catch (error) {
      console.error(
        'Refresh error:',
        error
      )

      setMarketError(
        error?.message ||
          'Failed to refresh market data.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="markets-page">

      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="markets-header">

        <div>

          <p className="eyebrow">
            OVERVIEW
          </p>

          <h1>
            Markets
          </h1>

          <p className="subtitle">
            Explore available lending markets and protocol liquidity.
          </p>

        </div>

        <div className="market-network">

          <span className="network-dot"></span>

          Ethereum Sepolia

        </div>

      </div>


      {/* =====================================
          WALLET INFORMATION
      ===================================== */}

      <section className="market-info">

        <div className="market-info-icon">
          Ξ
        </div>

        <div>

          <p className="risk-card-label">
            WALLET
          </p>

          <h3>
            {walletAddress
              ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
              : 'Wallet Not Connected'
            }
          </h3>

          <p>
            {walletAddress
              ? 'Connected to Sepolia network.'
              : 'Connect your wallet from the top navigation to load live protocol data.'
            }
          </p>

          {(walletError || marketError) && (
            <p className="wallet-error">
              {walletError || marketError}
            </p>
          )}

          {walletAddress && (
            <button
              type="button"
              className="wallet-btn"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading
                ? 'Loading...'
                : 'Refresh Market Data'
              }
            </button>
          )}

        </div>

      </section>


      {/* =====================================
          MARKET OVERVIEW
      ===================================== */}

      <section className="market-overview">

        {/* COLLATERAL */}

        <div className="market-overview-card">

          <span>
            ETH Collateral
          </span>

          <strong>
            {walletAddress
              ? `${collateral.toFixed(6)} ETH`
              : '-- ETH'
            }
          </strong>

          <small>
            Your deposited ETH collateral
          </small>

        </div>


        {/* CURRENT DEBT */}

        <div className="market-overview-card">

          <span>
            Current Debt
          </span>

          <strong>
            {walletAddress
              ? `${debt.toFixed(2)} USDC`
              : '-- USDC'
            }
          </strong>

          <small>
            Your current borrowing
          </small>

        </div>


        {/* MAXIMUM BORROW */}

        <div className="market-overview-card">

          <span>
            Maximum Borrow
          </span>

          <strong>
            {walletAddress
              ? `${maxBorrow.toFixed(2)} USDC`
              : '-- USDC'
            }
          </strong>

          <small>
            Maximum amount you can borrow
          </small>

        </div>


        {/* HEALTH FACTOR */}

        <div className="market-overview-card">

          <span>
            Health Factor
          </span>

          <strong>
            {walletAddress
              ? healthFactor > 0
                ? healthFactor.toFixed(2)
                : '--'
              : '--'
            }
          </strong>

          <small>
            Current loan health
          </small>

        </div>

      </section>


      {/* =====================================
          LENDING MARKETS
      ===================================== */}

      <section className="markets-panel">

        <div className="markets-panel-header">

          <div>

            <p className="risk-card-label">
              LENDING MARKETS
            </p>

            <h2>
              Available Assets
            </h2>

          </div>

          <span className="market-live-badge">
            LIVE MARKET
          </span>

        </div>


        {/* =================================
            ETH MARKET
        ================================= */}

        <div className="asset-market-card">

          {/* ASSET */}

          <div className="asset-information">

            <div className="eth-market-icon">
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


          {/* MAX LTV */}

          <div className="market-stat">

            <span>
              MAX LTV
            </span>

            <strong>
              {walletAddress
                ? `${maxLTV}%`
                : '-- %'
              }
            </strong>

          </div>


          {/* INTEREST RATE */}

          <div className="market-stat">

            <span>
              INTEREST RATE
            </span>

            <strong>
              {walletAddress
                ? `${interestRate}%`
                : '-- %'
              }
            </strong>

          </div>


          {/* LIQUIDATION BONUS */}

          <div className="market-stat">

            <span>
              LIQUIDATION BONUS
            </span>

            <strong>
              {walletAddress
                ? `${liquidationBonus}%`
                : '-- %'
              }
            </strong>

          </div>


          {/* USER COLLATERAL */}

          <div className="market-stat">

            <span>
              YOUR COLLATERAL
            </span>

            <strong>
              {walletAddress
                ? `${collateral.toFixed(6)} ETH`
                : '-- ETH'
              }
            </strong>

          </div>


          {/* ACTION */}

          <div className="market-action">

            <button
              type="button"
              className="market-action-btn"
              onClick={() => {
                window.location.href = '/lend'
              }}
            >
              View Market
            </button>

          </div>

        </div>


        {/* =================================
            MORE ASSETS
        ================================= */}

        <div className="market-coming-soon">

          <div className="coming-soon-icon">
            +
          </div>

          <div>

            <h3>
              More assets coming soon
            </h3>

            <p>
              Additional lending markets will be introduced
              as the protocol expands.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================
          MARKET INFORMATION
      ===================================== */}

      <section className="market-info">

        <div className="market-info-icon">
          i
        </div>

        <div>

          <p className="risk-card-label">
            MARKET INFORMATION
          </p>

          <h3>
            Transparent lending rates
          </h3>

          <p>
            Lending parameters are read directly from
            the deployed LendingPool contract. User
            collateral, debt, borrowing capacity and
            health factor are loaded from blockchain data.
          </p>

        </div>

      </section>

    </div>
  )
}

export default Markets