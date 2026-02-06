<template>
  <div class="quest-page">
    <!-- Loading состояние -->
    <div v-if="loading" class="quest-loading">
      <div class="spinner-large"></div>
      <p>Загружаем ваше приключение...</p>
    </div>

    <!-- Квест не найден -->
    <div v-else-if="error" class="quest-error">
      <div class="error-icon">😞</div>
      <h1>Квест не найден</h1>
      <p>{{ error }}</p>
      <router-link to="/" class="btn btn-primary">
        Вернуться на главную
      </router-link>
    </div>

    <!-- Отображение квеста -->
    <div v-else-if="quest" class="quest-container">
      <!-- Заголовок квеста -->
      <header class="quest-header">
        <div class="quest-header-bg"></div>
        <div class="quest-header-content">
          <h1 class="quest-title">{{ quest.title }}</h1>
          <p class="quest-subtitle">Ваше приключение начинается прямо сейчас</p>
          
          <div class="quest-stats">
            <div class="stat">
              <div class="stat-icon">📍</div>
              <div class="stat-value">{{ totalLocations }}</div>
              <div class="stat-label">Локаций</div>
            </div>
            <div class="stat">
              <div class="stat-icon">🎯</div>
              <div class="stat-value">{{ totalTasks }}</div>
              <div class="stat-label">Заданий</div>
            </div>
            <div class="stat">
              <div class="stat-icon">⭐</div>
              <div class="stat-value">{{ points }}</div>
              <div class="stat-label">Очков</div>
            </div>
          </div>

          <button v-if="!questStarted" @click="startQuest" class="btn btn-start">
            Начать квест ✨
          </button>
        </div>
      </header>

      <!-- Прогресс квеста -->
      <div v-if="questStarted" class="quest-progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        <span class="progress-text">{{ completedTasks }}/{{ totalTasks }} заданий</span>
      </div>

      <!-- Контент квеста -->
      <div v-if="questStarted" class="quest-content">
        <div class="container">
          <!-- Рендер блоков -->
          <div 
            v-for="(block, index) in quest.blocks" 
            :key="block.id"
            class="quest-block"
            :class="`block-type-${block.type}`"
          >
            <!-- Intro блок -->
            <div v-if="block.type === 'intro'" class="block-intro">
              <div class="block-icon">📜</div>
              <div class="block-content" v-html="formatContent(block.content.text)"></div>
            </div>

            <!-- Map блок -->
            <div v-else-if="block.type === 'map'" class="block-map">
              <h2 class="block-title">🗺️ Ваш маршрут</h2>
              <div class="map-placeholder">
                <p>Интерактивная карта с локациями</p>
                <div class="map-locations">
                  <div 
                    v-for="(location, idx) in block.content.locations" 
                    :key="idx"
                    class="map-location"
                    :class="{ completed: location.completed }"
                  >
                    <div class="location-number">{{ idx + 1 }}</div>
                    <div class="location-info">
                      <h4>{{ location.title }}</h4>
                      <p>{{ location.address }}</p>
                    </div>
                    <div class="location-status">
                      {{ location.completed ? '✓' : '○' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Task блок -->
            <div v-else-if="block.type === 'task'" class="block-task">
              <TaskCard
                :task="block.content"
                :index="index"
                @complete="handleTaskComplete"
              />
            </div>

            <!-- Message блок -->
            <div v-else-if="block.type === 'message'" class="block-message">
              <div class="message-card">
                <div class="message-icon">💌</div>
                <div class="message-text" v-html="formatContent(block.content.text)"></div>
              </div>
            </div>

            <!-- Finale блок -->
            <div v-else-if="block.type === 'finale'" class="block-finale">
              <div class="finale-content">
                <div class="finale-icon">🎉</div>
                <h2>{{ block.content.title }}</h2>
                <div v-html="formatContent(block.content.text)"></div>
                
                <div v-if="allTasksCompleted" class="completion-stats">
                  <h3>Ваши достижения:</h3>
                  <div class="achievements">
                    <div class="achievement">
                      <span class="achievement-icon">⭐</span>
                      <span>{{ points }} очков</span>
                    </div>
                    <div class="achievement">
                      <span class="achievement-icon">⏱️</span>
                      <span>{{ formatTime(elapsedTime) }}</span>
                    </div>
                    <div class="achievement">
                      <span class="achievement-icon">🏆</span>
                      <span>{{ completedTasks }}/{{ totalTasks }} заданий</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating action button -->
      <button 
        v-if="questStarted" 
        class="fab"
        @click="showProgressModal = true"
      >
        📊
      </button>

      <!-- Модалка прогресса -->
      <transition name="modal">
        <div v-if="showProgressModal" class="modal-overlay" @click="showProgressModal = false">
          <div class="modal-content" @click.stop>
            <h2>Ваш прогресс</h2>
            <div class="progress-details">
              <div class="progress-item">
                <span>Выполнено заданий:</span>
                <strong>{{ completedTasks }} / {{ totalTasks }}</strong>
              </div>
              <div class="progress-item">
                <span>Набрано очков:</span>
                <strong>{{ points }}</strong>
              </div>
              <div class="progress-item">
                <span>Время в квесте:</span>
                <strong>{{ formatTime(elapsedTime) }}</strong>
              </div>
            </div>
            <button @click="showProgressModal = false" class="btn btn-primary">
              Продолжить
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuestStore } from '@/store'
import TaskCard from '@/components/quest/TaskCard.vue'
import confetti from 'canvas-confetti'

const route = useRoute()
const questStore = useQuestStore()

const loading = ref(true)
const error = ref(null)
const quest = ref(null)
const questStarted = ref(false)
const completedTasks = ref(0)
const points = ref(0)
const startTime = ref(null)
const elapsedTime = ref(0)
const showProgressModal = ref(false)

let timerInterval = null

const totalLocations = computed(() => {
  if (!quest.value?.blocks) return 0
  const mapBlock = quest.value.blocks.find(b => b.type === 'map')
  return mapBlock?.content?.locations?.length || 0
})

const totalTasks = computed(() => {
  if (!quest.value?.blocks) return 0
  return quest.value.blocks.filter(b => b.type === 'task').length
})

const progress = computed(() => {
  if (totalTasks.value === 0) return 0
  return (completedTasks.value / totalTasks.value) * 100
})

const allTasksCompleted = computed(() => {
  return completedTasks.value === totalTasks.value && totalTasks.value > 0
})

const startQuest = () => {
  questStarted.value = true
  startTime.value = Date.now()
  startTimer()
  
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  })
}

const handleTaskComplete = (taskData) => {
  completedTasks.value++
  points.value += taskData.points || 100
  
  confetti({
    particleCount: 50,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
    colors: ['#667eea', '#764ba2', '#f093fb']
  })
  
  confetti({
    particleCount: 50,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
    colors: ['#667eea', '#764ba2', '#f093fb']
  })

  if (allTasksCompleted.value) {
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 }
      })
    }, 500)
  }
}

const formatContent = (text) => {
  if (!text) return ''
  return text.replace(/\n/g, '<br>')
}

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`
  }
  return `${minutes}м ${secs}с`
}

const startTimer = () => {
  timerInterval = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
  }, 1000)
}

const loadQuest = async () => {
  try {
    loading.value = true
    const slug = route.params.slug
    
    const questData = await questStore.fetchQuest(slug)
    quest.value = questData
  } catch (err) {
    error.value = 'Квест не найден или ещё не опубликован'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadQuest()
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.quest-page {
  min-height: 100vh;
  background: #f7fafc;
}

.quest-loading,
.quest-error {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 5px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 5rem;
  margin-bottom: 20px;
}

.quest-error h1 {
  font-size: 2rem;
  color: #2d3748;
  margin-bottom: 12px;
}

.quest-error p {
  color: #718096;
  margin-bottom: 24px;
}

.quest-header {
  position: relative;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: white;
  text-align: center;
}

.quest-header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.quest-header-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="rgba(255,255,255,0.05)"/><path d="M0 0L60 60M60 0L0 60" stroke="rgba(255,255,255,0.1)" stroke-width="2"/></svg>');
  opacity: 0.3;
}

.quest-header-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  padding: 60px 20px;
}

.quest-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 16px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.quest-subtitle {
  font-size: 1.3rem;
  opacity: 0.9;
  margin-bottom: 40px;
}

.quest-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
}

.stat {
  text-align: center;
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.btn-start {
  padding: 18px 48px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 12px;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.btn-start:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.quest-progress-bar {
  position: sticky;
  top: 80px;
  background: white;
  height: 60px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.5s ease;
}

.progress-text {
  position: relative;
  z-index: 1;
  font-weight: 700;
  color: #2d3748;
  font-size: 1.1rem;
}

.quest-content {
  padding: 60px 0 100px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.quest-block {
  margin-bottom: 60px;
}

.block-intro,
.block-message {
  background: white;
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.block-icon {
  font-size: 4rem;
  text-align: center;
  margin-bottom: 24px;
}

.block-content {
  font-size: 1.15rem;
  line-height: 1.8;
  color: #4a5568;
}

.block-title {
  font-size: 2rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 24px;
  text-align: center;
}

.block-map {
  background: white;
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.map-placeholder {
  background: #f7fafc;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  color: #718096;
}

.map-locations {
  margin-top: 32px;
  display: grid;
  gap: 16px;
}

.map-location {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
}

.map-location:hover {
  border-color: #667eea;
}

.map-location.completed {
  background: rgba(72, 187, 120, 0.1);
  border-color: #48bb78;
}

.location-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  flex-shrink: 0;
}

.location-info {
  flex: 1;
  text-align: left;
}

.location-info h4 {
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
}

.location-info p {
  font-size: 0.9rem;
  color: #718096;
}

.location-status {
  font-size: 1.5rem;
  color: #48bb78;
}

.message-card {
  text-align: center;
}

.message-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.message-text {
  font-size: 1.2rem;
  line-height: 1.8;
  color: #4a5568;
}

.block-finale {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  padding: 60px 48px;
  text-align: center;
}

.finale-icon {
  font-size: 5rem;
  margin-bottom: 24px;
}

.finale-content h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 20px;
}

.completion-stats {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 2px solid rgba(255, 255, 255, 0.2);
}

.completion-stats h3 {
  font-size: 1.5rem;
  margin-bottom: 24px;
}

.achievements {
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.achievement {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.achievement-icon {
  font-size: 2.5rem;
}

.fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  transition: all 0.3s;
  z-index: 500;
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 24px;
  padding: 48px;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  font-size: 2rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 24px;
  text-align: center;
}

.progress-details {
  display: grid;
  gap: 16px;
  margin-bottom: 32px;
}

.progress-item {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background: #f7fafc;
  border-radius: 12px;
}

.btn-primary {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .quest-title {
    font-size: 2.5rem;
  }

  .quest-stats {
    flex-direction: column;
    gap: 20px;
  }

  .block-intro,
  .block-message,
  .block-map,
  .block-finale {
    padding: 32px 24px;
  }

  .fab {
    bottom: 20px;
    right: 20px;
  }
}
</style>