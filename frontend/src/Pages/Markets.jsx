import { useState } from 'react'
import {
  BrowserProvider,
  Contract,
  formatEther,
  formatUnits,
} from 'ethers'

import { connectWallet } from '../utils/wallet'

import {
  LENDING_POOL_ADDRESS,
  LENDING_POOL_ABI,
} from '../utils/contracts'


function Markets() {

  const [walletAddress, setWalletAddress] = useState('')
  const [walletBalance, setWalletBalance] = useState('0')

  // Store blockchain values as JavaScript numbers
  // so .toFixed() works correctly.
  const [collateral, setCollateral] = useState(0)
  const [debt, setDebt] = useState(0)
  const [maxBorrow, setMaxBorrow] = useState(0)
  const [healthFactor, setHealthFactor] = useState(0)

  const [maxLTV, setMaxLTV] = useState(0)
  const [interestRate, setInterestRate] = useState(0)
  const [liquidationBonus, setLiquidationBonus] = useState(0)

  const [loading, setLoading] = useState(false)
  const [walletError, setWalletError] = useState('')


  /* =========================================
     LOAD DATA FROM LENDINGPOOL
  ========================================= */

  const loadMarketData = async (address) => {

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
         USER COLLATERAL
      ===================================== */

      const collateralValue =
        await lendingPool.getCollateralValue(address)

      setCollateral(
        Number(formatEther(collateralValue))
      )


      /* =====================================
         USER CURRENT DEBT
      ===================================== */

      const currentDebt =
        await lendingPool.getCurrentDebt(address)

      setDebt(
        Number(formatUnits(currentDebt, 6))
      )


      /* =====================================
         MAXIMUM BORROW
      ===================================== */

      const maximumBorrow =
        await lendingPool.getMaxBorrowAmount(address)

      setMaxBorrow(
        Number(formatUnits(maximumBorrow, 6))
      )


      /* =====================================
         HEALTH FACTOR
      ===================================== */

      const health =
        await lendingPool.getHealthFactor(address)

      setHealthFactor(
        Number(formatUnits(health, 18))
      )


      /* =====================================
         MAX LTV
      ===================================== */

      const ltv =
        await lendingPool.MAX_LTV()

      setMaxLTV(
        Number(ltv)
      )


      /* =====================================
         INTEREST RATE
      ===================================== */

      const rate =
        await lendingPool.INTEREST_RATE()

      setInterestRate(
        Number(rate)
      )


      /* =====================================
         LIQUIDATION BONUS
      ===================================== */

      const bonus =
        await lendingPool.LIQUIDATION_BONUS()

      setLiquidationBonus(
        Number(bonus)
      )

    } catch (error) {

      console.error(
        'Market data error:',
        error
      )

      throw error
    }
  }


  /* =========================================
     CONNECT WALLET
  ========================================= */

  const handleConnectWallet = async () => {

    try {

      setLoading(true)
      setWalletError('')

      const wallet =
        await connectWallet()

      const address =
        wallet.address

      setWalletAddress(address)

      setWalletBalance(
        wallet.balance || '0'
      )

      await loadMarketData(address)

    } catch (error) {

      console.error(
        'Wallet / market error:',
        error
      )

      setWalletError(
        error?.message ||
        'Failed to connect wallet or load market data.'
      )

    } finally {

      setLoading(false)
    }
  }


  /* =========================================
     REFRESH MARKET DATA
  ========================================= */

  const handleRefresh = async () => {

    if (!walletAddress) {
      return
    }

    try {

      setLoading(true)
      setWalletError('')

      await loadMarketData(walletAddress)

    } catch (error) {

      console.error(
        'Refresh error:',
        error
      )

      setWalletError(
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
          WALLET CONNECTION
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
              : 'Connect your wallet to load live protocol data.'
            }

          </p>


          {walletError && (

            <p className="wallet-error">
              {walletError}
            </p>

          )}


          <button
            type="button"
            className="wallet-btn"
            onClick={
              walletAddress
                ? handleRefresh
                : handleConnectWallet
            }
            disabled={loading}
          >

            {loading
              ? 'Loading...'
              : walletAddress
                ? 'Refresh Market Data'
                : 'Connect Wallet'
            }

          </button>

        </div>

      </section>



      {/* =====================================
          MARKET OVERVIEW
      ===================================== */}

      <section className="market-overview">


        {/* =================================
            COLLATERAL
        ================================= */}

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



        {/* =================================
            CURRENT DEBT
        ================================= */}

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



        {/* =================================
            MAXIMUM BORROW
        ================================= */}

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



        {/* =================================
            HEALTH FACTOR
        ================================= */}

        <div className="market-overview-card">

          <span>
            Health Factor
          </span>


          <strong>

            {walletAddress
              ? healthFactor.toFixed(2)
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



          {/* =================================
              MAX LTV
          ================================= */}

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



          {/* =================================
              INTEREST RATE
          ================================= */}

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



          {/* =================================
              LIQUIDATION BONUS
          ================================= */}

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



          {/* =================================
              USER COLLATERAL
          ================================= */}

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



          {/* =================================
              ACTION
          ================================= */}

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