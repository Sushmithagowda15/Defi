import { useEffect, useState } from 'react'



import {

  BrowserProvider,

  Contract,

  formatEther,

  formatUnits,

  parseUnits,

} from 'ethers'







import { useWallet } from '../context/WalletContext'



import {

  LENDING_POOL_ADDRESS,

  LENDING_POOL_ABI,

  MOCK_USDC_ADDRESS,

  MOCK_USDC_ABI,

} from '../utils/contracts'







function Repay() {

  const { walletAddress, walletError } = useWallet()







  const [collateral, setCollateral] = useState('0')



  const [borrowed, setBorrowed] = useState('0')
  const [accruedInterest, setAccruedInterest] = useState('0')
  const [healthFactor, setHealthFactor] = useState('--')
  const [usdcBalance, setUsdcBalance] = useState('0')



  const [active, setActive] = useState(false)







  const [repayAmount, setRepayAmount] = useState('')

const [statusMessage, setStatusMessage] = useState('')
  const [isRepaying, setIsRepaying] = useState(false)







  const loadRepayData = async (address) => {



    try {



      if (!window.ethereum || !address) {



        return



      }







      const provider = new BrowserProvider(window.ethereum)







      const lendingPool = new Contract(



        LENDING_POOL_ADDRESS,



        LENDING_POOL_ABI,



        provider



      )







      // Read user's loan from LendingPool



      const loan = await lendingPool.loans(address)

      const collateralAmount = formatEther(

        loan.collateralAmount

      )

const currentDebt = await lendingPool.getCurrentDebt(address)
const borrowedAmount = formatUnits(currentDebt, 6)


// Calculate accrued interest in USDC
const principal = loan.borrowedAmount

const interest =
  currentDebt > principal
    ? currentDebt - principal
    : 0n

setAccruedInterest(formatUnits(interest, 6))

// Read the actual Health Factor from LendingPool
if (currentDebt === 0n) {
  setHealthFactor('∞')
} else {
  const factor = await lendingPool.getHealthFactor(address)
  setHealthFactor(formatUnits(factor, 18))
}


const usdc = new Contract(
  MOCK_USDC_ADDRESS,
  MOCK_USDC_ABI,
  provider
)

const balance = await usdc.balanceOf(address)
setUsdcBalance(formatUnits(balance, 6))


      setCollateral(collateralAmount)



      setBorrowed(borrowedAmount)



      setActive(loan.active)







      console.log('Repay data:')



      console.log('Collateral:', collateralAmount)



      console.log('Borrowed:', borrowedAmount)



      console.log('Active:', loan.active)







    } catch (error) {



      console.error(



        'Failed to load repayment data:',



        error



      )







      setStatusMessage(



        'Failed to load your borrowing position.'



      )



    }



  }







  // =========================================================

  // LOAD DATA WHEN GLOBAL WALLET CHANGES

  // =========================================================



  useEffect(() => {

    if (!walletAddress) {
      setAccruedInterest('0')
      setHealthFactor('--')

      setCollateral('0')

      setBorrowed('0')

      setActive(false)

      setRepayAmount('')

      setStatusMessage('')

      return

    }



    setRepayAmount('')

    setStatusMessage('')

    loadRepayData(walletAddress)

  }, [walletAddress])







  // Handle repayment input



  // Handle repayment input



  const handleRepayAmountChange = (event) => {



    const value = event.target.value







    if (value === '') {



      setRepayAmount('')



      return



    }







    if (Number(value) < 0) {



      return



    }







    setRepayAmount(value)



  }







  // Percentage repayment shortcuts



  const handlePercentage = (percentage) => {



    if (!walletAddress) {



      setStatusMessage('Please connect your wallet first.')



      return



    }







    const debt = Number(borrowed)







    if (debt <= 0) {



      setStatusMessage('You do not have any outstanding debt.')



      return



    }







    const amount = debt * percentage







    setRepayAmount(amount.toFixed(6))



    setStatusMessage('')



  }







  // MAX repayment

const handleMaxRepay = () => {
  if (!walletAddress) {
    setStatusMessage('Please connect your wallet first.')
    return
  }

  const debt = Number(borrowed)
  const balance = Number(usdcBalance)

  if (debt <= 0) {
    setStatusMessage('You do not have any outstanding debt.')
    return
  }

  if (balance <= 0) {
    setStatusMessage('You do not have any USDC available to repay.')
    return
  }

  const maxAmount = Math.min(debt, balance)

  setRepayAmount(maxAmount.toFixed(6))
  setStatusMessage('')
}


  // Calculate remaining debt



  const repaymentNumber =



    Number(repayAmount) || 0







  const borrowedNumber =



    Number(borrowed) || 0







  const afterRepayment = Math.max(



    borrowedNumber - repaymentNumber,



    0



  )







  // Prevent entering more than debt





const handleRepaySubmit = async () => {
  console.log("REPAY BUTTON CLICKED");
    if (isRepaying) return

    try {
      setStatusMessage('')

      if (!walletAddress) {
        setStatusMessage('Please connect your wallet first.')
        return
      }

      if (!repayAmount || !Number.isFinite(Number(repayAmount)) || Number(repayAmount) <= 0) {
        setStatusMessage('Please enter a valid repayment amount.')
        return
      }

      if (repayAmount.includes('.') && repayAmount.split('.')[1].length > 6) {
        setStatusMessage('USDC supports a maximum of 6 decimal places.')
        return
      }

      if (!window.ethereum) {
        setStatusMessage('MetaMask was not found.')
        return
      }

      setIsRepaying(true)
      const provider = new BrowserProvider(window.ethereum)
      const network = await provider.getNetwork()

      if (network.chainId !== 11155111n) {
        setStatusMessage('Please switch MetaMask to the Sepolia network.')
        return
      }

      const signer = await provider.getSigner()
      console.log("STEP 1: Signer connected");
      const signerAddress = await signer.getAddress()

      if (signerAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        setStatusMessage('Your connected wallet changed. Please reconnect and try again.')
        return
      }

      const lendingPool = new Contract(
        LENDING_POOL_ADDRESS,
        LENDING_POOL_ABI,
        signer
      )
      const usdc = new Contract(
        MOCK_USDC_ADDRESS,
        MOCK_USDC_ABI,
        signer
      )

      const amount = parseUnits(repayAmount, 6)
      console.log("STEP 2: USDC amount parsed", amount.toString());
      const currentDebt = await lendingPool.getCurrentDebt(walletAddress)

      if (amount > currentDebt) {
        setStatusMessage(
          `Repayment cannot exceed your current debt of ${formatUnits(currentDebt, 6)} USDC.`
        )
        return
      }

      const balance = await usdc.balanceOf(walletAddress)
      if (balance < amount) {
        setStatusMessage(
          `Insufficient USDC balance. Your balance is ${formatUnits(balance, 6)} USDC.`
        )
        return
      }
      console.log("STEP 3: Checking USDC allowance");
      
      const allowance = await usdc.allowance(
  walletAddress,
  LENDING_POOL_ADDRESS
);

console.log("USDC allowance:", allowance.toString());
      if (allowance < amount) {
        setStatusMessage('Approve USDC spending in MetaMask...')
        const approvalTx = await usdc.approve(LENDING_POOL_ADDRESS, amount)
        await approvalTx.wait()
      }

      // Simulate after approval so transferFrom has sufficient allowance.
      await lendingPool.repay.staticCall(amount)

      setStatusMessage('Confirm the repayment in MetaMask...')
      const tx = await lendingPool.repay(amount)
      setStatusMessage('Repayment submitted. Waiting for confirmation...')
      const receipt = await tx.wait()

      if (!receipt || receipt.status !== 1) {
        throw new Error('The repayment transaction was not confirmed successfully.')
      }

      setRepayAmount('')
      await loadRepayData(walletAddress)
      setStatusMessage('Repayment successful. Your debt has been refreshed.')
    } catch (error) {
      console.error('Repayment failed:', error)
      setStatusMessage(
        error?.reason ||
        error?.shortMessage ||
        error?.info?.error?.message ||
        error?.message ||
        'Repayment failed. Check the console for details.'
      )
    } finally {
      setIsRepaying(false)
    }
  }




  return (



    <div className="repay-page">







      {/* ================================



          PAGE HEADER



          ================================ */}







      <div className="page-header">







        <p className="eyebrow">



          LENDING



        </p>







        <h1>



          Repay



        </h1>







        <p className="subtitle">



          Repay your outstanding borrowed assets and manage your debt.



        </p>







      </div>











      {/* ================================



          MAIN LAYOUT



          ================================ */}







      <div className="repay-layout">











        {/* ================================



            REPAY PANEL



            ================================ */}







        <div className="repay-panel">







          <div className="repay-panel-header">







            <div>







              <p className="panel-eyebrow">



                REPAY ASSET



              </p>







              <h2>



                Repay Borrowed USDC



              </h2>







              <p>



                Repay your outstanding debt to reduce your borrowing position.



              </p>







            </div>







            <div className="repay-asset-icon">



              $



            </div>







          </div>











          {/* ================================



              OUTSTANDING DEBT



              ================================ */}







          <div className="debt-box">







            <div className="debt-header">







              <div>







                <span>



                  Outstanding Debt



                </span>







                <strong>



                  {walletAddress



                    ? `${borrowedNumber.toFixed(6)} USDC`



                    : '-- USDC'}



                </strong>







              </div>







              <div className="debt-status">







                {walletAddress



                  ? active



                    ? 'ACTIVE'



                    : 'INACTIVE'



                  : 'INACTIVE'}







              </div>







            </div>











            <div className="debt-details">







              <div>







                <span>



                  Borrowed



                </span>







                <strong>



                  {walletAddress



                    ? `${borrowedNumber.toFixed(6)} USDC`



                    : '-- USDC'}



                </strong>







              </div>











              <div>







                <span>



                  Accrued Interest



                </span>
                
                <strong>
  {walletAddress
    ? `${Number(accruedInterest).toFixed(6)} USDC`
    : '-- USDC'}
</strong>
              </div>











              <div>







                <span>



                  Total Due



                </span>







                <strong>



                  {walletAddress



                    ? `${borrowedNumber.toFixed(6)} USDC`



                    : '-- USDC'}



                </strong>







              </div>







            </div>







          </div>











          {/* ================================



              REPAYMENT AMOUNT



              ================================ */}







          <div className="repay-amount-section">







            <div className="repay-label-row">







              <label>



                Amount to Repay



              </label>







              <span>



                Outstanding:{' '}



                {walletAddress



                  ? `${borrowedNumber.toFixed(6)} USDC`



                  : '-- USDC'}



              </span>







            </div>











            <div className="repay-input">







              <input



                type="number"



                placeholder="0.00"



                min="0"



                step="0.000001"
                max={borrowedNumber}



                value={repayAmount}



                onChange={handleRepayAmountChange}



              />







              <button



                type="button"



                className="repay-asset-selector"



              >







                <span>



                  $



                </span>







                USDC







                <span className="repay-selector-arrow">



                  ⌄



                </span>







              </button>







            </div>











            {/* Percentage shortcuts */}







            <div className="repay-shortcuts">







              <button



                type="button"



                onClick={() => handlePercentage(0.25)}



              >



                25%



              </button>







              <button



                type="button"



                onClick={() => handlePercentage(0.50)}



              >



                50%



              </button>







              <button



                type="button"



                onClick={() => handlePercentage(0.75)}



              >



                75%



              </button>







              <button



                type="button"



                onClick={handleMaxRepay}



              >



                MAX



              </button>







            </div>







          </div>











          {/* ================================



              REPAYMENT INFORMATION



              ================================ */}







          <div className="repay-info-grid">







            <div className="repay-info-card">







              <span>



                Current Debt



              </span>







              <strong>



                {walletAddress



                  ? `${borrowedNumber.toFixed(6)} USDC`



                  : '-- USDC'}



              </strong>







            </div>











            <div className="repay-info-card">







              <span>



                Borrow APY



              </span>







              <strong>



                -- %



              </strong>







            </div>











            <div className="repay-info-card">







              <span>



                After Repayment



              </span>







              <strong>



                {walletAddress



                  ? `${afterRepayment.toFixed(6)} USDC`



                  : '-- USDC'}



              </strong>







            </div>







          </div>











          {/* ================================



              HEALTH FACTOR



              ================================ */}







          <div className="repay-health-box">







            <div className="repay-health-icon">



              ♥



            </div>







            <div className="repay-health-content">







              <div className="repay-health-heading">







                <span>



                  Health Factor



                </span>







                <strong>
  {walletAddress
    ? healthFactor === '∞'
      ? '∞'
      : Number(healthFactor).toFixed(2)
    : '--'}
</strong>






              </div>







              <div className="repay-health-bar">







                <div className="repay-health-fill"></div>







              </div>







              <p>



                Repaying your debt can improve your health factor



                and reduce liquidation risk.



              </p>







            </div>







          </div>











          {/* ================================



              ACTION BUTTON



              ================================ */}







          <button



            type="button"



            className="repay-submit-btn"



            onClick={handleRepaySubmit}

            disabled={isRepaying || borrowedNumber <= 0}

          >

            {isRepaying ? 'Processing...' : 'Repay USDC'}







          </button>











          <p className="repay-note">







            {

              walletAddress

                ? 'Your debt and collateral data are being read from the LendingPool contract.'

                : 'Connect your wallet from the top navigation to view your debt and make a repayment.'

            }







          </p>







        </div>











        {/* ================================



            RIGHT SIDE



            ================================ */}







        <div className="repay-side">











          {/* ================================



              CURRENT POSITION



              ================================ */}







          <div className="repay-side-panel">







            <div className="side-panel-header">







              <div>







                <p className="panel-eyebrow">



                  YOUR POSITION



                </p>







                <h3>



                  Debt Position



                </h3>







              </div>







              <span className="repay-position-status">







                {walletAddress



                  ? active



                    ? 'ACTIVE'



                    : 'INACTIVE'



                  : 'INACTIVE'}







              </span>







            </div>











            <div className="repay-position">







              <div className="repay-position-row">







                <span>



                  Collateral



                </span>







                <strong>



                  {walletAddress



                    ? `${Number(collateral).toFixed(6)} ETH`



                    : '-- ETH'}



                </strong>







              </div>











              <div className="repay-position-row">







                <span>



                  Outstanding Debt



                </span>







                <strong>



                  {walletAddress



                    ? `${borrowedNumber.toFixed(6)} USDC`



                    : '-- USDC'}



                </strong>







              </div>











              <div className="repay-position-row">







                <span>



                  Borrow APY



                </span>







                <strong>



                  -- %



                </strong>







              </div>











              <div className="repay-position-row">







                <span>



                  Health Factor



                </span>







                <strong>
  {walletAddress
    ? healthFactor === '∞'
      ? '∞'
      : Number(healthFactor).toFixed(2)
    : '--'}
</strong>






              </div>







            </div>







          </div>











          {/* ================================



              REPAYMENT GUIDE



              ================================ */}







          <div className="repay-side-panel">







            <div className="side-panel-header">







              <div>







                <p className="panel-eyebrow">



                  REPAYMENT GUIDE



                </p>







                <h3>



                  How Repayment Works



                </h3>







              </div>







            </div>











            <div className="repayment-steps">







              <div className="repayment-step">







                <div className="repay-step-number">



                  01



                </div>







                <div>







                  <strong>



                    Check Your Debt



                  </strong>







                  <p>



                    Review your outstanding borrowed amount and interest.



                  </p>







                </div>







              </div>











              <div className="repayment-step">







                <div className="repay-step-number">



                  02



                </div>







                <div>







                  <strong>



                    Choose Amount



                  </strong>







                  <p>



                    Repay part or all of your outstanding debt.



                  </p>







                </div>







              </div>











              <div className="repayment-step">







                <div className="repay-step-number">



                  03



                </div>







                <div>







                  <strong>



                    Reduce Your Debt



                  </strong>







                  <p>



                    Your borrowing position updates after confirmation.



                  </p>







                </div>







              </div>







            </div>







          </div>







        </div>







      </div>











      {/* ================================



          INFORMATION



          ================================ */}







      <div className="repay-info-note">







        <div className="repay-info-icon">



          ◆



        </div>







        <div>







          <strong>



            Why repay your loan?



          </strong>







          <p>



            Repaying your borrowed assets reduces outstanding debt,



            lowers interest exposure and can improve your overall



            collateral health.



          </p>







        </div>







      </div>











      {/* ================================



          ERROR / STATUS



          ================================ */}







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







export default Repay