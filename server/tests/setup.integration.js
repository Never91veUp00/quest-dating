import { vi } from 'vitest'

// Setup для integration-прогона (РЕАЛЬНАЯ БД через testcontainers).
//
// В отличие от tests/setup.js здесь НЕ мокается база — pool ходит в живой
// PostgreSQL-контейнер (см. tests/helpers/integration-db.js). Мокаем только
// две внешние по отношению к БД вещи, которые иначе мешают:
//
//  1. rate-лимитеры — orderLimiter (10/час), contactLimiter, loginLimiter и пр.
//     прописаны прямо в роутах, а не в app.js, поэтому через NODE_ENV их не
//     отключить. Без pass-through повторные POST в одном файле выбивали бы 429.
//  2. notificationService — создание заказа дёргает notifyNewOrder +
//     sendClientOrderEmail. Без мока тест полез бы в реальный Telegram/Resend.
//
// Полный набор экспортов notificationService замокан (не только вызываемые в
// orders) — чтобы этот же setup переиспользовался при миграции quests/telegram.

const passThroughMiddleware = (_req, _res, next) => next()

vi.mock('@src/middleware/rateLimiter.js', () => ({
  generalLimiter: passThroughMiddleware,
  adminLimiter:   passThroughMiddleware,
  loginLimiter:   passThroughMiddleware,
  contactLimiter: passThroughMiddleware,
  orderLimiter:   passThroughMiddleware,
  questLimiter:   passThroughMiddleware,
}))

vi.mock('@src/services/notificationService.js', () => ({
  notifyNewOrder:          vi.fn().mockResolvedValue(undefined),
  notifyOrderStatusChange: vi.fn().mockResolvedValue(undefined),
  notifyContactMessage:    vi.fn().mockResolvedValue(undefined),
  sendClientOrderEmail:    vi.fn().mockResolvedValue(undefined),
}))

// Сброс счётчиков вызовов между тестами (как в unit-setup).
beforeEach(() => {
  vi.clearAllMocks()
})
