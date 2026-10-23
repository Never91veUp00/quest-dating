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
      <QuestMark v-if="finale >= 3" :decor="theme.world?.decor ?? null" kind="right" />
      <!-- Финал: куски расходятся и схлопываются (1), снимок становится цельным (2), ложится отпечатком в рамку мира (3) -->
      <div
        class="task__puzzle__board"
        :class="{
          'task__puzzle__board--fuse':   finale === 1,
          'task__puzzle__board--whole':  finale >= 2,
          'task__puzzle__board--framed': finale >= 3,
        }"
        :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }"
      >
        <template v-if="finale < 2">
          <div
            v-for="slot in slots" :key="'s'+slot.i"
            class="task__puzzle__slot"
            :class="{
              correct:  slot.pieceIdx === slot.i,
              selected: selectedSlot === slot.i,
              landed:   landed.includes(slot.i),
            }"
            :style="{ ...slotStyle(slot), ...fuseStyle(slot) }"
            @click="onTap(slot.i)"
          >
            <!-- встал на место: фотоуголок держит кусок, по нему видно, что трогать его больше не надо -->
            <svg v-if="slot.pieceIdx === slot.i" class="task__puzzle__ok" viewBox="0 0 20 20" aria-hidden="true">
              <path class="task__puzzle__ok-corner" d="M20 0V20H0Z" />
              <path class="task__puzzle__ok-tick" d="M9.6 14.4l2.4 2.3 4.6-5.4" />
            </svg>
          </div>
        </template>
        <img v-else :src="task.puzzle_image" class="task__puzzle__whole" alt="Собранная фотография" />
      </div>
      </div>

      <div v-if="!complete" class="task__puzzle__tip">
        <template v-if="selectedSlot === null">Тапни на кусок чтобы выбрать</template>
        <template v-else>Тапни куда поставить</template>
      </div>

      <button v-if="!complete" class="mg-skip" @click="$emit('skip-task', task)">
        Не получается? Пропустить
      </button>

      <template v-if="finale >= 3">
        <p class="mg-result task__puzzle__after" role="status">Пазл собран</p>
        <button class="task__action task__puzzle__after task__puzzle__after--late" @click="$emit('complete', task)">
          Идти дальше
        </button>
      </template>
    </template>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
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
const landTimers = new Set()

// Финал сборки — только показ, логика «собрано» не меняется.
// 0 — игра, 1 — схлопывание, 2 — цельный снимок, 3 — отпечаток в рамке мира
const finale = ref(0)
const FUSE_MS  = 760   // разлёт и схлопывание с волной от краёв к центру
const FRAME_MS = 920   // снимок поднимается и ложится в рамку
const finaleTimers = []

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
  landTimers.forEach(clearTimeout)
  finaleTimers.forEach(clearTimeout)
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

watch(complete, (done) => {
  if (!done || finale.value) return
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduced) { finale.value = 3; return }
  finale.value = 1
  finaleTimers.push(setTimeout(() => { finale.value = 2 }, FUSE_MS))
  finaleTimers.push(setTimeout(() => { finale.value = 3 }, FRAME_MS))
})

// Направление и очередь куска при схлопывании: смещение от центра доски,
// крайние куски начинают первыми — картинка стягивается к середине
const fuseStyle = (slot) => {
  if (finale.value !== 1) return {}
  const c  = slot.i % cols.value
  const r  = Math.floor(slot.i / cols.value)
  const dx = c - (cols.value - 1) / 2
  const dy = r - (rows.value - 1) / 2
  const ring    = Math.max(Math.abs(dx), Math.abs(dy))
  const maxRing = Math.max((cols.value - 1) / 2, (rows.value - 1) / 2)
  return { '--dx': dx, '--dy': dy, '--fuse-delay': `${Math.round((maxRing - ring) * 55)}ms` }
}

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
    const t = setTimeout(() => {
      landTimers.delete(t)
      landed.value = landed.value.filter(i => !fresh.includes(i))
    }, 650)
    landTimers.add(t)
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
  position: relative;
  display: grid; gap: 2px; width: 100%;
  max-width: min(100%, 460px); margin: 0 auto;
  padding: 2px;
  border-radius: 4px;
  background: var(--rule);
  touch-action: manipulation;
  transition:
    gap .22s cubic-bezier(.5, 0, .75, 0) .38s,
    padding .45s cubic-bezier(.2, .7, .2, 1),
    background-color .3s ease,
    box-shadow .45s ease;
}

/* ── Финал сборки ── */
/* 1. Куски на миг расходятся от центра и схлопываются обратно; швы закрываются к удару */
.task__puzzle__board--fuse { gap: 0; padding: 0; background-color: transparent; }
.task__puzzle__board--fuse .task__puzzle__slot.landed::after { display: none; }
.task__puzzle__board--fuse .task__puzzle__slot {
  pointer-events: none;
  animation: piece-fuse .56s var(--fuse-delay, 0ms) both;
}
@keyframes piece-fuse {
  0%   { transform: none; box-shadow: none; animation-timing-function: cubic-bezier(.2, .7, .3, 1); }
  42%  { transform: translate(calc(var(--dx) * 7px), calc(var(--dy) * 7px)) scale(.94); box-shadow: 0 8px 12px -8px color-mix(in srgb, var(--rule) 80%, transparent); animation-timing-function: cubic-bezier(.6, 0, .9, .4); }
  100% { transform: none; box-shadow: none; }
}
/* 2. Снимок цельный: один кадр вместо кусков, доска коротко «садится» от удара */
.task__puzzle__board--whole { gap: 0; padding: 0; background-color: transparent; }
.task__puzzle__whole {
  grid-column: 1 / -1;
  display: block; width: 100%; height: auto;
  border-radius: 2px;
}
.task__puzzle__board--whole:not(.task__puzzle__board--framed) { animation: board-thud .16s ease-out both; }
@keyframes board-thud {
  0%   { transform: translateY(0); }
  45%  { transform: translateY(2px) scale(.992); }
  100% { transform: none; }
}
/* 3. Отпечаток: снимок поднимается и ложится в рамку — бумажное паспарту и тень */
.task__puzzle__board--framed {
  padding: 10px;
  background: var(--paper);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--ink) 18%, var(--paper)), 0 18px 26px -16px color-mix(in srgb, var(--rule) 75%, transparent);
  animation: board-print .62s cubic-bezier(.2, .7, .2, 1) both;
}
@keyframes board-print {
  0%   { transform: none; }
  40%  { transform: translateY(-6px) scale(1.025); }
  100% { transform: none; }
}
/* надпись и кнопка поднимаются, когда отпечаток лёг */
.task__puzzle__after { animation: puzzle-after .4s cubic-bezier(.2, .7, .2, 1) .35s both; }
.task__puzzle__after--late { animation-delay: .5s; }
@keyframes puzzle-after { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

/* Рамка отпечатка — предмет мира */
.mgw--casefile .task__puzzle__board--framed { border-radius: 2px; }
.mgw--casefile .task__puzzle__board--framed::before,
.mgw--casefile .task__puzzle__board--framed::after {
  content: ""; position: absolute; top: -9px;
  width: 64px; height: 20px;
  background: color-mix(in srgb, var(--paper-edge) 75%, transparent);
  animation: tape-on .3s cubic-bezier(.2, .7, .2, 1) .45s both;
}
.mgw--casefile .task__puzzle__board--framed::before { left: -12px; transform: rotate(-32deg); }
.mgw--casefile .task__puzzle__board--framed::after  { right: -12px; transform: rotate(32deg); }
@keyframes tape-on { from { opacity: 0; } to { opacity: 1; } }

.mgw--letters .task__puzzle__board--framed { padding: 12px; border-radius: 3px; outline: 1.5px dashed color-mix(in srgb, var(--chip) 75%, var(--paper)); outline-offset: -6px; }

.mgw--metro .task__puzzle__board--framed {
  padding: 18px 10px 10px; border-radius: 6px;
  box-shadow: inset 0 8px 0 var(--chip), 0 18px 26px -16px color-mix(in srgb, var(--rule) 60%, transparent);
}

.mgw--tarot .task__puzzle__board--framed {
  padding: 14px; border-radius: 8px;
  box-shadow:
    inset 0 0 0 4px var(--paper), inset 0 0 0 5.5px var(--chip),
    inset 0 0 0 8px var(--paper), inset 0 0 0 9px color-mix(in srgb, var(--ink) 40%, var(--paper)),
    0 18px 26px -16px color-mix(in srgb, var(--rule) 90%, transparent);
}

.mgw--map .task__puzzle__board--framed {
  border-radius: 3px 10px 4px 12px / 10px 4px 12px 3px;
  background: color-mix(in srgb, var(--paper-edge) 55%, var(--paper));
  animation-name: board-print-map;
  transform: rotate(-.8deg);
}
@keyframes board-print-map {
  0%   { transform: none; }
  40%  { transform: translateY(-6px) scale(1.025); }
  100% { transform: rotate(-.8deg); }
}

.mgw--ringbox .task__puzzle__board--framed { padding: 12px; border-radius: 14px; outline: 1.5px dashed color-mix(in srgb, var(--ink) 28%, var(--paper)); outline-offset: -6px; }

.mgw--potion .task__puzzle__board--framed {
  box-shadow: none;
  border-radius: 0;
  clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px);
  background: linear-gradient(var(--paper), var(--paper)) padding-box, var(--rule);
  border: 3px solid transparent;
}

.mgw--diecut .task__puzzle__board--framed {
  box-shadow: none;
  border-radius: 0;
  background:
    radial-gradient(circle at 0 0,       transparent 10px, var(--paper) 10.5px) top left     / 51% 51% no-repeat,
    radial-gradient(circle at 100% 0,    transparent 10px, var(--paper) 10.5px) top right    / 51% 51% no-repeat,
    radial-gradient(circle at 0 100%,    transparent 10px, var(--paper) 10.5px) bottom left  / 51% 51% no-repeat,
    radial-gradient(circle at 100% 100%, transparent 10px, var(--paper) 10.5px) bottom right / 51% 51% no-repeat;
  filter: drop-shadow(0 12px 12px color-mix(in srgb, var(--rule) 80%, transparent));
}

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
  box-shadow: 0 0 0 3px var(--paper), 0 0 0 6px var(--mi-sel, var(--chip)), 0 10px 16px -6px color-mix(in srgb, var(--rule) 80%, transparent);
}
.task__puzzle__slot.correct { cursor: default; pointer-events: none; }
/* стоит верно: тонкий бумажный кант и фотоуголок с галочкой краской мира — не исчезают до конца сборки */
.task__puzzle__slot.correct::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--paper) 85%, transparent);
}
.task__puzzle__ok {
  position: absolute; right: 0; bottom: 0;
  width: clamp(14px, 34%, 22px); height: auto; aspect-ratio: 1;
  pointer-events: none;
  filter: drop-shadow(-1px -1px 1px color-mix(in srgb, var(--rule) 45%, transparent));
}
.task__puzzle__ok-corner { fill: var(--paper); }
.task__puzzle__ok-tick {
  fill: none; stroke: var(--mi-sel, var(--chip)); stroke-width: 2.2;
  stroke-linecap: round; stroke-linejoin: round;
}
.task__puzzle__slot.landed .task__puzzle__ok { animation: piece-ok .32s cubic-bezier(.2, .7, .2, 1) both; transform-origin: 100% 100%; }
@keyframes piece-ok { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: none; } }
/* в финале уголки снимаются вместе со швами */
.task__puzzle__board--fuse .task__puzzle__ok,
.task__puzzle__board--fuse .task__puzzle__slot.correct::before { opacity: 0; transition: opacity .18s ease; }
/* только что встал на место: короткая рамка тает */
.task__puzzle__slot.landed::after {
  content: ""; position: absolute; inset: 0;
  box-shadow: inset 0 0 0 3px var(--paper);
  animation: piece-landed .65s ease-out both;
}
@keyframes piece-landed { from { opacity: 1; } to { opacity: 0; } }

/* ── Подсказка / итог ── */
.task__puzzle__tip {
  text-align: center; font-size: .85rem;
  color: var(--ink-soft); min-height: 1.4em;
}

@media (prefers-reduced-motion: reduce) {
  .task__puzzle__slot.selected,
  .task__puzzle__slot:active { transform: none; }
  .task__puzzle__slot.landed::after { animation: none; opacity: 0; }
  .task__puzzle__slot.landed .task__puzzle__ok { animation: none; }
  .task__puzzle__board--shuffling .task__puzzle__slot { animation: none; }
  .task__puzzle__board--framed,
  .task__puzzle__board--whole,
  .task__puzzle__after { animation: none; }
  .mgw--map .task__puzzle__board--framed { transform: rotate(-.8deg); }
}
</style>
