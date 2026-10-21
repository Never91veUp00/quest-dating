<template>
  <div class="ci">
    <p v-if="task.game_question" class="mg-prompt">{{ task.game_question }}</p>

    <!-- Шифровка и её прочтение при текущем положении колеса -->
    <div class="ci__strip mg-board" :class="{ 'is-right': solved }">
      <QuestMark v-if="solved" :decor="decor" kind="right" />
      <p class="ci__enc" aria-label="Шифровка">{{ encrypted }}</p>
      <p class="ci__dec" aria-live="polite">{{ decoded }}</p>
    </div>

    <p class="ci__key">
      Ключ: под <b>А</b> должна встать <b class="ci__key-ch">{{ keyLetter }}</b>
    </p>

    <!-- Колесо: внешнее кольцо — обычные буквы, внутреннее — буквы шифра, крутится -->
    <div class="ci__wheel-wrap">
      <svg
        class="ci__wheel"
        :class="{ 'is-drag': dragging, 'is-right': solved }"
        viewBox="0 0 300 300"
        role="slider"
        tabindex="0"
        aria-label="Шифр-колесо"
        aria-valuemin="0" :aria-valuemax="N - 1" :aria-valuenow="shift"
        :aria-valuetext="`Под А стоит ${ALPHA[shift]}`"
        @keydown.left.prevent="turn(-1)" @keydown.right.prevent="turn(1)"
        @keydown.down.prevent="turn(-1)" @keydown.up.prevent="turn(1)"
        @pointerdown="down" @pointermove="move" @pointerup="up" @pointercancel="up"
      >
        <circle class="ci__outer" cx="150" cy="150" r="146" />
        <g class="ci__ring">
          <text v-for="(ch, i) in ALPHA" :key="'o'+i" class="ci__ch ci__ch--outer"
            :transform="`rotate(${i * STEP} 150 150)`" x="150" y="22">{{ ch }}</text>
        </g>
        <g class="ci__inner-g" :style="{ transform: `rotate(${angle}deg)` }">
          <circle class="ci__inner" cx="150" cy="150" r="112" />
          <line v-for="(_, i) in ALPHA" :key="'t'+i" class="ci__tick"
            :transform="`rotate(${(i + .5) * STEP} 150 150)`" x1="150" y1="38" x2="150" y2="48" />
          <text v-for="(ch, i) in ALPHA" :key="'i'+i" class="ci__ch ci__ch--inner"
            :transform="`rotate(${i * STEP} 150 150)`" x="150" y="60">{{ ch }}</text>
          <circle class="ci__hub" cx="150" cy="150" r="64" />
        </g>
        <!-- окно чтения сверху: пара «обычная буква — буква шифра» -->
        <path class="ci__window" :d="windowPath" />
      </svg>
      <div class="ci__turns">
        <button class="ci__turn mg-item" :disabled="solved" aria-label="Повернуть назад" @click="turn(-1)">
          <QuestIcon name="back" :size="22" />
        </button>
        <button class="ci__turn mg-item" :disabled="solved" aria-label="Повернуть вперёд" @click="turn(1)">
          <QuestIcon name="forward" :size="22" />
        </button>
      </div>
    </div>

    <template v-if="solved">
      <p class="mg-result" role="status">Шифр разгадан</p>
      <button class="task__action" @click="$emit('complete', task)">Идти дальше</button>
    </template>
    <button v-else class="mg-skip" @click="$emit('skip-task', task)">Не получается? Пропустить</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QuestMark from '../../QuestMark.vue'
import QuestIcon from '../../QuestIcon.vue'
import { RU_ALPHABET, caesar } from '~/utils/miniGames'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete', 'skip-task'])

const decor = computed(() => props.theme.world?.decor ?? null)

const ALPHA = [...RU_ALPHABET]
const N     = ALPHA.length
const STEP  = 360 / N
const mod   = (n) => ((n % N) + N) % N

// сдвиг 0 читался бы сразу — старое задание без сдвига получает 3
const key = mod(Number(props.task.cipher_shift) || 3) || 3
const keyLetter = ALPHA[key]
const encrypted = computed(() => caesar(props.task.cipher_phrase || '', key))

const angle    = ref(0)                  // поворот внутреннего кольца, градусы
const shift    = computed(() => mod(Math.round(-angle.value / STEP)))
const decoded  = computed(() => caesar(encrypted.value, -shift.value))
const solved   = ref(false)

const settle = () => {
  angle.value = -Math.round(-angle.value / STEP) * STEP
  if (shift.value === key) solved.value = true
}
const turn = (dir) => {
  if (solved.value) return
  angle.value = -(Math.round(-angle.value / STEP) + dir) * STEP
  settle()
}

// перетаскивание: колесо идёт за пальцем, на отпускании встаёт на букву
const dragging = ref(false)
let startA = 0, startAngle = 0
const pointerAngle = (e) => {
  const r = e.currentTarget.getBoundingClientRect()
  return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI
}
const down = (e) => {
  if (solved.value) return
  dragging.value = true
  e.currentTarget.setPointerCapture?.(e.pointerId)
  startA = pointerAngle(e)
  startAngle = angle.value
}
const move = (e) => {
  if (!dragging.value) return
  let d = pointerAngle(e) - startA
  if (d > 180) d -= 360
  if (d < -180) d += 360
  angle.value = startAngle + d
  startA = pointerAngle(e); startAngle = angle.value
}
const up = () => {
  if (!dragging.value) return
  dragging.value = false
  settle()
}

// окно чтения: сектор шириной в одну букву через оба кольца
const windowPath = (() => {
  const a = (STEP / 2) * Math.PI / 180
  const pt = (r, s) => `${150 + r * Math.sin(s * a)} ${150 - r * Math.cos(s * a)}`
  return `M ${pt(146, -1)} A 146 146 0 0 1 ${pt(146, 1)} L ${pt(72, 1)} A 72 72 0 0 0 ${pt(72, -1)} Z`
})()
</script>

<style scoped>
.ci { display: flex; flex-direction: column; gap: 12px; }

.ci__strip {
  padding: 14px 16px;
  background: var(--mi-bg);
  border: 2px solid color-mix(in srgb, var(--ink) 22%, var(--paper));
  border-radius: var(--mi-radius, 8px);
  transition: border-color .2s, background-color .2s;
}
.ci__strip.is-right { border-color: var(--chip); background: var(--mi-done-bg); }
.ci__enc, .ci__dec {
  margin: 0;
  font-family: var(--font-d);
  font-weight: var(--font-d-wt, 400);
  letter-spacing: .04em;
  overflow-wrap: anywhere;
}
.ci__enc { font-size: .9rem; color: color-mix(in srgb, var(--mi-ink) 72%, var(--mi-bg)); }
.ci__dec { margin-top: 6px; font-size: 1.3rem; line-height: 1.3; color: var(--mi-ink); }
.ci__strip.is-right .ci__enc { color: color-mix(in srgb, var(--mi-done-ink) 72%, var(--mi-done-bg)); }
.ci__strip.is-right .ci__dec { color: var(--mi-done-ink); }

.ci__key { margin: 0; text-align: center; font-size: .95rem; color: var(--ink); }
.ci__key b { font-family: var(--font-d); font-weight: var(--font-d-wt, 400); font-size: 1.15rem; }
.ci__key-ch { color: var(--chip); }

.ci__wheel-wrap { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.ci__turns { display: flex; gap: 24px; }
.ci__turn.mg-item { justify-content: center; width: 56px; height: 56px; min-height: 0; padding: 0; border-radius: 50%; }
.ci__turn.mg-item:disabled { opacity: .45; }

.ci__wheel {
  width: min(320px, 100%); height: auto;
  touch-action: none;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
  border-radius: 50%;
}
.ci__wheel.is-drag { cursor: grabbing; }
.ci__wheel:focus-visible { outline: 3px solid var(--focus, var(--mi-sel)); outline-offset: 3px; }

.ci__outer  { fill: var(--paper); stroke: color-mix(in srgb, var(--ink) 40%, var(--paper)); stroke-width: 2; }
.ci__inner  { fill: color-mix(in srgb, var(--paper-edge) 50%, var(--paper)); stroke: color-mix(in srgb, var(--ink) 40%, var(--paper)); stroke-width: 1.5; }
.ci__hub    { fill: var(--paper); stroke: color-mix(in srgb, var(--ink) 30%, var(--paper)); stroke-width: 1.5; }
.ci__tick   { stroke: color-mix(in srgb, var(--ink) 25%, var(--paper)); stroke-width: 1; }
.ci__window { pointer-events: none; fill: color-mix(in srgb, var(--chip) 16%, transparent); stroke: var(--chip); stroke-width: 2; }
.ci__ch {
  fill: var(--ink);
  font-family: var(--font-d);
  font-weight: var(--font-d-wt, 400);
  text-anchor: middle;
  dominant-baseline: middle;
}
.ci__ch--outer { font-size: 17px; }
.ci__ch--inner { font-size: 16px; }

.ci__inner-g {
  transform-origin: 150px 150px;
  transform-box: view-box;
  transition: transform .26s cubic-bezier(.2, .7, .2, 1);
}
.ci__wheel.is-drag .ci__inner-g { transition: none; }
.ci__wheel.is-right .ci__window { pointer-events: none; fill: color-mix(in srgb, var(--chip) 30%, transparent); }

/* миры: колесо из материала мира */
.mgw--tarot  .ci__inner  { fill: var(--back); }
.mgw--tarot  .ci__ch--inner { fill: var(--paper); }
.mgw--tarot  .ci__hub    { fill: var(--back); stroke: var(--paper); }
.mgw--diecut .ci__inner  { fill: var(--back); stroke: var(--rule); }
.mgw--diecut .ci__ch--inner { fill: var(--paper); }
.mgw--diecut .ci__hub    { fill: var(--back); stroke: var(--rule); }
.mgw--potion .ci__inner  { fill: var(--back); }
.mgw--potion .ci__ch--inner { fill: var(--paper); }
.mgw--potion .ci__hub    { fill: var(--back); stroke: var(--rule); }
.mgw--metro  .ci__outer  { stroke: var(--chip); stroke-width: 6; }
.mgw--map    .ci__outer  { fill: color-mix(in srgb, var(--paper-edge) 45%, var(--paper)); }
.mgw--letters .ci__outer { stroke-dasharray: 5 4; }
.mgw--casefile .ci__inner { fill: var(--paper-edge); }
/* широкий дисплейный шрифт «Дела» не помещает 33 буквы по кругу — колесо набрано текстом */
.mgw--casefile .ci__ch { font-family: var(--font-b); font-weight: 700; }
.mgw--casefile .ci__ch--inner { font-size: 14px; }
.mgw--ringbox .ci__strip { border-radius: 16px; }

@media (prefers-reduced-motion: reduce) {
  .ci__inner-g { transition: none; }
}
</style>
