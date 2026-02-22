import express from 'express'
import * as authorController from '../controllers/authorController.js'

const router = express.Router()

// GET /api/authors - Получить всех авторов
router.get('/', authorController.getAllAuthors)

// GET /api/authors/top - Топ авторы
router.get('/top', authorController.getTopAuthors)

// GET /api/authors/:username - Профиль автора
router.get('/:username', authorController.getAuthorByUsername)

// POST /api/authors - Создать автора (для будущей регистрации)
router.post('/', authorController.createAuthor)

export default router