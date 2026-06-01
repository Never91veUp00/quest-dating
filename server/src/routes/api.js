import express from 'express'
import templatesRoutes from './templates.js'
import categoriesRoutes from './categories.js'
import tagsRoutes from './tags.js'
import reviewsRoutes from './reviews.js'
import ordersRoutes from './orders.js'
import questsRoutes from './quests.js'
import wizardRoutes from './wizard.js'
import authRoutes from './auth.js'
import adminRoutes from './admin.js'
import contactRoutes from './contact.js'
import telegramRoutes from './telegram.js'
import { getPlatformStats } from '../services/statsService.js'
import pool from '../config/database.js'

const router = express.Router()

// Публичная статистика платформы
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await getPlatformStats()
    res.json({ success: true, data: stats })
  } catch (error) {
    next(error)
  }
})

// Sitemap URLs
router.get('/sitemap-urls', async (req, res, next) => {
  try {
    const templates = await pool.query(
      "SELECT slug FROM quest_templates WHERE status = 'published'"
    )
    const categories = await pool.query(
      'SELECT slug FROM categories'
    )
    res.json({
      success: true,
      data: {
        templates: templates.rows.map(r => r.slug),
        categories: categories.rows.map(r => r.slug)
      }
    })
  } catch (error) {
    next(error)
  }
})

// Подключение всех маршрутов
router.use('/templates', templatesRoutes)
router.use('/categories', categoriesRoutes)
router.use('/tags', tagsRoutes)
router.use('/reviews', reviewsRoutes)
router.use('/orders', ordersRoutes)
router.use('/quests', questsRoutes)
router.use('/wizard', wizardRoutes)
router.use('/auth', authRoutes)
router.use('/admin', adminRoutes)
router.use('/contact', contactRoutes)
router.use('/telegram', telegramRoutes)

// Базовый endpoint для проверки API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Quest Dating API',
    version: '2.0.0',
    endpoints: {
      templates: '/api/templates',
      categories: '/api/categories',
      tags: '/api/tags',
      reviews: '/api/reviews',
      orders: '/api/orders',
      quests: '/api/quests'
    }
  })
})

export default router