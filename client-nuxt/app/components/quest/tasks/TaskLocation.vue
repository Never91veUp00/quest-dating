<template>
  <div>
    <div v-if="task.location_desc" class="task__location-card">
      <div class="task__location-card__icon">📍</div>
      <div class="task__location-card__text">{{ task.location_desc }}</div>
    </div>
    <div v-if="task.location_hint" class="task__hint">💡 {{ task.location_hint }}</div>
    <button class="task__action task__action--location" @click="$emit('complete', task)">
      📍 Я здесь!
    </button>
  </div>
</template>

<script setup>
defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete'])
</script>

<style scoped>
.task__location-card {
  display: flex; align-items: flex-start; gap: 12px;
  background: color-mix(in srgb, var(--accent) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 10px; padding: 14px;
}
.task__location-card__icon { font-size: 1.4rem; flex-shrink: 0; }
.task__location-card__text { font-size: .9rem; line-height: 1.55; color: var(--text); }
</style>
