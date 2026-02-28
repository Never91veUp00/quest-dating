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