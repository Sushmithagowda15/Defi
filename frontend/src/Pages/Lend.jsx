import { useState } from 'react'
import {
  BrowserProvider,
  Contract,
  parseEther,
  formatEther,
} from 'ethers'

import { connectWallet } from '../utils/wallet'

import {
  LENDING_POOL_ADDRESS,
  LENDING_POOL_ABI,
} from '../utils/contracts'


function Lend() {

  const [walletAddress, setWalletAddress] = useState('')
  const [walletBalance, setWalletBalance] = useState('')

  const [amount, setAmount] = useState('')
  const [suppliedAmount, setSuppliedAmount] = useState('0')
  const [interestRate, setInterestRate] = useState('0')

  const [walletError, setWalletError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [loading, setLoading] = useState(false)


  // =========================================
  // LOAD LENDING POSITION FROM BLOCKCHAIN
  // =========================================

  const loadLendingPosition = async (address) => {

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


      // Read user's loan/position

      const loan =
        await lendingPool.loans(address)


      setSuppliedAmount(
        formatEther(loan.collateralAmount)
      )


      // Read interest rate

      try {

        const rate =
          await lendingPool.INTEREST_RATE()

        setInterestRate(
          rate.toString()
        )

      } catch (error) {

        console.log(
          'Could not read interest rate:',
          error
        )

      }

    } catch (error) {

      console.error(
        'Failed to load lending position:',
        error
      )

    }

  }


  // =========================================
  // CONNECT WALLET
  // =========================================

  const handleConnectWallet = async () => {

    try {

      setWalletError('')
      setStatusMessage('')
      setLoading(true)


      const wallet =
        await connectWallet()


      setWalletAddress(
        wallet.address
      )


      setWalletBalance(
        wallet.balance || '0'
      )


      await loadLendingPosition(
        wallet.address
      )

    } catch (error) {

      console.error(
        'Wallet connection failed:',
        error
      )


      setWalletError(
        error?.message ||
        'Failed to connect wallet.'
      )

    } finally {

      setLoading(false)

    }

  }


  // =========================================
  // MAX BUTTON
  // =========================================

  const handleMax = () => {

    setWalletError('')
    setStatusMessage('')


    if (!walletAddress) {

      setWalletError(
        'Connect your wallet first.'
      )

      return

    }


    if (!walletBalance) {

      setWalletError(
        'Wallet balance is unavailable.'
      )

      return

    }


    const balance =
      Number(walletBalance)


    if (balance <= 0) {

      setWalletError(
        'Your wallet does not have enough ETH.'
      )

      return

    }


    /*
      Keep a small amount for gas.

      Your wallet currently has around:

      0.000884 ETH

      So 0.001 ETH reserve would be
      larger than your entire balance.

      We use 0.0001 ETH as a small
      demonstration reserve.
    */

    const gasReserve =
      0.0001


    const maxAmount =
      balance - gasReserve


    if (maxAmount <= 0) {

      setWalletError(
        'Your ETH balance is too low to supply while keeping gas.'
      )

      return

    }


    setAmount(
      maxAmount.toFixed(6)
    )

  }


  // =========================================
  // AMOUNT CHANGE
  // =========================================

  const handleAmountChange = (event) => {

    const value =
      event.target.value


    setAmount(value)

    setWalletError('')
    setStatusMessage('')


    if (!value) {
      return
    }


    const enteredAmount =
      Number(value)


    const balance =
      Number(walletBalance)


    if (
      !Number.isFinite(enteredAmount) ||
      enteredAmount <= 0
    ) {

      setWalletError(
        'Please enter an amount greater than 0.'
      )

      return

    }


    /*
      Do not allow the user to enter
      more ETH than the wallet owns.
    */

    if (enteredAmount > balance) {

      setWalletError(
        'Amount exceeds your available ETH balance.'
      )

      return

    }


    /*
      Keep some ETH for gas.

      This prevents the user from trying
      to supply the complete wallet balance.
    */

    const gasReserve =
      0.0001


    if (
      enteredAmount >
      balance - gasReserve
    ) {

      setWalletError(
        `Keep at least ${gasReserve} ETH for gas fees.`
      )

    }

  }


  // =========================================
  // SUPPLY ETH
  // =========================================

  const handleSupply = async () => {

    setWalletError('')
    setStatusMessage('')


    try {

      // ---------------------------------------
      // CHECK METAMASK
      // ---------------------------------------

      if (!window.ethereum) {

        setWalletError(
          'MetaMask is not installed.'
        )

        return

      }


      // ---------------------------------------
      // CONNECT WALLET IF NECESSARY
      // ---------------------------------------

      if (!walletAddress) {

        await handleConnectWallet()

        return

      }


      // ---------------------------------------
      // VALIDATE AMOUNT
      // ---------------------------------------

      if (
        !amount ||
        Number(amount) <= 0
      ) {

        setWalletError(
          'Please enter an ETH amount.'
        )

        return

      }


      const enteredAmount =
        Number(amount)


      const balance =
        Number(walletBalance)


      if (!Number.isFinite(enteredAmount)) {

        setWalletError(
          'Please enter a valid ETH amount.'
        )

        return

      }


      // ---------------------------------------
      // CHECK WALLET BALANCE
      // ---------------------------------------

      if (enteredAmount > balance) {

        setWalletError(
          'Amount exceeds your available ETH balance.'
        )

        return

      }


      // ---------------------------------------
      // GAS RESERVE
      // ---------------------------------------

      const gasReserve =
        0.0001


      if (
        enteredAmount >
        balance - gasReserve
      ) {

        setWalletError(
          `You need to keep at least ${gasReserve} ETH for gas fees.`
        )

        return

      }


      setLoading(true)


      setStatusMessage(
        'Confirm the transaction in MetaMask...'
      )


      // =======================================
      // PROVIDER
      // =======================================

      const provider =
        new BrowserProvider(
          window.ethereum
        )


      // =======================================
      // CHECK CURRENT NETWORK
      // =======================================

      const network =
        await provider.getNetwork()


      console.log(
        'Connected chain:',
        network.chainId.toString()
      )


      // =======================================
      // SIGNER
      // =======================================

      const signer =
        await provider.getSigner()


      // =======================================
      // LENDING POOL CONTRACT
      // =======================================

      const lendingPool =
        new Contract(
          LENDING_POOL_ADDRESS,
          LENDING_POOL_ABI,
          signer
        )


      // =======================================
      // CONVERT ETH TO WEI
      // =======================================

      const value =
        parseEther(amount)


      // =======================================
      // DEPOSIT ETH
      // =======================================

      const transaction =
        await lendingPool.depositCollateral({
          value: value,
        })


      console.log(
        'Transaction hash:',
        transaction.hash
      )


      setStatusMessage(
        'Transaction submitted. Waiting for confirmation...'
      )


      // =======================================
      // WAIT FOR CONFIRMATION
      // =======================================

      await transaction.wait()


      setStatusMessage(
        'ETH supplied successfully!'
      )


      // =======================================
      // CLEAR INPUT
      // =======================================

      setAmount('')


      // =======================================
      // REFRESH WALLET BALANCE
      // =======================================

      const updatedBalance =
        await provider.getBalance(
          walletAddress
        )


      setWalletBalance(
        formatEther(updatedBalance)
      )


      // =======================================
      // REFRESH LENDING POSITION
      // =======================================

      await loadLendingPosition(
        walletAddress
      )


    } catch (error) {

      console.error(
        'Supply transaction failed:',
        error
      )


      setStatusMessage('')


      /*
        Show the most useful error message.
      */

      if (
        error?.code === 'ACTION_REJECTED' ||
        error?.code === 4001
      ) {

        setWalletError(
          'Transaction rejected in MetaMask.'
        )

      } else {

        setWalletError(
          error?.reason ||
          error?.shortMessage ||
          error?.message ||
          'Supply transaction failed.'
        )

      }

    } finally {

      setLoading(false)

    }

  }


  // =========================================
  // DISPLAY VALUES
  // =========================================

  const formattedWalletBalance =
    walletBalance
      ? Number(walletBalance).toFixed(6)
      : '--'


  const formattedSuppliedAmount =
    Number(
      suppliedAmount || 0
    ).toFixed(6)


  // =========================================
  // UI
  // =========================================

  return (

    <div className="lend-page">


      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <div className="page-header">

        <p className="eyebrow">
          LENDING
        </p>

        <h1>
          Lend ETH
        </h1>

        <p className="subtitle">
          Supply ETH to the lending pool and track
          your lending position.
        </p>

      </div>


      <div className="lend-layout">


        {/* =====================================
            MAIN LENDING PANEL
        ===================================== */}

        <div className="lend-panel">


          <div className="lend-panel-header">

            <div>

              <p className="panel-eyebrow">
                SUPPLY ASSET
              </p>

              <h2>
                Deposit ETH
              </h2>

              <p>
                Supply ETH to the LendingPool smart contract.
              </p>

            </div>


            <div className="lend-asset-icon">
              Ξ
            </div>

          </div>


          {/* AVAILABLE BALANCE */}

          <div className="balance-row">

            <span>
              Available Balance
            </span>

            <strong>
              {walletBalance
                ? `${formattedWalletBalance} ETH`
                : '-- ETH'}
            </strong>

          </div>


          {/* AMOUNT INPUT */}

          <div className="amount-section">

            <div className="amount-label-row">

              <label>
                Amount to Supply
              </label>

              <span>

                Balance:{' '}

                {walletBalance
                  ? `${formattedWalletBalance} ETH`
                  : '-- ETH'}

              </span>

            </div>


            <div className="amount-input">

              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.000001"
                value={amount}
                onChange={handleAmountChange}
              />


              <button
                type="button"
                className="asset-selector"
                onClick={handleMax}
              >

                <span>
                  Ξ
                </span>

                ETH

                <span className="selector-arrow">
                  MAX
                </span>

              </button>

            </div>

          </div>


          {/* LENDING INFORMATION */}

          <div className="lend-info-grid">


            <div className="lend-info-card">

              <span>
                Interest Rate
              </span>

              <strong>
                {interestRate}%
              </strong>

            </div>


            <div className="lend-info-card">

              <span>
                Total Supplied
              </span>

              <strong>
                --
              </strong>

              <small>
                Not available in contract
              </small>

            </div>


            <div className="lend-info-card">

              <span>
                Your Supplied
              </span>

              <strong>
                {formattedSuppliedAmount} ETH
              </strong>

            </div>


          </div>


          {/* SUPPLY BUTTON */}

          <button
            type="button"
            className="lend-submit-btn"
            onClick={handleSupply}
            disabled={loading}
          >

            {loading
              ? 'Processing...'
              : walletAddress
                ? 'Supply ETH'
                : 'Connect Wallet'}

          </button>


          {/* CONNECTED ADDRESS */}

          {walletAddress && (

            <p className="transaction-note">

              Connected:{' '}

              {walletAddress.slice(0, 6)}
              ...
              {walletAddress.slice(-4)}

            </p>

          )}


          {/* ERROR */}

          {walletError && (

            <p className="wallet-error">
              {walletError}
            </p>

          )}


          {/* TRANSACTION STATUS */}

          {statusMessage && (

            <p className="transaction-note">
              {statusMessage}
            </p>

          )}


          {/* INITIAL MESSAGE */}

          {!walletAddress &&
            !walletError &&
            !statusMessage && (

              <p className="transaction-note">

                Connect your wallet before supplying ETH.

              </p>

            )}

        </div>


        {/* =====================================
            RIGHT SIDE
        ===================================== */}

        <div className="lend-side">


          {/* YOUR POSITION */}

          <div className="lend-side-panel">

            <div className="side-panel-header">

              <div>

                <p className="panel-eyebrow">
                  YOUR POSITION
                </p>

                <h3>
                  Lending Position
                </h3>

              </div>


              <span className="position-status">

                {walletAddress
                  ? 'CONNECTED'
                  : 'INACTIVE'}

              </span>

            </div>


            <div className="lend-position">


              <div className="lend-position-row">

                <span>
                  Supplied
                </span>

                <strong>
                  {formattedSuppliedAmount} ETH
                </strong>

              </div>


              <div className="lend-position-row">

                <span>
                  Interest Rate
                </span>

                <strong>
                  {interestRate}%
                </strong>

              </div>


              <div className="lend-position-row">

                <span>
                  Borrowed
                </span>

                <strong>
                  --
                </strong>

              </div>


            </div>

          </div>


          {/* HOW IT WORKS */}

          <div className="lend-side-panel">

            <div className="side-panel-header">

              <div>

                <p className="panel-eyebrow">
                  HOW IT WORKS
                </p>

                <h3>
                  Lending Process
                </h3>

              </div>

            </div>


            <div className="lending-steps">


              <div className="lending-step">

                <div className="step-number">
                  01
                </div>

                <div>

                  <strong>
                    Connect Wallet
                  </strong>

                  <p>
                    Connect MetaMask to the application.
                  </p>

                </div>

              </div>


              <div className="lending-step">

                <div className="step-number">
                  02
                </div>

                <div>

                  <strong>
                    Deposit ETH
                  </strong>

                  <p>
                    Supply ETH directly to the LendingPool.
                  </p>

                </div>

              </div>


              <div className="lending-step">

                <div className="step-number">
                  03
                </div>

                <div>

                  <strong>
                    Track Position
                  </strong>

                  <p>
                    View your deposited collateral from the blockchain.
                  </p>

                </div>

              </div>


            </div>

          </div>


        </div>

      </div>


      {/* =====================================
          PROTOCOL NOTE
      ===================================== */}

      <div className="lend-protocol-note">

        <div className="lend-protocol-icon">
          ◆
        </div>

        <div>

          <strong>
            Powered by DeFiLend
          </strong>

          <p>
            Your lending position and contract interest
            rate are retrieved from the deployed LendingPool
            smart contract.
          </p>

        </div>

      </div>


    </div>

  )

}


export default Lend