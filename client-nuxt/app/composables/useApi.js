// composables/useApi.js
// Заменяет client/src/services/api.js
// $fetch (встроен в Nuxt) вместо axios — работает и на сервере, и на клиенте
// useCookie вместо localStorage для токена

export function useApi() {
  const token         = useCookie('auth_token')
  const runtimeConfig = useRuntimeConfig()

  // На сервере — внутренняя Docker-сеть, на клиенте — публичный URL
  const baseURL = process.server
    ? runtimeConfig.apiBaseInternal
    : runtimeConfig.public.apiBase

  function buildHeaders() {
    const headers = { 'Content-Type': 'application/json' }
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }
    return headers
  }

  async function request(method, path, options = {}) {
    try {
      return await $fetch(`${baseURL}${path}`, {
        method,
        headers: buildHeaders(),
        body:    options.body,
        params:  options.params,
      })
    } catch (err) {
      const status  = err?.response?.status
      const data    = err?.data || {}
      const message = data.message || err?.message || 'Произошла ошибка'

      // 401 — сбрасываем токен
      if (status === 401) {
        token.value = null
        if (import.meta.client) navigateTo('/admin/login')
      }

      // 403 с requires_code — штатная ситуация, не логируем
      if (!(status === 403 && data.requires_code)) {
        console.error(`[API Error] ${method} ${path}`, { status, message })
      }

      throw {
        status,
        message,
        errors:        data.errors        || {},
        existing_id:   data.existing_id   || null,
        requires_code: data.requires_code || false,
        data,
      }
    }
  }

  const get   = (path, params)  => request('GET',    path, { params })
  const post  = (path, body)    => request('POST',   path, { body })
  const put   = (path, body)    => request('PUT',    path, { body })
  const patch = (path, body)    => request('PATCH',  path, { body })
  const del   = (path)          => request('DELETE', path)

  return { get, post, put, patch, del, request }
}


// ── Методы публичного API (замена api.js) ─────────────────────
// Используется на SSR-страницах через useAsyncData

export function useDatesApi() {
  const { get, post } = useApi()

  return {
    // Каталог (было: getTemplates → теперь getDates)
    getDates:         (params = {})      => get('/templates', params),
    getDate:          (slug)             => get(`/templates/${slug}`),
    getSimilarDates:  (slug, params = {})=> get(`/templates/${slug}/similar`, params),
    getPopularDates:  (params = {})      => get('/templates/popular', params),
    getFeaturedDates: (params = {})      => get('/templates/featured', params),

    // Категории
    getCategories:    ()                 => get('/categories'),
    getCategory:      (slug)             => get(`/categories/${slug}`),

    // Теги
    getTags:          ()                 => get('/tags'),
    getPopularTags:   (params = {})      => get('/tags/popular', params),

    // Отзывы
    getFeaturedReviews: (limit = 6)      => get('/reviews/featured', { limit }),
    getDateReviews:   (id, params = {})  => get(`/reviews/template/${id}`, params),
    createReview:     (id, data)         => post('/reviews', { ...data, template_id: id }),

    // Заказы
    createOrder:      (data)             => post('/orders', data),
    getOrder:         (id)               => get(`/orders/${id}`),

    // Поиск
    searchDates:      (q, params = {})   => get('/search', { q, ...params }),

    // Полезность отзывов
    markReviewHelpful: (reviewId)          => post(`/reviews/${reviewId}/helpful`, {}),

    // Прочее
    getStats:         ()                 => get('/stats'),
    sendContact:      (data)             => post('/contact', data),
  }
}


// ── Методы Admin API ──────────────────────────────────────────
// Используется только на CSR-страницах /admin/**

export function useAdminApi() {
  const { get, post, patch, del } = useApi()

  return {
    // Шаблоны
    getAdminTemplates:  (params = {})    => get('/admin/templates', params),
    getAdminTemplate:   (id)             => get(`/admin/templates/${id}`),
    createTemplate:     (data)           => post('/admin/templates', data),
    updateTemplate:     (id, data)       => patch(`/admin/templates/${id}`, data),
    deleteTemplate:     (id)             => del(`/admin/templates/${id}`),

    // Заказы
    getAdminOrders:     (params = {})    => get('/admin/orders', params),
    getAdminOrder:      (id)             => get(`/admin/orders/${id}`),
    updateOrderStatus:  (id, data)       => patch(`/admin/orders/${id}`, data),

    // Квесты
    getAdminQuests:     (params = {})    => get('/admin/quests', params),
    getAdminQuest:      (id)             => get(`/admin/quests/${id}`),
    createQuest:        (data)           => post('/admin/quests', data),
    updateQuest:        (id, data)       => patch(`/admin/quests/${id}`, data),
    deleteQuest:        (id)             => del(`/admin/quests/${id}`),

    // Статистика
    getDashboardStats:  ()               => get('/admin/stats'),
  }
}