import dotenv from 'dotenv'
import { createApp } from './app.js'

dotenv.config()

const PORT = process.env.PORT || 5000
const app = createApp()

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
  setTimeout(() => { process.exit(1) }, 10000)
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
