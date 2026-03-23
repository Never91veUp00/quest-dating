<template>
  <div class="tr">
    <!-- Шапка -->
    <div class="tr__head">
      <h2 class="tr__title">Отзывы</h2>
      <div v-if="totalReviews > 0" class="tr__summary">
        <span class="tr__avg">{{ averageRating }}</span>
        <div class="tr__stars">
          <span v-for="i in 5" :key="i" class="tr__star" :class="{ 'tr__star--filled': i <= Math.round(parseFloat(averageRating)) }">★</span>
        </div>
        <span class="tr__count">{{ totalReviews }} отзывов</span>
      </div>
    </div>

    <!-- Загрузка -->
    <div v-if="loading" class="tr__loading">
      <Loader text="Загружаем отзывы..." />
    </div>

    <!-- Нет отзывов -->
    <div v-else-if="reviews.length === 0" class="tr__empty">
      <p>Отзывов пока нет — будьте первыми!</p>
      <button @click="showReviewForm = true" class="tr__write-btn">✍️ Оставить отзыв</button>
    </div>

    <!-- Список -->
    <div v-else>
      <div class="tr__list">
        <div
          v-for="review in displayedReviews"
          :key="review.id"
          class="tr__item"
        >
          <!-- Шапка отзыва -->
          <div class="tr__item-head">
            <div class="tr__avatar">{{ getInitials(review.client_name) }}</div>
            <div class="tr__item-info">
              <div class="tr__item-name">{{ review.client_name }}</div>
              <div class="tr__item-date">{{ formatDate(review.created_at) }}</div>
            </div>
            <div class="tr__item-rating">
              <span v-for="i in 5" :key="i" class="tr__star tr__star--sm" :class="{ 'tr__star--filled': i <= review.rating }">★</span>
            </div>
          </div>

          <!-- Заголовок -->
          <p v-if="review.title" class="tr__item-title">{{ review.title }}</p>

          <!-- Текст -->
          <p class="tr__item-comment">{{ review.comment }}</p>

          <!-- Верифицирован -->
          <div v-if="review.is_verified" class="tr__verified">✓ Подтверждённый заказ</div>
        </div>
      </div>

      <!-- Показать ещё -->
      <button v-if="hasMore" @click="loadMore" class="tr__more">
        Показать ещё {{ Math.min(5, totalReviews - displayCount) }} отзывов
      </button>

      <!-- Написать отзыв -->
      <button @click="showReviewForm = true" class="tr__write-btn tr__write-btn--secondary">
        ✍️ Написать отзыв
      </button>
    </div>

    <!-- Модалка формы -->
    <ReviewFormModal
      v-if="showReviewForm"
      :template-id="templateId"
      @close="showReviewForm = false"
      @submitted="handleReviewSubmitted"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  templateId: { type: Number, required: true }
})

const { getDateReviews } = useDatesApi()

const reviews     = ref([])
const loading     = ref(true)
const displayCount = ref(3)
const showReviewForm = ref(false)

const loadReviews = async () => {
  loading.value = true
  try {
    const res = await getDateReviews(props.templateId)
    reviews.value = res?.data || res || []
  } catch (e) {
    console.error('Failed to load reviews:', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadReviews)

const totalReviews = computed(() => reviews.value.length)

const averageRating = computed(() => {
  if (!reviews.value.length) return '0.0'
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

const displayedReviews = computed(() => reviews.value.slice(0, displayCount.value))
const hasMore = computed(() => displayCount.value < totalReviews.value)
const loadMore = () => { displayCount.value += 5 }

const handleReviewSubmitted = () => { loadReviews(); showReviewForm.value = false }

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<style scoped>
.tr { }

/* Шапка */
.tr__head {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
}
.tr__title { font-size: 1.2rem; font-weight: 900; color: #f0ede8; margin: 0; letter-spacing: -0.01em; }
.tr__summary { display: flex; align-items: center; gap: 8px; }
.tr__avg { font-size: 1.4rem; font-weight: 900; color: #d4af37; }
.tr__stars { display: flex; gap: 1px; }
.tr__star { font-size: 14px; color: rgba(255,255,255,0.15); }
.tr__star--filled { color: #d4af37; }
.tr__count { font-size: 0.8rem; color: rgba(240,237,232,0.4); }

/* States */
.tr__loading { padding: 40px 0; text-align: center; }
.tr__empty { text-align: center; padding: 32px 0; display: flex; flex-direction: column; gap: 12px; align-items: center; }
.tr__empty p { font-size: 0.9rem; color: rgba(240,237,232,0.4); margin: 0; }

/* List */
.tr__list { display: flex; flex-direction: column; gap: 2px; margin-bottom: 12px; }

.tr__item {
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  display: flex; flex-direction: column; gap: 8px;
}

.tr__item-head { display: flex; align-items: center; gap: 10px; }

.tr__avatar {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.3);
  color: #d4af37; font-size: 0.75rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}

.tr__item-info { flex: 1; min-width: 0; }
.tr__item-name { font-size: 0.9rem; font-weight: 700; color: #f0ede8; }
.tr__item-date { font-size: 0.75rem; color: rgba(240,237,232,0.35); }

.tr__item-rating { display: flex; gap: 1px; flex-shrink: 0; }
.tr__star--sm { font-size: 12px; }

.tr__item-title { font-size: 0.9rem; font-weight: 700; color: #f0ede8; margin: 0; }
.tr__item-comment { font-size: 0.85rem; color: rgba(240,237,232,0.65); line-height: 1.6; margin: 0; }

.tr__verified {
  font-size: 0.75rem; font-weight: 600;
  color: #4ade80; display: flex; align-items: center; gap: 4px;
}

/* Buttons */
.tr__more {
  width: 100%; padding: 12px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 100px; color: rgba(240,237,232,0.6);
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  transition: all 0.2s; margin-bottom: 10px;
  -webkit-tap-highlight-color: transparent;
}
.tr__more:hover { border-color: rgba(255,255,255,0.2); color: #f0ede8; }

.tr__write-btn {
  width: 100%; padding: 12px;
  background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.25);
  border-radius: 100px; color: #d4af37;
  font-size: 0.85rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s; -webkit-tap-highlight-color: transparent;
}
.tr__write-btn:hover { background: rgba(212,175,55,0.15); }
.tr__write-btn--secondary { margin-top: 4px; }
</style>