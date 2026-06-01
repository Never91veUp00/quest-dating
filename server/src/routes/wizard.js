import express from 'express'
import { body } from 'express-validator'
import * as wizardController from '../controllers/wizardController.js'

const router = express.Router()

// Публичный — получить схему вопросов опросника по шаблону
router.get('/:templateSlug/schema', wizardController.getWizardSchema)

// Публичный — отправить ответы → создать заказ + draft-квест
router.post('/:templateSlug/submit', [
  body('client_name').trim().notEmpty().withMessage('Имя клиента обязательно'),
  body('client_email').isEmail().withMessage('Email обязателен'),
  body('answers').isObject().withMessage('answers должен быть объектом'),
], wizardController.submitWizard)

export default router