<template>
  <div class="template-detail">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <Loader text="Загружаем шаблон..." size="large" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <div class="error-icon">😞</div>
        <h2>Шаблон не найден</h2>
        <p>{{ error }}</p>
        <router-link to="/templates" class="btn-back">
          ← Вернуться к каталогу
        </router-link>
      </div>
    </div>

    <!-- Template Content -->
    <div v-else-if="template" class="template-content">
      <!-- Breadcrumbs -->
      <div class="container">
        <Breadcrumbs :crumbs="breadcrumbs" />
      </div>

      <!-- Header Section -->
      <section class="template-header">
        <div class="container">
          <div class="header-layout">
            <!-- Gallery -->
            <div class="header-gallery">
              <TemplateGallery
                v-if="template"
                :template="template"
              />
            </div>

            <!-- Info -->
            <div class="header-info">
              <!-- Category Badge -->
              <router-link
                v-if="template.category_slug"
                :to="`/categories/${template.category_slug}`"
                class="category-badge"
              >
                {{ template.category_icon }} {{ template.category_name }}
              </router-link>

              <!-- Title -->
              <h1 class="template-title">{{ template.title }}</h1>

              <!-- Tagline -->
              <p v-if="template.tagline" class="template-tagline">{{ template.tagline }}</p>

              <!-- Rating and Stats -->
              <div class="template-stats">
                <div class="stat-item">
                  <RatingStars :rating="template.rating || 0" size="medium" />
                  <span class="stat-text">
                    {{ formatRating(template.rating) }}
                    <span class="reviews-count">({{ template.reviews_count || 0 }} отзывов)</span>
                  </span>
                </div>
                <div class="stat-separator">•</div>
                <div class="stat-item">
                  <span class="stat-icon">✅</span>
                  <span class="stat-text">{{ template.orders_count || 0 }} заказов</span>
                </div>
                <div class="stat-separator">•</div>
                <div class="stat-item">
                  <span class="stat-icon">👁️</span>
                  <span class="stat-text">{{ formatNumber(template.views_count || 0) }} просмотров</span>
                </div>
              </div>

              <!-- Quick Specs -->
              <div class="quick-specs">
                <div class="spec">
                  <span class="spec-label">Сложность:</span>
                  <DifficultyBadge :difficulty="template.difficulty" />
                </div>
                <div class="spec">
                  <span class="spec-label">Длительность:</span>
                  <span class="spec-value">{{ formatDuration(template.duration_minutes) }}</span>
                </div>
                <div v-if="template.min_locations && template.max_locations" class="spec">
                  <span class="spec-label">Локаций:</span>
                  <span class="spec-value">{{ template.min_locations }}-{{ template.max_locations }}</span>
                </div>
                <div class="spec">
                  <span class="spec-label">Тип:</span>
                  <span class="spec-value">{{ getLocationType(template.location_type) }}</span>
                </div>
              </div>

              <!-- Tags -->
              <div v-if="template.tags && template.tags.length > 0" class="template-tags">
                <TagBadge
                  v-for="tag in template.tags"
                  :key="tag.id"
                  :tag="tag"
                  size="medium"
                />
              </div>

              <!-- Price and CTA -->
              <div class="cta-section">
                <div class="price-block">
                  <div class="price-label">Стоимость</div>
                  <PriceTag :price="template.base_price || 0" :is-free="template.is_free" />
                </div>
                <router-link
                  :to="`/order/${template.slug}`"
                  class="btn-order"
                >
                  🎯 Заказать квест
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Description Section -->
      <section class="template-description">
        <div class="container">
          <h2 class="section-title">Описание квеста</h2>
          <div class="description-content" v-html="formattedDescription"></div>
        </div>
      </section>

      <!-- Features Section -->
      <section v-if="template.features" class="template-features-section">
        <div class="container">
          <TemplateFeatures :template="template" />
        </div>
      </section>

      <!-- Structure Section -->
      <section v-if="template.structure" class="template-structure-section">
        <div class="container">
          <TemplateStructure :template="template" />
        </div>
      </section>

      <!-- Author Section -->
      <section v-if="authorData" class="template-author-section">
        <div class="container">
          <TemplateAuthor :author="authorData" />
        </div>
      </section>

      <!-- Reviews Section -->
      <section class="template-reviews-section">
        <div class="container">
          <TemplateReviews
            :template-id="template.id"
          />
        </div>
      </section>

      <!-- Similar Templates Section -->
      <section class="similar-templates-section">
        <div class="container">
          <SimilarTemplates :template-slug="template.slug" />
        </div>
      </section>

      <!-- Sticky Order CTA -->
      <OrderCTA v-if="template" :template="template" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuestStore } from '@/store'
import { formatRating, formatNumber, formatDuration } from '@/utils/formatters'
import Breadcrumbs from '@/components/common/Breadcrumbs.vue'
import Loader from '@/components/common/Loader.vue'
import TemplateGallery from '@/components/template/TemplateGallery.vue'
import TemplateFeatures from '@/components/template/TemplateFeatures.vue'
import TemplateStructure from '@/components/template/TemplateStructure.vue'
import TemplateAuthor from '@/components/template/TemplateAuthor.vue'
import TemplateReviews from '@/components/template/TemplateReviews.vue'
import SimilarTemplates from '@/components/template/SimilarTemplates.vue'
import OrderCTA from '@/components/template/OrderCTA.vue'
import RatingStars from '@/components/marketplace/RatingStars.vue'
import DifficultyBadge from '@/components/marketplace/DifficultyBadge.vue'
import TagBadge from '@/components/marketplace/TagBadge.vue'
import PriceTag from '@/components/marketplace/PriceTag.vue'
import DOMPurify from 'dompurify'

const route = useRoute()
const questStore = useQuestStore()

const template = ref(null)
const loading = ref(true)
const error = ref(null)

// ← ДОБАВЛЕНО: Computed для данных автора
const authorData = computed(() => {
  if (!template.value) return null
  
  // Формируем объект автора из данных template
  return {
    id: template.value.author_id,
    username: template.value.author_username || 'unknown',
    display_name: template.value.author_name || 'Неизвестный автор',
    avatar_url: template.value.author_avatar,
    bio: template.value.author_bio,
    total_templates: template.value.author_total_templates || 0,
    average_rating: template.value.author_average_rating || 0
  }
})

const breadcrumbs = computed(() => {
  const crumbs = [
    { label: 'Главная', to: '/' },
    { label: 'Шаблоны', to: '/templates' }
  ]

  if (template.value) {
    if (template.value.category_name && template.value.category_slug) {
      crumbs.push({
        label: template.value.category_name,
        to: `/categories/${template.value.category_slug}`
      })
    }
    crumbs.push({
      label: template.value.title
    })
  }

  return crumbs
})

const formattedDescription = computed(() => {
  if (!template.value?.description) return ''
  const withBreaks = template.value.description.replace(/\n/g, '<br>')
  return DOMPurify.sanitize(withBreaks)
})

const getLocationType = (type) => {
  const types = {
    city: 'По городу',
    park: 'Парк',
    indoor: 'В помещении',
    universal: 'Универсальный'
  }
  return types[type] || type
}

const loadTemplate = async () => {
  loading.value = true
  error.value = null

  try {
    const slug = route.params.slug
    template.value = await questStore.fetchTemplate(slug)

    // Обновить meta tags
    if (template.value) {
      document.title = `${template.value.title} - Quest Dating`
      
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', template.value.tagline || template.value.description?.substring(0, 160))
      }
    }
  } catch (err) {
    error.value = err.message || 'Не удалось загрузить шаблон'
    console.error('Error loading template:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTemplate()
})
</script>

<style scoped>
.template-detail {
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

/* Header Section */
.template-header {
  background: white;
  padding: 40px 0;
  border-bottom: 1px solid #e2e8f0;
}

.header-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
}

.header-gallery {
  position: sticky;
  top: 100px;
  align-self: flex-start;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.category-badge {
  display: inline-block;
  width: fit-content;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
}

.category-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.template-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #2d3748;
  margin: 0;
  line-height: 1.2;
}

.template-tagline {
  font-size: 1.25rem;
  color: #718096;
  margin: 0;
  line-height: 1.5;
}

.template-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 20px 0;
  border-top: 2px solid #e2e8f0;
  border-bottom: 2px solid #e2e8f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-text {
  color: #4a5568;
  font-weight: 500;
}

.reviews-count {
  color: #718096;
  font-weight: 400;
}

.stat-separator {
  color: #cbd5e0;
}

.quick-specs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
}

.spec {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spec-label {
  color: #718096;
  font-size: 0.9rem;
  font-weight: 500;
}

.spec-value {
  color: #2d3748;
  font-weight: 600;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cta-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.price-block {
  text-align: center;
}

.price-label {
  font-size: 0.9rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.btn-order {
  padding: 18px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  transition: all 0.3s;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  display: block;
}

.btn-order:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.5);
}

/* Content Sections */
.template-description,
.template-features-section,
.template-structure-section,
.template-author-section,
.template-reviews-section,
.similar-templates-section {
  padding: 60px 0;
}

.template-description {
  background: white;
}

.section-title {
  font-size: 2rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 32px 0;
}

.description-content {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #4a5568;
  max-width: 800px;
}

/* Responsive */
@media (max-width: 1024px) {
  .header-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .header-gallery {
    position: static;
  }
}

@media (max-width: 768px) {
  .template-title {
    font-size: 2rem;
  }

  .template-tagline {
    font-size: 1.1rem;
  }

  .quick-specs {
    grid-template-columns: 1fr;
  }

  .cta-section {
    padding: 20px;
  }
}
</style>