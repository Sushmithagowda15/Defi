import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Welcome.css'
import {
  EthIcon,
  UsdcIcon,
  ArrowRightIcon,
} from '../Components/Icons'

function Welcome() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const [activeNode, setActiveNode] = useState(null)
  const [activeConcept, setActiveConcept] = useState('lend')
  const [isLoaded, setIsLoaded] = useState(false)
  const heroRef = useRef(null)

  useEffect(() => {
    // Trigger entrance animation sequence
    const timer = setTimeout(() => setIsLoaded(true), 80)

    // Smooth subtle mouse parallax tracker
    const handleMouseMove = (e) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      // Normalize from -1 to 1 based on window viewport
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      setMousePos({ x: nx, y: ny })
    }

    // Scroll tracker for atmospheric parallax
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Section Scroll Intersection Observer for smooth reveal-on-scroll
  useEffect(() => {
    if (!isLoaded) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
          }
        })
      },
      { threshold: 0.15 }
    )

    const elements = document.querySelectorAll('.reveal-on-scroll')
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [isLoaded])

  return (
    <div
      className={`welcome-canvas-root ${isLoaded ? 'canvas-entered' : ''}`}
      style={{
        '--mouse-x': mousePos.x,
        '--mouse-y': mousePos.y,
        '--scroll-y': scrollY,
      }}
    >
      {/* =========================================================
          DYNAMIC MULTI-TONAL ATMOSPHERIC SPATIAL CANVAS
          Deep Midnight Blue ┬╖ Rich Indigo ┬╖ Cyan Aurora ┬╖ Amethyst
          ========================================================= */}
      <div className="spatial-atmosphere" aria-hidden="true">
        {/* Layer 1: Cursor-responsive luminous spotlight */}
        <div className="atmospheric-cursor-light"></div>

        {/* Layer 2: Deep multi-tonal midnight foundation */}
        <div className="spatial-deep-abyss"></div>

        {/* Layer 3: Upper central indigo-violet environmental dome */}
        <div className="spatial-hero-indigo-dome"></div>

        {/* Layer 4: Cyan-blue core atmospheric field behind lending */}
        <div className="spatial-cyan-aurora-field"></div>

        {/* Layer 5: Violet-amethyst left ambient flare */}
        <div className="spatial-violet-lateral-flare"></div>

        {/* Layer 6: Deep ocean cyan right ambient flare */}
        <div className="spatial-ocean-lateral-flare"></div>

        {/* Layer 7: Micro-precision spatial grid with cyan luminescence */}
        <div className="spatial-fine-grid"></div>

        {/* Layer 8: Luminous stardust and orbiting constellations */}
        <div className="ambient-floating-dust"></div>
      </div>

      {/* =========================================================
          NAVIGATION ΓÇö STREAMLINED & ELEVATED
          ========================================================= */}
      <header className="spatial-nav">
        <div className="spatial-nav-container">
          <Link to="/" className="spatial-brand" aria-label="DeFiLend Home">
            <div className="brand-crest">
              <EthIcon size={18} />
            </div>
            <div className="brand-text-block">
              <span className="brand-name">DeFiLend</span>
              <span className="brand-tag">DeFi Lending Platform</span>
            </div>
          </Link>

          <nav className="spatial-menu" aria-label="Main Navigation">
            <a href="#how-it-works" className="spatial-menu-item">
              How It Works
            </a>
            <Link to="/terms" className="spatial-menu-item">
              Protocol & Terms
            </Link>
          </nav>

          <div className="spatial-nav-actions">
            <div className="network-capsule" title="Ethereum Sepolia Testnet">
              <span className="network-beacon"></span>
              <span>Sepolia Testnet</span>
            </div>

            <Link to="/dashboard" className="spatial-cta-btn">
              <span>Enter Platform</span>
              <ArrowRightIcon size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* =========================================================
            1. HERO SECTION ΓÇö ART-DIRECTED TYPOGRAPHY & BREATHING ROOM
            ========================================================= */}
        <section className="spatial-hero-section" ref={heroRef}>
          <div className="hero-text-stage">
            <div className="eyebrow-reveal">
              <span className="eyebrow-accent-line"></span>
              <span className="eyebrow-text">WELCOME TO DEFI LENDING</span>
              <span className="eyebrow-accent-line"></span>
            </div>

            <h1 className="hero-title-cinematic">
              <span className="title-row title-row-1">Lend with confidence.</span>
              <span className="title-row title-row-2">
                <span className="title-lead">Borrow with</span>{' '}
                <span className="clarity-word">clarity.</span>
              </span>
            </h1>

            <p className="hero-sub-statement">
              A simpler way to explore ETH-backed borrowing.
            </p>

            <div className="hero-button-row">
              <Link to="/dashboard" className="hero-btn-prime">
                <span>Enter Platform</span>
                <ArrowRightIcon size={16} />
              </Link>
              <a href="#how-it-works" className="hero-btn-secondary">
                Explore How It Works
              </a>
            </div>
          </div>

          {/* =========================================================
              THE HERO VISUAL:
              THE LUMINOUS LENDING PRISM & DYNAMIC LIQUIDITY FIELD
              ========================================================= */}
          <div className="lending-spatial-chamber" aria-label="Interactive DeFi Lending Concept">
            {/* Dedicated atmospheric depth environment behind interactive visual */}
            <div className="chamber-environment-backdrop" aria-hidden="true">
              <div className="chamber-volumetric-glow"></div>
              <div className="chamber-orbital-contours">
                <svg viewBox="0 0 800 400" className="contour-svg">
                  <ellipse
                    cx="400"
                    cy="200"
                    rx="380"
                    ry="160"
                    stroke="rgba(6, 182, 212, 0.35)"
                    strokeWidth="1.2"
                    strokeDasharray="6 8"
                  />
                  <ellipse
                    cx="400"
                    cy="200"
                    rx="280"
                    ry="110"
                    stroke="rgba(129, 140, 248, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                  />
                  <circle cx="160" cy="180" r="3" fill="#38bdf8" />
                  <circle cx="640" cy="220" r="3" fill="#818cf8" />
                  <circle cx="400" cy="90" r="3.5" fill="#34d399" />
                </svg>
              </div>
            </div>

            <div className="spatial-rig">
              {/* Spatial Background Glows */}
              <div className="chamber-core-halo"></div>

              {/* Connecting Energy Vectors (SVG Stream) */}
              <svg
                className="energy-streams-svg"
                viewBox="0 0 1000 440"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="streamGradEth" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#627eea" stopOpacity="0.9" />
                    <stop offset="60%" stopColor="#818cf8" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="1" />
                  </linearGradient>

                  <linearGradient id="streamGradUsdc" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
                    <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#2775ca" stopOpacity="0.9" />
                  </linearGradient>

                  <linearGradient id="safetyBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(6, 182, 212, 0.5)" />
                    <stop offset="100%" stopColor="rgba(16, 185, 129, 0.9)" />
                  </linearGradient>
                </defs>

                {/* Primary Collateral Inflow Arc: ETH -> Nexus */}
                <path
                  d="M 180 220 C 300 120, 400 140, 500 220"
                  stroke="url(#streamGradEth)"
                  strokeWidth="2.5"
                  className={`beam-path beam-collateral ${activeNode === 'eth' || activeNode === 'nexus' ? 'beam-energized' : ''}`}
                />

                {/* Primary Liquidity Outflow Arc: Nexus -> USDC */}
                <path
                  d="M 500 220 C 600 300, 700 320, 820 220"
                  stroke="url(#streamGradUsdc)"
                  strokeWidth="2.5"
                  className={`beam-path beam-liquidity ${activeNode === 'usdc' || activeNode === 'nexus' ? 'beam-energized' : ''}`}
                />

                {/* Safety Grounding Arc */}
                <path
                  d="M 280 260 C 400 380, 600 380, 720 260"
                  stroke="url(#safetyBeamGrad)"
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                  className={`beam-path beam-safety ${activeNode === 'safety' ? 'beam-energized' : ''}`}
                />
              </svg>

              {/* Spatial Element 1: ETH Asset Beacon */}
              <div
                className={`spatial-node node-eth ${activeNode === 'eth' ? 'node-focused' : ''}`}
                onMouseEnter={() => setActiveNode('eth')}
                onMouseLeave={() => setActiveNode(null)}
                tabIndex={0}
                role="button"
                aria-label="Inspect ETH Collateral Asset"
              >
                <div className="node-crystal-wrap">
                  <div className="crystal-aura eth-aura"></div>
                  <div className="crystal-body">
                    <EthIcon size={32} />
                  </div>
                  <div className="orbiting-particle-ring ring-eth"></div>
                </div>

                <div className="node-meta">
                  <span className="meta-overline">COLLATERAL</span>
                  <strong className="meta-title">Your ETH</strong>
                  <span className="meta-action">Supplied as security</span>
                </div>

                {/* Spatial Tooltip */}
                <div className="spatial-hud-tooltip tooltip-left">
                  <div className="tooltip-pip"></div>
                  <span>Your ETH acts as security to unlock borrowing power without selling.</span>
                </div>
              </div>

              {/* Spatial Element 2: The Decentralized Nexus (DeFi Mechanism) */}
              <div
                className={`spatial-node node-nexus ${activeNode === 'nexus' ? 'node-focused' : ''}`}
                onMouseEnter={() => setActiveNode('nexus')}
                onMouseLeave={() => setActiveNode(null)}
                tabIndex={0}
                role="button"
                aria-label="Inspect Autonomous DeFi Mechanism"
              >
                <div className="nexus-structure">
                  <div className="nexus-plate plate-top"></div>
                  <div className="nexus-plate plate-core">
                    <div className="quantum-spark"></div>
                  </div>
                  <div className="nexus-plate plate-base"></div>
                  <div className="nexus-pulse-sphere"></div>
                </div>

                <div className="node-meta text-center">
                  <span className="meta-overline">DEFI MECHANISM</span>
                  <strong className="meta-title">Smart Contract Vault</strong>
                  <span className="meta-action">Non-custodial locking</span>
                </div>

                {/* Spatial Tooltip */}
                <div className="spatial-hud-tooltip tooltip-center">
                  <div className="tooltip-pip"></div>
                  <span>Autonomous on-chain protocol securely holds collateral and calculates limits.</span>
                </div>
              </div>

              {/* Spatial Element 3: USDC Borrowed Capital Beacon */}
              <div
                className={`spatial-node node-usdc ${activeNode === 'usdc' ? 'node-focused' : ''}`}
                onMouseEnter={() => setActiveNode('usdc')}
                onMouseLeave={() => setActiveNode(null)}
                tabIndex={0}
                role="button"
                aria-label="Inspect Borrowed USDC Asset"
              >
                <div className="node-crystal-wrap">
                  <div className="crystal-aura usdc-aura"></div>
                  <div className="crystal-body">
                    <UsdcIcon size={32} />
                  </div>
                  <div className="orbiting-particle-ring ring-usdc"></div>
                </div>

                <div className="node-meta">
                  <span className="meta-overline">BORROWED ASSET</span>
                  <strong className="meta-title">USDC Capital</strong>
                  <span className="meta-action">Direct to wallet</span>
                </div>

                {/* Spatial Tooltip */}
                <div className="spatial-hud-tooltip tooltip-right">
                  <div className="tooltip-pip"></div>
                  <span>Access borrowed USDC directly while keeping your ETH collateral intact.</span>
                </div>
              </div>

              {/* Spatial Element 4: Continuous Safety & Health Telemetry Ring */}
              <div
                className={`spatial-safety-ring ${activeNode === 'safety' ? 'safety-focused' : ''}`}
                onMouseEnter={() => setActiveNode('safety')}
                onMouseLeave={() => setActiveNode(null)}
                tabIndex={0}
                role="button"
                aria-label="Inspect Position Safety Oversight"
              >
                <div className="safety-ring-inner">
                  <span className="safety-beacon-dot"></span>
                  <span className="safety-label">Continuous Position Oversight & Risk Telemetry</span>
                  <span className="safety-sub">Position Health ΓëÑ 1.0</span>
                </div>
              </div>
            </div>

            {/* Interactive State Prompt Bar */}
            <div className="chamber-caption">
              <span className="caption-dot"></span>
              <span>
                {activeNode === 'eth' && 'Step 1: Deposit native ETH into the decentralized LendingPool.'}
                {activeNode === 'nexus' && 'Step 2: Smart contracts safely secure your collateral and determine borrowing limits.'}
                {activeNode === 'usdc' && 'Step 3: Receive borrowed USDC directly to your connected wallet.'}
                {activeNode === 'safety' && 'Continuous: Monitor your Health Factor in real-time to maintain full control.'}
                {!activeNode && 'Interact with the nodes above to explore how ETH-backed borrowing works.'}
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. "OUR PHILOSOPHY" SECTION ΓÇö DESIGNED BRAND MANIFESTO
            Richer Sapphire/Indigo Environment with Horizontal Light Field
            ========================================================= */}
        <section id="how-it-works" className="spatial-manifesto-section reveal-on-scroll">
          <div className="manifesto-atmospheric-field" aria-hidden="true">
            <div className="manifesto-horizontal-beam"></div>
            <div className="manifesto-sapphire-halo"></div>
          </div>

          <div className="manifesto-card-container">
            {/* Animated traveling border light beam */}
            <div className="manifesto-border-beam" aria-hidden="true"></div>
            <div className="manifesto-ambient-glow" aria-hidden="true"></div>

            <div className="manifesto-card-content">
              <div className="manifesto-eyebrow">
                <span className="eyebrow-accent-line"></span>
                <span className="eyebrow-text">OUR PHILOSOPHY</span>
                <span className="eyebrow-accent-line"></span>
              </div>

              <h2 className="manifesto-heading">
                <span className="manifesto-line">Built to make</span>
                <span className="manifesto-line manifesto-accent">DeFi feel clearer.</span>
              </h2>

              <div className="manifesto-separator"></div>

              <p className="manifesto-body">
                Explore a lending experience designed around simplicity, transparency, and confidence.
                No complex jargon, no hidden conditionsΓÇöjust transparent, decentralized borrowing backed
                by autonomous smart contracts.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            3. "THE PLATFORM CONTINUUM" ΓÇö UNIFIED FLOWING SYSTEM
            Deep Oceanic Blue-Black Environment with Cyan Illumination
            ========================================================= */}
        <section className="spatial-continuum-section reveal-on-scroll">
          <div className="continuum-atmospheric-field" aria-hidden="true">
            <div className="continuum-cyan-reservoir"></div>
            <div className="continuum-grid-highlight"></div>
          </div>

          <div className="continuum-wrapper">
            <div className="continuum-header">
              <div className="continuum-eyebrow">
                <span className="eyebrow-accent-line"></span>
                <span className="eyebrow-text">THE PLATFORM CONTINUUM</span>
                <span className="eyebrow-accent-line"></span>
              </div>
              <h3 className="continuum-title">
                <span className="continuum-title-lead">Three seamless stages.</span>
                <span className="continuum-title-sub">One unified platform.</span>
              </h3>
            </div>

            {/* Unified Flowing Stage Structure */}
            <div className={`continuum-carrier-stage active-phase-${activeConcept}`}>
              {/* Continuous flowing energy track */}
              <div className="continuum-flowing-track" aria-hidden="true">
                <div className="track-glow-line"></div>
                <div className="track-energy-pulse"></div>
              </div>

              <div className="continuum-moments-grid">
                {/* Moment 1: Lend */}
                <div
                  className={`continuum-moment moment-lend ${activeConcept === 'lend' ? 'is-active' : ''}`}
                  onClick={() => setActiveConcept('lend')}
                  onMouseEnter={() => setActiveConcept('lend')}
                  tabIndex={0}
                  role="button"
                  aria-label="Inspect Stage 1: Lend"
                >
                  <div className="moment-top">
                    <span className="moment-ordinal">STAGE 01</span>
                    <div className="moment-node-bead">
                      <span className="bead-core"></span>
                    </div>
                  </div>
                  <h4 className="moment-title">Lend</h4>
                  <p className="moment-description">
                    Deposit your native ETH into the protocol. You retain full asset ownership while
                    it serves as the collateral foundation.
                  </p>
                  <div className="moment-status-edge"></div>
                </div>

                {/* Dynamic Vector Bridge 1-2 */}
                <div className="moment-vector-bridge bridge-1-2" aria-hidden="true">
                  <div className="bridge-dash"></div>
                  <div className="bridge-arrow">ΓåÆ</div>
                </div>

                {/* Moment 2: Borrow */}
                <div
                  className={`continuum-moment moment-borrow ${activeConcept === 'borrow' ? 'is-active' : ''}`}
                  onClick={() => setActiveConcept('borrow')}
                  onMouseEnter={() => setActiveConcept('borrow')}
                  tabIndex={0}
                  role="button"
                  aria-label="Inspect Stage 2: Borrow"
                >
                  <div className="moment-top">
                    <span className="moment-ordinal">STAGE 02</span>
                    <div className="moment-node-bead">
                      <span className="bead-core"></span>
                    </div>
                  </div>
                  <h4 className="moment-title">Borrow</h4>
                  <p className="moment-description">
                    Access USDC liquidity directly into your wallet based on verified price feeds,
                    without ever needing to liquidate your ETH.
                  </p>
                  <div className="moment-status-edge"></div>
                </div>

                {/* Dynamic Vector Bridge 2-3 */}
                <div className="moment-vector-bridge bridge-2-3" aria-hidden="true">
                  <div className="bridge-dash"></div>
                  <div className="bridge-arrow">ΓåÆ</div>
                </div>

                {/* Moment 3: Understand */}
                <div
                  className={`continuum-moment moment-understand ${activeConcept === 'understand' ? 'is-active' : ''}`}
                  onClick={() => setActiveConcept('understand')}
                  onMouseEnter={() => setActiveConcept('understand')}
                  tabIndex={0}
                  role="button"
                  aria-label="Inspect Stage 3: Understand"
                >
                  <div className="moment-top">
                    <span className="moment-ordinal">STAGE 03</span>
                    <div className="moment-node-bead">
                      <span className="bead-core"></span>
                    </div>
                  </div>
                  <h4 className="moment-title">Understand</h4>
                  <p className="moment-description">
                    Track your health factor and position status with real-time risk clarity so you
                    remain confident from borrowing to repayment.
                  </p>
                  <div className="moment-status-edge"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            4. "YOUR JOURNEY STARTS HERE" ΓÇö PORTAL DESTINATION
            Warmer Celestial Indigo/Violet Environment with Concentrated Core Glow
            ========================================================= */}
        <section className="spatial-portal-section reveal-on-scroll">
          <div className="portal-atmospheric-field" aria-hidden="true">
            <div className="portal-converging-pillars"></div>
            <div className="portal-amethyst-core"></div>
          </div>

          <div className="portal-destination-wrapper">
            <div className="portal-light-aura" aria-hidden="true"></div>
            <div className="portal-converging-rays" aria-hidden="true"></div>

            <div className="portal-destination-card">
              <div className="portal-card-border-glow" aria-hidden="true"></div>

              <div className="portal-content">
                <div className="portal-eyebrow">
                  <span className="eyebrow-accent-line"></span>
                  <span className="eyebrow-text">YOUR JOURNEY STARTS HERE</span>
                  <span className="eyebrow-accent-line"></span>
                </div>

                <h2 className="portal-headline">
                  <span className="portal-heading-lead">Step into DeFiLend</span>
                  <span className="portal-heading-sub">and explore ETH-backed borrowing.</span>
                </h2>

                <p className="portal-subtext">
                  Connect your MetaMask wallet on Ethereum Sepolia and experience decentralized
                  lending with transparent risk analysis.
                </p>

                <div className="portal-actions">
                  <Link to="/dashboard" className="hero-btn-prime portal-enter-btn">
                    <span>Enter Platform</span>
                    <ArrowRightIcon size={16} />
                  </Link>
                  <a href="#how-it-works" className="hero-btn-secondary">
                    Explore How It Works
                  </a>
                </div>

                <div className="portal-network-status">
                  <span className="portal-beacon-dot"></span>
                  <span>Ethereum Sepolia Testnet ┬╖ Non-Custodial Smart Contract Architecture</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* =========================================================
          FOOTER ΓÇö ULTRA-MINIMAL & CLEAN
          ========================================================= */}
      <footer className="spatial-footer">
        <div className="spatial-footer-inner">
          <div className="footer-brand-side">
            <strong className="footer-title">DeFiLend</strong>
            <span className="footer-desc">DeFi Lending Platform with Risk Analysis</span>
          </div>

          <div className="footer-nav-side">
            <a href="#how-it-works" className="footer-link">
              How It Works
            </a>
            <Link to="/terms" className="footer-link">
              Protocol & Terms
            </Link>
            <Link to="/dashboard" className="footer-link link-highlight">
              Enter Platform ΓåÆ
            </Link>
          </div>

          <div className="footer-meta-side">
            <span className="footer-network">Ethereum Sepolia</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Welcome
