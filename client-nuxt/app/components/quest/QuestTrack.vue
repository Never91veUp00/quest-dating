<template>
  <div class="track" :class="decor && `track--${decor}`" :style="{ '--n': cells.length }">
    <svg class="track__road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <template v-if="decor === 'casefile'">
        <!-- Настоящая нить: тень на сукне, основа и скрутка, провисает между кнопками -->
        <path class="thread thread--shadow" :d="threadPath" />
        <path class="thread thread--base" :d="threadPath" />
        <path class="thread thread--twist" :d="threadPath" />
        <path class="thread thread--twist2" :d="threadPath" />
      </template>
      <template v-else-if="decor === 'metro'">
        <!-- Линия маршрута: прямые перегоны, как на схеме -->
        <path class="metro-line" :d="linePath" />
      </template>
      <template v-else-if="decor === 'letters'">
        <!-- Атласная лента: тень на подкладке, лента и блик на изгибах -->
        <path class="ribbon ribbon--shadow" :d="roadPath" />
        <path class="ribbon ribbon--base" :d="roadPath" />
        <path class="ribbon ribbon--sheen" :d="roadPath" />
      </template>
      <template v-else>
        <path class="track__band" :d="roadPath" />
        <path class="track__dash" :d="roadPath" />
      </template>
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
          <!-- В переписке пройденный конверт погашен штемпелем, свежий — с ударом -->
          <QuestPostmark
            v-if="decor === 'letters' && cell.state === 'done'"
            class="cell__postmark"
            :class="{ 'is-fresh': cell.id === stampId }"
            :size="46" :no="cell.n" :seed="cell.n"
          />
          <!-- На схеме пройденную станцию пробивает компостер -->
          <span
            v-else-if="decor === 'metro' && cell.state === 'done'"
            class="cell__punch"
            :class="{ 'is-fresh': cell.id === stampId }"
            aria-hidden="true"
          ><i></i><i></i><i></i></span>
          <QuestIcon v-else :name="cell.state === 'wrong' ? 'close' : 'check'" :size="22" />
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
        <span v-if="stampId != null && cell.id === stampId && decor !== 'letters' && decor !== 'metro'" class="cell__stamp" aria-hidden="true">
          <QuestSeal :size="92" />
        </span>
      </li>
    </ol>

    <span class="track__chip" :style="chipStyle" aria-hidden="true"></span>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import QuestIcon from './QuestIcon.vue'
import QuestSeal from './QuestSeal.vue'
import QuestPostmark from './QuestPostmark.vue'

const props = defineProps({
  tasks:        { type: Array,   required: true },
  completedIds: { type: Array,   default: () => [] },
  earnedMap:    { type: Object,  default: () => ({}) },
  hasPrev:      { type: Boolean, default: false },
  hasNext:      { type: Boolean, default: false },
  decor:        { type: String,  default: null },
  enter:        { type: Boolean, default: false }, // фишка заезжает с края поля
  stampId:      { type: [String, Number], default: null }, // клетка, на которую хлопает штамп
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

// Схема метро: прямые перегоны между станциями, за краем — продолжение линии
const linePath = computed(() => {
  const pts = cells.value.map(c => [c.x, c.y])
  if (!pts.length) return ''
  const all = [
    ...(props.hasPrev ? [[-4, pts[0][1]]] : []),
    ...pts,
    ...(props.hasNext ? [[104, pts[pts.length - 1][1]]] : []),
  ]
  return all.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ')
})

// Нить дела: от кнопки к кнопке (верх заметки), провисает между ними
const PIN = 14 // кнопка над центром клетки, в % высоты трассы
const threadPath = computed(() => {
  const pins = cells.value.map(c => [c.x, c.y - PIN])
  if (!pins.length) return ''
  const all = [
    ...(props.hasPrev ? [[-4, pins[0][1] + 6]] : []),
    ...pins,
    ...(props.hasNext ? [[104, pins[pins.length - 1][1] + 6]] : []),
  ]
  let d = `M${all[0][0]} ${all[0][1]}`
  for (let i = 1; i < all.length; i++) {
    const [x0, y0] = all[i - 1]
    const [x1, y1] = all[i]
    const sag = 6 + Math.abs(x1 - x0) * 0.08
    d += ` Q${(x0 + x1) / 2} ${Math.max(y0, y1) + sag} ${x1} ${y1}`
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
.thread { fill: none; vector-effect: non-scaling-stroke; stroke-linecap: round; }
.thread--shadow {
  stroke: color-mix(in srgb, var(--rule) 28%, transparent);
  stroke-width: 4;
  transform: translate(.4px, 2px);
}
.thread--base   { stroke: var(--chip); stroke-width: 3; }
/* скрутка: светлые и тёмные волокна со сдвигом */
.thread--twist  { stroke: color-mix(in srgb, var(--chip) 62%, #f4d9cf); stroke-width: 1.4; stroke-dasharray: 2.2 3.2; }
.thread--twist2 { stroke: color-mix(in srgb, var(--chip) 70%, var(--rule)); stroke-width: 1.2; stroke-dasharray: 1.4 4; stroke-dashoffset: 2.6; }
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

/* ── Обличье схемы метро: станции на зелёной линии ───────────── */
.metro-line {
  fill: none;
  vector-effect: non-scaling-stroke;
  stroke: var(--chip);
  stroke-width: 10;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.track--metro .cell {
  border-radius: 50%;
  box-shadow: none;
}
/* Вы здесь: крупная станция с обводкой цвета линии */
.track--metro .cell--active {
  --size: 58px;
  border: 7px solid var(--chip);
  font-weight: 700;
  font-size: 1.45rem;
  box-shadow: 0 0 0 3px var(--field), 0 8px 12px -6px color-mix(in srgb, var(--rule) 45%, transparent);
}
/* Пройдена: сплошная станция, пробитая компостером */
.track--metro .cell--done {
  --size: 40px;
  border: 3px solid var(--field);
  box-shadow: 0 0 0 3px var(--chip);
}
.track--metro .cell--wrong { background: var(--field); color: var(--wrong); box-shadow: 0 0 0 3px var(--wrong); }
/* Впереди: пустой кружок на линии, без номера */
.track--metro .cell--back {
  --size: 26px;
  background: var(--back);
  border: 4px solid var(--rule);
}
.cell__punch { display: flex; gap: 3px; }
.cell__punch i {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--field);
  box-shadow: inset 0 1px 1px color-mix(in srgb, var(--rule) 45%, transparent);
}
.cell__punch i:nth-child(2) { transform: translateY(-4px); }
.cell__punch.is-fresh i { animation: punch .22s cubic-bezier(.7, 0, .84, 0) both; }
.cell__punch.is-fresh i:nth-child(2) { animation-delay: .06s; }
.cell__punch.is-fresh i:nth-child(3) { animation-delay: .12s; }
@keyframes punch {
  from { transform: scale(0); }
  to   { transform: scale(1); }
}
.cell__punch.is-fresh i:nth-child(2) { animation-name: punch-mid; }
@keyframes punch-mid {
  from { transform: translateY(-4px) scale(0); }
  to   { transform: translateY(-4px) scale(1); }
}
/* компостер щёлкает: станция чуть проседает и возвращается */
.track--metro .cell--done:has(.is-fresh) { animation: compost .36s cubic-bezier(.16, 1, .3, 1) .1s both; }
@keyframes compost {
  from { transform: scale(.82); }
  to   { transform: scale(1); }
}
/* Фишка — вагончик над станцией */
.track--metro .track__chip {
  width: 34px; height: 18px;
  margin: -46px 0 0 -17px;
  border-radius: 9px 9px 4px 4px;
  background: var(--rule);
  border: none;
  box-shadow: 0 6px 8px -4px color-mix(in srgb, var(--rule) 55%, transparent);
}
.track--metro .track__chip::before {
  content: "";
  position: absolute; left: 6px; right: 6px; top: 4px; height: 5px;
  border-radius: 2px;
  background: repeating-linear-gradient(90deg, var(--field) 0 6px, transparent 6px 9px);
}

/* ── Обличье переписки: конверты на атласной ленте ──────────── */
.ribbon { fill: none; vector-effect: non-scaling-stroke; stroke-linecap: round; }
.ribbon--shadow {
  stroke: color-mix(in srgb, var(--rule) 35%, transparent);
  stroke-width: 9;
  transform: translate(.6px, 3px);
}
.ribbon--base  { stroke: var(--chip); stroke-width: 7; }
/* блик атласа: светлая нить по одному краю ленты */
.ribbon--sheen {
  stroke: color-mix(in srgb, var(--chip) 45%, var(--paper));
  stroke-width: 1.6;
  transform: translateY(-1.6px);
}
.track--letters .cell {
  --w: 60px; --h: 42px;
  position: relative;
  width: var(--w); height: var(--h);
  border: none;
  border-radius: 2px;
  overflow: hidden;
  box-shadow:
    0 1px 0 color-mix(in srgb, var(--rule) 20%, transparent),
    0 9px 12px -7px color-mix(in srgb, var(--rule) 80%, transparent);
}
.track--letters .track__slot:nth-child(odd)  .cell { transform: rotate(-3deg); }
.track--letters .track__slot:nth-child(even) .cell { transform: rotate(2.5deg); }
/* Лицом вверх: адресная сторона с маркой в углу */
.track--letters .cell--active {
  --w: 76px; --h: 54px;
  font-weight: 700;
  font-size: 1.85rem;
}
.track--letters .cell--active::after {
  content: "";
  position: absolute; top: 5px; right: 5px;
  width: 13px; height: 15px;
  background: var(--chip);
  outline: 2px dotted var(--paper);
  outline-offset: -2px;
}
/* Доставлен: оттиск штемпеля, кромка конверта обрезает волны гашения */
.track--letters .cell--done { color: var(--ink); }
.cell__postmark {
  position: absolute; left: -4px; top: -3px;
  transform: rotate(-8deg);
}
.cell__postmark.is-fresh { animation: postmark-hit .3s cubic-bezier(.7, 0, .84, 0) .12s both; }
.track--letters .cell--wrong { color: var(--wrong); }
/* Обратной стороной: клапан закрыт, видны сгибы — содержимого не видно */
.track--letters .cell--back {
  background:
    linear-gradient(to top right, transparent calc(50% - 1px), color-mix(in srgb, var(--rule) 30%, var(--back)) calc(50% - 1px) calc(50% + .5px), transparent calc(50% + .5px)) left bottom / 50% 70% no-repeat,
    linear-gradient(to top left,  transparent calc(50% - 1px), color-mix(in srgb, var(--rule) 30%, var(--back)) calc(50% - 1px) calc(50% + .5px), transparent calc(50% + .5px)) right bottom / 50% 70% no-repeat,
    var(--back);
}
.track--letters .cell--back::before {
  content: "";
  position: absolute; inset: 0 0 38% 0;
  background: color-mix(in srgb, var(--field-ink) 14%, var(--back));
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}
.track--letters .track__chip {
  width: 22px; height: 22px;
  margin: -42px 0 0 22px;
  border: 2px solid var(--rule);
  box-shadow:
    inset 0 0 0 4px color-mix(in srgb, var(--chip) 60%, var(--paper)),
    0 6px 8px -3px color-mix(in srgb, var(--rule) 60%, transparent);
}
@keyframes postmark-hit {
  from { opacity: 0; transform: scale(1.7) rotate(-18deg); }
  70%  { opacity: 1; transform: scale(.95) rotate(-7deg); }
  to   { opacity: 1; transform: scale(1) rotate(-8deg); }
}

/* Сургучная печать: ложится на пройденную клетку в момент хода */
.cell__stamp {
  position: absolute; left: 50%; top: 50%;
  width: 92px; height: 92px; margin: -46px 0 0 -46px;
  z-index: 2;
  pointer-events: none;
  transform: rotate(-14deg);
  animation: stamp-slam .3s cubic-bezier(.7, 0, .84, 0) .12s both;
}
@keyframes stamp-slam {
  from { opacity: 0; transform: scale(1.9) rotate(-34deg); }
  70%  { opacity: 1; transform: scale(.94) rotate(-12deg); }
  to   { opacity: 1; transform: scale(1) rotate(-14deg); }
}

@media (prefers-reduced-motion: reduce) {
  .cell__stamp, .cell__postmark.is-fresh, .cell__punch.is-fresh i, .track--metro .cell--done:has(.is-fresh) { animation: none; }
  .track__chip, .cell--done { transition: none; }
}
</style>
