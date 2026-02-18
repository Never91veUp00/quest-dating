// Сервис для отправки email уведомлений
// TODO: Интеграция с почтовым сервисом (SendGrid, Mailgun, и т.д.)

export const sendOrderConfirmation = async (orderData) => {
  console.log('📧 Отправка подтверждения заказа:', orderData.client_email)
  
  // TODO: Реализовать отправку email
  const emailContent = `
    Здравствуйте, ${orderData.client_name}!
    
    Ваш заказ #${orderData.id} успешно получен.
    Шаблон: ${orderData.template_title}
    
    Мы свяжемся с вами в течение 2 часов.
    
    С уважением,
    Команда Quest Marketplace
  `
  
  return {
    success: true,
    message: 'Email отправлен'
  }
}

export const sendOrderStatusUpdate = async (order, newStatus) => {
  console.log('📧 Отправка обновления статуса:', order.client_email, newStatus)
  
  // TODO: Реализовать отправку email
  return {
    success: true,
    message: 'Email отправлен'
  }
}

export const sendQuestReady = async (order, questUrl) => {
  console.log('📧 Квест готов:', order.client_email, questUrl)
  
  // TODO: Реализовать отправку email с ссылкой на квест
  return {
    success: true,
    message: 'Email отправлен'
  }
}