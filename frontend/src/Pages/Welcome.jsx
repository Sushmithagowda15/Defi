import { Link } from 'react-router-dom'
import './Welcome.css'

function Welcome() {
  return (
    <div className="welcome-page">

      {/* =====================================
          HEADER
          ===================================== */}

      <header className="welcome-nav">

        <div className="welcome-brand">

          <div className="welcome-brand-icon">
            ◆
          </div>

          <div>
            <h2>DeFiLend</h2>
            <span>ETH Lending Protocol</span>
          </div>

        </div>

        <Link
          to="/terms"
          className="welcome-nav-link"
        >
          Terms & Conditions
        </Link>

      </header>


      {/* =====================================
          HERO
          ===================================== */}

      <main>

        <section className="welcome-hero">

          <div className="welcome-hero-content">

            <div className="welcome-badge">
              DECENTRALIZED ETH LENDING
            </div>

            <h1>
              Welcome to
              <span> DeFiLend</span>
            </h1>

            <p>
              A decentralized lending platform that allows you
              to use ETH as collateral and borrow USDC through
              transparent smart-contract based lending.
            </p>

            <div className="welcome-actions">

              <Link
                to="/dashboard"
                className="welcome-primary-btn"
              >
                Enter DeFiLend
                <span>→</span>
              </Link>

              <Link
                to="/terms"
                className="welcome-secondary-btn"
              >
                Read Terms & Conditions
              </Link>

            </div>

            <div className="welcome-network">

              <span className="welcome-network-dot"></span>

              Ethereum Sepolia Testnet

            </div>

          </div>


          {/* HERO VISUAL */}

          <div className="welcome-visual">

            <div className="visual-glow"></div>

            <div className="protocol-card">

              <div className="protocol-card-top">

                <span>
                  PROTOCOL
                </span>

                <span className="protocol-live">
                  ● LIVE
                </span>

              </div>

              <div className="protocol-logo">
                ◆
              </div>

              <h3>
                DeFiLend
              </h3>

              <p>
                ETH Collateral
                <br />
                USDC Borrowing
              </p>

              <div className="protocol-divider"></div>

              <div className="protocol-stat-row">

                <div>
                  <span>MAX LTV</span>
                  <strong>80%</strong>
                </div>

                <div>
                  <span>INTEREST</span>
                  <strong>5%</strong>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================
            TRUST SECTION
            ===================================== */}

        <section className="welcome-trust">

          <div className="welcome-section-heading">

            <span>WHY DEFILEND</span>

            <h2>
              Built around transparency and control.
            </h2>

          </div>


          <div className="welcome-trust-grid">

            <div className="welcome-feature-card">

              <div className="feature-icon">
                ◆
              </div>

              <h3>
                Smart Contract Controlled
              </h3>

              <p>
                Collateral is intended to be controlled by
                the LendingPool smart contract rather than
                the frontend application.
              </p>

            </div>


            <div className="welcome-feature-card">

              <div className="feature-icon">
                ◈
              </div>

              <h3>
                Transparent On-Chain
              </h3>

              <p>
                Lending transactions are recorded on the
                blockchain and can be verified on-chain.
              </p>

            </div>


            <div className="welcome-feature-card">

              <div className="feature-icon">
                ◇
              </div>

              <h3>
                Chainlink Price Data
              </h3>

              <p>
                The protocol is designed to use Chainlink
                ETH/USD price data for collateral valuation.
              </p>

            </div>


            <div className="welcome-feature-card">

              <div className="feature-icon">
                ◒
              </div>

              <h3>
                Risk Monitoring
              </h3>

              <p>
                Health-factor monitoring and ML-based risk
                analysis are part of the DeFiLend design.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================
            HOW IT WORKS
            ===================================== */}

        <section className="welcome-how">

          <div className="welcome-section-heading">

            <span>HOW IT WORKS</span>

            <h2>
              Simple collateralized lending.
            </h2>

          </div>


          <div className="welcome-steps">

            <div className="welcome-step">

              <div className="step-number">
                01
              </div>

              <h3>
                Connect Wallet
              </h3>

              <p>
                Connect your MetaMask wallet to the
                DeFiLend protocol.
              </p>

            </div>


            <div className="step-line"></div>


            <div className="welcome-step">

              <div className="step-number">
                02
              </div>

              <h3>
                Deposit ETH
              </h3>

              <p>
                Deposit ETH into the LendingPool as
                collateral.
              </p>

            </div>


            <div className="step-line"></div>


            <div className="welcome-step">

              <div className="step-number">
                03
              </div>

              <h3>
                Borrow USDC
              </h3>

              <p>
                Borrow USDC according to your available
                collateral and LTV.
              </p>

            </div>


            <div className="step-line"></div>


            <div className="welcome-step">

              <div className="step-number">
                04
              </div>

              <h3>
                Repay
              </h3>

              <p>
                Repay your outstanding debt and withdraw
                eligible collateral.
              </p>

            </div>

          </div>

        </section>


        {/* =====================================
            PROTOCOL NOTICE
            ===================================== */}

        <section className="welcome-notice">

          <div>

            <span className="notice-label">
              BEFORE YOU BEGIN
            </span>

            <h2>
              Understand the protocol rules.
            </h2>

            <p>
              DeFiLend uses defined borrowing, repayment,
              interest, risk and liquidation rules. Review
              the Terms & Conditions before interacting
              with the protocol.
            </p>

          </div>

          <Link
            to="/terms"
            className="welcome-notice-btn"
          >
            View Protocol Rules →
          </Link>

        </section>


        {/* =====================================
            FOOTER CTA
            ===================================== */}

        <section className="welcome-final">

          <div className="welcome-final-badge">
            ETHEREUM SEPOLIA
          </div>

          <h2>
            Ready to explore DeFiLend?
          </h2>

          <p>
            Connect your wallet and explore decentralized
            ETH-backed lending.
          </p>

          <Link
            to="/dashboard"
            className="welcome-primary-btn"
          >
            Enter DeFiLend
            <span>→</span>
          </Link>

          <p className="welcome-disclaimer">
            DeFiLend is an academic project operating on
            the Ethereum Sepolia test network. Testnet
            assets have no real-world monetary value.
          </p>

        </section>

      </main>


      {/* =====================================
          FOOTER
          ===================================== */}

      <footer className="welcome-footer">

        <div>
          ◆ DeFiLend
        </div>

        <div>
          ETH Lending Protocol · Sepolia Testnet
        </div>

        <Link to="/terms">
          Terms & Conditions
        </Link>

      </footer>

    </div>
  )
}

export default Welcome