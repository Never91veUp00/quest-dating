import express from 'express'
import { body } from 'express-validator'
import { login } from '../controllers/authController.js'
import { contactLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// POST /api/auth/login
// contactLimiter переиспользуем — 3 попытки в час, подходит для защиты от брутфорса
router.post('/login', contactLimiter, [
  body('username').trim().notEmpty(),
  body('password').notEmpty()
], login)

export default router