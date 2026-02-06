<template>
  <div class="task-card" :class="{ completed: isCompleted }">
    <div class="task-header">
      <div class="task-number">Задание {{ index + 1 }}</div>
      <div v-if="isCompleted" class="task-completed-badge">✓ Выполнено</div>
    </div>

    <h3 class="task-title">{{ task.title }}</h3>
    <p class="task-description">{{ task.description }}</p>

    <!-- Разные типы заданий -->
    <div class="task-content">
      <!-- Загадка -->
      <div v-if="task.type === 'riddle'" class="task-riddle">
        <div class="riddle-question">{{ task.question }}</div>
        <input
          v-model="userAnswer"
          type="text"
          placeholder="Введите ответ..."
          class="riddle-input"
          :disabled="isCompleted"
          @keyup.enter="checkAnswer"
        />
        <div v-if="showHint" class="hint">
          💡 Подсказка: {{ task.hint }}
        </div>
        <div v-if="attempts > 0 && !isCompleted" class="attempts">
          Попыток: {{ attempts }}
        </div>
      </div>

      <!-- Фото задание -->
      <div v-else-if="task.type === 'photo'" class="task-photo">
        <p>{{ task.instruction }}</p>
        <input
          type="file"
          accept="image/*"
          @change="handlePhotoUpload"
          :disabled="isCompleted"
          class="photo-input"
        />
        <div v-if="uploadedPhoto" class="photo-preview">
          <img :src="uploadedPhoto" alt="Uploaded" />
        </div>
      </div>

      <!-- Простое задание -->
      <div v-else class="task-simple">
        <p>{{ task.instruction }}</p>
      </div>
    </div>

    <div class="task-actions">
      <button
        v-if="!isCompleted && task.hint"
        @click="showHint = true"
        class="btn btn-hint"
        :disabled="showHint"
      >
        {{ showHint ? 'Подсказка показана' : 'Показать подсказку' }}
      </button>

      <button
        v-if="!isCompleted"
        @click="handleComplete"
        class="btn btn-complete"
      >
        {{ task.type === 'riddle' ? 'Проверить ответ' : 'Отметить выполненным' }}
      </button>
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['complete'])

const isCompleted = ref(false)
const userAnswer = ref('')
const showHint = ref(false)
const attempts = ref(0)
const errorMessage = ref('')
const uploadedPhoto = ref(null)

const checkAnswer = () => {
  if (props.task.type === 'riddle') {
    attempts.value++
    
    const correctAnswers = props.task.correctAnswers || []
    const isCorrect = correctAnswers.some(answer => 
      answer.toLowerCase().trim() === userAnswer.value.toLowerCase().trim()
    )

    if (isCorrect) {
      handleComplete()
    } else {
      errorMessage.value = 'Неправильный ответ. Попробуйте ещё раз!'
      setTimeout(() => {
        errorMessage.value = ''
      }, 3000)
    }
  }
}

const handlePhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedPhoto.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleComplete = () => {
  if (props.task.type === 'riddle') {
    checkAnswer()
    if (errorMessage.value) return
  }

  isCompleted.value = true
  
  const points = calculatePoints()
  
  emit('complete', {
    taskId: props.task.id,
    points,
    attempts: attempts.value,
    usedHint: showHint.value
  })
}

const calculatePoints = () => {
  let basePoints = props.task.points || 100
  
  // Штраф за подсказку
  if (showHint.value) {
    basePoints -= 20
  }
  
  // Бонус за быстрое выполнение
  if (attempts.value === 1) {
    basePoints += 50
  } else if (attempts.value === 2) {
    basePoints += 25
  }
  
  return Math.max(basePoints, 50) // Минимум 50 очков
}
</script>

<style scoped>
.task-card {
  background: white;
  border: 3px solid #e2e8f0;
  border-radius: 20px;
  padding: 40px;
  transition: all 0.3s;
  position: relative;
}

.task-card:hover {
  border-color: #667eea;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
}

.task-card.completed {
  background: rgba(72, 187, 120, 0.05);
  border-color: #48bb78;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.task-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
}

.task-completed-badge {
  background: #48bb78;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.task-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 12px;
}

.task-description {
  font-size: 1.1rem;
  color: #4a5568;
  line-height: 1.6;
  margin-bottom: 24px;
}

.task-content {
  margin-bottom: 32px;
}

.riddle-question {
  background: #f7fafc;
  padding: 24px;
  border-radius: 12px;
  font-size: 1.15rem;
  color: #2d3748;
  margin-bottom: 20px;
  border-left: 4px solid #667eea;
}

.riddle-input {
  width: 100%;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1.1rem;
  transition: all 0.3s;
}

.riddle-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.riddle-input:disabled {
  background: #f7fafc;
  cursor: not-allowed;
}

.hint {
  margin-top: 16px;
  padding: 16px;
  background: #fef5e7;
  border-left: 4px solid #f39c12;
  border-radius: 8px;
  color: #856404;
}

.attempts {
  margin-top: 12px;
  text-align: right;
  color: #718096;
  font-size: 0.9rem;
}

.photo-input {
  margin-bottom: 16px;
}

.photo-preview {
  margin-top: 16px;
  border-radius: 12px;
  overflow: hidden;
}

.photo-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.task-actions {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-hint {
  background: #fef5e7;
  color: #856404;
}

.btn-hint:hover:not(:disabled) {
  background: #fdebd0;
}

.btn-hint:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-complete {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-complete:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background: #fee;
  border-left: 4px solid #f56565;
  border-radius: 8px;
  color: #c53030;
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
</style>