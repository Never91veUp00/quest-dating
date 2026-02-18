import { ref, computed } from 'vue'
import { questService } from '@/services/questService'

export function useQuest() {
  const quest = ref(null)
  const session = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const currentBlockIndex = ref(0)
  const completedTasks = ref([])
  const achievements = ref([])
  const points = ref(0)
  const hintsUsed = ref(0)
  const startTime = ref(null)
  const endTime = ref(null)

  // Загрузить квест
  const loadQuest = async (slug, accessCode = null) => {
    loading.value = true
    error.value = null

    try {
      const params = accessCode ? { access_code: accessCode } : {}
      const response = await questService.getBySlug(slug, params)
      quest.value = response.data
      return response.data
    } catch (err) {
      error.value = err.message || 'Квест не найден'
      console.error('Error loading quest:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Начать квест (создать сессию)
  const startQuest = async (questId) => {
    loading.value = true
    error.value = null

    try {
      const response = await questService.createSession(questId)
      session.value = response.data
      startTime.value = new Date()
      currentBlockIndex.value = 0
      completedTasks.value = []
      points.value = 0
      hintsUsed.value = 0
      achievements.value = []
      return response.data
    } catch (err) {
      error.value = err.message || 'Ошибка создания сессии'
      console.error('Error starting quest:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Завершить задание
  const completeTask = async (taskId, taskData = {}) => {
    if (!session.value) {
      console.error('No active session')
      return
    }

    // Добавить задание в список выполненных
    if (!completedTasks.value.includes(taskId)) {
      completedTasks.value.push(taskId)
    }

    // Добавить очки
    if (taskData.points) {
      points.value += taskData.points
    }

    // Обновить прогресс на сервере
    try {
      await updateProgress()
    } catch (err) {
      console.error('Error updating progress:', err)
    }

    // Проверить достижения
    checkAchievements()

    // Проверить переход к следующему блоку
    const currentBlock = currentBlock.value
    if (currentBlock && currentBlock.tasks) {
      const allTasksCompleted = currentBlock.tasks.every(
        task => completedTasks.value.includes(task.id)
      )

      if (allTasksCompleted) {
        nextBlock()
      }
    }
  }

  // Использовать подсказку
  const useHint = (taskId) => {
    hintsUsed.value++
    // Обновить прогресс
    updateProgress()
  }

  // Следующий блок
  const nextBlock = () => {
    if (currentBlockIndex.value < totalBlocks.value - 1) {
      currentBlockIndex.value++
      updateProgress()
    }
  }

  // Предыдущий блок
  const previousBlock = () => {
    if (currentBlockIndex.value > 0) {
      currentBlockIndex.value--
    }
  }

  // Обновить прогресс
  const updateProgress = async () => {
    if (!session.value) return

    try {
      const progressData = {
        completed_tasks: completedTasks.value,
        current_block_position: currentBlockIndex.value,
        points: points.value,
        achievements: achievements.value,
        hints_used: hintsUsed.value
      }

      await questService.updateProgress(session.value.session_id, progressData)
    } catch (err) {
      console.error('Error updating progress:', err)
    }
  }

  // Завершить квест
  const finishQuest = async () => {
    if (!session.value) {
      console.error('No active session')
      return
    }

    endTime.value = new Date()
    const totalTime = Math.floor((endTime.value - startTime.value) / 1000)

    try {
      const response = await questService.completeQuest(
        session.value.session_id,
        { total_time_seconds: totalTime }
      )
      return response.data
    } catch (err) {
      error.value = err.message || 'Ошибка завершения квеста'
      console.error('Error finishing quest:', err)
      throw err
    }
  }

  // Проверить достижения
  const checkAchievements = () => {
    if (!quest.value) return

    const newAchievements = []

    // Первое задание
    if (completedTasks.value.length === 1 && !hasAchievement('first_task')) {
      newAchievements.push({
        id: 'first_task',
        title: 'Первый шаг',
        description: 'Выполнили первое задание',
        icon: '🎯',
        reward: '+10 баллов'
      })
      points.value += 10
    }

    // Половина квеста
    const completionPercentage = (completedTasks.value.length / totalTasks.value) * 100
    if (completionPercentage >= 50 && !hasAchievement('halfway')) {
      newAchievements.push({
        id: 'halfway',
        title: 'Половина пути',
        description: 'Прошли половину квеста',
        icon: '⚡',
        reward: '+25 баллов'
      })
      points.value += 25
    }

    // Без подсказок
    if (completedTasks.value.length >= 3 && hintsUsed.value === 0 && !hasAchievement('no_hints')) {
      newAchievements.push({
        id: 'no_hints',
        title: 'Эрудит',
        description: 'Прошли 3 задания без подсказок',
        icon: '🧠',
        reward: '+50 баллов'
      })
      points.value += 50
    }

    // Добавить новые достижения
    if (newAchievements.length > 0) {
      achievements.value.push(...newAchievements)
      return newAchievements
    }

    return []
  }

  // Проверить наличие достижения
  const hasAchievement = (achievementId) => {
    return achievements.value.some(a => a.id === achievementId)
  }

  // Получить статистику сессии
  const getSessionStats = async (sessionId) => {
    try {
      const response = await questService.getSessionStats(sessionId)
      return response.data
    } catch (err) {
      console.error('Error getting session stats:', err)
      throw err
    }
  }

  // Computed свойства
  const blocks = computed(() => {
    if (!quest.value || !quest.value.blocks) return []
    return quest.value.blocks
  })

  const currentBlock = computed(() => {
    return blocks.value[currentBlockIndex.value] || null
  })

  const totalBlocks = computed(() => blocks.value.length)

  const totalTasks = computed(() => {
    return blocks.value.reduce((total, block) => {
      return total + (block.tasks?.length || 0)
    }, 0)
  })

  const completedTasksCount = computed(() => completedTasks.value.length)

  const progressPercentage = computed(() => {
    if (totalTasks.value === 0) return 0
    return Math.round((completedTasksCount.value / totalTasks.value) * 100)
  })

  const isQuestComplete = computed(() => {
    return progressPercentage.value === 100
  })

  const elapsedTime = computed(() => {
    if (!startTime.value) return 0
    const now = endTime.value || new Date()
    return Math.floor((now - startTime.value) / 1000)
  })

  const formattedElapsedTime = computed(() => {
    const seconds = elapsedTime.value
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`
  })

  // Сбросить состояние
  const reset = () => {
    quest.value = null
    session.value = null
    currentBlockIndex.value = 0
    completedTasks.value = []
    achievements.value = []
    points.value = 0
    hintsUsed.value = 0
    startTime.value = null
    endTime.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    quest,
    session,
    loading,
    error,
    currentBlockIndex,
    completedTasks,
    achievements,
    points,
    hintsUsed,
    startTime,
    endTime,

    // Computed
    blocks,
    currentBlock,
    totalBlocks,
    totalTasks,
    completedTasksCount,
    progressPercentage,
    isQuestComplete,
    elapsedTime,
    formattedElapsedTime,

    // Methods
    loadQuest,
    startQuest,
    completeTask,
    useHint,
    nextBlock,
    previousBlock,
    updateProgress,
    finishQuest,
    checkAchievements,
    hasAchievement,
    getSessionStats,
    reset
  }
}