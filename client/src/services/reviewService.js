import api from './api'

export const reviewService = {
  /**
   * Получить отзывы для шаблона
   * @param {number} templateId - ID шаблона
   * @param {object} params - Параметры запроса
   * @returns {Promise} - Список отзывов
   */
  async getByTemplate(templateId, params = {}) {
    return await api.get(`/reviews/template/${templateId}`, { params })
  },

  /**
   * Создать отзыв
   * @param {object} reviewData - Данные отзыва
   * @returns {Promise} - Созданный отзыв
   */
  async create(reviewData) {
    return await api.post('/reviews', reviewData)
  },

  /**
   * Отметить отзыв как полезный
   * @param {number} reviewId - ID отзыва
   * @returns {Promise} - Обновленный отзыв
   */
  async markHelpful(reviewId) {
    return await api.post(`/reviews/${reviewId}/helpful`)
  },

  /**
   * Обновить отзыв
   * @param {number} reviewId - ID отзыва
   * @param {object} updates - Обновляемые данные
   * @returns {Promise} - Обновленный отзыв
   */
  async update(reviewId, updates) {
    return await api.patch(`/reviews/${reviewId}`, updates)
  },

  /**
   * Удалить отзыв
   * @param {number} reviewId - ID отзыва
   * @returns {Promise} - Результат удаления
   */
  async delete(reviewId) {
    return await api.delete(`/reviews/${reviewId}`)
  }
}