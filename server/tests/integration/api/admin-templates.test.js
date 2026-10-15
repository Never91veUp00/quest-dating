import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { setupIntegration, teardownIntegration } from '../../helpers/integration-db.js'

// Integration-тесты админских роутов шаблонов на РЕАЛЬНОЙ PostgreSQL.
//
// Покрывают default_theme — тему плеера, которую шаблон подставляет в квест.
// Колонка quest_templates.default_theme без CHECK, поэтому список тем
// держит валидатор роута (QUEST_THEMES в routes/admin.js).

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

const templateBody = (overrides = {}) => ({
  title: `Тест-шаблон ${Math.random().toString(36).slice(2, 10)}`,
  difficulty: 'easy',
  duration_minutes: 60,
  base_price: 1000,
  ...overrides,
})

async function themeInDb(id) {
  const { rows } = await ctx.pool.query('SELECT default_theme FROM quest_templates WHERE id = $1', [id])
  return rows[0].default_theme
}

async function templatesCount() {
  const { rows } = await ctx.pool.query('SELECT count(*)::int AS n FROM quest_templates')
  return rows[0].n
}

describe('POST /api/admin/templates/create — default_theme', () => {
  it.each(['treasure', 'proposal'])('создаёт шаблон с темой %s', async (theme) => {
    const res = await auth(request(ctx.app).post('/api/admin/templates/create'))
      .send(templateBody({ default_theme: theme }))

    expect(res.status).toBe(201)
    expect(await themeInDb(res.body.data.id)).toBe(theme)
  })

  it('без темы подставляет detective', async () => {
    const res = await auth(request(ctx.app).post('/api/admin/templates/create'))
      .send(templateBody({ default_theme: '' }))

    expect(res.status).toBe(201)
    expect(await themeInDb(res.body.data.id)).toBe('detective')
  })

  it('неизвестная тема: 400, шаблон не создаётся', async () => {
    const before = await templatesCount()

    const res = await auth(request(ctx.app).post('/api/admin/templates/create'))
      .send(templateBody({ default_theme: 'space' }))

    expect(res.status).toBe(400)
    expect(await templatesCount()).toBe(before)
  })
})

describe('PUT /api/admin/templates/:id — default_theme', () => {
  async function createTemplate() {
    const res = await auth(request(ctx.app).post('/api/admin/templates/create'))
      .send(templateBody())
    expect(res.status).toBe(201)
    return res.body.data
  }

  it('меняет тему на treasure', async () => {
    const created = await createTemplate()

    const res = await auth(request(ctx.app).put(`/api/admin/templates/${created.id}`))
      .send(templateBody({ title: created.title, default_theme: 'treasure' }))

    expect(res.status).toBe(200)
    expect(await themeInDb(created.id)).toBe('treasure')
  })

  it('неизвестная тема: 400, тема в БД не меняется', async () => {
    const created = await createTemplate()

    const res = await auth(request(ctx.app).put(`/api/admin/templates/${created.id}`))
      .send(templateBody({ title: created.title, default_theme: 'space' }))

    expect(res.status).toBe(400)
    expect(await themeInDb(created.id)).toBe('detective')
  })
})
