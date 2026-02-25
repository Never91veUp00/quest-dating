import axios from 'axios'

// Создаем экземпляр axios с базовыми настройками
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Интерцептор для запросов (добавление токена авторизации)
apiClient.interceptors.request.use(
  (config) => {
    // Добавляем токен авторизации, если он есть
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Логирование в режиме разработки
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.data || config.params)
    }

    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// Интерцептор для ответов (обработка ошибок)
apiClient.interceptors.response.use(
  (response) => {
    // Логирование в режиме разработки
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, response.data)
    }

    return response.data
  },
  (error) => {
    // Обработка различных типов ошибок
    if (error.response) {
      // Сервер ответил с кодом ошибки
      const { status, data } = error.response

      console.error('[API Error Response]', {
        status,
        message: data.message || 'Unknown error',
        errors: data.errors
      })

      // Специфичная обработка некоторых статусов
      switch (status) {
        case 401:
          localStorage.removeItem('auth_token')
          break
        case 403:
          console.error('Access forbidden')
          break
        case 404:
          // Не показываем toast — 404 обрабатывается на уровне компонентов
          break
        case 429:
          // Rate limit — это важно показать пользователю
          return Promise.reject({
            status,
            message: data.message || 'Слишком много запросов. Подождите немного.',
            errors: data.errors || {}
          })
        case 500:
          console.error('Internal server error')
          break
        default:
          console.error('API error:', data.message)
      }

      return Promise.reject({
        status,
        message: data.message || 'Произошла ошибка',
        errors: data.errors || {},
        existing_id: data.existing_id || null
      })
    } else if (error.request) {
      console.error('[API No Response]', error.request)
      return Promise.reject({
        message: 'Сервер не отвечает. Проверьте подключение к интернету.'
      })
    } else {
      console.error('[API Request Setup Error]', error.message)
      return Promise.reject({
        message: error.message || 'Ошибка при выполнении запроса'
      })
    }
  }
)

// ============================================
// API МЕТОДЫ
// ============================================

const api = {
  // ========== ШАБЛОНЫ ==========
  
  /**
   * Получить список шаблонов с фильтрами
   */
  getTemplates(params = {}) {
    return apiClient.get('/templates', { params })
  },

  /**
   * Получить один шаблон по slug
   */
  getTemplate(slug) {
    return apiClient.get(`/templates/${slug}`)
  },

  /**
   * Получить похожие шаблоны
   */
  getSimilarTemplates(slug, params = {}) {
    return apiClient.get(`/templates/${slug}/similar`, { params })
  },

  /**
   * Получить популярные шаблоны
   */
  getPopularTemplates(params = {}) {
    return apiClient.get('/templates/popular', { params })
  },

  /**
   * Получить рекомендуемые шаблоны
   */
  getFeaturedTemplates(params = {}) {
    return apiClient.get('/templates/featured', { params })
  },

  // ========== КАТЕГОРИИ ==========
  
  /**
   * Получить все категории
   */
  getCategories() {
    return apiClient.get('/categories')
  },

  /**
   * Получить категорию по slug
   */
  getCategory(slug) {
    return apiClient.get(`/categories/${slug}`)
  },

  // ========== ТЕГИ ==========
  
  /**
   * Получить все теги
   */
  getTags() {
    return apiClient.get('/tags')
  },

  /**
   * Получить популярные теги
   */
  getPopularTags(params = {}) {
    return apiClient.get('/tags/popular', { params })
  },

  // ========== ОТЗЫВЫ ==========
  
  /**
   * Получить отзывы шаблона
   */
  getTemplateReviews(templateId, params = {}) {
    return apiClient.get(`/templates/${templateId}/reviews`, { params })
  },

  /**
   * Создать отзыв
   */
  createReview(templateId, data) {
    return apiClient.post(`/templates/${templateId}/reviews`, data)
  },

  // ========== ЗАКАЗЫ ==========
  
  /**
   * Создать заказ
   */
  createOrder(data) {
    return apiClient.post('/orders', data)
  },

  /**
   * Получить заказ по ID
   */
  getOrder(orderId) {
    return apiClient.get(`/orders/${orderId}`)
  },

  // ========== ПОИСК ==========
  
  /**
   * Поиск шаблонов
   */
  searchTemplates(query, params = {}) {
    return apiClient.get('/search', { params: { q: query, ...params } })
  },

  // ========== ИЗБРАННОЕ (если будет) ==========
  
  /**
   * Получить избранные шаблоны
   */
  getFavorites() {
    return apiClient.get('/favorites')
  },

  /**
   * Добавить в избранное
   */
  addToFavorites(templateId) {
    return apiClient.post(`/favorites/${templateId}`)
  },

  /**
   * Удалить из избранного
   */
  removeFromFavorites(templateId) {
    return apiClient.delete(`/favorites/${templateId}`)
  }
}

export { apiClient }
export default api