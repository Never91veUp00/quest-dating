import { describe, it, expect, beforeAll, vi } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import pool from '@src/config/database.js'
import { createApp } from '@src/app.js'
import * as notificationService from '@src/services/notificationService.js'

let app
let adminToken

beforeAll(() => {
  app = createApp()
  adminToken = jwt.sign({ username: 'admin', role: 'admin' }, process.env.JWT_SECRET)
})

const validOrderData = {
  template_id: 1,
  client_name: 'Александр Иванов',
  client_email: 'alex@example.com',
  client_phone: '+79161234567',
  event_date: '2025-08-14',
  event_city: 'Москва',
  selected_features: ['background_music'],
  description: 'Романтический вечер для двоих',
  newsletter: false
}

describe('POST /api/orders — создание заказа', () => {
  describe('валидация', () => {
    it('возвращает 400 если template_id отсутствует', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ ...validOrderData, template_id: undefined })

      expect(res.status).toBe(400)
    })

    it('возвращает 400 если client_name пустой', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ ...validOrderData, client_name: '' })

      expect(res.status).toBe(400)
    })

    it('возвращает 400 если email некорректный', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ ...validOrderData, client_email: 'not-an-email' })

      expect(res.status).toBe(400)
    })
  })

  describe('успешное создание', () => {
    it('создаёт заказ и возвращает данные с ценой', async () => {
      const mockTemplate = { base_price: 300000, title: 'Детективный квест' }
      const mockOrder = {
        id: 1,
        ...validOrderData,
        base_price: 300000,
        additional_costs: 50000, // background_music = 500 руб = 50000 копеек
        total_price: 350000,
        status: 'pending'
      }

      const mockClient = {
        query: vi.fn()
          .mockResolvedValueOnce({})                 // BEGIN
          .mockResolvedValueOnce({ rows: [mockOrder] }) // INSERT
          .mockResolvedValueOnce({})                 // UPDATE orders_count
          .mockResolvedValueOnce({}),                // COMMIT
        release: vi.fn()
      }
      pool.query.mockResolvedValueOnce({ rows: [mockTemplate] })
      pool.connect.mockResolvedValueOnce(mockClient)
      vi.spyOn(notificationService, 'notifyNewOrder').mockResolvedValueOnce(undefined)

      const res = await request(app)
        .post('/api/orders')
        .send(validOrderData)

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      // Контроллер возвращает parseFloat(order.total_price) — число как есть из БД.
      // Значение хранится в копейках (350000), конвертация в рубли — на фронтенде.
      expect(res.body.data.total_price).toBe(350000)
    })

    it('возвращает 404 если шаблон не существует', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] }) // шаблон не найден

      const res = await request(app)
        .post('/api/orders')
        .send(validOrderData)

      expect(res.status).toBe(404)
      expect(res.body.message).toContain('Шаблон не найден')
    })

    it('отправляет уведомление в Telegram после создания', async () => {
      const mockTemplate = { base_price: 300000, title: 'Квест' }
      const mockOrder = { id: 2, ...validOrderData, base_price: 300000, additional_costs: 0, total_price: 300000, status: 'pending' }
      const mockClient = {
        query: vi.fn()
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce({ rows: [mockOrder] })
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce({}),
        release: vi.fn()
      }
      pool.query.mockResolvedValueOnce({ rows: [mockTemplate] })
      pool.connect.mockResolvedValueOnce(mockClient)

      const spy = vi.spyOn(notificationService, 'notifyNewOrder').mockResolvedValueOnce(undefined)

      await request(app).post('/api/orders').send({ ...validOrderData, selected_features: [] })

      // notifyNewOrder вызывается через .catch() после ответа клиенту (fire-and-forget).
      // Ждём один тик event loop чтобы промис успел запуститься.
      await new Promise(resolve => setImmediate(resolve))

      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ id: 2 }),
        'Квест'
      )
    })
  })
})

describe('PATCH /api/admin/orders/:id/status — обновление статуса (только admin)', () => {
  it('возвращает 401 без токена', async () => {
    const res = await request(app).patch('/api/admin/orders/1/status').send({ status: 'confirmed' })
    expect(res.status).toBe(401)
  })

  it('обновляет статус с валидным токеном', async () => {
    const updatedOrder = { id: 1, status: 'confirmed', client_name: 'Иван' }
    pool.query.mockResolvedValueOnce({ rows: [updatedOrder] })
    vi.spyOn(notificationService, 'notifyOrderStatusChange').mockResolvedValueOnce(undefined)

    const res = await request(app)
      .patch('/api/admin/orders/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('возвращает 400 для невалидного статуса', async () => {
    const res = await request(app)
      .patch('/api/admin/orders/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'неверный-статус' })

    expect(res.status).toBe(400)
  })
})
