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

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_DIR = path.resolve(__dirname, '../../server/uploads')

/**
 * Фабрика Express-приложения — вынесена из server.js чтобы тесты могли
 * создавать изолированный экземпляр без реального запуска сервера на порту.
 */
export const createApp = () => {
  const app = express()
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

  app.use(helmet())
  app.use(compression())
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        return callback(null, true)
      }
      callback(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true
  }))
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true, limit: '2mb' }))

  // В тестах rate limiting отключаем чтобы не мешал повторным запросам
  if (process.env.NODE_ENV !== 'test') {
    app.use('/api/admin', adminLimiter)
    app.use('/api', generalLimiter)
  }

  app.use(sanitizeQuery)

  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
  }, express.static(UPLOADS_DIR))

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
