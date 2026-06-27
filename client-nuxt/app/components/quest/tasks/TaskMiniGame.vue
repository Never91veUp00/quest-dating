<template>
  <component
    :is="gameComponent"
    v-if="gameComponent"
    :task="task"
    :theme="theme"
    @complete="$emit('complete', $event)"
    @skip-task="$emit('skip-task', $event)"
  />
  <div v-else class="task__wrong">Неизвестный тип игры: {{ task.game_type }}</div>
</template>

<script setup>
import { computed } from 'vue'
import MiniGameQuiz   from './mini-games/MiniGameQuiz.vue'
import MiniGamePairs  from './mini-games/MiniGamePairs.vue'
import MiniGamePuzzle from './mini-games/MiniGamePuzzle.vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete', 'skip-task'])

const GAME_MAP = { quiz: MiniGameQuiz, pairs: MiniGamePairs, puzzle: MiniGamePuzzle }
const gameComponent = computed(() => GAME_MAP[props.task.game_type] || null)
</script>
