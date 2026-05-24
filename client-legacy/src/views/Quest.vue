<template>
  <div class="quest-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <Loader text="Загружаем квест..." size="large" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-content">
        <div class="error-icon">😞</div>
        <h2>Квест не найден</h2>
        <p>{{ error }}</p>
        <router-link to="/" class="btn-back">
          ← На главную
        </router-link>
      </div>
    </div>

    <!-- Access Code Modal -->
    <Modal v-model="showAccessCodeModal" size="small" :closable="false">
      <template #default>
        <div class="access-code-modal">
          <h3 class="modal-title">Введите код доступа</h3>
          <p class="modal-description">
            Для запуска квеста необходим уникальный код доступа, который вы получили при заказе.
          </p>
          <form @submit.prevent="handleAccessCodeSubmit">
            <div class="form-group">
              <input
                v-model="accessCode"
                type="text"
                class="code-input"
                placeholder="XXXX-XXXX-XXXX"
                maxlength="14"
                required
              />
            </div>
            <button type="submit" class="btn-submit" :disabled="!accessCode">
              Начать квест
            </button>
          </form>
        </div>
      </template>
    </Modal>

    <!-- Quest Content -->
    <div v-if="questData && sessionData" class="quest-content">
      <!-- Quest Header -->
      <header class="quest-header">
        <div class="container">
          <div class="header-content">
            <h1 class="quest-title">{{ questData.title }}</h1>
            <div class="quest-meta">
              <span class="meta-item">{{ questData.category_name }}</span>
              <span class="separator">•</span>
              <span class="meta-item">{{ blocks.length }} локаций</span>
            </div>
          </div>
          <div class="header-actions">
            <button @click="showExitConfirm = true" class="btn-exit">
              Завершить квест
            </button>
          </div>
        </div>
      </header>

      <!-- Progress Section -->
      <section class="progress-section">
        <div class="container">
          <ProgressBar
            :completed-tasks="completedTasksCount"
            :total-tasks="totalTasks"
            :current-points="points"
            :max-points="questData.max_points"
            :hints-used="hintsUsed"
          />
        </div>
      </section>

      <!-- Main Content -->
      <section class="quest-main">
        <div class="container">
          <div class="quest-layout">
            <!-- Map Sidebar -->
            <aside class="quest-sidebar">
              <QuestMap
                :locations="questData.blocks || []"
                :current-location="currentBlockIndex"
              />
              <QuestTimer
                mode="stopwatch"
                :auto-start="true"
                label="Время в пути"
                :show-progress="false"
              />
            </aside>

            <!-- Tasks Area -->
            <main class="quest-tasks">
              <div v-if="currentBlock" class="current-block">
                <div class="block-header">
                  <h2 class="block-title">{{ currentBlock.title }}</h2>
                  <p v-if="currentBlock.description" class="block-description">
                    {{ currentBlock.description }}
                  </p>
                </div>

                <!-- Tasks -->
                <div class="tasks-list">
                  <TaskCard
                    v-for="task in currentBlock.tasks"
                    :key="task.id"
                    :task="task"
                    @complete-task="handleCompleteTask"
                    @use-hint="handleUseHint"
                  />
                </div>

                <!-- Navigation -->
                <div class="block-navigation">
                  <button
                    v-if="currentBlockIndex > 0"
                    @click="previousBlock"
                    class="btn-nav btn-prev"
                  >
                    ← Предыдущая локация
                  </button>
                  <button
                    v-if="canProceed && currentBlockIndex < totalBlocks - 1"
                    @click="nextBlock"
                    class="btn-nav btn-next"
                  >
                    Следующая локация →
                  </button>
                  <button
                    v-if="canProceed && isLastBlock"
                    @click="showFinishConfirm = true"
                    class="btn-finish"
                  >
                    🎉 Завершить квест
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      <!-- Achievement Popup -->
      <AchievementPopup
        v-if="currentAchievement"
        :achievement="currentAchievement"
        :show="showAchievement"
        @close="handleAchievementClose"
      />

      <!-- Exit Confirmation Modal -->
      <Modal v-model="showExitConfirm" size="small">
        <template #default>
          <div class="confirm-modal">
            <h3 class="confirm-title">Завершить квест?</h3>
            <p class="confirm-message">
              Вы уверены, что хотите завершить квест? Ваш прогресс будет сохранен.
            </p>
            <div class="confirm-actions">
              <button @click="showExitConfirm = false" class="btn-cancel">
                Отмена
              </button>
              <button @click="handleExit" class="btn-confirm">
                Завершить
              </button>
            </div>
          </div>
        </template>
      </Modal>

      <!-- Finish Confirmation Modal -->
      <Modal v-model="showFinishConfirm" size="medium">
        <template #default>
          <div class="finish-modal">
            <div class="finish-icon">🎉</div>
            <h3 class="finish-title">Поздравляем!</h3>
            <p class="finish-message">
              Вы прошли все локации квеста! Готовы завершить приключение?
            </p>
            <div class="finish-stats">
              <div class="finish-stat">
                <div class="stat-label">Выполнено заданий</div>
                <div class="stat-value">{{ completedTasksCount }} / {{ totalTasks }}</div>
              </div>
              <div class="finish-stat">
                <div class="stat-label">Набрано баллов</div>
                <div class="stat-value">{{ points }}</div>
              </div>
              <div class="finish-stat">
                <div class="stat-label">Использовано подсказок</div>
                <div class="stat-value">{{ hintsUsed }}</div>
              </div>
            </div>
            <div class="finish-actions">
              <button @click="showFinishConfirm = false" class="btn-cancel">
                Отмена
              </button>
              <button @click="handleFinish" class="btn-finish-confirm">
                Завершить квест
              </button>
            </div>
          </div>
        </template>
      </Modal>

      <!-- Completion Modal -->
      <Modal v-model="showCompletionModal" size="large" :closable="false">
        <template #default>
          <div class="completion-modal">
            <div class="completion-header">
              <div class="completion-icon">🏆</div>
              <h2 class="completion-title">Квест завершен!</h2>
            </div>

            <div class="completion-stats">
              <div class="completion-stat">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                  <div class="stat-number">{{ completedTasksCount }}</div>
                  <div class="stat-label">Заданий выполнено</div>
                </div>
              </div>
              <div class="completion-stat">
                <div class="stat-icon">🏆</div>
                <div class="stat-content">
                  <div class="stat-number">{{ points }}</div>
                  <div class="stat-label">Баллов заработано</div>
                </div>
              </div>
              <div class="completion-stat">
                <div class="stat-icon">⏱️</div>
                <div class="stat-content">
                  <div class="stat-number">{{ formattedElapsedTime }}</div>
                  <div class="stat-label">Время прохождения</div>
                </div>
              </div>
            </div>

            <div v-if="achievements.length > 0" class="completion-achievements">
              <h3 class="achievements-title">Получено достижений</h3>
              <div class="achievements-grid">
                <div
                  v-for="achievement in achievements"
                  :key="achievement.id"
                  class="achievement-badge"
                >
                  <div class="badge-icon">{{ achievement.icon }}</div>
                  <div class="badge-name">{{ achievement.title }}</div>
                </div>
              </div>
            </div>

            <div class="completion-actions">
              <router-link to="/" class="btn-home">
                На главную
              </router-link>
              <button @click="shareResults" class="btn-share">
                📤 Поделиться результатом
              </button>
            </div>
          </div>
        </template>
      </Modal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuest } from '@/composables/useQuest'
import Modal from '@/components/common/Modal.vue'
import Loader from '@/components/common/Loader.vue'
import ProgressBar from '@/components/quest/ProgressBar.vue'
import QuestMap from '@/components/quest/QuestMap.vue'
import TaskCard from '@/components/quest/TaskCard.vue'
import QuestTimer from '@/components/quest/QuestTimer.vue'
import AchievementPopup from '@/components/quest/AchievementPopup.vue'

const route = useRoute()
const router = useRouter()

const {
  quest: questData,
  session: sessionData,
  loading,
  error,
  currentBlockIndex,
  completedTasks,
  achievements,
  points,
  hintsUsed,
  currentBlock,
  totalBlocks,
  totalTasks,
  completedTasksCount,
  isQuestComplete,
  formattedElapsedTime,
  blocks,
  loadQuest,
  startQuest,
  completeTask,
  useHint,
  nextBlock,
  previousBlock,
  finishQuest
} = useQuest()

const showAccessCodeModal = ref(true)
const accessCode = ref('')
const showExitConfirm = ref(false)
const showFinishConfirm = ref(false)
const showCompletionModal = ref(false)
const showAchievement = ref(false)
const currentAchievement = ref(null)

const canProceed = computed(() => {
  if (!currentBlock.value?.tasks) return false
  return currentBlock.value.tasks.every(task =>
    completedTasks.value.includes(task.id)
  )
})

const isLastBlock = computed(() => {
  return currentBlockIndex.value === totalBlocks.value - 1
})

const handleAccessCodeSubmit = async () => {
  try {
    const slug = route.params.slug
    await loadQuest(slug, accessCode.value)

    // Если квест загружен успешно, создаем сессию
    if (questData.value) {
      await startQuest(questData.value.id)
      showAccessCodeModal.value = false
    }
  } catch (err) {
    alert('Неверный код доступа. Пожалуйста, проверьте код и попробуйте снова.')
    console.error('Access code error:', err)
  }
}

const handleCompleteTask = (taskData) => {
  completeTask(taskData.taskId, taskData)

  // Проверяем новые достижения
  const newAchievements = achievements.value.filter(
    a => !currentAchievement.value || a.id !== currentAchievement.value.id
  )

  if (newAchievements.length > 0) {
    currentAchievement.value = newAchievements[newAchievements.length - 1]
    showAchievement.value = true
  }
}

const handleUseHint = (taskId) => {
  useHint(taskId)
}

const handleAchievementClose = () => {
  showAchievement.value = false
  setTimeout(() => {
    currentAchievement.value = null
  }, 300)
}

const handleExit = () => {
  showExitConfirm.value = false
  router.push('/')
}

const handleFinish = async () => {
  try {
    await finishQuest()
    showFinishConfirm.value = false
    showCompletionModal.value = true
  } catch (err) {
    console.error('Error finishing quest:', err)
    alert('Произошла ошибка при завершении квеста')
  }
}

const shareResults = () => {
  if (!questData.value) return
  
  const text = `Я прошел квест "${questData.value.title}" и набрал ${points.value} баллов! 🎉`
  
  if (navigator.share) {
    navigator.share({
      title: 'Результат квеста',
      text: text,
      url: window.location.origin
    }).catch(err => console.log('Error sharing:', err))
  } else {
    // Fallback: копируем в буфер обмена
    navigator.clipboard.writeText(text).then(() => {
      alert('Результат скопирован в буфер обмена!')
    }).catch(err => console.error('Copy error:', err))
  }
}

// Предотвращаем случайный выход со страницы
const handleBeforeUnload = (e) => {
  if (sessionData.value && !isQuestComplete.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  // Добавляем обработчик beforeunload
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.quest-page {
  min-height: 100vh;
  background: #f7fafc;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40px 20px;
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-icon {
  font-size: 5rem;
  margin-bottom: 24px;
}

.error-content h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.error-content p {
  color: #718096;
  margin: 0 0 32px 0;
}

.btn-back {
  display: inline-block;
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-back:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Access Code Modal */
.access-code-modal {
  text-align: center;
  padding: 20px;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.modal-description {
  color: #718096;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 20px;
}

.code-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1.25rem;
  text-align: center;
  letter-spacing: 2px;
  font-weight: 600;
  text-transform: uppercase;
  transition: border-color 0.3s;
}

.code-input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-submit {
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Quest Header */
.quest-header {
  background: white;
  border-bottom: 2px solid #e2e8f0;
  padding: 24px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.quest-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  flex: 1;
}

.quest-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.quest-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #718096;
  font-size: 0.95rem;
}

.meta-item {
  display: inline-block;
}

.separator {
  color: #cbd5e0;
}

.header-actions {
  flex-shrink: 0;
}

.btn-exit {
  padding: 10px 24px;
  background: transparent;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  color: #718096;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-exit:hover {
  border-color: #f56565;
  color: #f56565;
}

/* Progress Section */
.progress-section {
  padding: 24px 0;
}

/* Quest Main */
.quest-main {
  padding: 32px 0 80px;
}

.quest-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 32px;
}

.quest-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 140px;
  align-self: flex-start;
}

.quest-tasks {
  min-width: 0;
}

.current-block {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.block-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
}

.block-title {
  font-size: 2rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.block-description {
  color: #718096;
  line-height: 1.6;
  margin: 0;
  font-size: 1.05rem;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.block-navigation {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding-top: 24px;
  border-top: 2px solid #e2e8f0;
}

.btn-nav,
.btn-finish {
  padding: 14px 28px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-size: 1rem;
}

.btn-prev {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-prev:hover {
  background: #f7fafc;
}

.btn-next {
  background: #667eea;
  color: white;
  margin-left: auto;
}

.btn-next:hover {
  background: #764ba2;
  transform: translateY(-2px);
}

.btn-finish {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  margin-left: auto;
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

.btn-finish:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(72, 187, 120, 0.5);
}

/* Modals */
.confirm-modal,
.finish-modal {
  text-align: center;
  padding: 20px;
}

.confirm-title,
.finish-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.confirm-message,
.finish-message {
  color: #718096;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.finish-icon {
  font-size: 5rem;
  margin-bottom: 16px;
}

.finish-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
  padding: 24px;
  background: #f7fafc;
  border-radius: 12px;
}

.finish-stat {
  text-align: center;
}

.stat-label {
  font-size: 0.85rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.confirm-actions,
.finish-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-cancel,
.btn-confirm,
.btn-finish-confirm {
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
}

.btn-cancel {
  background: #f7fafc;
  color: #718096;
  border: 2px solid #e2e8f0;
}

.btn-cancel:hover {
  background: #edf2f7;
}

.btn-confirm {
  background: #f56565;
  color: white;
}

.btn-confirm:hover {
  background: #e53e3e;
}

.btn-finish-confirm {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
}

.btn-finish-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.4);
}

/* Completion Modal */
.completion-modal {
  padding: 40px 20px;
}

.completion-header {
  text-align: center;
  margin-bottom: 40px;
}

.completion-icon {
  font-size: 6rem;
  margin-bottom: 20px;
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.completion-title {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.completion-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.completion-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #f7fafc;
  border-radius: 12px;
}

.stat-icon {
  font-size: 3rem;
}

.stat-content {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 900;
  color: #2d3748;
  margin-bottom: 4px;
}

.completion-achievements {
  margin-bottom: 40px;
}

.achievements-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  text-align: center;
  margin: 0 0 24px 0;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;
}

.achievement-badge {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #fff5eb 0%, #ffe9cc 100%);
  border: 2px solid #fbbf24;
  border-radius: 12px;
}

.badge-icon {
  font-size: 3rem;
  margin-bottom: 8px;
}

.badge-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #78350f;
}

.completion-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-home,
.btn-share {
  padding: 14px 32px;
  border-radius: 10px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  font-size: 1rem;
}

.btn-home {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: inline-block;
}

.btn-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-share {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-share:hover {
  background: #f7fafc;
}

/* Responsive */
@media (max-width: 1024px) {
  .quest-layout {
    grid-template-columns: 1fr;
  }

  .quest-sidebar {
    position: static;
  }
}

@media (max-width: 640px) {
  /* Header — компактный, однострочный */
  .quest-header {
    padding: 12px 0;
  }

  .quest-header .container {
    flex-direction: row;
    align-items: center;
    gap: 12px;
  }

  .quest-title {
    font-size: 1rem;
    margin-bottom: 2px;
  }

  .quest-meta {
    font-size: 0.78rem;
    gap: 6px;
  }

  .btn-exit {
    padding: 7px 12px;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  /* Progress — компактный */
  .progress-section {
    padding: 12px 0;
  }

  /* Сайдбар — карта скрыта на мобиле, таймер компактный */
  .quest-sidebar {
    display: none;
  }

  /* Основной контент */
  .quest-main {
    padding: 12px 0 32px;
  }

  .quest-layout {
    gap: 0;
  }

  .current-block {
    padding: 16px;
    border-radius: 12px;
  }

  .block-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .block-title {
    font-size: 1.2rem;
    margin-bottom: 6px;
  }

  .block-description {
    font-size: 0.9rem;
  }

  .tasks-list {
    gap: 12px;
    margin-bottom: 16px;
  }

  /* Навигация — кнопки на всю ширину */
  .block-navigation {
    flex-direction: column;
    gap: 10px;
    padding-top: 16px;
  }

  .btn-nav,
  .btn-finish {
    width: 100%;
    padding: 12px 16px;
    font-size: 0.95rem;
    text-align: center;
  }

  .btn-next,
  .btn-finish {
    margin-left: 0;
  }

  /* Модалки */
  .finish-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding: 16px;
  }

  .stat-value {
    font-size: 1.4rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .confirm-actions,
  .finish-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-confirm,
  .btn-finish-confirm {
    width: 100%;
  }

  .completion-modal {
    padding: 20px 12px;
  }

  .completion-icon {
    font-size: 4rem;
    margin-bottom: 12px;
  }

  .completion-title {
    font-size: 1.8rem;
  }

  .completion-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 24px;
  }

  .completion-stat {
    padding: 12px 8px;
    gap: 6px;
  }

  .stat-icon {
    font-size: 1.8rem;
  }

  .stat-number {
    font-size: 1.6rem;
  }

  .completion-actions {
    flex-direction: column;
    gap: 10px;
  }

  .btn-home,
  .btn-share {
    width: 100%;
    text-align: center;
    padding: 12px 16px;
  }
}
</style>