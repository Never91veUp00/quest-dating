// Уведомления через Telegram Bot API

const sendTelegramMessage = async (text) => {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    console.log('📵 Telegram не настроен, уведомление пропущено')
    return
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      }
    )

    if (!response.ok) {
      const err = await response.json()
      console.error('Telegram API error:', err.description)
    }
  } catch (error) {
    console.error('Ошибка отправки в Telegram:', error.message)
  }
}

export const notifyNewOrder = async (order, templateTitle) => {
  const priceFormatted = (order.total_price / 100).toLocaleString('ru-RU')
  const dateFormatted = order.event_date
    ? new Date(order.event_date).toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : 'не указана'

  const featureLabels = {
    background_music: '🎵 Музыка',
    video_messages: '📹 Видео',
    custom_photos: '📸 Фото',
    qr_codes: '📱 QR-коды',
    partner_surprises: '🎁 Сюрпризы'
  }

  const features = Array.isArray(order.selected_features) && order.selected_features.length
    ? order.selected_features.map(f => featureLabels[f] || f).join(' · ')
    : '—'

  const lines = [
    `🎯 <b>Новый заказ #${order.id}</b>`,
    ``,
    `👤 <b>${order.client_name}</b>`,
    `📧 ${order.client_email}`,
    order.client_phone ? `📱 ${order.client_phone}` : null,
    ``,
    `📦 ${templateTitle}`,
    `📅 ${dateFormatted}`,
    order.event_city ? `🏙 ${order.event_city}` : null,
    `💰 <b>${priceFormatted} ₽</b>`,
    features !== '—' ? `⚙️ ${features}` : null,
    order.description ? `` : null,
    order.description ? `💬 <i>${order.description}</i>` : null,
    ``,
    `⏱ ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} МСК`
  ]

  await sendTelegramMessage(lines.filter(l => l !== null).join('\n'))
}

export const notifyOrderStatusChange = async (order, newStatus) => {
  const statusLabels = {
    confirmed:   '✅ Подтверждён',
    in_progress: '🔨 В работе',
    completed:   '🎉 Выполнен',
    cancelled:   '❌ Отменён'
  }

  const lines = [
    `🔄 <b>Статус заказа #${order.id}</b>`,
    ``,
    `👤 ${order.client_name} · ${order.client_email}`,
    `▸ ${statusLabels[newStatus] || newStatus}`,
    order.admin_notes ? `📝 <i>${order.admin_notes}</i>` : null,
  ]

  await sendTelegramMessage(lines.filter(Boolean).join('\n'))
}

export const notifyContactMessage = async ({ name, phone, message }) => {
  const lines = [
    `✉️ <b>Сообщение с сайта</b>`,
    ``,
    `👤 <b>${name}</b>`,
    `📱 ${phone}`,
    ``,
    `💬 <i>${message}</i>`,
    ``,
    `⏱ ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} МСК`
  ]

  await sendTelegramMessage(lines.join('\n'))
}