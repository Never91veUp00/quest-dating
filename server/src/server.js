import dotenv from 'dotenv'
import { createApp } from './app.js'
import { logger } from './utils/logger.js'

dotenv.config()

const PORT = process.env.PORT || 5000
const app = createApp()

const server = app.listen(PORT, () => {
  logger.info('Server started', { port: PORT, env: process.env.NODE_ENV })
})

// Graceful shutdown
const shutdown = (signal) => {
  logger.warn(`${signal} received. Shutting down gracefully...`)
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
  setTimeout(() => { process.exit(1) }, 10000)
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
