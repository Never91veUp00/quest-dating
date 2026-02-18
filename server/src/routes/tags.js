import express from 'express'
import * as tagController from '../controllers/tagController.js'

const router = express.Router()

// GET /api/tags - Все теги
router.get('/', tagController.getAllTags)

// GET /api/tags/popular - Популярные теги
router.get('/popular', tagController.getPopularTags)

export default router