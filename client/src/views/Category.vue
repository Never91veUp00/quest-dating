<template>
  <div class="category-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <Loader text="Загружаем категорию..." size="large" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <div class="error-icon">😞</div>
        <h2>Категория не найдена</h2>
        <p>{{ error }}</p>
        <router-link to="/templates" class="btn-back">
          ← Вернуться к каталогу
        </router-link>
      </div>
    </div>

    <!-- Category Content -->
    <div v-else-if="category" class="category-content">
      <!-- Breadcrumbs -->
      <div class="container">
        <Breadcrumbs :crumbs="breadcrumbs" />
      </div>

      <!-- Category Header -->
      <section class="category-header">
        <div class="container">
          <div class="header-content">
            <div class="category-icon">{{ category.icon }}</div>
            <div class="header-info">
              <h1 class="category-title">{{ category.name }}</h1>
              <p class="category-description">{{ category.description }}</p>
              <div class="category-meta">
                <span class="meta-item">
                  📝 {{ category.templates_count }} {{ pluralizeTemplates(category.templates_count) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Templates Section -->
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

          <!-- Loading Templates -->
          <div v-if="templatesLoading" class="templates-loading">
            <Loader text="Загружаем шаблоны..." />
          </div>

          <!-- Empty State -->
          <div v-else-if="templates.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>Шаблонов пока нет</h3>
            <p>В этой категории пока нет опубликованных шаблонов</p>
            <router-link to="/templates" class="btn-browse">
              Смотреть все шаблоны
            </router-link>
          </div>

          <!-- Templates Grid -->
          <div v-else class="templates-grid">
            <TemplateCard
              v-for="template in paginatedTemplates"
              :key="template.id"
              :template="template"
            />
          </div>

          <!-- Pagination -->
          <Pagination
            v-if="totalPages > 1"
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="handlePageChange"
          />
        </div>
      </section>

      <!-- Related Categories -->
      <section v-if="relatedCategories.length > 0" class="related-categories">
        <div class="container">
          <h2 class="section-title">Другие категории</h2>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestStore } from '@/store'
import { pluralize } from '@/utils/formatters'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import Loader from '@/components/common/Loader.vue'
import TemplateCard from '@/components/marketplace/TemplateCard.vue'
import CategoryCard from '@/components/marketplace/CategoryCard.vue'
import Pagination from '@/components/common/Pagination.vue'

const route = useRoute()
const router = useRouter()
const questStore = useQuestStore()

const category = ref(null)
const templates = ref([])
const allCategories = ref([])
const loading = ref(true)
const templatesLoading = ref(true)
const error = ref(null)
const sortBy = ref('newest')
const currentPage = ref(1)
const itemsPerPage = 12

const breadcrumbs = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Шаблоны', to: '/templates' },
  { label: category.value?.name || 'Категория' }
])

const pluralizeTemplates = (count) => {
  return pluralize(count, 'шаблон', 'шаблона', 'шаблонов')
}

const sortedTemplates = computed(() => {
  const sorted = [...templates.value]

  switch (sortBy.value) {
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    case 'orders':
      return sorted.sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0))
    case 'price':
      return sorted.sort((a, b) => (a.base_price || 0) - (b.base_price || 0))
    case 'newest':
    default:
      return sorted.sort((a, b) => 
        new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at)
      )
  }
})

const totalPages = computed(() => {
  return Math.ceil(sortedTemplates.value.length / itemsPerPage)
})

const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedTemplates.value.slice(start, end)
})

const relatedCategories = computed(() => {
  if (!category.value) return []
  return allCategories.value
    .filter(cat => cat.id !== category.value.id)
    .slice(0, 6)
})

const loadCategory = async () => {
  loading.value = true
  error.value = null

  try {
    const slug = route.params.slug
    category.value = await questStore.fetchCategory(slug)

    // Обновить meta tags
    if (category.value) {
      document.title = `${category.value.name} - Quest Dating`
      
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', category.value.description)
      }
    }
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить категорию'
    console.error('Error loading category:', err)
  } finally {
    loading.value = false
  }
}

const loadTemplates = async () => {
  if (!category.value) return

  templatesLoading.value = true

  try {
    const response = await questStore.fetchTemplates({
      category: category.value.id
    })
    templates.value = response.data
  } catch (err) {
    console.error('Error loading templates:', err)
  } finally {
    templatesLoading.value = false
  }
}

const loadCategories = async () => {
  try {
    allCategories.value = await questStore.fetchCategories()
  } catch (err) {
    console.error('Error loading categories:', err)
  }
}

const handleSortChange = () => {
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
    ...(sortBy.value !== 'newest' && { sort_by: sortBy.value }),
    ...(currentPage.value > 1 && { page: currentPage.value })
  }

  router.push({ query })
}

const applyUrlParams = () => {
  if (route.query.sort_by) {
    sortBy.value = route.query.sort_by
  }
  if (route.query.page) {
    currentPage.value = parseInt(route.query.page)
  }
}

watch(() => route.params.slug, () => {
  loadCategory()
  loadTemplates()
})

onMounted(async () => {
  applyUrlParams()
  await loadCategory()
  await Promise.all([loadTemplates(), loadCategories()])
})
</script>

<style scoped>
.category-page {
  min-height: 100vh;
  background: #f7fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  font-size: 5rem;
  margin-bottom: 24px;
}

.error-content h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.error-content p {
  color: #718096;
  margin: 0 0 32px 0;
}

.btn-back {
  display: inline-block;
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Category Header */
.category-header {
  background: white;
  padding: 60px 0;
  border-bottom: 1px solid #e2e8f0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 32px;
}

.category-icon {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.header-info {
  flex: 1;
}

.category-title {
  font-size: 3rem;
  font-weight: 900;
  color: #2d3748;
  margin: 0 0 16px 0;
}

.category-description {
  font-size: 1.25rem;
  color: #718096;
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.category-meta {
  display: flex;
  gap: 20px;
}

.meta-item {
  font-size: 1rem;
  color: #4a5568;
  font-weight: 600;
}

/* Templates Section */
.templates-section {
  padding: 60px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0;
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

.templates-loading {
  display: flex;
  justify-content: center;
  padding: 80px 20px;
}

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

.btn-browse {
  display: inline-block;
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-browse:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  margin-bottom: 48px;
}

/* Related Categories */
.related-categories {
  padding: 60px 0;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 40px;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .category-title {
    font-size: 2rem;
  }

  .category-description {
    font-size: 1.1rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .sorting {
    width: 100%;
    justify-content: space-between;
  }

  .sort-select {
    flex: 1;
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }
}
</style>