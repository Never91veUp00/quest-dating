import { apiClient } from './api'

export const questService = {
  async getBySlug(slug, params = {}) {
    return await apiClient.get(`/quests/${slug}`, { params })
  },

  async createSession(questId, sessionData = {}) {
    return await apiClient.post(`/quests/${questId}/session`, sessionData)
  },

  async updateProgress(sessionId, progressData) {
    return await apiClient.patch(`/quests/session/${sessionId}`, progressData)
  },

  async completeQuest(sessionId, completionData = {}) {
    return await apiClient.post(`/quests/session/${sessionId}/complete`, completionData)
  },

  async getSessionStats(sessionId) {
    return await apiClient.get(`/quests/session/${sessionId}/stats`)
  }
}