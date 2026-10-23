import { useEffect, useState } from 'react'
import {
  JsonRpcProvider,
  formatEther,
  formatUnits,
  id,
} from 'ethers'

import { useWallet } from '../context/WalletContext'

const SEPOLIA_RPC_URL =
  'https://sepolia.gateway.tenderly.co'

const SEPOLIA_CHAIN_ID = 11155111

const CURRENT_LENDING_POOL =
  '0xc7EF79cA55309fB0C35267142CF771D41e6d9076'

const OLD_LENDING_POOL =
  '0xf49D97Eb1fa32aFA40A9d8Bf717E258573bF76F0'

/*
 * Event topics.
 *
 * Indexed/non-indexed status does NOT affect the
 * event signature hash.
 */
const TOPIC_COLLATERAL_DEPOSITED =
  id('CollateralDeposited(address,uint256)')

const TOPIC_COLLATERAL_WITHDRAWN =
  id('CollateralWithdrawn(address,uint256)')

const TOPIC_BORROWED =
  id('Borrowed(address,uint256)')

const TOPIC_REPAID =
  id('Repaid(address,uint256)')

const TOPIC_LIQUIDATED =
  id(
    'Liquidated(address,address,uint256,uint256)'
  )

const EVENT_TOPICS = [
  TOPIC_COLLATERAL_DEPOSITED,
  TOPIC_COLLATERAL_WITHDRAWN,
  TOPIC_BORROWED,
  TOPIC_REPAID,
  TOPIC_LIQUIDATED,
]

const CHUNK_SIZE = 1000

/*
 * Convert a topic containing an address into
 * a normal Ethereum address.
 */
function topicToAddress(topic) {
  if (!topic) {
    return ''
  }

  return `0x${topic.slice(-40)}`.toLowerCase()
}

/*
 * Convert a 32-byte topic/data word to BigInt.
 */
function hexToBigInt(value) {
  if (!value) {
    return 0n
  }

  return BigInt(value)
}

/*
 * Read a uint256 from the data field.
 *
 * data contains 32-byte words:
 *
 * 0x
 * + 64 hex characters per uint256
 */
function readDataWord(data, index = 0) {
  const start = 2 + index * 64
  const end = start + 64

  const word = data.slice(start, end)

  if (!word) {
    return 0n
  }

  return BigInt(`0x${word}`)
}

function Transactions() {
  const { walletAddress } = useWallet()

  const [transactions, setTransactions] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [filter, setFilter] =
    useState('All Transactions')

  const [totalSupplied, setTotalSupplied] =
    useState('0')

  const [totalBorrowed, setTotalBorrowed] =
    useState('0')

  const [totalRepaid, setTotalRepaid] =
    useState('0')

  const loadTransactions = async () => {
    if (!walletAddress) {
      setTransactions([])
      setTotalSupplied('0')
      setTotalBorrowed('0')
      setTotalRepaid('0')
      setError('')
      return
    }

    try {
      setLoading(true)
      setError('')

      const wallet =
        walletAddress.toLowerCase()

      console.log(
        'Transactions wallet:',
        wallet
      )

      /*
       * Dedicated Sepolia historical-log RPC.
       */
      const provider =
        new JsonRpcProvider(
          SEPOLIA_RPC_URL,
          SEPOLIA_CHAIN_ID,
          {
            staticNetwork: true,
          }
        )

      /*
       * Confirm Sepolia.
       */
      const network =
        await provider.getNetwork()

      if (
        Number(network.chainId) !==
        SEPOLIA_CHAIN_ID
      ) {
        throw new Error(
          'Transaction reader is not connected to Sepolia.'
        )
      }

      const latestBlock =
        await provider.getBlockNumber()

      console.log(
        'Latest Sepolia block:',
        latestBlock
      )

      /*
       * We know the old transactions exist in
       * this historical range from the direct
       * Tenderly RPC test.
       */
      const poolRanges = [
        {
          address:
            CURRENT_LENDING_POOL,
          fromBlock: Math.max(
            latestBlock - 50000,
            0
          ),
          toBlock: latestBlock,
        },

        {
          address:
            OLD_LENDING_POOL,
          fromBlock: 11509000,
          toBlock: 11617000,
        },
      ]

      const allTransactions = []

      let supplied = 0
      let withdrawn = 0
      let borrowed = 0
      let repaid = 0

      const blockTimestampCache =
        new Map()

      /*
       * Process each deployed LendingPool.
       */
      for (const pool of poolRanges) {
        console.log(
          'Scanning pool:',
          pool.address
        )

        console.log(
          'Range:',
          pool.fromBlock,
          'to',
          pool.toBlock
        )

        /*
         * Scan in 1000-block chunks.
         */
        for (
          let start = pool.fromBlock;
          start <= pool.toBlock;
          start += CHUNK_SIZE
        ) {
          const end = Math.min(
            start + CHUNK_SIZE - 1,
            pool.toBlock
          )

          let logs = []

          try {
            logs =
              await provider.getLogs({
                address:
                  pool.address,
                fromBlock: start,
                toBlock: end,
                topics: [
                  EVENT_TOPICS,
                ],
              })
          } catch (logError) {
            console.error(
              `getLogs failed for ${start}-${end}:`,
              logError
            )

            continue
          }

          if (logs.length > 0) {
            console.log(
              `Found ${logs.length} logs in ${start}-${end}`
            )
          }

          /*
           * Decode every raw event manually.
           */
          for (const log of logs) {
            try {
              if (
                !log.topics ||
                log.topics.length === 0
              ) {
                continue
              }

              const eventTopic =
                log.topics[0]

              /*
               * ============================
               * COLLATERAL DEPOSITED
               * ============================
               *
               * Old deployment:
               *
               * topics[0] = event signature
               * topics[1] = user
               * topics[2] = amount
               *
               * Current deployment:
               *
               * topics[0] = event signature
               * topics[1] = borrower
               * data = amount
               *
               * We support BOTH formats.
               */
              if (
                eventTopic ===
                TOPIC_COLLATERAL_DEPOSITED
              ) {
                const user =
                  topicToAddress(
                    log.topics[1]
                  )

                if (user !== wallet) {
                  continue
                }

                let amountWei = 0n

                /*
                 * Old contract:
                 * amount is indexed.
                 */
                if (
                  log.topics.length >= 3
                ) {
                  amountWei =
                    hexToBigInt(
                      log.topics[2]
                    )
                } else {
                  /*
                   * New contract:
                   * amount is in data.
                   */
                  amountWei =
                    readDataWord(
                      log.data,
                      0
                    )
                }

                const amount =
                  Number(
                    formatEther(
                      amountWei
                    )
                  )

                supplied += amount

                const date =
                  await getBlockDate(
                    provider,
                    log.blockNumber,
                    blockTimestampCache
                  )

                allTransactions.push({
                  type: 'Supply',
                  asset: 'ETH',
                  amount:
                    `${amount.toFixed(
                      6
                    )} ETH`,
                  status:
                    'Confirmed',
                  date,
                  hash:
                    log.transactionHash,
                  blockNumber:
                    log.blockNumber,
                })

                continue
              }

              /*
               * ============================
               * COLLATERAL WITHDRAWN
               * ============================
               */
              if (
                eventTopic ===
                TOPIC_COLLATERAL_WITHDRAWN
              ) {
                const user =
                  topicToAddress(
                    log.topics[1]
                  )

                if (user !== wallet) {
                  continue
                }

                /*
                 * Current/old deployed event
                 * uses amount in data.
                 */
                const amountWei =
                  readDataWord(
                    log.data,
                    0
                  )

                const amount =
                  Number(
                    formatEther(
                      amountWei
                    )
                  )

                withdrawn += amount

                const date =
                  await getBlockDate(
                    provider,
                    log.blockNumber,
                    blockTimestampCache
                  )

                allTransactions.push({
                  type: 'Withdraw',
                  asset: 'ETH',
                  amount:
                    `${amount.toFixed(
                      6
                    )} ETH`,
                  status:
                    'Confirmed',
                  date,
                  hash:
                    log.transactionHash,
                  blockNumber:
                    log.blockNumber,
                })

                continue
              }

              /*
               * ============================
               * BORROW
               * ============================
               */
              if (
                eventTopic ===
                TOPIC_BORROWED
              ) {
                const user =
                  topicToAddress(
                    log.topics[1]
                  )

                if (user !== wallet) {
                  continue
                }

                const amount =
                  Number(
                    formatUnits(
                      readDataWord(
                        log.data,
                        0
                      ),
                      6
                    )
                  )

                borrowed += amount

                const date =
                  await getBlockDate(
                    provider,
                    log.blockNumber,
                    blockTimestampCache
                  )

                allTransactions.push({
                  type: 'Borrow',
                  asset: 'USDC',
                  amount:
                    `${amount.toFixed(
                      6
                    )} USDC`,
                  status:
                    'Confirmed',
                  date,
                  hash:
                    log.transactionHash,
                  blockNumber:
                    log.blockNumber,
                })

                continue
              }

              /*
               * ============================
               * REPAY
               * ============================
               */
              if (
                eventTopic ===
                TOPIC_REPAID
              ) {
                const user =
                  topicToAddress(
                    log.topics[1]
                  )

                if (user !== wallet) {
                  continue
                }

                const amount =
                  Number(
                    formatUnits(
                      readDataWord(
                        log.data,
                        0
                      ),
                      6
                    )
                  )

                repaid += amount

                const date =
                  await getBlockDate(
                    provider,
                    log.blockNumber,
                    blockTimestampCache
                  )

                allTransactions.push({
                  type: 'Repay',
                  asset: 'USDC',
                  amount:
                    `${amount.toFixed(
                      6
                    )} USDC`,
                  status:
                    'Confirmed',
                  date,
                  hash:
                    log.transactionHash,
                  blockNumber:
                    log.blockNumber,
                })

                continue
              }

              /*
               * ============================
               * LIQUIDATION
               * ============================
               *
               * topics[1] = borrower
               * topics[2] = liquidator
               *
               * data word 0 = debtRepaid
               * data word 1 = collateralSeized
               */
              if (
                eventTopic ===
                TOPIC_LIQUIDATED
              ) {
                const borrower =
                  topicToAddress(
                    log.topics[1]
                  )

                const liquidator =
                  topicToAddress(
                    log.topics[2]
                  )

                if (
                  borrower !== wallet &&
                  liquidator !== wallet
                ) {
                  continue
                }

                const debtRepaid =
                  Number(
                    formatUnits(
                      readDataWord(
                        log.data,
                        0
                      ),
                      6
                    )
                  )

                const date =
                  await getBlockDate(
                    provider,
                    log.blockNumber,
                    blockTimestampCache
                  )

                allTransactions.push({
                  type:
                    'Liquidation',
                  asset:
                    'ETH / USDC',
                  amount:
                    `${debtRepaid.toFixed(
                      6
                    )} USDC`,
                  status:
                    'Confirmed',
                  date,
                  hash:
                    log.transactionHash,
                  blockNumber:
                    log.blockNumber,
                })
              }
            } catch (eventError) {
              console.error(
                'Failed to decode blockchain event:',
                eventError,
                log
              )
            }
          }
        }
      }

      /*
       * Remove duplicates.
       */
      const uniqueTransactions =
        Array.from(
          new Map(
            allTransactions.map(
              (transaction) => [
                `${transaction.hash}-${transaction.type}`,
                transaction,
              ]
            )
          ).values()
        )

      /*
       * Newest first.
       */
      uniqueTransactions.sort(
        (a, b) => {
          if (
            b.blockNumber !==
            a.blockNumber
          ) {
            return (
              b.blockNumber -
              a.blockNumber
            )
          }

          return (
            new Date(b.date) -
            new Date(a.date)
          )
        }
      )

      console.log(
        'FINAL TRANSACTIONS:',
        uniqueTransactions
      )

      console.log(
        'TOTAL TRANSACTIONS:',
        uniqueTransactions.length
      )

      setTransactions(
        uniqueTransactions
      )

      /*
       * Summary.
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

      setError(
        error?.shortMessage ||
          error?.message ||
          'Failed to load blockchain transactions.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [walletAddress])

  const handleFilterChange = (
    event
  ) => {
    setFilter(
      event.target.value
    )
  }

  const filteredTransactions =
    transactions.filter(
      (transaction) => {
        if (
          filter ===
          'All Transactions'
        ) {
          return true
        }

        return (
          transaction.type ===
          filter
        )
      }
    )

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <div>
          <h1>Transactions</h1>
          <p>
            View your lending activity
            on the Sepolia blockchain.
          </p>
        </div>

        <button
          type="button"
          className="refresh-btn"
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

      {!walletAddress && (
        <div className="transactions-empty">
          <p>
            Connect your wallet to view
            your transactions.
          </p>
        </div>
      )}

      {walletAddress && error && (
        <div className="transactions-error">
          {error}
        </div>
      )}

      {walletAddress && (
        <>
          <div className="transaction-summary">
            <div className="summary-card">
              <span>
                Total Transactions
              </span>
              <strong>
                {transactions.length}
              </strong>
            </div>

            <div className="summary-card">
              <span>
                Total Supplied
              </span>
              <strong>
                {totalSupplied} ETH
              </strong>
            </div>

            <div className="summary-card">
              <span>
                Total Borrowed
              </span>
              <strong>
                {totalBorrowed} USDC
              </strong>
            </div>

            <div className="summary-card">
              <span>
                Total Repaid
              </span>
              <strong>
                {totalRepaid} USDC
              </strong>
            </div>
          </div>

          <div className="transactions-controls">
            <select
              value={filter}
              onChange={
                handleFilterChange
              }
            >
              <option>
                All Transactions
              </option>

              <option>
                Supply
              </option>

              <option>
                Withdraw
              </option>

              <option>
                Borrow
              </option>

              <option>
                Repay
              </option>

              <option>
                Liquidation
              </option>
            </select>
          </div>

          <div className="transactions-table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Asset</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>
                    Transaction Hash
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading &&
                transactions.length ===
                  0 ? (
                  <tr>
                    <td colSpan="6">
                      Loading blockchain
                      transactions...
                    </td>
                  </tr>
                ) : filteredTransactions.length ===
                  0 ? (
                  <tr>
                    <td colSpan="6">
                      No transactions
                      found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map(
                    (transaction) => (
                      <tr
                        key={`${transaction.hash}-${transaction.type}`}
                      >
                        <td>
                          {
                            transaction.type
                          }
                        </td>

                        <td>
                          {
                            transaction.asset
                          }
                        </td>

                        <td>
                          {
                            transaction.amount
                          }
                        </td>

                        <td>
                          {
                            transaction.status
                          }
                        </td>

                        <td>
                          {
                            transaction.date
                          }
                        </td>

                        <td>
                          <a
                            href={`https://sepolia.etherscan.io/tx/${transaction.hash}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {transaction.hash.slice(
                              0,
                              8
                            )}
                            ...
                            {transaction.hash.slice(
                              -6
                            )}
                          </a>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

/*
 * Fetch and cache a block timestamp.
 */
async function getBlockDate(
  provider,
  blockNumber,
  cache
) {
  if (cache.has(blockNumber)) {
    return cache.get(blockNumber)
  }

  const block =
    await provider.getBlock(
      blockNumber
    )

  if (!block) {
    return '--'
  }

  const date =
    new Date(
      Number(block.timestamp) * 1000
    ).toLocaleString()

  cache.set(
    blockNumber,
    date
  )

  return date
}

export default Transactions