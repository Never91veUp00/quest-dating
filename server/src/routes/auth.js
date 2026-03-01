import express from 'express'
import { body } from 'express-validator'
import { login } from '../controllers/authController.js'
// FIX: Используем loginLimiter вместо contactLimiter.
// contactLimiter (3/час) был слишком мягким для защиты от брутфорса.
// loginLimiter: 5 попыток / 15 минут, skipSuccessfulRequests: true.
import { loginLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// POST /api/auth/login
router.post('/login', loginLimiter, [
  body('username').trim().notEmpty(),
  body('password').notEmpty()
], login)

export default router