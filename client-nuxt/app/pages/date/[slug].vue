<template>
  <div class="qp" :style="{ background: '#0a0a0f' }">

    <!-- Загрузка -->
    <div v-if="pending" class="qp__loading">
      <Loader text="Загружаем квест..." />
    </div>

    <!-- Ошибка -->
    <div v-else-if="error || !date" class="qp__error">
      <div class="qp__error-icon">😕</div>
      <h2>Квест не найден</h2>
      <NuxtLink to="/catalog" class="qp__back">← В каталог</NuxtLink>
    </div>

    <template v-else>

      <!-- ── HERO: фото на всю ширину ── -->
      <section class="qp__hero">
        <div class="qp__hero-img">
          <img
            v-if="isValidImageSrc(date.cover_image)"
            :src="date.cover_image"
            :alt="date.title"
            loading="eager"
            decoding="async"
            class="qp__hero-photo"
          />
          <div v-else class="qp__hero-fallback" :style="fallbackStyle"></div>
          <div class="qp__hero-overlay"></div>
        </div>

        <!-- Навигация поверх фото -->
        <div class="qp__hero-nav">
          <NuxtLink to="/catalog" class="qp__hero-back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </NuxtLink>
          <span class="qp__hero-cat" v-if="date.category_name">{{ date.category_name }}</span>
        </div>

        <!-- Заголовок поверх фото -->
        <div class="qp__hero-title-wrap">
          <div class="qp__hero-badges">
            <span class="qp__badge" :style="diffBadgeStyle">{{ diffLabel }}</span>
            <span v-if="date.rating > 0" class="qp__badge qp__badge--rating">
              ★ {{ parseFloat(date.rating).toFixed(1) }}
            </span>
          </div>
          <h1 class="qp__hero-title">{{ date.title }}</h1>
          <p v-if="date.tagline" class="qp__hero-tagline">{{ date.tagline }}</p>
        </div>
      </section>

      <!-- ── БЫСТРЫЕ ХАРАКТЕРИСТИКИ ── -->
      <section class="qp__specs">
        <div class="qp__container">
          <div class="qp__specs-grid">
            <div class="qp__spec">
              <span class="qp__spec-icon">⏱</span>
              <span class="qp__spec-val">{{ formatDuration(date.duration_minutes) }}</span>
              <span class="qp__spec-lbl">длительность</span>
            </div>
            <div class="qp__spec">
              <span class="qp__spec-icon">📍</span>
              <span class="qp__spec-val">{{ locationLabel }}</span>
              <span class="qp__spec-lbl">место</span>
            </div>
            <div class="qp__spec">
              <span class="qp__spec-icon">⭐</span>
              <span class="qp__spec-val">{{ date.reviews_count || 0 }}</span>
              <span class="qp__spec-lbl">отзывов</span>
            </div>
            <div class="qp__spec">
              <span class="qp__spec-icon">🛒</span>
              <span class="qp__spec-val">{{ date.orders_count || 0 }}</span>
              <span class="qp__spec-lbl">заказов</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── ОПИСАНИЕ ── -->
      <section class="qp__section">
        <div class="qp__container">
          <h2 class="qp__section-title">О квесте</h2>
          <div class="qp__desc" v-html="formattedDescription"></div>
        </div>
      </section>

      <!-- ── ЧТО ВХОДИТ ── -->
      <section v-if="date.features?.length" class="qp__section qp__section--alt">
        <div class="qp__container">
          <h2 class="qp__section-title">Что входит</h2>
          <div class="qp__features">
            <div v-for="f in date.features" :key="f" class="qp__feature">
              <span class="qp__feature-dot"></span>
              {{ f }}
            </div>
          </div>
        </div>
      </section>

      <!-- ── СТРУКТУРА ── -->
      <section v-if="date.structure" class="qp__section">
        <div class="qp__container">
          <TemplateStructure :template="date" />
        </div>
      </section>

      <!-- ── АВТОР ── -->
      <section v-if="authorData" class="qp__section qp__section--alt">
        <div class="qp__container">
          <TemplateAuthor :author="authorData" />
        </div>
      </section>

      <!-- ── ОТЗЫВЫ ── -->
      <section class="qp__section">
        <div class="qp__container">
          <TemplateReviews :template-id="date.id" />
        </div>
      </section>

      <!-- ── ПОХОЖИЕ ── -->
      <section class="qp__section qp__section--alt">
        <div class="qp__container">
          <SimilarTemplates :template-slug="date.slug" />
        </div>
      </section>

      <!-- ── STICKY CTA ── -->
      <div class="qp__sticky">
        <div class="qp__sticky-inner">
          <div class="qp__sticky-price">
            <span class="qp__sticky-label">Стоимость</span>
            <span class="qp__sticky-amount">{{ date.is_free ? 'Бесплатно' : formatPrice(date.base_price) }}</span>
          </div>
          <NuxtLink :to="`/order/${date.slug}`" class="qp__sticky-btn">
            Заказать квест →
          </NuxtLink>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'

const route = useRoute()
const { getDate } = useDatesApi()
const { post } = useApi()
const { isValidImageSrc } = useImageFallback()

const { data: dateRaw, pending, error } = await useAsyncData(
  `date-${route.params.slug}`,
  () => getDate(route.params.slug)
)
const date = computed(() => dateRaw.value?.data ?? dateRaw.value ?? null)

onMounted(() => {
  post(`/templates/${route.params.slug}/view`).catch(() => {})
})

const SITE_URL = 'https://questdating.ru'
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

if (date.value) {
  useServerHead({
    script: [{ type: 'application/ld+json', innerHTML: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Product',
      name: date.value.title,
      description: date.value.tagline || date.value.description?.substring(0, 160),
      image: absoluteImageUrl(date.value.cover_image),
      offers: { '@type': 'Offer', price: date.value.is_free ? 0 : (date.value.base_price || 0) / 100, priceCurrency: 'RUB', availability: 'https://schema.org/InStock' },
      ...(date.value.rating && { aggregateRating: { '@type': 'AggregateRating', ratingValue: parseFloat(date.value.rating).toFixed(1), reviewCount: date.value.reviews_count || 0 } })
    })}]
  })
}

const DIFF = {
  easy:   { label: 'Лёгкий',  bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', color: '#6ee7b7', glow: '#10b981' },
  medium: { label: 'Средний', bg: 'rgba(212,175,55,0.15)',  border: 'rgba(212,175,55,0.4)',  color: '#fcd34d', glow: '#d4af37' },
  hard:   { label: 'Сложный', bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.4)',  color: '#fdba74', glow: '#f97316' },
  expert: { label: 'Эксперт', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.4)',   color: '#fca5a5', glow: '#ef4444' },
}
const diff = computed(() => DIFF[date.value?.difficulty] || DIFF.medium)
const diffLabel = computed(() => diff.value.label)
const diffBadgeStyle = computed(() => ({ background: diff.value.bg, borderColor: diff.value.border, color: diff.value.color }))
const fallbackStyle = computed(() => ({ background: `radial-gradient(ellipse at top right, ${diff.value.glow}30 0%, #0a0a0f 70%)` }))

const locationLabel = computed(() => ({
  indoor: 'Дома', city: 'По городу', park: 'Парк', universal: 'Любое'
}[date.value?.location_type] || '—'))

const authorData = computed(() => {
  if (!date.value) return null
  return {
    id: date.value.author_id,
    username: date.value.author_username || 'unknown',
    display_name: date.value.author_name || 'Лиза Петри',
    avatar_url: date.value.author_avatar,
    bio: date.value.author_bio,
    total_templates: date.value.author_total_templates || 0,
    average_rating: date.value.author_average_rating || 0,
  }
})

const formattedDescription = computed(() => {
  if (!date.value?.description) return ''
  const withBreaks = date.value.description.replace(/\n/g, '<br>')
  if (import.meta.server) return withBreaks
  const DOMPurify = window.__dompurify_cache ?? null
  if (!DOMPurify) return withBreaks
  return DOMPurify.sanitize(withBreaks)
})

function formatDuration(minutes) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60), m = minutes % 60
  if (h > 0 && m > 0) return `${h}ч ${m}м`
  if (h > 0) return `${h}ч`
  return `${m}м`
}
function formatPrice(v) {
  return v ? `${Math.round(Number(v) / 100).toLocaleString('ru')} ₽` : '—'
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
.qp { min-height: 100vh; color: #f0ede8; padding-bottom: 90px; }
.qp__container { max-width: 600px; margin: 0 auto; padding: 0 16px; }
@media (min-width: 768px) { .qp__container { max-width: 900px; padding: 0 24px; } }
@media (min-width: 1200px) { .qp__container { max-width: 1100px; } }

/* Loading / Error */
.qp__loading, .qp__error {
  min-height: 60vh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 16px; padding: 40px 20px;
}
.qp__error-icon { font-size: 3rem; }
.qp__error h2 { font-size: 1.4rem; font-weight: 800; color: #f0ede8; margin: 0; }
.qp__back {
  color: #d4af37; text-decoration: none; font-weight: 700;
  border: 1px solid rgba(212,175,55,0.3); padding: 10px 20px; border-radius: 100px;
}

/* Hero */
.qp__hero {
  position: relative; height: 55svh; min-height: 320px; max-height: 500px;
  overflow: hidden; background: #0f0f14;
}
@media (min-width: 768px) { .qp__hero { height: 60svh; max-height: 600px; } }

.qp__hero-img { position: absolute; inset: 0; }
.qp__hero-photo { width: 100%; height: 100%; object-fit: cover; }
.qp__hero-fallback { width: 100%; height: 100%; }
.qp__hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%);
}

.qp__hero-nav {
  position: absolute; top: 0; left: 0; right: 0;
  padding: max(20px, calc(env(safe-area-inset-top) + 16px)) 16px 0;
  display: flex; align-items: center; justify-content: space-between; z-index: 2;
}
.qp__hero-back {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  color: #fff; backdrop-filter: blur(8px); text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}
.qp__hero-cat {
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
  color: rgba(255,255,255,0.7); background: rgba(0,0,0,0.3);
  padding: 4px 10px; border-radius: 100px; backdrop-filter: blur(8px);
}

.qp__hero-title-wrap {
  position: absolute; bottom: 0; left: 0; right: 0; z-index: 2;
  padding: 20px 16px;
}
@media (min-width: 768px) { .qp__hero-title-wrap { padding: 24px; } }

.qp__hero-badges { display: flex; gap: 8px; margin-bottom: 10px; }
.qp__badge {
  font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
  padding: 3px 8px; border-radius: 100px; border: 1px solid; backdrop-filter: blur(8px);
}
.qp__badge--rating { background: rgba(212,175,55,0.15); border-color: rgba(212,175,55,0.4); color: #fcd34d; }

.qp__hero-title {
  font-size: clamp(1.6rem, 6vw, 2.4rem); font-weight: 900;
  color: #fff; margin: 0 0 6px; line-height: 1.1; letter-spacing: -0.02em;
}
.qp__hero-tagline { font-size: 0.95rem; color: rgba(255,255,255,0.65); margin: 0; line-height: 1.5; }

/* Specs */
.qp__specs {
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.qp__specs-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  padding: 16px 0;
}
.qp__spec {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 8px 4px; border-right: 1px solid rgba(255,255,255,0.06);
}
.qp__spec:last-child { border-right: none; }
.qp__spec-icon { font-size: 16px; }
.qp__spec-val { font-size: 0.85rem; font-weight: 800; color: #f0ede8; }
.qp__spec-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(240,237,232,0.35); }

/* Sections */
.qp__section { padding: 28px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.qp__section--alt { background: rgba(255,255,255,0.02); }
.qp__section-title {
  font-size: 1.2rem; font-weight: 900; color: #f0ede8;
  margin: 0 0 16px; letter-spacing: -0.01em;
}

/* Description */
.qp__desc { font-size: 0.95rem; color: rgba(240,237,232,0.7); line-height: 1.7; }

/* Features */
.qp__features { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
@media (min-width: 640px) { .qp__features { grid-template-columns: repeat(3, 1fr); } }
.qp__feature {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.82rem; color: rgba(240,237,232,0.65);
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px; padding: 10px 12px;
}
.qp__feature-dot { width: 6px; height: 6px; border-radius: 50%; background: #d4af37; flex-shrink: 0; }

/* Sticky CTA */
.qp__sticky {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 900;
  background: rgba(10,10,15,0.95); backdrop-filter: blur(20px);
  border-top: 1px solid rgba(212,175,55,0.2);
  padding: 12px 16px max(12px, env(safe-area-inset-bottom));
}
.qp__sticky-inner {
  max-width: 600px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
@media (min-width: 768px) { .qp__sticky-inner { max-width: 900px; } }
.qp__sticky-price { display: flex; flex-direction: column; }
.qp__sticky-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(240,237,232,0.4); }
.qp__sticky-amount { font-size: 1.3rem; font-weight: 900; color: #d4af37; letter-spacing: -0.02em; }
.qp__sticky-btn {
  background: #d4af37; color: #0a0a0f;
  padding: 13px 24px; border-radius: 100px;
  font-weight: 800; font-size: 0.95rem; text-decoration: none;
  white-space: nowrap; -webkit-tap-highlight-color: transparent;
  transition: opacity 0.2s; flex-shrink: 0;
}
.qp__sticky-btn:hover { opacity: 0.9; }
</style>