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
app.use('/uploads', express.static('uploads'))

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Environment: ${process.env.NODE_ENV}`)
  console.log(`🌐 API available at http://localhost:${PORT}/api`)
})