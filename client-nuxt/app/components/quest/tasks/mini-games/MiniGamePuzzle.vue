<template>
  <div class="task__puzzle">
    <div v-if="!started" class="task__puzzle__intro">
      <div class="task__puzzle__intro-img-wrap">
        <img :src="task.puzzle_image" class="task__puzzle__intro-img" alt="Пазл" />
        <div class="task__puzzle__intro-overlay">Запомни картинку</div>
      </div>
      <div class="task__puzzle__intro-meta">
        {{ totalPieces }} частей · тапни чтобы выбрать кусок и поставить на место
      </div>
      <button class="task__action" @click="init">🧩 Начать пазл!</button>
    </div>

    <template v-else>
      <div class="task__puzzle__progress">
        <div class="task__puzzle__progress-bar">
          <div class="task__puzzle__progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="task__puzzle__progress-txt">{{ placed }}/{{ totalPieces }} собрано</span>
      </div>

      <div class="task__puzzle__board" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
        <div
          v-for="slot in slots" :key="'s'+slot.i"
          class="task__puzzle__slot"
          :class="{
            filled:   slot.pieceIdx !== null,
            correct:  slot.pieceIdx === slot.i,
            selected: selectedSlot === slot.i,
          }"
          :style="slotStyle(slot)"
          @click="onTap(slot.i)"
        ></div>
      </div>

      <div class="task__puzzle__tip">
        <template v-if="selectedSlot === null">👆 Тапни на кусок чтобы выбрать</template>
        <template v-else>👇 Тапни куда поставить выбранный кусок</template>
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
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete', 'skip-task'])

const started         = ref(false)
const slots           = ref([])
const selectedSlot    = ref(null)
const imgNaturalRatio = ref(null)

onMounted(() => {
  if (props.task.puzzle_image) {
    const img = new Image()
    img.onload = () => { imgNaturalRatio.value = img.naturalWidth / img.naturalHeight }
    img.src = props.task.puzzle_image
  }
})

const PUZZLE_GRID = {
  12: { cols: 3, rows: 4 },
  20: { cols: 4, rows: 5 },
  30: { cols: 6, rows: 5 },
  35: { cols: 7, rows: 5 },
  42: { cols: 6, rows: 7 },
}
const cols = computed(() => PUZZLE_GRID[props.task.puzzle_pieces]?.cols ?? 6)
const rows = computed(() => PUZZLE_GRID[props.task.puzzle_pieces]?.rows ?? 5)
const totalPieces = computed(() => cols.value * rows.value)
const placed      = computed(() => slots.value.filter(s => s.pieceIdx === s.i).length)
const progress    = computed(() =>
  totalPieces.value ? Math.round(placed.value / totalPieces.value * 100) : 0
)
const complete = computed(() =>
  totalPieces.value > 0 && placed.value === totalPieces.value
)

// aspect ratio каждого слота = (imageW/cols) / (imageH/rows) = imgRatio * rows/cols
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

const init = () => {
  const total    = totalPieces.value
  const shuffled = Array.from({ length: total }, (_, i) => i)
  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  slots.value        = shuffled.map((pieceIdx, i) => ({ i, pieceIdx }))
  selectedSlot.value = null
  started.value      = true
}

const onTap = (slotIdx) => {
  if (complete.value) return
  const slot = slots.value[slotIdx]

  // правильно стоящий кусок — нельзя трогать
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
.task__puzzle__intro { display: flex; flex-direction: column; gap: 10px; }
.task__puzzle__intro-img-wrap { position: relative; border-radius: 10px; overflow: hidden; }
.task__puzzle__intro-img { width: 100%; display: block; aspect-ratio: 16/9; max-height: 40vh; object-fit: cover; filter: blur(6px) brightness(0.7); transform: scale(1.04); }
.task__puzzle__intro-overlay {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: .95rem; font-weight: 700;
  letter-spacing: .05em; pointer-events: none;
  text-shadow: 0 2px 8px rgba(0,0,0,.8);
}
.task__puzzle__intro-meta { font-size: .8rem; color: var(--dim); text-align: center; }
.task__puzzle__progress { display: flex; align-items: center; gap: 10px; }
.task__puzzle__progress-bar {
  flex: 1; height: 6px; background: rgba(255,255,255,.08); border-radius: 3px; overflow: hidden;
}
.task__puzzle__progress-fill {
  height: 100%; background: var(--accent); border-radius: 3px;
  transition: width .3s ease; box-shadow: 0 0 6px color-mix(in srgb, var(--accent) 50%, transparent);
}
.task__puzzle__progress-txt { font-size: .72rem; color: var(--dim); white-space: nowrap; }
.task__puzzle__board {
  display: grid; gap: 2px; width: 100%; border-radius: 8px; overflow: hidden;
  border: 1px solid var(--bord); background: var(--bg2); touch-action: manipulation;
  max-width: min(100%, 420px); margin: 0 auto;
}
.task__puzzle__slot {
  cursor: pointer; border-radius: 2px;
  transition: transform .12s, box-shadow .12s, outline .12s;
  background-color: color-mix(in srgb, var(--bg2) 60%, transparent);
  background-repeat: no-repeat; outline: 2px solid transparent;
  user-select: none; -webkit-user-select: none;
}
.task__puzzle__slot:active { transform: scale(.94); }
.task__puzzle__slot:not([style*="url"]) {
  background-color: rgba(255,255,255,.04); border: 1px dashed rgba(255,255,255,.08);
}
.task__puzzle__slot.selected {
  outline: 3px solid var(--accent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 50%, transparent);
  transform: scale(1.06); z-index: 2;
}
.task__puzzle__slot.correct { outline: 2px solid #3cffb4; cursor: default; pointer-events: none; }
.task__puzzle__tip { text-align: center; font-size: .78rem; color: var(--dim); padding: 4px; min-height: 1.4em; }
.task__puzzle__skip {
  display: block; margin: 8px auto 0; background: none; border: none;
  color: var(--dim); font-size: .68rem; cursor: pointer;
  opacity: .4; transition: opacity .3s; padding: 6px 12px;
  text-decoration: underline; text-underline-offset: 3px;
}
.task__puzzle__skip:hover { opacity: .7; }
.task__quiz-result {
  text-align: center; font-size: .9rem; padding: 8px; border-radius: 8px; font-weight: 600;
}
.task__quiz-result--right { color: #3cffb4; background: rgba(60,255,180,.08); }
@media (max-width: 480px) { .task__puzzle__board { gap: 1px; } }

.task__action {
  display: flex; align-items: center; justify-content: center;
  width: 100%; min-height: 52px;
  background: transparent;
  border: 1.5px solid var(--accent);
  border-radius: 14px;
  color: var(--accent);
  font-size: .95rem; font-weight: 700;
  cursor: pointer;
  text-shadow: 0 0 6px color-mix(in srgb, var(--accent) 50%, transparent);
  transition: all .2s ease;
}
.task__action:hover {
  background: var(--accent); color: #000; text-shadow: none;
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 40%, transparent);
}
</style>
