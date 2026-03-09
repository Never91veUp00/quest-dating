<template>
  <div class="templates-page">
    <div class="container">
      <Breadcrumbs :crumbs="breadcrumbs" />
    </div>

    <section class="page-header">
      <div class="container">
        <h1 class="page-title">Свидания-квесты — сценарии для пар</h1>
        <p class="page-description">
          Выберите сценарий — Лиза Петри адаптирует его специально под вас
        </p>
        <div class="search-wrapper">
          <SearchBar
            v-model="searchQuery"
            placeholder="Искать свидания-квесты..."
            :suggestions="searchSuggestions"
            @search="handleSearch"
            @select-category="handleSelectCategory"
          />
        </div>
      </div>
    </section>

    <section class="templates-content">
      <div class="container">
        <div class="content-layout">
          <aside class="filters-sidebar" :class="{ 'filters-sidebar--open': filtersOpen }">
            <TemplateFilters
              v-model:filters="filters"
              :categories="categories"
              :tags="popularTags"@reset="handleFiltersReset"
            />
          </aside>

          <button class="filters-toggle" @click="filtersOpen = !filtersOpen">
            <span class="filters-toggle__icon">🎛</span>
            <span>Фильтры</span>
            <span v-if="activeFiltersCount" class="filters-toggle__badge">{{ activeFiltersCount }}</span>
            <span class="filters-toggle__arrow" :class="{ rotated: filtersOpen }">▼</span>
          </button>

          <main class="templates-main">
            <!-- Тулбар: результат + сортировка -->
            <div class="templates-toolbar">
              <div class="results-count">
                <span v-if="hasActiveFilters">
                  Найдено: <strong>{{ allDates.length }}</strong>
                  <span class="results-count__of"> из {{ totalCount }}</span>
                </span>
                <span v-else>Всего квестов: <strong>{{ totalCount }}</strong></span>
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

            <!-- Активные фильтры -->
            <div v-if="hasActiveFilters" class="active-filters">
              <div class="active-filters__chips">
                <!-- Категория -->
                <div v-if="filters.category" class="af-chip">
                  <span class="af-chip__type">Категория:</span>
                  <span class="af-chip__value">{{ getCategoryName(filters.category) }}</span>
                  <button class="af-chip__remove" @click="removeFilter('category')">×</button>
                </div>
                <!-- Теги — каждый отдельным чипом -->
                <div v-for="tagId in filters.tags" :key="'tag-' + tagId" class="af-chip">
                  <span class="af-chip__type">Тег:</span>
                  <span class="af-chip__value">{{ getTagName(tagId) }}</span>
                  <button class="af-chip__remove" @click="removeSingleTag(tagId)">×</button>
                </div>
                <!-- Сложность -->
                <div v-if="filters.difficulty" class="af-chip">
                  <span class="af-chip__type">Сложность:</span>
                  <span class="af-chip__value">{{ difficultyLabel(filters.difficulty) }}</span>
                  <button class="af-chip__remove" @click="removeFilter('difficulty')">×</button>
                </div>
                <!-- Цена -->
                <div v-if="filters.minPrice || filters.maxPrice" class="af-chip">
                  <span class="af-chip__type">Цена:</span>
                  <span class="af-chip__value">{{ filters.minPrice || 0 }} — {{ filters.maxPrice || '∞' }} ₽</span>
                  <button class="af-chip__remove" @click="removeFilter('price')">×</button>
                </div>
                <!-- Длительность -->
                <div v-if="filters.duration" class="af-chip">
                  <span class="af-chip__type">Длительность:</span>
                  <span class="af-chip__value">{{ durationLabel(filters.duration) }}</span>
                  <button class="af-chip__remove" @click="removeFilter('duration')">×</button>
                </div>
                <!-- Место -->
                <div v-if="filters.locationType" class="af-chip">
                  <span class="af-chip__type">Место:</span>
                  <span class="af-chip__value">{{ locationLabel(filters.locationType) }}</span>
                  <button class="af-chip__remove" @click="removeFilter('locationType')">×</button>
                </div>
                <!-- Поиск -->
                <div v-if="filters.search" class="af-chip">
                  <span class="af-chip__type">Поиск:</span>
                  <span class="af-chip__value">{{ filters.search }}</span>
                  <button class="af-chip__remove" @click="removeFilter('search')">×</button>
                </div>

                <button class="af-reset" @click="handleFiltersReset">Сбросить все</button>
              </div>
            </div>

            <div v-if="pending" class="loading-state">
              <Loader text="Загружаем квесты..." size="large" />
            </div>

            <div v-else-if="filteredDates.length === 0" class="empty-state">
              <div class="empty-icon">🔍</div>
              <h3>Квесты не найдены</h3>
              <p>Попробуйте изменить параметры фильтров для поиска</p>
              <button @click="handleFiltersReset" class="btn-reset">Сбросить фильтры</button>
            </div>

            <TemplateGrid
              v-else
              :templates="paginatedDates"
              :loading="pending"
              @reset-filters="handleFiltersReset"
            />

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
import { ref, computed, watch } from 'vue'

const route  = useRoute()
const router = useRouter()
const { getDates, getCategories, getPopularTags } = useDatesApi()

useSeoMeta({
  title:         'Свидания-квесты — сценарии для пар | Quest Dating',
  description:   'Выберите сценарий свидания-квеста — Лиза Петри адаптирует его персонально под вас. Романтические квесты для пар от 990 руб.',
  ogTitle:       'Свидания-квесты — сценарии для пар | Quest Dating',
  ogDescription: 'Готовые сценарии свиданий-квестов. Лиза Петри разработает персональный квест специально для вашей пары.',
  ogImage:       'https://questdating.ru/og-image.jpg',
})


const {
  filters, getActiveFilters, activeFiltersCount,
  hasActiveFilters, getApiParams,
  resetFilters, resetFilter
} = useFilters()

const searchQuery       = ref(route.query.search || '')
const sortBy            = ref(route.query.sort_by || 'newest')
const currentPage       = ref(Number(route.query.page) || 1)
const filtersOpen       = ref(false)
const searchSuggestions = ref([])

const { data: datesData, pending, refresh: refreshDates } = await useAsyncData(
  'catalog-dates',
  () => getDates(getApiParams.value)
)

// watch напрямую на filters — надёжнее чем watch на computed
watch(filters, () => {
  currentPage.value = 1
  updateUrl()
  refreshDates()
  if (import.meta.client && window.innerWidth <= 1024) filtersOpen.value = false
}, { deep: true })

const { data: categoriesData } = await useAsyncData(
  'catalog-categories',
  () => getCategories()
)

const { data: tagsData } = await useAsyncData(
  'catalog-tags',
  () => getPopularTags()
)

const allDates    = computed(() => datesData.value?.data      || datesData.value      || [])

useHead(() => ({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type':    'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Главная',                    item: 'https://questdating.ru/' },
          { '@type': 'ListItem', position: 2, name: 'Сценарии свиданий-квестов',  item: 'https://questdating.ru/catalog' },
        ],
      }),
    },
    ...(allDates.value?.length ? [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context':       'https://schema.org',
        '@type':          'ItemList',
        name:             'Сценарии свиданий-квестов',
        description:      'Готовые сценарии свиданий-квестов от Лизы Петри — персональная адаптация под каждую пару.',
        numberOfItems:    allDates.value.length,
        itemListElement:  allDates.value.slice(0, 20).map((d, i) => ({
          '@type':    'ListItem',
          position:   i + 1,
          name:       d.title,
          url:        `https://questdating.ru/date/${d.slug}`,
          image:      d.cover_image || 'https://questdating.ru/og-image.jpg',
          description: d.tagline || d.description?.substring(0, 120) || '',
        })),
      }),
    }] : []),
  ],
}))
const categories  = computed(() => categoriesData.value?.data || categoriesData.value || [])
const popularTags = computed(() => tagsData.value?.data       || tagsData.value       || [])

const filteredDates = computed(() => {
  let list = [...allDates.value]
  switch (sortBy.value) {
    case 'rating':  list.sort((a, b) => (b.rating || 0)       - (a.rating || 0)); break
    case 'orders':  list.sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0)); break
    case 'price':   list.sort((a, b) => (a.base_price || 0)   - (b.base_price || 0)); break
    default:        list.sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))
  }
  return list
})

const totalPages = computed(() => Math.ceil(filteredDates.value.length / 12))

const paginatedDates = computed(() => {
  const start = (currentPage.value - 1) * 12
  return filteredDates.value.slice(start, start + 12)
})

const activeFilters = computed(() => getActiveFilters.value)

const breadcrumbs = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Сценарии свиданий-квестов' }
])

const formatFilterValue = (filter) => {
  if (Array.isArray(filter.value)) {
    return filter.value.length > 1 ? `${filter.value.length} выбрано` : filter.value[0]
  }
  return filter.value
}

const totalCount = computed(() => {
  const p = datesData.value?.pagination
  return p ? p.total : allDates.value.length
})

const getCategoryName = (id) => {
  const cat = categories.value.find(c => c.id === id || c.id === Number(id))
  return cat ? cat.name : `#${id}`
}

const getTagName = (tagId) => {
  const tag = popularTags.value.find(t => t.id === tagId || t.id === Number(tagId))
  return tag ? tag.name : `#${tagId}`
}

const difficultyLabel = (v) => ({ easy: 'Легко', medium: 'Средне', hard: 'Сложно', expert: 'Эксперт' }[v] || v)
const durationLabel   = (v) => ({ '0-60': 'До 1 ч', '60-120': '1–2 ч', '120-180': '2–3 ч', '180+': '3+ ч' }[v] || v)
const locationLabel   = (v) => ({ city: 'По городу', park: 'Парк', indoor: 'В помещении', universal: 'Универсальный' }[v] || v)

const removeSingleTag = (tagId) => {
  filters.value.tags = filters.value.tags.filter(id => id !== tagId)
}

const handleSearch = (query) => {
  searchQuery.value    = query
  filters.value.search = query
  currentPage.value    = 1
  updateUrl()
}

const handleSelectCategory = (category) => {
  filters.value.category = category.id
  currentPage.value      = 1
  updateUrl()
}



const handleFiltersReset = () => {
  resetFilters()
  searchQuery.value = ''
  sortBy.value      = 'newest'
  currentPage.value = 1
  updateUrl()
}

const removeFilter = (filterName) => {
  resetFilter(filterName)
  if (filterName === 'search') searchQuery.value = ''
  currentPage.value = 1
  updateUrl()
}

const handleSortChange = () => {
  filters.value.sortBy = sortBy.value
  currentPage.value    = 1
  updateUrl()
}

const handlePageChange = (page) => {
  currentPage.value = page
  updateUrl()
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

const updateUrl = () => {
  const query = {
    ...(searchQuery.value         && { search:  searchQuery.value }),
    ...(sortBy.value !== 'newest' && { sort_by: sortBy.value }),
    ...(currentPage.value > 1     && { page:    currentPage.value })
  }
  router.push({ query })
}

watch(() => route.query, (newQ, oldQ) => {
  if (JSON.stringify(newQ) !== JSON.stringify(oldQ)) {
    if (newQ.search)  { searchQuery.value = newQ.search; filters.value.search = newQ.search }
    if (newQ.sort_by)   sortBy.value      = newQ.sort_by
    if (newQ.page)      currentPage.value = Number(newQ.page)
  }
})
</script>

<style scoped>
.templates-page { min-height: 100vh; background: #f7fafc; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.page-header { background: white; padding: 40px 0; border-bottom: 1px solid #e2e8f0; }
.page-title { font-size: 2.5rem; font-weight: 800; color: #2d3748; margin: 0 0 12px 0; }
.page-description { font-size: 1.1rem; color: #718096; margin: 0 0 32px 0; }
.search-wrapper { max-width: 600px; }
.templates-content { padding: 40px 0 80px; }
.content-layout { display: grid; grid-template-columns: 280px 1fr; gap: 40px; }
.filters-sidebar { position: sticky; top: 100px; align-self: flex-start; }
.templates-main { display: flex; flex-direction: column; gap: 24px; }
.active-filters { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.active-filters-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.filters-count { font-weight: 600; color: #4a5568; }
.btn-clear-all { padding: 6px 16px; background: transparent; border: 1px solid #e2e8f0; border-radius: 6px; color: #718096; font-size: 0.9rem; cursor: pointer; transition: all 0.3s; }
.btn-clear-all:hover { border-color: #667eea; color: #667eea; }
.filters-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.filter-tag { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; background: #edf2f7; border-radius: 20px; font-size: 0.85rem; color: #4a5568; }
.btn-remove { width: 18px; height: 18px; background: #cbd5e0; border: none; border-radius: 50%; color: #4a5568; font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-remove:hover { background: #a0aec0; color: white; }
.templates-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.results-count { color: #4a5568; font-size: 0.95rem; }
.results-count strong { color: #2d3748; font-weight: 700; }
.sorting { display: flex; align-items: center; gap: 12px; }
.sorting label { color: #718096; font-size: 0.9rem; }
.sort-select { padding: 8px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; color: #4a5568; background: white; cursor: pointer; transition: border-color 0.3s; }
.sort-select:focus { outline: none; border-color: #667eea; }
.loading-state { display: flex; justify-content: center; padding: 80px 20px; }
.empty-state { text-align: center; padding: 80px 20px; background: white; border-radius: 12px; }
.empty-icon { font-size: 5rem; margin-bottom: 24px; opacity: 0.5; }
.empty-state h3 { font-size: 1.5rem; font-weight: 700; color: #2d3748; margin: 0 0 12px 0; }
.empty-state p { color: #718096; margin: 0 0 24px 0; }
.btn-reset { padding: 12px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-reset:hover { transform: translateY(-2px); }
.filters-toggle { display: none; }
@media (max-width: 1024px) {
  .content-layout { grid-template-columns: 1fr; }
  .filters-toggle { display: flex; align-items: center; gap: 8px; order: -1; width: 100%; padding: 14px 20px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.95rem; font-weight: 600; color: #4a5568; cursor: pointer; }
  .filters-toggle__badge { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 0.75rem; min-width: 20px; height: 20px; border-radius: 10px; display: flex; align-items: center; justify-content: center; padding: 0 6px; }
  .filters-toggle__arrow { margin-left: auto; transition: transform 0.25s; }
  .filters-toggle__arrow.rotated { transform: rotate(180deg); }
  .filters-sidebar { position: static; display: none; order: -1; }
  .filters-sidebar--open { display: block; }
}
@media (max-width: 768px) {
  .page-title { font-size: 2rem; }
  .templates-toolbar { flex-direction: column; align-items: flex-start; gap: 16px; }
  .sorting { width: 100%; justify-content: space-between; }
}

/* ── Активные фильтры ───────────────────────────────────────── */
.active-filters {
  margin-bottom: 16px;
}
.active-filters__chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.af-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  background: var(--color-primary-light, #ede9fe);
  border: 1px solid var(--color-primary, #7c3aed);
  border-radius: 20px;
  font-size: 0.82rem;
  color: var(--color-primary-dark, #5b21b6);
  white-space: nowrap;
}
.af-chip__type {
  opacity: 0.7;
  font-weight: 500;
}
.af-chip__value {
  font-weight: 700;
}
.af-chip__remove {
  margin-left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-primary, #7c3aed);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 11px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  opacity: 0.8;
  transition: opacity 0.15s;
}
.af-chip__remove:hover { opacity: 1; }
.af-reset {
  padding: 5px 14px;
  background: transparent;
  border: 1px solid var(--color-gray-300, #d1d5db);
  border-radius: 20px;
  font-size: 0.82rem;
  color: var(--color-gray-500, #6b7280);
  cursor: pointer;
  transition: all 0.15s;
}
.af-reset:hover {
  border-color: var(--color-danger, #ef4444);
  color: var(--color-danger, #ef4444);
}
.results-count__of {
  color: var(--color-gray-400, #9ca3af);
  font-size: 0.9em;
}
</style>