import express from 'express'
import templatesRoutes from './templates.js'
import categoriesRoutes from './categories.js'
import tagsRoutes from './tags.js'
import reviewsRoutes from './reviews.js'
import ordersRoutes from './orders.js'
import questsRoutes from './quests.js'
import authRoutes from './auth.js'

const router = express.Router()

// Подключение всех маршрутов
router.use('/templates', templatesRoutes)
router.use('/categories', categoriesRoutes)
router.use('/tags', tagsRoutes)
router.use('/reviews', reviewsRoutes)
router.use('/orders', ordersRoutes)
router.use('/quests', questsRoutes)
router.use('/auth', authRoutes)

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