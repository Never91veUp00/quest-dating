import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { setupIntegration, teardownIntegration } from '../../helpers/integration-db.js'
// notificationService замокан в tests/setup.integration.js — импортируем
// мок-функцию, чтобы проверить, что заказ её действительно дёргает.
import { notifyNewOrder } from '@src/services/notificationService.js'

// Integration-тест /orders на РЕАЛЬНОЙ PostgreSQL (testcontainers).
//
// Заменяет прежний мок-вариант, который:
//   - бил по template_id: 1 — в dump.sql такого нет (шаблоны 11–17),
//     на реальной БД это был бы 404;
//   - проверял выдуманную base_price 300000 (реальная — 49900 копеек);
//   - не проверял ни сам INSERT, ни инкремент orders_count в транзакции,
//     ни генерацию view_token.
//
// Теперь всё это — против живой БД. Лимитеры и notificationService мокаются
// в tests/setup.integration.js (НЕ БД).

const TEMPLATE_ID    = 11                          // 'Детективное расследование' (см. dump.sql)
const TEMPLATE_TITLE = 'Детективное расследование'
const BASE_PRICE     = 49900                       // копейки
const MUSIC_KOPECKS  = 50000                       // background_music: 500 руб × 100
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const validOrderData = {
  template_id: TEMPLATE_ID,
  client_name: 'Александр Иванов',
  client_email: 'alex@example.com',
  client_phone: '+79161234567',
  event_date: '2025-08-14',
  event_city: 'Москва',
  selected_features: ['background_music'],
  description: 'Романтический вечер для двоих',
  newsletter: false,
}

let ctx
let adminToken

beforeAll(async () => {
  ctx = await setupIntegration()
  // JWT_SECRET выставляется внутри setupIntegration — подписываем после него.
  adminToken = jwt.sign({ username: 'admin', role: 'admin' }, process.env.JWT_SECRET)
}, 120000)

afterAll(async () => {
  await teardownIntegration(ctx)
})

describe('POST /api/orders — валидация (БД не трогается)', () => {
  it('400 если template_id отсутствует', async () => {
    const res = await request(ctx.app).post('/api/orders')
      .send({ ...validOrderData, template_id: undefined })
    expect(res.status).toBe(400)
  })

  it('400 если client_name пустой', async () => {
    const res = await request(ctx.app).post('/api/orders')
      .send({ ...validOrderData, client_name: '' })
    expect(res.status).toBe(400)
  })

  it('400 если email некорректный', async () => {
    const res = await request(ctx.app).post('/api/orders')
      .send({ ...validOrderData, client_email: 'not-an-email' })
    expect(res.status).toBe(400)
  })

  it('400 если description пустой', async () => {
    const res = await request(ctx.app).post('/api/orders')
      .send({ ...validOrderData, description: '' })
    expect(res.status).toBe(400)
  })

  it('404 если шаблон не существует (реальный SELECT в quest_templates)', async () => {
    const res = await request(ctx.app).post('/api/orders')
      .send({ ...validOrderData, template_id: 99999 })
    expect(res.status).toBe(404)
    expect(res.body.message).toContain('Шаблон не найден')
  })
})

describe('POST /api/orders — успешное создание (реальная БД)', () => {
  afterEach(async () => { await ctx.reset() })

  it('создаёт заказ: цена считается из реальной base_price + фичи, view_token = UUID', async () => {
    const res = await request(ctx.app).post('/api/orders').send(validOrderData)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.base_price).toBe(BASE_PRICE)
    expect(res.body.data.additional_costs).toBe(MUSIC_KOPECKS)
    expect(res.body.data.total_price).toBe(BASE_PRICE + MUSIC_KOPECKS)   // 99900
    expect(res.body.data.status).toBe('pending')
    expect(res.body.data.view_token).toMatch(UUID_RE)
    expect(typeof res.body.data.id).toBe('number')

    // Заказ реально лёг в таблицу orders.
    const { rows } = await ctx.pool.query(
      'SELECT client_email, total_price, status FROM orders WHERE id = $1',
      [res.body.data.id]
    )
    expect(rows).toHaveLength(1)
    expect(rows[0].client_email).toBe('alex@example.com')
    expect(rows[0].total_price).toBe(BASE_PRICE + MUSIC_KOPECKS)
    expect(rows[0].status).toBe('pending')
  })

  it('additional_costs = 0 без выбранных фич', async () => {
    const res = await request(ctx.app).post('/api/orders')
      .send({ ...validOrderData, selected_features: [] })
    expect(res.status).toBe(201)
    expect(res.body.data.additional_costs).toBe(0)
    expect(res.body.data.total_price).toBe(BASE_PRICE)
  })

  it('инкрементит quest_templates.orders_count в той же транзакции', async () => {
    const before = await ctx.pool.query(
      'SELECT orders_count FROM quest_templates WHERE id = $1', [TEMPLATE_ID]
    )
    await request(ctx.app).post('/api/orders').send(validOrderData).expect(201)
    const after = await ctx.pool.query(
      'SELECT orders_count FROM quest_templates WHERE id = $1', [TEMPLATE_ID]
    )
    expect(after.rows[0].orders_count).toBe(before.rows[0].orders_count + 1)
  })

  it('дёргает notifyNewOrder после создания (fire-and-forget)', async () => {
    await request(ctx.app).post('/api/orders')
      .send({ ...validOrderData, selected_features: [] })
      .expect(201)

    // notifyNewOrder вызывается через .catch() ПОСЛЕ ответа — ждём тик.
    await new Promise(resolve => setImmediate(resolve))

    expect(notifyNewOrder).toHaveBeenCalledOnce()
    expect(notifyNewOrder).toHaveBeenCalledWith(
      expect.objectContaining({ template_id: TEMPLATE_ID, client_name: validOrderData.client_name }),
      TEMPLATE_TITLE
    )
  })
})

describe('GET /api/orders/by-token/:token — публичный просмотр (реальный JOIN)', () => {
  afterEach(async () => { await ctx.reset() })

  it('возвращает заказ по view_token с данными шаблона', async () => {
    const created = await request(ctx.app).post('/api/orders').send(validOrderData)
    const token = created.body.data.view_token

    const res = await request(ctx.app).get(`/api/orders/by-token/${token}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.client_name).toBe(validOrderData.client_name)
    expect(res.body.data.template_title).toBe(TEMPLATE_TITLE)
    expect(res.body.data.total_price).toBe(BASE_PRICE + MUSIC_KOPECKS)
  })

  it('404 для несуществующего токена', async () => {
    const res = await request(ctx.app)
      .get('/api/orders/by-token/00000000-0000-0000-0000-000000000000')
    expect(res.status).toBe(404)
  })
})

describe('PATCH /api/admin/orders/:id/status — смена статуса (admin)', () => {
  afterEach(async () => { await ctx.reset() })

  it('401 без токена', async () => {
    const res = await request(ctx.app)
      .patch('/api/admin/orders/1/status').send({ status: 'confirmed' })
    expect(res.status).toBe(401)
  })

  it('400 для невалидного статуса (с токеном)', async () => {
    const res = await request(ctx.app)
      .patch('/api/admin/orders/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'неверный-статус' })
    expect(res.status).toBe(400)
  })

  it('обновляет статус реального заказа в БД', async () => {
    const created = await request(ctx.app).post('/api/orders').send(validOrderData)
    const id = created.body.data.id

    const res = await request(ctx.app)
      .patch(`/api/admin/orders/${id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)

    const { rows } = await ctx.pool.query('SELECT status FROM orders WHERE id = $1', [id])
    expect(rows[0].status).toBe('confirmed')
  })
})
