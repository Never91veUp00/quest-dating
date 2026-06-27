<template>
  <div>
    <div class="task__riddle">{{ task.riddle_text }}</div>
    <TaskHint :hint="task.hint" :theme="theme" @hint="$emit('hint', task)" />
    <input
      v-model="answer"
      class="task__input"
      type="text"
      :placeholder="task.answer_placeholder || 'Ответ...'"
      @keydown.enter.prevent="submit"
    />
    <p v-if="error" class="task__error">{{ error }}</p>
    <button class="task__action" :disabled="!answer.trim()" @click="submit">
      Проверить →
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

const answer = ref('')
const error  = ref('')

const submit = () => {
  if (!answer.value.trim()) return
  const correct = (props.task.correct_answer || '').trim().toLowerCase()
  if (correct && answer.value.trim().toLowerCase() !== correct) {
    error.value = props.theme.copy?.wrongAnswer || 'Неверно, попробуй ещё раз'
    return
  }
  error.value = ''
  emit('complete', props.task)
}
</script>

<style scoped>
.task__riddle {
  font-size: 1.05rem; font-style: italic; line-height: 1.6;
  color: var(--text); padding: 14px 16px;
  background: color-mix(in srgb, var(--accent) 5%, transparent);
  border-left: 3px solid var(--accent); border-radius: 0 8px 8px 0;
}
.task__error { color: #e05c5c; font-size: .82rem; margin: 4px 0 0; }
</style>
