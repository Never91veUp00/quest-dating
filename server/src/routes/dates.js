import express from 'express'
import * as dateController from '../controllers/dateController.js'

const router = express.Router()

// GET /api/dates/:slug - Публичный доступ к квесту
router.get('/:slug', dateController.getDateBySlug)

export default router