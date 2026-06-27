<template>
  <div>
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
      Правильно! 🎉
    </div>
    <div v-if="answered && picked !== task.game_correct"
      class="task__quiz-result task__quiz-result--wrong">
      Не угадал(а), правильно: {{ task.game_options[task.game_correct] }}
    </div>
    <button v-if="answered" class="task__action" @click="$emit('complete', task)">
      Продолжаем →
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
.task__quiz-question {
  font-size: .95rem; font-weight: 600; color: var(--text); line-height: 1.5;
  border-left: 2px solid var(--accent); padding-left: 12px;
}
.task__quiz-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.task__quiz-opt {
  background: var(--bg2); border: 1px solid var(--bord); border-radius: 9px;
  padding: 11px 12px; color: var(--text); font-size: .85rem; cursor: pointer;
  text-align: left; display: flex; align-items: center; gap: 8px; transition: all .2s;
}
.task__quiz-opt:hover:not(:disabled) { border-color: var(--accent); }
.task__quiz-opt.correct { border-color: #3cffb4; background: rgba(60,255,180,.1); color: #3cffb4; }
.task__quiz-opt.wrong   { border-color: #f87171; background: rgba(248,113,113,.08); color: #f87171; }
.task__quiz-opt:disabled { cursor: default; }
.task__quiz-opt__letter {
  width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--bord);
  display: flex; align-items: center; justify-content: center;
  font-size: .7rem; font-weight: 700; flex-shrink: 0;
}
.task__quiz-result {
  text-align: center; font-size: .9rem; padding: 8px; border-radius: 8px; font-weight: 600;
}
.task__quiz-result--right { color: #3cffb4; background: rgba(60,255,180,.08); }
.task__quiz-result--wrong { color: #f87171; background: rgba(248,113,113,.08); }
@media (max-width: 480px) {
  .task__quiz-options { grid-template-columns: 1fr; gap: 8px; }
  .task__quiz-opt { padding: 14px; min-height: 48px; }
}
</style>
