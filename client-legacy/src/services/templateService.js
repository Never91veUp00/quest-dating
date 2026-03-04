import api from './api'

export const templateService = {
  /**
   * Получить все шаблоны с фильтрами
   * @param {object} params - Параметры запроса
   * @returns {Promise} - Список шаблонов
   */
  async getAll(params = {}) {
    return await api.get('/templates', { params })
  },

  /**
   * Получить популярные шаблоны
   * @param {number} limit - Количество шаблонов
   * @returns {Promise} - Список популярных шаблонов
   */
  async getPopular(limit = 6) {
    return await api.get('/templates/popular', { params: { limit } })
  },

  /**
   * Получить избранные шаблоны
   * @param {number} limit - Количество шаблонов
   * @returns {Promise} - Список избранных шаблонов
   */
  async getFeatured(limit = 6) {
    return await api.get('/templates/featured', { params: { limit } })
  },

  /**
   * Получить новые шаблоны
   * @param {number} limit - Количество шаблонов
   * @returns {Promise} - Список новых шаблонов
   */
  async getNewest(limit = 6) {
    return await api.get('/templates/newest', { params: { limit } })
  },

  /**
   * Получить шаблон по slug
   * @param {string} slug - Slug шаблона
   * @returns {Promise} - Данные шаблона
   */
  async getBySlug(slug) {
    return await api.get(`/templates/${slug}`)
  },

  /**
   * Получить похожие шаблоны
   * @param {string} slug - Slug шаблона
   * @param {number} limit - Количество похожих шаблонов
   * @returns {Promise} - Список похожих шаблонов
   */
  async getSimilar(slug, limit = 4) {
    return await api.get(`/templates/${slug}/similar`, { params: { limit } })
  },

  /**
   * Поиск шаблонов
   * @param {string} query - Поисковый запрос
   * @param {object} params - Дополнительные параметры
   * @returns {Promise} - Результаты поиска
   */
  async search(query, params = {}) {
    return await api.get('/templates', {
      params: { search: query, ...params }
    })
  }
}