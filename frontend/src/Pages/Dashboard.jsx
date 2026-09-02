import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserProvider, Contract, formatEther } from 'ethers'

import { connectWallet } from '../utils/wallet'

import {
  LENDING_POOL_ADDRESS,
  LENDING_POOL_ABI,
} from '../utils/contracts'


function Dashboard() {

  const navigate = useNavigate()

  const [walletAddress, setWalletAddress] = useState('')
  const [walletBalance, setWalletBalance] = useState('0')
  const [collateral, setCollateral] = useState('0')
  const [borrowed, setBorrowed] = useState('0')
  const [hasPosition, setHasPosition] = useState(false)

  const [loading, setLoading] = useState(false)
  const [walletError, setWalletError] = useState('')


  /* ================================
     LOAD CONTRACT DATA
  ================================= */

  const loadDashboardData = async (address) => {

    try {

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed')
      }

      const provider =
        new BrowserProvider(window.ethereum)


      const lendingPool =
        new Contract(
          LENDING_POOL_ADDRESS,
          LENDING_POOL_ABI,
          provider
        )


      /* Wallet ETH Balance */

      const balanceWei =
        await provider.getBalance(address)

      const balance =
        formatEther(balanceWei)

      setWalletBalance(balance)


      /* User Lending Position */

      const loan =
        await lendingPool.loans(address)


      const collateralAmount =
        loan.collateralAmount ?? loan[0] ?? 0

      const borrowedAmount =
        loan.borrowedAmount ?? loan[1] ?? 0

      const active =
        loan.active ?? loan[2] ?? false


      setCollateral(
        formatEther(collateralAmount)
      )


      setBorrowed(
        formatEther(borrowedAmount)
      )


      setHasPosition(active)

    } catch (error) {

      console.error(
        'Dashboard data error:',
        error
      )

      /*
        If the contract does not expose the
        expected loan data, we still keep the
        wallet connection working.
      */

      setCollateral('0')
      setBorrowed('0')
      setHasPosition(false)

    }

  }


  /* ================================
     CONNECT WALLET
  ================================= */

  const handleConnectWallet = async () => {

    try {

      setLoading(true)

      setWalletError('')


      const wallet =
        await connectWallet()


      setWalletAddress(
        wallet.address
      )


      /*
        connectWallet() already returns
        the wallet balance.
      */

      setWalletBalance(
        wallet.balance || '0'
      )


      /*
        Load LendingPool information.
      */

      await loadDashboardData(
        wallet.address
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


  /* ================================
     CALCULATIONS
  ================================= */

  const collateralValue =
    Number(collateral) || 0

  const borrowedValue =
    Number(borrowed) || 0


  const netPosition =
    collateralValue - borrowedValue


  const utilization =
    collateralValue > 0
      ? (borrowedValue / collateralValue) * 100
      : 0


  return (

    <div className="dashboard-page">


      {/* ================================
          PAGE HEADER
      ================================= */}

      <div className="page-header">

        <p className="eyebrow">
          OVERVIEW
        </p>


        <h1>
          Dashboard
        </h1>


        <p className="subtitle">
          Manage your ETH collateral, lending position
          and borrowing activity.
        </p>

      </div>



      {/* ================================
          WALLET CONNECTION
      ================================= */}

      <section className="dashboard-section">

        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <p className="panel-eyebrow">
                WALLET
              </p>


              <h2>

                {walletAddress
                  ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                  : 'Wallet Not Connected'}

              </h2>


              <p>

                {walletAddress
                  ? 'Connected to Sepolia network.'
                  : 'Connect your wallet to view your live portfolio data.'}

              </p>

            </div>


            <button
              type="button"
              className="wallet-btn"
              onClick={handleConnectWallet}
              disabled={loading}
            >

              {loading
                ? 'Connecting...'
                : walletAddress
                  ? 'Refresh Wallet'
                  : 'Connect Wallet'}

            </button>

          </div>


          {walletError && (

            <p className="wallet-error">
              {walletError}
            </p>

          )}

        </div>

      </section>



      {/* ================================
          PORTFOLIO OVERVIEW
      ================================= */}

      <section className="dashboard-section">


        <div className="section-heading">

          <div>

            <h2>
              Portfolio Overview
            </h2>


            <p>
              Your current DeFi lending position.
            </p>

          </div>

        </div>



        <div className="stats-grid">


          {/* ETH BALANCE */}

          <div className="dashboard-card">

            <div className="card-top">

              <span className="card-label">
                ETH Balance
              </span>


              <span className="card-icon">
                Ξ
              </span>

            </div>


            <h3>

              {walletAddress
                ? `${Number(walletBalance).toFixed(6)} ETH`
                : '-- ETH'}

            </h3>


            <p className="card-description">
              Wallet balance
            </p>

          </div>



          {/* SUPPLIED */}

          <div className="dashboard-card">

            <div className="card-top">

              <span className="card-label">
                Supplied
              </span>


              <span className="card-icon">
                ↗
              </span>

            </div>


            <h3>

              {walletAddress
                ? `${collateralValue.toFixed(6)} ETH`
                : '-- ETH'}

            </h3>


            <p className="card-description">
              ETH supplied to protocol
            </p>

          </div>



          {/* BORROWED */}

          <div className="dashboard-card">

            <div className="card-top">

              <span className="card-label">
                Borrowed
              </span>


              <span className="card-icon">
                ↙
              </span>

            </div>


            <h3>

              {walletAddress
                ? `${borrowedValue.toFixed(6)} ETH`
                : '-- ETH'}

            </h3>


            <p className="card-description">
              Outstanding borrowing
            </p>

          </div>



          {/* HEALTH FACTOR */}

          <div className="dashboard-card">

            <div className="card-top">

              <span className="card-label">
                Health Factor
              </span>


              <span className="card-icon">
                ♥
              </span>

            </div>


            <h3>
              --
            </h3>


            <p className="card-description">
              Position safety
            </p>

          </div>


        </div>

      </section>



      {/* ================================
          POSITION + RISK
      ================================= */}

      <section className="dashboard-section">


        <div className="dashboard-two-column">


          {/* POSITION */}

          <div className="dashboard-panel">


            <div className="panel-header">


              <div>

                <p className="panel-eyebrow">
                  POSITION
                </p>


                <h2>
                  Your Position
                </h2>

              </div>


              <span className="status-badge">

                {!walletAddress
                  ? 'Not Connected'
                  : hasPosition
                    ? 'Active Position'
                    : 'No Position'}

              </span>


            </div>



            <div className="position-details">


              {/* COLLATERAL */}

              <div className="detail-row">

                <span>
                  Collateral
                </span>


                <strong>

                  {walletAddress
                    ? `${collateralValue.toFixed(6)} ETH`
                    : '-- ETH'}

                </strong>

              </div>



              {/* BORROWED */}

              <div className="detail-row">

                <span>
                  Borrowed
                </span>


                <strong>

                  {walletAddress
                    ? `${borrowedValue.toFixed(6)} ETH`
                    : '-- ETH'}

                </strong>

              </div>



              {/* UTILIZATION */}

              <div className="detail-row">

                <span>
                  Utilization
                </span>


                <strong>

                  {walletAddress
                    ? `${utilization.toFixed(2)} %`
                    : '-- %'}

                </strong>

              </div>



              {/* HEALTH FACTOR */}

              <div className="detail-row">

                <span>
                  Health Factor
                </span>


                <strong>
                  --
                </strong>

              </div>


            </div>


          </div>



          {/* RISK */}

          <div className="dashboard-panel">


            <div className="panel-header">


              <div>

                <p className="panel-eyebrow">
                  RISK ANALYSIS
                </p>


                <h2>
                  Risk Status
                </h2>

              </div>


              <span className="powered-badge">
                ML POWERED
              </span>


            </div>



            <div className="risk-summary">


              <div className="risk-circle">

                <span>
                  --
                </span>


                <small>
                  Risk Score
                </small>

              </div>



              <div className="risk-info">


                <h3>

                  {walletAddress
                    ? 'Risk analysis pending'
                    : 'Risk analysis unavailable'}

                </h3>


                <p>

                  {walletAddress

                    ? 'Your wallet is connected. Detailed risk analysis will be available when the ML risk engine is integrated.'

                    : 'Connect your wallet and create a lending position to receive your risk assessment.'}

                </p>



                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() =>
                    navigate('/risk-analysis')
                  }
                >
                  View Risk Analysis
                </button>


              </div>


            </div>


          </div>


        </div>


      </section>



      {/* ================================
          QUICK ACTIONS
      ================================= */}

      <section className="dashboard-section">


        <div className="section-heading">


          <div>

            <h2>
              Quick Actions
            </h2>


            <p>
              Manage your lending position.
            </p>

          </div>


        </div>



        <div className="quick-actions">


          {/* LEND */}

          <button
            type="button"
            className="quick-action"
            onClick={() =>
              navigate('/lend')
            }
          >

            <span className="quick-action-icon">
              ↗
            </span>


            <span>

              <strong>
                Lend ETH
              </strong>


              <small>
                Supply ETH and earn returns
              </small>

            </span>


            <span className="arrow">
              →
            </span>

          </button>



          {/* BORROW */}

          <button
            type="button"
            className="quick-action"
            onClick={() =>
              navigate('/borrow')
            }
          >

            <span className="quick-action-icon">
              ↙
            </span>


            <span>

              <strong>
                Borrow
              </strong>


              <small>
                Borrow assets against collateral
              </small>

            </span>


            <span className="arrow">
              →
            </span>

          </button>



          {/* REPAY */}

          <button
            type="button"
            className="quick-action"
            onClick={() =>
              navigate('/repay')
            }
          >

            <span className="quick-action-icon">
              ↻
            </span>


            <span>

              <strong>
                Repay
              </strong>


              <small>
                Manage your outstanding debt
              </small>

            </span>


            <span className="arrow">
              →
            </span>

          </button>


        </div>


      </section>



      {/* ================================
          PROTOCOL INFORMATION
      ================================= */}

      <section className="dashboard-section">


        <div className="protocol-banner">


          <div className="protocol-banner-icon">
            ◆
          </div>


          <div>

            <h3>
              DeFiLend Protocol
            </h3>


            <p>
              Decentralized ETH lending powered by blockchain,
              Chainlink price feeds and intelligent risk analysis.
            </p>

          </div>


          <span className="online-badge">
            ● Online
          </span>


        </div>


      </section>


    </div>

  )

}


export default Dashboard