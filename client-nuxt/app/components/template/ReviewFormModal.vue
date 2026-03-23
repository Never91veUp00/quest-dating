<template>
  <Teleport to="body">
    <transition name="rfm-fade">
      <div class="rfm-overlay" @click.self="close">
        <div class="rfm-sheet">
          <div class="rfm-handle"></div>

          <div class="rfm-head">
            <h2 class="rfm-title">Написать отзыв</h2>
            <button class="rfm-close" @click="close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 1l12 12M13 1L1 13"/></svg>
            </button>
          </div>

          <!-- Успех -->
          <div v-if="success" class="rfm-success">
            <div class="rfm-success-icon">🎉</div>
            <h3>Спасибо за отзыв!</h3>
            <p>Появится после проверки</p>
            <button class="rfm-btn rfm-btn--primary" @click="close">Закрыть</button>
          </div>

          <!-- Форма -->
          <form v-else @submit.prevent="submitReview" class="rfm-form">

            <div class="rfm-field">
              <label class="rfm-label">Ваше имя *</label>
              <input v-model="form.client_name" type="text" class="rfm-input" placeholder="Как вас зовут?" required />
            </div>

            <div class="rfm-field">
              <label class="rfm-label">Email *</label>
              <input v-model="form.client_email" type="email" class="rfm-input" placeholder="your@email.com" required />
            </div>

            <div class="rfm-field">
              <label class="rfm-label">Оценка *</label>
              <div class="rfm-stars">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="rfm-star"
                  :class="{ 'rfm-star--active': star <= (hoverRating || form.rating) }"
                  @click="form.rating = star"
                  @mouseenter="hoverRating = star"
                  @mouseleave="hoverRating = 0"
                >★</span>
                <span class="rfm-rating-label">{{ ratingLabel }}</span>
              </div>
            </div>

            <div class="rfm-field">
              <label class="rfm-label">Заголовок</label>
              <input v-model="form.title" type="text" class="rfm-input" placeholder="Коротко о впечатлениях" />
            </div>

            <div class="rfm-field">
              <label class="rfm-label">Отзыв *</label>
              <textarea v-model="form.comment" rows="4" class="rfm-textarea" placeholder="Расскажите о вашем опыте..." required></textarea>
            </div>

            <div v-if="error" class="rfm-error">{{ error }}</div>

            <div class="rfm-actions">
              <button type="button" class="rfm-btn rfm-btn--ghost" @click="close">Отмена</button>
              <button type="submit" class="rfm-btn rfm-btn--primary" :disabled="submitting">
                {{ submitting ? 'Отправка...' : 'Отправить' }}
              </button>
            </div>

          </form>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const props = defineProps({ templateId: { type: Number, required: true } })
const emit  = defineEmits(['close', 'submitted'])
const { createReview } = useDatesApi()

const form = reactive({ client_name: '', client_email: '', rating: 5, title: '', comment: '' })
const hoverRating = ref(0)
const submitting  = ref(false)
const success     = ref(false)
const error       = ref('')

const LABELS = ['', 'Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично']
const ratingLabel = computed(() => LABELS[hoverRating.value || form.rating] || '')

const close = () => emit('close')

const submitReview = async () => {
  if (!form.rating) { error.value = 'Поставьте оценку'; return }
  error.value = ''
  submitting.value = true
  try {
    await createReview(props.templateId, {
      template_id:  props.templateId,
      client_name:  form.client_name,
      client_email: form.client_email,
      rating:       form.rating,
      title:        form.title,
      comment:      form.comment,
    })
    success.value = true
    emit('submitted')
  } catch (e) {
    error.value = e.message || 'Не удалось отправить отзыв'
  } finally {
    submitting.value = false
  }
}
</script>

<style>
.rfm-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
  z-index: 2000; display: flex; align-items: flex-end;
}
@media (min-width: 640px) { .rfm-overlay { align-items: center; padding: 20px; } }

.rfm-sheet {
  width: 100%; background: #111118;
  border-radius: 24px 24px 0 0;
  max-height: 90svh; overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
}
@media (min-width: 640px) { .rfm-sheet { border-radius: 24px; max-width: 480px; margin: 0 auto; } }

.rfm-handle {
  width: 36px; height: 4px; border-radius: 2px;
  background: rgba(255,255,255,0.12); margin: 12px auto 0;
}
.rfm-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);
}
.rfm-title { font-size: 1rem; font-weight: 900; color: #f0ede8; margin: 0; }
.rfm-close {
  width: 30px; height: 30px; border-radius: 50%;
  background: rgba(255,255,255,0.08); border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: rgba(240,237,232,0.6);
}

.rfm-form { padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 14px; }

.rfm-field { display: flex; flex-direction: column; gap: 6px; }
.rfm-label { font-size: 0.82rem; font-weight: 700; color: rgba(240,237,232,0.65); }

.rfm-input, .rfm-textarea {
  padding: 10px 14px; box-sizing: border-box; width: 100%;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px; font-size: 0.9rem; color: #f0ede8;
  transition: border-color 0.2s; font-family: inherit;
}
.rfm-input::placeholder, .rfm-textarea::placeholder { color: rgba(240,237,232,0.25); }
.rfm-input:focus, .rfm-textarea:focus { outline: none; border-color: #d4af37; }
.rfm-textarea { resize: none; }

.rfm-stars { display: flex; align-items: center; gap: 4px; }
.rfm-star { font-size: 1.8rem; color: rgba(255,255,255,0.15); cursor: pointer; transition: color 0.1s, transform 0.1s; line-height: 1; }
.rfm-star--active { color: #d4af37; }
.rfm-star:hover { transform: scale(1.15); }
.rfm-rating-label { font-size: 0.82rem; color: rgba(240,237,232,0.4); margin-left: 8px; min-width: 60px; }

.rfm-error {
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
  color: #fca5a5; border-radius: 10px; padding: 10px 14px; font-size: 0.85rem;
}

.rfm-actions { display: flex; gap: 8px; padding-top: 4px; }
.rfm-btn {
  flex: 1; padding: 12px; border-radius: 100px;
  font-size: 0.9rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s; border: none; -webkit-tap-highlight-color: transparent;
}
.rfm-btn--ghost {
  background: transparent; border: 1px solid rgba(255,255,255,0.12);
  color: rgba(240,237,232,0.5);
}
.rfm-btn--primary { background: #d4af37; color: #0a0a0f; }
.rfm-btn--primary:hover:not(:disabled) { opacity: 0.9; }
.rfm-btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }

.rfm-success {
  text-align: center; padding: 32px 20px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.rfm-success-icon { font-size: 3rem; }
.rfm-success h3 { font-size: 1.1rem; font-weight: 900; color: #f0ede8; margin: 0; }
.rfm-success p { font-size: 0.85rem; color: rgba(240,237,232,0.45); margin: 0; }

.rfm-fade-enter-active, .rfm-fade-leave-active { transition: opacity 0.25s; }
.rfm-fade-enter-from, .rfm-fade-leave-to { opacity: 0; }
</style>