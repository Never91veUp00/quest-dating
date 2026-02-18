import { defineStore } from 'pinia'

// Заготовка для будущей авторизации
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    isAuthor: (state) => {
      return state.user?.role === 'author' || state.user?.role === 'admin'
    },

    isAdmin: (state) => {
      return state.user?.role === 'admin'
    },

    userName: (state) => {
      return state.user?.name || state.user?.email || 'Гость'
    }
  },

  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null

      try {
        // TODO: Реализовать API вызов
        // const response = await authService.login(credentials)
        // this.user = response.data.user
        // this.token = response.data.token
        // this.isAuthenticated = true
        
        // Сохранить токен
        // localStorage.setItem('auth_token', this.token)
        
        console.log('Login:', credentials)
      } catch (error) {
        this.error = error.message || 'Ошибка авторизации'
        console.error('Error logging in:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null

      try {
        // TODO: Реализовать API вызов
        // const response = await authService.register(userData)
        // this.user = response.data.user
        // this.token = response.data.token
        // this.isAuthenticated = true
        
        console.log('Register:', userData)
      } catch (error) {
        this.error = error.message || 'Ошибка регистрации'
        console.error('Error registering:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      // Удалить токен из localStorage
      localStorage.removeItem('auth_token')
    },

    async checkAuth() {
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        return false
      }

      try {
        // TODO: Реализовать проверку токена
        // const response = await authService.verify(token)
        // this.user = response.data.user
        // this.token = token
        // this.isAuthenticated = true
        
        return true
      } catch (error) {
        this.logout()
        return false
      }
    },

    clearError() {
      this.error = null
    }
  },

  persist: {
    enabled: true,
    strategies: [
      {
        key: 'auth',
        storage: localStorage,
        paths: ['user', 'token', 'isAuthenticated']
      }
    ]
  }
})