<template>
  <article
    class="tcard"
    @click="navigateToCard"
    @keydown.enter.prevent="navigateToCard"
    @keydown.space.prevent="navigateToCard"
    tabindex="0"
    role="link"
    :aria-label="template.title"
  >
    <!-- Фото-фон -->
    <div class="tcard__bg">
      <img
        v-if="!coverFailed && isValidImageSrc(template.cover_image)"
        :src="coverSrc"
        :alt="`${template.title} — свидание-квест для двоих`"
        loading="lazy"
        decoding="async"
        class="tcard__photo"
        @error="onCoverError"
      />
      <!-- Фолбэк без фото — цветной градиент по теме -->
      <div class="tcard__fallback" :style="fallbackStyle"></div>
      <!-- Тёмный оверлей поверх фото -->
      <div class="tcard__overlay"></div>
    </div>

    <!-- Содержимое -->
    <div class="tcard__body">

      <!-- Верх: бейджи -->
      <div class="tcard__top">
        <span class="tcard__badge" :style="difficultyStyle">
          {{ difficultyLabel }}
        </span>
        <span v-if="template.is_free" class="tcard__badge tcard__badge--free">Бесплатно</span>
        <button
          class="tcard__preview"
          @click.stop="emit('quickView', template)"
          aria-label="Быстрый просмотр"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/></svg>
        </button>
      </div>

      <!-- Низ: основная инфа -->
      <div class="tcard__bottom">
        <div class="tcard__cat">{{ template.category_name }}</div>
        <h3 class="tcard__title">{{ template.title }}</h3>
        <div class="tcard__meta">
          <span class="tcard__time">⏱ {{ formatDuration(template.duration_minutes) }}</span>
          <span v-if="template.rating > 0" class="tcard__rating">
            ★ {{ parseFloat(template.rating).toFixed(1) }}
          </span>
        </div>
        <div v-if="displayTags.length" class="tcard__tags">
          <span v-for="tag in displayTags" :key="tag.id" class="tcard__tag">{{ tag.name }}</span>
          <span v-if="extraTagsCount > 0" class="tcard__tag tcard__tag--more">+{{ extraTagsCount }}</span>
        </div>
        <div v-if="socialProof" class="tcard__social">🔥 {{ socialProof }}</div>
        <div class="tcard__price-row">
          <span class="tcard__price">
            {{ template.is_free ? 'Бесплатно' : formatPrice(template.base_price) }}
          </span>
          <NuxtLink
            :to="`/date/${template.slug}`"
            class="tcard__btn"
            @click.stop
          >Смотреть →</NuxtLink>
        </div>
      </div>

    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  template: { type: Object, required: true }
})
const emit = defineEmits(['quickView'])

const { withFallback, isValidImageSrc, PLACEHOLDER } = useImageFallback()

const coverFailed = ref(false)
const coverSrc = computed(() =>
  coverFailed.value ? PLACEHOLDER : withFallback(props.template.cover_image)
)
const onCoverError = () => { coverFailed.value = true }

const router = useRouter()
const navigateToCard = () => router.push(`/date/${props.template.slug}`)

// Цвет глоу по сложности (если нет фото)
const DIFFICULTY_COLORS = {
  easy:   { glow: '#10b981', label: 'Лёгкий',  badge: 'rgba(16,185,129,0.2)', border: 'rgba(16,185,129,0.5)' },
  medium: { glow: '#d4af37', label: 'Средний', badge: 'rgba(212,175,55,0.2)', border: 'rgba(212,175,55,0.5)' },
  hard:   { glow: '#f97316', label: 'Сложный', badge: 'rgba(249,115,22,0.2)', border: 'rgba(249,115,22,0.5)' },
  expert: { glow: '#ef4444', label: 'Эксперт', badge: 'rgba(239,68,68,0.2)',  border: 'rgba(239,68,68,0.5)' },
}

const diff = computed(() => DIFFICULTY_COLORS[props.template.difficulty] || DIFFICULTY_COLORS.medium)
const difficultyLabel = computed(() => diff.value.label)
const difficultyStyle = computed(() => ({
  background: diff.value.badge,
  borderColor: diff.value.border,
  color: diff.value.border,
}))

const fallbackStyle = computed(() => ({
  background: `radial-gradient(ellipse at top right, ${diff.value.glow}30 0%, #0a0a0f 70%)`,
}))

function formatDuration(minutes) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}ч ${m}м`
  if (h > 0) return `${h}ч`
  return `${m}м`
}

const displayTags    = computed(() => props.template.tags?.slice(0, 2) || [])
const extraTagsCount = computed(() => Math.max(0, (props.template.tags?.length || 0) - 2))

const socialProof = computed(() => {
  const n = props.template.orders_count || 0
  if (n >= 50) return `${n} пар прошли`
  if (n >= 10) return `${n} заказов`
  if (n > 0)   return `${n} заказа`
  return null
})

function formatPrice(price) {
  if (!price) return '—'
  return `${Math.round(price / 100)} ₽`
}
</script>

<style scoped>
.tcard {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.2s;
}
.tcard:hover { transform: scale(1.02); }
.tcard:focus-visible { outline: 2px solid #d4af37; outline-offset: 2px; }

/* Фон */
.tcard__bg {
  position: relative;
  height: 150px;
  flex-shrink: 0;
  background: #0f0f14;
  overflow: hidden;
}
.tcard__photo {
  width: 100%; height: 100%;
  object-fit: cover;
  position: absolute; inset: 0;
}
.tcard__fallback {
  position: absolute; inset: 0;
}
.tcard__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5) 100%);
  z-index: 1;
}

/* Тело */
.tcard__body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 12px;
  background: #111118;
}

/* Верх — поверх фото */
.tcard__top {
  position: absolute;
  top: 8px; left: 8px; right: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 3;
}
.tcard__badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px 8px;
  border-radius: 100px;
  border: 1px solid;
  backdrop-filter: blur(8px);
}
.tcard__badge--free {
  background: rgba(16,185,129,0.2);
  border-color: rgba(16,185,129,0.5);
  color: #6ee7b7;
}
.tcard__preview {
  margin-left: auto;
  width: 30px; height: 30px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-tap-highlight-color: transparent;
  transition: background 0.2s;
}
.tcard__preview:hover { background: rgba(255,255,255,0.2); }

/* Низ */
.tcard__bottom {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 4px;
}
.tcard__cat {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.45);
  margin-bottom: 4px;
}
.tcard__title {
  flex: 1;
  font-size: clamp(14px, 3.5vw, 16px);
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}
.tcard__meta {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.tcard__time {
  font-size: 11px;
  color: rgba(255,255,255,0.5);
}
.tcard__rating {
  font-size: 11px;
  color: #d4af37;
}
.tcard__price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 6px;
}
.tcard__price {
  font-size: 18px;
  font-weight: 900;
  color: #d4af37;
  letter-spacing: -0.02em;
}
.tcard__btn {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  border: 1px solid rgba(255,255,255,0.2);
  padding: 5px 10px;
  border-radius: 100px;
  backdrop-filter: blur(8px);
  transition: color 0.2s, border-color 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.tcard__btn:hover { color: #fff; border-color: rgba(255,255,255,0.4); }
.tcard__tags { display: flex; flex-wrap: wrap; gap: 3px; margin-bottom: 5px; }
.tcard__tag { font-size: 9px; font-weight: 600; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); padding: 2px 6px; border-radius: 4px; }
.tcard__tag--more { background: rgba(212,175,55,0.15); color: #d4af37; }
.tcard__social { font-size: 10px; font-weight: 700; color: #fb923c; margin-bottom: 5px; }
</style>