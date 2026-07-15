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
        <span class="task__puzzle__progress-txt">{{ placed }}/{{ totalPieces }} собрано</span>
      </div>

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
          }"
          :style="slotStyle(slot)"
          @click="onTap(slot.i)"
        ></div>
      </div>

      <!-- CSS-конфетти при завершении -->
      <div v-if="complete" class="task__puzzle__confetti" aria-hidden="true">
        <span v-for="i in 16" :key="i" class="task__puzzle__confetti__p" :style="`--i:${i}`"></span>
      </div>

      <div v-if="!complete" class="task__puzzle__tip">
        <template v-if="selectedSlot === null">Тапни на кусок чтобы выбрать</template>
        <template v-else>Тапни куда поставить</template>
      </div>

      <button v-if="!complete" class="task__puzzle__skip" @click="$emit('skip-task', task)">
        Не получается? Пропустить
      </button>

      <div v-if="complete" class="task__quiz-result task__quiz-result--right">🎉 Пазл собран!</div>
      <button v-if="complete" class="task__action" @click="$emit('complete', task)">
        Продолжаем →
      </button>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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
  selectedSlot.value = null
}
</script>

<style scoped>
.task__puzzle { display: flex; flex-direction: column; gap: 8px; }

/* ── Preview ── */
.task__puzzle__intro { display: flex; flex-direction: column; gap: 6px; }
.task__puzzle__intro-img-wrap { position: relative; border-radius: 10px; overflow: hidden; }
.task__puzzle__intro-img {
  width: 100%; display: block; aspect-ratio: 16/9; max-height: 35vh; object-fit: cover;
}
.task__puzzle__preview-timer {
  position: absolute; top: 8px; right: 10px;
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(0,0,0,.6); border: 1.5px solid rgba(255,255,255,.5);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: .8rem; font-weight: 700;
}
.task__puzzle__preview-caption {
  text-align: center; font-size: .78rem; font-weight: 600;
  color: rgba(255,255,255,.6); letter-spacing: .04em;
}

/* ── Progress ── */
.task__puzzle__progress { display: flex; align-items: center; gap: 8px; }
.task__puzzle__progress-bar {
  flex: 1; height: 3px; background: rgba(255,255,255,.08); border-radius: 3px; overflow: hidden;
}
.task__puzzle__progress-fill {
  height: 100%; background: var(--accent); border-radius: 3px;
  transition: width .3s ease;
}
.task__puzzle__progress-txt { font-size: .68rem; color: rgba(255,255,255,.5); white-space: nowrap; }

/* ── Board ── */
.task__puzzle__board {
  display: grid; gap: 2px; width: 100%; border-radius: 8px;
  overflow: hidden; background: var(--bg2); touch-action: manipulation;
  max-width: min(100%, 420px); margin: 0 auto;
  padding: 2px;
  transition: gap .4s ease, box-shadow .4s ease;
}
.task__puzzle__board--complete {
  gap: 0;
  box-shadow: 0 0 0 2px var(--accent), 0 0 28px color-mix(in srgb, var(--accent) 40%, transparent);
  animation: board-celebrate .6s ease;
}
@keyframes board-celebrate {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.03); }
  70%  { transform: scale(.99); }
  100% { transform: scale(1); }
}

.task__puzzle__board--shuffling .task__puzzle__slot {
  animation: piece-shuffle 0.55s cubic-bezier(.34,1.56,.64,1) both;
  animation-delay: calc(var(--slot-i, 0) * 18ms);
}
@keyframes piece-shuffle {
  from { opacity: 0; transform: scale(.6); }
  to   { opacity: 1; transform: scale(1); }
}

.task__puzzle__slot {
  cursor: pointer; border-radius: 1px;
  transition: transform .12s, box-shadow .12s;
  background-color: rgba(255,255,255,.04);
  background-repeat: no-repeat;
  user-select: none; -webkit-user-select: none;
}
.task__puzzle__slot:active { transform: scale(.94); }
.task__puzzle__slot:not([style*="url"]) {
  border: 1px dashed rgba(255,255,255,.08);
}
.task__puzzle__slot.selected {
  box-shadow: inset 0 0 0 3px #fff, inset 0 0 12px rgba(255,255,255,.2);
  z-index: 2;
}
.task__puzzle__slot.correct {
  box-shadow: inset 0 0 0 2px #3cffb4;
  cursor: default; pointer-events: none;
}
.task__puzzle__board--complete .task__puzzle__slot {
  box-shadow: none; cursor: default; pointer-events: none;
}

/* ── CSS Confetti ── */
.task__puzzle__confetti {
  position: relative; height: 40px; overflow: hidden; pointer-events: none;
}
.task__puzzle__confetti__p {
  position: absolute;
  left: calc(var(--i) * 6.25%);
  top: 0;
  width: 7px; height: 10px;
  border-radius: 2px;
  background: hsl(calc(var(--i) * 22deg), 80%, 65%);
  animation: confetti-fall .9s calc(var(--i) * 55ms) ease-in both;
}
@keyframes confetti-fall {
  from { transform: translateY(-10px) rotate(0deg); opacity: 1; }
  to   { transform: translateY(50px) rotate(540deg); opacity: 0; }
}

/* ── Tip / skip / result ── */
.task__puzzle__tip {
  text-align: center; font-size: .75rem;
  color: rgba(255,255,255,.5); padding: 2px; min-height: 1.3em;
}
.task__puzzle__skip {
  display: block; margin: 2px auto 0; background: none; border: none;
  color: rgba(255,255,255,.45); font-size: .7rem; cursor: pointer;
  transition: color .2s; padding: 4px 12px;
  text-decoration: underline; text-underline-offset: 3px;
}
.task__puzzle__skip:hover { color: rgba(255,255,255,.75); }
.task__quiz-result {
  text-align: center; font-size: .88rem; padding: 6px; border-radius: 8px; font-weight: 600;
}
.task__quiz-result--right { color: #3cffb4; background: rgba(60,255,180,.08); }

.task__action {
  display: flex; align-items: center; justify-content: center;
  width: 100%; min-height: 48px;
  background: transparent; border: 1.5px solid var(--accent);
  border-radius: 14px; color: var(--accent);
  font-size: .92rem; font-weight: 700; cursor: pointer;
  text-shadow: 0 0 6px color-mix(in srgb, var(--accent) 50%, transparent);
  transition: all .2s ease;
}
.task__action:hover {
  background: var(--accent); color: #000; text-shadow: none;
}
@media (max-width: 480px) { .task__puzzle__board { gap: 1px; } }
</style>
