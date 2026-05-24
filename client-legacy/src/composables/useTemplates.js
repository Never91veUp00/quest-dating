import { ref, computed } from 'vue'
import { templateService } from '@/services/templateService'

export function useTemplates() {
  const templates = ref([])
  const currentTemplate = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  // Получить все шаблоны с фильтрами
  const fetchTemplates = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await templateService.getAll({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...filters
      })

      templates.value = response.data
      pagination.value = response.pagination

      return response
    } catch (err) {
      error.value = err.message || 'Ошибка загрузки шаблонов'
      console.error('Error fetching templates:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Получить популярные шаблоны
  const fetchPopularTemplates = async (limit = 6) => {
    loading.value = true
    error.value = null

    try {
      const response = await templateService.getPopular(limit)
      return response.data
    } catch (err) {
      error.value = err.message || 'Ошибка загрузки популярных шаблонов'
      console.error('Error fetching popular templates:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Получить избранные шаблоны
  const fetchFeaturedTemplates = async (limit = 6) => {
    loading.value = true
    error.value = null

    try {
      const response = await templateService.getFeatured(limit)
      return response.data
    } catch (err) {
      error.value = err.message || 'Ошибка загрузки избранных шаблонов'
      console.error('Error fetching featured templates:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Получить новые шаблоны
  const fetchNewestTemplates = async (limit = 6) => {
    loading.value = true
    error.value = null

    try {
      const response = await templateService.getNewest(limit)
      return response.data
    } catch (err) {
      error.value = err.message || 'Ошибка загрузки новых шаблонов'
      console.error('Error fetching newest templates:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Получить шаблон по slug
  const fetchTemplateBySlug = async (slug) => {
    loading.value = true
    error.value = null

    try {
      const response = await templateService.getBySlug(slug)
      currentTemplate.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message || 'Шаблон не найден'
      console.error('Error fetching template:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Получить похожие шаблоны
  const fetchSimilarTemplates = async (slug, limit = 4) => {
    loading.value = true
    error.value = null

    try {
      const response = await templateService.getSimilar(slug, limit)
      return response.data
    } catch (err) {
      error.value = err.message || 'Ошибка загрузки похожих шаблонов'
      console.error('Error fetching similar templates:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Поиск шаблонов
  const searchTemplates = async (query, filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetchTemplates({
        search: query,
        ...filters
      })
      return response
    } catch (err) {
      error.value = err.message || 'Ошибка поиска'
      console.error('Error searching templates:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Изменить страницу
  const setPage = (page) => {
    pagination.value.page = page
  }

  // Изменить количество на странице
  const setLimit = (limit) => {
    pagination.value.limit = limit
    pagination.value.page = 1 // Сброс на первую страницу
  }

  // Сбросить состояние
  const reset = () => {
    templates.value = []
    currentTemplate.value = null
    loading.value = false
    error.value = null
    pagination.value = {
      page: 1,
      limit: 12,
      total: 0,
      pages: 0
    }
  }

  // Computed свойства
  const hasTemplates = computed(() => templates.value.length > 0)
  const hasMorePages = computed(() => pagination.value.page < pagination.value.pages)
  const hasPreviousPage = computed(() => pagination.value.page > 1)

  return {
    // State
    templates,
    currentTemplate,
    loading,
    error,
    pagination,

    // Computed
    hasTemplates,
    hasMorePages,
    hasPreviousPage,

    // Methods
    fetchTemplates,
    fetchPopularTemplates,
    fetchFeaturedTemplates,
    fetchNewestTemplates,
    fetchTemplateBySlug,
    fetchSimilarTemplates,
    searchTemplates,
    setPage,
    setLimit,
    reset
  }
}