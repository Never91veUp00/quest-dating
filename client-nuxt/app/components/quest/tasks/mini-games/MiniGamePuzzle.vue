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

      <div class="task__puzzle__board-wrap">
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
        <canvas v-if="celebrating" ref="confettiCanvas" class="task__puzzle__confetti" />
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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

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
const celebrating      = ref(false)
const confettiCanvas   = ref(null)
let previewTimer  = null
let shuffleTimer  = null
let confettiFrame = null

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
  if (confettiFrame) cancelAnimationFrame(confettiFrame)
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
  for (let i = 0; i < total; i++) {
    if (shuffled[i] === i) {
      const j = (i + 1) % total;
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
  }
  slots.value        = shuffled.map((pieceIdx, i) => ({ i, pieceIdx }))
  selectedSlot.value = null
}

watch(complete, (val) => {
  if (!val) return
  celebrating.value = true
  nextTick(() => launchConfetti())
  setTimeout(() => { celebrating.value = false }, 3200)
})

const launchConfetti = () => {
  const canvas = confettiCanvas.value
  if (!canvas) return
  const W = canvas.offsetWidth || 300
  const H = canvas.offsetHeight || 200
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  const colors = ['#3cffb4', '#667eea', '#f6c90e', '#f87171', '#fff', '#a78bfa']
  const particles = Array.from({ length: 70 }, () => ({
    x:     Math.random() * W,
    y:     Math.random() * H * 0.3 - H * 0.3,
    vx:    (Math.random() - 0.5) * 5,
    vy:    Math.random() * 4 + 1.5,
    r:     Math.random() * 5 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    spin:  (Math.random() - 0.5) * 0.3,
    angle: Math.random() * Math.PI * 2,
  }))
  let frame = 0
  const tick = () => {
    ctx.clearRect(0, 0, W, H)
    const alpha = Math.max(0, 1 - frame / 110)
    particles.forEach(p => {
      p.x     += p.vx
      p.y     += p.vy
      p.vy    += 0.1
      p.angle += p.spin
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.fillStyle   = p.color
      ctx.globalAlpha = alpha
      ctx.fillRect(-p.r, -p.r * 0.4, p.r * 2, p.r * 0.8)
      ctx.restore()
    })
    frame++
    if (frame < 140) confettiFrame = requestAnimationFrame(tick)
  }
  confettiFrame = requestAnimationFrame(tick)
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
.task__puzzle { display: flex; flex-direction: column; gap: 12px; }

/* ── Preview ── */
.task__puzzle__intro { display: flex; flex-direction: column; gap: 8px; }
.task__puzzle__intro-img-wrap { position: relative; border-radius: 10px; overflow: hidden; }
.task__puzzle__intro-img {
  width: 100%; display: block; aspect-ratio: 16/9; max-height: 40vh; object-fit: cover;
}
/* Таймер в правом верхнем углу — не закрывает картинку */
.task__puzzle__preview-timer {
  position: absolute; top: 10px; right: 12px;
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(0,0,0,.6); border: 1.5px solid rgba(255,255,255,.5);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: .85rem; font-weight: 700;
}
/* Подпись под картинкой */
.task__puzzle__preview-caption {
  text-align: center; font-size: .82rem; font-weight: 600;
  color: rgba(255,255,255,.65); letter-spacing: .05em;
}

/* ── Progress ── */
.task__puzzle__progress { display: flex; align-items: center; gap: 10px; }
.task__puzzle__progress-bar {
  flex: 1; height: 4px; background: rgba(255,255,255,.08); border-radius: 3px; overflow: hidden;
}
.task__puzzle__progress-fill {
  height: 100%; background: var(--accent); border-radius: 3px;
  transition: width .3s ease; box-shadow: 0 0 6px color-mix(in srgb, var(--accent) 50%, transparent);
}
.task__puzzle__progress-txt { font-size: .72rem; color: rgba(255,255,255,.5); white-space: nowrap; }

/* ── Board wrapper (для позиционирования confetti) ── */
.task__puzzle__board-wrap {
  position: relative; max-width: min(100%, 420px); margin: 0 auto; width: 100%;
}

/* ── Board ── */
.task__puzzle__board {
  display: grid; gap: 2px; width: 100%; border-radius: 8px;
  overflow: hidden; background: var(--bg2); touch-action: manipulation;
  transition: gap .4s ease, box-shadow .4s ease;
}
.task__puzzle__board--complete {
  gap: 0;
  box-shadow: 0 0 0 2px var(--accent), 0 0 32px color-mix(in srgb, var(--accent) 40%, transparent);
  animation: board-celebrate .6s ease;
}
@keyframes board-celebrate {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.025); }
  70%  { transform: scale(.99); }
  100% { transform: scale(1); }
}

/* Анимация перемешивания */
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
  box-shadow: inset 0 0 0 3px #fff, inset 0 0 10px rgba(255,255,255,.2);
  transform: scale(1.06); z-index: 2;
}
.task__puzzle__slot.correct {
  box-shadow: inset 0 0 0 2px #3cffb4;
  cursor: default; pointer-events: none;
}
.task__puzzle__board--complete .task__puzzle__slot {
  box-shadow: none; cursor: default; pointer-events: none;
}

/* ── Confetti canvas ── */
.task__puzzle__confetti {
  position: absolute; inset: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 10;
}

/* ── Tip / skip / result ── */
.task__puzzle__tip {
  text-align: center; font-size: .78rem;
  color: rgba(255,255,255,.55); padding: 4px; min-height: 1.4em;
}
.task__puzzle__skip {
  display: block; margin: 4px auto 0; background: none; border: none;
  color: rgba(255,255,255,.45); font-size: .72rem; cursor: pointer;
  transition: color .2s; padding: 6px 12px;
  text-decoration: underline; text-underline-offset: 3px;
}
.task__puzzle__skip:hover { color: rgba(255,255,255,.75); }
.task__quiz-result {
  text-align: center; font-size: .9rem; padding: 8px; border-radius: 8px; font-weight: 600;
}
.task__quiz-result--right { color: #3cffb4; background: rgba(60,255,180,.08); }

.task__action {
  display: flex; align-items: center; justify-content: center;
  width: 100%; min-height: 52px;
  background: transparent; border: 1.5px solid var(--accent);
  border-radius: 14px; color: var(--accent);
  font-size: .95rem; font-weight: 700; cursor: pointer;
  text-shadow: 0 0 6px color-mix(in srgb, var(--accent) 50%, transparent);
  transition: all .2s ease;
}
.task__action:hover {
  background: var(--accent); color: #000; text-shadow: none;
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 40%, transparent);
}
@media (max-width: 480px) { .task__puzzle__board { gap: 1px; } }
</style>
