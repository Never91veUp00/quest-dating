import express from 'express'
import * as questController from '../controllers/questController.js'

const router = express.Router()

// GET /api/quests/:slug - Получить квест для прохождения
router.get('/:slug', questController.getQuestBySlug)

// POST /api/quests/:questId/session - Создать сессию прохождения
router.post('/:questId/session', questController.createQuestSession)

// PATCH /api/quests/session/:sessionId - Обновить прогресс
router.patch('/session/:sessionId', questController.updateSessionProgress)

// POST /api/quests/session/:sessionId/complete - Завершить квест
router.post('/session/:sessionId/complete', questController.completeQuest)

// GET /api/quests/session/:sessionId/stats - Статистика сессии
router.get('/session/:sessionId/stats', questController.getSessionStats)

export default router