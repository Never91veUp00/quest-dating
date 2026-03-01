import express from 'express'
import { body, validationResult } from 'express-validator'
import { contactLimiter } from '../middleware/rateLimiter.js'
import { notifyContactMessage } from '../services/notificationService.js'

const router = express.Router()

// POST /api/contact
router.post('/',
  contactLimiter,
  [
    body('name').trim().notEmpty().withMessage('Имя обязательно').isLength({ max: 100 }),
    body('phone').trim().notEmpty().withMessage('Номер телефона обязателен').isLength({ max: 20 }),
    body('message').trim().notEmpty().withMessage('Сообщение обязательно').isLength({ min: 10, max: 2000 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() })
      }

      const { name, phone, message } = req.body

      // Отправляем в Telegram — не блокируем ответ если упадёт
      notifyContactMessage({ name, phone, message }).catch(err =>
        console.error('Contact notification error:', err)
      )

      res.json({
        success: true,
        message: 'Сообщение отправлено! Мы свяжемся с вами в ближайшее время.'
      })
    } catch (error) {
      next(error)
    }
  }
)

export default router
