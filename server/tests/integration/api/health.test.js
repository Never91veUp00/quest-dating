import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { setupIntegration, teardownIntegration } from '../../helpers/integration-db.js'

// Integration-тест /health на РЕАЛЬНОЙ PostgreSQL (testcontainers).
// Проверяет, что endpoint действительно ходит в БД (SELECT 1), а не
// возвращает захардкоженный ответ. Заодно — что dump.sql применился
// целиком (схема + сиды), что валидирует весь фундамент integration-тестов.
//
// Кейс "503 при недоступной БД" остаётся в unit-тестах с моком — там его
// и место (поднять реальный контейнер и тут же уронить БД — искусственно).

let ctx

beforeAll(async () => {
  ctx = await setupIntegration()
}, 120000)

afterAll(async () => {
  await teardownIntegration(ctx)
})

describe('GET /health (integration, реальная БД)', () => {
  it('возвращает 200 и db: connected — реальный SELECT в контейнер', async () => {
    const res = await request(ctx.app).get('/health')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('OK')
    expect(res.body.db).toBe('connected')
    expect(res.body.timestamp).toBeDefined()
    expect(typeof res.body.uptime).toBe('number')
  })
})

describe('dump.sql применился целиком (валидация фундамента)', () => {
  it('схема: ровно 9 таблиц в public', async () => {
    const { rows } = await ctx.pool.query(
      `SELECT count(*)::int AS n FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
    )
    expect(rows[0].n).toBe(9)
  })

  it('сиды: 7 категорий', async () => {
    const { rows } = await ctx.pool.query('SELECT count(*)::int AS n FROM categories')
    expect(rows[0].n).toBe(7)
  })

  it('сиды: 23 тега', async () => {
    const { rows } = await ctx.pool.query('SELECT count(*)::int AS n FROM tags')
    expect(rows[0].n).toBe(23)
  })

  it('сиды: 7 шаблонов квестов', async () => {
    const { rows } = await ctx.pool.query('SELECT count(*)::int AS n FROM quest_templates')
    expect(rows[0].n).toBe(7)
  })

  it('PII клиентов НЕ попали в dump: orders пуст', async () => {
    const { rows } = await ctx.pool.query('SELECT count(*)::int AS n FROM orders')
    expect(rows[0].n).toBe(0)
  })
})

describe('reset() возвращает БД к состоянию dump.sql', () => {
  it('после вставки заказа и reset — orders снова пуст', async () => {
    await ctx.pool.query(
      `INSERT INTO orders (template_id, client_name, client_email, status, total_price, description)
       VALUES (11, 'Тест', 'test@example.com', 'pending', 100000, 'тестовое описание')`
    )
    const before = await ctx.pool.query('SELECT count(*)::int AS n FROM orders')
    expect(before.rows[0].n).toBe(1)

    await ctx.reset()

    const after = await ctx.pool.query('SELECT count(*)::int AS n FROM orders')
    expect(after.rows[0].n).toBe(0)

    const cats = await ctx.pool.query('SELECT count(*)::int AS n FROM categories')
    expect(cats.rows[0].n).toBe(7)
  })
})