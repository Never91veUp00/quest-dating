<template>
  <div
    ref="root"
    class="trail"
    :class="{ 'trail--free': free }"
    :style="{ '--w': `${size.w}px` }"
    @pointerdown="dragStart"
    @pointermove="dragMove"
    @pointerup="dragEnd"
    @pointercancel="dragEnd"
    @wheel="onWheel"
    @click.capture="eatClick"
  >
    <svg class="trail__scene" :viewBox="`0 0 ${size.w} ${size.h}`" aria-hidden="true">
      <defs>
        <linearGradient :id="`${uid}-sky`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3a3530" /><stop offset="1" stop-color="#8a7c6c" />
        </linearGradient>
        <linearGradient :id="`${uid}-fog`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#b9ad9b" stop-opacity="1" />
          <stop offset=".6" stop-color="#b9ad9b" stop-opacity=".8" />
          <stop offset="1" stop-color="#b9ad9b" stop-opacity="0" />
        </linearGradient>
        <radialGradient :id="`${uid}-dark`" cx="50%" cy="30%" r="85%">
          <stop offset=".6" stop-color="#000" stop-opacity="0" /><stop offset="1" stop-color="#1b130e" stop-opacity=".6" />
        </radialGradient>
      </defs>

      <rect :width="size.w" :height="horizonY + 4" :fill="`url(#${uid}-sky)`" />
      <rect :y="horizonY" :width="size.w" :height="size.h - horizonY" fill="#6f6152" />
      <!-- газоны по бокам аллеи -->
      <path :d="lawns.left" fill="#4c5236" />
      <path :d="lawns.right" fill="#4c5236" />
      <!-- поперечные швы плитки -->
      <path v-for="s in seams" :key="s.k" :d="s.d" stroke="rgba(40,30,22,.35)" :stroke-width="s.sw" />
      <!-- листья на плитке -->
      <ellipse
        v-for="l in leaves" :key="l.k"
        :cx="l.x" :cy="l.y" :rx="7 * l.s" :ry="3.5 * l.s" :fill="l.c"
        :transform="`rotate(${l.r} ${l.x} ${l.y})`"
      />
      <!-- след: влажные отпечатки на плитке, светлый выдавленный край снизу отделяет каждый от соседа.
           Пройденный путь лежит неподвижно, новый участок проступает шаг за шагом;
           ниже текущей улики след растворяется к краю -->
      <g v-for="p in prints" :key="p.k" class="trail__print" :transform="p.tf" :opacity="p.o">
        <g transform="translate(0 .05)" fill="rgba(236,224,203,.5)">
          <path :d="SOLE" /><path :d="HEEL" />
        </g>
        <g fill="rgb(34,25,18)">
          <path :d="SOLE" /><path :d="HEEL" />
        </g>
      </g>
      <!-- деревья и фонари — дальние раньше ближних -->
      <g v-for="o in props_" :key="o.k">
        <template v-if="o.kind === 'tree'">
          <path :d="`M${o.x} ${o.y} V${o.y - 420 * o.s}`" stroke="#2c241d" :stroke-width="18 * o.s" />
          <circle :cx="o.x + o.side * 10 * o.s" :cy="o.y - 430 * o.s" :r="130 * o.s" fill="rgba(60,58,38,.85)" />
        </template>
        <template v-else>
          <path :d="`M${o.x} ${o.y} V${o.y - 300 * o.s}`" stroke="#1d1a17" :stroke-width="6 * o.s" />
          <circle :cx="o.x" :cy="o.y - 305 * o.s" :r="60 * o.s" fill="rgba(241,207,134,.16)" />
          <circle :cx="o.x" :cy="o.y - 305 * o.s" :r="14 * o.s" fill="#f1cf86" />
        </template>
      </g>
      <!-- мел вокруг места, где сейчас пара -->
      <ellipse
        v-if="chalk" class="trail__chalk"
        :cx="chalk.x" :cy="chalk.y" :rx="120 * chalk.s" :ry="40 * chalk.s"
      />
      <!-- таблички-домики и шпагат к биркам -->
      <g v-for="m in marks" :key="m.id" :opacity="m.o" :transform="`translate(${m.x} ${m.y}) scale(${m.k})`">
        <ellipse cx="0" cy="1" rx="22" ry="4" fill="rgba(0,0,0,.35)" />
        <path d="M-12 -30 H12 L20 0 H-20Z" :fill="PLATE[m.view]" stroke="#6e5214" stroke-width="1" />
        <path d="M-12 -30 L-20 0" stroke="rgba(0,0,0,.2)" stroke-width="3" />
        <text y="-9" text-anchor="middle" class="trail__no">{{ m.index + 1 }}</text>
        <path :d="m.twine" stroke="#e8e0cf" stroke-width="1" fill="none" />
      </g>
      <rect :y="horizonY - 10" :width="size.w" :height="Math.max(0, fogY - horizonY + 10)" :fill="`url(#${uid}-fog)`" />
      <rect :width="size.w" :height="size.h" :fill="`url(#${uid}-dark)`" />
    </svg>

    <p class="trail__ahead" :style="{ top: `${horizonY + 14}px` }">{{ aheadText }}</p>

    <!-- бирки на шпагате: пройденную можно открыть и перечитать; впереди — только номер -->
    <template v-for="m in marks" :key="`tag-${m.id}`">
      <component
        :is="m.view === 'done' ? 'button' : 'span'"
        :type="m.view === 'done' ? 'button' : undefined"
        class="trail__tag"
        :class="[`trail__tag--${m.view === 'done' ? m.state : m.view}`, m.side > 0 ? 'is-right' : 'is-left', { 'is-fresh': m.id === stampId }]"
        :style="{ left: `${m.tagX}px`, top: `${m.tagY}px`, opacity: m.o }"
        :aria-hidden="m.view === 'ahead' ? 'true' : undefined"
        :aria-label="m.view === 'done' ? `${itemWord} ${m.index + 1}: ${m.title}. ${m.note}. Открыть` : undefined"
        @click="m.view === 'done' && $emit('open', m.index)"
      >
        <span class="trail__tag-hole" aria-hidden="true"></span>
        <em>{{ roman(m.index + 1) }}</em><template v-if="m.view !== 'ahead'">{{ m.title }}</template>
        <small>{{ m.note }}</small>
      </component>
    </template>

    <!-- листание: где камера на маршруте и где текущая улика -->
    <template v-if="free">
      <span class="trail__scrub" aria-hidden="true">
        <b :style="{ top: `${100 - target / Math.max(1, last) * 100}%` }"></b>
        <i :style="{ top: `${100 - pos / Math.max(1, last) * 100}%` }"></i>
      </span>
      <button v-if="Math.abs(pos - target) > 0.4" type="button" class="trail__back" @click="glideTo(target)">
        {{ pos > target ? '↓' : '↑' }} вы здесь · {{ roman(target + 1) }}
      </button>
    </template>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue'
import { roman, plural } from './themes.js'
import { visible, walkSteps, trailWalk, footMatrix, tagScale, FOOT_LEN, FOOT_SPREAD, FOOT_W, TRAIL_ORIGIN } from '~/utils/trail.js'
import { useRouteCamera } from '~/composables/useRouteCamera.js'

const props = defineProps({
  tasks:        { type: Array,  required: true },             // участки маршрута: { id, title }
  completedIds: { type: Array,  default: () => [] },           // id пройденных участков
  earnedMap:    { type: Object, default: () => ({}) },
  enter:        { type: Boolean, default: false },             // старт квеста: пара входит в аллею
  stampId:      { type: [String, Number], default: null },     // участок, который только что отработан
  itemWord:     { type: String, default: 'Улика' },
  forms:        { type: Array,  default: () => ['улика', 'улики', 'улик'] },
  progress:     { type: Object, default: () => ({}) },         // id → { done, total }
  free:         { type: Boolean, default: false },             // доску открыли сами: аллею можно листать
})
defineEmits(['open'])

const uid = useId()

// аллея петляет: боковой сдвиг середины в мире, в пикселях ширины 390
const wander = (u) => Math.sin(u * 1.7 + 0.4) * 46
const {
  root, size, target, last, pos, stepsFrom, walked, arrived, states,
  glideTo, dragStart, dragMove, dragEnd, eatClick, onWheel,
  horizonY, at, fade, clues, clueFade, placeTag, aheadCount, allDone,
} = useRouteCamera(props, { wander, words: { now: 'вы здесь', done: 'отработано', ahead: 'впереди' } })

// детерминированный «шум»: аллея одна и та же при каждом открытии
const rnd = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v) }

// мир от нижнего края до горизонта
const range = computed(() => [Math.floor(pos.value - 1.2), Math.ceil(pos.value + 5.6)])

const lawns = computed(() => {
  const { w, h } = size.value
  const edge = (side) => {
    const pts = []
    for (let u = pos.value - 1.2; u <= pos.value + 5.6; u += 0.1) {
      const p = at(u, side * 150)
      if (p.t > -0.15) pts.push(`${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    }
    return pts
  }
  const l = edge(-1), r = edge(1)
  return {
    left:  `M${l.join(' L')} L0 ${horizonY.value} L0 ${h}Z`,
    right: `M${r.join(' L')} L${w} ${horizonY.value} L${w} ${h}Z`,
  }
})

const seams = computed(() => {
  const out = []
  const [a, b] = range.value
  for (let k = a * 4; k <= b * 4; k++) {
    const u = k / 4
    const p1 = at(u, -150), p2 = at(u, 150)
    if (!visible(p1.t)) continue
    out.push({ k, d: `M${p1.x} ${p1.y} L${p2.x} ${p1.y}`, sw: 1.6 * p1.s + .4 })
  }
  return out
})

const LEAF = ['#b0662a', '#c8913a', '#8f3f22']
const leaves = computed(() => {
  const out = []
  const [a, b] = range.value
  for (let k = a * 9; k <= b * 9; k++) {
    const p = at(k / 9 + rnd(k, 1) * .1, (rnd(k, 2) - .5) * 280)
    if (!visible(p.t)) continue
    out.push({ k, x: p.x, y: p.y, s: p.s, c: LEAF[(k % 3 + 3) % 3], r: Math.round(rnd(k, 3) * 180) })
  }
  return out
})

// Подошва и каблук в координатах стопы: x поперёк (−.5….5), y от пятки (0) к носку (−1)
const SOLE = 'M-.38 -.44 C-.52 -.72 -.4 -1 .02 -1 C.42 -1 .5 -.74 .4 -.5 C.34 -.4 .2 -.36 .02 -.38 C-.14 -.4 -.3 -.38 -.38 -.44Z'
const HEEL = 'M-.3 -.27 C-.1 -.31 .2 -.31 .34 -.26 L.32 -.05 C.18 .03 -.16 .03 -.3 -.05Z'

const PRINT_O = .72
const prints = computed(() => {
  const list = walkSteps(TRAIL_ORIGIN, target.value)
  const start = walkSteps(TRAIL_ORIGIN, stepsFrom.value).length
  const { w } = size.value
  return trailWalk(list, start, walked.value).map((st) => {
    const heel = at(st.u, st.foot * FOOT_SPREAD)
    // носок чуть наружу — походка, а не рельсы
    const toe = at(st.u + FOOT_LEN, st.foot * (FOOT_SPREAD + 2))
    if (!visible(heel.t) || !visible(toe.t)) return null
    const m = footMatrix(heel, toe, st.foot * FOOT_W * heel.s * w / 390)
    const o = PRINT_O * fade(heel.y)
    return { k: st.u.toFixed(3), tf: `matrix(${m.map(v => v.toFixed(2)).join(' ')})`, o: o.toFixed(2) }
  }).filter(Boolean)
})

// деревья через получасток по обе стороны, каждый третий — с фонарём
const props_ = computed(() => {
  const out = []
  const [a, b] = range.value
  for (let k = a * 2; k <= b * 2; k++) {
    for (const side of [-1, 1]) {
      const tr = at(k / 2, side * 190)
      // у самой камеры кроны закрыли бы сцену
      if (visible(tr.t) && tr.t > .02) out.push({ k: `t${k}${side}`, kind: 'tree', side, ...tr })
      if ((k % 3 + 3) % 3 === 1) {
        const lp = at(k / 2 + .25, side * 160)
        if (visible(lp.t) && lp.t > .05) out.push({ k: `l${k}${side}`, kind: 'lamp', side, ...lp })
      }
    }
  }
  return out.sort((x, y) => y.t - x.t)
})

const chalk = computed(() => {
  const i = target.value
  if (!arrived.value || states.value[i]?.state !== 'now') return null
  const p = at(i, 0)
  return visible(p.t) ? p : null
})

// ─── Улики: таблички у следа и бирки на шпагате ─────────────────
const PLATE = { now: '#f0c040', done: '#d9ab3a', ahead: '#c9a24a' }
const TAG_W = { now: 156, done: 132, ahead: 64 }
const marks = computed(() => clues.value
  .map((c) => {
    const p = at(c.index, c.side * 50)
    if (!visible(p.t) || p.y > size.value.h + 30) return null
    const o = clueFade(c, p.y - 8)
    if (o < 0.03) return null
    const k = tagScale(p.s, c.view === 'now') * 1.1
    const tag = placeTag(p.x, 34 * k, TAG_W[c.view], c.side)
    return {
      ...c, side: tag.side, x: p.x, y: p.y, k, o: +o.toFixed(2),
      tagX: tag.x, tagY: p.y - 4 * k,
      // шпагат от верха таблички к дырочке бирки (координаты таблички)
      twine: `M10 -28 Q${((tag.x - p.x) / k) * .6} -30 ${(tag.x - p.x) / k} -4`,
    }
  })
  .filter(Boolean))

const fogY = computed(() => at(pos.value + 2.6, 0).y)
const aheadText = computed(() => {
  if (aheadCount.value > 0) return `дальше в тумане ещё ${aheadCount.value} ${plural(aheadCount.value, ...props.forms)}`
  return allDone.value ? 'след привёл к развязке' : ''
})
</script>

<style scoped>
.trail {
  position: relative;
  overflow: hidden;
  border-radius: 3px;
  background: #6f6152;
  box-shadow: 0 8px 18px rgba(20, 12, 8, .45);
}
/* доску открыли сами: аллея тянется пальцем, страница под ней не едет */
.trail--free { touch-action: none; cursor: grab; -webkit-user-select: none; user-select: none; }
.trail--free:active { cursor: grabbing; }
.trail__scene { position: absolute; inset: 0; width: 100%; height: 100%; }
/* шаг ложится на плитку */
.trail__print { animation: print-in .18s ease-out both; }
@keyframes print-in { from { opacity: 0; } }
.trail__no { font-family: var(--font-d); font-size: 15px; fill: #1d1814; }
.trail__chalk { fill: none; stroke: rgba(245, 240, 230, .85); stroke-width: 2; stroke-dasharray: 5 4; }

.trail__ahead {
  position: absolute; left: 0; right: 0; margin: 0;
  text-align: center;
  font: italic .85rem/1.2 var(--font-b);
  color: #4a4036;
  pointer-events: none;
}

/* бирка: крафт с дырочкой, привязана шпагатом к табличке */
.trail__tag {
  position: absolute;
  width: 132px;
  translate: 0 -20%;
  padding: 7px 8px 7px 20px;
  border: 0;
  background: #e9dcc0;
  color: var(--ink);
  font: 700 .76rem/1.15 var(--font-b);
  text-align: left;
  box-shadow: 0 3px 5px rgba(0, 0, 0, .45);
  clip-path: polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%);
  rotate: 8deg;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
/* левая бирка — зеркально: острый конец и дырочка смотрят на табличку */
.trail__tag.is-left {
  translate: -100% -20%; rotate: -8deg;
  padding: 7px 20px 7px 8px;
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%);
}
.trail__tag.is-left .trail__tag-hole { left: auto; right: 8px; }
.trail__tag-hole {
  position: absolute; left: 8px; top: 50%;
  width: 6px; height: 6px; margin-top: -3px;
  border-radius: 50%;
  background: #5d5145;
}
.trail__tag em { font: 400 .72rem var(--font-d); font-style: normal; color: var(--chip); margin-right: 4px; }
.trail__tag small { display: block; font: italic 400 .68rem var(--font-b); color: var(--ink-soft); }
.trail__tag--now {
  width: 156px;
  background: #f6f1e6;
  font-size: .9rem;
  box-shadow: 0 0 0 2px var(--chip), 0 4px 8px rgba(0, 0, 0, .5);
  rotate: 4deg;
  cursor: default;
}
.trail__tag--now.is-left { rotate: -4deg; }
.trail__tag--now small { color: var(--chip); }
.trail__tag--wrong small { color: var(--chip); }
/* впереди: только номер, название закрыто — не подглядываем */
.trail__tag--ahead {
  width: auto;
  padding-right: 12px;
  background: #d6c8aa;
  font-weight: 400;
  color: #4a4036;
  cursor: default;
  pointer-events: none;
}
.trail__tag--ahead.is-left { padding: 7px 20px 7px 12px; }
.trail__tag--ahead small { display: inline; margin-left: 2px; }
.trail__tag:focus-visible { outline: 3px solid var(--focus, var(--ink)); outline-offset: 3px; }
/* только что отработанная улика: пометка проступает штампом */
.trail__tag.is-fresh small { animation: trail-stamp .5s cubic-bezier(.2, .7, .2, 1) .35s both; }
@keyframes trail-stamp { from { opacity: 0; transform: scale(1.6); } to { opacity: 1; transform: none; } }

/* шкала маршрута справа: точка — камера, красная риска — текущая улика */
.trail__scrub {
  position: absolute; right: 8px; top: 50%;
  width: 4px; height: 38%;
  translate: 0 -50%;
  border-radius: 2px;
  background: rgba(246, 241, 230, .25);
  pointer-events: none;
}
.trail__scrub i, .trail__scrub b { position: absolute; transition: top .08s linear; }
.trail__scrub i { left: -2px; width: 8px; height: 8px; margin-top: -4px; border-radius: 50%; background: #f6f1e6; }
.trail__scrub b { left: -1px; width: 6px; height: 2px; margin-top: -1px; background: var(--chip); }
.trail__back {
  position: absolute; left: 50%; bottom: 12px;
  translate: -50% 0;
  padding: 8px 14px;
  border: 0; border-radius: 999px;
  background: #f6f1e6;
  color: var(--ink);
  font: 700 .82rem var(--font-b);
  box-shadow: 0 3px 8px rgba(0, 0, 0, .45);
  cursor: pointer;
  white-space: nowrap;
}
.trail__back:focus-visible { outline: 3px solid var(--focus, var(--ink)); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  .trail__tag.is-fresh small { animation: none; }
  .trail__print { animation: none; }
}
</style>
