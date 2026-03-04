import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Глобальные моки для Vue Test Utils
config.global.stubs = {
  // Мокаем router-link и router-view по умолчанию
  RouterLink: { template: '<a><slot /></a>' },
  RouterView: { template: '<div />' },
}

// Мок для api сервиса — переопределяй в каждом тесте если нужно
vi.mock('@/services/api.js', () => ({
  default: {
    getTemplates:   vi.fn().mockResolvedValue({ data: { data: [], pagination: {} } }),
    getTemplate:    vi.fn().mockResolvedValue({ data: {} }),
    createOrder:    vi.fn().mockResolvedValue({ data: {} }),
    getStats:       vi.fn().mockResolvedValue({ data: {} }),
    sendContact:    vi.fn().mockResolvedValue({ success: true }),
  }
}))

// Сброс моков между тестами
beforeEach(() => {
  vi.clearAllMocks()
})
