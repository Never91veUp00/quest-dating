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
      .send({ client_name: '', answers: {} })
    expect(res.status).toBe(400)
  })

  it('400 если answers не объект', async () => {
    const res = await request(ctx.app).post(`/api/wizard/${INDOOR_SLUG}/submit`)
      .send({ client_name: 'Игорь', answers: 'не объект' })
    expect(res.status).toBe(400)
  })

  it('404 для несуществующего шаблона', async () => {
    const res = await request(ctx.app).post('/api/wizard/no-such/submit')
      .send({ client_name: 'Игорь', answers: {} })
    expect(res.status).toBe(404)
  })
})

describe('POST /api/wizard/:templateSlug/submit — создание draft', () => {
  afterEach(async () => { await ctx.reset() })

  it('создаёт created_quests в статусе draft (is_public=false)', async () => {
    const res = await request(ctx.app).post(`/api/wizard/${INDOOR_SLUG}/submit`)
      .send({
        client_name: 'Игорь',
        meta: { partner_name: 'Аня', final_message: 'С любовью' },
        answers: {
          'task-dom-2-1': { answer: 'кофейня на Арбате', hint: 'корица' },
        },
      })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.is_public).toBe(false)
    expect(res.body.data.status).toBe('draft')
    expect(res.body.data.slug).toBeTruthy()
    expect(res.body.data.id).toBeTruthy()
  })

  it('записывает квест в БД с собранными blocks (без болванки "ответ")', async () => {
    const res = await request(ctx.app).post(`/api/wizard/${INDOOR_SLUG}/submit`)
      .send({
        client_name: 'Игорь',
        meta: { partner_name: 'Аня' },
        answers: { 'task-dom-2-1': { answer: 'парк Горького' } },
      })
    const id = res.body.data.id

    const dbRow = await ctx.pool.query(
      'SELECT blocks, is_public, published_at, template_id FROM created_quests WHERE id = $1',
      [id]
    )
    expect(dbRow.rows).toHaveLength(1)
    expect(dbRow.rows[0].is_public).toBe(false)
    expect(dbRow.rows[0].published_at).toBeNull()
    expect(dbRow.rows[0].template_id).toBe(16)

    // riddle.answer заполнен реальным ответом, не болванкой
    const blocks = dbRow.rows[0].blocks
    const flat = blocks.flatMap((b) => b.tasks)
    const riddle = flat.find((t) => t.id === 'task-dom-2-1')
    expect(riddle.answer).toBe('парк Горького')
    expect(riddle.answer).not.toBe('ответ')
  })

  it('генерирует уникальный slug при повторной отправке тем же именем', async () => {
    const payload = { client_name: 'Дубль', answers: {} }
    const r1 = await request(ctx.app).post(`/api/wizard/${INDOOR_SLUG}/submit`).send(payload)
    const r2 = await request(ctx.app).post(`/api/wizard/${INDOOR_SLUG}/submit`).send(payload)
    expect(r1.body.data.slug).not.toBe(r2.body.data.slug)
  })
})