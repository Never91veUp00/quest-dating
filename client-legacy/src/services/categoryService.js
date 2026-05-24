import api from './api'

export const categoryService = {
  /**
   * Получить все категории
   * @returns {Promise} - Список категорий
   */
  async getAll() {
    return await api.get('/categories')
  },

  /**
   * Получить категорию по slug
   * @param {string} slug - Slug категории
   * @returns {Promise} - Данные категории
   */
  async getBySlug(slug) {
    return await api.get(`/categories/${slug}`)
  }
}