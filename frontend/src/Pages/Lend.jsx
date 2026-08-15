function Lend() {
  return (
    <div>
      <p className="eyebrow">LENDING</p>

      <h1>Lend ETH</h1>

      <p className="subtitle">
        Supply ETH to the protocol and earn lending returns.
      </p>

      <div className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">SUPPLY ASSET</p>
            <h2>Deposit ETH</h2>
          </div>
        </div>

        <div className="position-value">
          <div className="eth-symbol">Ξ</div>

          <div>
            <span>ETH Balance</span>
            <strong>-- ETH</strong>
          </div>
        </div>

        <div className="position-details">

          <div>
            <span>Supply APY</span>
            <strong>-- %</strong>
          </div>

          <div>
            <span>Total Supplied</span>
            <strong>-- ETH</strong>
          </div>

          <div>
            <span>Wallet Balance</span>
            <strong>-- ETH</strong>
          </div>

        </div>

        <button className="wallet-btn">
          Connect Wallet
        </button>
      </div>
    </div>
  )
}

export default Lend