<template>
  <div class="template-reviews">
    <div class="reviews-header">
      <h3 class="section-title">Отзывы клиентов</h3>
      
      <!-- Общая статистика -->
      <div class="reviews-stats">
        <div class="average-rating">
          <div class="rating-number">{{ averageRating }}</div>
          <RatingStars :rating="parseFloat(averageRating)" size="large" />
          <div class="rating-count">{{ totalReviews }} отзывов</div>
        </div>

        <!-- Распределение оценок -->
        <div class="rating-distribution">
          <div 
            v-for="star in [5, 4, 3, 2, 1]"
            :key="star"
            class="distribution-bar"
          >
            <span class="star-label">{{ star }} ⭐</span>
            <div class="bar-wrapper">
              <div 
                class="bar-fill"
                :style="{ width: getPercentage(star) + '%' }"
              ></div>
            </div>
            <span class="bar-count">{{ getRatingCount(star) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Фильтры -->
    <div class="reviews-filters">
      <button 
        v-for="filter in filters"
        :key="filter.value"
        class="filter-button"
        :class="{ active: activeFilter === filter.value }"
        @click="activeFilter = filter.value"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Список отзывов -->
    <div v-if="loading" class="reviews-loading">
      <div class="spinner"></div>
      <p>Загружаем отзывы...</p>
    </div>

    <div v-else-if="filteredReviews.length === 0" class="reviews-empty">
      <p>Отзывов пока нет. Станьте первым!</p>
    </div>

    <div v-else class="reviews-list">
      <ReviewCard
        v-for="review in displayedReviews"
        :key="review.id"
        :review="review"
        @markHelpful="handleMarkHelpful"
        @openGallery="handleOpenGallery"
      />
    </div>

    <!-- Кнопка "Показать еще" -->
    <div v-if="hasMore" class="reviews-more">
      <button @click="loadMore" class="btn-load-more">
        Показать еще отзывы
      </button>
    </div>

    <!-- Форма добавления отзыва -->
    <div class="add-review-section">
      <h4>Оставить отзыв</h4>
      <p class="add-review-hint">
        Вы использовали этот шаблон? Поделитесь впечатлениями!
      </p>
      <button @click="showReviewForm = true" class="btn-add-review">
        ✍️ Написать отзыв
      </button>
    </div>

    <!-- Модалка формы отзыва -->
    <ReviewFormModal
      v-if="showReviewForm"
      :template-id="templateId"
      @close="showReviewForm = false"
      @submitted="handleReviewSubmitted"
    />

    <!-- Модалка галереи изображений -->
    <ImageGalleryModal
      v-if="showGallery"
      :images="galleryImages"
      :start-index="galleryStartIndex"
      @close="showGallery = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuestStore } from '@/store'
import ReviewCard from '../marketplace/ReviewCard.vue'
import RatingStars from '../marketplace/RatingStars.vue'
import ReviewFormModal from './ReviewFormModal.vue'
import ImageGalleryModal from '../common/ImageGalleryModal.vue'

const props = defineProps({
  templateId: {
    type: Number,
    required: true
  },
  reviews: {
    type: Array,
    default: () => []
  }
})

const questStore = useQuestStore()

const loading = ref(false)
const activeFilter = ref('all')
const displayCount = ref(5)
const showReviewForm = ref(false)
const showGallery = ref(false)
const galleryImages = ref([])
const galleryStartIndex = ref(0)

const filters = [
  { value: 'all', label: 'Все отзывы' },
  { value: 'verified', label: 'Подтвержденные' },
  { value: 'featured', label: 'Выделенные' },
  { value: 'recent', label: 'Недавние' },
  { value: 'helpful', label: 'Полезные' }
]

const averageRating = computed(() => {
  if (props.reviews.length === 0) return '0.0'
  const sum = props.reviews.reduce((acc, r) => acc + r.rating, 0)
  return (sum / props.reviews.length).toFixed(1)
})

const totalReviews = computed(() => props.reviews.length)

const getRatingCount = (stars) => {
  return props.reviews.filter(r => r.rating === stars).length
}

const getPercentage = (stars) => {
  if (totalReviews.value === 0) return 0
  return (getRatingCount(stars) / totalReviews.value * 100).toFixed(0)
}

const filteredReviews = computed(() => {
  let filtered = [...props.reviews]

  switch (activeFilter.value) {
    case 'verified':
      filtered = filtered.filter(r => r.is_verified)
      break
    case 'featured':
      filtered = filtered.filter(r => r.is_featured)
      break
    case 'recent':
      filtered = filtered.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )
      break
    case 'helpful':
      filtered = filtered.sort((a, b) => 
        (b.helpful_count || 0) - (a.helpful_count || 0)
      )
      break
  }

  return filtered
})

const displayedReviews = computed(() => {
  return filteredReviews.value.slice(0, displayCount.value)
})

const hasMore = computed(() => {
  return displayedReviews.value.length < filteredReviews.value.length
})

const loadMore = () => {
  displayCount.value += 5
}

const handleMarkHelpful = async (reviewId) => {
  try {
    await questStore.markReviewHelpful(reviewId)
    // Обновить локальный счетчик
    const review = props.reviews.find(r => r.id === reviewId)
    if (review) {
      review.helpful_count = (review.helpful_count || 0) + 1
    }
  } catch (error) {
    console.error('Failed to mark review as helpful:', error)
  }
}

const handleOpenGallery = ({ images, startIndex }) => {
  galleryImages.value = images
  galleryStartIndex.value = startIndex
  showGallery.value = true
}

const handleReviewSubmitted = () => {
  showReviewForm.value = false
  // Перезагрузить отзывы (в идеале через store)
  window.location.reload()
}
</script>

<style scoped>
.template-reviews {
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.reviews-header {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 24px 0;
}

.reviews-stats {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 40px;
  padding: 24px;
  background: #f7fafc;
  border-radius: 12px;
}

.average-rating {
  text-align: center;
}

.rating-number {
  font-size: 3.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 12px;
}

.rating-count {
  margin-top: 8px;
  color: #718096;
  font-size: 0.9rem;
}

.rating-distribution {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.distribution-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.star-label {
  width: 50px;
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 600;
}

.bar-wrapper {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(to right, #fbbf24, #f59e0b);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.bar-count {
  width: 40px;
  text-align: right;
  font-size: 0.85rem;
  color: #718096;
}

.reviews-filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
}

.filter-button {
  padding: 8px 20px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 24px;
  font-weight: 600;
  color: #718096;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-button:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.reviews-loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.reviews-empty {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.reviews-more {
  text-align: center;
  margin-top: 32px;
}

.btn-load-more {
  padding: 12px 32px;
  background: white;
  border: 2px solid #667eea;
  border-radius: 10px;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-load-more:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.add-review-section {
  margin-top: 40px;
  padding: 32px;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 12px;
  text-align: center;
}

.add-review-section h4 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.add-review-hint {
  color: #718096;
  margin: 0 0 20px 0;
}

.btn-add-review {
  padding: 14px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-add-review:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .reviews-stats {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .template-reviews {
    padding: 32px 20px;
  }
}
</style>