<!-- client-nuxt/app/components/quest/tasks/TaskHint.vue -->
<template>
  <template v-if="hint">
    <button v-if="!shown" class="task__hint-btn" @click="show">
      {{ theme.copy.hintBtn }}
    </button>
    <div v-else class="task__hint">💡 {{ hint }}</div>
  </template>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  hint:  { type: String, default: '' },
  theme: { type: Object, required: true },
})
const emit = defineEmits(['hint'])

const shown = ref(false)
const show  = () => { shown.value = true; emit('hint') }
</script>
