<template>
  <div class="task__code-wrap">
    <div class="task__code-hint">
      <QuestIcon class="task__code-hint__icon" name="code" :size="20" />
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
      Проверить код
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TaskHint from './TaskHint.vue'
import { isCodeCorrect } from '~/utils/answerMatch'
import QuestIcon from '../QuestIcon.vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
const emit = defineEmits(['complete', 'hint', 'wrong'])

const code  = ref('')
const error = ref('')

const submit = () => {
  if (!code.value.trim()) return
  if (!isCodeCorrect(code.value, props.task)) {
    error.value = props.theme.copy?.wrongCode || 'Неверный код'
    emit('wrong')
    return
  }
  error.value = ''
  emit('complete', props.task)
}
</script>

<style scoped>
.task__code-wrap { display: flex; flex-direction: column; gap: 12px; }
.task__code-hint {
  display: flex; align-items: center; gap: 10px;
  background: color-mix(in srgb, var(--action) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--action) 20%, transparent);
  border-radius: 10px; padding: 12px 16px;
  font-size: .9rem; color: var(--ink);
}
.task__code-hint__icon { font-size: 1.4rem; flex-shrink: 0; }
.task__input--code { letter-spacing: .35em; text-align: center; font-size: 1.1rem; }
.task__error { margin: 4px 0 0; font-family: var(--font-b); font-size: 1rem; color: var(--wrong); }
</style>
