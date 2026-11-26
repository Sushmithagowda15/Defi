import './config/env.js'
import express from 'express'
import cors from 'cors'
import { initDatabase } from './config/db.js'
import { getJwtSecret } from './config/jwt.js'
import authRoutes from './routes/authRoutes.js'

const app = express()
const PORT = process.env.PORT || 5000

// Express Proxy Trust Configuration
// Prevents clients from spoofing their IP using untrusted X-Forwarded-For headers.
// Respects TRUST_PROXY environment variable, with secure defaults per deployment environment.
if (process.env.TRUST_PROXY !== undefined) {
  const tp = process.env.TRUST_PROXY.trim().toLowerCase()
  if (tp === 'true') {
    app.set('trust proxy', true)
  } else if (tp === 'false') {
    app.set('trust proxy', false)
  } else if (!Number.isNaN(Number(tp))) {
    app.set('trust proxy', Number(tp))
  } else {
    app.set('trust proxy', process.env.TRUST_PROXY.trim())
  }
} else if (process.env.NODE_ENV === 'production') {
  // Standard production deployment: trust 1 upstream reverse proxy (Nginx, Cloudflare, ALB)
  app.set('trust proxy', 1)
} else {
  // Development default: trust local proxies/loopback connections
  app.set('trust proxy', 'loopback')
}

// Build allowed origins list from environment and local dev origins
function getAllowedOrigins() {
  const origins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ])

  if (process.env.FRONTEND_URL) {
    try {
      const url = new URL(process.env.FRONTEND_URL)
      origins.add(url.origin)
    } catch {
      origins.add(process.env.FRONTEND_URL.replace(/\/$/, ''))
    }
  }

  if (process.env.CORS_ORIGINS) {
    process.env.CORS_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean)
      .forEach((o) => {
        try {
          const url = new URL(o)
          origins.add(url.origin)
        } catch {
          origins.add(o.replace(/\/$/, ''))
        }
      })
  }

  return origins
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true)

      const allowedOrigins = getAllowedOrigins()

      if (allowedOrigins.has(origin)) {
        return callback(null, true)
      }

      // In non-production, allow localhost with any port for development ease
      if (process.env.NODE_ENV !== 'production') {
        if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true)
        }
      }

      return callback(new Error('CORS policy: Access denied from this origin'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'DeFiLend Auth Backend',
    timestamp: new Date().toISOString(),
  })
})

// Authentication routes
app.use('/api/auth', authRoutes)

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
})

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS policy:')) {
    return res.status(403).json({
      message: err.message,
    })
  }
  console.error('Unhandled server error:', err.message)
  res.status(500).json({
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  })
})

// Initialize DB schema, validate security configuration, and start server
async function startServer() {
  try {
    // 1. Verify JWT_SECRET is configured and meets security requirements (fails safely if missing)
    getJwtSecret()

    // 2. Initialize database schema and migrations (fails safely if essential SQL fails)
    await initDatabase()

    app.listen(PORT, () => {
      console.log(`===============================================`)
      console.log(`DeFiLend Backend running on port ${PORT}`)
      console.log(`Health check: http://localhost:${PORT}/api/health`)
      console.log(`Auth endpoints: http://localhost:${PORT}/api/auth`)
      console.log(`===============================================`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

startServer()

export default app
