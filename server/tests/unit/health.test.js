import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest'
import request from 'supertest'
import pool from '@src/config/database.js'
import { createApp } from '@src/app.js'

// Unit-тест /health с МОКОМ БД (использует tests/setup.js, где pool замокан).
// Здесь проверяется ОБРАБОТКА ответа БД, в т.ч. ветка ошибки (503), которую
// неудобно воспроизводить на реальном контейнере. Кейс "реальное соединение"
// живёт в tests/integration/api/health.test.js (testcontainers).

let app

beforeAll(() => {
  app = createApp()
})

// services-проверка читает process.env в момент запроса — изолируем env между тестами.
const SVC_VARS = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'RESEND_API_KEY', 'NOTIFY_EMAIL']
const savedEnv = {}
afterEach(() => {
  for (const v of SVC_VARS) {
    if (v in savedEnv) { process.env[v] = savedEnv[v]; delete savedEnv[v] }
    else delete process.env[v]
  }
})
const setEnv = (obj) => {
  for (const [k, val] of Object.entries(obj)) {
    if (!(k in savedEnv)) savedEnv[k] = process.env[k]
    process.env[k] = val
  }
}
const clearEnv = (...keys) => {
  for (const k of keys) {
    if (!(k in savedEnv)) savedEnv[k] = process.env[k]
    delete process.env[k]
  }
}

describe('GET /health (unit, мок БД)', () => {
  it('возвращает 200 и db: connected когда pool.query успешен', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })

    const res = await request(app).get('/health')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('OK')
    expect(res.body.db).toBe('connected')
    expect(res.body.timestamp).toBeDefined()
    expect(typeof res.body.uptime).toBe('number')
  })

  it('возвращает 503 и db: disconnected когда pool.query падает', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection refused'))

    const res = await request(app).get('/health')

    expect(res.status).toBe(503)
    expect(res.body.status).toBe('DEGRADED')
    expect(res.body.db).toBe('disconnected')
    expect(res.body.error).toBe('connection refused')
    expect(res.body.timestamp).toBeDefined()
  })
})

describe('GET /health — поле services (настроенность внешних каналов)', () => {
  it('telegram: configured только если есть И токен, И chat_id', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })
    setEnv({ TELEGRAM_BOT_TOKEN: 'tok', TELEGRAM_CHAT_ID: '123' })

    const res = await request(app).get('/health')
    expect(res.body.services.telegram).toBe('configured')
  })

  it('telegram: not_configured если есть токен, но НЕТ chat_id', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })
    setEnv({ TELEGRAM_BOT_TOKEN: 'tok' })
    clearEnv('TELEGRAM_CHAT_ID')

    const res = await request(app).get('/health')
    expect(res.body.services.telegram).toBe('not_configured')
  })

  it('resend: configured при наличии RESEND_API_KEY', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })
    setEnv({ RESEND_API_KEY: 'key' })

    const res = await request(app).get('/health')
    expect(res.body.services.resend).toBe('configured')
  })

  it('resend/notifyEmail: not_configured когда переменных нет', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })
    clearEnv('RESEND_API_KEY', 'NOTIFY_EMAIL')

    const res = await request(app).get('/health')
    expect(res.body.services.resend).toBe('not_configured')
    expect(res.body.services.notifyEmail).toBe('not_configured')
  })

  it('services присутствует и в ответе 503 (БД легла)', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection refused'))
    setEnv({ TELEGRAM_BOT_TOKEN: 'tok', TELEGRAM_CHAT_ID: '123' })

    const res = await request(app).get('/health')
    expect(res.status).toBe(503)
    expect(res.body.services.telegram).toBe('configured')
  })
})