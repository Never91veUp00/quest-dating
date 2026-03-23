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
const icons  = { error: '❌', success: '✅', warning: '⚠️', info: 'ℹ️' }

const add    = (message, type = 'error', duration = 4000) => {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => remove(id), duration)
}
const remove = (id) => { toasts.value = toasts.value.filter(t => t.id !== id) }
defineExpose({ add })
</script>

<style scoped>
.toast-container {
  position: fixed; bottom: max(24px, env(safe-area-inset-bottom));
  left: 16px; right: 16px;
  z-index: 9999; display: flex; flex-direction: column; gap: 8px;
  pointer-events: none;
}
@media (min-width: 640px) {
  .toast-container { left: auto; right: 24px; width: 360px; }
}
.toast {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: 14px;
  font-size: 0.88rem; font-weight: 600;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  cursor: pointer; pointer-events: all;
  backdrop-filter: blur(16px);
  border: 1px solid;
}
.toast--error   { background: rgba(239,68,68,0.15);    border-color: rgba(239,68,68,0.3);    color: #fca5a5; }
.toast--success { background: rgba(16,185,129,0.15);   border-color: rgba(16,185,129,0.3);   color: #6ee7b7; }
.toast--warning { background: rgba(245,158,11,0.15);   border-color: rgba(245,158,11,0.3);   color: #fcd34d; }
.toast--info    { background: rgba(59,130,246,0.15);   border-color: rgba(59,130,246,0.3);   color: #93c5fd; }
.toast-icon { font-size: 1rem; flex-shrink: 0; }
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(16px); }
</style>