<template>
  <Teleport to="body">
    <transition name="qv-fade">
      <div v-if="isOpen" class="qv-overlay" @click.self="close">
        <div class="qv-sheet" v-if="template">

          <!-- Фото-шапка -->
          <div class="qv-hero">
            <img
              v-if="hasCover"
              :src="withFallback(template.cover_image)"
              :alt="template.title"
              class="qv-hero__img"
              @error="onImgError"
            />
            <div v-else class="qv-hero__fallback" :style="fallbackStyle"></div>
            <div class="qv-hero__overlay"></div>

            <!-- Закрыть -->
            <button class="qv-close" @click="close" aria-label="Закрыть">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M1 1l12 12M13 1L1 13"/>
              </svg>
            </button>

            <!-- Бейдж сложности -->
            <div class="qv-hero__badges">
              <span class="qv-badge" :style="diffStyle">{{ diffLabel }}</span>
              <span v-if="template.is_free" class="qv-badge qv-badge--free">Бесплатно</span>
            </div>

            <!-- Заголовок поверх фото -->
            <div class="qv-hero__title-wrap">
              <div class="qv-hero__cat">{{ template.category_name }}</div>
              <h2 class="qv-hero__title">{{ template.title }}</h2>
            </div>
          </div>

          <!-- Контент -->
          <div class="qv-body">

            <!-- Мета-строка -->
            <div class="qv-meta">
              <div class="qv-meta__item">
                <span class="qv-meta__icon">⏱</span>
                <span>{{ formatDuration(template.duration_minutes) }}</span>
              </div>
              <div v-if="template.rating > 0" class="qv-meta__item">
                <span class="qv-meta__icon">★</span>
                <span>{{ parseFloat(template.rating).toFixed(1) }} ({{ template.reviews_count }})</span>
              </div>
              <div v-if="template.location_type" class="qv-meta__item">
                <span class="qv-meta__icon">📍</span>
                <span>{{ locationLabel }}</span>
              </div>
            </div>

            <!-- Тэглайн -->
            <p v-if="template.tagline" class="qv-tagline">{{ template.tagline }}</p>

            <!-- Что входит -->
            <div v-if="template.features?.length" class="qv-features">
              <div v-for="f in template.features" :key="f" class="qv-feature">
                <span class="qv-feature__dot"></span>
                {{ f }}
              </div>
            </div>

            <!-- Цена + кнопки -->
            <div class="qv-footer">
              <div class="qv-price">
                {{ template.is_free ? 'Бесплатно' : formatPrice(template.base_price) }}
              </div>
              <div class="qv-actions">
                <NuxtLink :to="`/date/${template.slug}`" class="qv-btn qv-btn--ghost" @click="close">
                  Подробнее
                </NuxtLink>
                <NuxtLink :to="`/order/${template.slug}`" class="qv-btn qv-btn--primary" @click="close">
                  Заказать →
                </NuxtLink>
              </div>
            </div>

          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'

const { withFallback, onImgError, isValidImageSrc } = useImageFallback()

const props = defineProps({
  template: Object,
  isOpen:   Boolean
})
const emit = defineEmits(['close'])
const close = () => emit('close')

const hasCover = computed(() =>
  props.template && isValidImageSrc(props.template.cover_image)
)

const DIFF = {
  easy:   { label: 'Лёгкий',  bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', color: '#6ee7b7', glow: '#10b981' },
  medium: { label: 'Средний', bg: 'rgba(212,175,55,0.15)',  border: 'rgba(212,175,55,0.4)',  color: '#fcd34d', glow: '#d4af37' },
  hard:   { label: 'Сложный', bg: 'rgba(249,115,22,0.15)',  border: 'rgba(249,115,22,0.4)',  color: '#fdba74', glow: '#f97316' },
  expert: { label: 'Эксперт', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.4)',   color: '#fca5a5', glow: '#ef4444' },
}

const diff = computed(() => DIFF[props.template?.difficulty] || DIFF.medium)
const diffLabel = computed(() => diff.value.label)
const diffStyle = computed(() => ({
  background: diff.value.bg,
  borderColor: diff.value.border,
  color: diff.value.color,
}))
const fallbackStyle = computed(() => ({
  background: `radial-gradient(ellipse at top right, ${diff.value.glow}25 0%, #0a0a0f 70%)`,
}))

const locationLabel = computed(() => ({
  indoor:    'В помещении',
  city:      'По городу',
  park:      'Парк / природа',
  universal: 'Универсальный',
}[props.template?.location_type] || ''))

function formatDuration(minutes) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0 && m > 0) return `${h}ч ${m}м`
  if (h > 0) return `${h}ч`
  return `${m}м`
}
function formatPrice(v) {
  return v ? `${Math.round(Number(v) / 100).toLocaleString('ru')} ₽` : '—'
}

watch(() => props.isOpen, (open) => {
  if (open) {
    document.addEventListener('keydown', onEsc)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onEsc)
    document.body.style.overflow = ''
  }
})
const onEsc = (e) => { if (e.key === 'Escape') close() }
</script>

<style>
/* Глобальные — Teleport выносит за пределы scoped */
.qv-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex; align-items: flex-end; justify-content: center;
  padding: 0;
}
@media (min-width: 640px) {
  .qv-overlay { align-items: center; padding: 20px; }
}

.qv-sheet {
  background: #111118;
  width: 100%;
  max-width: 560px;
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  max-height: 92svh;
  overflow-y: auto;
  position: relative;
}
@media (min-width: 640px) {
  .qv-sheet { border-radius: 24px; max-height: 88vh; }
}

/* Hero */
.qv-hero {
  position: relative;
  height: 240px;
  background: #0a0a0f;
  overflow: hidden;
  flex-shrink: 0;
}
@media (min-width: 640px) { .qv-hero { height: 280px; } }

.qv-hero__img {
  width: 100%; height: 100%;
  object-fit: cover;
  position: absolute; inset: 0;
}
.qv-hero__fallback { position: absolute; inset: 0; }
.qv-hero__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%);
}

.qv-close {
  position: absolute; top: 14px; right: 14px;
  width: 32px; height: 32px;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #fff;
  backdrop-filter: blur(8px);
  -webkit-tap-highlight-color: transparent;
  z-index: 2;
}

.qv-hero__badges {
  position: absolute; top: 14px; left: 14px;
  display: flex; gap: 6px; z-index: 2;
}
.qv-badge {
  font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.06em;
  padding: 3px 8px; border-radius: 100px;
  border: 1px solid;
  backdrop-filter: blur(8px);
}
.qv-badge--free {
  background: rgba(16,185,129,0.15);
  border-color: rgba(16,185,129,0.4);
  color: #6ee7b7;
}

.qv-hero__title-wrap {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 20px; z-index: 2;
}
.qv-hero__cat {
  font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em;
  color: rgba(255,255,255,0.5); margin-bottom: 4px;
}
.qv-hero__title {
  font-size: 1.4rem; font-weight: 900;
  color: #fff; margin: 0; line-height: 1.15;
  letter-spacing: -0.02em;
}

/* Body */
.qv-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }

.qv-meta {
  display: flex; flex-wrap: wrap; gap: 12px;
}
.qv-meta__item {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.85rem; color: rgba(240,237,232,0.6);
}
.qv-meta__icon { font-size: 12px; }

.qv-tagline {
  font-size: 0.95rem; color: rgba(240,237,232,0.7);
  line-height: 1.6; margin: 0;
}

.qv-features {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.qv-feature {
  display: flex; align-items: center; gap: 8px;
  font-size: 0.82rem; color: rgba(240,237,232,0.65);
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 8px; padding: 8px 10px;
}
.qv-feature__dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #d4af37; flex-shrink: 0;
}

.qv-footer {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 16px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  flex-wrap: wrap;
}
.qv-price {
  font-size: 1.6rem; font-weight: 900;
  color: #d4af37; letter-spacing: -0.02em;
}
.qv-actions { display: flex; gap: 8px; }
.qv-btn {
  padding: 11px 18px; border-radius: 100px;
  font-size: 0.9rem; font-weight: 700;
  text-decoration: none; transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.qv-btn--ghost {
  background: transparent;
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(240,237,232,0.7);
}
.qv-btn--ghost:hover { border-color: rgba(255,255,255,0.3); color: #f0ede8; }
.qv-btn--primary {
  background: #d4af37; color: #0a0a0f;
  border: none;
}
.qv-btn--primary:hover { opacity: 0.9; transform: translateY(-1px); }

/* Transitions */
.qv-fade-enter-active, .qv-fade-leave-active { transition: opacity 0.2s; }
.qv-fade-enter-from, .qv-fade-leave-to { opacity: 0; }
</style>