<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <button class="modal-close" @click="close">&times;</button>

      <div v-if="template" class="quick-view">
        <div class="quick-view__image">
          <img
            :src="withFallback(template.cover_image)"
            :alt="template.title"
            @error="onImgError"
          >
        </div>

        <div class="quick-view__info">
          <div v-if="template.category_name" class="quick-view__category">
            {{ template.category_icon }} {{ template.category_name }}
          </div>

          <h2>{{ template.title }}</h2>
          <p v-if="template.tagline" class="tagline">{{ template.tagline }}</p>

          <div class="meta">
            <span v-if="template.rating">⭐ {{ template.rating }}</span>
            <span v-if="template.orders_count">✅ {{ template.orders_count }} заказов</span>
            <span>⏱️ {{ formatDuration(template.duration_minutes) }}</span>
            <span v-if="template.difficulty">{{ difficultyLabel(template.difficulty) }}</span>
          </div>

          <p v-if="quickDescription" class="description">{{ quickDescription }}</p>

          <div class="price-row">
            <span v-if="template.is_free" class="price price--free">Бесплатно</span>
            <span v-else class="price">{{ formatRub(template.base_price) }}</span>
          </div>

          <div class="actions">
            <NuxtLink :to="`/date/${template.slug}`" class="btn btn-primary" @click="close">
              Подробнее →
            </NuxtLink>
            <NuxtLink :to="`/order/${template.slug}`" class="btn btn-order" @click="close">
              🎯 Заказать
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'

const { withFallback, onImgError } = useImageFallback()
const props = defineProps({
  template: Object,
  isOpen:   Boolean
})
const emit = defineEmits(['close'])
const close = () => emit('close')

// Описание для быстрого просмотра: только quick_view_description
const quickDescription = computed(() => {
  if (!props.template) return ''
  return props.template.quick_view_description || ''
})

const formatDuration = (minutes) => {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return m > 0 ? `${h}ч ${m}м` : `${h}ч`
  return `${m}м`
}

const formatRub = (v) => v ? `${Math.round(Number(v) / 100).toLocaleString('ru')} ₽` : '—'

const difficultyLabel = (d) => ({
  easy: '🟢 Лёгкий', medium: '🟡 Средний',
  hard: '🔴 Сложный', expert: '⚫ Эксперт'
}[d] || d)

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) document.addEventListener('keydown', handleEscape)
  else        document.removeEventListener('keydown', handleEscape)
})
const handleEscape = (e) => { if (e.key === 'Escape') close() }
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.modal-content {
  background: white; border-radius: 16px;
  max-width: 820px; width: 100%;
  max-height: 90vh; overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.modal-close {
  position: absolute; top: 14px; right: 14px;
  background: rgba(0,0,0,0.06); border: none;
  border-radius: 50%; width: 32px; height: 32px;
  font-size: 20px; cursor: pointer; color: #555;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.modal-close:hover { background: rgba(0,0,0,0.12); }

.quick-view {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 0;
}
.quick-view__image img {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 16px 0 0 16px;
  min-height: 320px;
}
.quick-view__info {
  padding: 32px;
  display: flex; flex-direction: column; gap: 16px;
}
.quick-view__category {
  font-size: 0.8rem; font-weight: 600;
  color: #667eea; text-transform: uppercase; letter-spacing: 0.05em;
}
.quick-view__info h2 {
  font-size: 1.6rem; font-weight: 800;
  color: #2d3748; margin: 0; line-height: 1.2;
}
.tagline { color: #718096; margin: 0; line-height: 1.5; }
.meta {
  display: flex; flex-wrap: wrap; gap: 10px;
  font-size: 0.85rem; color: #4a5568;
}
.meta span {
  background: #f7fafc; border: 1px solid #e2e8f0;
  border-radius: 6px; padding: 4px 10px;
}
.description { color: #4a5568; line-height: 1.6; margin: 0; flex: 1; }
.price-row { display: flex; align-items: center; }
.price { font-size: 1.4rem; font-weight: 800; color: #2d3748; }
.price--free { color: #48bb78; }

.actions { display: flex; gap: 10px; flex-wrap: wrap; }
.btn {
  padding: 12px 20px; border-radius: 10px;
  text-decoration: none; border: none; cursor: pointer;
  font-size: 0.95rem; font-weight: 600;
  transition: all 0.2s; text-align: center;
}
.btn-primary {
  background: #f7fafc; color: #667eea;
  border: 2px solid #667eea; flex: 1;
}
.btn-primary:hover { background: #667eea; color: white; }
.btn-order {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white; flex: 1;
  box-shadow: 0 4px 12px rgba(102,126,234,0.3);
}
.btn-order:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(102,126,234,0.4); }

@media (max-width: 640px) {
  .quick-view { grid-template-columns: 1fr; }
  .quick-view__image img { border-radius: 16px 16px 0 0; min-height: 200px; }
}
</style>