import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { setupIntegration, teardownIntegration } from '../../helpers/integration-db.js'

// Integration-тест публикации квеста админом (2.4.6 — замок полуавтомата).
// Цепочка: wizard submit → draft → admin publish → is_public=true.
// Роуты под requireAdmin → нужен admin-JWT.

const INDOOR_SLUG = 'proposal-home'

let ctx
let adminToken

beforeAll(async () => {
  ctx = await setupIntegration()
  adminToken = jwt.sign({ username: 'admin', role: 'admin' }, process.env.JWT_SECRET)
}, 120000)

afterAll(async () => {
  await teardownIntegration(ctx)
})

// Хелпер: создать draft через наш же wizard-endpoint, вернуть его id
async function createDraft(answers = { 'task-dom-2-1': { answer: 'парк Горького' } }) {
  const res = await request(ctx.app)
    .post(`/api/wizard/${INDOOR_SLUG}/submit`)
    .send({ client_name: 'Игорь', meta: { partner_name: 'Аня' }, answers })
  return res.body.data.id
}

describe('PATCH /api/admin/quests/:id/publish', () => {
  afterEach(async () => { await ctx.reset() })

  it('401 без admin-токена', async () => {
    const id = await createDraft()
    const res = await request(ctx.app).patch(`/api/admin/quests/${id}/publish`)
    expect(res.status).toBe(401)
  })

  it('404 для несуществующего квеста', async () => {
    const res = await request(ctx.app)
      .patch('/api/admin/quests/999999/publish')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(404)
  })

  it('публикует draft: is_public=true, published_at проставлен', async () => {
    const id = await createDraft()

    // до публикации — draft
    const before = await ctx.pool.query(
      'SELECT is_public, published_at FROM created_quests WHERE id = $1', [id]
    )
    expect(before.rows[0].is_public).toBe(false)
    expect(before.rows[0].published_at).toBeNull()

    const res = await request(ctx.app)
      .patch(`/api/admin/quests/${id}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.data.is_public).toBe(true)
    expect(res.body.data.published_at).toBeTruthy()

    // в БД действительно опубликован
    const after = await ctx.pool.query(
      'SELECT is_public, published_at FROM created_quests WHERE id = $1', [id]
    )
    expect(after.rows[0].is_public).toBe(true)
    expect(after.rows[0].published_at).not.toBeNull()
  })

  it('не публикует квест без блоков (400)', async () => {
    // создаём квест с пустыми blocks напрямую
    const ins = await ctx.pool.query(
      `INSERT INTO created_quests (title, client_name, slug, theme, blocks, is_public)
       VALUES ('Пустой','Тест','empty-quest','detective','[]'::jsonb,false)
       RETURNING id`
    )
    const id = ins.rows[0].id
    const res = await request(ctx.app)
      .patch(`/api/admin/quests/${id}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(400)
    // остался draft
    const row = await ctx.pool.query('SELECT is_public FROM created_quests WHERE id = $1', [id])
    expect(row.rows[0].is_public).toBe(false)
  })

  it('повторная публикация не перетирает published_at', async () => {
    const id = await createDraft()
    const r1 = await request(ctx.app)
      .patch(`/api/admin/quests/${id}/publish`).set('Authorization', `Bearer ${adminToken}`)
    const firstPublishedAt = r1.body.data.published_at
    const r2 = await request(ctx.app)
      .patch(`/api/admin/quests/${id}/publish`).set('Authorization', `Bearer ${adminToken}`)
    expect(r2.body.data.published_at).toBe(firstPublishedAt)
  })
})

describe('PATCH /api/admin/quests/:id/unpublish', () => {
  afterEach(async () => { await ctx.reset() })

  it('снимает с публикации: is_public=false, published_at сохраняется', async () => {
    const id = await createDraft()
    await request(ctx.app)
      .patch(`/api/admin/quests/${id}/publish`).set('Authorization', `Bearer ${adminToken}`)

    const res = await request(ctx.app)
      .patch(`/api/admin/quests/${id}/unpublish`).set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(200)
    expect(res.body.data.is_public).toBe(false)
    // published_at сохранён как исторический факт
    expect(res.body.data.published_at).toBeTruthy()
  })

  it('404 для несуществующего квеста', async () => {
    const res = await request(ctx.app)
      .patch('/api/admin/quests/999999/unpublish')
      .set('Authorization', `Bearer ${adminToken}`)
    expect(res.status).toBe(404)
  })
})