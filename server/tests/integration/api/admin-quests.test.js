import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { setupIntegration, teardownIntegration } from '../../helpers/integration-db.js'

// Integration-тесты админских роутов квестов на РЕАЛЬНОЙ PostgreSQL.
//
// Покрывают поле briefing — текст автора «Перед стартом» (что взять, как
// одеться, куда ехать), который плеер показывает в сводке до первого блока.
// Админ сохраняет его через тот же POST/PUT, что и остальные поля квеста.

let ctx
let token

beforeAll(async () => {
  ctx = await setupIntegration()
  token = jwt.sign({ id: 1, role: 'admin' }, process.env.JWT_SECRET)
}, 120000)

afterAll(async () => {
  await teardownIntegration(ctx)
})

afterEach(async () => {
  await ctx.reset()
})

const auth = (req) => req.set('Authorization', `Bearer ${token}`)

const questBody = (overrides = {}) => ({
  title: 'Тест-квест',
  client_name: 'Клиент',
  slug: `admin-quest-${Math.random().toString(36).slice(2, 10)}`,
  theme: 'detective',
  blocks: [{ id: 1, title: 'Блок', tasks: [] }],
  is_public: false,
  ...overrides,
})

async function briefingInDb(id) {
  const { rows } = await ctx.pool.query('SELECT briefing FROM created_quests WHERE id = $1', [id])
  return rows[0].briefing
}

describe('POST /api/admin/quests — briefing', () => {
  it('сохраняет текст автора и возвращает его в ответе', async () => {
    const res = await auth(request(ctx.app).post('/api/admin/quests'))
      .send(questBody({ briefing: 'Удобная обувь и зарядка' }))

    expect(res.status).toBe(201)
    expect(res.body.data.briefing).toBe('Удобная обувь и зарядка')
    expect(await briefingInDb(res.body.data.id)).toBe('Удобная обувь и зарядка')
  })

  it('без briefing пишет null', async () => {
    const res = await auth(request(ctx.app).post('/api/admin/quests')).send(questBody())

    expect(res.status).toBe(201)
    expect(await briefingInDb(res.body.data.id)).toBeNull()
  })

  it('без токена: 401, квест не создаётся', async () => {
    const res = await request(ctx.app).post('/api/admin/quests').send(questBody({ briefing: 'x' }))

    expect(res.status).toBe(401)
    const { rows } = await ctx.pool.query('SELECT count(*)::int AS n FROM created_quests')
    expect(rows[0].n).toBe(0)
  })
})

describe('PUT /api/admin/quests/:id — briefing', () => {
  it('обновляет текст автора', async () => {
    const created = await auth(request(ctx.app).post('/api/admin/quests'))
      .send(questBody({ briefing: 'Старый текст' }))

    const res = await auth(request(ctx.app).put(`/api/admin/quests/${created.body.data.id}`))
      .send(questBody({ slug: created.body.data.slug, briefing: 'Новый текст' }))

    expect(res.status).toBe(200)
    expect(res.body.data.briefing).toBe('Новый текст')
    expect(await briefingInDb(created.body.data.id)).toBe('Новый текст')
  })

  it('пустая строка очищает briefing до null', async () => {
    const created = await auth(request(ctx.app).post('/api/admin/quests'))
      .send(questBody({ briefing: 'Было' }))

    await auth(request(ctx.app).put(`/api/admin/quests/${created.body.data.id}`))
      .send(questBody({ slug: created.body.data.slug, briefing: '   ' }))
      .expect(200)

    expect(await briefingInDb(created.body.data.id)).toBeNull()
  })
})

describe('GET /api/admin/quests/:id — briefing', () => {
  it('отдаёт briefing в редактор', async () => {
    const created = await auth(request(ctx.app).post('/api/admin/quests'))
      .send(questBody({ briefing: 'Для редактора' }))

    const res = await auth(request(ctx.app).get(`/api/admin/quests/${created.body.data.id}`))

    expect(res.status).toBe(200)
    expect(res.body.data.briefing).toBe('Для редактора')
  })
})

// Темы плеера: валидатор роута должен совпадать с CHECK created_quests_theme_check
// и client-nuxt/app/components/quest/themes.js.
describe('POST /api/admin/quests — theme', () => {
  it.each(['treasure', 'proposal', 'potion', 'halloween'])('создаёт квест с темой %s', async (theme) => {
    const res = await auth(request(ctx.app).post('/api/admin/quests')).send(questBody({ theme }))

    expect(res.status).toBe(201)
    expect(res.body.data.theme).toBe(theme)
  })

  it('неизвестная тема: 400, квест не создаётся', async () => {
    const res = await auth(request(ctx.app).post('/api/admin/quests')).send(questBody({ theme: 'space' }))

    expect(res.status).toBe(400)
    const { rows } = await ctx.pool.query('SELECT count(*)::int AS n FROM created_quests')
    expect(rows[0].n).toBe(0)
  })
})

describe('PUT /api/admin/quests/:id — theme', () => {
  it('меняет тему на proposal', async () => {
    const created = await auth(request(ctx.app).post('/api/admin/quests')).send(questBody())

    const res = await auth(request(ctx.app).put(`/api/admin/quests/${created.body.data.id}`))
      .send(questBody({ slug: created.body.data.slug, theme: 'proposal' }))

    expect(res.status).toBe(200)
    expect(res.body.data.theme).toBe('proposal')
  })

  it('неизвестная тема: 400, а не 500 от CHECK в БД', async () => {
    const created = await auth(request(ctx.app).post('/api/admin/quests')).send(questBody())

    const res = await auth(request(ctx.app).put(`/api/admin/quests/${created.body.data.id}`))
      .send(questBody({ slug: created.body.data.slug, theme: 'space' }))

    expect(res.status).toBe(400)
  })
})
