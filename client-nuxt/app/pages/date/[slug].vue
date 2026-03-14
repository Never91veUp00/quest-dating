<template>
  <div class="template-detail">
    <div v-if="pending" class="loading-container">
      <Loader text="Загружаем квест..." size="large" />
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <div class="error-icon">😕</div>
        <h2>Квест не найден</h2>
        <p>{{ error.message }}</p>
        <NuxtLink to="/catalog" class="btn-back">← Вернуться в каталог</NuxtLink>
      </div>
    </div>

    <div v-else-if="date" class="template-content">
      <div class="container">
        <Breadcrumbs :crumbs="breadcrumbs" />
      </div>

      <section class="template-header">
        <div class="container">
          <div class="header-layout">
            <div class="header-gallery">
              <TemplateGallery :template="date" />
            </div>

            <div class="header-info">
              <NuxtLink
                v-if="date.category_slug"
                :to="`/categories/${date.category_slug}`"
                class="category-badge"
              >
                {{ date.category_icon }} {{ date.category_name }}
              </NuxtLink>

              <h1 class="template-title">{{ date.title }}</h1>
              <p v-if="date.tagline" class="template-tagline">{{ date.tagline }}</p>

              <div class="template-stats">
                <div class="stat-item">
                  <RatingStars :rating="date.rating || 0" size="medium" />
                  <span class="stat-text">
                    {{ formatRating(date.rating) }}
                    <span class="reviews-count">({{ date.reviews_count || 0 }} отзывов)</span>
                  </span>
                </div>
                <div class="stat-separator">·</div>
                <div class="stat-item">
                  <span class="stat-icon">📋</span>
                  <span class="stat-text">{{ date.orders_count || 0 }} заказов</span>
                </div>
                <div class="stat-separator">·</div>
                <div class="stat-item">
                  <span class="stat-icon">👁️</span>
                  <span class="stat-text">{{ formatNumber(date.views_count || 0) }} просмотров</span>
                </div>
              </div>

              <div class="quick-specs">
                <div class="spec">
                  <span class="spec-label">Сложность:</span>
                  <DifficultyBadge :difficulty="date.difficulty" />
                </div>
                <div class="spec">
                  <span class="spec-label">Длительность:</span>
                  <span class="spec-value">{{ formatDuration(date.duration_minutes) }}</span>
                </div>
                <div v-if="date.min_locations && date.max_locations" class="spec">
                  <span class="spec-label">Локации:</span>
                  <span class="spec-value">{{ date.min_locations }}-{{ date.max_locations }}</span>
                </div>
                <div class="spec">
                  <span class="spec-label">Тип:</span>
                  <span class="spec-value">{{ getLocationType(date.location_type) }}</span>
                </div>
              </div>

              <div v-if="date.tags?.length > 0" class="template-tags">
                <TagBadge v-for="tag in date.tags" :key="tag.id" :tag="tag" size="medium" />
              </div>

              <div class="cta-section">
                <div class="price-block">
                  <div class="price-label">Стоимость</div>
                  <PriceTag :price="date.base_price || 0" :is-free="date.is_free" />
                </div>
                <NuxtLink :to="`/order/${date.slug}`" class="btn-order" data-testid="order-button">
                  🎯 Заказать свидание-квест
                </NuxtLink>
                <p class="cta-hint">Влад адаптирует его персонально под вас</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="template-description">
        <div class="container">
          <h2 class="section-title">Описание квеста</h2>
          <div class="description-content" v-html="formattedDescription"></div>
        </div>
      </section>

      <section v-if="date.features" class="template-features-section">
        <div class="container">
          <TemplateFeatures :template="date" />
        </div>
      </section>

      <section v-if="date.structure" class="template-structure-section">
        <div class="container">
          <TemplateStructure :template="date" />
        </div>
      </section>

      <section v-if="authorData" class="template-author-section">
        <div class="container">
          <TemplateAuthor :author="authorData" />
        </div>
      </section>

      <section class="template-reviews-section">
        <div class="container">
          <TemplateReviews :template-id="date.id" />
        </div>
      </section>

      <section class="similar-templates-section">
        <div class="container">
          <SimilarTemplates :template-slug="date.slug" />
        </div>
      </section>

      <OrderCTA :template="date" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'

const route = useRoute()
const { getDate } = useDatesApi()
const { post } = useApi()

const { data: dateRaw, pending, error } = await useAsyncData(
  `date-${route.params.slug}`,
  () => getDate(route.params.slug)
)

const date = computed(() => dateRaw.value?.data ?? dateRaw.value ?? null)

// Инкремент просмотров только на клиенте — не влияет на SSR-рендер
onMounted(() => {
  post(`/templates/${route.params.slug}/view`).catch(() => {})
})

const SITE_URL = 'https://questdating.ru'

// Превращает относительный путь (/uploads/...) в абсолютный URL для og:image и JSON-LD
const absoluteImageUrl = (path) => {
  if (!path) return `${SITE_URL}/og-image.jpg`
  if (path.startsWith('http')) return path
  return `${SITE_URL}${path}`
}

useSeoMeta({
  title:         () => date.value ? `${date.value.title} — свидание-квест | Quest Dating` : 'Квест | Quest Dating',
  description:   () => date.value?.tagline || date.value?.description?.substring(0, 160),
  ogTitle:       () => date.value?.title,
  ogDescription: () => date.value?.tagline || date.value?.description?.substring(0, 160),
  ogImage:       () => absoluteImageUrl(date.value?.cover_image),
  ogType:        'product',
})

// useServerHead — выполняется только при SSR, не включается в клиентский payload
// поэтому devalue не пытается сериализовать @ ключи JSON-LD
if (date.value) {
  useServerHead({
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name:        date.value.title,
        description: date.value.tagline || date.value.description?.substring(0, 160),
        image:       absoluteImageUrl(date.value.cover_image),
        offers: {
          '@type':       'Offer',
          price:         date.value.is_free ? 0 : (date.value.base_price || 0) / 100,
          priceCurrency: 'RUB',
          availability:  'https://schema.org/InStock',
        },
        ...(date.value.rating && {
          aggregateRating: {
            '@type':     'AggregateRating',
            ratingValue: parseFloat(date.value.rating).toFixed(1),
            reviewCount: date.value.reviews_count || 0,
          }
        })
      })
    }]
  })
}

const authorData = computed(() => {
  if (!date.value) return null
  return {
    id:              date.value.author_id,
    username:        date.value.author_username || 'unknown',
    display_name:    date.value.author_name     || 'Влад Петров',
    avatar_url:      date.value.author_avatar,
    bio:             date.value.author_bio,
    total_templates: date.value.author_total_templates || 0,
    average_rating:  date.value.author_average_rating  || 0,
  }
})

const breadcrumbs = computed(() => {
  const crumbs = [
    { label: 'Главная', to: '/' },
    { label: 'Шаблоны свидания-квестов', to: '/catalog' },
  ]
  if (date.value) {
    if (date.value.category_name && date.value.category_slug) {
      crumbs.push({ label: date.value.category_name, to: `/categories/${date.value.category_slug}` })
    }
    crumbs.push({ label: date.value.title })
  }
  return crumbs
})

const formattedDescription = computed(() => {
  if (!date.value?.description) return ''
  const withBreaks = date.value.description.replace(/\n/g, '<br>')
  if (import.meta.server) return withBreaks
  const DOMPurify = window.__dompurify_cache ?? null
  if (!DOMPurify) return withBreaks
  return DOMPurify.sanitize(withBreaks)
})

const getLocationType = (type) => ({
  city:      'По городу',
  park:      'Парк',
  indoor:    'В помещении',
  universal: 'Универсальный',
}[type] || type)

function formatRating(rating, decimals = 1) {
  if (rating === null || rating === undefined) return 'Нет оценок'
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating
  if (isNaN(numRating)) return 'Нет оценок'
  return numRating.toFixed(decimals)
}

function formatNumber(num) {
  if (!num || num === 0) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}

function formatDuration(minutes) {
  if (!minutes || minutes === 0) return 'Не указано'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) return `${hours}ч ${mins}м`
  if (hours > 0) return `${hours}ч`
  return `${mins}м`
}
</script>

<script>
export default {
  mounted() {
    import('dompurify').then(m => {
      if (typeof window !== 'undefined') window.__dompurify_cache = m.default
    })
  }
}
</script>

<style scoped>
.template-detail { min-height: 100vh; background: #f7fafc; }
.template-content { padding-top: 80px; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.loading-container, .error-container { display: flex; justify-content: center; align-items: center; min-height: 60vh; padding: 40px 20px; }
.error-content { text-align: center; max-width: 500px; }
.error-icon { font-size: 5rem; margin-bottom: 24px; }
.error-content h2 { font-size: 2rem; font-weight: 700; color: #2d3748; margin: 0 0 12px 0; }
.error-content p { color: #718096; margin: 0 0 32px 0; }
.btn-back { display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; transition: all 0.3s; }
.btn-back:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
.template-header { background: white; padding: 40px 0; border-bottom: 1px solid #e2e8f0; }
.header-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
.header-gallery { position: sticky; top: 100px; align-self: flex-start; }
.header-info { display: flex; flex-direction: column; gap: 24px; }
.category-badge { display: inline-block; width: fit-content; padding: 8px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px; font-size: 0.9rem; font-weight: 600; text-decoration: none; transition: all 0.3s; }
.category-badge:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
.template-title { font-size: 2.5rem; font-weight: 900; color: #2d3748; margin: 0; line-height: 1.2; }
.template-tagline { font-size: 1.25rem; color: #718096; margin: 0; line-height: 1.5; }
.template-stats { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 20px 0; border-top: 2px solid #e2e8f0; border-bottom: 2px solid #e2e8f0; }
.stat-item { display: flex; align-items: center; gap: 8px; }
.stat-icon { font-size: 1.2rem; }
.stat-text { color: #4a5568; font-weight: 500; }
.reviews-count { color: #718096; font-weight: 400; }
.stat-separator { color: #cbd5e0; }
.quick-specs { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 20px; background: #f7fafc; border-radius: 12px; }
.spec { display: flex; align-items: center; gap: 12px; }
.spec-label { color: #718096; font-size: 0.9rem; font-weight: 500; }
.spec-value { color: #2d3748; font-weight: 600; }
.template-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.cta-section { display: flex; flex-direction: column; gap: 16px; padding: 24px; background: linear-gradient(135deg, #f7fafc, #edf2f7); border-radius: 12px; border: 2px solid #e2e8f0; }
.price-block { text-align: center; }
.price-label { font-size: 0.9rem; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
.btn-order { padding: 18px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 12px; font-size: 1.25rem; font-weight: 700; text-align: center; transition: all 0.3s; box-shadow: 0 6px 20px rgba(102,126,234,0.4); display: block; }
.btn-order:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(102,126,234,0.5); }
.cta-hint { text-align: center; color: #718096; font-size: 0.9rem; margin: 0; }
.template-description, .template-features-section, .template-structure-section, .template-author-section, .template-reviews-section, .similar-templates-section { padding: 60px 0; }
.template-description { background: white; }
.section-title { font-size: 2rem; font-weight: 800; color: #2d3748; margin: 0 0 32px 0; }
.description-content { font-size: 1.1rem; line-height: 1.8; color: #4a5568; max-width: 800px; }
@media (max-width: 1024px) {
  .header-layout { grid-template-columns: 1fr; gap: 40px; }
  .header-gallery { position: static; }
}
@media (max-width: 768px) {
  .template-title { font-size: 2rem; }
  .quick-specs { grid-template-columns: 1fr; }
  .cta-section { padding: 20px; }
}
</style>