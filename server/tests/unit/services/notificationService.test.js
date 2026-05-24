import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { logger } from '@src/utils/logger.js'

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

  describe('sendEmail — защита NOTIFY_EMAIL', () => {
    const testOrder = {
      id: 99,
      client_name: 'Тест',
      client_email: 'test@example.com',
      client_phone: null,
      event_date: null,
      event_city: null,
      total_price: 100000,
      selected_features: [],
      description: null,
    }

    beforeEach(() => {
      process.env.RESEND_API_KEY = 'test-resend-key'
    })

    afterEach(() => {
      delete process.env.RESEND_API_KEY
      delete process.env.NOTIFY_EMAIL
    })

    it('отправляет email на NOTIFY_EMAIL если переменная задана', async () => {
      process.env.NOTIFY_EMAIL = 'admin@questdating.ru'
      mockFetch
        .mockResolvedValueOnce({ ok: true })                                    // Telegram
        .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 'r1' }) }) // Email

      await notifyNewOrder(testOrder, 'Тестовый квест')

      const emailCall = mockFetch.mock.calls.find(([url]) => url.includes('resend.com'))
      expect(emailCall).toBeDefined()
      const body = JSON.parse(emailCall[1].body)
      expect(body.to).toContain('admin@questdating.ru')
    })

    it('не отправляет email и логирует warning если NOTIFY_EMAIL не задан', async () => {
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {})
      mockFetch.mockResolvedValueOnce({ ok: true }) // только Telegram

      await notifyNewOrder(testOrder, 'Тестовый квест')

      expect(mockFetch.mock.calls.some(([url]) => url.includes('resend.com'))).toBe(false)
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('NOTIFY_EMAIL'))
      warnSpy.mockRestore()
    })
  })
})
