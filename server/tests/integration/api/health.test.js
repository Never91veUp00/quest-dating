import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import pool from '@src/config/database.js'
import { createApp } from '@src/app.js'

let app

beforeAll(() => {
  app = createApp()
})

describe('GET /health', () => {
  it('возвращает 200 и db: connected если БД отвечает', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })

    const res = await request(app).get('/health')

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('OK')
    expect(res.body.db).toBe('connected')
    expect(res.body.timestamp).toBeDefined()
    expect(typeof res.body.uptime).toBe('number')
  })

  it('возвращает 503 и db: disconnected если БД недоступна', async () => {
    pool.query.mockRejectedValueOnce(new Error('connection refused'))

    const res = await request(app).get('/health')

    expect(res.status).toBe(503)
    expect(res.body.status).toBe('DEGRADED')
    expect(res.body.db).toBe('disconnected')
    expect(res.body.error).toBe('connection refused')
    expect(res.body.timestamp).toBeDefined()
  })
})
