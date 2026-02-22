// Уведомления через Telegram Bot API
//
// Настройка:
// 1. Создай бота: напиши @BotFather → /newbot → получи TELEGRAM_BOT_TOKEN
// 2. Узнай свой chat_id: напиши @userinfobot → скопируй Id → TELEGRAM_CHAT_ID

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
          parse_mode: 'HTML'
        })
      }
    )

    if (!response.ok) {
      const err = await response.json()
      console.error('Telegram API error:', err.description)
    }
  } catch (error) {
    // Не роняем сервер из-за ошибки уведомления
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

  const features = Array.isArray(order.selected_features) && order.selected_features.length
    ? order.selected_features.join(', ')
    : '—'

  const text = [
    `🎯 <b>Новый заказ #${order.id}</b>`,
    ``,
    `👤 <b>Клиент:</b> ${order.client_name}`,
    `📧 <b>Email:</b> ${order.client_email}`,
    `📱 <b>Телефон:</b> ${order.client_phone || 'не указан'}`,
    ``,
    `📦 <b>Квест:</b> ${templateTitle}`,
    `📅 <b>Дата события:</b> ${dateFormatted}`,
    `🌆 <b>Город:</b> ${order.event_city || 'не указан'}`,
    `⚙️ <b>Доп. опции:</b> ${features}`,
    `💰 <b>Сумма:</b> ${priceFormatted} ₽`,
    ``,
    `💬 <b>Пожелания:</b>`,
    order.description || '—'
  ].join('\n')

  await sendTelegramMessage(text)
}

export const notifyOrderStatusChange = async (order, newStatus) => {
  const statusLabels = {
    confirmed:   '✅ Подтверждён',
    in_progress: '🔧 В работе',
    completed:   '🎉 Выполнен',
    cancelled:   '❌ Отменён'
  }

  const text = [
    `📋 <b>Статус заказа #${order.id} изменён</b>`,
    ``,
    `👤 ${order.client_name} (${order.client_email})`,
    `🔄 Новый статус: <b>${statusLabels[newStatus] || newStatus}</b>`
  ].join('\n')

  await sendTelegramMessage(text)
}