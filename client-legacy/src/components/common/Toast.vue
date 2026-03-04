<template>
  <transition-group name="toast" tag="div" class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="`toast--${toast.type}`"
      @click="remove(toast.id)"
    >
      <span class="toast-icon">{{ icons[toast.type] }}</span>
      <span class="toast-message">{{ toast.message }}</span>
    </div>
  </transition-group>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])

const icons = {
  error: '❌',
  success: '✅',
  warning: '⚠️',
  info: 'ℹ️'
}

const add = (message, type = 'error', duration = 4000) => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => remove(id), duration)
}

const remove = (id) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

// Экспортируем методы чтобы App.vue мог вызвать
defineExpose({ add })
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 100px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  min-width: 300px;
  max-width: 420px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  pointer-events: all;
  backdrop-filter: blur(8px);
}

.toast--error {
  background: #fff5f5;
  border-left: 4px solid #fc8181;
  color: #742a2a;
}

.toast--success {
  background: #f0fff4;
  border-left: 4px solid #68d391;
  color: #22543d;
}

.toast--warning {
  background: #fffaf0;
  border-left: 4px solid #f6ad55;
  color: #7b341e;
}

.toast--info {
  background: #ebf8ff;
  border-left: 4px solid #63b3ed;
  color: #2a4365;
}

.toast-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

@media (max-width: 768px) {
  .toast-container {
    top: auto;
    bottom: 24px;
    right: 16px;
    left: 16px;
  }

  .toast {
    min-width: unset;
    width: 100%;
  }
}
</style>