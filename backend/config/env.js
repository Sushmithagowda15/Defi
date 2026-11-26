import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 1. Load backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// 2. Load workspace root .env if present
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

// 3. Fallback to process.cwd() .env
dotenv.config()
