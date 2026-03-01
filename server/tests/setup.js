import { vi } from 'vitest'

// ─── Переменные окружения для тестов ──────────────────────────
process.env.NODE_ENV        = 'test'
process.env.JWT_SECRET      = 'test-secret-key-for-testing-only'
process.env.JWT_EXPIRES_IN  = '7d'
process.env.ADMIN_USERNAME  = 'admin'
// bcrypt hash для пароля 'test-password'
process.env.ADMIN_PASSWORD_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'

// ─── Мок базы данных ───────────────────────────────────────────
vi.mock('@src/config/database.js', () => ({
  default: {
    query: vi.fn(),
    connect: vi.fn(() => ({
      query: vi.fn(),
      release: vi.fn(),
    })),
  },
}))

// ─── Мок Telegram уведомлений ─────────────────────────────────
vi.mock('@src/services/notificationService.js', () => ({
  notifyNewOrder:           vi.fn().mockResolvedValue(undefined),
  notifyOrderStatusChange:  vi.fn().mockResolvedValue(undefined),
  notifyContactMessage:     vi.fn().mockResolvedValue(undefined),
}))

// ─── Мок rate limiters — все лимитеры заменяем на pass-through ─
// loginLimiter и contactLimiter прописаны прямо в роутах, не в app.js,
// поэтому их нельзя отключить через NODE_ENV — нужен мок модуля.
const passThroughMiddleware = (_req, _res, next) => next()

vi.mock('@src/middleware/rateLimiter.js', () => ({
  generalLimiter: passThroughMiddleware,
  adminLimiter:   passThroughMiddleware,
  loginLimiter:   passThroughMiddleware,
  contactLimiter: passThroughMiddleware,
  orderLimiter:   passThroughMiddleware,
  questLimiter:   passThroughMiddleware,
}))

// ─── Глобальный сброс моков между тестами ─────────────────────
beforeEach(() => {
  vi.clearAllMocks()
})
