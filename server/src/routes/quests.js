import express from 'express'
import * as questController from '../controllers/questController.js'

const router = express.Router()

// GET /api/quests/:slug - Получить квест для прохождения
router.get('/:slug', questController.getQuestBySlug)

// POST /api/quests/:slug/access - Отправить код доступа (безопаснее чем в query)
router.post('/:slug/access', questController.getQuestBySlug)

// POST /api/quests/:questId/session - Создать сессию прохождения
router.post('/:questId/session', questController.createQuestSession)

// GET /api/quests/session/:sessionId - Получить сессию (для восстановления прогресса)
router.get('/session/:sessionId/stats', questController.getSessionStats)

// PATCH /api/quests/session/:sessionId - Обновить прогресс
router.patch('/session/:sessionId', questController.updateSessionProgress)

// POST /api/quests/session/:sessionId/complete - Завершить квест
router.post('/session/:sessionId/complete', questController.completeQuest)

// POST /api/quests/session/:sessionId/restart - Начать сначала
router.post('/session/:sessionId/restart', questController.restartQuest)

export default router