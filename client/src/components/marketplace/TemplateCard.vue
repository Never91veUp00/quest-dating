<template>
  <div class="template-card" @click="navigateToTemplate">
    <!-- Изображение -->
    <div class="card-image">
      <img 
        :src="template.cover_image || '/images/placeholder.jpg'" 
        :alt="template.title"
        loading="lazy"
      />
      
      <!-- Бейджи -->
      <div class="card-badges">
        <DifficultyBadge :difficulty="template.difficulty" />
        <span v-if="template.is_premium" class="badge-premium">Premium</span>
        <span v-if="template.is_free" class="badge-free">Бесплатно</span>
      </div>

      <!-- Оверлей при наведении -->
      <div class="card-overlay">
        <button class="btn-quick-view" @click.stop="showQuickView">
          👁️ Быстрый просмотр
        </button>
      </div>
    </div>

    <!-- Контент -->
    <div class="card-content">
      <!-- Категория -->
      <div class="card-meta">
        <router-link 
          :to="`/categories/${template.category_slug}`"
          class="category-link"
          :style="{ color: template.category_color }"
          @click.stop
        >
          {{ template.category_name }}
        </router-link>
        <span class="duration">⏱️ {{ formatDuration(template.duration_minutes) }}</span>
      </div>

      <!-- Заголовок -->
      <h3 class="card-title">{{ template.title }}</h3>

      <!-- Описание -->
      <p class="card-tagline">{{ template.tagline }}</p>

      <!-- Автор -->
      <div class="card-author">
        <div class="author-info">
          <img 
            :src="template.author_avatar || '/images/avatars/default.jpg'" 
            :alt="template.author_name"
            class="author-avatar"
          />
          <span class="author-name">{{ template.author_name }}</span>
        </div>
      </div>

      <!-- Теги -->
      <div class="card-tags">
        <TagBadge 
          v-for="tag in displayTags" 
          :key="tag.id"
          :tag="tag"
          size="small"
        />
        <span v-if="remainingTagsCount > 0" class="tags-more">
          +{{ remainingTagsCount }}
        </span>
      </div>

      <!-- Футер -->
      <div class="card-footer">
        <!-- Рейтинг -->
        <div class="card-rating">
          <RatingStars :rating="template.rating" size="small" />
          <span class="rating-text">
            {{ parseFloat(template.rating || 0).toFixed(1) || 'Нет оценок' }}
          </span>
          <span class="reviews-count">
            ({{ template.reviews_count || 0 }})
          </span>
        </div>

        <!-- Цена -->
        <PriceTag :price="template.base_price" :isFree="template.is_free" />
      </div>

      <!-- Статистика -->
      <div class="card-stats">
        <span class="stat-item">
          👁️ {{ formatNumber(template.views_count) }}
        </span>
        <span class="stat-item">
          🛒 {{ formatNumber(template.orders_count) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import DifficultyBadge from './DifficultyBadge.vue'
import TagBadge from './TagBadge.vue'
import RatingStars from './RatingStars.vue'
import PriceTag from './PriceTag.vue'
import { formatDuration, formatNumber } from '@/utils/formatters'

const props = defineProps({
  template: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['quickView'])

const router = useRouter()

const displayTags = computed(() => {
  return props.template.tags?.slice(0, 3) || []
})

const remainingTagsCount = computed(() => {
  const total = props.template.tags?.length || 0
  return total > 3 ? total - 3 : 0
})

const navigateToTemplate = () => {
  router.push(`/template/${props.template.slug}`)
}

const showQuickView = () => {
  emit('quickView', props.template)
}
</script>

<style scoped>
.template-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.template-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: #f0f0f0;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.template-card:hover .card-image img {
  transform: scale(1.1);
}

.card-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge-premium,
.badge-free {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-premium {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #000;
}

.badge-free {
  background: #48bb78;
  color: white;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.template-card:hover .card-overlay {
  opacity: 1;
}

.btn-quick-view {
  padding: 12px 24px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-quick-view:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.category-link {
  font-weight: 600;
  text-decoration: none;
  transition: opacity 0.3s;
}

.category-link:hover {
  opacity: 0.7;
}

.duration {
  color: #718096;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tagline {
  color: #718096;
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.card-author {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid #e2e8f0;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5568;
}

.author-info:hover {
  color: #667eea;
}

.author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.card-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tags-more {
  padding: 4px 8px;
  background: #e2e8f0;
  border-radius: 12px;
  font-size: 0.75rem;
  color: #718096;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  margin-top: auto;
}

.card-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rating-text {
  font-weight: 700;
  color: #2d3748;
  font-size: 0.9rem;
}

.reviews-count {
  color: #718096;
  font-size: 0.85rem;
}

.card-stats {
  display: flex;
  gap: 16px;
  font-size: 0.85rem;
  color: #718096;
  padding-top: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 640px) {
  .card-image {
    height: 180px;
  }

  .card-content {
    padding: 16px;
  }

  .card-title {
    font-size: 1.1rem;
  }
}
</style>