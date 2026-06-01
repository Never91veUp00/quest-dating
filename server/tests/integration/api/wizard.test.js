import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import { setupIntegration, teardownIntegration } from '../../helpers/integration-db.js'

// Integration-тест /api/wizard на РЕАЛЬНОЙ PostgreSQL (testcontainers).
// Покрывает 2.4.3: схема опросника из шаблона + сборка draft-квеста.
// Шаблоны в dump.sql: id 16 proposal-home (indoor), 17 proposal-moscow (city).

const INDOOR_SLUG = 'proposal-home'    // id 16, location_type=indoor
const CITY_SLUG = 'proposal-moscow'    // id 17, location_type=city

let ctx

beforeAll(async () => {
  ctx = await setupIntegration()
}, 120000)

afterAll(async () => {
  await teardownIntegration(ctx)
})

describe('GET /api/wizard/:templateSlug/schema', () => {
  afterEach(async () => { await ctx.reset() })

  it('404 для несуществующего шаблона', async () => {
    const res = await request(ctx.app).get('/api/wizard/no-such-template/schema')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })

  it('возвращает meta + questions для indoor-шаблона (без location-вопросов)', async () => {
    const res = await request(ctx.app).get(`/api/wizard/${INDOOR_SLUG}/schema`)
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.template.slug).toBe(INDOOR_SLUG)
    expect(Array.isArray(res.body.data.meta)).toBe(true)
    expect(Array.isArray(res.body.data.questions)).toBe(true)
    // indoor → ни одного location-вопроса
    const locQs = res.body.data.questions.filter((q) => q.answer_key === 'location')
    expect(locQs).toHaveLength(0)
    // proposal-home: 3 simple (hiding_spot) + 1 riddle (answer+hint)
    const keys = res.body.data.questions.map((q) => q.answer_key)
    expect(keys.filter((k) => k === 'hiding_spot')).toHaveLength(3)
    expect(keys.filter((k) => k === 'answer')).toHaveLength(1)
  })

  it('city-шаблон содержит location-вопросы', async () => {
    const res = await request(ctx.app).get(`/api/wizard/${CITY_SLUG}/schema`)
    expect(res.status).toBe(200)
    const locQs = res.body.data.questions.filter((q) => q.answer_key === 'location')
    expect(locQs.length).toBeGreaterThan(0)
  })
})

describe('POST /api/wizard/:templateSlug/submit — валидация', () => {
  it('400 если client_name пустой', async () => {
    const res = await request(ctx.app).post(`/api/wizard/${INDOOR_SLUG}/submit`)
      .send({ client_name: '', client_email: 'a@b.ru', answers: {} })
    expect(res.status).toBe(400)
  })

  it('400 если client_email невалиден', async () => {
    const res = await request(ctx.app).post(`/api/wizard/${INDOOR_SLUG}/submit`)
      .send({ client_name: 'Игорь', client_email: 'не-email', answers: {} })
    expect(res.status).toBe(400)
  })

  it('400 если answers не объект', async () => {
    const res = await request(ctx.app).post(`/api/wizard/${INDOOR_SLUG}/submit`)
      .send({ client_name: 'Игорь', client_email: 'a@b.ru', answers: 'не объект' })
    expect(res.status).toBe(400)
  })

  it('404 для несуществующего шаблона', async () => {
    const res = await request(ctx.app).post('/api/wizard/no-such/submit')
      .send({ client_name: 'Игорь', client_email: 'a@b.ru', answers: {} })
    expect(res.status).toBe(404)
  })
})

describe('POST /api/wizard/:templateSlug/submit — заказ + draft-квест', () => {
  afterEach(async () => { await ctx.reset() })

  const validBody = {
    client_name: 'Игорь',
    client_email: 'igor@example.com',
    meta: { partner_name: 'Аня', final_message: 'С любовью' },
    answers: { 'task-dom-2-1': { answer: 'кофейня на Арбате', hint: 'корица' } },
  }

  it('создаёт заказ (pending) + draft-квест, отдаёт оба', async () => {
    const res = await request(ctx.app).post(`/api/wizard/${INDOOR_SLUG}/submit`).send(validBody)
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    // заказ
    expect(res.body.data.order.id).toBeTruthy()
    expect(res.body.data.order.status).toBe('pending')
    expect(res.body.data.order.view_token).toBeTruthy()
    // квест
    expect(res.body.data.quest.is_public).toBe(false)
    expect(res.body.data.quest.status).toBe('draft')
    expect(res.body.data.quest.slug).toBeTruthy()
  })

  it('связывает order ↔ quest в обе стороны (в БД)', async () => {
    const res = await request(ctx.app).post(`/api/wizard/${INDOOR_SLUG}/submit`).send(validBody)
    const orderId = res.body.data.order.id
    const questId = res.body.data.quest.id

    const o = await ctx.pool.query('SELECT created_quest_id FROM orders WHERE id = $1', [orderId])
    const q = await ctx.pool.query('SELECT order_id FROM created_quests WHERE id = $1', [questId])
    expect(o.rows[0].created_quest_id).toBe(questId)
    expect(q.rows[0].order_id).toBe(orderId)
  })

  it('квест в БД с собранными blocks (без болванки "ответ"), draft', async () => {
    const res = await request(ctx.app).post(`/api/wizard/${INDOOR_SLUG}/submit`)
      .send({ ...validBody, answers: { 'task-dom-2-1': { answer: 'парк Горького' } } })
    const questId = res.body.data.quest.id

    const dbRow = await ctx.pool.query(
      'SELECT blocks, is_public, published_at, template_id FROM created_quests WHERE id = $1',
      [questId]
    )
    expect(dbRow.rows[0].is_public).toBe(false)
    expect(dbRow.rows[0].published_at).toBeNull()
    expect(dbRow.rows[0].template_id).toBe(16)
    const flat = dbRow.rows[0].blocks.flatMap((b) => b.tasks)
    const riddle = flat.find((t) => t.id === 'task-dom-2-1')
    expect(riddle.answer).toBe('парк Горького')
    expect(riddle.answer).not.toBe('ответ')
  })

  it('инкрементит orders_count шаблона', async () => {
    const before = await ctx.pool.query('SELECT orders_count FROM quest_templates WHERE id = 16')
    await request(ctx.app).post(`/api/wizard/${INDOOR_SLUG}/submit`).send(validBody)
    const after = await ctx.pool.query('SELECT orders_count FROM quest_templates WHERE id = 16')
    expect(after.rows[0].orders_count).toBe(before.rows[0].orders_count + 1)
  })

  it('уникальный slug при повторной отправке тем же именем', async () => {
    const r1 = await request(ctx.app).post(`/api/wizard/${INDOOR_SLUG}/submit`).send(validBody)
    const r2 = await request(ctx.app).post(`/api/wizard/${INDOOR_SLUG}/submit`).send(validBody)
    expect(r1.body.data.quest.slug).not.toBe(r2.body.data.quest.slug)
  })
})