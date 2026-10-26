<template>
  <div
    ref="root"
    class="emb"
    :class="{ 'emb--free': free }"
    @pointerdown="dragStart"
    @pointermove="dragMove"
    @pointerup="dragEnd"
    @pointercancel="dragEnd"
    @wheel="onWheel"
    @click.capture="eatClick"
  >
    <svg class="emb__scene" :viewBox="`0 0 ${size.w} ${size.h}`" aria-hidden="true">
      <defs>
        <linearGradient :id="`${uid}-sky`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2e1420" /><stop offset=".7" stop-color="#8e4a55" /><stop offset="1" stop-color="#d9988e" />
        </linearGradient>
        <linearGradient :id="`${uid}-river`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#9a5a62" /><stop offset=".25" stop-color="#4a2638" /><stop offset="1" stop-color="#22131f" />
        </linearGradient>
        <linearGradient :id="`${uid}-haze`" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#d9a39a" stop-opacity=".95" />
          <stop offset=".6" stop-color="#c88a88" stop-opacity=".55" />
          <stop offset="1" stop-color="#c88a88" stop-opacity="0" />
        </linearGradient>
        <radialGradient :id="`${uid}-glow`">
          <stop offset="0" stop-color="#ffd9a0" stop-opacity=".9" /><stop offset=".4" stop-color="#f3b27a" stop-opacity=".35" /><stop offset="1" stop-color="#f3b27a" stop-opacity="0" />
        </radialGradient>
        <radialGradient :id="`${uid}-pool`">
          <stop offset="0" stop-color="#ffd59a" stop-opacity=".55" /><stop offset="1" stop-color="#ffd59a" stop-opacity="0" />
        </radialGradient>
        <radialGradient :id="`${uid}-dark`" cx="50%" cy="35%" r="85%">
          <stop offset=".55" stop-color="#000" stop-opacity="0" /><stop offset="1" stop-color="#1c0810" stop-opacity=".6" />
        </radialGradient>
      </defs>

      <rect :width="size.w" :height="horizonY + 2" :fill="`url(#${uid}-sky)`" />
      <!-- город на том берегу: крыши и тёплые окна -->
      <path :d="skyline.d" fill="#4a2232" />
      <rect v-for="win in skyline.lights" :key="win.k" :x="win.x" :y="win.y" width="1.6" height="2" fill="#f6c98c" opacity=".8" />
      <!-- река, мостовая -->
      <rect :y="horizonY" :width="size.w" :height="size.h - horizonY" :fill="`url(#${uid}-river)`" />
      <path :d="road" fill="#7d5a5b" />
      <path v-for="c in cobbles" :key="c.k" :d="c.d" :stroke="c.joint ? 'rgba(50,24,30,.22)' : 'rgba(50,24,30,.35)'" :stroke-width="c.sw" />
      <!-- дома слева: фасады участками, окна тёплые -->
      <template v-for="hs in houses" :key="hs.k">
        <path :d="hs.d" :fill="hs.fill" />
        <rect v-for="win in hs.windows" :key="win.k" :x="win.x" :y="win.y" :width="win.w" :height="win.h" fill="#f2c085" :opacity="win.o" />
      </template>
      <!-- парапет: чугунная решётка над рекой -->
      <path :d="parapet.rail" stroke="#1d0d14" stroke-width="2" fill="none" />
      <path v-for="b in parapet.bars" :key="b.k" :d="b.d" stroke="#1d0d14" :stroke-width="b.sw" />
      <!-- дорожка лепестков: пройденная лежит, новая осыпается к следующему фонарю -->
      <g v-for="pe in petals" :key="pe.k" class="emb__petal" :opacity="pe.o">
        <g :transform="pe.tf">
          <path d="M0 -9 C8 -9 10 2 0 9 C-10 2 -8 -9 0 -9Z" :fill="PETAL[pe.tone]" />
          <path d="M0 -6 V5" stroke="rgba(120,40,50,.35)" stroke-width="1" />
        </g>
      </g>
      <!-- фонари глав: на столбе лентой с бантом привязан конверт -->
      <g v-for="l in lamps" :key="l.id" :opacity="l.o">
        <ellipse v-if="l.view === 'now'" :cx="l.poolX" :cy="l.y" :rx="190 * l.s" :ry="50 * l.s" :fill="`url(#${uid}-pool)`" />
        <circle v-if="l.lit" :cx="l.x" :cy="l.top" :r="90 * l.s" :fill="`url(#${uid}-glow)`" />
        <path :d="l.post" stroke="#1d0d14" :stroke-width="7 * l.s" fill="none" stroke-linecap="round" />
        <path :d="l.lantern" :fill="l.lit ? '#ffd58e' : '#4a3540'" stroke="#1d0d14" :stroke-width="3 * l.s" />
        <path :d="l.cap" fill="#1d0d14" />
        <path :d="l.ribbon" class="emb__ribbon" :stroke-width="4 * l.s" fill="none" />
        <path :d="l.bow" class="emb__ribbon emb__ribbon--bow" :stroke-width="3 * l.s" />
        <g :transform="`translate(${l.ex} ${l.ey}) rotate(${l.side * 4})`">
          <rect :x="-l.ew / 2" :y="-l.eh / 2" :width="l.ew" :height="l.eh" :class="l.view === 'ahead' ? 'emb__env--back' : 'emb__env'" :stroke-width="l.s" />
          <template v-if="l.view === 'ahead'">
            <path :d="`M${-l.ew / 2} ${-l.eh / 2} L0 ${l.eh * .12} L${l.ew / 2} ${-l.eh / 2}`" class="emb__flap" :stroke-width="l.s" />
            <circle cx="0" :cy="l.eh * .1" :r="7 * l.s" class="emb__wax" :stroke-width="1.2 * l.s" />
          </template>
          <template v-else>
            <path :d="`M${-l.ew / 2} ${-l.eh / 2} L0 ${l.eh * .14} L${l.ew / 2} ${-l.eh / 2}`" fill="none" stroke="rgba(60,25,30,.45)" :stroke-width="l.s" />
            <!-- пройденное гасит почтовый штемпель -->
            <g v-if="l.view === 'done'" class="emb__postmark" :stroke-width="1.3 * l.s">
              <circle :cx="l.ew * .2" :cy="l.eh * .05" :r="11 * l.s" fill="none" />
              <path :d="`M${l.ew * .2 - 14 * l.s} ${l.eh * .05 - 3 * l.s} h${28 * l.s} M${l.ew * .2 - 14 * l.s} ${l.eh * .05 + 3 * l.s} h${28 * l.s}`" />
            </g>
          </template>
        </g>
        <!-- точка нырка в карточку: конверт текущей главы -->
        <circle v-if="l.view === 'now'" class="trail__chalk emb__dive" :cx="l.ex" :cy="l.ey" r="1" />
      </g>
      <rect :y="horizonY - 8" :width="size.w" :height="Math.max(0, hazeY - horizonY + 8)" :fill="`url(#${uid}-haze)`" opacity=".85" />
      <rect :width="size.w" :height="size.h" :fill="`url(#${uid}-dark)`" />
    </svg>

    <p class="emb__ahead" :style="{ top: `${horizonY + 10}px` }">{{ aheadText }}</p>

    <!-- бирки-адреса на ленте: прочитанную можно открыть; впереди — только номер на марке -->
    <template v-for="l in lamps" :key="`tag-${l.id}`">
      <component
        :is="l.view === 'done' ? 'button' : 'span'"
        :type="l.view === 'done' ? 'button' : undefined"
        class="emb__tag"
        :class="[`emb__tag--${l.view === 'done' ? l.state : l.view}`, l.tagSide > 0 ? 'is-right' : 'is-left', { 'is-fresh': l.id === stampId }]"
        :style="{ left: `${l.tagX}px`, top: `${l.tagY}px`, opacity: l.o, scale: l.view === 'now' ? undefined : l.k }"
        :aria-hidden="l.view === 'ahead' ? 'true' : undefined"
        :aria-label="l.view === 'done' ? `${itemWord} ${l.index + 1}: ${l.title}. ${l.note}. Открыть` : undefined"
        @click="l.view === 'done' && $emit('open', l.index)"
      >
        <span class="emb__stamp" aria-hidden="true">{{ roman(l.index + 1) }}</span>
        <template v-if="l.view !== 'ahead'">{{ l.title }}</template>
        <small>{{ l.note }}</small>
      </component>
    </template>

    <!-- листание: где камера на маршруте и где текущая глава -->
    <template v-if="free">
      <span class="emb__scrub" aria-hidden="true">
        <b :style="{ top: `${100 - target / Math.max(1, last) * 100}%` }"></b>
        <i :style="{ top: `${100 - pos / Math.max(1, last) * 100}%` }"></i>
      </span>
      <button v-if="Math.abs(pos - target) > 0.4" type="button" class="emb__back" @click="glideTo(target)">
        {{ pos > target ? '↓' : '↑' }} ты здесь · {{ roman(target + 1) }}
      </button>
    </template>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue'
import { roman, plural } from './themes.js'
import { visible, petalTrail, tagScale } from '~/utils/trail.js'
import { useRouteCamera } from '~/composables/useRouteCamera.js'

// Маршрут «Романтика» (flow = route, decor letters): вечерняя набережная. Слева старые дома
// с тёплыми окнами, справа чугунный парапет и река, за ней город в сумерках. Глава — фонарь,
// к столбу лентой привязан конверт; вместо следов — дорожка лепестков.
const props = defineProps({
  tasks:        { type: Array,  required: true },
  completedIds: { type: Array,  default: () => [] },
  earnedMap:    { type: Object, default: () => ({}) },
  enter:        { type: Boolean, default: false },
  stampId:      { type: [String, Number], default: null },
  itemWord:     { type: String, default: 'Глава' },
  forms:        { type: Array,  default: () => ['глава', 'главы', 'глав'] },
  progress:     { type: Object, default: () => ({}) },
  free:         { type: Boolean, default: false },
})
defineEmits(['open'])

const uid = useId()
const HORIZON_EMB = 0.16 // над рекой больше неба: виден город на том берегу
// набережная плавно изгибается вдоль реки
const wander = (u) => Math.sin(u * 1.3 + 0.6) * 40
const {
  root, size, target, last, pos, stepsFrom, walked,
  glideTo, dragStart, dragMove, dragEnd, eatClick, onWheel,
  horizonY, at, fade, clues, clueFade, placeTag, aheadCount, allDone,
} = useRouteCamera(props, { wander, horizon: HORIZON_EMB, words: { now: 'ты здесь', done: 'прочитано', ahead: 'запечатано' } })

const rnd = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v) }
const range = computed(() => [Math.floor(pos.value - 1.2), Math.ceil(pos.value + 5.6)])
const pts = (pl) => pl.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')
const edge = (off) => {
  const out = []
  for (let u = pos.value - 1.2; u <= pos.value + 5.6; u += 0.1) {
    const p = at(u, off)
    if (p.t > -0.15) out.push(p)
  }
  return out
}

// ─── Город на том берегу ──────────────────────────────────────────
const skyline = computed(() => {
  const { w } = size.value
  const hz = horizonY.value
  let d = `M0 ${hz}`
  for (let x = 0; x <= w; x += 14) {
    const hh = 6 + rnd(x, 9) * 16 + (rnd(x, 3) > 0.85 ? 14 : 0)
    d += ` L${x} ${(hz - hh).toFixed(1)} L${x + 14} ${(hz - hh).toFixed(1)}`
  }
  const lights = []
  for (let x = 4; x < w; x += 9) if (rnd(x, 11) > 0.72) lights.push({ k: x, x, y: +(hz - 4 - rnd(x, 12) * 12).toFixed(1) })
  return { d: `${d} L${w} ${hz}Z`, lights }
})

// ─── Мостовая, брусчатка, дома, парапет ─────────────────────────
const road = computed(() => {
  const l = edge(-150), r = edge(150)
  return `M${pts(l)} L${pts(r.reverse())}Z`
})
const cobbles = computed(() => {
  const out = []
  const [a, b] = range.value
  for (let k = a * 6; k <= b * 6; k++) {
    const u = k / 6, p1 = at(u, -150), p2 = at(u, 150)
    if (!visible(p1.t)) continue
    out.push({ k: `r${k}`, d: `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`, sw: 1.2 * p1.s + 0.3 })
    // швы вразбежку — только вблизи, вдали сливаются
    if (p1.s > 0.25) {
      for (let j = -150 + (((k % 2) + 2) % 2) * 25; j < 150; j += 50) {
        const q1 = at(u, j), q2 = at(u + 1 / 6, j)
        out.push({ k: `j${k}_${j}`, joint: true, d: `M${q1.x.toFixed(1)} ${q1.y.toFixed(1)} L${q2.x.toFixed(1)} ${q2.y.toFixed(1)}`, sw: 0.8 * q1.s })
      }
    }
  }
  return out
})
const HOUSE = ['#5a2a33', '#63303a', '#4f242d']
const houses = computed(() => {
  const out = []
  const [a, b] = range.value
  for (let k = a * 2; k <= b * 2; k++) {
    const f0 = at(k / 2, -170), f1 = at(k / 2 + 0.5, -170)
    if (!visible(f0.t) && !visible(f1.t)) continue
    const tall = 0.9 + rnd(k, 2) * 0.25
    const h0 = 520 * f0.s * tall, h1 = 520 * f1.s * tall
    const windows = []
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
      if (rnd(k * 7 + r, c) < 0.45) continue
      const fx = 0.25 + c * 0.45, fy = 0.3 + r * 0.22
      const ws = f0.s + (f1.s - f0.s) * fx
      const x = f0.x + (f1.x - f0.x) * fx
      const y = f0.y + (f1.y - f0.y) * fx - (h0 + (h1 - h0) * fx) * fy
      windows.push({ k: `${r}${c}`, x: +(x - 6 * ws).toFixed(1), y: +y.toFixed(1), w: +(12 * ws).toFixed(1), h: +(18 * ws).toFixed(1), o: +(0.55 + rnd(k, r) * 0.4).toFixed(2) })
    }
    out.push({
      k, t: f0.t, fill: HOUSE[((k % 3) + 3) % 3], windows,
      d: `M${f0.x.toFixed(1)} ${f0.y.toFixed(1)} L${f1.x.toFixed(1)} ${f1.y.toFixed(1)} L${f1.x.toFixed(1)} ${(f1.y - h1).toFixed(1)} L${f0.x.toFixed(1)} ${(f0.y - h0).toFixed(1)}Z`,
    })
  }
  return out.sort((x, y) => y.t - x.t)
})
const parapet = computed(() => {
  const rail = edge(150).map(p => ({ x: p.x, y: p.y - 60 * p.s }))
  const bars = []
  const [a, b] = range.value
  for (let k = a * 8; k <= b * 8; k++) {
    const p = at(k / 8, 150)
    if (visible(p.t)) bars.push({ k, d: `M${p.x.toFixed(1)} ${p.y.toFixed(1)} V${(p.y - 60 * p.s).toFixed(1)}`, sw: 2.2 * p.s + 0.4 })
  }
  return { rail: `M${pts(rail)}`, bars }
})

// ─── Лепестки ────────────────────────────────────────────────────
const PETAL = ['#d98f8f', '#e7aaa5', '#c8707a', '#f0c4bd']
const petals = computed(() => {
  const list = petalTrail(target.value)
  const start = petalTrail(stepsFrom.value).length
  const shown = list.slice(0, Math.min(list.length, start + Math.floor(walked.value * (list.length - start) + 1e-6)))
  return shown.map((pe) => {
    const p = at(pe.u, pe.off)
    if (!visible(p.t)) return null
    const s = p.s * pe.size
    return {
      k: pe.k, tone: pe.tone, o: (0.95 * fade(p.y)).toFixed(2),
      tf: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${(s * 1.1).toFixed(2)} ${(s * 0.55).toFixed(2)}) rotate(${pe.rot})`,
    }
  }).filter(Boolean)
})

// ─── Фонари глав и бирки ─────────────────────────────────────────
const TAG_W = { now: 162, done: 138, ahead: 64 }
const lamps = computed(() => clues.value
  .map((c) => {
    const p = at(c.index, c.side * 128)
    if (!visible(p.t) || p.y > size.value.h + 60) return null
    const o = clueFade(c, p.y - 10)
    if (o < 0.03) return null
    const s = p.s, x = p.x, side = c.side
    const top = p.y - 300 * s
    // фонарь горит у прочитанных и текущей; к следующей зажигается, когда камера дошла
    const lit = c.view !== 'ahead'
    const ex = x - side * 34 * s, ey = p.y - 110 * s
    const k = c.view === 'now' ? 1 : Math.min(1, Math.max(0.72, s * 2.4))
    const tag = placeTag(ex, 24 * k, TAG_W[c.view], -side)
    const ky = ey - 26 * s
    return {
      ...c, x, y: p.y, s, t: p.t, top, lit, o: +o.toFixed(2), k: +k.toFixed(2),
      poolX: x - side * 70 * s,
      post: `M${x} ${p.y} V${top + 20 * s} M${x} ${top + 30 * s} q${-side * 22 * s} ${-6 * s} ${-side * 30 * s} ${10 * s}`,
      lantern: `M${x - 14 * s} ${top - 4 * s} L${x + 14 * s} ${top - 4 * s} L${x + 10 * s} ${top + 22 * s} L${x - 10 * s} ${top + 22 * s}Z`,
      cap: `M${x - 18 * s} ${top - 4 * s} L${x} ${top - 20 * s} L${x + 18 * s} ${top - 4 * s}Z`,
      ribbon: `M${x} ${ky} q${-side * 10 * s} ${4 * s} ${-side * 20 * s} ${10 * s}`,
      bow: `M${x} ${ky} l${-7 * s} ${-6 * s} l0 ${10 * s} Z M${x} ${ky} l${7 * s} ${-6 * s} l0 ${10 * s} Z M${x} ${ky} l${-4 * s} ${10 * s} M${x} ${ky} l${4 * s} ${11 * s}`,
      ex, ey, ew: 58 * s, eh: 38 * s,
      tagSide: tag.side, tagX: tag.x, tagY: ey + 4 * k,
    }
  })
  .filter(Boolean)
  .sort((a, b) => b.t - a.t))

const hazeY = computed(() => at(pos.value + 3.3, 0).y)
const aheadText = computed(() => {
  if (aheadCount.value > 0) return `дальше в сумерках ещё ${aheadCount.value} ${plural(aheadCount.value, ...props.forms)}`
  return allDone.value ? 'все письма прочитаны' : ''
})
</script>

<style scoped>
.emb {
  position: relative;
  overflow: hidden;
  border-radius: 3px;
  background: #3a1c26;
  box-shadow: 0 10px 22px rgba(30, 8, 12, .5);
}
/* доску открыли сами: набережная тянется пальцем, страница под ней не едет */
.emb--free { touch-action: none; cursor: grab; -webkit-user-select: none; user-select: none; }
.emb--free:active { cursor: grabbing; }
.emb__scene { position: absolute; inset: 0; width: 100%; height: 100%; }
/* лепесток падает на брусчатку */
.emb__petal > g { animation: petal-fall .5s cubic-bezier(.2, .7, .3, 1) both; transform-box: fill-box; transform-origin: center; }
@keyframes petal-fall { from { opacity: 0; translate: 0 -14px; } }
.emb__ribbon { stroke: var(--chip); }
.emb__ribbon--bow { fill: var(--chip); }
.emb__env { fill: var(--paper-edge); stroke: rgba(40, 10, 20, .4); }
.emb__env--back { fill: var(--back); stroke: rgba(40, 10, 20, .4); }
.emb__flap { fill: color-mix(in srgb, var(--back) 85%, #000); stroke: rgba(40, 10, 20, .35); }
.emb__wax { fill: var(--seal-wax, #8f2630); stroke: var(--seal-deep, #661820); }
.emb__postmark { fill: none; stroke: color-mix(in srgb, var(--ink) 55%, transparent); }
.emb__dive { fill: none; stroke: none; }

.emb__ahead {
  position: absolute; left: 0; right: 0; margin: 0;
  text-align: center;
  font: 400 1rem/1.2 var(--font-h);
  color: #f3dcd2;
  text-shadow: 0 1px 6px rgba(60, 20, 30, .6);
  pointer-events: none;
}

/* бирка-адрес: хлопковая карточка на ленте, почерк, номер — на марке */
.emb__tag {
  position: absolute;
  width: 138px;
  translate: 0 -30%;
  padding: 8px 10px 8px 34px;
  border: 0;
  background: var(--paper);
  color: var(--ink);
  font: 400 .86rem/1.15 var(--font-h);
  text-align: left;
  box-shadow: 0 3px 7px rgba(30, 8, 12, .45);
  rotate: 5deg;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.emb__tag.is-left { translate: -100% -30%; rotate: -5deg; padding: 8px 34px 8px 10px; }
.emb__stamp {
  position: absolute; left: 6px; top: 50%;
  translate: 0 -50%;
  width: 22px; height: 26px;
  display: grid; place-items: center;
  background: var(--chip);
  color: var(--ink);
  font: 700 .74rem var(--font-d);
  font-feature-settings: "lnum";
  /* зубцы марки */
  outline: 2px dotted var(--paper);
  outline-offset: -1px;
}
.emb__tag.is-left .emb__stamp { left: auto; right: 6px; }
.emb__tag small { display: block; margin-top: 2px; font: italic 400 .68rem var(--font-b); color: var(--ink-soft); }
.emb__tag--now {
  width: 162px;
  font-size: 1rem;
  box-shadow: 0 0 0 2px var(--seal-wax, #8f2630), 0 5px 10px rgba(30, 8, 12, .55);
  rotate: 3deg;
  cursor: default;
}
.emb__tag--now.is-left { rotate: -3deg; }
.emb__tag--now small, .emb__tag--wrong small { color: var(--seal-wax, #8f2630); }
/* впереди: конверт запечатан — только номер, без названия */
.emb__tag--ahead {
  width: auto;
  padding: 6px 10px 6px 32px;
  background: color-mix(in srgb, var(--paper-edge) 60%, var(--paper));
  color: var(--ink-soft);
  font: italic 400 .72rem var(--font-b);
  cursor: default;
  pointer-events: none;
}
.emb__tag--ahead.is-left { padding: 6px 32px 6px 10px; }
.emb__tag--ahead small { display: inline; margin: 0; font-size: inherit; }
.emb__tag:focus-visible { outline: 3px solid var(--focus, var(--ink)); outline-offset: 3px; }
/* только что прочитанная глава: пометка проступает штемпелем */
.emb__tag.is-fresh small { animation: emb-stamp .5s cubic-bezier(.2, .7, .2, 1) .35s both; }
@keyframes emb-stamp { from { opacity: 0; transform: scale(1.6); } to { opacity: 1; transform: none; } }

/* шкала маршрута справа: точка — камера, риска — текущая глава */
.emb__scrub {
  position: absolute; right: 8px; top: 50%;
  width: 4px; height: 38%;
  translate: 0 -50%;
  border-radius: 2px;
  background: rgba(248, 241, 228, .22);
  pointer-events: none;
}
.emb__scrub i, .emb__scrub b { position: absolute; transition: top .08s linear; }
.emb__scrub i { left: -2px; width: 8px; height: 8px; margin-top: -4px; border-radius: 50%; background: var(--paper); }
.emb__scrub b { left: -1px; width: 6px; height: 2px; margin-top: -1px; background: var(--chip); }
.emb__back {
  position: absolute; left: 50%; bottom: 12px;
  translate: -50% 0;
  padding: 8px 14px;
  border: 0; border-radius: 999px;
  background: var(--paper);
  color: var(--ink);
  font: 700 .82rem var(--font-b);
  box-shadow: 0 3px 8px rgba(30, 8, 12, .5);
  cursor: pointer;
  white-space: nowrap;
}
.emb__back:focus-visible { outline: 3px solid var(--focus, var(--ink)); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  .emb__petal > g, .emb__tag.is-fresh small { animation: none; }
}
</style>
