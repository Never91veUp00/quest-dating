import api from './api'

export const orderService = {
  /**
   * Создать заказ
   * @param {object} orderData - Данные заказа
   * @returns {Promise} - Созданный заказ
   */
  async create(orderData) {
    return await api.post('/orders', orderData)
  },

  /**
   * Получить заказ по ID
   * @param {number} orderId - ID заказа
   * @returns {Promise} - Данные заказа
   */
  async getById(orderId) {
    return await api.get(`/orders/${orderId}`)
  },

  /**
   * Получить все заказы (с фильтрами)
   * @param {object} params - Параметры запроса
   * @returns {Promise} - Список заказов
   */
  async getAll(params = {}) {
    return await api.get('/orders', { params })
  },

  /**
   * Обновить статус заказа
   * @param {number} orderId - ID заказа
   * @param {string} status - Новый статус
   * @param {string} adminNotes - Заметки администратора
   * @returns {Promise} - Обновленный заказ
   */
  async updateStatus(orderId, status, adminNotes = null) {
    return await api.patch(`/orders/${orderId}/status`, {
      status,
      admin_notes: adminNotes
    })
  },

  /**
   * Получить статистику по заказам
   * @returns {Promise} - Статистика
   */
  async getStats() {
    return await api.get('/orders/stats')
  }
}