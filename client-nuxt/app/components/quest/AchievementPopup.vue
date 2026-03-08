<template>
  <teleport to="body">
    <transition name="achievement">
      <div v-if="visible" class="achievement-popup" @click="close">
        <div class="achievement-content" @click.stop>
          <!-- Иконка достижения -->
          <div class="achievement-icon-wrapper">
            <div class="achievement-icon">{{ achievement.icon || '🏆' }}</div>
            <div class="achievement-glow"></div>
          </div>

          <!-- Информация -->
          <div class="achievement-info">
            <div class="achievement-badge">Достижение разблокировано!</div>
            <h3 class="achievement-title">{{ achievement.title }}</h3>
            <p class="achievement-description">{{ achievement.description }}</p>
            
            <!-- Награда -->
            <div v-if="achievement.reward" class="achievement-reward">
              <span class="reward-icon">🎁</span>
              <span class="reward-text">{{ achievement.reward }}</span>
            </div>
          </div>

          <!-- Кнопка закрытия -->
          <button @click="close" class="achievement-close" aria-label="Close">
            ✕
          </button>

          <!-- Конфетти эффект -->
          <div class="confetti-container">
            <div v-for="i in 20" :key="i" class="confetti" :style="getConfettiStyle(i)"></div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  achievement: {
    type: Object,
    default: () => ({})
  },
  show: {
    type: Boolean,
    default: false
  },
  autoClose: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 5000
  }
})

const emit = defineEmits(['close'])

const visible = ref(props.show)
let autoCloseTimeout = null

const close = () => {
  visible.value = false
  emit('close')
  
  if (autoCloseTimeout) {
    clearTimeout(autoCloseTimeout)
  }
}

const getConfettiStyle = (index) => {
  const colors = ['#667eea', '#764ba2', '#48bb78', '#f6ad55', '#fc8181', '#fbbf24']
  const randomColor = colors[Math.floor(Math.random() * colors.length)]
  const randomLeft = Math.random() * 100
  const randomDelay = Math.random() * 2
  const randomDuration = 2 + Math.random() * 2
  
  return {
    left: `${randomLeft}%`,
    backgroundColor: randomColor,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`
  }
}

watch(() => props.show, (newValue) => {
  visible.value = newValue
  
  if (newValue && props.autoClose) {
    autoCloseTimeout = setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>

<style scoped>
.achievement-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.achievement-content {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 48px 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.achievement-icon-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
}

.achievement-icon {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 2;
  animation: bounce 0.6s ease-in-out;
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.achievement-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  z-index: 1;
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.achievement-info {
  color: white;
}

.achievement-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 16px;
  backdrop-filter: blur(10px);
}

.achievement-title {
  font-size: 2rem;
  font-weight: 900;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.achievement-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0 0 20px 0;
  opacity: 0.95;
}

.achievement-reward {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-weight: 700;
  backdrop-filter: blur(10px);
}

.reward-icon {
  font-size: 1.5rem;
}

.reward-text {
  font-size: 1.1rem;
}

.achievement-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(10px);
}

.achievement-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 10px;
  height: 10px;
  top: -10px;
  opacity: 0;
  animation: confetti-fall linear forwards;
}

@keyframes confetti-fall {
  0% {
    top: -10px;
    opacity: 1;
    transform: rotate(0deg);
  }
  100% {
    top: 100%;
    opacity: 0.5;
    transform: rotate(720deg);
  }
}

.achievement-enter-active {
  animation: achievement-appear 0.5s ease-out;
}

.achievement-leave-active {
  animation: achievement-disappear 0.3s ease-in;
}

@keyframes achievement-appear {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes achievement-disappear {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}

@media (max-width: 640px) {
  .achievement-content {
    padding: 40px 24px;
  }

  .achievement-title {
    font-size: 1.5rem;
  }

  .achievement-description {
    font-size: 1rem;
  }
}
</style>