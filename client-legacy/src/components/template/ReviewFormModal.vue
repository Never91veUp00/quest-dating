<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <button class="modal-close" @click="close">&times;</button>

      <div class="review-form">
        <h2>Оставить отзыв</h2>

        <div v-if="success" class="review-success">
          <div class="success-icon">🎉</div>
          <h3>Спасибо за отзыв!</h3>
          <p>Ваш отзыв отправлен и появится после проверки.</p>
          <button class="btn btn-primary" @click="close">Закрыть</button>
        </div>

        <form v-else @submit.prevent="submitReview">
          <div class="form-group">
            <label>Ваше имя *</label>
            <input v-model="form.client_name" type="text" placeholder="Как вас зовут?" required />
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input v-model="form.client_email" type="email" placeholder="your@email.com" required />
          </div>

          <div class="form-group">
            <label>Оценка *</label>
            <div class="rating-input">
              <span
                v-for="star in 5"
                :key="star"
                class="star"
                :class="{ active: star <= form.rating, hover: star <= hoverRating }"
                @click="form.rating = star"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
              >★</span>
              <span class="rating-label">{{ ratingLabel }}</span>
            </div>
          </div>

          <div class="form-group">
            <label>Заголовок отзыва</label>
            <input v-model="form.title" type="text" placeholder="Коротко о впечатлениях" />
          </div>

          <div class="form-group">
            <label>Ваш отзыв *</label>
            <textarea v-model="form.comment" rows="5" placeholder="Расскажите о вашем опыте..." required></textarea>
          </div>

          <div v-if="error" class="review-error">{{ error }}</div>

          <div class="actions">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Отправка...' : 'Отправить отзыв' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="close">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import api from '@/services/api'

const props = defineProps({
  templateId: { type: Number, required: true }
})

const emit = defineEmits(['close', 'submitted'])

const form = reactive({
  client_name: '',
  client_email: '',
  rating: 5,
  title: '',
  comment: ''
})

const hoverRating = ref(0)
const submitting  = ref(false)
const success     = ref(false)
const error       = ref('')

const LABELS = ['', 'Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично']
const ratingLabel = computed(() => LABELS[hoverRating.value || form.rating] || '')

const close = () => emit('close')

const submitReview = async () => {
  if (!form.rating) { error.value = 'Поставьте оценку'; return }
  error.value  = ''
  submitting.value = true
  try {
    await api.createReview(props.templateId, {
      template_id:  props.templateId,
      client_name:  form.client_name,
      client_email: form.client_email,
      rating:       form.rating,
      title:        form.title,
      comment:      form.comment
    })
    success.value = true
    emit('submitted')
  } catch (e) {
    error.value = e.message || 'Не удалось отправить отзыв. Попробуйте ещё раз.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.65);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 20px;
}
.modal-content {
  background: white; border-radius: 16px;
  max-width: 560px; width: 100%;
  max-height: 90vh; overflow-y: auto;
  position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.modal-close {
  position: absolute; top: 14px; right: 18px;
  background: none; border: none; font-size: 28px;
  cursor: pointer; color: #999; line-height: 1;
  transition: color 0.2s;
}
.modal-close:hover { color: #333; }

.review-form { padding: 32px; }
.review-form h2 { margin: 0 0 24px; font-size: 1.5rem; color: #2d3748; }

.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 0.9rem; color: #4a5568; }
.form-group input,
.form-group textarea {
  width: 100%; padding: 10px 14px; box-sizing: border-box;
  border: 1.5px solid #e2e8f0; border-radius: 8px;
  font-size: 0.95rem; transition: border-color 0.2s;
}
.form-group input:focus,
.form-group textarea:focus { outline: none; border-color: #667eea; }

.rating-input { display: flex; align-items: center; gap: 4px; }
.star { font-size: 2rem; color: #e2e8f0; cursor: pointer; transition: color 0.15s, transform 0.1s; }
.star.active, .star.hover { color: #f6ad55; }
.star:hover { transform: scale(1.15); }
.rating-label { margin-left: 10px; font-size: 0.9rem; color: #718096; font-weight: 500; min-width: 70px; }

.review-error {
  background: #fff5f5; border: 1px solid #feb2b2; color: #c53030;
  border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; font-size: 0.9rem;
}

.actions { display: flex; gap: 12px; margin-top: 24px; }
.btn { padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-size: 0.95rem; font-weight: 600; transition: all 0.2s; }
.btn-primary { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background: #f7fafc; color: #4a5568; border: 1.5px solid #e2e8f0; }
.btn-secondary:hover { background: #edf2f7; }

.review-success { text-align: center; padding: 20px 0; }
.success-icon { font-size: 3.5rem; margin-bottom: 12px; }
.review-success h3 { color: #2d3748; margin: 0 0 8px; }
.review-success p { color: #718096; margin: 0 0 24px; }
</style>