import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export function useFilters(initialFilters = {}) {
  const router = useRouter()
  const route = useRoute()

  // Фильтры
  const filters = ref({
    category: null,
    tags: [],
    difficulty: null,
    priceRange: [0, 10000],
    minPrice: null,
    maxPrice: null,
    duration: null,
    locationType: null,
    search: '',
    sortBy: 'newest',
    order: 'desc',
    ...initialFilters
  })

  // Загрузить фильтры из URL
  const loadFiltersFromUrl = () => {
    const urlParams = route.query

    if (urlParams.category) {
      filters.value.category = parseInt(urlParams.category)
    }

    if (urlParams.tags) {
      filters.value.tags = Array.isArray(urlParams.tags) 
        ? urlParams.tags.map(t => parseInt(t))
        : [parseInt(urlParams.tags)]
    }

    if (urlParams.difficulty) {
      filters.value.difficulty = urlParams.difficulty
    }

    if (urlParams.minPrice) {
      filters.value.minPrice = parseInt(urlParams.minPrice)
      filters.value.priceRange[0] = parseInt(urlParams.minPrice)
    }

    if (urlParams.maxPrice) {
      filters.value.maxPrice = parseInt(urlParams.maxPrice)
      filters.value.priceRange[1] = parseInt(urlParams.maxPrice)
    }

    if (urlParams.duration) {
      filters.value.duration = urlParams.duration
    }

    if (urlParams.locationType) {
      filters.value.locationType = urlParams.locationType
    }

    if (urlParams.search) {
      filters.value.search = urlParams.search
    }

    if (urlParams.sort_by) {
      filters.value.sortBy = urlParams.sort_by
    }

    if (urlParams.order) {
      filters.value.order = urlParams.order
    }
  }

  // Сохранить фильтры в URL
  const saveFiltersToUrl = () => {
    const query = {}

    if (filters.value.category) {
      query.category = filters.value.category
    }

    if (filters.value.tags.length > 0) {
      query.tags = filters.value.tags
    }

    if (filters.value.difficulty) {
      query.difficulty = filters.value.difficulty
    }

    if (filters.value.minPrice) {
      query.minPrice = filters.value.minPrice
    }

    if (filters.value.maxPrice) {
      query.maxPrice = filters.value.maxPrice
    }

    if (filters.value.duration) {
      query.duration = filters.value.duration
    }

    if (filters.value.locationType) {
      query.locationType = filters.value.locationType
    }

    if (filters.value.search) {
      query.search = filters.value.search
    }

    if (filters.value.sortBy && filters.value.sortBy !== 'newest') {
      query.sort_by = filters.value.sortBy
    }

    if (filters.value.order && filters.value.order !== 'desc') {
      query.order = filters.value.order
    }

    router.replace({ query })
  }

  // Установить фильтр
  const setFilter = (name, value) => {
    filters.value[name] = value

    // Специальная обработка для priceRange
    if (name === 'priceRange') {
      filters.value.minPrice = value[0]
      filters.value.maxPrice = value[1]
    }
  }

  // Добавить тег
  const addTag = (tagId) => {
    if (!filters.value.tags.includes(tagId)) {
      filters.value.tags.push(tagId)
    }
  }

  // Удалить тег
  const removeTag = (tagId) => {
    const index = filters.value.tags.indexOf(tagId)
    if (index > -1) {
      filters.value.tags.splice(index, 1)
    }
  }

  // Переключить тег
  const toggleTag = (tagId) => {
    if (filters.value.tags.includes(tagId)) {
      removeTag(tagId)
    } else {
      addTag(tagId)
    }
  }

  // Сбросить все фильтры
  const resetFilters = () => {
    filters.value = {
      category: null,
      tags: [],
      difficulty: null,
      priceRange: [0, 10000],
      minPrice: null,
      maxPrice: null,
      duration: null,
      locationType: null,
      search: '',
      sortBy: 'newest',
      order: 'desc'
    }
    saveFiltersToUrl()
  }

  // Сбросить отдельный фильтр
  const resetFilter = (name) => {
    switch (name) {
      case 'category':
        filters.value.category = null
        break
      case 'tags':
        filters.value.tags = []
        break
      case 'difficulty':
        filters.value.difficulty = null
        break
      case 'price':
        filters.value.priceRange = [0, 10000]
        filters.value.minPrice = null
        filters.value.maxPrice = null
        break
      case 'duration':
        filters.value.duration = null
        break
      case 'locationType':
        filters.value.locationType = null
        break
      case 'search':
        filters.value.search = ''
        break
      default:
        break
    }
  }

  // Получить активные фильтры
  const getActiveFilters = computed(() => {
    const active = []

    if (filters.value.category) {
      active.push({ name: 'category', label: 'Категория', value: filters.value.category })
    }

    if (filters.value.tags.length > 0) {
      active.push({ name: 'tags', label: 'Теги', value: filters.value.tags })
    }

    if (filters.value.difficulty) {
      active.push({ name: 'difficulty', label: 'Сложность', value: filters.value.difficulty })
    }

    if (filters.value.minPrice || filters.value.maxPrice) {
      const priceLabel = `${filters.value.minPrice || 0} - ${filters.value.maxPrice || 10000} ₽`
      active.push({ name: 'price', label: 'Цена', value: priceLabel })
    }

    if (filters.value.duration) {
      active.push({ name: 'duration', label: 'Длительность', value: filters.value.duration })
    }

    if (filters.value.locationType) {
      active.push({ name: 'locationType', label: 'Место', value: filters.value.locationType })
    }

    if (filters.value.search) {
      active.push({ name: 'search', label: 'Поиск', value: filters.value.search })
    }

    return active
  })

  // Количество активных фильтров
  const activeFiltersCount = computed(() => getActiveFilters.value.length)

  // Есть ли активные фильтры
  const hasActiveFilters = computed(() => activeFiltersCount.value > 0)

  // Получить параметры для API
  const getApiParams = computed(() => {
    const params = {}

    if (filters.value.category) {
      params.category = filters.value.category
    }

    if (filters.value.tags.length > 0) {
      params.tags = filters.value.tags.join(',')
    }

    if (filters.value.difficulty) {
      params.difficulty = filters.value.difficulty
    }

    if (filters.value.minPrice !== null) {
      params.min_price = filters.value.minPrice * 100 // конвертируем в копейки
    }

    if (filters.value.maxPrice !== null) {
      params.max_price = filters.value.maxPrice * 100 // конвертируем в копейки
    }

    if (filters.value.duration) {
      params.duration = filters.value.duration
    }

    if (filters.value.locationType) {
      params.location_type = filters.value.locationType
    }

    if (filters.value.search) {
      params.search = filters.value.search
    }

    if (filters.value.sortBy) {
      params.sort_by = filters.value.sortBy
    }

    if (filters.value.order) {
      params.order = filters.value.order
    }

    return params
  })

  // Наблюдение за изменениями фильтров для автосохранения в URL
  watch(filters, () => {
    saveFiltersToUrl()
  }, { deep: true })

  // Загрузить фильтры при инициализации
  loadFiltersFromUrl()

  return {
    // State
    filters,

    // Computed
    getActiveFilters,
    activeFiltersCount,
    hasActiveFilters,
    getApiParams,

    // Methods
    setFilter,
    addTag,
    removeTag,
    toggleTag,
    resetFilters,
    resetFilter,
    loadFiltersFromUrl,
    saveFiltersToUrl
  }
}