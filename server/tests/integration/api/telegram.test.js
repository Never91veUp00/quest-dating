import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import request from 'supertest'
import pool from '@src/config/database.js'
import { createApp } from '@src/app.js'

let app

beforeAll(() => {
  app = createApp()
})

afterEach(() => {
  delete process.env.TELEGRAM_WEBHOOK_SECRET
})

const webhookUpdate = {
  message: { text: '/start some-token', chat: { id: 123456 } },
}

describe('POST /api/telegram/webhook — верификация secret_token', () => {
  it('возвращает 200 если TELEGRAM_WEBHOOK_SECRET не задан (backward compat)', async () => {
    const res = await request(app)
      .post('/api/telegram/webhook')
      .send(webhookUpdate)

    expect(res.status).toBe(200)
  })

  it('возвращает 200 если secret совпадает с заголовком', async () => {
    process.env.TELEGRAM_WEBHOOK_SECRET = 'my-secret'

    const res = await request(app)
      .post('/api/telegram/webhook')
      .set('X-Telegram-Bot-Api-Secret-Token', 'my-secret')
      .send(webhookUpdate)

    expect(res.status).toBe(200)
  })

  it('возвращает 401 если secret задан но заголовок неверный — в БД ничего не записано', async () => {
    process.env.TELEGRAM_WEBHOOK_SECRET = 'my-secret'

    const res = await request(app)
      .post('/api/telegram/webhook')
      .set('X-Telegram-Bot-Api-Secret-Token', 'wrong-secret')
      .send(webhookUpdate)

    expect(res.status).toBe(401)
    expect(pool.query).not.toHaveBeenCalled()
  })

  it('возвращает 401 если secret задан но заголовок отсутствует — в БД ничего не записано', async () => {
    process.env.TELEGRAM_WEBHOOK_SECRET = 'my-secret'

    const res = await request(app)
      .post('/api/telegram/webhook')
      .send(webhookUpdate)

    expect(res.status).toBe(401)
    expect(pool.query).not.toHaveBeenCalled()
  })
})
