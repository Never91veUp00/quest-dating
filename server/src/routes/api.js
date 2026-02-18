import express from 'express'
import templatesRoutes from './templates.js'
import authorsRoutes from './authors.js'
import categoriesRoutes from './categories.js'
import tagsRoutes from './tags.js'
import reviewsRoutes from './reviews.js'
import ordersRoutes from './orders.js'
import questsRoutes from './quests.js'

const router = express.Router()

// Подключение всех маршрутов
router.use('/templates', templatesRoutes)
router.use('/authors', authorsRoutes)
router.use('/categories', categoriesRoutes)
router.use('/tags', tagsRoutes)
router.use('/reviews', reviewsRoutes)
router.use('/orders', ordersRoutes)
router.use('/quests', questsRoutes)

// Базовый endpoint для проверки API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Quest Marketplace API',
    version: '2.0.0',
    endpoints: {
      templates: '/api/templates',
      authors: '/api/authors',
      categories: '/api/categories',
      tags: '/api/tags',
      reviews: '/api/reviews',
      orders: '/api/orders',
      quests: '/api/quests'
    }
  })
})

export default router