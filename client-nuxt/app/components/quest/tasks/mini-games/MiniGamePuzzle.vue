<template>
  <div class="task__puzzle">

    <!-- Фаза 1: чёткая картинка -->
    <div v-if="phase === 'preview'" class="task__puzzle__intro">
      <div class="task__puzzle__intro-img-wrap">
        <img :src="task.puzzle_image" class="task__puzzle__intro-img" alt="Пазл" />
        <span class="task__puzzle__preview-timer">{{ previewCountdown }}</span>
      </div>
      <div class="task__puzzle__preview-caption">Запомни картинку</div>
    </div>

    <!-- Фаза 2: анимация перемешивания -->
    <div v-else-if="phase === 'shuffling'"
      class="task__puzzle__board task__puzzle__board--shuffling"
      :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
      <div
        v-for="slot in slots" :key="'s'+slot.i"
        class="task__puzzle__slot"
        :style="{ ...slotStyle(slot), '--slot-i': slot.i }"
      ></div>
    </div>

    <!-- Фаза 3: игра -->
    <template v-else-if="phase === 'playing'">
      <div class="task__puzzle__progress">
        <div class="task__puzzle__progress-bar">
          <div class="task__puzzle__progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="task__puzzle__progress-txt"><b>{{ placed }}</b> из {{ totalPieces }}</span>
      </div>

      <div class="mg-board">
      <QuestMark v-if="complete" :decor="theme.world?.decor ?? null" kind="right" />
      <div
        class="task__puzzle__board"
        :class="{ 'task__puzzle__board--complete': complete }"
        :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }"
      >
        <div
          v-for="slot in slots" :key="'s'+slot.i"
          class="task__puzzle__slot"
          :class="{
            correct:  slot.pieceIdx === slot.i,
            selected: selectedSlot === slot.i,
            landed:   landed.includes(slot.i),
          }"
          :style="slotStyle(slot)"
          @click="onTap(slot.i)"
        ></div>
      </div>
      </div>

      <div v-if="!complete" class="task__puzzle__tip">
        <template v-if="selectedSlot === null">Тапни на кусок чтобы выбрать</template>
        <template v-else>Тапни куда поставить</template>
      </div>

      <button v-if="!complete" class="mg-skip" @click="$emit('skip-task', task)">
        Не получается? Пропустить
      </button>

      <p v-if="complete" class="mg-result" role="status">Пазл собран</p>
      <button v-if="complete" class="task__action" @click="$emit('complete', task)">
        Идти дальше
      </button>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import QuestMark from '../../QuestMark.vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete', 'skip-task'])

const phase            = ref('preview')
const previewCountdown = ref(4)
const slots            = ref([])
const selectedSlot     = ref(null)
const imgNaturalRatio  = ref(null)
const landed           = ref([]) // куски, только что вставшие на место: короткая вспышка рамки

let previewTimer = null
let shuffleTimer = null

onMounted(() => {
  if (props.task.puzzle_image) {
    const img = new Image()
    img.onload = () => { imgNaturalRatio.value = img.naturalWidth / img.naturalHeight }
    img.src = props.task.puzzle_image
  }
  startPreview()
})

onUnmounted(() => {
  clearInterval(previewTimer)
  clearTimeout(shuffleTimer)
})

const startPreview = () => {
  previewCountdown.value = 4
  previewTimer = setInterval(() => {
    previewCountdown.value--
    if (previewCountdown.value <= 0) {
      clearInterval(previewTimer)
      startShuffling()
    }
  }, 1000)
}

const startShuffling = () => {
  initSlots()
  phase.value = 'shuffling'
  shuffleTimer = setTimeout(() => { phase.value = 'playing' }, 900)
}

const initSlots = () => {
  const total    = totalPieces.value
  const shuffled = Array.from({ length: total }, (_, i) => i)
  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  // Убеждаемся что ни один кусок не стоит правильно сразу
  for (let i = 0; i < total; i++) {
    if (shuffled[i] === i) {
      const j = (i + 1) % total;
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
  }
  slots.value        = shuffled.map((pieceIdx, i) => ({ i, pieceIdx }))
  selectedSlot.value = null
}

const PUZZLE_GRID = {
  12: { cols: 4, rows: 3 },
  20: { cols: 5, rows: 4 },
  30: { cols: 6, rows: 5 },
  35: { cols: 7, rows: 5 },
  42: { cols: 6, rows: 7 },
}
const cols = computed(() => {
  const g = PUZZLE_GRID[props.task.puzzle_pieces] ?? { cols: 6, rows: 5 }
  return props.task.puzzle_landscape ? g.rows : g.cols
})
const rows = computed(() => {
  const g = PUZZLE_GRID[props.task.puzzle_pieces] ?? { cols: 6, rows: 5 }
  return props.task.puzzle_landscape ? g.cols : g.rows
})
const totalPieces = computed(() => cols.value * rows.value)
const placed      = computed(() => slots.value.filter(s => s.pieceIdx === s.i).length)
const progress    = computed(() =>
  totalPieces.value ? Math.round(placed.value / totalPieces.value * 100) : 0
)
const complete = computed(() =>
  totalPieces.value > 0 && placed.value === totalPieces.value
)

const slotAspect = computed(() => {
  if (!imgNaturalRatio.value) return 1
  return imgNaturalRatio.value * rows.value / cols.value
})

const slotStyle = (slot) => {
  const base = { aspectRatio: slotAspect.value }
  if (slot.pieceIdx === null || !props.task.puzzle_image) return base
  const c    = slot.pieceIdx % cols.value
  const r    = Math.floor(slot.pieceIdx / cols.value)
  const posX = cols.value > 1 ? (c / (cols.value - 1)) * 100 : 0
  const posY = rows.value > 1 ? (r / (rows.value - 1)) * 100 : 0
  return {
    ...base,
    backgroundImage:    `url(${props.task.puzzle_image})`,
    backgroundSize:     `${cols.value * 100}% ${rows.value * 100}%`,
    backgroundPosition: `${posX}% ${posY}%`,
  }
}

const onTap = (slotIdx) => {
  if (complete.value) return
  const slot = slots.value[slotIdx]
  if (slot.pieceIdx === slotIdx) return
  if (selectedSlot.value === null) { selectedSlot.value = slotIdx; return }
  if (selectedSlot.value === slotIdx) { selectedSlot.value = null; return }

  const a = slots.value[selectedSlot.value]
  const b = slots.value[slotIdx]
  const tmp = a.pieceIdx
  a.pieceIdx = b.pieceIdx
  b.pieceIdx = tmp

  if (a.pieceIdx === a.i && b.pieceIdx === b.i && 'vibrate' in navigator) {
    navigator.vibrate(40)
  }
  const fresh = [a, b].filter(x => x.pieceIdx === x.i).map(x => x.i)
  if (fresh.length) {
    landed.value = [...landed.value, ...fresh]
    setTimeout(() => { landed.value = landed.value.filter(i => !fresh.includes(i)) }, 650)
  }
  selectedSlot.value = null
}
</script>

<style scoped>
.task__puzzle { display: flex; flex-direction: column; gap: 10px; }

/* ── Предпросмотр ── */
.task__puzzle__intro { display: flex; flex-direction: column; gap: 8px; }
.task__puzzle__intro-img-wrap { position: relative; border-radius: 6px; overflow: hidden; border: 2px solid var(--rule); }
.task__puzzle__intro-img {
  width: 100%; display: block; aspect-ratio: 16/9; max-height: 40vh; object-fit: cover;
}
.task__puzzle__preview-timer {
  position: absolute; top: 10px; right: 10px;
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--paper); color: var(--ink);
  border: 2px solid var(--rule);
  display: grid; place-items: center;
  font-family: var(--font-d); font-weight: var(--font-d-wt, 400); font-size: 1.1rem; line-height: 1;
}
.task__puzzle__preview-caption {
  text-align: center;
  font-family: var(--font-d); font-weight: var(--font-d-wt, 400); font-size: 1.05rem;
  color: var(--ink);
}

/* ── Сколько собрано ── */
.task__puzzle__progress { display: flex; align-items: center; gap: 10px; }
.task__puzzle__progress-bar {
  flex: 1; height: 4px; border-radius: 2px; overflow: hidden;
  background: color-mix(in srgb, var(--ink) 14%, var(--paper));
}
.task__puzzle__progress-fill {
  height: 100%; background: var(--chip);
  transition: width .3s cubic-bezier(.2, .7, .2, 1);
}
.task__puzzle__progress-txt { font-size: .85rem; color: var(--ink-soft); white-space: nowrap; }
.task__puzzle__progress-txt b { font-family: var(--font-d); font-weight: var(--font-d-wt, 400); font-size: 1.05rem; color: var(--ink); }

/* ── Доска ── */
.mg-board { width: 100%; max-width: min(100%, 460px); margin-inline: auto; }
.task__puzzle__board {
  display: grid; gap: 2px; width: 100%;
  max-width: min(100%, 460px); margin: 0 auto;
  padding: 2px;
  border-radius: 4px;
  background: var(--rule);
  touch-action: manipulation;
  transition: gap .45s cubic-bezier(.2, .7, .2, 1), padding .45s cubic-bezier(.2, .7, .2, 1);
}
/* собран: швы сходятся, снимок становится целым */
.task__puzzle__board--complete { gap: 0; padding: 0; }

.task__puzzle__board--shuffling .task__puzzle__slot {
  animation: piece-shuffle .5s cubic-bezier(.16, 1, .3, 1) both;
  animation-delay: calc(var(--slot-i, 0) * 18ms);
}
@keyframes piece-shuffle {
  from { opacity: 0; transform: scale(.6); }
  to   { opacity: 1; transform: scale(1); }
}

.task__puzzle__slot {
  position: relative;
  cursor: pointer;
  background-color: var(--ink-soft);
  background-repeat: no-repeat;
  user-select: none; -webkit-user-select: none;
  transition: transform .14s cubic-bezier(.2, .7, .2, 1);
}
.task__puzzle__slot:active { transform: scale(.95); }
/* выбран: кусок приподнят и обведён краской мира — видно, что он «в руке» */
.task__puzzle__slot.selected {
  z-index: 2;
  transform: scale(1.06);
  box-shadow: 0 0 0 3px var(--paper), 0 0 0 6px var(--chip), 0 10px 16px -6px color-mix(in srgb, var(--rule) 80%, transparent);
}
.task__puzzle__slot.correct { cursor: default; pointer-events: none; }
/* только что встал на место: короткая рамка тает */
.task__puzzle__slot.landed::after {
  content: ""; position: absolute; inset: 0;
  box-shadow: inset 0 0 0 3px var(--paper);
  animation: piece-landed .65s ease-out both;
}
@keyframes piece-landed { from { opacity: 1; } to { opacity: 0; } }
.task__puzzle__board--complete .task__puzzle__slot { cursor: default; pointer-events: none; }

/* ── Подсказка / итог ── */
.task__puzzle__tip {
  text-align: center; font-size: .85rem;
  color: var(--ink-soft); min-height: 1.4em;
}

@media (prefers-reduced-motion: reduce) {
  .task__puzzle__slot.selected { transform: none; }
  .task__puzzle__board--shuffling .task__puzzle__slot { animation: none; }
}
</style>
