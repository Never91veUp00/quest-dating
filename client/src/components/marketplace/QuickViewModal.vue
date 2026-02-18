<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <button class="modal-close" @click="close">&times;</button>
      
      <div v-if="template" class="quick-view">
        <div class="quick-view__image">
          <img :src="template.cover_image || '/images/placeholder.jpg'" :alt="template.title">
        </div>
        
        <div class="quick-view__info">
          <h2>{{ template.title }}</h2>
          <p class="tagline">{{ template.tagline }}</p>
          
          <div class="meta">
            <span>⭐ {{ template.rating || 0 }}</span>
            <span>👥 {{ template.orders_count || 0 }} заказов</span>
            <span>⏱️ {{ template.duration_minutes || 0 }} мин</span>
          </div>
          
          <p class="description">{{ template.description }}</p>
          
          <div class="actions">
            <router-link :to="`/template/${template.slug}`" class="btn btn-primary">
              Подробнее
            </router-link>
            <button class="btn btn-secondary" @click="close">Закрыть</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  template: Object,
  isOpen: Boolean
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

// Закрытие по ESC
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleEscape)
  } else {
    document.removeEventListener('keydown', handleEscape)
  }
})

const handleEscape = (e) => {
  if (e.key === 'Escape') close()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 32px;
  cursor: pointer;
  z-index: 1;
  color: #666;
}

.quick-view {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  padding: 30px;
}

.quick-view__image img {
  width: 100%;
  border-radius: 8px;
}

.quick-view__info h2 {
  margin-bottom: 10px;
  color: #333;
}

.tagline {
  color: #666;
  margin-bottom: 15px;
}

.meta {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  font-size: 14px;
}

.description {
  margin-bottom: 20px;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

@media (max-width: 768px) {
  .quick-view {
    grid-template-columns: 1fr;
  }
}
</style>