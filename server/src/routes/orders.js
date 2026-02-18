import express from 'express'
import { body } from 'express-validator'
import * as orderController from '../controllers/orderController.js'

const router = express.Router()

// GET /api/orders - Все заказы (для админки)
router.get('/', orderController.getAllOrders)

// GET /api/orders/stats - Статистика заказов
router.get('/stats', orderController.getOrdersStats)

// GET /api/orders/:id - Заказ по ID
router.get('/:id', orderController.getOrderById)

// POST /api/orders - Создать заказ
router.post('/', [
  body('template_id').isInt().withMessage('template_id обязателен'),
  body('client_name').trim().notEmpty().withMessage('Имя обязательно'),
  body('client_email').isEmail().withMessage('Email обязателен'),
  body('description').trim().notEmpty().withMessage('Описание обязательно')
], orderController.createOrder)

// PATCH /api/orders/:id/status - Обновить статус заказа
router.patch('/:id/status', [
  body('status').notEmpty().withMessage('Статус обязателен')
], orderController.updateOrderStatus)

export default router