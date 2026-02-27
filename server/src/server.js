import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import apiRoutes from './routes/api.js'
import { errorHandler } from './middleware/errorHandler.js'
import { sanitizeQuery } from './middleware/validator.js'
import { generalLimiter } from './middleware/rateLimiter.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []

// Middleware
app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    // Разрешаем запросы без origin (мобильные приложения, Postman, curl)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    // В dev режиме разрешаем localhost
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true)
    }
    callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting
app.use('/api', generalLimiter)

// Санитизация query параметров
app.use(sanitizeQuery)

// Статические файлы (загруженные изображения)
// Cross-Origin-Resource-Policy: cross-origin — разрешает загрузку с фронтенда на другом порту
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  next()
}, express.static('uploads'))

// API Routes
app.use('/api', apiRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Корневой endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Quest Dating API',
    version: '2.0.0',
    documentation: '/api'
  })
})

// Error handling
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  })
})

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Environment: ${process.env.NODE_ENV}`)
  console.log(`🌐 API available at http://localhost:${PORT}/api`)
})

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n🛑 ${signal} received. Shutting down gracefully...`)
  server.close(() => {
    console.log('✅ HTTP server closed')
    process.exit(0)
  })
  // Принудительно через 10 секунд
  setTimeout(() => { process.exit(1) }, 10000)
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))