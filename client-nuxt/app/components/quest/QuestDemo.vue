<template>
  <div class="demo">
    <!-- Демо-поле: это не поле квеста, спойлеров нет -->
    <QuestTrack
      :key="loop"
      class="demo__track"
      :tasks="DEMO_CELLS"
      :completedIds="doneIds"
      :decor="decor"
      aria-hidden="true"
    />

    <!-- Без анимации: все кадры сразу -->
    <ol v-if="reduced" class="demo__list">
      <li v-for="f in FRAMES" :key="f.text" class="demo__card">
        <QuestIcon :name="f.icon" :size="22" />
        <span>{{ f.text }}</span>
      </li>
    </ol>

    <transition v-else name="demo-card" mode="out-in">
      <p :key="step" class="demo__card">
        <QuestIcon :name="frame.icon" :size="22" />
        <span>{{ frame.text }}</span>
      </p>
    </transition>

    <!-- Для экранных дикторов — весь сценарий сразу -->
    <ol v-if="!reduced" class="sr-only">
      <li v-for="f in FRAMES" :key="f.text">{{ f.text }}</li>
    </ol>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import QuestTrack from './QuestTrack.vue'
import QuestIcon from './QuestIcon.vue'

// Спид-демо: фишка пробегает демо-поле, на каждой клетке — что там бывает.
// Подписи согласовать с Лизой (бриф, PR 2b).
const FRAMES = [
  { icon: 'riddle', text: 'Открылась клетка — загадка. Ответ вводишь прямо в карточке.' },
  { icon: 'photo',  text: 'Фото-задание: сними то, что нашёл на месте.' },
  { icon: 'game',   text: 'Мини-игра: угадайка, пары или пазл.' },
  { icon: 'hint',   text: 'Застрял — бери подсказку. Она стоит немного очков.' },
  { icon: 'check',  text: 'Последняя клетка — финал и послание для тебя.' },
]
const DEMO_CELLS = FRAMES.map((f, i) => ({ id: `demo-${i}`, title: f.text }))

const STEP_MS  = 2300
const PAUSE_MS = 2600

defineProps({
  decor: { type: String, default: null },
})

const reduced = ref(false)
const step = ref(0)
const loop = ref(0)
const frame = computed(() => FRAMES[step.value])
const doneIds = computed(() => DEMO_CELLS.slice(0, step.value).map(c => c.id))

let timer = null
const tick = () => {
  if (step.value < FRAMES.length - 1) {
    step.value++
    timer = setTimeout(tick, STEP_MS)
  } else {
    timer = setTimeout(() => { step.value = 0; loop.value++; timer = setTimeout(tick, STEP_MS) }, PAUSE_MS)
  }
}

onMounted(() => {
  reduced.value = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduced.value) return
  timer = setTimeout(tick, STEP_MS)
})
onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.demo { display: flex; flex-direction: column; gap: 10px; }
.demo__track { height: 150px; }

.demo__list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.demo__card {
  display: flex; align-items: flex-start; gap: 10px;
  min-height: 3.4em;
  margin: 0;
  padding: 12px 14px;
  background: var(--paper);
  color: var(--ink);
  border-radius: 10px;
  font-family: var(--font-b);
  font-size: 1rem;
  line-height: 1.45;
}

.demo-card-enter-active { transition: opacity .3s ease-out, transform .4s cubic-bezier(.16, 1, .3, 1); }
.demo-card-leave-active { transition: opacity .15s ease-in; }
.demo-card-enter-from   { opacity: 0; transform: translateY(8px); }
.demo-card-leave-to     { opacity: 0; }

.sr-only {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .demo-card-enter-active, .demo-card-leave-active { transition: none; }
}
</style>
