import express from 'express'
import { body } from 'express-validator'
import * as reviewController from '../controllers/reviewController.js'

const router = express.Router()

// GET /api/reviews/template/:templateId - Отзывы для шаблона
router.get('/template/:templateId', reviewController.getTemplateReviews)

// POST /api/reviews - Создать отзыв
router.post('/', [
  body('template_id').isInt().withMessage('template_id должен быть числом'),
  body('client_name').trim().notEmpty().withMessage('Имя обязательно'),
  body('client_email').isEmail().withMessage('Некорректный email'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Рейтинг от 1 до 5'),
  body('comment').trim().notEmpty().withMessage('Комментарий обязателен')
], reviewController.createReview)

// POST /api/reviews/:id/helpful - Отметить отзыв как полезный
router.post('/:id/helpful', reviewController.markReviewHelpful)

export default router