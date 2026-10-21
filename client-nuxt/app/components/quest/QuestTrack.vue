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
      <template v-else-if="decor === 'map'">
        <!-- Пергаментный остров: береговая линия и второй контур мелководья, по суше — пунктир маршрута -->
        <path class="isle isle--shoal" :d="ISLE" transform="translate(50 50) scale(1.06 1.1) translate(-50 -50)" />
        <path class="isle isle--land" :d="ISLE" />
        <!-- по суше маршрут идёт чернилами, к соседним островам по морю — мелом -->
        <path class="map-route map-route--sea" :d="roadPath" />
        <path class="map-route" :d="landRoute" />
      </template>
      <template v-else-if="decor === 'potion'">
        <!-- Медная трубка перегонного куба: тёмный контур и медная жила -->
        <path class="tube tube--outer" :d="roadPath" />
        <path class="tube tube--inner" :d="roadPath" />
      </template>
      <template v-else-if="decor === 'ringbox'">
        <!-- Шёлковая нить: пунктир стёжками от футляра к футляру -->
        <path class="ring-thread" :d="roadPath" />
      </template>
      <template v-else-if="decor === 'tarot'">
        <!-- Расклад на сукне: тонкая меловая разметка от карты к карте -->
        <path class="tarot-line" :d="linePath" />
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
          <!-- На карте пройденную метку перечёркивает красный крест: два штриха пером -->
          <svg
            v-else-if="decor === 'map' && cell.state === 'done'"
            class="cell__x" :class="{ 'is-fresh': cell.id === stampId }"
            viewBox="0 0 24 24" aria-hidden="true"
          ><path d="M5 5.5 L19 18.5" /><path d="M18.5 5 L5.5 19" /></svg>
          <!-- Пройденный флакон наполнен зельем; свежий наполняется на ходу -->
          <QuestFlask
            v-else-if="decor === 'potion' && cell.state === 'done'"
            :size="58" :level=".72" :fresh="cell.id === stampId"
          />
          <!-- Пройденный шаг — открытый футляр с камешком; свежий открывается на ходу -->
          <QuestRingbox
            v-else-if="decor === 'ringbox' && cell.state === 'done'"
            class="cell__ringbox" :size="46" :fresh="cell.id === stampId"
          />
          <!-- Пропущенная метка: перечёркнута одним чернильным штрихом, не крестом клада -->
          <svg
            v-else-if="decor === 'map' && cell.state === 'wrong'"
            class="cell__skip" viewBox="0 0 24 24" aria-hidden="true"
          ><path d="M6 12 H18" /></svg>
          <!-- В колоде пройденная карта перевёрнута лицом и показывает свой знак -->
          <QuestArcana
            v-else-if="decor === 'tarot' && cell.state === 'done'"
            class="cell__arcana"
            :class="{ 'is-fresh': cell.id === stampId }"
            :no="cell.index" :size="34"
          />
          <QuestIcon v-else :name="cell.state === 'wrong' ? 'close' : 'check'" :size="22" />
        </button>
        <span
          v-else-if="cell.state === 'active'"
          class="cell cell--active"
          :class="{ 'is-reveal': cell.index > stampIndex }"
          aria-current="step"
          :aria-label="`Клетка ${cell.n}: сейчас здесь`"
        >
          <QuestFlask v-if="decor === 'potion'" :size="76" :label="cell.n" />
          <template v-else>{{ decor === 'tarot' ? roman(cell.n) : cell.n }}</template>
        </span>
        <span
          v-else
          class="cell cell--back"
          :aria-label="`Клетка ${cell.n}: закрыта`"
        ><QuestFlask v-if="decor === 'potion'" :size="44" /></span>
        <span v-if="stampId != null && cell.id === stampId && !['letters', 'metro', 'tarot', 'map', 'ringbox', 'potion'].includes(decor)" class="cell__stamp" aria-hidden="true">
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
import QuestArcana from './QuestArcana.vue'
import QuestRingbox from './QuestRingbox.vue'
import QuestFlask from './QuestFlask.vue'
import { roman } from './themes.js'

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

// Остров на карте: изрезанный берег с двумя бухтами и мысом вокруг всей трассы (координаты трассы, 0–100)
const ISLE = 'M97.3 46.4 Q96.4 50.0 95.8 53.3 Q95.2 56.7 94.2 59.9 Q93.2 63.1 93.4 67.0 Q93.6 70.8 91.0 73.4 Q88.3 76.1 86.1 78.9 Q83.8 81.7 80.6 83.4 Q77.3 85.2 73.4 85.4 Q69.4 85.6 65.7 85.2 Q62.1 84.8 59.0 84.8 Q55.9 84.8 52.9 87.8 Q50.0 90.8 46.3 92.0 Q42.7 93.2 38.9 93.2 Q35.0 93.2 31.9 91.1 Q28.8 89.0 26.1 86.7 Q23.3 84.4 20.6 82.2 Q17.9 80.0 14.5 78.2 Q11.1 76.4 10.3 72.9 Q9.5 69.3 7.1 66.6 Q4.6 63.8 3.8 60.4 Q3.0 57.0 4.1 53.5 Q5.1 50.0 4.1 46.5 Q3.1 43.0 7.6 40.8 Q12.2 38.5 13.1 35.7 Q14.1 32.9 14.0 29.2 Q14.0 25.5 16.1 22.8 Q18.1 20.2 19.9 16.9 Q21.8 13.6 25.0 11.8 Q28.2 9.9 32.1 9.8 Q36.0 9.7 39.3 7.8 Q42.5 5.8 46.3 6.7 Q50.0 7.7 53.8 6.2 Q57.7 4.7 61.2 6.1 Q64.8 7.4 68.6 8.1 Q72.4 8.9 74.6 12.2 Q76.8 15.5 81.1 16.2 Q85.5 16.8 89.0 18.9 Q92.6 21.0 93.1 25.1 Q93.5 29.3 93.4 33.0 Q93.3 36.8 95.8 39.8 Q98.2 42.8 97.3 46.4 Z'

// Карта, которую только что прошли: следующая за ней открывается с переворотом
const stampIndex = computed(() =>
  props.stampId == null ? Infinity : props.tasks.findIndex(t => t.id === props.stampId)
)

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
      // на карте метки держатся на суше, дальше от берега
      x: n === 1 ? 50 : props.decor === 'map' ? 20 + (60 * i) / (n - 1) : 14 + (72 * i) / (n - 1),
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

// Маршрут по острову: те же кривые, но только между метками, без выхода в море
const landRoute = computed(() => {
  const pts = cells.value.map(c => [c.x, c.y])
  if (!pts.length) return ''
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const mx = (x0 + x1) / 2
    d += ` C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}`
  }
  return d
})

// Схема метро и расклад карт: прямые перегоны между станциями, за краем — продолжение линии
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

/* ── Обличье зельеварни: флаконы на медной трубке ───────────── */
.track--potion { height: clamp(190px, 30svh, 280px); }
.tube { fill: none; vector-effect: non-scaling-stroke; stroke-linecap: round; }
.tube--outer { stroke: var(--rule); stroke-width: 7; }
.tube--inner { stroke: color-mix(in srgb, var(--chip) 45%, var(--paper-edge)); stroke-width: 3; }
/* флакон рисует себя сам: у клетки нет плашки и контура */
.track--potion .cell {
  width: auto; height: auto;
  border: none;
  border-radius: 0;
  background: none;
  box-shadow: none;
  filter: drop-shadow(0 7px 6px color-mix(in srgb, var(--rule) 70%, transparent));
}
.track--potion .cell--wrong {
  --size: 30px;
  width: var(--size); height: var(--size);
  border-radius: 50%;
  border: 1.5px solid var(--rule);
  background: var(--back);
  color: var(--field-ink-soft);
}
/* фишка — капля зелья над текущим флаконом */
.track--potion .track__chip {
  width: 16px; height: 16px;
  margin: -88px 0 0 -8px;
  border: 1.5px solid var(--rule);
  border-radius: 50% 0 50% 50%;
  background: var(--chip);
  transform: rotate(-45deg);
  box-shadow: none;
}

/* ── Обличье футляра: маленькие футляры на шёлковой нити ─────── */
.track--ringbox { height: clamp(180px, 28svh, 260px); }
.ring-thread {
  fill: none;
  vector-effect: non-scaling-stroke;
  stroke: color-mix(in srgb, var(--field-ink) 42%, var(--field));
  stroke-width: 1.6;
  stroke-dasharray: 5 4;
  stroke-linecap: round;
}
/* футляр закрыт: бархат глубже поля, шов крышки на трети высоты */
.track--ringbox .cell {
  border: 1.5px solid var(--rule);
  border-radius: 9px 9px 7px 7px;
  box-shadow: 0 8px 12px -8px color-mix(in srgb, var(--rule) 70%, transparent);
}
.track--ringbox .cell--back {
  --size: 30px;
  background:
    linear-gradient(transparent calc(36% - .75px), color-mix(in srgb, var(--rule) 55%, var(--back)) calc(36% - .75px) calc(36% + .75px), transparent calc(36% + .75px)),
    var(--back);
}
/* сейчас: футляр крупнее, номер на крышке, шов ниже номера */
.track--ringbox .cell--active {
  --size: 56px;
  font-size: 1.5rem;
  background:
    linear-gradient(transparent calc(72% - .75px), color-mix(in srgb, var(--rule) 45%, var(--back)) calc(72% - .75px) calc(72% + .75px), transparent calc(72% + .75px)),
    var(--back);
  color: var(--ink);
  place-items: start center;
  padding-top: 9px;
}
/* пройден: открытый футляр рисует себя сам */
.track--ringbox .cell--done {
  --size: 48px;
  background: none;
  border: none;
  box-shadow: none;
  filter: drop-shadow(0 6px 6px color-mix(in srgb, var(--rule) 35%, transparent));
}
.track--ringbox .cell--wrong { background: var(--back); border: 1.5px solid var(--rule); color: var(--ink-soft); filter: none; }
/* фишка — жемчужина: слоновый шарик с бликом */
.track--ringbox .track__chip {
  width: 20px; height: 20px;
  margin: -52px 0 0 -10px;
  border: 1.5px solid var(--rule);
  background: var(--paper);
  box-shadow:
    inset -3px -3px 0 color-mix(in srgb, var(--paper-edge) 90%, var(--rule)),
    inset 3px 3px 0 color-mix(in srgb, var(--paper) 40%, white),
    0 5px 6px -3px color-mix(in srgb, var(--rule) 60%, transparent);
}

/* ── Обличье пиратской карты: метки на пергаментном острове ──── */
/* остров не растягивается на десктопе: ширина доски ограничена, по центру */
.track--map { width: 100%; height: clamp(200px, 32svh, 300px); max-width: 440px; margin-inline: auto; }
.isle { vector-effect: non-scaling-stroke; stroke-linejoin: round; }
.isle--land {
  fill: var(--paper);
  stroke: var(--ink);
  stroke-width: 2;
  filter: drop-shadow(0 6px 8px color-mix(in srgb, var(--rule) 70%, transparent));
}
/* мелководье: второй береговой контур штрихом по морю */
.isle--shoal {
  fill: none;
  stroke: color-mix(in srgb, var(--field-ink) 45%, var(--field));
  stroke-width: 1.2;
  stroke-dasharray: 3 4;
}
.map-route {
  fill: none;
  vector-effect: non-scaling-stroke;
  stroke: var(--ink);
  stroke-width: 2;
  stroke-dasharray: 6 6;
  stroke-linecap: round;
}
.map-route--sea { stroke: var(--field-ink); stroke-width: 1.6; opacity: .7; }
.track--map .cell {
  border-radius: 50%;
  border: 2px solid var(--ink);
  box-shadow: none;
}
/* впереди: пустой кружок, ещё не исследовано */
.track--map .cell--back {
  --size: 22px;
  background: var(--back);
  border: 2px dotted var(--ink);
}
/* сейчас здесь: номер в кружке, двойной контур пером */
.track--map .cell--active {
  --size: 54px;
  font-size: 1.6rem;
  box-shadow: 0 0 0 3px var(--paper), 0 0 0 4.5px var(--ink);
}
.track--map .cell--done { --size: 40px; }
.track--map .cell--wrong { color: var(--ink-soft); }
.cell__skip { width: 22px; height: 22px; }
.cell__skip path { fill: none; stroke: var(--ink-soft); stroke-width: 3; stroke-linecap: round; }
.cell__x { width: 30px; height: 30px; overflow: visible; }
.cell__x path {
  fill: none;
  stroke: var(--chip);
  stroke-width: 3.6;
  stroke-linecap: round;
  stroke-dasharray: 20;
}
/* ход: крест рисуется пером — сначала один штрих, потом второй */
.cell__x.is-fresh path { animation: x-stroke .22s cubic-bezier(.6, 0, .4, 1) .1s both; }
.cell__x.is-fresh path + path { animation-delay: .34s; }
@keyframes x-stroke { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
/* фишка: флажок на древке, вымпел — красная краска */
.track--map .track__chip {
  width: 22px; height: 34px;
  margin: -62px 0 0 6px;
  border: none; border-radius: 0;
  background: none;
  box-shadow: none;
}
.track--map .track__chip::before {
  content: "";
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 2.5px;
  border-radius: 1px;
  background: var(--ink);
}
.track--map .track__chip::after {
  content: "";
  position: absolute; left: 2.5px; top: 1px;
  border-left: 18px solid var(--chip);
  border-top: 7px solid transparent;
  border-bottom: 7px solid transparent;
  filter: drop-shadow(0 2px 1px color-mix(in srgb, var(--rule) 40%, transparent));
}

/* ── Обличье колоды: карты на сукне ─────────────────────────── */
.tarot-line {
  fill: none;
  vector-effect: non-scaling-stroke;
  stroke: color-mix(in srgb, var(--field-ink) 34%, var(--field));
  stroke-width: 1.5;
  stroke-dasharray: 1 6;
  stroke-linecap: round;
}
/* колода крупнее прочих досок: карта — главный предмет хода */
.track--tarot { height: clamp(210px, 32svh, 290px); }
.track--tarot .cell {
  /* ширина карты по числу карт на столе, пропорции колоды 2:3 */
  --w: clamp(34px, calc(300px / var(--n)), 56px);
  --h: calc(var(--w) * 1.5);
  position: relative;
  width: var(--w); height: var(--h);
  border: none;
  border-radius: 4px;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--rule) 60%, transparent),
    0 9px 12px -7px color-mix(in srgb, var(--rule) 90%, transparent);
}
/* гравированная рамка лица: тонкая линия, отступившая от обреза */
.track--tarot .cell--done::before,
.track--tarot .cell--active::before {
  content: "";
  position: absolute; inset: 3px;
  border: 1px solid color-mix(in srgb, var(--ink) 55%, var(--paper));
  border-radius: 2px;
  pointer-events: none;
}
.track--tarot .track__slot:nth-child(odd)  { --tilt: -2deg; }
.track--tarot .track__slot:nth-child(even) { --tilt: 2deg; }
.track--tarot .cell { transform: rotate(var(--tilt)); }
/* открыта сейчас: крупнее, римский номер */
.track--tarot .cell--active {
  --w: clamp(46px, calc(390px / var(--n)), 72px);
  font-weight: 700;
  font-size: 1.55rem;
  letter-spacing: .02em;
}
.track--tarot .cell--done { color: var(--ink); }
.track--tarot .cell--wrong { color: var(--wrong); }
/* рубашка: киноварь с решёткой слоновой краски и рамкой по обрезу */
.track--tarot .cell--back {
  background:
    repeating-linear-gradient(45deg,  transparent 0 5px, color-mix(in srgb, var(--paper) 38%, var(--back)) 5px 6px),
    repeating-linear-gradient(-45deg, transparent 0 5px, color-mix(in srgb, var(--paper) 38%, var(--back)) 5px 6px),
    var(--back);
}
.track--tarot .cell--back::after {
  content: "";
  position: absolute; inset: 3px;
  border: 1.5px solid var(--paper);
  border-radius: 2px;
}
/* ход: открытая карта переворачивается, на обороте проступает её знак */
.track--tarot .cell--done:has(.is-fresh) { animation: card-flip .56s cubic-bezier(.45, 0, .2, 1) .08s both; }
.cell__arcana.is-fresh { animation: arcana-in .56s steps(1, end) .08s both; }
@keyframes card-flip {
  from { transform: rotate(var(--tilt)) perspective(240px) rotateY(180deg); }
  to   { transform: rotate(var(--tilt)) perspective(240px) rotateY(0); }
}
/* следующая карта открывается: рубашка уходит, проступает римский номер */
.track--tarot .cell--active.is-reveal { animation: card-reveal .56s cubic-bezier(.45, 0, .2, 1) .15s both; }
@keyframes card-reveal {
  0%    { transform: rotate(var(--tilt)) perspective(300px) rotateY(180deg); background: var(--back); color: transparent; }
  49.9% { background: var(--back); color: transparent; }
  50%   { background: var(--plate); color: var(--plate-ink); }
  100%  { transform: rotate(var(--tilt)) perspective(300px) rotateY(0); background: var(--plate); color: var(--plate-ink); }
}
@keyframes arcana-in {
  0%  { opacity: 0; }
  50% { opacity: 1; }
}
/* фишка: киноварный указатель-ромб над картой */
.track--tarot .track__chip {
  width: 16px; height: 16px;
  /* над открытой картой: половина её высоты и зазор */
  margin: calc(clamp(46px, calc(390px / var(--n)), 72px) * -.75 - 22px) 0 0 -8px;
  border-radius: 2px;
  border: 2px solid var(--paper);
  transform: rotate(45deg);
  box-shadow: 0 5px 7px -3px color-mix(in srgb, var(--rule) 80%, transparent);
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
  .cell__stamp, .cell__postmark.is-fresh, .cell__punch.is-fresh i, .track--metro .cell--done:has(.is-fresh),
  .track--tarot .cell--done:has(.is-fresh), .cell__arcana.is-fresh,
  .track--tarot .cell--active.is-reveal, .cell__x.is-fresh path { animation: none; }
  .track__chip, .cell--done { transition: none; }
}
</style>
