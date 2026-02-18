import express from 'express'
import * as templateController from '../controllers/templateController.js'

const router = express.Router()

// GET /api/templates - Получить все шаблоны с фильтрами
router.get('/', templateController.getAllTemplates)

// GET /api/templates/popular - Популярные шаблоны
router.get('/popular', templateController.getPopularTemplates)

// GET /api/templates/featured - Избранные шаблоны
router.get('/featured', templateController.getFeaturedTemplates)

// GET /api/templates/newest - Новые шаблоны
router.get('/newest', templateController.getNewestTemplates)

// GET /api/templates/:slug - Детальная информация о шаблоне
router.get('/:slug', templateController.getTemplateBySlug)

// GET /api/templates/:slug/similar - Похожие шаблоны
router.get('/:slug/similar', templateController.getSimilarTemplates)

export default router