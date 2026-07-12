<template>
  <!-- Quiz рендерится инлайн без оверлея -->
  <component
    v-if="task.game_type === 'quiz'"
    :is="MiniGameQuiz"
    :task="task"
    :theme="theme"
    @complete="$emit('complete', $event)"
    @skip-task="$emit('skip-task', $event)"
  />

  <!-- Pairs и Puzzle — кнопка запуска + полноэкранный оверлей -->
  <template v-else>
    <div class="mg-launch">
      <button class="mg-launch__btn" @click="open = true">
        <span class="mg-launch__ico">{{ gameIcon }}</span>
        <span class="mg-launch__txt">{{ gameLabel }}</span>
        <span class="mg-launch__arrow">▶</span>
      </button>
    </div>

    <MiniGameOverlay v-model="open" :task="task" :cssVars="cssVars">
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

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
const emit = defineEmits(['complete', 'skip-task'])

const open = ref(false)

const GAME_MAP = { quiz: MiniGameQuiz, pairs: MiniGamePairs, puzzle: MiniGamePuzzle }
const gameComponent = computed(() => GAME_MAP[props.task.game_type] || null)

const cssVars = computed(() => themeToCssVars(props.theme))

const GAME_META = {
  quiz:   { icon: '❓', label: 'Пройти угадайку' },
  pairs:  { icon: '🃏', label: 'Найти все пары' },
  puzzle: { icon: '🧩', label: 'Собрать пазл' },
}
const gameIcon  = computed(() => GAME_META[props.task.game_type]?.icon  ?? '🎮')
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
.mg-launch { display: flex; flex-direction: column; gap: 0; }

.mg-launch__btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 56px;
  padding: 14px 16px;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  border: 1.5px solid color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: 14px;
  cursor: pointer;
  transition: background .18s, border-color .18s, transform .12s;
  text-align: left;
}

.mg-launch__btn:hover {
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  border-color: var(--accent);
}
.mg-launch__btn:active { transform: scale(.98); }

.mg-launch__ico  { font-size: 1.3rem; flex-shrink: 0; }
.mg-launch__txt  { flex: 1; font-size: .95rem; font-weight: 700; color: var(--text); }
.mg-launch__arrow {
  font-size: .75rem;
  color: var(--accent);
  opacity: .7;
  flex-shrink: 0;
}
</style>
