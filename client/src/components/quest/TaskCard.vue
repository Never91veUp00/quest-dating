<template>
  <div class="task-card" :class="{ completed: task.completed }">
    <!-- Заголовок задания -->
    <div class="task-header">
      <div class="task-icon">
        {{ getTaskIcon(task.type) }}
      </div>
      <div class="task-meta">
        <h4 class="task-title">{{ task.title }}</h4>
        <span class="task-type">{{ getTaskTypeName(task.type) }}</span>
      </div>
      <div v-if="task.completed" class="task-check">✓</div>
    </div>

    <!-- Описание -->
    <div class="task-body">
      <p class="task-description">{{ task.description }}</p>

      <!-- Загадка -->
      <div v-if="task.type === 'riddle' && !task.completed" class="task-riddle">
        <div class="riddle-question">
          <p class="riddle-text">{{ task.question }}</p>
        </div>

        <div class="riddle-answer">
          <input
            v-model="userAnswer"
            type="text"
            class="answer-input"
            placeholder="Ваш ответ..."
            @keyup.enter="checkAnswer"
            :disabled="task.completed"
          />
          <button 
            @click="checkAnswer"
            class="btn-check-answer"
            :disabled="!userAnswer || task.completed"
          >
            Проверить
          </button>
        </div>

        <!-- Подсказка -->
        <div v-if="task.hint && !hintUsed" class="riddle-hint">
          <button @click="showHint" class="btn-hint">
            💡 Показать подсказку (-{{ hintPenalty }} баллов)
          </button>
        </div>

        <div v-if="hintUsed" class="hint-text">
          <strong>Подсказка:</strong> {{ task.hint }}
        </div>
      </div>

      <!-- Фото-задание -->
      <div v-if="task.type === 'photo' && !task.completed" class="task-photo">
        <p class="photo-instruction">{{ task.instruction || 'Сделайте фото по заданию' }}</p>
        
        <input
          ref="photoInput"
          type="file"
          accept="image/*"
          capture="environment"
          class="photo-input-hidden"
          @change="handlePhotoUpload"
        />

        <div v-if="!photoPreview" class="photo-upload-area" @click="triggerPhotoInput">
          <div class="upload-icon">📷</div>
          <p class="upload-text">Нажмите, чтобы сделать фото</p>
        </div>

        <div v-else class="photo-preview">
          <img :src="photoPreview" alt="Preview" />
          <button @click="removePhoto" class="btn-remove-photo">✕</button>
        </div>

        <button 
          v-if="photoPreview"
          @click="submitPhoto"
          class="btn-submit-photo"
        >
          Отправить фото
        </button>
      </div>

      <!-- Простое задание (чекбокс) -->
      <div v-if="task.type === 'simple' && !task.completed" class="task-simple">
        <label class="simple-checkbox">
          <input
            type="checkbox"
            v-model="taskCompleted"
            @change="completeSimpleTask"
          />
          <span>Задание выполнено</span>
        </label>
      </div>

      <!-- Результат проверки -->
      <transition name="result">
        <div v-if="showResult" class="task-result" :class="resultClass">
          <div class="result-icon">{{ resultIcon }}</div>
          <p class="result-text">{{ resultMessage }}</p>
        </div>
      </transition>
    </div>

    <!-- Футер с баллами -->
    <div class="task-footer">
      <div class="task-points">
        <span class="points-label">Награда:</span>
        <span class="points-value">{{ task.points || 100 }} 🏆</span>
      </div>
      <div v-if="task.completed" class="completion-time">
        Выполнено: {{ formatTime(task.completedAt) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['complete-task', 'use-hint'])

const userAnswer = ref('')
const hintUsed = ref(false)
const hintPenalty = ref(20)
const showResult = ref(false)
const resultCorrect = ref(false)
const photoPreview = ref(null)
const photoFile = ref(null)
const photoInput = ref(null)
const taskCompleted = ref(false)

const getTaskIcon = (type) => {
  const icons = {
    riddle: '🧩',
    photo: '📷',
    simple: '✓',
    puzzle: '🧠',
    code: '🔢'
  }
  return icons[type] || '📝'
}

const getTaskTypeName = (type) => {
  const names = {
    riddle: 'Загадка',
    photo: 'Фото-задание',
    simple: 'Задание',
    puzzle: 'Головоломка',
    code: 'Код'
  }
  return names[type] || 'Задание'
}

const resultClass = computed(() => {
  return resultCorrect.value ? 'result-correct' : 'result-incorrect'
})

const resultIcon = computed(() => {
  return resultCorrect.value ? '🎉' : '❌'
})

const resultMessage = computed(() => {
  return resultCorrect.value 
    ? 'Правильно! Задание выполнено!' 
    : 'Неверно. Попробуйте еще раз.'
})

const checkAnswer = () => {
  if (!userAnswer.value) return

  const correctAnswers = props.task.correctAnswers || []
  const isCorrect = correctAnswers.some(answer => 
    answer.toLowerCase().trim() === userAnswer.value.toLowerCase().trim()
  )

  resultCorrect.value = isCorrect
  showResult.value = true

  if (isCorrect) {
    const points = hintUsed.value 
      ? (props.task.points || 100) - hintPenalty.value
      : (props.task.points || 100)
    
    setTimeout(() => {
      emit('complete-task', {
        taskId: props.task.id,
        points,
        answer: userAnswer.value
      })
    }, 1500)
  } else {
    setTimeout(() => {
      showResult.value = false
    }, 2000)
  }
}

const showHint = () => {
  hintUsed.value = true
  emit('use-hint', props.task.id)
}

const triggerPhotoInput = () => {
  photoInput.value?.click()
}

const handlePhotoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    photoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  photoPreview.value = null
  photoFile.value = null
  if (photoInput.value) {
    photoInput.value.value = ''
  }
}

const submitPhoto = () => {
  if (photoFile.value) {
    resultCorrect.value = true
    showResult.value = true
    
    setTimeout(() => {
      emit('complete-task', {
        taskId: props.task.id,
        points: props.task.points || 100,
        photo: photoFile.value
      })
    }, 1500)
  }
}

const completeSimpleTask = () => {
  if (taskCompleted.value) {
    resultCorrect.value = true
    showResult.value = true
    
    setTimeout(() => {
      emit('complete-task', {
        taskId: props.task.id,
        points: props.task.points || 100
      })
    }, 1000)
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>

<style scoped>
.task-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  transition: all 0.3s;
}

.task-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.task-card.completed {
  background: linear-gradient(to bottom, #f0fdf4 0%, white 100%);
  border-color: #48bb78;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.task-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.task-card.completed .task-icon {
  background: #48bb78;
}

.task-meta {
  flex: 1;
}

.task-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.task-type {
  display: inline-block;
  padding: 4px 12px;
  background: #edf2f7;
  color: #4a5568;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.task-check {
  width: 40px;
  height: 40px;
  background: #48bb78;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.task-body {
  margin-bottom: 20px;
}

.task-description {
  color: #4a5568;
  line-height: 1.6;
  margin: 0 0 20px 0;
  font-size: 1rem;
}

.task-riddle {
  background: #f7fafc;
  border-radius: 12px;
  padding: 20px;
}

.riddle-question {
  margin-bottom: 20px;
}

.riddle-text {
  font-size: 1.05rem;
  color: #2d3748;
  font-style: italic;
  margin: 0;
  line-height: 1.6;
}

.riddle-answer {
  display: flex;
  gap: 12px;
}

.answer-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.answer-input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-check-answer {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.btn-check-answer:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-check-answer:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.riddle-hint {
  margin-top: 16px;
  text-align: center;
}

.btn-hint {
  padding: 8px 16px;
  background: #fef3c7;
  border: 2px solid #fbbf24;
  border-radius: 8px;
  color: #78350f;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-hint:hover {
  background: #fde68a;
}

.hint-text {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fffbeb;
  border-left: 4px solid #fbbf24;
  border-radius: 4px;
  color: #78350f;
  font-size: 0.95rem;
}

.task-photo {
  background: #f7fafc;
  border-radius: 12px;
  padding: 20px;
}

.photo-instruction {
  margin: 0 0 16px 0;
  color: #4a5568;
  font-weight: 500;
}

.photo-input-hidden {
  display: none;
}

.photo-upload-area {
  border: 3px dashed #cbd5e0;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.photo-upload-area:hover {
  border-color: #667eea;
  background: #f7fafc;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.upload-text {
  color: #718096;
  margin: 0;
}

.photo-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
}

.photo-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.btn-remove-photo {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-remove-photo:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

.btn-submit-photo {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit-photo:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.task-simple {
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
}

.simple-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: 500;
  color: #2d3748;
}

.simple-checkbox input[type="checkbox"] {
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.task-result {
  margin-top: 20px;
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.task-result.result-correct {
  background: linear-gradient(to right, #d1fae5 0%, #a7f3d0 100%);
  border: 2px solid #48bb78;
}

.task-result.result-incorrect {
  background: linear-gradient(to right, #fee2e2 0%, #fecaca 100%);
  border: 2px solid #f56565;
}

.result-icon {
  font-size: 2rem;
}

.result-text {
  flex: 1;
  font-weight: 600;
  margin: 0;
}

.result-correct .result-text {
  color: #065f46;
}

.result-incorrect .result-text {
  color: #991b1b;
}

.result-enter-active,
.result-leave-active {
  transition: all 0.3s;
}

.result-enter-from,
.result-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 2px solid #e2e8f0;
}

.task-points {
  display: flex;
  align-items: center;
  gap: 8px;
}

.points-label {
  color: #718096;
  font-size: 0.9rem;
}

.points-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #667eea;
}

.completion-time {
  font-size: 0.85rem;
  color: #48bb78;
  font-weight: 600;
}

@media (max-width: 640px) {
  .task-card {
    padding: 20px 16px;
  }

  .riddle-answer {
    flex-direction: column;
  }

  .task-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>