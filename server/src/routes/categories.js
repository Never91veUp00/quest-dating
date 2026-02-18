import express from 'express'
import * as categoryController from '../controllers/categoryController.js'

const router = express.Router()

// GET /api/categories - Все категории
router.get('/', categoryController.getAllCategories)

// GET /api/categories/:slug - Категория по slug
router.get('/:slug', categoryController.getCategoryBySlug)

export default router