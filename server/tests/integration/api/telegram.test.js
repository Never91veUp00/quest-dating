import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import { setupIntegration, teardownIntegration } from '../../helpers/integration-db.js'

// Integration-тесты Telegram-вебхука на РЕАЛЬНОЙ PostgreSQL (testcontainers).
//
// Прежний мок-тест покрывал ТОЛЬКО проверку secret-token и не трогал главное —
// поиск заказа по view_token. Здесь добавлено именно оно (на реальной БД).
//
// Особенности роута, определяющие дизайн теста:
//  1. Хендлер отвечает 200 СРАЗУ, а pool.query + отправка в Telegram идут
//     ПОСЛЕ ответа (fire-and-forget). Поэтому наблюдаемый результат поиска —
//     это исходящий fetch на api.telegram.org, который мы перехватываем.
//     После 200 надо дождаться, пока async-часть отработает (waitFor).
//  2. BOT_TOKEN читается в telegram.js на ИМПОРТЕ модуля. Без него sendTg
//     молча выходит и fetch не зовётся. Поэтому TELEGRAM_BOT_TOKEN ставим
//     ДО setupIntegration (которая динамически импортит app → telegram.js).

const waitFor = async (predicate, { timeout = 3000, interval = 20 } = {}) => {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    if (await predicate()) return true
    await new Promise(r => setTimeout(r, interval))
  }
  return false
}

const tgBodyText = () => {
  const call = global.fetch.mock.calls[0]
  return JSON.parse(call[1].body).text
}

// Сообщение не с /start → хендлер выходит до БД и до fetch. Удобно для
// изолированной проверки secret-гейта (без побочного запроса в БД).
const nonCommandUpdate = { message: { text: 'привет', chat: { id: 123 } } }

let ctx
let viewToken          // view_token заказа-фикстуры
let realFetch

beforeAll(async () => {
  // ДО setupIntegration: telegram.js на импорте читает BOT_TOKEN.
  process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token'
  ctx = await setupIntegration()

  // Заказ-фикстура — вебхук ищет заказ по view_token. template_id=11
  // ('Детективное расследование') для JOIN на quest_templates.
  const { rows } = await ctx.pool.query(
    `INSERT INTO orders (template_id, client_name, client_email, event_city,
                         status, base_price, additional_costs, total_price, description)
     VALUES (11, 'Иван Петров', 'ivan@example.com', 'Москва',
             'confirmed', 49900, 0, 49900, 'тестовый заказ')
     RETURNING view_token`
  )
  viewToken = rows[0].view_token
}, 120000)

afterAll(async () => {
  delete process.env.TELEGRAM_BOT_TOKEN
  await teardownIntegration(ctx)
})

beforeEach(() => {
  // Перехват исходящего вызова Telegram API. pg и supertest fetch не
  // используют, контейнерные операции в тестах не вызываются — стаб безопасен.
  realFetch = global.fetch
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) })
})

afterEach(() => {
  global.fetch = realFetch
  delete process.env.TELEGRAM_WEBHOOK_SECRET
})

describe('POST /api/telegram/webhook — верификация secret-token', () => {
  it('200 если TELEGRAM_WEBHOOK_SECRET не задан (backward compat)', async () => {
    const res = await request(ctx.app).post('/api/telegram/webhook').send(nonCommandUpdate)
    expect(res.status).toBe(200)
  })

  it('200 если secret совпадает с заголовком', async () => {
    process.env.TELEGRAM_WEBHOOK_SECRET = 'my-secret'
    const res = await request(ctx.app)
      .post('/api/telegram/webhook')
      .set('X-Telegram-Bot-Api-Secret-Token', 'my-secret')
      .send(nonCommandUpdate)
    expect(res.status).toBe(200)
  })

  it('401 при неверном заголовке — БД НЕ трогается', async () => {
    process.env.TELEGRAM_WEBHOOK_SECRET = 'my-secret'
    const spy = vi.spyOn(ctx.pool, 'query')

    const res = await request(ctx.app)
      .post('/api/telegram/webhook')
      .set('X-Telegram-Bot-Api-Secret-Token', 'wrong-secret')
      .send({ message: { text: `/start ${viewToken}`, chat: { id: 1 } } })

    expect(res.status).toBe(401)
    expect(spy).not.toHaveBeenCalled() // реальный pool, но spy ловит 0 вызовов
    spy.mockRestore()
  })

  it('401 если заголовок отсутствует — БД НЕ трогается', async () => {
    process.env.TELEGRAM_WEBHOOK_SECRET = 'my-secret'
    const spy = vi.spyOn(ctx.pool, 'query')

    const res = await request(ctx.app)
      .post('/api/telegram/webhook')
      .send({ message: { text: `/start ${viewToken}`, chat: { id: 1 } } })

    expect(res.status).toBe(401)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe('POST /api/telegram/webhook — поиск заказа по view_token (реальная БД)', () => {
  it('/start <валидный токен>: находит заказ, шлёт сообщение с реальными данными', async () => {
    const res = await request(ctx.app)
      .post('/api/telegram/webhook')
      .send({ message: { text: `/start ${viewToken}`, chat: { id: 555 } } })

    expect(res.status).toBe(200) // отвечает сразу, остальное async

    const sent = await waitFor(() => global.fetch.mock.calls.length > 0)
    expect(sent).toBe(true)

    const text = tgBodyText()
    expect(text).toContain('Детективное расследование') // JOIN на quest_templates
    expect(text).toContain('Иван Петров')
    expect(text).toContain('Подтверждён')               // STATUS_LABELS['confirmed']
    expect(text).toContain(viewToken)                    // ссылка на заказ

    // Отправлено в правильный чат и на Telegram sendMessage.
    expect(global.fetch.mock.calls[0][0]).toContain('/sendMessage')
    expect(JSON.parse(global.fetch.mock.calls[0][1].body).chat_id).toBe(555)
  })

  it('/start <неизвестный токен>: сообщение «заказ не найден»', async () => {
    await request(ctx.app)
      .post('/api/telegram/webhook')
      .send({ message: { text: '/start 00000000-0000-0000-0000-000000000000', chat: { id: 1 } } })
      .expect(200)

    const sent = await waitFor(() => global.fetch.mock.calls.length > 0)
    expect(sent).toBe(true)
    expect(tgBodyText()).toContain('не найден')
  })

  it('/start без токена: приветствие, БД не запрашивается', async () => {
    const spy = vi.spyOn(ctx.pool, 'query')

    await request(ctx.app)
      .post('/api/telegram/webhook')
      .send({ message: { text: '/start', chat: { id: 1 } } })
      .expect(200)

    const sent = await waitFor(() => global.fetch.mock.calls.length > 0)
    expect(sent).toBe(true)
    expect(tgBodyText()).toContain('Quest Dating')
    expect(spy).not.toHaveBeenCalled() // приветствие не лезет в orders
    spy.mockRestore()
  })

  it('сообщение не с /start: ни БД, ни Telegram не дёргаются', async () => {
    const spy = vi.spyOn(ctx.pool, 'query')

    await request(ctx.app)
      .post('/api/telegram/webhook')
      .send(nonCommandUpdate)
      .expect(200)

    // Дать возможной async-части шанс отработать, затем убедиться, что её не было.
    await new Promise(r => setTimeout(r, 150))
    expect(global.fetch).not.toHaveBeenCalled()
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})