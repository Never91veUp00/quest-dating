import express from 'express'
import pool from '../config/database.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

const sendTg = async (chatId, text) => {
  if (!BOT_TOKEN) return
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId, text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }),
    })
    if (!r.ok) { const e = await r.json(); logger.warn('TG send warn', { desc: e.description }) }
  } catch (e) { logger.error('TG send failed', { msg: e.message }) }
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

// POST /api/telegram/webhook — вебхук от Telegram
router.post('/webhook', async (req, res) => {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (secret) {
    if (req.headers['x-telegram-bot-api-secret-token'] !== secret) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  } else {
    logger.warn('TELEGRAM_WEBHOOK_SECRET не задан — вебхук без верификации')
  }

  res.sendStatus(200) // всегда 200 первым — Telegram ждёт быстрого ответа

  try {
    const update = req.body
    const message = update.message
    if (!message?.text) return

    const chatId = message.chat.id
    const text   = message.text.trim()

    if (!text.startsWith('/start')) return

    const token = text.replace('/start', '').trim()

    if (!token) {
      // /start без токена — приветствие
      await sendTg(chatId,
        '👋 Привет! Я бот <b>Quest Dating</b>.\n\n' +
        'Чтобы проверить статус заказа, перейдите по ссылке из письма — ' +
        'она автоматически откроет чат с деталями вашего квеста.')
      return
    }

    // Ищем заказ по токену
    const result = await pool.query(`
      SELECT o.id, o.client_name, o.client_email, o.event_date, o.event_city,
             o.total_price, o.status, o.selected_features, o.view_token,
             qt.title as template_title
      FROM orders o
      LEFT JOIN quest_templates qt ON o.template_id = qt.id
      WHERE o.view_token = $1
    `, [token])

    if (!result.rows.length) {
      await sendTg(chatId, '😕 Заказ не найден. Проверьте ссылку из письма.')
      return
    }

    const o      = result.rows[0]
    const price  = (o.total_price / 100).toLocaleString('ru-RU') + '\u00a0\u20bd'
    const date   = fmtDate(o.event_date)
    const status = STATUS_LABELS[o.status] || o.status
    const orderUrl = `https://questdating.ru/my-order/${token}`

    const lines = [
      `🎉 <b>${o.template_title}</b>`,
      ``,
      `👤 ${o.client_name}`,
      `📋 Статус: <b>${status}</b>`,
      `📅 Дата: ${date}`,
      o.event_city ? `📍 Город: ${o.event_city}` : null,
      `💰 Сумма: <b>${price}</b>`,
      ``,
      `🔗 <a href="${orderUrl}">Детали заказа на сайте</a>`,
      ``,
      `✨ Готовый квест придёт на ${o.client_email} в течение 24 часов.`,
    ]

    await sendTg(chatId, lines.filter(l => l !== null).join('\n'))
  } catch (err) {
    logger.error('Telegram webhook error', { err: err.message })
  }
})

export default router
