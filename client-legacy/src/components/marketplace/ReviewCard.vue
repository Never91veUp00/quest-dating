<template>
  <div class="review-card" :class="{ featured: review.is_featured }">
    <!-- Featured Badge -->
    <div v-if="review.is_featured" class="featured-badge">
      ⭐ Выделенный отзыв
    </div>

    <!-- Header -->
    <div class="review-header">
      <div class="reviewer-info">
        <div class="reviewer-avatar">
          {{ getInitials(review.client_name) }}
        </div>
        <div class="reviewer-details">
          <div class="reviewer-name">{{ review.client_name }}</div>
          <div class="review-date">{{ formatDate(review.created_at) }}</div>
        </div>
      </div>
      
      <div class="review-meta">
        <RatingStars :rating="review.rating" size="small" />
        <div v-if="review.is_verified" class="verified-badge" title="Подтвержденный заказ">
          ✓ Подтверждено
        </div>
      </div>
    </div>

    <!-- Title -->
    <h4 v-if="review.title" class="review-title">{{ review.title }}</h4>

    <!-- Comment -->
    <p class="review-comment">{{ review.comment }}</p>

    <!-- Images -->
    <div v-if="review.images && review.images.length > 0" class="review-images">
      <img
        v-for="(image, index) in review.images.slice(0, 3)"
        :key="index"
        :src="image"
        :alt="`Review image ${index + 1}`"
        class="review-image"
        @click="openImageGallery(index)"
      />
      <div 
        v-if="review.images.length > 3" 
        class="more-images"
        @click="openImageGallery(3)"
      >
        +{{ review.images.length - 3 }}
      </div>
    </div>

    <!-- Footer -->
    <div class="review-footer">
      <button 
        class="helpful-button"
        :class="{ active: hasMarkedHelpful }"
        @click="markHelpful"
      >
        👍 Полезно ({{ review.helpful_count || 0 }})
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RatingStars from './RatingStars.vue'

const props = defineProps({
  review: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['markHelpful', 'openGallery'])

const hasMarkedHelpful = ref(false)

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return date.toLocaleDateString('ru-RU', options)
}

const markHelpful = () => {
  if (hasMarkedHelpful.value) return
  
  hasMarkedHelpful.value = true
  emit('markHelpful', props.review.id)
}

const openImageGallery = (startIndex) => {
  emit('openGallery', {
    images: props.review.images,
    startIndex
  })
}
</script>

<style scoped>
.review-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s;
  position: relative;
}

.review-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.review-card.featured {
  border-color: #fbbf24;
  background: linear-gradient(to bottom, #fffbeb 0%, white 100%);
}

.featured-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  padding: 4px 12px;
  background: #fbbf24;
  color: #78350f;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.reviewer-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reviewer-name {
  font-weight: 700;
  color: #2d3748;
  font-size: 1rem;
}

.review-date {
  font-size: 0.85rem;
  color: #718096;
}

.review-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #d1fae5;
  color: #065f46;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.review-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.review-comment {
  color: #4a5568;
  line-height: 1.6;
  margin: 0 0 16px 0;
  font-size: 0.95rem;
}

.review-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  margin-bottom: 16px;
}

.review-image {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.review-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.more-images {
  width: 100%;
  height: 100px;
  background: #f7fafc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #718096;
  cursor: pointer;
  transition: all 0.3s;
}

.more-images:hover {
  background: #e2e8f0;
}

.review-footer {
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.helpful-button {
  padding: 8px 16px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s;
}

.helpful-button:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.helpful-button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

@media (max-width: 640px) {
  .review-header {
    flex-direction: column;
    gap: 12px;
  }

  .review-meta {
    align-items: flex-start;
  }
}
</style>