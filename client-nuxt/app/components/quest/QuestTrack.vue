<template>
  <div class="track" :class="decor && `track--${decor}`" :style="{ '--n': cells.length }">
    <svg class="track__road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <path class="track__band" :d="roadPath" />
      <path class="track__dash" :d="roadPath" />
    </svg>

    <ol class="track__cells">
      <li
        v-for="cell in cells"
        :key="cell.id"
        class="track__slot"
        :style="{ left: cell.x + '%', top: cell.y + '%' }"
      >
        <button
          v-if="cell.state === 'done' || cell.state === 'wrong'"
          type="button"
          class="cell cell--done"
          :class="{ 'cell--wrong': cell.state === 'wrong' }"
          :aria-label="`Клетка ${cell.n}: ${cell.title}. ${cell.state === 'wrong' ? 'Пропущено' : 'Выполнено'}. Открыть`"
          @click="$emit('open', cell.index)"
        >
          <QuestIcon :name="cell.state === 'wrong' ? 'close' : 'check'" :size="22" />
        </button>
        <span
          v-else-if="cell.state === 'active'"
          class="cell cell--active"
          aria-current="step"
          :aria-label="`Клетка ${cell.n}: сейчас здесь`"
        >{{ cell.n }}</span>
        <span
          v-else
          class="cell cell--back"
          :aria-label="`Клетка ${cell.n}: закрыта`"
        ></span>
      </li>
    </ol>

    <span class="track__chip" :style="chipStyle" aria-hidden="true"></span>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import QuestIcon from './QuestIcon.vue'

const props = defineProps({
  tasks:        { type: Array,   required: true },
  completedIds: { type: Array,   default: () => [] },
  earnedMap:    { type: Object,  default: () => ({}) },
  hasPrev:      { type: Boolean, default: false },
  hasNext:      { type: Boolean, default: false },
  decor:        { type: String,  default: null },
  enter:        { type: Boolean, default: false }, // фишка заезжает с края поля
})
defineEmits(['open'])

// Змейка: клетки идут слева направо, качаясь вверх-вниз, как трасса на поле
const WAVE = [64, 34, 60, 30, 62, 36, 58, 32]

const cells = computed(() => {
  const n = props.tasks.length
  const firstOpen = props.tasks.findIndex(t => !props.completedIds.includes(t.id))
  return props.tasks.map((t, i) => {
    const done = props.completedIds.includes(t.id)
    const state = done
      ? (props.earnedMap?.[t.id]?.wrong ? 'wrong' : 'done')
      : i === firstOpen ? 'active' : 'back'
    return {
      id: t.id, index: i, n: i + 1, title: t.title || 'Задание', state,
      x: n === 1 ? 50 : 14 + (72 * i) / (n - 1),
      y: n === 1 ? 48 : WAVE[i % WAVE.length],
    }
  })
})

const roadPath = computed(() => {
  const pts = cells.value.map(c => [c.x, c.y])
  if (!pts.length) return ''
  const start = props.hasPrev ? [-4, pts[0][1]] : pts[0]
  const end   = props.hasNext ? [104, pts[pts.length - 1][1]] : pts[pts.length - 1]
  const all = [start, ...pts, end]
  let d = `M${all[0][0]} ${all[0][1]}`
  for (let i = 1; i < all.length; i++) {
    const [x0, y0] = all[i - 1]
    const [x1, y1] = all[i]
    const mx = (x0 + x1) / 2
    d += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`
  }
  return d
})

// Новый участок: фишка заезжает с края поля на первую клетку
const entered = ref(!(props.hasPrev && props.enter))
onMounted(() => {
  if (entered.value) return
  requestAnimationFrame(() => requestAnimationFrame(() => { entered.value = true }))
})

// Фишка стоит на текущей клетке; когда участок пройден — у выхода с поля
const chipStyle = computed(() => {
  const active = cells.value.find(c => c.state === 'active')
  const last = cells.value[cells.value.length - 1]
  const first = cells.value[0]
  if (!entered.value && first) return { left: '-6%', top: first.y + '%' }
  const spot = active ?? (last ? { x: props.hasNext ? 91 : last.x, y: last.y } : { x: 50, y: 50 })
  return { left: spot.x + '%', top: spot.y + '%' }
})
</script>

<style scoped>
.track {
  position: relative;
  height: clamp(140px, 21svh, 200px);
  margin: 0 -4px;
}

.track__road {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  overflow: visible;
}
.track__band, .track__dash {
  fill: none;
  vector-effect: non-scaling-stroke;
}
.track__band {
  stroke: color-mix(in srgb, var(--field-ink) 16%, var(--field));
  stroke-width: 22;
  stroke-linecap: round;
}
.track__dash {
  stroke: color-mix(in srgb, var(--field-ink) 55%, var(--field));
  stroke-width: 2.5;
  stroke-dasharray: 2 9;
  stroke-linecap: round;
}

.track__cells { list-style: none; margin: 0; padding: 0; }
.track__slot {
  position: absolute;
  transform: translate(-50%, -50%);
}

.cell {
  --size: 50px;
  display: grid; place-items: center;
  width: var(--size); height: var(--size);
  border: 3px solid var(--rule);
  border-bottom-width: 6px;
  border-radius: 9px;
  font-family: var(--font-d);
  font-size: 1.35rem;
  line-height: 1;
  box-shadow: 0 6px 10px -4px color-mix(in srgb, var(--rule) 55%, transparent);
}

.cell--done {
  background: var(--done);
  color: var(--plate-ink);
  cursor: pointer;
  padding: 0;
  transition: transform .2s cubic-bezier(.2, .8, .2, 1);
}
.cell--done:active { transform: translateY(2px); }
.cell--done:focus-visible {
  outline: 3px solid var(--field-ink);
  outline-offset: 3px;
}
.cell--wrong { color: var(--wrong); }

.cell--active {
  --size: 64px;
  background: var(--plate);
  color: var(--plate-ink);
  font-size: 1.7rem;
}

.cell--back {
  background:
    repeating-linear-gradient(135deg,
      var(--back) 0 5px,
      color-mix(in srgb, var(--field-ink) 14%, var(--back)) 5px 7px);
  border-color: color-mix(in srgb, var(--rule) 70%, var(--field));
}

/* Фишка: крашеное дерево, вид сверху */
.track__chip {
  position: absolute;
  width: 30px; height: 30px;
  margin: -46px 0 0 14px;
  border-radius: 50%;
  background: var(--chip);
  border: 3px solid var(--rule);
  box-shadow:
    inset 0 0 0 5px color-mix(in srgb, var(--chip) 70%, #fff8),
    0 8px 10px -4px color-mix(in srgb, var(--rule) 60%, transparent);
  transition:
    left .55s cubic-bezier(.16, 1, .3, 1),
    top  .55s cubic-bezier(.16, 1, .3, 1);
  pointer-events: none;
}

/* ── Обличье дела: заметки на кнопках, красная нить ─────────── */
.track--casefile .track__band { display: none; }
.track--casefile .track__dash {
  stroke: var(--chip);
  stroke-width: 2;
  stroke-dasharray: none;
}
.track--casefile .cell {
  position: relative;
  border: none;
  border-radius: 2px;
  box-shadow: 0 10px 14px -8px color-mix(in srgb, var(--rule) 85%, transparent);
}
.track--casefile .cell::before {
  content: "";
  position: absolute; top: -7px; left: 50%;
  width: 13px; height: 13px; margin-left: -6.5px;
  border-radius: 50%;
  background: var(--rule);
  box-shadow: inset -2px -2px 0 color-mix(in srgb, var(--field-ink) 25%, var(--rule));
}
.track--casefile .track__slot:nth-child(odd)  .cell { transform: rotate(-4deg); }
.track--casefile .track__slot:nth-child(even) .cell { transform: rotate(3deg); }
.track--casefile .cell--back { background: var(--back); }
.track--casefile .cell--back::after {
  content: "";
  position: absolute; inset: 9px;
  border: 2px dashed color-mix(in srgb, var(--field-ink) 30%, var(--back));
}
.track--casefile .track__chip {
  width: 24px; height: 24px;
  margin: -40px 0 0 16px;
  border-width: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .track__chip, .cell--done { transition: none; }
}
</style>
