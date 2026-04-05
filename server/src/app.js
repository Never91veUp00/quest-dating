import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import path from 'path'
import { fileURLToPath } from 'url'
import apiRoutes from './routes/api.js'
import { errorHandler } from './middleware/errorHandler.js'
import { sanitizeQuery } from './middleware/validator.js'
import { generalLimiter, adminLimiter } from './middleware/rateLimiter.js'
import { httpLogger, logger } from './utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(__dirname, '../uploads')

export const createApp = () => {
  const app = express()
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

  app.use(helmet())
  app.use(compression())
  app.use(cors({
    origin: (origin, callback) => {
      // Запросы без origin (server-to-server, Nuxt SSR, curl) — всегда разрешаем
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      // В dev и при локальном запуске — разрешаем localhost
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true)
      }
      callback(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true
  }))
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true, limit: '2mb' }))

  if (process.env.NODE_ENV !== 'test') {
    app.use('/api/admin', adminLimiter)
    app.use('/api', generalLimiter)
  }

  app.use(sanitizeQuery)
  app.use(httpLogger)

  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
  }, express.static(UPLOADS_DIR), (req, res) => {
    // Файл не найден локально — отдаём заглушку вместо 404
    logger.debug(`[uploads fallback] ${req.url} -> placeholder.svg`, { uploadsDir: UPLOADS_DIR })
    const placeholderPath = path.resolve(__dirname, '../../client-nuxt/public/images/placeholder.svg')
    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.sendFile(placeholderPath, (err) => {
      if (err) {
        logger.error(`[uploads fallback] placeholder not found at: ${placeholderPath}`)
        res.status(404).json({ error: 'File not found' })
      }
    })
  })

  app.use('/api', apiRoutes)

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() })
  })

  app.get('/', (req, res) => {
    res.json({ message: 'Quest Dating API', version: '2.0.0' })
  })

  app.use(errorHandler)

  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' })
  })

  return app
}
