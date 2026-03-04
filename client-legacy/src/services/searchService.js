import api from './api'

export const searchService = {
  /**
   * Глобальный поиск
   * @param {string} query - Поисковый запрос
   * @param {object} params - Параметры поиска
   * @returns {Promise} - Результаты поиска
   */
  async search(query, params = {}) {
    return await api.get('/search', {
      params: { q: query, ...params }
    })
  },

  /**
   * Получить подсказки для поиска
   * @param {string} query - Поисковый запрос
   * @param {number} limit - Количество подсказок
   * @returns {Promise} - Список подсказок
   */
  async getSuggestions(query, limit = 5) {
    return await api.get('/search/suggestions', {
      params: { q: query, limit }
    })
  },

  /**
   * Сохранить поисковый запрос в историю
   * @param {string} query - Поисковый запрос
   */
  saveToHistory(query) {
    if (!query || query.trim().length === 0) return

    try {
      const history = this.getHistory()
      const trimmed = query.trim()
      
      // Удаляем дубликаты и добавляем в начало
      const filtered = history.filter(item => item !== trimmed)
      const updated = [trimmed, ...filtered].slice(0, 10) // Храним последние 10
      
      localStorage.setItem('search_history', JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save search history:', error)
    }
  },

  /**
   * Получить историю поиска
   * @returns {Array} - Массив поисковых запросов
   */
  getHistory() {
    try {
      const history = localStorage.getItem('search_history')
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.error('Failed to load search history:', error)
      return []
    }
  },

  /**
   * Очистить историю поиска
   */
  clearHistory() {
    try {
      localStorage.removeItem('search_history')
    } catch (error) {
      console.error('Failed to clear search history:', error)
    }
  }
}