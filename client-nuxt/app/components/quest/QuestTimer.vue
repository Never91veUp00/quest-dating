<template>
  <div class="quest-timer" :class="{ warning: isWarning, critical: isCritical }">
    <div class="timer-header">
      <span class="timer-icon">⏱️</span>
      <span class="timer-label">{{ label }}</span>
    </div>

    <div class="timer-display">
      <div v-if="showHours" class="time-segment">
        <div class="time-value">{{ formattedHours }}</div>
        <div class="time-unit">часов</div>
      </div>

      <div v-if="showHours" class="time-separator">:</div>

      <div class="time-segment">
        <div class="time-value">{{ formattedMinutes }}</div>
        <div class="time-unit">минут</div>
      </div>

      <div class="time-separator">:</div>

      <div class="time-segment">
        <div class="time-value">{{ formattedSeconds }}</div>
        <div class="time-unit">секунд</div>
      </div>
    </div>

    <!-- Прогресс-бар времени -->
    <div v-if="showProgress && totalDuration" class="timer-progress">
      <div 
        class="timer-progress-fill"
        :style="{ width: progressPercentage + '%' }"
      ></div>
    </div>

    <!-- Кнопки управления -->
    <div v-if="showControls" class="timer-controls">
      <button 
        v-if="!isRunning && !isFinished"
        @click="start"
        class="timer-btn btn-start"
      >
        ▶️ Старт
      </button>

      <button 
        v-if="isRunning"
        @click="pause"
        class="timer-btn btn-pause"
      >
        ⏸️ Пауза
      </button>

      <button 
        v-if="!isRunning && elapsedTime > 0 && !isFinished"
        @click="resume"
        class="timer-btn btn-resume"
      >
        ▶️ Продолжить
      </button>

      <button 
        @click="reset"
        class="timer-btn btn-reset"
      >
        🔄 Сброс
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  // Режим: 'stopwatch' (секундомер) или 'countdown' (таймер обратного отсчета)
  mode: {
    type: String,
    default: 'stopwatch',
    validator: (value) => ['stopwatch', 'countdown'].includes(value)
  },
  // Общая длительность в секундах (для countdown)
  totalDuration: {
    type: Number,
    default: null
  },
  // Автостарт
  autoStart: {
    type: Boolean,
    default: false
  },
  // Показывать ли часы
  showHours: {
    type: Boolean,
    default: true
  },
  // Показывать ли прогресс-бар
  showProgress: {
    type: Boolean,
    default: true
  },
  // Показывать ли кнопки управления
  showControls: {
    type: Boolean,
    default: true
  },
  // Метка
  label: {
    type: String,
    default: 'Время'
  }
})

const emit = defineEmits(['start', 'pause', 'resume', 'reset', 'finish', 'tick'])

const elapsedTime = ref(0)
const isRunning = ref(false)
const isFinished = ref(false)
let intervalId = null

const remainingTime = computed(() => {
  if (props.mode === 'countdown' && props.totalDuration) {
    return Math.max(0, props.totalDuration - elapsedTime.value)
  }
  return elapsedTime.value
})

const displayTime = computed(() => {
  return props.mode === 'countdown' ? remainingTime.value : elapsedTime.value
})

const formattedHours = computed(() => {
  return String(Math.floor(displayTime.value / 3600)).padStart(2, '0')
})

const formattedMinutes = computed(() => {
  return String(Math.floor((displayTime.value % 3600) / 60)).padStart(2, '0')
})

const formattedSeconds = computed(() => {
  return String(displayTime.value % 60).padStart(2, '0')
})

const progressPercentage = computed(() => {
  if (!props.totalDuration) return 0
  
  if (props.mode === 'countdown') {
    return (remainingTime.value / props.totalDuration) * 100
  } else {
    return Math.min(100, (elapsedTime.value / props.totalDuration) * 100)
  }
})

const isWarning = computed(() => {
  if (props.mode === 'countdown' && props.totalDuration) {
    const percentage = (remainingTime.value / props.totalDuration) * 100
    return percentage <= 30 && percentage > 10
  }
  return false
})

const isCritical = computed(() => {
  if (props.mode === 'countdown' && props.totalDuration) {
    const percentage = (remainingTime.value / props.totalDuration) * 100
    return percentage <= 10
  }
  return false
})

const start = () => {
  if (isRunning.value) return
  
  isRunning.value = true
  isFinished.value = false
  emit('start')
  
  intervalId = setInterval(() => {
    elapsedTime.value++
    emit('tick', elapsedTime.value)
    
    // Проверка завершения для countdown
    if (props.mode === 'countdown' && remainingTime.value <= 0) {
      finish()
    }
  }, 1000)
}

const pause = () => {
  if (!isRunning.value) return
  
  isRunning.value = false
  clearInterval(intervalId)
  emit('pause')
}

const resume = () => {
  start()
  emit('resume')
}

const reset = () => {
  isRunning.value = false
  isFinished.value = false
  elapsedTime.value = 0
  clearInterval(intervalId)
  emit('reset')
}

const finish = () => {
  isRunning.value = false
  isFinished.value = true
  clearInterval(intervalId)
  emit('finish', elapsedTime.value)
}

// Автостарт
if (props.autoStart) {
  start()
}

// Очистка при размонтировании
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// Экспорт методов для родительского компонента
defineExpose({
  start,
  pause,
  resume,
  reset,
  finish,
  elapsedTime: computed(() => elapsedTime.value),
  isRunning: computed(() => isRunning.value)
})
</script>

<style scoped>
.quest-timer {
  background: white;
  border: 3px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s;
}

.quest-timer.warning {
  border-color: #ed8936;
  background: linear-gradient(to bottom, #fffaf0 0%, white 100%);
}

.quest-timer.critical {
  border-color: #f56565;
  background: linear-gradient(to bottom, #fff5f5 0%, white 100%);
  animation: critical-pulse 1s ease-in-out infinite;
}

@keyframes critical-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 101, 101, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(245, 101, 101, 0);
  }
}

.timer-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.timer-icon {
  font-size: 1.5rem;
}

.timer-label {
  font-size: 1rem;
  font-weight: 600;
  color: #4a5568;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timer-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.time-segment {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-value {
  font-size: 3rem;
  font-weight: 900;
  font-family: 'Courier New', monospace;
  color: #2d3748;
  line-height: 1;
  min-width: 80px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 12px;
  margin-bottom: 8px;
}

.quest-timer.warning .time-value {
  color: #ed8936;
}

.quest-timer.critical .time-value {
  color: #f56565;
}

.time-unit {
  font-size: 0.75rem;
  color: #718096;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.time-separator {
  font-size: 2.5rem;
  font-weight: 900;
  color: #cbd5e0;
  margin: 0 4px;
  align-self: flex-start;
  padding-top: 12px;
}

.timer-progress {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.timer-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
  border-radius: 4px;
  transition: width 1s linear;
}

.quest-timer.warning .timer-progress-fill {
  background: linear-gradient(90deg, #ed8936 0%, #dd6b20 100%);
}

.quest-timer.critical .timer-progress-fill {
  background: linear-gradient(90deg, #f56565 0%, #e53e3e 100%);
}

.timer-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.timer-btn {
  padding: 10px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
  color: #4a5568;
}

.timer-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-start,
.btn-resume {
  background: #48bb78;
  border-color: #48bb78;
  color: white;
}

.btn-start:hover,
.btn-resume:hover {
  background: #38a169;
  border-color: #38a169;
}

.btn-pause {
  background: #ed8936;
  border-color: #ed8936;
  color: white;
}

.btn-pause:hover {
  background: #dd6b20;
  border-color: #dd6b20;
}

.btn-reset:hover {
  border-color: #cbd5e0;
  background: #f7fafc;
}

@media (max-width: 640px) {
  .time-value {
    font-size: 2rem;
    min-width: 60px;
    padding: 8px;
  }

  .time-separator {
    font-size: 2rem;
  }

  .timer-controls {
    flex-direction: column;
  }

  .timer-btn {
    width: 100%;
  }
}
</style>