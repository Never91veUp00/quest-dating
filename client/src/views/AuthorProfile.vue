<template>
  <div class="author-profile">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <Loader text="Загружаем профиль автора..." size="large" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <div class="error-icon">😞</div>
        <h2>Автор не найден</h2>
        <p>{{ error }}</p>
        <router-link to="/authors" class="btn-back">
          ← Вернуться к авторам
        </router-link>
      </div>
    </div>

    <!-- Author Content -->
    <div v-else-if="author" class="author-content">
      <!-- Breadcrumbs -->
      <div class="container">
        <Breadcrumbs :crumbs="breadcrumbs" />
      </div>

      <!-- Author Header -->
      <section class="author-header">
        <div class="container">
          <div class="header-content">
            <!-- Avatar -->
            <div class="author-avatar-wrapper">
              <img
                :src="author.avatar_url || '/images/avatars/default.jpg'"
                :alt="author.display_name"
                class="author-avatar"
              />
              <div v-if="author.is_verified" class="verified-badge" title="Верифицированный автор">
                ✓
              </div>
            </div>

            <!-- Info -->
            <div class="author-info">
              <h1 class="author-name">{{ author.display_name }}</h1>
              <div class="author-username">@{{ author.username }}</div>

              <!-- Bio -->
              <p v-if="author.bio" class="author-bio">{{ author.bio }}</p>

              <!-- Stats -->
              <div class="author-stats">
                <div class="stat">
                  <div class="stat-number">{{ author.published_templates || 0 }}</div>
                  <div class="stat-label">Шаблонов</div>
                </div>
                <div class="stat">
                  <div class="stat-number">
                    <RatingStars :rating="author.average_rating" size="small" />
                    {{ formatRating(author.average_rating) }}
                  </div>
                  <div class="stat-label">Рейтинг</div>
                </div>
                <div class="stat">
                  <div class="stat-number">{{ author.total_orders || 0 }}</div>
                  <div class="stat-label">Заказов</div>
                </div>
              </div>

              <!-- Social Links -->
              <div v-if="hasSocialLinks" class="author-social">
                <a
                  v-if="author.social_links?.instagram"
                  :href="author.social_links.instagram"
                  target="_blank"
                  rel="noopener"
                  class="social-link"
                  title="Instagram"
                >
                  📷 Instagram
                </a>
                <a
                  v-if="author.social_links?.telegram"
                  :href="author.social_links.telegram"
                  target="_blank"
                  rel="noopener"
                  class="social-link"
                  title="Telegram"
                >
                  ✈️ Telegram
                </a>
                <a
                  v-if="author.social_links?.vk"
                  :href="author.social_links.vk"
                  target="_blank"
                  rel="noopener"
                  class="social-link"
                  title="VK"
                >
                  🔵 VK
                </a>
                <a
                  v-if="author.website"
                  :href="author.website"
                  target="_blank"
                  rel="noopener"
                  class="social-link"
                  title="Сайт"
                >
                  🌐 Сайт
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Templates Section -->
      <section class="templates-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Шаблоны автора</h2>
            <div class="sorting">
              <label for="sort">Сортировка:</label>
              <select id="sort" v-model="sortBy" @change="handleSortChange" class="sort-select">
                <option value="newest">Новые</option>
                <option value="rating">По рейтингу</option>
                <option value="orders">По популярности</option>
              </select>
            </div>
          </div>

          <!-- Loading Templates -->
          <div v-if="templatesLoading" class="templates-loading">
            <Loader text="Загружаем шаблоны..." />
          </div>

          <!-- Empty State -->
          <div v-else-if="templates.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h3>Шаблонов пока нет</h3>
            <p>Этот автор еще не опубликовал шаблоны</p>
          </div>

          <!-- Templates Grid -->
          <div v-else class="templates-grid">
            <TemplateCard
              v-for="template in sortedTemplates"
              :key="template.id"
              :template="template"
            />
          </div>
        </div>
      </section>

      <!-- Reviews Section -->
      <section v-if="reviews.length > 0" class="reviews-section">
        <div class="container">
          <h2 class="section-title">Отзывы о работах автора</h2>
          <div class="reviews-grid">
            <ReviewCard
              v-for="review in reviews.slice(0, 6)"
              :key="review.id"
              :review="review"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuestStore } from '@/store'
import { formatRating } from '@/utils/formatters'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import Loader from '@/components/common/Loader.vue'
import TemplateCard from '@/components/marketplace/TemplateCard.vue'
import ReviewCard from '@/components/marketplace/ReviewCard.vue'
import RatingStars from '@/components/marketplace/RatingStars.vue'

const route = useRoute()
const questStore = useQuestStore()

const author = ref(null)
const templates = ref([])
const reviews = ref([])
const loading = ref(true)
const templatesLoading = ref(true)
const error = ref(null)
const sortBy = ref('newest')

const breadcrumbs = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Авторы', to: '/authors' },
  { label: author.value?.display_name || 'Автор' }
])

const hasSocialLinks = computed(() => {
  const links = author.value?.social_links
  return author.value?.website || (links && (links.instagram || links.telegram || links.vk))
})

const sortedTemplates = computed(() => {
  const sorted = [...templates.value]

  switch (sortBy.value) {
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    case 'orders':
      return sorted.sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0))
    case 'newest':
    default:
      return sorted.sort((a, b) =>
        new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at)
      )
  }
})

const loadAuthor = async () => {
  loading.value = true
  error.value = null

  try {
    const username = route.params.username
    const response = await questStore.fetchAuthor(username)
    author.value = response.author
    templates.value = response.templates || []

    // Собираем отзывы из всех шаблонов
    reviews.value = templates.value
      .flatMap(t => t.reviews || [])
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    // Обновить meta tags
    if (author.value) {
      document.title = `${author.value.display_name} - Автор квестов - Quest Dating`

      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute(
          'content',
          author.value.bio || `Профиль автора ${author.value.display_name}. ${author.value.published_templates || 0} опубликованных шаблонов квестов.`
        )
      }
    }
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить автора'
    console.error('Error loading author:', err)
  } finally {
    loading.value = false
    templatesLoading.value = false
  }
}

const handleSortChange = () => {
  // Сортировка происходит через computed
}

onMounted(() => {
  loadAuthor()
})
</script>

<style scoped>
.author-profile {
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

/* Author Header */
.author-header {
  background: white;
  padding: 60px 0;
  border-bottom: 1px solid #e2e8f0;
}

.header-content {
  display: flex;
  gap: 48px;
  align-items: flex-start;
}

.author-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.author-avatar {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  border: 6px solid #e2e8f0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.verified-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 48px;
  height: 48px;
  background: #48bb78;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  border: 6px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 3rem;
  font-weight: 900;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.author-username {
  font-size: 1.25rem;
  color: #718096;
  margin-bottom: 24px;
}

.author-bio {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #4a5568;
  margin: 0 0 32px 0;
  max-width: 700px;
}

.author-stats {
  display: flex;
  gap: 48px;
  padding: 24px 0;
  border-top: 2px solid #e2e8f0;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 24px;
}

.stat {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.author-social {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.social-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  text-decoration: none;
  color: #4a5568;
  font-weight: 600;
  transition: all 0.3s;
}

.social-link:hover {
  background: #edf2f7;
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
}

/* Templates Section */
.templates-section {
  padding: 80px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
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
  margin: 0;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
}

/* Reviews Section */
.reviews-section {
  padding: 80px 0;
  background: white;
  border-top: 1px solid #e2e8f0;
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 48px;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .author-avatar {
    width: 150px;
    height: 150px;
  }

  .author-name {
    font-size: 2rem;
  }

  .author-stats {
    justify-content: center;
    gap: 32px;
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

  .reviews-grid {
    grid-template-columns: 1fr;
  }
}
</style>