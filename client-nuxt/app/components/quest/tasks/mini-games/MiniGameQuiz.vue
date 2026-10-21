<template>
  <div class="quiz-wrap">
    <div class="task__quiz-question">{{ task.game_question }}</div>
    <div class="task__quiz-options">
      <button
        v-for="(opt, oi) in task.game_options"
        :key="oi"
        class="task__quiz-opt mg-item"
        :class="{
          'is-right': answered && oi === task.game_correct,
          'is-wrong': answered && picked === oi && oi !== task.game_correct,
          'is-dim':   answered && oi !== task.game_correct && picked !== oi,
        }"
        :disabled="answered"
        @click="pick(oi)"
      >
        <span class="mg-item__key" aria-hidden="true">{{ 'АБВГ'[oi] }}</span>
        <span class="task__quiz-opt__txt">{{ opt }}</span>
      </button>
    </div>
    <p v-if="answered && picked === task.game_correct" class="mg-result" role="status">
      {{ theme.gender === 'm' ? 'Угадал' : 'Угадала' }}
    </p>
    <p v-if="answered && picked !== task.game_correct" class="mg-result mg-result--wrong" role="status">
      {{ theme.gender === 'm' ? 'Не угадал' : 'Не угадала' }}
      <span class="mg-result__sub">Верный ответ: {{ task.game_options?.[task.game_correct] }}</span>
    </p>
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

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
const emit = defineEmits(['complete', 'wrong'])

const answered = ref(false)
const picked   = ref(null)

const pick = (idx) => {
  if (answered.value) return
  picked.value   = idx
  answered.value = true
  // неверный выбор — отметка мира на карточке, как у загадки
  if (idx !== props.task.game_correct) emit('wrong')
}
</script>

<style scoped>
.quiz-wrap { display: flex; flex-direction: column; gap: 12px; }
.task__quiz-question {
  font-family: var(--font-d);
  font-weight: var(--font-d-wt, 400);
  font-size: 1.12rem;
  line-height: 1.35;
  color: var(--ink);
  margin: 2px 0 4px;
}
.task__quiz-options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.task__quiz-opt__txt { flex: 1; }
@media (max-width: 480px) {
  .task__quiz-options { grid-template-columns: 1fr; }
}
</style>
