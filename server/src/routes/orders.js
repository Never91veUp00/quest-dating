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
  body('description').trim().notEmpty().withMessage('Описание обязательно')
], orderController.createOrder)

// Публичный — просмотр заказа по токену (должен быть ДО /:id)
router.get('/by-token/:token', orderController.getOrderByToken)

// Admin-only
router.get('/',           requireAdmin, orderController.getAllOrders)
router.get('/stats',      requireAdmin, orderController.getOrdersStats)
router.get('/:id',        requireAdmin, orderController.getOrderById)
router.patch('/:id/status', requireAdmin, [
  body('status').notEmpty().withMessage('Статус обязателен')
], orderController.updateOrderStatus)
router.delete('/:id',     requireAdmin, orderController.deleteOrder)

export default router
