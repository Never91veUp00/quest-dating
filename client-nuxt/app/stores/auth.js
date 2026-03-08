// stores/auth.js
// Замена старого auth.js — useCookie вместо localStorage (SSR-safe)

import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    loading: false,
    error:   null,
  }),

  getters: {
    token:           () => useCookie('auth_token').value,
    isAuthenticated: () => !!useCookie('auth_token').value,
    isAdmin:         () => !!useCookie('auth_token').value,
  },

  actions: {
    async login(username, password) {
      this.loading = true
      this.error   = null
      const tokenCookie = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7 })
      try {
        const config  = useRuntimeConfig()
        const baseURL = import.meta.server ? config.apiBaseInternal : config.public.apiBase
        const res = await $fetch(`${baseURL}/auth/login`, {
          method: 'POST',
          body:   { username, password },
        })
        const token = res?.data?.token ?? res?.token
        tokenCookie.value = token
      } catch (err) {
        this.error = err?.data?.message || err?.message || 'Неверный логин или пароль'
        throw err
      } finally {
        this.loading = false
      }
    },

    logout() {
      useCookie('auth_token').value = null
    },
  },
})