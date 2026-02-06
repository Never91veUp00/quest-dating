import express from 'express'
import { body } from 'express-validator'
import * as orderController from '../controllers/orderController.js'

const router = express.Router()

router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('template_id').optional().isInt()
], orderController.createOrder)

export default router