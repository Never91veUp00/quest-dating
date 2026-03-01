import { describe, it, expect, beforeAll, vi } from 'vitest'
import request from 'supertest'
import pool from '@src/config/database.js'
import { createApp } from '@src/app.js'

let app
beforeAll(() => { app = createApp() })

describe('Quest Sessions API', () => {

  describe('POST /api/quests/:questId/session — создание сессии', () => {
    it('создаёт сессию для существующего квеста', async () => {
      const fakeSession = { session_id: 'sess-abc-123', created_quest_id: 5 }
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 5 }] })      // квест существует
        .mockResolvedValueOnce({ rows: [fakeSession] })     // INSERT сессии
        .mockResolvedValueOnce({})                          // UPDATE started_count

      const res = await request(app).post('/api/quests/5/session')

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.session_id).toBe('sess-abc-123')
    })

    it('возвращает 404 если квест не существует', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }) // квест не найден

      const res = await request(app).post('/api/quests/999/session')

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
    })
  })

  describe('PATCH /api/quests/session/:sessionId — обновление прогресса', () => {
    const validBody = {
      quest_id: 5,
      completed_tasks: ['task-1', 'task-2'],
      current_block_position: 2,
      points: 150,
      hints_used: 1,
      achievements: []
    }

    it('обновляет прогресс при валидных данных', async () => {
      const updated = { session_id: 'sess-abc', current_block_position: 2 }
      pool.query.mockResolvedValueOnce({ rows: [updated] })

      const res = await request(app)
        .patch('/api/quests/session/sess-abc')
        .send(validBody)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('возвращает 400 если quest_id не передан', async () => {
      const res = await request(app)
        .patch('/api/quests/session/sess-abc')
        .send({ completed_tasks: [], current_block_position: 0 }) // нет quest_id

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('возвращает 404 если sessionId+questId не совпадают', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }) // WHERE не совпало

      const res = await request(app)
        .patch('/api/quests/session/wrong-session')
        .send(validBody)

      expect(res.status).toBe(404)
    })
  })

  describe('POST /api/quests/session/:sessionId/complete — завершение квеста', () => {
    it('завершает квест', async () => {
      const session = { session_id: 'sess-abc', created_quest_id: 5, completed_at: new Date() }
      pool.query
        .mockResolvedValueOnce({ rows: [session] }) // UPDATE завершения
        .mockResolvedValueOnce({})                  // UPDATE completed_count

      const res = await request(app)
        .post('/api/quests/session/sess-abc/complete')
        .send({ quest_id: 5, total_time_seconds: 1800 })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.message).toContain('завершён')
    })

    it('возвращает 400 если quest_id не передан', async () => {
      const res = await request(app)
        .post('/api/quests/session/sess-abc/complete')
        .send({ total_time_seconds: 1800 }) // нет quest_id

      expect(res.status).toBe(400)
    })
  })

  describe('безопасность — изоляция сессий', () => {
    it('не позволяет обновить сессию чужого квеста (разные quest_id)', async () => {
      // Сессия принадлежит квесту 5, но запрос с quest_id: 999
      pool.query.mockResolvedValueOnce({ rows: [] }) // WHERE session_id + quest_id не совпало

      const res = await request(app)
        .patch('/api/quests/session/sess-abc')
        .send({
          quest_id: 999, // чужой квест
          completed_tasks: [],
          current_block_position: 0,
          points: 0,
          hints_used: 0,
          achievements: []
        })

      expect(res.status).toBe(404) // сессия "не найдена"
    })
  })
})
