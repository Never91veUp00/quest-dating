<template>
  <div class="quiz-wrap">
    <div class="task__quiz-question">{{ task.game_question }}</div>
    <div class="task__quiz-options">
      <button
        v-for="(opt, oi) in task.game_options"
        :key="oi"
        class="task__quiz-opt"
        :class="{
          correct: answered && oi === task.game_correct,
          wrong:   answered && picked === oi && oi !== task.game_correct,
        }"
        :disabled="answered"
        @click="pick(oi)"
      >
        <span class="task__quiz-opt__letter">{{ 'АБВГ'[oi] }}</span>
        {{ opt }}
      </button>
    </div>
    <div v-if="answered && picked === task.game_correct"
      class="task__quiz-result task__quiz-result--right">
      {{ theme.gender === 'm' ? 'Угадал' : 'Угадала' }}
    </div>
    <div v-if="answered && picked !== task.game_correct"
      class="task__quiz-result task__quiz-result--wrong">
      {{ theme.gender === 'm' ? 'Не угадал' : 'Не угадала' }}
    </div>
    <button v-if="answered" class="task__action" @click="$emit('complete', {
      ...task,
      points: picked === task.game_correct ? (task.points ?? 10) : 0,
      _quizWrong: picked !== task.game_correct,
    })">
      Идти дальше
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete'])

const answered = ref(false)
const picked   = ref(null)

const pick = (idx) => {
  if (answered.value) return
  picked.value   = idx
  answered.value = true
}
</script>

<style scoped>
.quiz-wrap { display: flex; flex-direction: column; gap: 12px; }
.task__quiz-question {
  font-size: .95rem; font-weight: 600; color: var(--ink); line-height: 1.5;
  background: color-mix(in srgb, var(--paper-edge) 28%, var(--paper)); padding: 12px 14px; border-radius: 10px;
}
.task__quiz-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.task__quiz-opt {
  background: color-mix(in srgb, var(--paper) 86%, var(--ink)); border: 1px solid color-mix(in srgb, var(--ink) 30%, var(--paper)); border-radius: 9px;
  padding: 11px 12px; color: var(--ink); font-size: .85rem; cursor: pointer;
  text-align: left; display: flex; align-items: center; gap: 8px; transition: all .2s;
}
.task__quiz-opt:hover:not(:disabled) { border-color: var(--action); }
.task__quiz-opt.correct { border-color: var(--ink); background: color-mix(in srgb, var(--done) 40%, var(--paper)); color: var(--ink); }
.task__quiz-opt.wrong   { border-color: var(--wrong); background: color-mix(in srgb, var(--wrong) 10%, var(--paper)); color: var(--wrong); }
.task__quiz-opt:disabled { cursor: default; }
.task__quiz-opt__letter {
  width: 20px; height: 20px; border-radius: 50%; border: 1px solid color-mix(in srgb, var(--ink) 30%, var(--paper));
  display: flex; align-items: center; justify-content: center;
  font-size: .7rem; font-weight: 700; flex-shrink: 0;
}
.task__quiz-result {
  text-align: center; font-size: .9rem; padding: 8px; border-radius: 8px; font-weight: 600;
}
.task__quiz-result--right { color: var(--ink); background: color-mix(in srgb, var(--done) 40%, var(--paper)); }
.task__quiz-result--wrong { color: var(--wrong); background: color-mix(in srgb, var(--wrong) 10%, var(--paper)); }
@media (max-width: 480px) {
  .task__quiz-options { grid-template-columns: 1fr; gap: 8px; }
  .task__quiz-opt { padding: 14px; min-height: 48px; }
}
</style>
