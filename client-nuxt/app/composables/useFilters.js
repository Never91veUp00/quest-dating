// composables/useFilters.js
// Перенесён без изменений логики — window/navigator здесь не используется.
// useRoute/useRouter работают в Nuxt так же как в Vue Router.

import { ref, computed, watch } from 'vue'

export function useFilters(initialFilters = {}) {
  const router = useRouter()
  const route  = useRoute()

  const filters = ref({
    category:     null,
    tags:         [],
    difficulty:   null,
    priceRange:   [0, 10000],
    minPrice:     null,
    maxPrice:     null,
    duration:     null,
    locationType: null,
    search:       '',
    sortBy:       'newest',
    order:        'desc',
    ...initialFilters
  })

  const loadFiltersFromUrl = () => {
    const q = route.query

    if (q.category) {
      const val = parseInt(q.category)
      filters.value.category = isNaN(val) ? q.category : val
    }
    if (q.tags) {
      filters.value.tags = Array.isArray(q.tags)
        ? q.tags.map(t => parseInt(t))
        : [parseInt(q.tags)]
    }
    if (q.difficulty)    filters.value.difficulty   = q.difficulty
    if (q.minPrice)    { filters.value.minPrice     = parseInt(q.minPrice); filters.value.priceRange[0] = parseInt(q.minPrice) }
    if (q.maxPrice)    { filters.value.maxPrice     = parseInt(q.maxPrice); filters.value.priceRange[1] = parseInt(q.maxPrice) }
    if (q.duration)      filters.value.duration     = q.duration
    if (q.locationType)  filters.value.locationType = q.locationType
    if (q.search)        filters.value.search       = q.search
    if (q.sort_by)       filters.value.sortBy       = q.sort_by
    if (q.order)         filters.value.order        = q.order
  }

  const saveFiltersToUrl = () => {
    if (!import.meta.client) return
    const query = {}
    if (filters.value.category)                                        query.category     = filters.value.category
    if (filters.value.tags.length > 0)                                 query.tags         = filters.value.tags
    if (filters.value.difficulty)                                      query.difficulty   = filters.value.difficulty
    if (filters.value.minPrice)                                        query.minPrice     = filters.value.minPrice
    if (filters.value.maxPrice)                                        query.maxPrice     = filters.value.maxPrice
    if (filters.value.duration)                                        query.duration     = filters.value.duration
    if (filters.value.locationType)                                    query.locationType = filters.value.locationType
    if (filters.value.search)                                          query.search       = filters.value.search
    if (filters.value.sortBy && filters.value.sortBy !== 'newest')     query.sort_by      = filters.value.sortBy
    if (filters.value.order  && filters.value.order  !== 'desc')       query.order        = filters.value.order
    router.replace({ query })
  }

  const setFilter = (name, value) => {
    filters.value[name] = value
    if (name === 'priceRange') {
      filters.value.minPrice = value[0]
      filters.value.maxPrice = value[1]
    }
  }

  const addTag    = (tagId) => { if (!filters.value.tags.includes(tagId)) filters.value.tags.push(tagId) }
  const removeTag = (tagId) => { filters.value.tags = filters.value.tags.filter(id => id !== tagId) }
  const toggleTag = (tagId) => filters.value.tags.includes(tagId) ? removeTag(tagId) : addTag(tagId)

  const resetFilters = () => {
    filters.value = {
      category: null, tags: [], difficulty: null,
      priceRange: [0, 10000], minPrice: null, maxPrice: null,
      duration: null, locationType: null, search: '',
      sortBy: 'newest', order: 'desc'
    }
    saveFiltersToUrl()
  }

  const resetFilter = (name) => {
    const defaults = {
      category: null, tags: [], difficulty: null,
      price: null, duration: null, locationType: null, search: ''
    }
    if (name === 'price') {
      filters.value.priceRange = [0, 10000]
      filters.value.minPrice   = null
      filters.value.maxPrice   = null
    } else if (name in defaults) {
      filters.value[name] = defaults[name]
    }
  }

  const getActiveFilters = computed(() => {
    const active = []
    if (filters.value.category)          active.push({ name: 'category',     label: 'Категория',    value: filters.value.category })
    if (filters.value.tags.length > 0)   active.push({ name: 'tags',         label: 'Теги',         value: filters.value.tags })
    if (filters.value.difficulty)        active.push({ name: 'difficulty',   label: 'Сложность',    value: filters.value.difficulty })
    if (filters.value.minPrice || (filters.value.maxPrice && filters.value.maxPrice < 10000))
      active.push({ name: 'price', label: 'Цена', value: `${filters.value.minPrice || 0} - ${filters.value.maxPrice || 10000} ₽` })
    if (filters.value.duration)          active.push({ name: 'duration',     label: 'Длительность', value: filters.value.duration })
    if (filters.value.locationType)      active.push({ name: 'locationType', label: 'Место',        value: filters.value.locationType })
    if (filters.value.search)            active.push({ name: 'search',       label: 'Поиск',        value: filters.value.search })
    return active
  })

  const activeFiltersCount = computed(() => getActiveFilters.value.length)
  const hasActiveFilters   = computed(() => activeFiltersCount.value > 0)

  const getApiParams = computed(() => {
    const params = {}
    if (filters.value.category)              params.category      = filters.value.category
    if (filters.value.tags.length > 0)       params.tags          = filters.value.tags.join(',')
    if (filters.value.difficulty)            params.difficulty    = filters.value.difficulty
    if (filters.value.minPrice !== null)     params.min_price     = filters.value.minPrice
    if (filters.value.maxPrice !== null)     params.max_price     = filters.value.maxPrice
    if (filters.value.duration)              params.duration      = filters.value.duration
    if (filters.value.locationType)          params.location_type = filters.value.locationType
    if (filters.value.search)                params.search        = filters.value.search
    if (filters.value.sortBy)                params.sort_by       = filters.value.sortBy
    if (filters.value.order)                 params.order         = filters.value.order
    return params
  })

  // Авто-сохранение в URL только на клиенте — иначе hydration mismatch
  if (import.meta.client) {
    watch(filters, saveFiltersToUrl, { deep: true })
  }

  loadFiltersFromUrl()

  return {
    filters,
    getActiveFilters, activeFiltersCount, hasActiveFilters, getApiParams,
    setFilter, addTag, removeTag, toggleTag,
    resetFilters, resetFilter, loadFiltersFromUrl, saveFiltersToUrl
  }
}