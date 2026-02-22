<template>
  <div class="authors-page">
    <!-- Breadcrumbs -->
    <div class="container">
      <Breadcrumbs :crumbs="breadcrumbs" />
    </div>

    <!-- Page Header -->
    <section class="page-header">
      <div class="container">
        <h1 class="page-title">Наши авторы</h1>
        <p class="page-description">
          Познакомьтесь с талантливыми создателями квестов. 
          Профессионалы с опытом создания незабываемых приключений.
        </p>
      </div>
    </section>

    <!-- Top Authors Section -->
    <section class="top-authors-section">
      <div class="container">
        <h2 class="section-title">🏆 Топ авторов</h2>
        <p class="section-description">Лучшие создатели квестов по рейтингу и количеству заказов</p>

        <div v-if="topAuthorsLoading" class="loading-state">
          <Loader text="Загружаем топ авторов..." />
        </div>

        <div v-else class="top-authors-grid">
          <AuthorCard
            v-for="(author, index) in topAuthors"
            :key="author.id"
            :author="author"
            :rank="index + 1"
          />
        </div>
      </div>
    </section>

    <!-- All Authors Section -->
    <section class="all-authors-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Все авторы</h2>
          <div class="sorting">
            <label for="sort">Сортировка:</label>
            <select id="sort" v-model="sortBy" @change="handleSortChange" class="sort-select">
              <option value="rating">По рейтингу</option>
              <option value="templates">По количеству шаблонов</option>
              <option value="orders">По заказам</option>
              <option value="newest">Новые</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="authorsLoading" class="loading-state">
          <Loader text="Загружаем авторов..." size="large" />
        </div>

        <!-- Empty State -->
        <div v-else-if="authors.length === 0" class="empty-state">
          <div class="empty-icon">👥</div>
          <h3>Авторы не найдены</h3>
          <p>Пока нет зарегистрированных авторов</p>
        </div>

        <!-- Authors Grid -->
        <div v-else class="authors-grid">
          <AuthorCard
            v-for="author in paginatedAuthors"
            :key="author.id"
            :author="author"
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

    <!-- Become Author CTA -->
    <section class="become-author-cta">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Хотите стать автором?</h2>
          <p class="cta-description">
            Создавайте квесты, делитесь опытом и зарабатывайте. 
            Присоединяйтесь к нашей команде профессиональных авторов!
          </p>
          <router-link to="/become-author" class="btn-cta">
            ✨ Стать автором
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuestStore } from '@/store'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import Loader from '@/components/common/Loader.vue'
import AuthorCard from '@/components/marketplace/AuthorCard.vue'
import Pagination from '@/components/common/Pagination.vue'

const router = useRouter()
const route = useRoute()
const questStore = useQuestStore()

const topAuthors = ref([])
const authors = ref([])
const topAuthorsLoading = ref(true)
const authorsLoading = ref(true)
const sortBy = ref('rating')
const currentPage = ref(1)
const itemsPerPage = 12

const breadcrumbs = [
  { label: 'Главная', to: '/' },
  { label: 'Авторы' }
]

const sortedAuthors = computed(() => {
  const sorted = [...authors.value]

  switch (sortBy.value) {
    case 'templates':
      return sorted.sort((a, b) => (b.published_templates || 0) - (a.published_templates || 0))
    case 'orders':
      return sorted.sort((a, b) => (b.total_orders || 0) - (a.total_orders || 0))
    case 'newest':
      return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    case 'rating':
    default:
      return sorted.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
  }
})

const totalPages = computed(() => {
  return Math.ceil(sortedAuthors.value.length / itemsPerPage)
})

const paginatedAuthors = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedAuthors.value.slice(start, end)
})

const loadData = async () => {
  try {
    // Загружаем топ авторов
    topAuthorsLoading.value = true
    topAuthors.value = await questStore.fetchTopAuthors(6)
    topAuthorsLoading.value = false

    // Загружаем всех авторов
    authorsLoading.value = true
    const response = await questStore.fetchAuthors()
    authors.value = response.data
    authorsLoading.value = false
  } catch (error) {
    console.error('Error loading authors:', error)
    topAuthorsLoading.value = false
    authorsLoading.value = false
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
    ...(sortBy.value !== 'rating' && { sort_by: sortBy.value }),
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

onMounted(() => {
  applyUrlParams()
  loadData()
})
</script>

<style scoped>
.authors-page {
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
  padding: 60px 0;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
}

.page-title {
  font-size: 3rem;
  font-weight: 900;
  color: #2d3748;
  margin: 0 0 16px 0;
}

.page-description {
  font-size: 1.25rem;
  color: #718096;
  margin: 0;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* Sections */
.top-authors-section,
.all-authors-section {
  padding: 80px 0;
}

.top-authors-section {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 12px 0;
  text-align: center;
}

.section-description {
  font-size: 1.1rem;
  color: #718096;
  text-align: center;
  margin: 0 0 48px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
}

.section-header .section-title {
  text-align: left;
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

.loading-state {
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
  margin: 0;
}

.top-authors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
}

.authors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
  margin-bottom: 48px;
}

/* Become Author CTA */
.become-author-cta {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 80px 0;
  text-align: center;
}

.cta-content {
  max-width: 700px;
  margin: 0 auto;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 900;
  margin: 0 0 16px 0;
}

.cta-description {
  font-size: 1.25rem;
  margin: 0 0 32px 0;
  opacity: 0.95;
  line-height: 1.6;
}

.btn-cta {
  display: inline-block;
  padding: 18px 48px;
  background: white;
  color: #667eea;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.2rem;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .page-description {
    font-size: 1rem;
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

  .top-authors-grid,
  .authors-grid {
    grid-template-columns: 1fr;
  }

  .cta-title {
    font-size: 2rem;
  }

  .cta-description {
    font-size: 1.1rem;
  }
}
</style>