<template>
  <div>
    <div class="task__code-hint">
      <span class="task__code-hint__icon">🔐</span>
      <span>{{ task.code_hint || 'Найди код и введи его ниже' }}</span>
    </div>
    <TaskHint :hint="task.hint" :theme="theme" @hint="$emit('hint', task)" />
    <input
      v-model="code"
      class="task__input task__input--code"
      type="text"
      inputmode="numeric"
      maxlength="8"
      placeholder="_ _ _ _"
      @keydown.enter.prevent="submit"
    />
    <p v-if="error" class="task__error">{{ error }}</p>
    <button class="task__action" :disabled="!code.trim()" @click="submit">
      Ввести код →
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TaskHint from './TaskHint.vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
const emit = defineEmits(['complete', 'hint'])

const code  = ref('')
const error = ref('')

const submit = () => {
  if (!code.value.trim()) return
  const correct = (props.task.correct_code || '').trim()
  if (correct && code.value.trim() !== correct) {
    error.value = props.theme.copy?.wrongCode || 'Неверный код'
    return
  }
  error.value = ''
  emit('complete', props.task)
}
</script>

<style scoped>
.task__code-hint {
  display: flex; align-items: center; gap: 10px;
  background: color-mix(in srgb, var(--accent) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 10px; padding: 12px 16px;
  font-size: .9rem; color: var(--text);
}
.task__code-hint__icon { font-size: 1.4rem; flex-shrink: 0; }
.task__input--code { letter-spacing: .35em; text-align: center; font-size: 1.1rem; }
.task__error { color: #e05c5c; font-size: .82rem; margin: 4px 0 0; }
</style>
