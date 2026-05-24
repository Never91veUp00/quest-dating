import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Глобальные стабы для Vue Test Utils
config.global.stubs = {
  // NuxtLink → обычный <a> в тестах
  NuxtLink: { template: '<a><slot /></a>' },
  // RouterLink/RouterView для совместимости
  RouterLink: { template: '<a><slot /></a>' },
  RouterView: { template: '<div />' },
}

// Мок Nuxt-специфичных composables, недоступных вне Nuxt runtime
vi.mock('#app', () => ({
  useRuntimeConfig: () => ({
    public: { apiBase: 'http://localhost:5000/api' },
    apiBaseInternal: 'http://localhost:5000/api',
  }),
  useNuxtApp: () => ({}),
  navigateTo: vi.fn(),
  useRoute: () => ({ params: {}, query: {} }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

// Мок useApi composable
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    get:    vi.fn().mockResolvedValue({ data: {} }),
    post:   vi.fn().mockResolvedValue({ data: {} }),
    put:    vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  }),
}))

// Сброс всех моков между тестами
beforeEach(() => {
  vi.clearAllMocks()
})
