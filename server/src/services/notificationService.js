// Уведомления через Telegram Bot API и Email (Resend)
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

// ─── Email (Resend HTTP API) ──────────────────────────────────────────────────
const sendEmail = async (subject, html) => {
  if (!process.env.RESEND_API_KEY) { logger.warn('Resend API key не настроен'); return }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Quest Dating <noreply@questdating.ru>',
        to:   [process.env.NOTIFY_EMAIL || 'vp.vlad00@mail.ru'],
        subject,
        html,
      }),
    })
    const data = await r.json()
    if (!r.ok) { logger.error('Resend error', { status: r.status, err: data }); return }
    logger.info('Email sent', { id: data.id, subject })
  } catch (e) { logger.error('Email send failed', { msg: e.message }) }
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

const emailWrap = (body) => `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#f5f5f5;font-family:sans-serif">
<div style="max-width:580px;margin:0 auto;background:#fff;border-radius:8px;
            padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.06)">
  ${body}
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#aaa;font-size:12px;margin:0">Quest Dating · ${fmtNow()} МСК</p>
</div></body></html>`

const row = (label, value) =>
  `<tr>
     <td style="padding:6px 16px 6px 0;color:#888;white-space:nowrap;vertical-align:top">${label}</td>
     <td style="padding:6px 0;color:#1a1a1a">${value}</td>
   </tr>`

// ─── New order ────────────────────────────────────────────────────────────────
export const notifyNewOrder = async (order, templateTitle) => {
  const price    = fmtPrice(order.total_price)
  const date     = fmtDate(order.event_date)
  const features = Array.isArray(order.selected_features) && order.selected_features.length
    ? order.selected_features.map(f => FEATURE_LABELS[f] || f).join(', ')
    : null

  const tgLines = [
    `<b>Новый заказ #${order.id}</b>`, ``,
    `Клиент: <b>${order.client_name}</b>`,
    `Email: ${order.client_email}`,
    order.client_phone ? `Тел: ${order.client_phone}` : null, ``,
    `Квест: ${templateTitle}`,
    `Дата: ${date}`,
    order.event_city ? `Город: ${order.event_city}` : null,
    `Сумма: <b>${price}</b>`,
    features ? `Опции: ${features}` : null,
    order.description ? `` : null,
    order.description ? `<i>${order.description.slice(0, 400)}</i>` : null,
    ``, `${fmtNow()} МСК`,
  ]

  const rows = [
    row('Клиент',  `<strong>${order.client_name}</strong>`),
    row('Email',   `<a href="mailto:${order.client_email}" style="color:#c8960c">${order.client_email}</a>`),
    order.client_phone ? row('Телефон', order.client_phone) : '',
    row('Квест',   templateTitle),
    row('Дата',    date),
    order.event_city ? row('Город', order.event_city) : '',
    row('Сумма',   `<strong style="color:#c8960c">${price}</strong>`),
    features ? row('Опции', features) : '',
  ].filter(Boolean)

  const html = emailWrap(`
    <h2 style="margin:0 0 4px;color:#c8960c;font-size:20px">🎯 Новый заказ #${order.id}</h2>
    <p style="margin:0 0 20px;color:#888;font-size:14px">${templateTitle}</p>
    <table style="border-collapse:collapse;width:100%">${rows.join('')}</table>
    ${order.description ? `
    <div style="margin-top:20px;padding:14px 16px;background:#fdf8ee;
                border-left:3px solid #c8960c;border-radius:0 6px 6px 0">
      <div style="font-size:11px;color:#aaa;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em">Пожелания клиента</div>
      <div style="color:#333;line-height:1.6">${order.description.replace(/\n/g, '<br>')}</div>
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
    <h2 style="margin:0 0 20px;color:#c8960c;font-size:20px">🔄 Заказ #${order.id} — статус изменён</h2>
    <table style="border-collapse:collapse;width:100%">
      ${row('Клиент', order.client_name)}
      ${row('Email',  order.client_email)}
      ${row('Статус', `<strong>${label}</strong>`)}
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
    `<b>Сообщение с сайта</b>`, ``,
    `Имя: <b>${name}</b>`,
    `Тел: ${phone}`, ``,
    `<i>${message}</i>`,
  ]

  const html = emailWrap(`
    <h2 style="margin:0 0 20px;color:#c8960c;font-size:20px">✉️ Сообщение с сайта</h2>
    <table style="border-collapse:collapse;width:100%">
      ${row('Имя',      `<strong>${name}</strong>`)}
      ${row('Телефон',  phone)}
    </table>
    <div style="margin-top:20px;padding:14px 16px;background:#fdf8ee;
                border-left:3px solid #c8960c;border-radius:0 6px 6px 0">
      <div style="color:#333;line-height:1.6">${message.replace(/\n/g, '<br>')}</div>
    </div>`)

  await Promise.allSettled([
    sendTelegramMessage(tg.join('\n')),
    sendEmail(`Сообщение с сайта от ${name}`, html),
  ])
}
