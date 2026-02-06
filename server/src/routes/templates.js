import express from 'express'
import * as templateController from '../controllers/templateController.js'

const router = express.Router()

// GET /api/templates - Получить все шаблоны
router.get('/', templateController.getAllTemplates)

// GET /api/templates/:id - Получить шаблон по ID
router.get('/:id', templateController.getTemplateById)

export default router