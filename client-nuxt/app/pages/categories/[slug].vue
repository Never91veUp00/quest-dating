<template>
  <div class="category-page">
    <div v-if="pending" class="loading-container">
      <Loader text="Загружаем категорию..." size="large" />
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <div class="error-icon">😕</div>
        <h2>Категория не найдена</h2>
        <p>{{ error.message }}</p>
        <NuxtLink to="/catalog" class="btn-back">← Вернуться в каталог</NuxtLink>
      </div>
    </div>

    <div v-else-if="category" class="category-content">
      <div class="breadcrumbs-bar">
        <div class="container">
          <Breadcrumbs :crumbs="breadcrumbs" />
        </div>
      </div>

      <section class="category-header">
        <div class="container">
          <div class="header-content">
            <div class="category-icon">{{ category.icon }}</div>
            <div class="header-info">
              <h1 class="category-title">{{ category.name }}</h1>
              <p class="category-description">{{ category.description }}</p>
              <div class="category-meta">
                <span class="meta-item">
                  📋 {{ category.templates_count }} {{ pluralizeTemplates(category.templates_count) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="templates-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Все квесты категории</h2>
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

          <div v-if="templatesPending" class="templates-loading">
            <Loader text="Загружаем шаблоны..." />
          </div>

          <div v-else-if="templates.length === 0" class="empty-state">
            <div class="empty-icon">🗂️</div>
            <h3>Шаблонов пока нет</h3>
            <p>В этой категории пока нет опубликованных шаблонов</p>
            <NuxtLink to="/catalog" class="btn-browse">Смотреть все свидания-квесты</NuxtLink>
          </div>

          <div v-else class="templates-grid">
            <TemplateCard
              v-for="template in paginatedTemplates"
              :key="template.id"
              :template="template"
            />
          </div>

          <Pagination
            v-if="totalPages > 1"
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="handlePageChange"
          />
        </div>
      </section>

      <section v-if="relatedCategories.length > 0" class="related-categories">
        <div class="container">
          <h2 class="section-title">Другие виды свидания-квестов</h2>
          <div class="categories-grid">
            <CategoryCard
              v-for="cat in relatedCategories"
              :key="cat.id"
              :category="cat"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const route  = useRoute()
const router = useRouter()
const { getCategory, getDates, getCategories } = useDatesApi()
const { data: categoryRaw, pending, error } = await useAsyncData(
  `category-${route.params.slug}`,
  () => getCategory(route.params.slug),
  { transform: (d) => JSON.parse(JSON.stringify(d)) }
)

const category = computed(() => categoryRaw.value?.data ?? categoryRaw.value ?? null)

const SITE_URL = 'https://questdating.ru'

// SEO title по slug — точные формулировки для каждой категории
const SEO_TITLES = {
  anniversary: 'Квест-сюрприз на годовщину отношений | Quest Dating',
  birthday:    'Свидание-квест на день рождения | Quest Dating',
  valentines:  'Квест для свидания в День влюблённых | Quest Dating',
  'womens-day':'Свидание-квест на 8 марта | Quest Dating',
  home:        'Квест для свидания дома: сценарии | Quest Dating',
  city:        'Городское свидание-квест: маршруты | Quest Dating',
  online:      'Онлайн квест-сюрприз для двоих | Quest Dating',
}

useSeoMeta({
  title:         () => category.value
    ? (SEO_TITLES[category.value.slug] || `${category.value.name} — свидание-квест | Quest Dating`)
    : 'Категория | Quest Dating',
  description:   () => category.value?.description?.substring(0, 160) ?? null,
  ogTitle:       () => category.value?.name ?? null,
  ogDescription: () => category.value?.description?.substring(0, 160) ?? null,
  ogImage:       `${SITE_URL}/og-image.jpg`,
})

// useServerHead — выполняется только при SSR, не включается в клиентский payload
// поэтому devalue не пытается сериализовать @ ключи JSON-LD
if (category.value) {
  useServerHead({
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Главная',                   item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Шаблоны свидания-квестов', item: `${SITE_URL}/catalog` },
          { '@type': 'ListItem', position: 3, name: category.value.name,         item: `${SITE_URL}/categories/${category.value.slug}` },
        ]
      })
    }]
  })
}

const { data: templatesRaw, pending: templatesPending } = await useAsyncData(
  `category-templates-${route.params.slug}`,
  () => category.value ? getDates({ category: category.value.id }) : Promise.resolve(null),
  { watch: [() => route.params.slug], transform: (d) => d ? JSON.parse(JSON.stringify(d)) : null }
)

const templates = computed(() => templatesRaw.value?.data ?? templatesRaw.value ?? [])

const { data: categoriesRaw } = await useAsyncData(
  'all-categories-v2',
  () => getCategories(),
  { transform: (d) => JSON.parse(JSON.stringify(d)) }
)
const allCategories = computed(() => categoriesRaw.value?.data ?? categoriesRaw.value ?? [])

const sortBy       = ref(route.query.sort_by || 'newest')
const currentPage  = ref(Number(route.query.page) || 1)
const itemsPerPage = 12

const breadcrumbs = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Шаблоны свидания-квестов', to: '/catalog' },
  { label: category.value?.name || 'Категория' }
])

const pluralizeTemplates = (count) =>
  ['шаблон', 'шаблона', 'шаблонов'][count % 100 > 10 && count % 100 < 20 ? 2 : [2, 0, 1, 1, 1, 2][Math.min(count % 10, 5)]]

const sortedTemplates = computed(() => {
  const sorted = [...templates.value]
  switch (sortBy.value) {
    case 'rating':  return sorted.sort((a, b) => (b.rating || 0)       - (a.rating || 0))
    case 'orders':  return sorted.sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0))
    case 'price':   return sorted.sort((a, b) => (a.base_price || 0)   - (b.base_price || 0))
    default:        return sorted.sort((a, b) =>
      new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at)
    )
  }
})

const totalPages = computed(() =>
  Math.ceil(sortedTemplates.value.length / itemsPerPage)
)

const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return sortedTemplates.value.slice(start, start + itemsPerPage)
})

const relatedCategories = computed(() =>
  allCategories.value.filter(c => c.id !== category.value?.id).slice(0, 6)
)

const handleSortChange = () => {
  currentPage.value = 1
  updateUrl()
}

const handlePageChange = (page) => {
  currentPage.value = page
  updateUrl()
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

const updateUrl = () => {
  router.push({ query: {
    ...(sortBy.value !== 'newest' && { sort_by: sortBy.value }),
    ...(currentPage.value > 1    && { page: currentPage.value })
  }})
}
</script>

<style scoped>
.category-page { min-height: 100vh; background: #f7fafc; }
.breadcrumbs-bar { background: white; border-bottom: 1px solid #e2e8f0; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.loading-container, .error-container { display: flex; justify-content: center; align-items: center; min-height: 60vh; padding: 40px 20px; }
.error-content { text-align: center; max-width: 500px; }
.error-icon { font-size: 5rem; margin-bottom: 24px; }
.error-content h2 { font-size: 2rem; font-weight: 700; color: #2d3748; margin: 0 0 12px 0; }
.error-content p { color: #718096; margin: 0 0 32px 0; }
.btn-back, .btn-browse { display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 600; transition: all 0.3s; letter-spacing: 0.02em; }
.btn-back:hover, .btn-browse:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
.category-header { background: white; padding: 60px 0; border-bottom: 1px solid #e2e8f0; }
.header-content { display: flex; align-items: center; gap: 32px; }
.category-icon { width: 120px; height: 120px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 4rem; flex-shrink: 0; box-shadow: 0 8px 24px rgba(102,126,234,0.3); }
.category-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 3rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #2d3748;
  margin: 0 0 16px 0;
}
.category-description { font-size: 1.25rem; color: #718096; margin: 0 0 20px 0; line-height: 1.6; }
.category-meta { display: flex; gap: 20px; }
.meta-item { font-size: 1rem; color: #4a5568; font-weight: 600; }
.templates-section { padding: 60px 0; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
.section-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #2d3748;
  margin: 0;
}
.sorting { display: flex; align-items: center; gap: 12px; }
.sorting label { color: #718096; font-size: 0.9rem; font-weight: 500; }
.sort-select { padding: 8px 16px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 0.9rem; color: #4a5568; background: white; cursor: pointer; transition: border-color 0.3s; }
.sort-select:focus { outline: none; border-color: #667eea; }
.templates-loading { display: flex; justify-content: center; padding: 80px 20px; }
.empty-state { text-align: center; padding: 80px 20px; background: white; border-radius: 12px; }
.empty-icon { font-size: 5rem; margin-bottom: 24px; opacity: 0.5; }
.empty-state h3 { font-size: 1.5rem; font-weight: 700; color: #2d3748; margin: 0 0 12px 0; }
.empty-state p { color: #718096; margin: 0 0 24px 0; }
.templates-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px; margin-bottom: 48px; }
.related-categories { padding: 60px 0; background: white; border-top: 1px solid #e2e8f0; }
.categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; margin-top: 40px; }
@media (max-width: 768px) {
  .header-content { flex-direction: column; text-align: center; }
  .category-title { font-size: 1.8rem; }
  .section-header { flex-direction: column; align-items: flex-start; gap: 20px; }
  .sorting { width: 100%; justify-content: space-between; }
  .templates-grid { grid-template-columns: 1fr; }
}
</style>