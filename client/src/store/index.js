import { defineStore } from 'pinia'
import api from '@/services/api'

export const useQuestStore = defineStore('quest', {
  state: () => ({
    templates: [],
    currentQuest: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchTemplates() {
      this.loading = true
      try {
        const response = await api.get('/templates')
        this.templates = response.data
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    async fetchQuest(slug) {
      this.loading = true
      try {
        const response = await api.get(`/dates/${slug}`)
        this.currentQuest = response.data
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async createOrder(orderData) {
      this.loading = true
      try {
        const response = await api.post('/orders', orderData)
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})