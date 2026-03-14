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
                <ClientOnly>
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
                </ClientOnly>
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
                  Заказать свидание-квест
                </NuxtLink>
                <p class="cta-hint">Лиза адаптирует его персонально под вашу пару</p>
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

      <!-- FAQ — rich snippet в выдаче -->
      <section class="template-faq-section">
        <div class="container">
          <h2 class="section-title">Частые вопросы</h2>
          <div class="faq-list">
            <details v-for="item in faqItems" :key="item.q" class="faq-item">
              <summary class="faq-question">{{ item.q }}</summary>
              <p class="faq-answer">{{ item.a }}</p>
            </details>
          </div>
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

// FAQ — общие вопросы + динамическая цена
const faqItems = computed(() => {
  const price = date.value?.is_free
    ? 'бесплатно'
    : date.value?.base_price
      ? `от ${Math.round(date.value.base_price / 100).toLocaleString('ru')} ₽`
      : 'уточняйте при заказе'
  return [
    {
      q: 'Что такое свидание-квест?',
      a: 'Это персональный сценарий-приключение для двоих: цепочка заданий, подсказок и сюрпризов, созданная специально под вашу пару. Не escape-room — вы проходите его в своём городе, в своём темпе.'
    },
    {
      q: 'Как долго создаётся квест?',
      a: 'За 24 часа с момента подтверждения заказа и получения ответов на вопросы о вашей паре.'
    },
    {
      q: 'Сколько стоит свидание-квест?',
      a: `Этот квест стоит ${price}. Лиза адаптирует его под вас — ваш город, ваши места, ваша история.`
    },
    {
      q: 'Можно ли изменить сценарий под наш город?',
      a: 'Да, это и есть главная особенность. Лиза переписывает локации, задания и детали под вашу пару — вы не получите стандартный шаблон.'
    },
    {
      q: 'Что если квест не понравится?',
      a: 'Лиза доработает его или вернёт оплату — в течение 7 дней с момента получения, если квест не был пройден.'
    }
  ]
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
    script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type':    'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Главная', item: 'https://questdating.ru/' },
          { '@type': 'ListItem', position: 2, name: 'Сценарии свиданий-квестов', item: 'https://questdating.ru/catalog' },
          ...(date.value.category_name ? [{ '@type': 'ListItem', position: 3, name: date.value.category_name, item: `https://questdating.ru/categories/${date.value.category_slug}` }] : []),
          { '@type': 'ListItem', position: date.value.category_name ? 4 : 3, name: date.value.title, item: `https://questdating.ru/date/${date.value.slug}` },
        ]
      })
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type':    'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'Что такое свидание-квест?',
            acceptedAnswer: { '@type': 'Answer', text: 'Персональный сценарий-приключение для двоих: цепочка заданий, подсказок и сюрпризов, созданная под вашу пару. Проходится в вашем городе, в своём темпе.' } },
          { '@type': 'Question', name: 'Как долго создаётся квест?',
            acceptedAnswer: { '@type': 'Answer', text: 'За 24 часа с момента подтверждения заказа.' } },
          { '@type': 'Question', name: 'Можно ли изменить сценарий под наш город?',
            acceptedAnswer: { '@type': 'Answer', text: 'Да — Лиза Петри переписывает локации и задания под вашу пару.' } },
          { '@type': 'Question', name: 'Что если квест не понравится?',
            acceptedAnswer: { '@type': 'Answer', text: 'Лиза доработает или вернёт оплату в течение 7 дней, если квест не был пройден.' } },
        ]
      })
    },
    {
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
    display_name:    date.value.author_name     || 'Лиза Петри',
    avatar_url:      date.value.author_avatar,
    bio:             date.value.author_bio,
    total_templates: date.value.author_total_templates || 0,
    average_rating:  date.value.author_average_rating  || 0,
  }
})

const breadcrumbs = computed(() => {
  const crumbs = [
    { label: 'Главная', to: '/' },
    { label: 'Сценарии свиданий-квестов', to: '/catalog' },
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
.template-content { padding-top: 0; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.loading-container, .error-container { display: flex; justify-content: center; align-items: center; min-height: 60vh; padding: 40px 20px; }
.error-content { text-align: center; max-width: 500px; }
.error-icon { font-size: 5rem; margin-bottom: 24px; }
.error-content h2 { font-size: 2rem; font-weight: 700; color: #2d3748; margin: 0 0 12px 0; }
.error-content p { color: #718096; margin: 0 0 32px 0; }
.btn-back { display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 600; transition: all 0.3s; letter-spacing: 0.02em; }
.btn-back:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
.template-header { background: white; padding: 40px 0; border-bottom: 1px solid #e2e8f0; }
.header-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
.header-gallery { position: sticky; top: 100px; align-self: flex-start; }
.header-info { display: flex; flex-direction: column; gap: 24px; }
.category-badge { display: inline-block; width: fit-content; padding: 8px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 20px; font-size: 0.9rem; font-weight: 600; text-decoration: none; transition: all 0.3s; }
.category-badge:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
.template-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #2d3748;
  margin: 0;
  line-height: 1.15;
}
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
.btn-order { padding: 18px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 50px; font-size: 1.1rem; font-weight: 600; text-align: center; transition: all 0.3s; box-shadow: 0 6px 20px rgba(102,126,234,0.4); display: block; letter-spacing: 0.02em; }
.btn-order:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(102,126,234,0.5); }
.cta-hint { text-align: center; color: #718096; font-size: 0.9rem; margin: 0; }
.template-description, .template-features-section, .template-structure-section, .template-author-section, .template-reviews-section, .similar-templates-section { padding: 60px 0; }
.template-description { background: white; }
.section-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 2rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #2d3748;
  margin: 0 0 32px 0;
}
.description-content { font-size: 1.1rem; line-height: 1.8; color: #4a5568; max-width: 800px; }
@media (max-width: 1024px) {
  .header-layout { grid-template-columns: 1fr; gap: 40px; }
  .header-gallery { position: static; }
}
@media (max-width: 768px) {
  .template-title { font-size: 1.8rem; }
  .quick-specs { grid-template-columns: 1fr; }
  .cta-section { padding: 20px; }
}
.template-faq-section { padding: 60px 0; background: #f7fafc; }
.faq-list { max-width: 800px; display: flex; flex-direction: column; gap: 12px; }
.faq-item { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.faq-question { padding: 20px 24px; font-weight: 600; color: #2d3748; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; font-size: 1rem; }
.faq-question::-webkit-details-marker { display: none; }
.faq-question::after { content: "+"; font-size: 1.4rem; color: #667eea; font-weight: 300; transition: transform 0.2s; }
.faq-item[open] .faq-question::after { transform: rotate(45deg); }
.faq-answer { padding: 0 24px 20px; color: #4a5568; line-height: 1.7; margin: 0; }
</style>