import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// vi.stubGlobal до импорта модуля — иначе fetch уже захвачен
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Размокаем — в setup.js notificationService замокан глобально,
// здесь нам нужен реальный модуль
vi.unmock('@src/services/notificationService.js')

import {
  notifyNewOrder,
  notifyContactMessage,
  notifyOrderStatusChange,
} from '@src/services/notificationService.js'

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token'
    process.env.TELEGRAM_CHAT_ID   = '123456789'
  })

  afterEach(() => {
    delete process.env.TELEGRAM_BOT_TOKEN
    delete process.env.TELEGRAM_CHAT_ID
  })

  describe('notifyNewOrder', () => {
    const baseOrder = {
      id: 42,
      client_name: 'Алексей',
      client_email: 'alex@example.com',
      client_phone: '+79161234567',
      event_date: '2025-06-14',
      event_city: 'Москва',
      total_price: 350000,
      selected_features: ['background_music', 'custom_photos'],
      description: 'Романтический вечер'
    }

    it('отправляет запрос к Telegram API', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      await notifyNewOrder(baseOrder, 'Детективный квест')

      expect(mockFetch).toHaveBeenCalledOnce()
      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toContain('test-bot-token')
      expect(url).toContain('sendMessage')

      const body = JSON.parse(options.body)
      expect(body.chat_id).toBe('123456789')
      expect(body.parse_mode).toBe('HTML')
    })

    it('содержит ID заказа, имя клиента и название квеста', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      await notifyNewOrder(baseOrder, 'Детективный квест')

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.text).toContain('42')
      expect(body.text).toContain('Алексей')
      expect(body.text).toContain('Детективный квест')
    })

    it('маскирует телефон — показывает только последние 4 цифры', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      await notifyNewOrder(baseOrder, 'Квест')

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.text).toContain('***4567')
      expect(body.text).not.toContain('+79161234567')
    })

    it('не вызывает fetch если Telegram не настроен', async () => {
      delete process.env.TELEGRAM_BOT_TOKEN

      await notifyNewOrder(baseOrder, 'Квест')

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('не падает при ошибке Telegram API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ description: 'Bad Request' })
      })

      await expect(notifyNewOrder(baseOrder, 'Квест')).resolves.toBeUndefined()
    })
  })

  describe('notifyContactMessage', () => {
    it('отправляет имя, телефон и сообщение', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      await notifyContactMessage({
        name: 'Мария',
        phone: '+79991234567',
        message: 'Хочу заказать квест на день рождения'
      })

      expect(mockFetch).toHaveBeenCalledOnce()
      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.text).toContain('Мария')
      expect(body.text).toContain('+79991234567')
      expect(body.text).toContain('день рождения')
    })
  })

  describe('notifyOrderStatusChange', () => {
    it('отправляет ID заказа и новый статус', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true })

      const order = { id: 5, client_name: 'Иван', client_email: 'ivan@test.com' }
      await notifyOrderStatusChange(order, 'confirmed')

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.text).toContain('5')
      expect(body.text).toContain('Иван')
    })
  })
})
