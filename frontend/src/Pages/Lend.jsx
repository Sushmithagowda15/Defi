import { useEffect, useState } from 'react'
import {
  BrowserProvider,
  Contract,
  parseEther,
  formatEther,
  parseUnits,
  formatUnits,
} from 'ethers'

import { useWallet } from '../context/WalletContext'

import {
  LENDING_POOL_ADDRESS,
  LENDING_POOL_ABI,
} from '../utils/contracts'


function Lend() {

  const { walletAddress, walletError } = useWallet()
  const [formError, setFormError] = useState('')
  const [walletBalance, setWalletBalance] = useState('')

  const [amount, setAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [suppliedAmount, setSuppliedAmount] = useState('0')
  const [borrowAmount, setBorrowAmount] = useState('')
  const [borrowedAmount, setBorrowedAmount] = useState('0')
  const [interestRate, setInterestRate] = useState('0')

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


    useEffect(() => {
      console.log('Lend effect started; wallet:', walletAddress)
    if (!walletAddress) {
      setWalletBalance('')
      setSuppliedAmount('0')
      setInterestRate('0')
      return
    }

    const loadWalletData = async () => {
      try {
        setLoading(true)

        if (!window.ethereum) {
          return
        }

        const provider = new BrowserProvider(window.ethereum)

        const network = await provider.getNetwork()
        const balance = await provider.getBalance(walletAddress)

        console.log('Wallet address:', walletAddress)
        console.log('Network chain ID:', network.chainId.toString())
        console.log('Raw ETH balance:', balance.toString())
        console.log('Formatted ETH balance:', formatEther(balance))

        setWalletBalance(formatEther(balance))

        await loadLendingPosition(walletAddress)
      } catch (error) {
        console.error('Failed to load wallet data:', error)
        setStatusMessage(
          error?.message || 'Failed to load wallet data.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadWalletData()
  }, [walletAddress])


  // =========================================
  // MAX BUTTON
  // =========================================

  const handleMax = () => {

    setFormError('')
    setStatusMessage('')


    if (!walletAddress) {

      setStatusMessage('Connect your wallet first.')

      return

    }


    if (!walletBalance) {

      setStatusMessage('Wallet balance is unavailable.')
      return

    }


    const balance =
      Number(walletBalance)


    if (balance <= 0) {

      setStatusMessage('Your wallet does not have enough ETH.')

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

      setFormError(
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

    setFormError('')
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

      setFormError(
        'Please enter an amount greater than 0.'
      )

      return

    }


    /*
      Do not allow the user to enter
      more ETH than the wallet owns.
    */

    if (enteredAmount > balance) {

      setFormError(
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

      setFormError(
        `Keep at least ${gasReserve} ETH for gas fees.`
      )

    }

  }


  // =========================================
  // SUPPLY ETH
  // =========================================

  const handleSupply = async () => {

    setFormError('')
    setStatusMessage('')


    try {

      // ---------------------------------------
      // CHECK METAMASK
      // ---------------------------------------

      if (!window.ethereum) {

        setStatusMessage('MetaMask is not installed.')

        return

      }


      // ---------------------------------------
      // CONNECT WALLET IF NECESSARY
      // ---------------------------------------

      if (!walletAddress) {
        setStatusMessage('Connect your wallet from the top navigation first.')
        return
      }


      // ---------------------------------------
      // VALIDATE AMOUNT
      // ---------------------------------------

      if (
        !amount ||
        Number(amount) <= 0
      ) {

        setStatusMessage('Please enter an ETH amount.')

        return

      }


      const enteredAmount =
        Number(amount)


      const balance =
        Number(walletBalance)


      if (!Number.isFinite(enteredAmount)) {

        setFormError(
          'Please enter a valid ETH amount.'
        )

        return

      }


      // ---------------------------------------
      // CHECK WALLET BALANCE
      // ---------------------------------------

      if (enteredAmount > balance) {

        setStatusMessage('Amount exceeds your available ETH balance.')

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

        setFormError(
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

        setFormError(
          'Transaction rejected in MetaMask.'
        )

      } else {

        setFormError(
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
  // WITHDRAW COLLATERAL
  // =========================================

  const handleWithdraw = async () => {
    setFormError('')
    setStatusMessage('')
    setLoading(true)

    try {
      if (!window.ethereum) {
        setFormError('MetaMask is not installed.')
        return
      }

      if (!walletAddress) {
        setFormError('Connect your wallet first.')
        return
      }

      if (
        !withdrawAmount ||
        !Number.isFinite(Number(withdrawAmount)) ||
        Number(withdrawAmount) <= 0
      ) {
        setFormError('Enter a withdrawal amount greater than zero.')
        return
      }

      if (Number(withdrawAmount) > Number(suppliedAmount)) {
        setFormError('Withdrawal amount exceeds your supplied collateral.')
        return
      }

      const provider = new BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()

      if (network.chainId !== 11155111n) {
        setFormError('Switch MetaMask to Sepolia before withdrawing.')
        return
      }

      const signer = await provider.getSigner()

      const lendingPool = new Contract(
        LENDING_POOL_ADDRESS,
        LENDING_POOL_ABI,
        signer
      )

      const transaction = await lendingPool.withdrawCollateral(
        parseEther(withdrawAmount)
      )

      setStatusMessage(
        'Withdrawal submitted. Waiting for confirmation...'
      )

      await transaction.wait()

      setStatusMessage('Collateral withdrawn successfully!')
      setWithdrawAmount('')

      const updatedBalance = await provider.getBalance(walletAddress)
      setWalletBalance(formatEther(updatedBalance))

      await loadLendingPosition(walletAddress)

    } catch (error) {
      console.error('Withdraw transaction failed:', error)

      if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
        setFormError('Transaction rejected in MetaMask.')
      } else {
        setFormError(
          error?.reason ||
          error?.shortMessage ||
          error?.message ||
          'Withdrawal failed.'
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


          {/* WITHDRAW COLLATERAL */}

          <div className="amount-section">

            <div className="amount-label-row">

              <label>
                Amount to Withdraw
              </label>

              <span>
                Supplied: {formattedSuppliedAmount} ETH
              </span>

            </div>

            <div className="amount-input">

              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.000001"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />

              <button
                type="button"
                className="asset-selector"
                onClick={() => setWithdrawAmount(suppliedAmount)}
              >
                <span>Ξ</span>
                ETH
                <span className="selector-arrow">
                  MAX
                </span>
              </button>

            </div>

            <button
              type="button"
              className="lend-submit-btn"
              onClick={handleWithdraw}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Withdraw ETH'}
            </button>

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

            {loading ? 'Processing...' : 'Supply ETH'}

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

          {(walletError || formError) && (

            <p className="wallet-error">
              {walletError || formError}
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
            !formError &&
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