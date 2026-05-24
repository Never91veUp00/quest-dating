import { defineStore } from 'pinia'
import api from '@/services/api'

export const useQuestStore = defineStore('quest', {
  state: () => ({
    // Templates
    templates: [],
    featuredTemplates: [],
    popularTemplates: [],
    newestTemplates: [],
    currentTemplate: null,
    templatesPagination: {
      page: 1,
      limit: 12,
      total: 0,
      pages: 0
    },

    // Categories
    categories: [],
    currentCategory: null,

    // Tags
    tags: [],
    popularTags: [],

    // Filters
    filters: {
      category: null,
      tags: [],
      difficulty: null,
      priceRange: [0, 10000],
      minPrice: null,
      maxPrice: null,
      duration: null,
      locationType: null,
      search: '',
      sort_by: 'newest',
      order: 'desc'
    },

    // UI State — раздельные загрузки чтобы не перетирать друг друга
    loadingTemplates: false,
    loadingPopular: false,
    loadingFeatured: false,
    loadingNewest: false,
    loadingCurrentTemplate: false,
    loadingCategories: false,
    loadingTags: false,
    loadingOrder: false,
    error: null
  }),

  getters: {
    // Templates
    hasTemplates: (state) => state.templates.length > 0,
    
    templatesByCategory: (state) => (categoryId) => {
      return state.templates.filter(t => t.category_id === categoryId)
    },

    templateBySlug: (state) => (slug) => {
      return state.templates.find(t => t.slug === slug)
    },

    // Filters
    filteredTemplates: (state) => {
      let filtered = [...state.templates]

      // Category filter — supports both numeric ID and string slug
      if (state.filters.category) {
        const catFilter = state.filters.category
        if (typeof catFilter === 'number') {
          filtered = filtered.filter(t => t.category_id === catFilter)
        } else {
          // slug — ищем по категории
          const cat = state.categories.find(
            c => c.slug === catFilter || c.name?.toLowerCase() === catFilter.toLowerCase()
          )
          if (cat) {
            filtered = filtered.filter(t => t.category_id === cat.id)
          }
        }
      }

      // Tags filter
      if (state.filters.tags.length > 0) {
        filtered = filtered.filter(t => {
          const templateTags = t.tags?.map(tag => tag.id) || []
          return state.filters.tags.some(tagId => templateTags.includes(tagId))
        })
      }

      // Difficulty filter
      if (state.filters.difficulty) {
        filtered = filtered.filter(t => t.difficulty === state.filters.difficulty)
      }

      // Price filter
      if (state.filters.minPrice !== null) {
        filtered = filtered.filter(t => t.base_price >= state.filters.minPrice * 100)
      }
      if (state.filters.maxPrice !== null) {
        filtered = filtered.filter(t => t.base_price <= state.filters.maxPrice * 100)
      }

      // Duration filter
      if (state.filters.duration) {
        const [min, max] = state.filters.duration.split('-').map(Number)
        if (max) {
          filtered = filtered.filter(t => 
            t.duration_minutes >= min && t.duration_minutes <= max
          )
        } else {
          filtered = filtered.filter(t => t.duration_minutes >= min)
        }
      }

      // Location type filter
      if (state.filters.locationType) {
        filtered = filtered.filter(t => t.location_type === state.filters.locationType)
      }

      // Search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(t => 
          t.title.toLowerCase().includes(searchLower) ||
          t.description?.toLowerCase().includes(searchLower) ||
          t.tagline?.toLowerCase().includes(searchLower)
        )
      }

      // Sorting
      filtered.sort((a, b) => {
        let aValue, bValue

        switch (state.filters.sort_by) {
          case 'rating':
            aValue = parseFloat(a.rating) || 0
            bValue = parseFloat(b.rating) || 0
            break
          case 'orders':
            aValue = a.orders_count || 0
            bValue = b.orders_count || 0
            break
          case 'price':
            aValue = a.base_price || 0
            bValue = b.base_price || 0
            break
          case 'newest':
          default:
            aValue = new Date(a.published_at || a.created_at)
            bValue = new Date(b.published_at || b.created_at)
            break
        }

        return state.filters.order === 'asc' 
          ? aValue - bValue 
          : bValue - aValue
      })

      return filtered
    },

    activeFiltersCount: (state) => {
      let count = 0
      if (state.filters.category) count++
      if (state.filters.tags.length > 0) count++
      if (state.filters.difficulty) count++
      if (state.filters.minPrice || state.filters.maxPrice) count++
      if (state.filters.duration) count++
      if (state.filters.locationType) count++
      if (state.filters.search) count++
      return count
    },

    hasActiveFilters: (state) => {
      return state.filters.category !== null ||
        state.filters.tags.length > 0 ||
        state.filters.difficulty !== null ||
        state.filters.minPrice !== null ||
        state.filters.maxPrice !== null ||
        state.filters.duration !== null ||
        state.filters.locationType !== null ||
        state.filters.search !== ''
    },

    // Categories
    categoryBySlug: (state) => (slug) => {
      return state.categories.find(c => c.slug === slug)
    }
  },

  actions: {
    // ========== TEMPLATES ACTIONS ==========
    
    async fetchTemplates(params = {}) {
      this.loadingTemplates = true
      this.error = null

      try {
        const response = await api.getTemplates({
          page: this.templatesPagination.page,
          limit: this.templatesPagination.limit,
          ...params
        })

        if (response.success) {
          this.templates = response.data || []
          this.templatesPagination = response.pagination || this.templatesPagination
        }

        return response
      } catch (error) {
        this.error = error.message || 'Ошибка загрузки шаблонов'
        console.error('Error fetching templates:', error)
        throw error
      } finally {
        this.loadingTemplates = false
      }
    },

    async fetchPopularTemplates(limit = 6) {
      this.loadingPopular = true
      this.error = null

      try {
        const response = await api.getPopularTemplates({ limit })
        
        if (response.success) {
          this.popularTemplates = response.data || []
          return response.data
        }
      } catch (error) {
        this.error = error.message || 'Ошибка загрузки популярных шаблонов'
        console.error('Error fetching popular templates:', error)
        throw error
      } finally {
        this.loadingTemplates = false
      }
    },

    async fetchFeaturedTemplates(limit = 6) {
      this.loadingFeatured = true
      this.error = null

      try {
        const response = await api.getFeaturedTemplates({ limit })
        
        if (response.success) {
          this.featuredTemplates = response.data || []
          return response.data
        }
      } catch (error) {
        this.error = error.message || 'Ошибка загрузки избранных шаблонов'
        console.error('Error fetching featured templates:', error)
        throw error
      } finally {
        this.loadingTemplates = false
      }
    },

    async fetchNewestTemplates(limit = 6) {
      this.loadingNewest = true
      this.error = null

      try {
        const response = await api.getTemplates({ 
          limit, 
          sort_by: 'newest',
          order: 'desc'
        })
        
        if (response.success) {
          this.newestTemplates = response.data || []
          return response.data
        }
      } catch (error) {
        this.error = error.message || 'Ошибка загрузки новых шаблонов'
        console.error('Error fetching newest templates:', error)
        throw error
      } finally {
        this.loadingTemplates = false
      }
    },

    async fetchTemplate(slug) {
      this.loadingCurrentTemplate = true
      this.error = null

      try {
        const response = await api.getTemplate(slug)
        
        if (response.success) {
          this.currentTemplate = response.data
          return response.data
        } else {
          throw new Error(response.message || 'Шаблон не найден')
        }
      } catch (error) {
        this.error = error.message || 'Шаблон не найден'
        console.error('Error fetching template:', error)
        throw error
      } finally {
        this.loadingTemplates = false
      }
    },

    async fetchSimilarTemplates(slug, limit = 4) {
      this.loadingTemplates = true
      this.error = null

      try {
        const response = await api.getSimilarTemplates(slug, { limit })
        
        if (response.success) {
          return response.data || []
        }
        return []
      } catch (error) {
        this.error = error.message || 'Ошибка загрузки похожих шаблонов'
        console.error('Error fetching similar templates:', error)
        return []
      } finally {
        this.loadingTemplates = false
      }
    },

    // ========== CATEGORIES ACTIONS ==========
    
    async fetchCategories() {
      this.loadingCategories = true
      this.error = null

      try {
        const response = await api.getCategories()
        
        if (response.success) {
          this.categories = response.data || []
          return response.data
        }
      } catch (error) {
        this.error = error.message || 'Ошибка загрузки категорий'
        console.error('Error fetching categories:', error)
        throw error
      } finally {
        this.loadingCategories = false
      }
    },

    async fetchCategory(slug) {
      this.loadingCategories = true
      this.error = null

      try {
        const response = await api.getCategory(slug)
        
        if (response.success) {
          this.currentCategory = response.data
          return response.data
        } else {
          throw new Error(response.message || 'Категория не найдена')
        }
      } catch (error) {
        this.error = error.message || 'Категория не найдена'
        console.error('Error fetching category:', error)
        throw error
      } finally {
        this.loadingCategories = false
      }
    },

    // ========== TAGS ACTIONS ==========
    
    async fetchTags() {
      this.loadingTags = true
      this.error = null

      try {
        const response = await api.getTags()
        
        if (response.success) {
          this.tags = response.data || []
          return response.data
        }
      } catch (error) {
        this.error = error.message || 'Ошибка загрузки тегов'
        console.error('Error fetching tags:', error)
        throw error
      } finally {
        this.loadingTags = false
      }
    },

    async fetchPopularTags(limit = 20) {
      this.loadingTags = true
      this.error = null

      try {
        const response = await api.getPopularTags({ limit })
        
        if (response.success) {
          this.popularTags = response.data || []
          return response.data
        }
      } catch (error) {
        this.error = error.message || 'Ошибка загрузки популярных тегов'
        console.error('Error fetching popular tags:', error)
        throw error
      } finally {
        this.loadingTags = false
      }
    },

    // ========== REVIEWS ACTIONS ==========
    
    async addReview(reviewData) {
      this.loadingTemplates = true
      this.error = null

      try {
        const response = await api.createReview(reviewData.templateId, reviewData)
        
        if (response.success) {
          return response.data
        } else {
          throw new Error(response.message || 'Ошибка добавления отзыва')
        }
      } catch (error) {
        this.error = error.message || 'Ошибка добавления отзыва'
        console.error('Error adding review:', error)
        throw error
      } finally {
        this.loadingTemplates = false
      }
    },

    // ========== ORDERS ACTIONS ==========
    
    async createOrder(orderData) {
      this.loadingOrder = true
      this.error = null

      try {
        const response = await api.createOrder(orderData)
        
        if (response.success) {
          return response.data
        } else {
          throw new Error(response.message || 'Ошибка создания заказа')
        }
      } catch (error) {
        this.error = error.message || 'Ошибка создания заказа'
        console.error('Error creating order:', error)
        throw error
      } finally {
        this.loadingOrder = false
      }
    },

    // ========== FILTERS ACTIONS ==========
    
    setFilter(name, value) {
      this.filters[name] = value
    },

    resetFilters() {
      this.filters = {
        category: null,
        tags: [],
        difficulty: null,
        priceRange: [0, 10000],
        minPrice: null,
        maxPrice: null,
        duration: null,
        locationType: null,
        search: '',
        sort_by: 'newest',
        order: 'desc'
      }
    },

    // ========== PAGINATION ACTIONS ==========
    
    setTemplatesPage(page) {
      this.templatesPagination.page = page
    },

    // ========== CLEAR ACTIONS ==========
    
    clearCurrentTemplate() {
      this.currentTemplate = null
    },

    clearCurrentCategory() {
      this.currentCategory = null
    },

    clearError() {
      this.error = null
    }
  }
})