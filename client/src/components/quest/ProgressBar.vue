<template>
  <div class="progress-bar-container">
    <!-- Заголовок с прогрессом -->
    <div class="progress-header">
      <h4 class="progress-title">Прогресс квеста</h4>
      <span class="progress-percentage">{{ progressPercentage }}%</span>
    </div>

    <!-- Основной прогресс-бар -->
    <div class="progress-bar">
      <div 
        class="progress-fill"
        :style="{ 
          width: progressPercentage + '%',
          background: progressGradient
        }"
      >
        <div class="progress-shine"></div>
      </div>
    </div>

    <!-- Детальная статистика -->
    <div class="progress-stats">
      <div class="stat-item">
        <span class="stat-icon">✅</span>
        <span class="stat-label">Выполнено:</span>
        <span class="stat-value">{{ completedTasks }} / {{ totalTasks }}</span>
      </div>

      <div class="stat-item">
        <span class="stat-icon">🏆</span>
        <span class="stat-label">Очки:</span>
        <span class="stat-value">{{ currentPoints }}</span>
      </div>

      <div v-if="maxPoints" class="stat-item">
        <span class="stat-icon">⭐</span>
        <span class="stat-label">Макс. очки:</span>
        <span class="stat-value">{{ maxPoints }}</span>
      </div>

      <div v-if="hintsUsed > 0" class="stat-item">
        <span class="stat-icon">💡</span>
        <span class="stat-label">Подсказок:</span>
        <span class="stat-value">{{ hintsUsed }}</span>
      </div>
    </div>

    <!-- Вехи прогресса -->
    <div v-if="showMilestones" class="progress-milestones">
      <div
        v-for="milestone in milestones"
        :key="milestone.percentage"
        class="milestone"
        :class="{ 
          reached: progressPercentage >= milestone.percentage,
          current: isCurrentMilestone(milestone.percentage)
        }"
        :style="{ left: milestone.percentage + '%' }"
      >
        <div class="milestone-marker">
          <span v-if="progressPercentage >= milestone.percentage">✓</span>
          <span v-else>{{ milestone.icon }}</span>
        </div>
        <div class="milestone-label">{{ milestone.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  completedTasks: {
    type: Number,
    required: true,
    default: 0
  },
  totalTasks: {
    type: Number,
    required: true,
    default: 1
  },
  currentPoints: {
    type: Number,
    default: 0
  },
  maxPoints: {
    type: Number,
    default: null
  },
  hintsUsed: {
    type: Number,
    default: 0
  },
  showMilestones: {
    type: Boolean,
    default: true
  }
})

const progressPercentage = computed(() => {
  if (props.totalTasks === 0) return 0
  return Math.round((props.completedTasks / props.totalTasks) * 100)
})

const progressGradient = computed(() => {
  const percentage = progressPercentage.value
  
  if (percentage < 25) {
    return 'linear-gradient(90deg, #f56565 0%, #fc8181 100%)'
  } else if (percentage < 50) {
    return 'linear-gradient(90deg, #ed8936 0%, #f6ad55 100%)'
  } else if (percentage < 75) {
    return 'linear-gradient(90deg, #ecc94b 0%, #f6e05e 100%)'
  } else if (percentage < 100) {
    return 'linear-gradient(90deg, #48bb78 0%, #68d391 100%)'
  } else {
    return 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
  }
})

const milestones = [
  { percentage: 25, label: 'Начало', icon: '🚀' },
  { percentage: 50, label: 'Половина пути', icon: '⚡' },
  { percentage: 75, label: 'Почти готово', icon: '🔥' },
  { percentage: 100, label: 'Финиш', icon: '🎉' }
]

const isCurrentMilestone = (percentage) => {
  const currentProgress = progressPercentage.value
  
  if (percentage === 25) {
    return currentProgress >= 25 && currentProgress < 50
  } else if (percentage === 50) {
    return currentProgress >= 50 && currentProgress < 75
  } else if (percentage === 75) {
    return currentProgress >= 75 && currentProgress < 100
  } else if (percentage === 100) {
    return currentProgress === 100
  }
  
  return false
}
</script>

<style scoped>
.progress-bar-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.progress-percentage {
  font-size: 1.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-bar {
  width: 100%;
  height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  margin-bottom: 20px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  border-radius: 12px;
  transition: width 0.5s ease, background 0.3s ease;
  position: relative;
  overflow: hidden;
}

.progress-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: shine 2s infinite;
}

@keyframes shine {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
  font-size: 0.9rem;
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-label {
  color: #718096;
}

.stat-value {
  margin-left: auto;
  font-weight: 700;
  color: #2d3748;
}

.progress-milestones {
  position: relative;
  height: 60px;
  margin-top: 32px;
}

.milestone {
  position: absolute;
  transform: translateX(-50%);
  text-align: center;
  transition: all 0.3s;
}

.milestone-marker {
  width: 36px;
  height: 36px;
  background: #e2e8f0;
  border: 3px solid #cbd5e0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  margin: 0 auto 8px;
  transition: all 0.3s;
}

.milestone.reached .milestone-marker {
  background: #48bb78;
  border-color: #48bb78;
  color: white;
  transform: scale(1.1);
}

.milestone.current .milestone-marker {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  transform: scale(1.2);
  animation: pulse-milestone 2s ease-in-out infinite;
}

@keyframes pulse-milestone {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
  }
}

.milestone-label {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 600;
  white-space: nowrap;
}

.milestone.reached .milestone-label {
  color: #48bb78;
}

.milestone.current .milestone-label {
  color: #667eea;
}

@media (max-width: 640px) {
  .progress-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .progress-milestones {
    display: none;
  }
}
</style>