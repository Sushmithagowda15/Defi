function Markets() {
  return (
    <div className="markets-page">

      {/* Page Header */}
      <div className="markets-header">

        <div>
          <p className="eyebrow">OVERVIEW</p>

          <h1>Markets</h1>

          <p className="subtitle">
            Explore available lending markets and protocol liquidity.
          </p>
        </div>

        <div className="market-network">
          <span className="network-dot"></span>
          Ethereum
        </div>

      </div>


      {/* Market Overview */}
      <section className="market-overview">

        <div className="market-overview-card">

          <span>Total Supplied</span>

          <strong>-- ETH</strong>

          <small>Assets supplied to protocol</small>

        </div>


        <div className="market-overview-card">

          <span>Total Borrowed</span>

          <strong>-- ETH</strong>

          <small>Assets currently borrowed</small>

        </div>


        <div className="market-overview-card">

          <span>Available Liquidity</span>

          <strong>-- ETH</strong>

          <small>Available for borrowing</small>

        </div>


        <div className="market-overview-card">

          <span>Utilization</span>

          <strong>-- %</strong>

          <small>Protocol utilization rate</small>

        </div>

      </section>


      {/* Market Section */}
      <section className="markets-panel">

        <div className="markets-panel-header">

          <div>
            <p className="risk-card-label">
              LENDING MARKETS
            </p>

            <h2>Available Assets</h2>
          </div>

          <span className="market-live-badge">
            LIVE MARKET
          </span>

        </div>


        {/* ETH Market */}
        <div className="asset-market-card">

          <div className="asset-information">

            <div className="eth-market-icon">
              Ξ
            </div>

            <div>
              <h3>Ethereum</h3>

              <span>ETH</span>
            </div>

          </div>


          <div className="market-stat">

            <span>SUPPLY APY</span>

            <strong>-- %</strong>

          </div>


          <div className="market-stat">

            <span>BORROW APY</span>

            <strong>-- %</strong>

          </div>


          <div className="market-stat">

            <span>TOTAL SUPPLIED</span>

            <strong>-- ETH</strong>

          </div>


          <div className="market-stat">

            <span>TOTAL BORROWED</span>

            <strong>-- ETH</strong>

          </div>


          <div className="market-action">

            <button className="market-action-btn">
              View Market
            </button>

          </div>

        </div>


        {/* Coming Soon */}
        <div className="market-coming-soon">

          <div className="coming-soon-icon">
            +
          </div>

          <div>

            <h3>More assets coming soon</h3>

            <p>
              Additional lending markets will be introduced
              as the protocol expands.
            </p>

          </div>

        </div>

      </section>


      {/* Market Information */}
      <section className="market-info">

        <div className="market-info-icon">
          i
        </div>

        <div>

          <p className="risk-card-label">
            MARKET INFORMATION
          </p>

          <h3>Transparent lending rates</h3>

          <p>
            Supply and borrow rates will be determined by
            protocol liquidity and utilization. Market data
            will be updated from the blockchain and price feeds.
          </p>

        </div>

      </section>

    </div>
  )
}

export default Markets