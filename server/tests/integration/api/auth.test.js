import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import { createApp } from '@src/app.js'

let app
beforeAll(async () => {
  process.env.ADMIN_USERNAME      = 'admin'
  process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash('correct-password', 10)
  app = createApp()
})

describe('POST /api/auth/login', () => {
  describe('валидация входных данных', () => {
    it('возвращает 400 если username пустой', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: '', password: 'abc' })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })

    it('возвращает 400 если password отсутствует', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin' })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    })
  })

  describe('неверные данные', () => {
    it('возвращает 401 для неверного логина', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'wrong-admin', password: 'correct-password' })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.message).toBe('Неверный логин или пароль')
    })

    it('возвращает 401 для неверного пароля', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrong-password' })

      expect(res.status).toBe(401)
      expect(res.body.message).toBe('Неверный логин или пароль')
    })

    it('оба случая возвращают одинаковое сообщение (security — не раскрываем что именно неверно)', async () => {
      // Делаем запросы последовательно чтобы избежать состояния гонки с env
      const wrongLogin = await request(app)
        .post('/api/auth/login')
        .send({ username: 'wrong', password: 'correct-password' })

      const wrongPass = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrong' })

      expect(wrongLogin.status).toBe(401)
      expect(wrongPass.status).toBe(401)
      expect(wrongLogin.body.message).toBe('Неверный логин или пароль')
      expect(wrongPass.body.message).toBe('Неверный логин или пароль')
    })
  })

  describe('успешный вход', () => {
    it('возвращает JWT токен при верных данных', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'correct-password' })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.token).toBeDefined()
      expect(typeof res.body.token).toBe('string')
      expect(res.body.token.split('.')).toHaveLength(3) // JWT = header.payload.sig
    })
  })
})
