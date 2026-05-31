import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import { setupIntegration, teardownIntegration } from '../../helpers/integration-db.js'

// Integration-тесты Quest API на РЕАЛЬНОЙ PostgreSQL (testcontainers).
//
// Заменяет прежний мок-вариант с цепочками pool.query.mockResolvedValueOnce.
// Мок выдумывал session_id 'sess-abc' (в реальности это uuid DEFAULT
// gen_random_uuid()) и не мог проверить главного: что прогресс РЕАЛЬНО
// записался, что счётчики инкрементятся, и что security-изоляция сессий
// (AND created_quest_id = $N) действительно НЕ даёт мутировать чужую сессию,
// а не просто возвращает 404.
//
// created_quests в dump.sql пуст (как и должно быть — это клиентские квесты),
// поэтому каждый тест сам создаёт квест-фикстуру. reset() в afterEach
// возвращает БД к состоянию dump между тестами (тот же подход, что в orders).

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const tick = () => new Promise(r => setImmediate(r)) // дать fire-and-forget промису отработать

let ctx

beforeAll(async () => {
  ctx = await setupIntegration()
}, 120000)

afterAll(async () => {
  await teardownIntegration(ctx)
})

afterEach(async () => {
  await ctx.reset()
})

// ─── фикстуры ────────────────────────────────────────────────────────────────

// Создаёт строку в created_quests. template_id=11 — реальный сид-шаблон
// ('Детективное расследование'), нужен для JOIN в getQuestBySlug.
async function makeQuest({ access_code = null, expires_at = null, template_id = 11 } = {}) {
  const slug = `test-quest-${Math.random().toString(36).slice(2, 10)}`
  const { rows } = await ctx.pool.query(
    `INSERT INTO created_quests
       (template_id, slug, access_code, title, client_name, blocks, expires_at, is_public)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, true)
     RETURNING id, slug, access_code`,
    [template_id, slug, access_code, 'Тест-квест', 'Клиент',
     JSON.stringify([{ type: 'intro', text: 'Начало' }]), expires_at]
  )
  return rows[0]
}

async function makeSession(createdQuestId) {
  const { rows } = await ctx.pool.query(
    'INSERT INTO quest_sessions (created_quest_id) VALUES ($1) RETURNING *',
    [createdQuestId]
  )
  return rows[0]
}

// ─── POST /api/quests/:questId/session ─────────────────────────────────────────

describe('POST /api/quests/:questId/session — создание сессии (реальная БД)', () => {
  it('создаёт сессию: session_id = реальный UUID, строка легла в quest_sessions', async () => {
    const quest = await makeQuest()

    const res = await request(ctx.app).post(`/api/quests/${quest.id}/session`)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.session_id).toMatch(UUID_RE)
    expect(res.body.data.created_quest_id).toBe(quest.id)

    const { rows } = await ctx.pool.query(
      'SELECT created_quest_id, points, current_block_position FROM quest_sessions WHERE session_id = $1',
      [res.body.data.session_id]
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].created_quest_id).toBe(quest.id)
    expect(rows[0].points).toBe(0)                  // дефолты схемы
    expect(rows[0].current_block_position).toBe(0)
  })

  it('инкрементит started_count квеста (fire-and-forget)', async () => {
    const quest = await makeQuest()

    await request(ctx.app).post(`/api/quests/${quest.id}/session`).expect(201)
    await tick() // started_count обновляется не в основном промисе ответа

    const { rows } = await ctx.pool.query(
      'SELECT started_count FROM created_quests WHERE id = $1', [quest.id]
    )
    expect(rows[0].started_count).toBe(1)
  })

  it('404 если квест не существует', async () => {
    const res = await request(ctx.app).post('/api/quests/999999/session')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})

// ─── PATCH /api/quests/session/:sessionId ──────────────────────────────────────

describe('PATCH /api/quests/session/:sessionId — обновление прогресса (реальная БД)', () => {
  it('записывает прогресс и читается обратно из БД', async () => {
    const quest = await makeQuest()
    const session = await makeSession(quest.id)

    const res = await request(ctx.app)
      .patch(`/api/quests/session/${session.session_id}`)
      .send({
        quest_id: quest.id,
        completed_tasks: ['task-1', 'task-2'],
        current_block_position: 2,
        points: 150,
        hints_used: 1,
        achievements: ['first-blood'],
      })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    const { rows } = await ctx.pool.query(
      'SELECT points, current_block_position, completed_tasks, hints_used FROM quest_sessions WHERE session_id = $1',
      [session.session_id]
    )
    expect(rows[0].points).toBe(150)
    expect(rows[0].current_block_position).toBe(2)
    expect(rows[0].hints_used).toBe(1)
    expect(rows[0].completed_tasks).toEqual(['task-1', 'task-2'])  // jsonb → массив
  })

  it('400 если quest_id не передан', async () => {
    const quest = await makeQuest()
    const session = await makeSession(quest.id)

    const res = await request(ctx.app)
      .patch(`/api/quests/session/${session.session_id}`)
      .send({ completed_tasks: [], current_block_position: 0 })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('404 если sessionId не существует', async () => {
    const res = await request(ctx.app)
      .patch('/api/quests/session/00000000-0000-0000-0000-000000000000')
      .send({ quest_id: 1, completed_tasks: [], current_block_position: 0, points: 0, hints_used: 0 })

    expect(res.status).toBe(404)
  })
})

// ─── POST /api/quests/session/:sessionId/complete ──────────────────────────────

describe('POST /api/quests/session/:sessionId/complete — завершение (реальная БД)', () => {
  it('проставляет completed_at + total_time_seconds, инкрементит completed_count', async () => {
    const quest = await makeQuest()
    const session = await makeSession(quest.id)

    const res = await request(ctx.app)
      .post(`/api/quests/session/${session.session_id}/complete`)
      .send({ quest_id: quest.id, total_time_seconds: 1800 })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.message).toContain('завершён')

    const { rows } = await ctx.pool.query(
      'SELECT completed_at, total_time_seconds FROM quest_sessions WHERE session_id = $1',
      [session.session_id]
    )
    expect(rows[0].completed_at).not.toBeNull()
    expect(rows[0].total_time_seconds).toBe(1800)

    await tick()
    const q = await ctx.pool.query('SELECT completed_count FROM created_quests WHERE id = $1', [quest.id])
    expect(q.rows[0].completed_count).toBe(1)
  })

  it('400 если quest_id не передан', async () => {
    const quest = await makeQuest()
    const session = await makeSession(quest.id)

    const res = await request(ctx.app)
      .post(`/api/quests/session/${session.session_id}/complete`)
      .send({ total_time_seconds: 1800 })

    expect(res.status).toBe(400)
  })
})

// ─── POST /api/quests/session/:sessionId/restart ───────────────────────────────

describe('POST /api/quests/session/:sessionId/restart — сброс прогресса (реальная БД)', () => {
  it('обнуляет прогресс уже игравшейся сессии', async () => {
    const quest = await makeQuest()
    const session = await makeSession(quest.id)

    // Наиграть прогресс
    await ctx.pool.query(
      `UPDATE quest_sessions SET points = 200, current_block_position = 5,
         completed_tasks = '["a","b"]'::jsonb, completed_at = CURRENT_TIMESTAMP,
         total_time_seconds = 999 WHERE session_id = $1`,
      [session.session_id]
    )

    const res = await request(ctx.app)
      .post(`/api/quests/session/${session.session_id}/restart`)
      .send({ quest_id: quest.id })

    expect(res.status).toBe(200)

    const { rows } = await ctx.pool.query(
      'SELECT points, current_block_position, completed_tasks, completed_at, total_time_seconds FROM quest_sessions WHERE session_id = $1',
      [session.session_id]
    )
    expect(rows[0].points).toBe(0)
    expect(rows[0].current_block_position).toBe(0)
    expect(rows[0].completed_tasks).toEqual([])
    expect(rows[0].completed_at).toBeNull()
    expect(rows[0].total_time_seconds).toBe(0)
  })
})

// ─── GET /api/quests/session/:sessionId/stats ──────────────────────────────────

describe('GET /api/quests/session/:sessionId/stats — статистика сессии', () => {
  it('возвращает существующую сессию', async () => {
    const quest = await makeQuest()
    const session = await makeSession(quest.id)

    const res = await request(ctx.app).get(`/api/quests/session/${session.session_id}/stats`)

    expect(res.status).toBe(200)
    expect(res.body.data.session_id).toBe(session.session_id)
    expect(res.body.data.created_quest_id).toBe(quest.id)
  })

  it('404 для несуществующей сессии', async () => {
    const res = await request(ctx.app)
      .get('/api/quests/session/00000000-0000-0000-0000-000000000000/stats')
    expect(res.status).toBe(404)
  })
})

// ─── безопасность: изоляция сессий ─────────────────────────────────────────────

describe('Безопасность — изоляция сессий (реальная БД доказывает отсутствие мутации)', () => {
  it('чужой quest_id → 404 И сессия НЕ изменена (а не просто 404 из мока)', async () => {
    const questA = await makeQuest()
    const questB = await makeQuest()
    const session = await makeSession(questA.id) // сессия принадлежит questA

    const res = await request(ctx.app)
      .patch(`/api/quests/session/${session.session_id}`)
      .send({
        quest_id: questB.id, // чужой квест
        completed_tasks: ['hacked'],
        current_block_position: 99,
        points: 9999,
        hints_used: 0,
        achievements: [],
      })

    expect(res.status).toBe(404)

    // Ключевая проверка, недоступная моку: сессия осталась нетронутой.
    const { rows } = await ctx.pool.query(
      'SELECT points, current_block_position, completed_tasks FROM quest_sessions WHERE session_id = $1',
      [session.session_id]
    )
    expect(rows[0].points).toBe(0)
    expect(rows[0].current_block_position).toBe(0)
    expect(rows[0].completed_tasks).toEqual([])
  })
})

// ─── GET /api/quests/:slug — получение квеста + защита access_code ──────────────
// Этот эндпоинт мок-тест не покрывал ВООБЩЕ. Содержит security-логику
// (access_code не должен утекать клиенту) — самое ценное для реального теста.

describe('GET /api/quests/:slug — прохождение + защита кодом доступа', () => {
  it('квест без кода: 200, отдаёт blocks, НЕ отдаёт access_code', async () => {
    const quest = await makeQuest({ access_code: null })

    const res = await request(ctx.app).get(`/api/quests/${quest.slug}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.blocks).toBeDefined()
    expect(res.body.data.access_code).toBeUndefined() // не утёк
    expect(res.body.data.duration_minutes).toBeDefined() // JOIN на quest_templates сработал
  })

  it('квест с кодом, код не передан: 403 requires_code, blocks НЕ отдаются', async () => {
    const quest = await makeQuest({ access_code: '1234' })

    const res = await request(ctx.app).get(`/api/quests/${quest.slug}`)

    expect(res.status).toBe(403)
    expect(res.body.requires_code).toBe(true)
    expect(res.body.data.blocks).toBeUndefined()
    expect(res.body.data.access_code).toBeUndefined()
  })

  it('квест с кодом, верный код через POST /access: 200 с blocks', async () => {
    const quest = await makeQuest({ access_code: '1234' })

    const res = await request(ctx.app)
      .post(`/api/quests/${quest.slug}/access`)
      .send({ access_code: '1234' })

    expect(res.status).toBe(200)
    expect(res.body.data.blocks).toBeDefined()
    expect(res.body.data.access_code).toBeUndefined()
  })

  it('404 для несуществующего slug', async () => {
    const res = await request(ctx.app).get('/api/quests/no-such-quest-slug')
    expect(res.status).toBe(404)
  })
})