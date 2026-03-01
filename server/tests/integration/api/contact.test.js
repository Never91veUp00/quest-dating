import { describe, it, expect, beforeAll, vi } from 'vitest'
import request from 'supertest'
import { createApp } from '@src/app.js'
import * as notificationService from '@src/services/notificationService.js'

let app
beforeAll(() => {
  app = createApp()
})

describe('POST /api/contact', () => {
  describe('валидация', () => {
    it('возвращает 400 если имя пустое', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: '', phone: '+79161234567', message: 'Тестовое сообщение для проверки' })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('возвращает 400 если телефон отсутствует', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'Мария', phone: '', message: 'Тестовое сообщение для проверки' })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('возвращает 400 если сообщение короче 10 символов', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'Мария', phone: '+79161234567', message: 'Привет' })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('возвращает 400 если сообщение длиннее 2000 символов', async () => {
      const res = await request(app)
        .post('/api/contact')
        .send({ name: 'Мария', phone: '+79161234567', message: 'а'.repeat(2001) })

      expect(res.status).toBe(400)
    })
  })

  describe('успешная отправка', () => {
    it('возвращает 200 и вызывает notifyContactMessage', async () => {
      const spy = vi.spyOn(notificationService, 'notifyContactMessage')
        .mockResolvedValueOnce(undefined)

      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Мария',
          phone: '+79161234567',
          message: 'Хочу заказать романтический квест на годовщину'
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(spy).toHaveBeenCalledOnce()
      expect(spy).toHaveBeenCalledWith({
        name: 'Мария',
        phone: '+79161234567',
        message: 'Хочу заказать романтический квест на годовщину'
      })
    })

    it('возвращает 200 даже если Telegram упал (не блокируем ответ)', async () => {
      vi.spyOn(notificationService, 'notifyContactMessage')
        .mockRejectedValueOnce(new Error('Telegram timeout'))

      const res = await request(app)
        .post('/api/contact')
        .send({
          name: 'Иван',
          phone: '+79991234567',
          message: 'Вопрос про квест на день рождения'
        })

      // Ответ всё равно 200 — Telegram не блокирует
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })
})
