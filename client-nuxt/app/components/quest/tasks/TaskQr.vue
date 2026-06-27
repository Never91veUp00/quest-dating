<template>
  <div>
    <div class="task__qr-prompt">
      <span class="task__qr-prompt__icon">📷</span>
      <span>{{ task.qr_hint || 'Найди QR-код и отсканируй его' }}</span>
    </div>
    <TaskHint :hint="task.hint" :theme="theme" @hint="$emit('hint', task)" />
    <button class="task__action task__action--qr" @click="$emit('complete', task)">
      ✅ QR отсканирован
    </button>
  </div>
</template>

<script setup>
import TaskHint from './TaskHint.vue'

defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete', 'hint'])
</script>

<style scoped>
.task__qr-prompt {
  display: flex; align-items: center; gap: 10px;
  background: color-mix(in srgb, var(--accent) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 10px; padding: 12px 16px;
  font-size: .9rem; color: var(--text);
}
.task__qr-prompt__icon { font-size: 1.4rem; flex-shrink: 0; }
</style>
