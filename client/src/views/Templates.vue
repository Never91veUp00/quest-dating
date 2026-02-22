<template>
  <div class="templates-page">
    <!-- Breadcrumbs -->
    <div class="container">
      <Breadcrumbs :crumbs="breadcrumbs" />
    </div>

    <!-- Header -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">Квесты для свиданий</h1>
        <p class="page-description">
          Выберите шаблон — я адаптирую его специально под вас
        </p>

        <!-- Search Bar -->
        <div class="search-wrapper">
          <SearchBar
            v-model="searchQuery"
            placeholder="Поиск квестов..."
            :suggestions="searchSuggestions"
            @search="handleSearch"
            @select-category="handleSelectCategory"
          />
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="templates-content">
      <div class="container">
        <div class="content-layout">
          <!-- Filters Sidebar -->
          <aside class="filters-sidebar">
            <TemplateFilters
              v-model:filters="filters"
              :categories="categories"
              :tags="popularTags"
              @update:filters="handleFiltersUpdate"
              @reset="handleFiltersReset"
            />
          </aside>

          <!-- Templates Grid -->
          <main class="templates-main">
            <!-- Active Filters -->
            <div v-if="hasActiveFilters" class="active-filters">
              <div class="active-filters-header">
                <span class="filters-count">Активные фильтры: {{ activeFiltersCount }}</span>
                <button @click="handleFiltersReset" class="btn-clear-all">
                  Сбросить все
                </button>
              </div>
              <div class="filters-tags">
                <div
                  v-for="(filter, index) in activeFilters"
                  :key="index"
                  class="filter-tag"
                >
                  <span>{{ filter.label }}: {{ formatFilterValue(filter) }}</span>
                  <button @click="removeFilter(filter.name)" class="btn-remove">✕</button>
                </div>
              </div>
            </div>

            <!-- Sorting -->
            <div class="templates-toolbar">
              <div class="results-count">
                Квестов: <strong>{{ filteredTemplates.length }}</strong>
              </div>
              <div class="sorting">
                <label for="sort">Сортировка:</label>
                <select id="sort" v-model="sortBy" @change="handleSortChange" class="sort-select">
                  <option value="newest">Новые</option>
                  <option value="rating">По рейтингу</option>
                  <option value="orders">По популярности</option>
                  <option value="price">По цене</option>
                </select>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="loading-state">
              <Loader text="Загружаем шаблоны..." size="large" />
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredTemplates.length === 0" class="empty-state">
              <div class="empty-icon">🔍</div>
              <h3>Шаблоны не найдены</h3>
              <p>Попробуйте изменить параметры поиска или сбросить фильтры</p>
              <button @click="handleFiltersReset" class="btn-reset">
                Сбросить фильтры
              </button>
            </div>

            <!-- Templates Grid -->
            <TemplateGrid
              v-else
              :templates="paginatedTemplates"
              :loading="loading"
              @reset-filters="handleFiltersReset"
            />

            <!-- Pagination -->
            <Pagination
              v-if="totalPages > 1"
              :current-page="currentPage"
              :total-pages="totalPages"
              @page-change="handlePageChange"
            />
          </main>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestStore } from '@/store'
import { useFilters } from '@/composables/useFilters'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import TemplateFilters from '@/components/marketplace/TemplateFilters.vue'
import TemplateGrid from '@/components/marketplace/TemplateGrid.vue'
import Pagination from '@/components/common/Pagination.vue'
import Loader from '@/components/common/Loader.vue'

const route = useRoute()
const router = useRouter()
const questStore = useQuestStore()

const loading = ref(true)
const searchQuery = ref('')
const sortBy = ref('newest')
const currentPage = ref(1)
const itemsPerPage = 12

const categories = ref([])
const popularTags = ref([])
const searchSuggestions = ref([])

// Используем composable для фильтров
const {
  filters,
  getActiveFilters,
  activeFiltersCount,
  hasActiveFilters,
  resetFilters,
  resetFilter
} = useFilters()

const breadcrumbs = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Шаблоны квестов' }
])

const totalTemplates = computed(() => questStore.templates.length)

const filteredTemplates = computed(() => {
  return questStore.filteredTemplates
})

const totalPages = computed(() => {
  return Math.ceil(filteredTemplates.value.length / itemsPerPage)
})

const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTemplates.value.slice(start, end)
})

const activeFilters = computed(() => getActiveFilters.value)

const formatFilterValue = (filter) => {
  if (Array.isArray(filter.value)) {
    return filter.value.length > 1 ? `${filter.value.length} выбрано` : filter.value[0]
  }
  return filter.value
}

const loadData = async () => {
  loading.value = true
  try {
    const [, cats, tags] = await Promise.all([
      questStore.fetchTemplates(),
      questStore.fetchCategories(),
      questStore.fetchPopularTags()
    ])
    categories.value = cats || []
    popularTags.value = tags || []
    applyFiltersFromUrl()
  } catch (error) {
    console.error('Error loading templates:', error)
  } finally {
    loading.value = false
  }
}

const applyFiltersFromUrl = () => {
  if (route.query.search) {
    searchQuery.value = route.query.search
  }
  if (route.query.sort_by) {
    sortBy.value = route.query.sort_by
  }
  if (route.query.page) {
    currentPage.value = parseInt(route.query.page)
  }
}

const handleSearch = (query) => {
  searchQuery.value = query
  filters.value.search = query
  currentPage.value = 1
  updateUrl()
}

const handleSelectCategory = (category) => {
  filters.value.category = category.id
  currentPage.value = 1
  updateUrl()
}

const handleFiltersUpdate = () => {
  currentPage.value = 1
  updateUrl()
}

const handleFiltersReset = () => {
  resetFilters()
  searchQuery.value = ''
  sortBy.value = 'newest'
  currentPage.value = 1
  updateUrl()
}

const removeFilter = (filterName) => {
  resetFilter(filterName)
  if (filterName === 'search') {
    searchQuery.value = ''
  }
  currentPage.value = 1
  updateUrl()
}

const handleSortChange = () => {
  filters.value.sort_by = sortBy.value
  currentPage.value = 1
  updateUrl()
}

const handlePageChange = (page) => {
  currentPage.value = page
  updateUrl()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const updateUrl = () => {
  const query = {
    ...(searchQuery.value && { search: searchQuery.value }),
    ...(sortBy.value !== 'newest' && { sort_by: sortBy.value }),
    ...(currentPage.value > 1 && { page: currentPage.value })
  }

  router.push({ query })
}

// Следим за изменениями фильтров в store
watch(() => filters.value, () => {
  // Обновляем фильтры в store
  Object.keys(filters.value).forEach(key => {
    questStore.setFilter(key, filters.value[key])
  })
}, { deep: true })

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.templates-page {
  min-height: 100vh;
  background: #f7fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Page Header */
.page-header {
  background: white;
  padding: 40px 0;
  border-bottom: 1px solid #e2e8f0;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.page-description {
  font-size: 1.1rem;
  color: #718096;
  margin: 0 0 32px 0;
}

.search-wrapper {
  max-width: 600px;
}

/* Content Layout */
.templates-content {
  padding: 40px 0 80px;
}

.content-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
}

/* Filters Sidebar */
.filters-sidebar {
  position: sticky;
  top: 100px;
  align-self: flex-start;
}

/* Templates Main */
.templates-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Active Filters */
.active-filters {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.active-filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filters-count {
  font-weight: 600;
  color: #4a5568;
}

.btn-clear-all {
  padding: 6px 16px;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-clear-all:hover {
  border-color: #667eea;
  color: #667eea;
}

.filters-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #edf2f7;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #4a5568;
}

.btn-remove {
  width: 18px;
  height: 18px;
  background: #cbd5e0;
  border: none;
  border-radius: 50%;
  color: #4a5568;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background: #a0aec0;
  color: white;
}

/* Toolbar */
.templates-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.results-count {
  color: #4a5568;
  font-size: 0.95rem;
}

.results-count strong {
  color: #2d3748;
  font-weight: 700;
}

.sorting {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sorting label {
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
}

.sort-select {
  padding: 8px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #4a5568;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.sort-select:hover,
.sort-select:focus {
  outline: none;
  border-color: #667eea;
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 80px 20px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 24px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.empty-state p {
  color: #718096;
  margin: 0 0 24px 0;
}

.btn-reset {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-reset:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Responsive */
@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
  }

  .filters-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .templates-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .sorting {
    width: 100%;
    justify-content: space-between;
  }

  .sort-select {
    flex: 1;
  }
}
</style>