import api from './api'

export const tagService = {
  /**
   * Получить все теги
   * @returns {Promise} - Список тегов
   */
  async getAll() {
    return await api.get('/tags')
  },

  /**
   * Получить популярные теги
   * @param {number} limit - Количество тегов
   * @returns {Promise} - Список популярных тегов
   */
  async getPopular(limit = 20) {
    return await api.get('/tags/popular', { params: { limit } })
  }
}