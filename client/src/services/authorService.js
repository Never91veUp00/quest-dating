import api from './api'

export const authorService = {
  /**
   * Получить всех авторов
   * @param {object} params - Параметры запроса
   * @returns {Promise} - Список авторов
   */
  async getAll(params = {}) {
    return await api.get('/authors', { params })
  },

  /**
   * Получить топ авторов
   * @param {number} limit - Количество авторов
   * @returns {Promise} - Список топ авторов
   */
  async getTop(limit = 10) {
    return await api.get('/authors/top', { params: { limit } })
  },

  /**
   * Получить автора по username
   * @param {string} username - Username автора
   * @returns {Promise} - Данные автора
   */
  async getByUsername(username) {
    return await api.get(`/authors/${username}`)
  },

  /**
   * Создать автора (регистрация)
   * @param {object} authorData - Данные автора
   * @returns {Promise} - Созданный автор
   */
  async create(authorData) {
    return await api.post('/authors', authorData)
  },

  /**
   * Обновить профиль автора
   * @param {string} username - Username автора
   * @param {object} updates - Обновляемые данные
   * @returns {Promise} - Обновленный автор
   */
  async update(username, updates) {
    return await api.patch(`/authors/${username}`, updates)
  },

  /**
   * Получить статистику автора
   * @param {string} username - Username автора
   * @returns {Promise} - Статистика автора
   */
  async getStats(username) {
    return await api.get(`/authors/${username}/stats`)
  }
}