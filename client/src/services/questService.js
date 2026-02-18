import api from './api'

export const questService = {
  /**
   * Получить квест по slug
   * @param {string} slug - Slug квеста
   * @param {object} params - Параметры (например, access_code)
   * @returns {Promise} - Данные квеста
   */
  async getBySlug(slug, params = {}) {
    return await api.get(`/quests/${slug}`, { params })
  },

  /**
   * Создать сессию квеста
   * @param {number} questId - ID квеста
   * @param {object} sessionData - Данные сессии
   * @returns {Promise} - Созданная сессия
   */
  async createSession(questId, sessionData = {}) {
    return await api.post(`/quests/${questId}/session`, sessionData)
  },

  /**
   * Обновить прогресс сессии
   * @param {string} sessionId - ID сессии
   * @param {object} progressData - Данные прогресса
   * @returns {Promise} - Обновленная сессия
   */
  async updateProgress(sessionId, progressData) {
    return await api.patch(`/quests/session/${sessionId}`, progressData)
  },

  /**
   * Завершить квест
   * @param {string} sessionId - ID сессии
   * @param {object} completionData - Данные завершения
   * @returns {Promise} - Результат завершения
   */
  async completeQuest(sessionId, completionData = {}) {
    return await api.post(`/quests/session/${sessionId}/complete`, completionData)
  },

  /**
   * Получить статистику сессии
   * @param {string} sessionId - ID сессии
   * @returns {Promise} - Статистика сессии
   */
  async getSessionStats(sessionId) {
    return await api.get(`/quests/session/${sessionId}/stats`)
  },

  /**
   * Проверить ответ на задание
   * @param {string} sessionId - ID сессии
   * @param {number} taskId - ID задания
   * @param {string} answer - Ответ пользователя
   * @returns {Promise} - Результат проверки
   */
  async checkAnswer(sessionId, taskId, answer) {
    return await api.post(`/quests/session/${sessionId}/check`, {
      task_id: taskId,
      answer
    })
  },

  /**
   * Использовать подсказку
   * @param {string} sessionId - ID сессии
   * @param {number} taskId - ID задания
   * @returns {Promise} - Подсказка
   */
  async useHint(sessionId, taskId) {
    return await api.post(`/quests/session/${sessionId}/hint`, {
      task_id: taskId
    })
  },

  /**
   * Загрузить фото для задания
   * @param {string} sessionId - ID сессии
   * @param {number} taskId - ID задания
   * @param {File} photo - Файл фотографии
   * @returns {Promise} - Результат загрузки
   */
  async uploadPhoto(sessionId, taskId, photo) {
    const formData = new FormData()
    formData.append('photo', photo)
    formData.append('task_id', taskId)

    return await api.post(`/quests/session/${sessionId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}