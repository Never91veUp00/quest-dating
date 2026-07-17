import express from 'express'
import fs     from 'fs/promises'
import path   from 'path'
import crypto from 'crypto'
import pool   from '../config/database.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

const BOT_TOKEN   = process.env.TELEGRAM_BOT_TOKEN
const CHANNEL_ID  = process.env.TELEGRAM_CHANNEL_ID
const PUBLIC_URL  = process.env.PUBLIC_URL || 'https://questdating.ru'
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads')
const CARDS_DIR   = path.join(UPLOADS_DIR, 'temp-cards')
const CARD_TTL_MS = 2 * 60 * 60 * 1000 // 2 часа

// userId → { token, expires } — хранится до выдачи или истечения TTL
const userCardTokens = new Map()

// ── Helpers ────────────────────────────────────────────────────────

const tgFetch = (method, body) =>
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })

const sendTg = async (chatId, text, extra = {}) => {
  if (!BOT_TOKEN) return
  try {
    const r = await tgFetch('sendMessage', {
      chat_id: chatId, text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...extra,
    })
    if (!r.ok) { const e = await r.json(); logger.warn('TG send warn', { desc: e.description }) }
  } catch (e) { logger.error('TG send failed', { msg: e.message }) }
}

const isChannelMember = async (userId) => {
  if (!CHANNEL_ID) return true
  try {
    const r = await tgFetch('getChatMember', { chat_id: CHANNEL_ID, user_id: userId })
    const data = await r.json()
    return ['member', 'administrator', 'creator'].includes(data.result?.status)
  } catch { return false }
}

const cleanupOldCards = async () => {
  try {
    const files = await fs.readdir(CARDS_DIR).catch(() => [])
    const now = Date.now()
    for (const f of files) {
      if (!f.endsWith('.png')) continue
      const stat = await fs.stat(path.join(CARDS_DIR, f)).catch(() => null)
      if (stat && now - stat.mtimeMs > CARD_TTL_MS) {
        await fs.unlink(path.join(CARDS_DIR, f)).catch(() => {})
      }
    }
  } catch (e) { logger.error('Card cleanup error', { msg: e.message }) }
}

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  : 'не указана'

const STATUS_LABELS = {
  pending:     'Ожидает подтверждения',
  confirmed:   'Подтверждён',
  in_progress: 'В работе',
  completed:   'Выполнен',
  cancelled:   'Отменён',
}

// ── POST /api/telegram/card ─────────────────────────────────────────
router.post(
  '/card',
  express.raw({ type: 'image/png', limit: '6mb' }),
  async (req, res) => {
    if (!req.body || !req.body.length) {
      return res.status(400).json({ error: 'Empty body' })
    }
    try {
      await fs.mkdir(CARDS_DIR, { recursive: true })
      await cleanupOldCards()

      const token    = crypto.randomUUID()
      const filePath = path.join(CARDS_DIR, `${token}.png`)
      await fs.writeFile(filePath, req.body)

      logger.info('Card saved', { token, size: req.body.length })
      res.json({ token })
    } catch (e) {
      logger.error('Card save error', { msg: e.message })
      res.status(500).json({ error: 'Failed to save card' })
    }
  }
)

// ── POST /api/telegram/webhook ──────────────────────────────────────
router.post('/webhook', async (req, res) => {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (secret && req.headers['x-telegram-bot-api-secret-token'] !== secret) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (!secret) logger.warn('TELEGRAM_WEBHOOK_SECRET не задан')

  res.sendStatus(200)

  try {
    const update = req.body

    // ── Callback query ──────────────────────────────────────────────
    if (update.callback_query) {
      const cb     = update.callback_query
      const chatId = cb.from.id
      const data   = cb.data || ''

      await tgFetch('answerCallbackQuery', { callback_query_id: cb.id })

      if (data === 'check_sub') {
        const member = await isChannelMember(chatId)
        if (!member) {
          await sendTg(chatId, '❌ Ты ещё не подписался на канал. Подпишись и нажми кнопку снова 👇',
            subscribeKeyboard())
        } else {
          await sendTg(chatId,
            '✅ <b>Подписка подтверждена!</b>\n\n' +
            'Теперь отправь команду /photo — и я пришлю тебе твою карточку 📸')
        }
      }
      return
    }

    // ── Обычное сообщение ───────────────────────────────────────────
    const message = update.message
    if (!message?.text) return

    const chatId = message.chat.id
    const text   = message.text.trim()

    // /photo — выдать сохранённую карточку
    if (text === '/photo') {
      await handlePhotoCommand(chatId)
      return
    }

    if (!text.startsWith('/start')) return

    const param = text.replace('/start', '').trim()

    // /start card_TOKEN — сохраняем токен и показываем онбординг
    if (param.startsWith('card_')) {
      const cardToken = param.replace('card_', '')
      userCardTokens.set(chatId, { token: cardToken, expires: Date.now() + CARD_TTL_MS })
      await handleCardOnboarding(chatId)
      return
    }

    // /start без параметра
    if (!param) {
      await sendTg(chatId,
        '👋 Привет! Я бот <b>Quest Dating</b>.\n\n' +
        'Чтобы проверить статус заказа, перейди по ссылке из письма.\n' +
        'Чтобы получить фото с квеста — открой ссылку из результатов квеста.')
      return
    }

    // /start ORDER_TOKEN — статус заказа
    const result = await pool.query(`
      SELECT o.id, o.client_name, o.client_email, o.event_date, o.event_city,
             o.total_price, o.status, o.selected_features, o.view_token,
             qt.title as template_title
      FROM orders o
      LEFT JOIN quest_templates qt ON o.template_id = qt.id
      WHERE o.view_token = $1
    `, [param])

    if (!result.rows.length) {
      await sendTg(chatId, '😕 Заказ не найден. Проверьте ссылку из письма.')
      return
    }

    const o      = result.rows[0]
    const price  = (o.total_price / 100).toLocaleString('ru-RU') + ' ₽'
    const date   = fmtDate(o.event_date)
    const status = STATUS_LABELS[o.status] || o.status
    const orderUrl = `https://questdating.ru/my-order/${param}`

    const lines = [
      `🎉 <b>${o.template_title}</b>`,
      '',
      `👤 ${o.client_name}`,
      `📋 Статус: <b>${status}</b>`,
      `📅 Дата: ${date}`,
      o.event_city ? `📍 Город: ${o.event_city}` : null,
      `💰 Сумма: <b>${price}</b>`,
      '',
      `🔗 <a href="${orderUrl}">Детали заказа на сайте</a>`,
      '',
      `✨ Готовый квест придёт на ${o.client_email} в течение 24 часов.`,
    ]

    await sendTg(chatId, lines.filter(l => l !== null).join('\n'))

  } catch (err) {
    logger.error('Telegram webhook error', { err: err.message })
  }
})

// ── Онбординг при получении токена ─────────────────────────────────
async function handleCardOnboarding(chatId) {
  const channelLink = process.env.TELEGRAM_CHANNEL_LINK || CHANNEL_ID || 'https://t.me/'
  const member = await isChannelMember(chatId)

  if (!member) {
    await sendTg(chatId,
      '🎉 <b>Поздравляю с прохождением квеста!</b>\n\n' +
      'Чтобы получить фото в рамке, нужно:\n' +
      '1️⃣ Подписаться на наш канал\n' +
      '2️⃣ Нажать «Я подписался»\n' +
      '3️⃣ Отправить /photo\n\n' +
      '👇 Переходи и подписывайся:',
      subscribeKeyboard(channelLink)
    )
  } else {
    await sendTg(chatId,
      '🎉 <b>Поздравляю с прохождением квеста!</b>\n\n' +
      'Ты уже подписан на наш канал — отлично! 🙌\n\n' +
      'Отправь /photo и я пришлю тебе карточку результата 📸')
  }
}

// ── Команда /photo ──────────────────────────────────────────────────
async function handlePhotoCommand(chatId) {
  const entry = userCardTokens.get(chatId)

  if (!entry) {
    await sendTg(chatId,
      '🤔 Карточка не найдена.\n\n' +
      'Открой результаты квеста и нажми «Получить фото в Telegram» — ' +
      'я пришлю тебе ссылку снова.')
    return
  }

  if (Date.now() > entry.expires) {
    userCardTokens.delete(chatId)
    await sendTg(chatId,
      '⏰ Ссылка устарела (живёт 2 часа).\n\n' +
      'Вернись в результаты квеста и запроси карточку заново.')
    return
  }

  const member = await isChannelMember(chatId)
  if (!member) {
    const channelLink = process.env.TELEGRAM_CHANNEL_LINK || CHANNEL_ID || 'https://t.me/'
    await sendTg(chatId,
      '🔒 Сначала подпишись на канал, затем нажми «Я подписался» и снова /photo',
      subscribeKeyboard(channelLink)
    )
    return
  }

  await deliverCard(chatId, entry.token)
}

// ── Отправка карточки ───────────────────────────────────────────────
async function deliverCard(chatId, cardToken) {
  const filePath = path.join(CARDS_DIR, `${cardToken}.png`)
  try {
    await fs.access(filePath)
  } catch {
    userCardTokens.delete(chatId)
    await sendTg(chatId,
      '⏰ Файл устарел (живёт 2 часа).\n\n' +
      'Вернись в результаты квеста и запроси карточку заново.')
    return
  }

  const photoUrl = `${PUBLIC_URL}/uploads/temp-cards/${cardToken}.png`
  try {
    const r = await tgFetch('sendPhoto', {
      chat_id: chatId,
      photo:   photoUrl,
      caption: '🎉 Вот твоя карточка результата!\n\nДели с друзьями 💫',
    })
    if (!r.ok) {
      const err = await r.json()
      logger.error('TG sendPhoto failed', { err: err.description })
      await sendTg(chatId, '😕 Не удалось отправить фото. Попробуй /photo ещё раз.')
      return
    }
    userCardTokens.delete(chatId)
    await fs.unlink(filePath).catch(() => {})
    logger.info('Card delivered', { cardToken, chatId })
  } catch (e) {
    logger.error('Card delivery error', { msg: e.message })
    await sendTg(chatId, '😕 Ошибка при отправке. Попробуй /photo позже.')
  }
}

// ── Клавиатура подписки ─────────────────────────────────────────────
function subscribeKeyboard(channelLink) {
  return {
    reply_markup: {
      inline_keyboard: [[
        { text: '📢 Перейти на канал', url: channelLink },
        { text: '✅ Я подписался',     callback_data: 'check_sub' },
      ]]
    }
  }
}

export default router
