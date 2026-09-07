import { Link } from 'react-router-dom'
import './Terms.css'

function Terms() {
  return (
    <div className="terms-page">

      {/* =========================================
          TOP NAVIGATION
          ========================================= */}

      <header className="terms-nav">

        <Link to="/" className="terms-brand">

          <div className="terms-brand-icon">
            ◆
          </div>

          <div>
            <h2>DeFiLend</h2>
            <span>ETH Lending Protocol</span>
          </div>

        </Link>

        <Link
          to="/"
          className="terms-back-link"
        >
          ← Back to Welcome
        </Link>

      </header>


      {/* =========================================
          PAGE HEADER
          ========================================= */}

      <section className="terms-hero">

        <div className="terms-hero-badge">
          PROTOCOL DOCUMENT
        </div>

        <h1>
          Terms & Conditions
        </h1>

        <p>
          Please review the rules, responsibilities and
          risk conditions that apply when using the
          DeFiLend lending protocol.
        </p>

        <div className="terms-testnet-label">
          <span></span>
          Ethereum Sepolia Testnet
        </div>

      </section>


      {/* =========================================
          IMPORTANT NOTICE
          ========================================= */}

      <section className="terms-container">

        <div className="terms-important">

          <div className="important-icon">
            !
          </div>

          <div>

            <strong>
              Important information
            </strong>

            <p>
              DeFiLend is an academic decentralized
              lending project deployed on the Ethereum
              Sepolia test network. The protocol rules
              described below represent the intended
              rules of the system. Their enforcement
              depends on the functionality implemented
              in the deployed smart contract.
            </p>

          </div>

        </div>


        {/* =========================================
            PROTOCOL SUMMARY
            ========================================= */}

        <div className="terms-summary">

          <div className="summary-item">

            <span>
              MAX LTV
            </span>

            <strong>
              80%
            </strong>

          </div>

          <div className="summary-item">

            <span>
              INTEREST
            </span>

            <strong>
              5%
            </strong>

          </div>

          <div className="summary-item">

            <span>
              LOAN TERM
            </span>

            <strong>
              30 Days
            </strong>

          </div>

          <div className="summary-item">

            <span>
              GRACE PERIOD
            </span>

            <strong>
              3 Days
            </strong>

          </div>

          <div className="summary-item">

            <span>
              LATE PENALTY
            </span>

            <strong>
              1%
            </strong>

          </div>

          <div className="summary-item">

            <span>
              LIQUIDATION
            </span>

            <strong>
              HF &lt; 1.0
            </strong>

          </div>

        </div>


        {/* =========================================
            01 — PURPOSE
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            01
          </span>

          <div className="terms-section-content">

            <h2>
              Purpose of the Protocol
            </h2>

            <p>
              DeFiLend is designed to demonstrate
              decentralized lending using blockchain
              smart contracts. Users can deposit ETH
              as collateral and borrow USDC against
              the value of that collateral, subject
              to the protocol's risk and borrowing
              rules.
            </p>

          </div>

        </div>


        {/* =========================================
            02 — ELIGIBILITY
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            02
          </span>

          <div className="terms-section-content">

            <h2>
              Eligibility
            </h2>

            <p>
              To use the borrowing functionality,
              a user must:
            </p>

            <ul>
              <li>
                Have a compatible Ethereum wallet
                such as MetaMask.
              </li>

              <li>
                Connect the wallet to the Ethereum
                Sepolia test network.
              </li>

              <li>
                Have sufficient ETH available for
                collateral and gas fees.
              </li>

              <li>
                Maintain sufficient collateral to
                satisfy the protocol's LTV requirements.
              </li>

              <li>
                Agree to these Terms & Conditions.
              </li>
            </ul>

          </div>

        </div>


        {/* =========================================
            03 — COLLATERAL
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            03
          </span>

          <div className="terms-section-content">

            <h2>
              Collateral
            </h2>

            <p>
              ETH deposited by the borrower is treated
              as collateral for the loan. The collateral
              is intended to be held by the DeFiLend
              LendingPool smart contract.
            </p>

            <p>
              The frontend application does not have
              direct authority to move, withdraw or
              seize user collateral independently of
              the smart contract.
            </p>

          </div>

        </div>


        {/* =========================================
            04 — LTV
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            04
          </span>

          <div className="terms-section-content">

            <h2>
              Maximum Loan-to-Value (LTV)
            </h2>

            <div className="rule-card">

              <span>
                MAXIMUM LTV
              </span>

              <strong>
                80%
              </strong>

            </div>

            <p>
              A borrower may borrow up to 80% of the
              USD value of eligible ETH collateral,
              subject to the protocol's available
              borrowing capacity and risk rules.
            </p>

            <p>
              For example, if eligible collateral is
              valued at $1,000, the maximum borrowing
              capacity at an 80% LTV is $800.
            </p>

          </div>

        </div>


        {/* =========================================
            05 — INTEREST
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            05
          </span>

          <div className="terms-section-content">

            <h2>
              Interest Rate
            </h2>

            <div className="rule-card">

              <span>
                FIXED INTEREST RATE
              </span>

              <strong>
                5%
              </strong>

            </div>

            <p>
              The proposed protocol uses a fixed 5%
              interest rate for borrowing.
            </p>

            <p>
              The final calculation and accumulation
              of interest must be implemented and
              enforced by the deployed lending smart
              contract.
            </p>

          </div>

        </div>


        {/* =========================================
            06 — LOAN DURATION
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            06
          </span>

          <div className="terms-section-content">

            <h2>
              Loan Duration
            </h2>

            <div className="rule-card">

              <span>
                MAXIMUM LOAN DURATION
              </span>

              <strong>
                30 Days
              </strong>

            </div>

            <p>
              A borrower is expected to repay the
              outstanding loan within 30 days from
              the applicable loan start time.
            </p>

            <p>
              The loan start time and repayment
              deadline should be determined using
              blockchain timestamps within the
              smart contract.
            </p>

          </div>

        </div>


        {/* =========================================
            07 — GRACE PERIOD
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            07
          </span>

          <div className="terms-section-content">

            <h2>
              Grace Period
            </h2>

            <div className="rule-card">

              <span>
                GRACE PERIOD
              </span>

              <strong>
                3 Days
              </strong>

            </div>

            <p>
              After the 30-day repayment deadline,
              the borrower receives a proposed
              three-day grace period to repay the
              outstanding amount.
            </p>

            <p>
              During this period, the position may
              remain active subject to the protocol's
              risk conditions.
            </p>

          </div>

        </div>


        {/* =========================================
            08 — LATE PENALTY
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            08
          </span>

          <div className="terms-section-content">

            <h2>
              Late Repayment Penalty
            </h2>

            <div className="rule-card warning-rule">

              <span>
                LATE PENALTY
              </span>

              <strong>
                1%
              </strong>

            </div>

            <p>
              If the borrower does not repay within
              the permitted repayment period, a
              proposed penalty of 1% of the outstanding
              debt may apply.
            </p>

            <p>
              The smart contract must calculate and
              enforce this penalty for it to have
              actual effect on-chain.
            </p>

          </div>

        </div>


        {/* =========================================
            09 — HEALTH FACTOR
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            09
          </span>

          <div className="terms-section-content">

            <h2>
              Health Factor
            </h2>

            <div className="rule-card danger-rule">

              <span>
                UNSAFE POSITION
              </span>

              <strong>
                HF &lt; 1.0
              </strong>

            </div>

            <p>
              The Health Factor is a risk indicator
              used to determine whether a borrower's
              position remains adequately collateralized.
            </p>

            <p>
              A Health Factor below 1.0 indicates that
              the position has become unsafe according
              to the proposed protocol rules.
            </p>

            <p>
              The exact Health Factor calculation and
              scaling must be defined and enforced by
              the deployed lending smart contract.
            </p>

          </div>

        </div>


        {/* =========================================
            10 — LIQUIDATION
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            10
          </span>

          <div className="terms-section-content">

            <h2>
              Liquidation
            </h2>

            <p>
              A loan may become eligible for
              liquidation when one of the following
              conditions is satisfied:
            </p>

            <ul>
              <li>
                The Health Factor falls below 1.0.
              </li>

              <li>
                The applicable repayment and grace
                period has expired.
              </li>
            </ul>

            <p>
              Liquidation is intended to protect the
              lending pool from under-collateralized
              positions.
            </p>

            <p>
              The exact liquidation process, including
              how much collateral can be liquidated
              and any liquidation incentive, must be
              implemented by the smart contract.
            </p>

          </div>

        </div>


        {/* =========================================
            11 — COLLATERAL AUTHORITY
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            11
          </span>

          <div className="terms-section-content">

            <h2>
              Collateral Authority
            </h2>

            <p>
              The LendingPool smart contract is the
              intended on-chain custodian and controller
              of deposited collateral.
            </p>

            <p>
              The frontend does not own user funds and
              should not be capable of arbitrarily
              transferring user collateral.
            </p>

            <p>
              Blockchain consensus provides the
              underlying transaction security, while
              the deployed smart contract enforces
              the protocol's programmed rules.
            </p>

          </div>

        </div>


        {/* =========================================
            12 — PRICE ORACLE
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            12
          </span>

          <div className="terms-section-content">

            <h2>
              Price Oracle & Risk Data
            </h2>

            <p>
              The protocol is designed to use Chainlink
              ETH/USD price data to determine the USD
              value of ETH collateral.
            </p>

            <p>
              Oracle data may be used for collateral
              valuation, borrowing capacity, Health
              Factor calculations and liquidation
              decisions.
            </p>

          </div>

        </div>


        {/* =========================================
            13 — REPAYMENT
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            13
          </span>

          <div className="terms-section-content">

            <h2>
              Repayment Responsibility
            </h2>

            <p>
              Borrowers are responsible for monitoring
              their outstanding debt, repayment deadline,
              collateral value and Health Factor.
            </p>

            <p>
              Failure to repay a loan may result in
              additional charges or liquidation according
              to the protocol rules implemented in the
              smart contract.
            </p>

          </div>

        </div>


        {/* =========================================
            14 — WALLET
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            14
          </span>

          <div className="terms-section-content">

            <h2>
              Wallet Responsibility
            </h2>

            <p>
              Users are responsible for maintaining
              control of their wallet and private keys.
            </p>

            <p>
              DeFiLend will never require a user to
              provide a private key, recovery phrase
              or wallet password.
            </p>

          </div>

        </div>


        {/* =========================================
            15 — GAS
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            15
          </span>

          <div className="terms-section-content">

            <h2>
              Gas Fees
            </h2>

            <p>
              Blockchain transactions may require
              network gas fees. These fees are paid
              by the user through the connected wallet
              and are separate from the protocol's
              lending calculations.
            </p>

          </div>

        </div>


        {/* =========================================
            16 — SEPOLIA
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            16
          </span>

          <div className="terms-section-content">

            <h2>
              Sepolia Testnet Disclaimer
            </h2>

            <div className="terms-warning">

              <div className="warning-icon">
                !
              </div>

              <div>

                <strong>
                  Testnet Only
                </strong>

                <p>
                  DeFiLend currently operates on the
                  Ethereum Sepolia test network. Testnet
                  ETH and other testnet assets are
                  intended for development and
                  demonstration purposes and do not
                  represent real-world monetary value.
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =========================================
            17 — RISKS
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            17
          </span>

          <div className="terms-section-content">

            <h2>
              Protocol Risks
            </h2>

            <p>
              Blockchain applications may contain
              software bugs, smart contract
              vulnerabilities, oracle failures,
              network issues or unexpected market
              conditions.
            </p>

            <p>
              Users should understand that decentralized
              applications involve technical and financial
              risks. This project is intended for academic
              and demonstration purposes.
            </p>

          </div>

        </div>


        {/* =========================================
            18 — ACKNOWLEDGEMENT
            ========================================= */}

        <div className="terms-section">

          <span className="terms-number">
            18
          </span>

          <div className="terms-section-content">

            <h2>
              User Acknowledgement
            </h2>

            <p>
              By interacting with DeFiLend, the user
              acknowledges that they have reviewed the
              protocol rules, understand the risks
              associated with collateralized borrowing
              and accept responsibility for monitoring
              and repaying their loan.
            </p>

          </div>

        </div>


        {/* =========================================
            FINAL CTA
            ========================================= */}

        <section className="terms-final">

          <div className="terms-final-icon">
            ◆
          </div>

          <span>
            BEFORE YOU CONTINUE
          </span>

          <h2>
            Understand the rules.
            <br />
            Then explore DeFiLend.
          </h2>

          <p>
            Make sure you understand the borrowing,
            repayment, collateral and liquidation
            rules before interacting with the protocol.
          </p>

          <Link
            to="/dashboard"
            className="terms-primary-btn"
          >
            Enter DeFiLend →
          </Link>

          <Link
            to="/"
            className="terms-secondary-btn"
          >
            ← Back to Welcome
          </Link>

        </section>

      </section>


      {/* =========================================
          FOOTER
          ========================================= */}

      <footer className="terms-footer">

        <span>
          ◆ DeFiLend
        </span>

        <span>
          ETH Lending Protocol · Sepolia Testnet
        </span>

        <Link to="/">
          Welcome
        </Link>

      </footer>

    </div>
  )
}

export default Terms