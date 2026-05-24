// Уведомления через Telegram Bot API и Email (Resend)
import { logger } from '../utils/logger.js'

// ─── Telegram ────────────────────────────────────────────────────────────────
const sendTelegramMessage = async (text, chatId = null) => {
  const targetChatId = chatId || process.env.TELEGRAM_CHAT_ID
  if (!process.env.TELEGRAM_BOT_TOKEN || !targetChatId) {
    if (!chatId) logger.warn('Telegram не настроен')
    return
  }
  try {
    const r = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text, parse_mode: 'HTML', disable_web_page_preview: true
        })
      }
    )
    if (!r.ok) { const e = await r.json(); logger.error('Telegram error', { desc: e.description }) }
  } catch (e) { logger.error('Telegram send failed', { msg: e.message }) }
}

// ─── Email (Resend HTTP API) ──────────────────────────────────────────────────
const sendEmail = async (subject, html, to = null) => {
  if (!process.env.RESEND_API_KEY) { logger.warn('Resend API key не настроен'); return }
  const recipient = to || process.env.NOTIFY_EMAIL || 'vp.vlad00@mail.ru'
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Quest Dating <noreply@questdating.ru>',
        to:   [recipient],
        subject,
        html,
      }),
    })
    const data = await r.json()
    if (!r.ok) { logger.error('Resend error', { status: r.status, err: data }); return }
    logger.info('Email sent', { id: data.id, subject, to: recipient })
  } catch (e) { logger.error('Email send failed', { msg: e.message }) }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtPrice = (k) => (k / 100).toLocaleString('ru-RU') + '\u00a0\u20bd'
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
  pending:     'Ожидает',
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
  <p style="color:#aaa;font-size:12px;margin:0">Quest Dating &middot; ${fmtNow()} МСК</p>
</div></body></html>`

const row = (label, value) =>
  `<tr>
     <td style="padding:6px 16px 6px 0;color:#888;white-space:nowrap;vertical-align:top">${label}</td>
     <td style="padding:6px 0;color:#1a1a1a">${value}</td>
   </tr>`

// ─── Client: order confirmation ───────────────────────────────────────────────
export const sendClientOrderEmail = async (order, templateTitle) => {
  if (!order.client_email) return
  const price    = fmtPrice(order.total_price)
  const date     = fmtDate(order.event_date)
  const token    = order.view_token
  const botUrl   = `https://t.me/questdating_bot?start=${token}`
  const orderUrl = `https://questdating.ru/my-order/${token}`

  const features = Array.isArray(order.selected_features) && order.selected_features.length
    ? order.selected_features.map(f => FEATURE_LABELS[f] || f).join(', ')
    : null

  const rows = [
    row('Номер заказа', `<strong>#${order.id}</strong>`),
    row('Квест',        templateTitle),
    row('Дата',         date),
    order.event_city ? row('Город', order.event_city) : '',
    row('Сумма',        `<strong style="color:#c8960c">${price}</strong>`),
    features ? row('Опции', features) : '',
    row('Статус',       'Ожидает подтверждения'),
  ].filter(Boolean)

  const html = emailWrap(`
    <div style="text-align:center;margin-bottom:28px">
      <div style="font-size:48px;margin-bottom:12px">🎉</div>
      <h1 style="margin:0 0 8px;color:#1a1a1a;font-size:22px">Заказ принят!</h1>
      <p style="margin:0;color:#888;font-size:15px">
        Лиза уже взялась за работу и пришлёт готовый квест в течение&nbsp;24 часов.
      </p>
    </div>

    <table style="border-collapse:collapse;width:100%;margin-bottom:24px">${rows.join('')}</table>

    <div style="text-align:center;margin-bottom:24px">
      <a href="${orderUrl}"
         style="display:inline-block;background:#c8960c;color:#fff;
                text-decoration:none;padding:13px 32px;border-radius:100px;
                font-weight:700;font-size:15px;letter-spacing:.01em">
        Детали заказа &rarr;
      </a>
    </div>

    <div style="background:#f9f6ee;border-radius:10px;padding:16px;margin-bottom:8px">
      <p style="margin:0 0 10px;font-size:13px;color:#555;line-height:1.5">
        💬 Хотите получать уведомления о&nbsp;статусе заказа прямо в&nbsp;Telegram?
        Просто нажмите кнопку ниже:
      </p>
      <a href="${botUrl}"
         style="display:inline-block;background:#229ED9;color:#fff;
                text-decoration:none;padding:9px 20px;border-radius:8px;
                font-weight:600;font-size:13px">
        Открыть Telegram-бот
      </a>
    </div>`)

  await sendEmail(
    `\u0417\u0430\u043a\u0430\u0437 #${order.id} \u2014 ${templateTitle} \u2014 Quest Dating`,
    html,
    order.client_email
  )
}

// ─── New order (admin) ────────────────────────────────────────────────────────
export const notifyNewOrder = async (order, templateTitle) => {
  const price    = fmtPrice(order.total_price)
  const date     = fmtDate(order.event_date)
  const features = Array.isArray(order.selected_features) && order.selected_features.length
    ? order.selected_features.map(f => FEATURE_LABELS[f] || f).join(', ')
    : null

  const tgLines = [
    `<b>\u041d\u043e\u0432\u044b\u0439 \u0437\u0430\u043a\u0430\u0437 #${order.id}</b>`, ``,
    `\u041a\u043b\u0438\u0435\u043d\u0442: <b>${order.client_name}</b>`,
    `Email: ${order.client_email}`,
    order.client_phone ? `\u0422\u0435\u043b: ${order.client_phone}` : null, ``,
    `\u041a\u0432\u0435\u0441\u0442: ${templateTitle}`,
    `\u0414\u0430\u0442\u0430: ${date}`,
    order.event_city ? `\u0413\u043e\u0440\u043e\u0434: ${order.event_city}` : null,
    `\u0421\u0443\u043c\u043c\u0430: <b>${price}</b>`,
    features ? `\u041e\u043f\u0446\u0438\u0438: ${features}` : null,
    order.description ? `` : null,
    order.description ? `<i>${order.description.slice(0, 400)}</i>` : null,
    ``, `${fmtNow()} \u041c\u0421\u041a`,
  ]

  const rows = [
    row('\u041a\u043b\u0438\u0435\u043d\u0442',  `<strong>${order.client_name}</strong>`),
    row('Email',   `<a href="mailto:${order.client_email}" style="color:#c8960c">${order.client_email}</a>`),
    order.client_phone ? row('\u0422\u0435\u043b\u0435\u0444\u043e\u043d', order.client_phone) : '',
    row('\u041a\u0432\u0435\u0441\u0442',   templateTitle),
    row('\u0414\u0430\u0442\u0430',    date),
    order.event_city ? row('\u0413\u043e\u0440\u043e\u0434', order.event_city) : '',
    row('\u0421\u0443\u043c\u043c\u0430',   `<strong style="color:#c8960c">${price}</strong>`),
    features ? row('\u041e\u043f\u0446\u0438\u0438', features) : '',
  ].filter(Boolean)

  const html = emailWrap(`
    <h2 style="margin:0 0 4px;color:#c8960c;font-size:20px">\ud83c\udfaf \u041d\u043e\u0432\u044b\u0439 \u0437\u0430\u043a\u0430\u0437 #${order.id}</h2>
    <p style="margin:0 0 20px;color:#888;font-size:14px">${templateTitle}</p>
    <table style="border-collapse:collapse;width:100%">${rows.join('')}</table>
    ${order.description ? `
    <div style="margin-top:20px;padding:14px 16px;background:#fdf8ee;
                border-left:3px solid #c8960c;border-radius:0 6px 6px 0">
      <div style="font-size:11px;color:#aaa;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em">\u041f\u043e\u0436\u0435\u043b\u0430\u043d\u0438\u044f \u043a\u043b\u0438\u0435\u043d\u0442\u0430</div>
      <div style="color:#333;line-height:1.6">${order.description.replace(/\n/g, '<br>')}</div>
    </div>` : ''}
    <div style="text-align:center;margin-top:28px">
      <a href="https://questdating.ru/admin?tab=orders"
         style="display:inline-block;background:#c8960c;color:#fff;text-decoration:none;padding:12px 32px;border-radius:100px;font-weight:700;font-size:14px">
        Открыть в админке →
      </a>
    </div>`)

  await Promise.allSettled([
    sendTelegramMessage(tgLines.filter(l => l !== null).join('\n')),
    sendEmail(`\u0417\u0430\u043a\u0430\u0437 #${order.id} \u2014 ${order.client_name}`, html),
  ])
}

// ─── Status change (admin) ────────────────────────────────────────────────────
export const notifyOrderStatusChange = async (order, newStatus) => {
  const label = STATUS_LABELS[newStatus] || newStatus

  const tg = [
    `<b>\u0421\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u043a\u0430\u0437\u0430 #${order.id}</b>`,
    `${order.client_name} (${order.client_email})`,
    `\u0421\u0442\u0430\u0442\u0443\u0441: ${label}`,
    order.admin_notes ? `\u0417\u0430\u043c\u0435\u0442\u043a\u0430: <i>${order.admin_notes}</i>` : null,
  ]

  const html = emailWrap(`
    <h2 style="margin:0 0 20px;color:#c8960c;font-size:20px">\ud83d\udd04 \u0417\u0430\u043a\u0430\u0437 #${order.id} \u2014 \u0441\u0442\u0430\u0442\u0443\u0441 \u0438\u0437\u043c\u0435\u043d\u0451\u043d</h2>
    <table style="border-collapse:collapse;width:100%">
      ${row('\u041a\u043b\u0438\u0435\u043d\u0442', order.client_name)}
      ${row('Email',  order.client_email)}
      ${row('\u0421\u0442\u0430\u0442\u0443\u0441', `<strong>${label}</strong>`)}
      ${order.admin_notes ? row('\u0417\u0430\u043c\u0435\u0442\u043a\u0430', order.admin_notes) : ''}
    </table>`)

  await Promise.allSettled([
    sendTelegramMessage(tg.filter(Boolean).join('\n')),
    sendEmail(`\u0417\u0430\u043a\u0430\u0437 #${order.id} \u2014 ${label}`, html),
  ])
}

// ─── Contact form ─────────────────────────────────────────────────────────────
export const notifyContactMessage = async ({ name, phone, message }) => {
  const tg = [
    `<b>\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u0441 \u0441\u0430\u0439\u0442\u0430</b>`, ``,
    `\u0418\u043c\u044f: <b>${name}</b>`,
    `\u0422\u0435\u043b: ${phone}`, ``,
    `<i>${message}</i>`,
  ]

  const html = emailWrap(`
    <h2 style="margin:0 0 20px;color:#c8960c;font-size:20px">\u2709\ufe0f \u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u0441 \u0441\u0430\u0439\u0442\u0430</h2>
    <table style="border-collapse:collapse;width:100%">
      ${row('\u0418\u043c\u044f',      `<strong>${name}</strong>`)}
      ${row('\u0422\u0435\u043b\u0435\u0444\u043e\u043d',  phone)}
    </table>
    <div style="margin-top:20px;padding:14px 16px;background:#fdf8ee;
                border-left:3px solid #c8960c;border-radius:0 6px 6px 0">
      <div style="color:#333;line-height:1.6">${message.replace(/\n/g, '<br>')}</div>
    </div>`)

  await Promise.allSettled([
    sendTelegramMessage(tg.join('\n')),
    sendEmail(`\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435 \u0441 \u0441\u0430\u0439\u0442\u0430 \u043e\u0442 ${name}`, html),
  ])
}
