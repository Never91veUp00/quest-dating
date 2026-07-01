import pg from 'pg'
import dotenv from 'dotenv'
import { logger } from '../utils/logger.js'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quest_dating',
  user: process.env.DB_USER || 'quest_user',
  password: process.env.DB_PASSWORD,
  max: 20,
  min: 2,
  idleTimeoutMillis: 600_000,
  connectionTimeoutMillis: 5000,
  keepAlive: true,
})

// Only log unexpected errors, NOT every pool connection (that's just spam)
pool.on('error', (err) => {
  logger.error('Unexpected database pool error', { code: err.code, msg: err.message })
})

// One-time startup connectivity check
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('Database connection failed at startup', { error: err.message })
  } else {
    logger.info('Database connected', { time: res.rows[0].now })
  }
})

export default pool
