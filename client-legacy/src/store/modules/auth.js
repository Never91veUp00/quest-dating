import { defineStore } from 'pinia'
import { apiClient } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('auth_token') || null,
    isAuthenticated: !!localStorage.getItem('auth_token'),
    loading: false,
    error: null
  }),

  getters: {
    isAdmin: (state) => state.isAuthenticated
  },

  actions: {
    async login(username, password) {
      this.loading = true
      this.error = null
      try {
        const res = await apiClient.post('/auth/login', { username, password })
        const token = res.data?.token || res.token
        this.token = token
        this.isAuthenticated = true
        localStorage.setItem('auth_token', token)
      } catch (err) {
        this.error = err.message || 'Неверный логин или пароль'
        throw err
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('auth_token')
    }
  }
})