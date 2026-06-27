<template>
  <div>
    <TaskHint :hint="task.hint" :theme="theme" @hint="$emit('hint', task)" />
    <button class="task__action" @click="$emit('complete', task)">
      {{ theme.copy.taskDone }} ✓
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
