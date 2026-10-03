import { useEffect, useState } from 'react'
import {
  JsonRpcProvider,
  formatEther,
  formatUnits,
  id,
} from 'ethers'

import { useWallet } from '../context/WalletContext'
import { getLendingPool } from '../utils/contracts'

const SEPOLIA_RPC_URL =
  'https://ethereum-sepolia-rpc.publicnode.com'

const SEPOLIA_CHAIN_ID = 11155111

const EVENT_TOPICS = [
  id('CollateralDeposited(address,uint256)'),
  id('CollateralWithdrawn(address,uint256)'),
  id('Borrowed(address,uint256)'),
  id('Repaid(address,uint256)'),
  id('Liquidated(address,address,uint256,uint256)'),
]

function Transactions() {
  const { walletAddress } = useWallet()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [filter, setFilter] = useState('All Transactions')

  const [totalSupplied, setTotalSupplied] = useState('0')
  const [totalBorrowed, setTotalBorrowed] = useState('0')
  const [totalRepaid, setTotalRepaid] = useState('0')

  const loadTransactions = async () => {
    if (!walletAddress) {
      setTransactions([])
      setTotalSupplied('0')
      setTotalBorrowed('0')
      setTotalRepaid('0')
      return
    }

    try {
      setLoading(true)
      setError('')

      const address = walletAddress

      /*
      * Dedicated read-only Sepolia RPC.
      * This avoids MetaMask eth_getLogs/RPC limitations.
      */

      const provider = new JsonRpcProvider(
        SEPOLIA_RPC_URL,
        SEPOLIA_CHAIN_ID,
        {
          staticNetwork: true,
        }
      )

      /*
       * Verify the RPC is actually on Sepolia.
       */
      const network = await provider.getNetwork()

      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        throw new Error(
          'The blockchain reader is not connected to Sepolia.'
        )
      }

      const lendingPool = getLendingPool(provider)

      const latestBlock = await provider.getBlockNumber()

      /*
       * Scan the recent Sepolia history.
       *
       * 50,000 blocks is enough for this prototype while
       * keeping RPC requests manageable.
       */
      const blocksToScan = 50000

      const fromBlock = Math.max(
        latestBlock - blocksToScan,
        0
      )

      /*
       * Small ranges make historical log requests
       * much more reliable across public RPC providers.
       */
      const chunkSize = 1000

      const allTransactions = []

      let supplied = 0
      let withdrawn = 0
      let borrowed = 0
      let repaid = 0

      /*
       * Cache block timestamps.
       *
       * Multiple events can occur in the same block,
       * so this prevents unnecessary RPC requests.
       */
      const blockTimestampCache = new Map()

      /*
       * Read blockchain logs in chunks.
       */
      for (
        let start = fromBlock;
        start <= latestBlock;
        start += chunkSize
      ) {
        const end = Math.min(
          start + chunkSize - 1,
          latestBlock
        )

        const logs = await provider.getLogs({
          address: lendingPool.target,
          fromBlock: start,
          toBlock: end,
          topics: [EVENT_TOPICS],
        })

        for (const log of logs) {
          try {
            const parsed =
              lendingPool.interface.parseLog(log)

            if (!parsed) {
              continue
            }

            const eventName = parsed.name
            const args = parsed.args

            /*
             * Determine whether this event belongs
             * to the connected wallet.
             */
            let belongsToWallet = false

            if (
              eventName === 'CollateralDeposited' ||
              eventName === 'CollateralWithdrawn' ||
              eventName === 'Borrowed' ||
              eventName === 'Repaid'
            ) {
              belongsToWallet =
                String(args[0]).toLowerCase() ===
                address.toLowerCase()
            }

            /*
             * Liquidated:
             * args[0] = borrower
             * args[1] = liquidator
             *
             * Show the event if the connected wallet is
             * either the borrower or liquidator.
             */
            if (eventName === 'Liquidated') {
              belongsToWallet =
                String(args[0]).toLowerCase() ===
                  address.toLowerCase() ||
                String(args[1]).toLowerCase() ===
                  address.toLowerCase()
            }

            if (!belongsToWallet) {
              continue
            }

            /*
             * Get block timestamp.
             */
            let date = '--'

            if (blockTimestampCache.has(log.blockNumber)) {
              date = blockTimestampCache.get(
                log.blockNumber
              )
            } else {
              const block = await provider.getBlock(
                log.blockNumber
              )

              if (block) {
                date = new Date(
                  Number(block.timestamp) * 1000
                ).toLocaleString()

                blockTimestampCache.set(
                  log.blockNumber,
                  date
                )
              }
            }

            /*
             * SUPPLY
             */
            if (
              eventName === 'CollateralDeposited'
            ) {
              const amount = Number(
                formatEther(args[1])
              )

              supplied += amount

              allTransactions.push({
                type: 'Supply',
                asset: 'ETH',
                amount: `${amount.toFixed(6)} ETH`,
                status: 'Confirmed',
                date,
                hash: log.transactionHash,
                blockNumber: log.blockNumber,
              })
            }

            /*
             * WITHDRAW
             */
            if (
              eventName === 'CollateralWithdrawn'
            ) {
              const amount = Number(
                formatEther(args[1])
              )

              withdrawn += amount

              allTransactions.push({
                type: 'Withdraw',
                asset: 'ETH',
                amount: `${amount.toFixed(6)} ETH`,
                status: 'Confirmed',
                date,
                hash: log.transactionHash,
                blockNumber: log.blockNumber,
              })
            }

            /*
             * BORROW
             */
            if (eventName === 'Borrowed') {
              const amount = Number(
                formatUnits(args[1], 6)
              )

              borrowed += amount

              allTransactions.push({
                type: 'Borrow',
                asset: 'USDC',
                amount: `${amount.toFixed(6)} USDC`,
                status: 'Confirmed',
                date,
                hash: log.transactionHash,
                blockNumber: log.blockNumber,
              })
            }

            /*
             * REPAY
             */
            if (eventName === 'Repaid') {
              const amount = Number(
                formatUnits(args[1], 6)
              )

              repaid += amount

              allTransactions.push({
                type: 'Repay',
                asset: 'USDC',
                amount: `${amount.toFixed(6)} USDC`,
                status: 'Confirmed',
                date,
                hash: log.transactionHash,
                blockNumber: log.blockNumber,
              })
            }

            /*
             * LIQUIDATION
             */
            if (eventName === 'Liquidated') {
              const debtRepaid = Number(
                formatUnits(args[2], 6)
              )

              allTransactions.push({
                type: 'Liquidation',
                asset: 'ETH / USDC',
                amount: `${debtRepaid.toFixed(6)} USDC`,
                status: 'Confirmed',
                date,
                hash: log.transactionHash,
                blockNumber: log.blockNumber,
              })
            }
          } catch (eventError) {
            console.error(
              'Failed to parse transaction event:',
              eventError
            )
          }
        }
      }

      /*
       * Remove accidental duplicate events.
       */
      const uniqueTransactions = Array.from(
        new Map(
          allTransactions.map((transaction) => [
            `${transaction.hash}-${transaction.type}`,
            transaction,
          ])
        ).values()
      )

      /*
       * Newest transactions first.
       */
      uniqueTransactions.sort(
        (a, b) => {
          if (b.blockNumber !== a.blockNumber) {
            return b.blockNumber - a.blockNumber
          }

          return (
            new Date(b.date) -
            new Date(a.date)
          )
        }
      )

      setTransactions(uniqueTransactions)

      /*
       * Summary values.
       */
      setTotalSupplied(
        Math.max(
          supplied - withdrawn,
          0
        ).toFixed(6)
      )

      setTotalBorrowed(
        borrowed.toFixed(6)
      )

      setTotalRepaid(
        repaid.toFixed(6)
      )
    } catch (error) {
      console.error(
        'Failed to load transactions:',
        error
      )

      let message =
        error?.shortMessage ||
        error?.reason ||
        error?.message ||
        'Failed to load blockchain transactions.'

      /*
       * Give the user a useful message instead of
       * exposing the confusing ethers "coalesce" error.
       */
      if (
        message.toLowerCase().includes(
          'coalesce'
        )
      ) {
        message =
          'The Sepolia blockchain history could not be read. Please try Refresh again.'
      }

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [walletAddress])

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const filteredTransactions =
    filter === 'All Transactions'
      ? transactions
      : transactions.filter(
          (transaction) => {
            if (filter === 'Lend') {
              return (
                transaction.type ===
                  'Supply' ||
                transaction.type ===
                  'Withdraw'
              )
            }

            if (filter === 'Borrow') {
              return (
                transaction.type ===
                'Borrow'
              )
            }

            if (filter === 'Repay') {
              return (
                transaction.type ===
                  'Repay' ||
                transaction.type ===
                  'Liquidation'
              )
            }

            return true
          }
        )

  const shortenHash = (hash) => {
    if (!hash) {
      return '--'
    }

    return `${hash.slice(
      0,
      8
    )}...${hash.slice(-6)}`
  }

  return (
    <div className="transactions-page">

      {/* PAGE HEADER */}

      <div className="transactions-header">

        <div>

          <p className="eyebrow">
            ANALYTICS
          </p>

          <h1>
            Transactions
          </h1>

          <p className="subtitle">
            View your lending, borrowing and repayment activity.
          </p>

        </div>

        <div className="transaction-header-actions">

          <select
            className="transaction-filter-btn"
            value={filter}
            onChange={
              handleFilterChange
            }
          >

            <option value="All Transactions">
              All Transactions
            </option>

            <option value="Lend">
              Lend
            </option>

            <option value="Borrow">
              Borrow
            </option>

            <option value="Repay">
              Repay
            </option>

          </select>

          <button
            type="button"
            className="transaction-filter-btn"
            onClick={
              loadTransactions
            }
            disabled={loading}
          >
            {loading
              ? 'Loading...'
              : 'Refresh'}
          </button>

        </div>

      </div>


      {/* WALLET */}

      {walletAddress && (

        <p className="transaction-note">

          Connected:{' '}

          {walletAddress.slice(
            0,
            6
          )}

          ...

          {walletAddress.slice(
            -4
          )}

        </p>

      )}


      {/* ERROR */}

      {error && (

        <p className="wallet-error">
          {error}
        </p>

      )}


      {/* SUMMARY */}

      <section className="transaction-summary">

        <div className="transaction-summary-card">

          <span>
            Total Transactions
          </span>

          <strong>
            {transactions.length}
          </strong>

          <small>
            Your protocol activity
          </small>

        </div>


        <div className="transaction-summary-card">

          <span>
            Total Supplied
          </span>

          <strong>
            {totalSupplied} ETH
          </strong>

          <small>
            ETH currently supplied
          </small>

        </div>


        <div className="transaction-summary-card">

          <span>
            Total Borrowed
          </span>

          <strong>
            {totalBorrowed} USDC
          </strong>

          <small>
            USDC borrowed through protocol
          </small>

        </div>


        <div className="transaction-summary-card">

          <span>
            Total Repaid
          </span>

          <strong>
            {totalRepaid} USDC
          </strong>

          <small>
            USDC repaid to protocol
          </small>

        </div>

      </section>


      {/* TRANSACTION HISTORY */}

      <section className="transactions-panel">

        <div className="transactions-panel-header">

          <div>

            <p className="risk-card-label">
              ACTIVITY
            </p>

            <h2>
              Transaction History
            </h2>

          </div>

          <span className="transaction-live-badge">

            {loading
              ? 'LOADING'
              : 'SEPOLIA BLOCKCHAIN'}

          </span>

        </div>


        <div className="transaction-table">

          <div className="transaction-table-header">

            <span>
              TYPE
            </span>

            <span>
              ASSET
            </span>

            <span>
              AMOUNT
            </span>

            <span>
              STATUS
            </span>

            <span>
              DATE
            </span>

            <span>
              TRANSACTION
            </span>

          </div>


          {/* LOADING */}

          {loading && (

            <div className="transaction-empty">

              <div className="transaction-empty-icon">
                ↻
              </div>

              <h3>
                Loading transactions...
              </h3>

              <p>
                Reading your activity from the Sepolia blockchain.
              </p>

            </div>

          )}


          {/* NO TRANSACTIONS */}

          {!loading &&
            filteredTransactions.length === 0 && (

              <div className="transaction-empty">

                <div className="transaction-empty-icon">
                  ≡
                </div>

                <h3>
                  No transactions found
                </h3>

                <p>
                  Your lending, borrowing and repayment
                  transactions will appear here.
                </p>

                <button
                  className="wallet-btn"
                  type="button"
                  onClick={
                    loadTransactions
                  }
                >
                  Refresh Transactions
                </button>

              </div>

            )}


          {/* TRANSACTIONS */}

          {!loading &&
            filteredTransactions.length > 0 && (

              <div className="transaction-rows">

                {filteredTransactions.map(
                  (transaction, index) => (

                    <div
                      className="transaction-row"
                      key={`${transaction.hash}-${transaction.type}-${index}`}
                    >

                      <span>
                        {transaction.type}
                      </span>

                      <span>
                        {transaction.asset}
                      </span>

                      <strong>
                        {transaction.amount}
                      </strong>

                      <span>
                        {transaction.status}
                      </span>

                      <span>
                        {transaction.date}
                      </span>

                      <a
                        href={`https://sepolia.etherscan.io/tx/${transaction.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        title={transaction.hash}
                      >
                        {shortenHash(
                          transaction.hash
                        )}
                      </a>

                    </div>

                  )
                )}

              </div>

            )}

        </div>

      </section>


      {/* INFORMATION */}

      <section className="transaction-info">

        <div className="transaction-info-icon">
          i
        </div>

        <div>

          <p className="risk-card-label">
            TRANSACTION DATA
          </p>

          <h3>
            Transparent on-chain activity
          </h3>

          <p>
            Every lending, borrowing and repayment
            operation is read directly from the Sepolia
            blockchain. Transaction hashes can be used
            to verify activity on the network.
          </p>

        </div>

      </section>

    </div>
  )
}

export default Transactions