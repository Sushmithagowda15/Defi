import './env.js'
import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { AsyncLocalStorage } from 'async_hooks'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database file path: backend/data/defilend.db (or DB_PATH from environment)
const defaultDataDir = path.resolve(__dirname, '../data')

const dbPath = process.env.DB_PATH
  ? path.resolve(__dirname, '..', process.env.DB_PATH)
  : path.join(defaultDataDir, 'defilend.db')

// Ensure target database directory exists
const targetDir = path.dirname(dbPath)
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true })
}

const sqlite = sqlite3.verbose()

export const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message)
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`)
  }
})

// AsyncLocalStorage to track whether the current async execution context is inside an active transaction
const txContext = new AsyncLocalStorage()

/**
 * Promise-based mutex to serialize SQLite database access and isolate transactions.
 * Prevents concurrent transactions from crashing SQLite ('cannot start a transaction within a transaction')
 * and prevents ordinary queries from executing inside another operation's active transaction.
 */
class AsyncLock {
  constructor() {
    this.queue = Promise.resolve()
  }

  acquire() {
    let release
    const wait = new Promise((resolve) => {
      release = resolve
    })
    const ticket = this.queue.then(() => release)
    this.queue = this.queue.catch(() => {}).then(() => wait)
    return ticket
  }
}

const dbMutex = new AsyncLock()

/**
 * Execute an operation under the database mutex lock.
 * If already inside an active transaction context, executes immediately without re-acquiring the lock (avoiding deadlocks).
 */
async function withDbLock(fn) {
  const store = txContext.getStore()
  if (store && store.inTx) {
    return fn()
  }

  const release = await dbMutex.acquire()
  try {
    return await fn()
  } finally {
    release()
  }
}

// Low-level query functions directly using the sqlite connection
function rawGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err)
      resolve(row)
    })
  })
}

function rawAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err)
      resolve(rows)
    })
  })
}

function rawRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err)
      resolve({
        id: this.lastID,
        changes: this.changes,
      })
    })
  })
}

// Promise helper for SELECT returning a single row
export function dbGet(sql, params = []) {
  return withDbLock(() => rawGet(sql, params))
}

// Promise helper for SELECT returning multiple rows
export function dbAll(sql, params = []) {
  return withDbLock(() => rawAll(sql, params))
}

// Promise helper for INSERT / UPDATE / DELETE
export function dbRun(sql, params = []) {
  return withDbLock(() => rawRun(sql, params))
}

/**
 * Run operations inside an isolated SQLite transaction.
 * Acquires write lock with BEGIN IMMEDIATE,
 * commits if callback resolves, or rolls back if callback throws.
 * Outside queries wait until the transaction completes, preventing interleaved queries.
 * @param {Function} callback - async (tx) => Promise<any>
 */
export async function dbTransaction(callback) {
  const store = txContext.getStore()
  if (store && store.inTx) {
    return callback({
      get: dbGet,
      all: dbAll,
      run: dbRun,
    })
  }

  const release = await dbMutex.acquire()
  try {
    return await txContext.run({ inTx: true }, async () => {
      await rawRun('BEGIN IMMEDIATE TRANSACTION;')
      try {
        const result = await callback({
          get: dbGet,
          all: dbAll,
          run: dbRun,
        })
        await rawRun('COMMIT;')
        return result
      } catch (err) {
        try {
          await rawRun('ROLLBACK;')
        } catch (rollbackErr) {
          console.error('Failed to rollback transaction:', rollbackErr.message)
        }
        throw err
      }
    })
  } finally {
    release()
  }
}

// Initialize database schema with safe migrations (fails startup if essential SQL fails)
export async function initDatabase() {
  return withDbLock(async () => {
    // 1. Enforce foreign keys and busy timeout
    await rawRun('PRAGMA foreign_keys = ON;')
    await rawRun('PRAGMA busy_timeout = 5000;')

    // 2. Users table
    await rawRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        passwordHash TEXT NOT NULL,
        walletAddress TEXT DEFAULT NULL,
        isVerified INTEGER DEFAULT 0,
        tokenVersion INTEGER NOT NULL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 3. Schema migrations for users table
    const columns = await rawAll('PRAGMA table_info(users);')
    const hasIsVerified = columns.some((col) => col.name === 'isVerified')
    const hasTokenVersion = columns.some((col) => col.name === 'tokenVersion')

    if (!hasIsVerified) {
      console.log('Adding isVerified column to users table...')
      await rawRun('ALTER TABLE users ADD COLUMN isVerified INTEGER DEFAULT 0;')
      await rawRun(
        'UPDATE users SET isVerified = 1 WHERE isVerified IS NULL OR isVerified = 0;'
      )
    }

    if (!hasTokenVersion) {
      console.log('Adding tokenVersion column to users table...')
      await rawRun(
        'ALTER TABLE users ADD COLUMN tokenVersion INTEGER NOT NULL DEFAULT 0;'
      )
      await rawRun(
        'UPDATE users SET tokenVersion = 0 WHERE tokenVersion IS NULL;'
      )
    }

    // 4. Password reset tokens table and index
    await rawRun(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        tokenHash TEXT NOT NULL UNIQUE,
        expiresAt DATETIME NOT NULL,
        usedAt DATETIME DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `)

    await rawRun(`
      CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash
      ON password_reset_tokens(tokenHash);
    `)

    // 5. Email verification tokens table and index
    await rawRun(`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        tokenHash TEXT NOT NULL UNIQUE,
        expiresAt DATETIME NOT NULL,
        usedAt DATETIME DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `)

    await rawRun(`
      CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token_hash
      ON email_verification_tokens(tokenHash);
    `)

    console.log('Database initialization and schema migrations complete')
  })
}
