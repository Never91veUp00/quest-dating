<template>
  <div class="task__riddle-wrap">
    <p v-if="task.riddle_text" class="task__riddle">{{ task.riddle_text }}</p>
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
      Проверить
    </button>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import TaskHint from './TaskHint.vue'
import { isAnswerCorrect } from '~/utils/answerMatch'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
const emit = defineEmits(['complete', 'hint', 'wrong'])

const answer = ref('')
const error  = ref('')

const submit = () => {
  if (!answer.value.trim()) return
  const correct = (props.task.answer || props.task.correct_answer || '').trim()
  if (correct && !isAnswerCorrect(answer.value, correct)) {
    error.value = props.theme.copy?.wrongAnswer || 'Неверно, попробуй ещё раз'
    emit('wrong')
    return
  }
  error.value = ''
  emit('complete', props.task)
}
</script>

<style scoped>
.task__riddle-wrap { display: flex; flex-direction: column; gap: 12px; }
.task__riddle {
  margin: 0;
  font-family: var(--font-b);
  font-size: 1.1rem; font-style: italic; line-height: 1.6;
  color: var(--ink);
  background: color-mix(in srgb, var(--paper-edge) 28%, var(--paper));
  padding: 12px 14px; border-radius: 10px;
}
.task__error { margin: 4px 0 0; font-family: var(--font-b); font-size: 1rem; color: var(--wrong); }
</style>
