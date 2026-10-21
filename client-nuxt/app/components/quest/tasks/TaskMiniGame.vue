<template>
  <!-- Quiz рендерится инлайн без оверлея -->
  <div v-if="task.game_type === 'quiz'" class="mgw" :class="worldClass">
    <MiniGameQuiz
      :task="task"
      :theme="theme"
      @complete="$emit('complete', $event)"
      @skip-task="$emit('skip-task', $event)"
      @wrong="$emit('wrong')"
    />
  </div>

  <!-- Pairs и Puzzle — кнопка запуска + полноэкранный оверлей -->
  <template v-else>
    <div class="mg-launch mgw" :class="worldClass">
      <button class="mg-launch__btn mg-item" @click="open = true">
        <QuestIcon class="mg-launch__ico" name="game" :size="26" />
        <span class="mg-launch__txt">{{ gameLabel }}</span>
        <QuestIcon class="mg-launch__arrow" name="forward" :size="22" />
      </button>
    </div>

    <MiniGameOverlay v-model="open" :task="task" :cssVars="cssVars" :decor="theme.world?.decor">
      <component
        v-if="gameComponent"
        :is="gameComponent"
        :task="task"
        :theme="theme"
        @complete="onComplete"
        @skip-task="onSkip"
      />
    </MiniGameOverlay>
  </template>
</template>

<script setup>
import { ref, computed } from 'vue'
import { themeToCssVars } from '~/components/quest/themes.js'
import MiniGameOverlay from './mini-games/MiniGameOverlay.vue'
import MiniGameQuiz    from './mini-games/MiniGameQuiz.vue'
import MiniGamePairs   from './mini-games/MiniGamePairs.vue'
import MiniGamePuzzle  from './mini-games/MiniGamePuzzle.vue'
import QuestIcon from '../QuestIcon.vue'
import './mini-games/mg-worlds.css'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
const emit = defineEmits(['complete', 'skip-task', 'wrong'])

const open = ref(false)

const GAME_MAP = { quiz: MiniGameQuiz, pairs: MiniGamePairs, puzzle: MiniGamePuzzle }
const gameComponent = computed(() => GAME_MAP[props.task.game_type] || null)

const cssVars = computed(() => themeToCssVars(props.theme))
const worldClass = computed(() => props.theme.world?.decor ? `mgw--${props.theme.world.decor}` : null)

const GAME_META = {
  quiz:   { label: 'Пройти угадайку' },
  pairs:  { label: 'Найти все пары' },
  puzzle: { label: 'Собрать пазл' },
}
const gameLabel = computed(() => GAME_META[props.task.game_type]?.label ?? 'Начать игру')

const onComplete = (task) => {
  open.value = false
  // небольшая задержка чтобы оверлей закрылся до emit
  setTimeout(() => emit('complete', task), 220)
}

const onSkip = (task) => {
  open.value = false
  setTimeout(() => emit('skip-task', task), 220)
}
</script>

<style scoped>
/* кнопка запуска — тот же предмет мира, что и в самой игре, только крупнее */
.mg-launch__btn.mg-item {
  width: 100%;
  min-height: 60px;
  padding: 14px 16px;
  gap: 12px;
}
.mg-launch__ico   { flex-shrink: 0; }
.mg-launch__txt   { flex: 1; font-family: var(--font-d); font-weight: var(--font-d-wt, 400); font-size: 1.05rem; }
.mg-launch__arrow { flex-shrink: 0; color: var(--mi-sel); transition: transform .16s cubic-bezier(.2, .7, .2, 1); }
@media (hover: hover) {
  .mg-launch__btn:hover .mg-launch__arrow { transform: translateX(3px); }
}
.mg-launch__btn:active { transform: translateY(2px); }
</style>
