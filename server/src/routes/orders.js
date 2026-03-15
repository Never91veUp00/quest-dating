import express from 'express'
import { body } from 'express-validator'
import * as orderController from '../controllers/orderController.js'
import { orderLimiter } from '../middleware/rateLimiter.js'
import { requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// Публичный — создать заказ
router.post('/', orderLimiter, [
  body('template_id').isInt().withMessage('template_id обязателен'),
  body('client_name').trim().notEmpty().withMessage('Имя обязательно'),
  body('client_email').isEmail().withMessage('Email обязателен'),
  body('description').optional({ checkFalsy: true })
], orderController.createOrder)

// Admin-only — всё остальное
router.get('/', requireAdmin, orderController.getAllOrders)
router.get('/stats', requireAdmin, orderController.getOrdersStats)
router.get('/:id', requireAdmin, orderController.getOrderById)
router.patch('/:id/status', requireAdmin, [
  body('status').notEmpty().withMessage('Статус обязателен')
], orderController.updateOrderStatus)

export default router