import rateLimit from 'express-rate-limit'

const isProd = process.env.NODE_ENV === 'production'

// Общий лимит для всех API запросов
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: isProd ? 300 : 1000,  // в dev режиме — без ограничений по сути
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Слишком много запросов, попробуйте позже'
  }
})

// Лимит для прохождения квестов (сессии, прогресс)
export const questLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Слишком много запросов, попробуйте позже'
  }
})

// Жёсткий лимит для создания заказов
export const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 5, // не более 5 заказов в час с одного IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Слишком много заказов. Пожалуйста, подождите немного или напишите нам напрямую.'
  }
})

// Лимит для формы обратной связи (About.vue)
export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 час
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Слишком много сообщений. Попробуйте позже или напишите напрямую в Telegram.'
  }
})

// Лимит для админки — мягкий, т.к. дашборд делает много параллельных запросов.
// В dev режиме лимит фактически отключён.
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 2000 : 100000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Слишком много запросов к админке'
  }
})

// FIX: Отдельный жёсткий лимит для авторизации — защита от брутфорса.
// Ранее использовался contactLimiter (3/час) — слишком мягко для login.
// Теперь: 5 попыток за 15 минут, после чего 15-минутная блокировка.
// skipSuccessfulRequests: true — успешный вход не засчитывается в лимит.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Слишком много попыток входа. Подождите 15 минут и попробуйте снова.'
  }
})