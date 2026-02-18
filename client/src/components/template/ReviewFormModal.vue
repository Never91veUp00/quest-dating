<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <button class="modal-close" @click="close">&times;</button>
      
      <div class="review-form">
        <h2>Оставить отзыв</h2>
        
        <form @submit.prevent="submitReview">
          <div class="form-group">
            <label>Ваше имя *</label>
            <input v-model="form.name" type="text" required>
          </div>
          
          <div class="form-group">
            <label>Email *</label>
            <input v-model="form.email" type="email" required>
          </div>
          
          <div class="form-group">
            <label>Рейтинг *</label>
            <div class="rating-input">
              <span 
                v-for="star in 5" 
                :key="star"
                @click="form.rating = star"
                class="star"
                :class="{ active: star <= form.rating }"
              >
                ★
              </span>
            </div>
          </div>
          
          <div class="form-group">
            <label>Заголовок отзыва</label>
            <input v-model="form.title" type="text">
          </div>
          
          <div class="form-group">
            <label>Ваш отзыв *</label>
            <textarea v-model="form.comment" rows="5" required></textarea>
          </div>
          
          <div class="actions">
            <button type="submit" class="btn btn-primary">Отправить</button>
            <button type="button" class="btn btn-secondary" @click="close">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  templateId: Number
})

const emit = defineEmits(['close', 'submit'])

const form = reactive({
  name: '',
  email: '',
  rating: 5,
  title: '',
  comment: ''
})

const close = () => {
  emit('close')
}

const submitReview = () => {
  emit('submit', { ...form, templateId: props.templateId })
  close()
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
  max-width: 600px;
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
  color: #666;
}

.review-form {
  padding: 30px;
}

.review-form h2 {
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.rating-input {
  display: flex;
  gap: 5px;
}

.star {
  font-size: 32px;
  color: #ddd;
  cursor: pointer;
  transition: color 0.2s;
}

.star.active {
  color: #ffc107;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
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
</style>