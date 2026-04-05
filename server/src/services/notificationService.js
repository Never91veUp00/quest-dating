// Уведомления через Telegram Bot API и Email (SMTP)
import { logger } from '../utils/logger.js'

// ─── Telegram ────────────────────────────────────────────────────────────────
const sendTelegramMessage = async (text) => {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    logger.warn('Telegram не настроен')
    return
  }
  try {
    const r = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text, parse_mode: 'HTML', disable_web_page_preview: true
        })
      }
    )
    if (!r.ok) { const e = await r.json(); logger.error('Telegram error', { desc: e.description }) }
  } catch (e) { logger.error('Telegram send failed', { msg: e.message }) }
}

// ─── Email ────────────────────────────────────────────────────────────────────
let _transport = null

const getTransport = async () => {
  if (_transport) return _transport
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return null
  try {
    const { default: nodemailer } = await import('nodemailer')
    const port = parseInt(process.env.SMTP_PORT || '465')
    _transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port, secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    await _transport.verify()
    logger.info('SMTP ready', { host: process.env.SMTP_HOST })
    return _transport
  } catch (e) {
    logger.error('SMTP init failed', { msg: e.message })
    _transport = null
    return null
  }
}

const sendEmail = async (subject, html) => {
  const t = await getTransport()
  if (!t) return
  try {
    await t.sendMail({
      from: `"Quest Dating" <${process.env.SMTP_FROM}>`,
      to: process.env.SMTP_TO,
      subject, html,
    })
    logger.info('Email sent', { subject })
  } catch (e) {
    logger.error('Email failed', { msg: e.message })
    _transport = null
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (k) => (k / 100).toLocaleString('ru-RU') + ' ₽'
const fmtDate  = (d) => d
  ? new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  : 'не указана'
const fmtNow   = () => new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })

const FEATURE_LABELS = {
  background_music:  'Музыка',
  video_messages:    'Видео',
  custom_photos:     'Фото',
  qr_codes:          'QR-коды',
  partner_surprises: 'Сюрпризы',
}

const STATUS_LABELS = {
  confirmed:   'Подтверждён',
  in_progress: 'В работе',
  completed:   'Выполнен',
  cancelled:   'Отменён',
}

const emailWrap = (body) =>
  `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">${body}
   <p style="color:#999;font-size:12px;margin-top:24px">Quest Dating &middot; ${fmtNow()} МСК</p></div>`

const row = (label, value) =>
  `<tr><td style="padding:5px 12px 5px 0;color:#777;white-space:nowrap">${label}</td>
       <td style="padding:5px 0">${value}</td></tr>`

// ─── New order ────────────────────────────────────────────────────────────────
export const notifyNewOrder = async (order, templateTitle) => {
  const price    = fmtPrice(order.total_price)
  const date     = fmtDate(order.event_date)
  const features = Array.isArray(order.selected_features) && order.selected_features.length
    ? order.selected_features.map(f => FEATURE_LABELS[f] || f).join(', ')
    : null

  const tgLines = [
    `<b>Новый заказ #${order.id}</b>`,
    ``,
    `Клиент: <b>${order.client_name}</b>`,
    `Email: ${order.client_email}`,
    order.client_phone ? `Тел: ${order.client_phone}` : null,
    ``,
    `Квест: ${templateTitle}`,
    `Дата: ${date}`,
    order.event_city ? `Город: ${order.event_city}` : null,
    `Сумма: <b>${price}</b>`,
    features ? `Опции: ${features}` : null,
    order.description ? `` : null,
    order.description ? `<i>${order.description.slice(0, 400)}</i>` : null,
    ``,
    `${fmtNow()} МСК`,
  ]

  const rows = [
    row('Клиент', `<b>${order.client_name}</b>`),
    row('Email', `<a href="mailto:${order.client_email}">${order.client_email}</a>`),
    order.client_phone ? row('Телефон', order.client_phone) : '',
    row('Квест', templateTitle),
    row('Дата', date),
    order.event_city ? row('Город', order.event_city) : '',
    row('Сумма', `<b style="color:#c8960c">${price}</b>`),
    features ? row('Опции', features) : '',
  ]

  const html = emailWrap(`
    <h2 style="color:#c8960c;border-bottom:2px solid #eee;padding-bottom:8px">
      Новый заказ #${order.id}</h2>
    <table style="border-collapse:collapse;width:100%">${rows.join('')}</table>
    ${order.description ? `
    <div style="margin-top:16px;padding:12px 16px;background:#fdf8ee;
                border-left:3px solid #c8960c;border-radius:0 4px 4px 0">
      <div style="font-size:12px;color:#999;margin-bottom:4px">Пожелания</div>
      ${order.description.replace(/\n/g, '<br>')}
    </div>` : ''}`)

  await Promise.allSettled([
    sendTelegramMessage(tgLines.filter(l => l !== null).join('\n')),
    sendEmail(`Заказ #${order.id} — ${order.client_name}`, html),
  ])
}

// ─── Status change ────────────────────────────────────────────────────────────
export const notifyOrderStatusChange = async (order, newStatus) => {
  const label = STATUS_LABELS[newStatus] || newStatus

  const tg = [
    `<b>Статус заказа #${order.id}</b>`,
    `${order.client_name} (${order.client_email})`,
    `Статус: ${label}`,
    order.admin_notes ? `Заметка: <i>${order.admin_notes}</i>` : null,
  ]

  const html = emailWrap(`
    <h2 style="color:#c8960c">Заказ #${order.id} — статус изменён</h2>
    <table style="border-collapse:collapse">
      ${row('Клиент', order.client_name)}
      ${row('Email', order.client_email)}
      ${row('Статус', `<b>${label}</b>`)}
      ${order.admin_notes ? row('Заметка', order.admin_notes) : ''}
    </table>`)

  await Promise.allSettled([
    sendTelegramMessage(tg.filter(Boolean).join('\n')),
    sendEmail(`Заказ #${order.id} — ${label}`, html),
  ])
}

// ─── Contact form ─────────────────────────────────────────────────────────────
export const notifyContactMessage = async ({ name, phone, message }) => {
  const tg = [
    `<b>Сообщение с сайта</b>`,
    ``,
    `Имя: <b>${name}</b>`,
    `Тел: ${phone}`,
    ``,
    `<i>${message}</i>`,
  ]

  const html = emailWrap(`
    <h2 style="color:#c8960c">Сообщение с сайта</h2>
    <table style="border-collapse:collapse">
      ${row('Имя', `<b>${name}</b>`)}
      ${row('Телефон', phone)}
    </table>
    <div style="margin-top:16px;padding:12px 16px;background:#fdf8ee;
                border-left:3px solid #c8960c;border-radius:0 4px 4px 0">
      ${message.replace(/\n/g, '<br>')}
    </div>`)

  await Promise.allSettled([
    sendTelegramMessage(tg.join('\n')),
    sendEmail(`Сообщение с сайта от ${name}`, html),
  ])
}
