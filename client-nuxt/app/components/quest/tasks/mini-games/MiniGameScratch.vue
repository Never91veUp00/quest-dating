<template>
  <div class="sc">
    <p v-if="task.game_question" class="mg-prompt">{{ task.game_question }}</p>

    <div class="mg-board">
      <QuestMark v-if="revealed" :decor="decor" kind="right" />
      <div ref="card" class="sc__card" :class="{ 'sc__card--open': revealed }">
        <!-- под слоем: фото и/или послание -->
        <img v-if="task.scratch_image" :src="task.scratch_image" alt="" class="sc__img" @load="paint" />
        <p v-if="task.scratch_text" class="sc__text" :class="{ 'sc__text--solo': !task.scratch_image }">{{ task.scratch_text }}</p>

        <canvas
          v-if="!gone"
          ref="cover"
          class="sc__cover"
          :class="{ 'sc__cover--fade': revealed }"
          aria-hidden="true"
          @pointerdown="down"
          @pointermove="move"
          @pointerup="up"
          @pointercancel="up"
        ></canvas>
      </div>
    </div>

    <template v-if="!revealed">
      <p class="sc__how">Сотри слой пальцем</p>
      <button class="mg-skip" @click="reveal">Открыть без стирания</button>
    </template>
    <template v-else>
      <p class="mg-result" role="status">Открыто</p>
      <button class="task__action" @click="$emit('complete', task)">Идти дальше</button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import QuestMark from '../../QuestMark.vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete', 'skip-task'])

const decor = computed(() => props.theme.world?.decor ?? null)

const card  = ref(null)
const cover = ref(null)
const revealed = ref(false)
const gone     = ref(false)   // слой убран из DOM после растворения
const OPEN_AT  = 0.6          // доля стёртого, после которой слой растворяется сам
const BRUSH    = 22           // радиус пальца, css px

// Слой — материал мира: цвет, узор и цвет надписи берутся из переменных темы
const LAYERS = {
  casefile: { bg: '--paper-edge', ink: '--ink',   pattern: 'hatch',   label: 'Секретно' },
  letters:  { bg: '--back',       ink: '--paper',   pattern: 'flap',    label: 'Сотри' },
  metro:    { bg: '--paper',      ink: '--ink',   pattern: 'stripe',  label: 'Сотри' },
  tarot:    { bg: '--back',       ink: '--paper', pattern: 'lattice', label: 'Сотри' },
  map:      { bg: '--paper-edge', ink: '--ink',   pattern: 'hatch',   label: 'Сотри' },
  ringbox:  { bg: '--back',       ink: '--paper', pattern: 'seam',    label: 'Сотри' },
  potion:   { bg: '--back',       ink: '--paper', pattern: 'lattice', label: 'Сотри' },
  diecut:   { bg: '--back',       ink: '--paper', pattern: 'none',    label: 'Сотри' },
}
const layer = computed(() => LAYERS[decor.value] ?? { bg: '--back', ink: '--ink', pattern: 'none', label: 'Сотри' })

// переменная темы может быть color-mix — пусть браузер сам приведёт её к цвету
const resolve = (el, v) => {
  const probe = document.createElement('i')
  probe.style.color = `var(${v})`
  el.appendChild(probe)
  const c = getComputedStyle(probe).color
  probe.remove()
  return c
}

let ctx = null
let dpr = 1
const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const paint = () => {
  const c = cover.value, box = card.value
  if (!c || !box || revealed.value) return
  const w = box.clientWidth, h = box.clientHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  c.width = Math.round(w * dpr); c.height = Math.round(h * dpr)
  ctx = c.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const bg  = resolve(c.parentElement, layer.value.bg)
  const ink = resolve(c.parentElement, layer.value.ink)
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  ctx.strokeStyle = ink
  ctx.globalAlpha = .16
  ctx.lineWidth = 1
  const p = layer.value.pattern
  if (p === 'hatch' || p === 'lattice') {
    for (let x = -h; x < w; x += 9) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x + h, 0); ctx.stroke() }
  }
  if (p === 'lattice') {
    for (let x = 0; x < w + h; x += 9) { ctx.beginPath(); ctx.moveTo(x, h); ctx.lineTo(x - h, 0); ctx.stroke() }
  }
  ctx.globalAlpha = 1
  if (p === 'stripe') { ctx.fillStyle = resolve(c.parentElement, '--chip'); ctx.fillRect(0, 0, w, 12) }
  if (p === 'flap' || p === 'seam') {
    ctx.globalAlpha = .3; ctx.lineWidth = 1.5
    ctx.beginPath()
    if (p === 'flap') { ctx.moveTo(0, 0); ctx.lineTo(w / 2, h * .48); ctx.lineTo(w, 0) }
    else { ctx.moveTo(0, h * .34); ctx.lineTo(w, h * .34) }
    ctx.stroke(); ctx.globalAlpha = 1
  }

  const font = getComputedStyle(c).getPropertyValue('--font-d') || 'serif'
  ctx.fillStyle = ink
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.font = `${Math.round(Math.min(34, w / 8))}px ${font}`
  ctx.fillText(layer.value.label, w / 2, h / 2)
  ctx.globalCompositeOperation = 'destination-out'
}

let drawing = false
let last = null
let strokes = 0

const at = (e) => {
  const r = cover.value.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}
const scratch = (from, to) => {
  if (!ctx) return
  ctx.lineWidth = BRUSH * 2
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke()
}
const down = (e) => {
  if (revealed.value) return
  drawing = true
  cover.value.setPointerCapture?.(e.pointerId)
  last = at(e)
  scratch(last, { x: last.x + .1, y: last.y })
}
const move = (e) => {
  if (!drawing) return
  const p = at(e)
  scratch(last, p)
  last = p
  if (++strokes % 6 === 0) measure()
}
const up = () => { if (drawing) { drawing = false; measure() } }

// доля стёртого — по редкой сетке точек, чтобы не читать весь холст на каждом движении
const measure = () => {
  const c = cover.value
  if (!ctx || !c || revealed.value) return
  const { data } = ctx.getImageData(0, 0, c.width, c.height)
  const step = Math.max(4, Math.round(8 * dpr))
  let clear = 0, total = 0
  for (let y = 0; y < c.height; y += step) {
    for (let x = 0; x < c.width; x += step) {
      total++
      if (data[(y * c.width + x) * 4 + 3] < 40) clear++
    }
  }
  if (clear / total >= OPEN_AT) reveal()
}

let fadeTimer = null
const reveal = () => {
  if (revealed.value) return
  revealed.value = true
  drawing = false
  fadeTimer = setTimeout(() => { gone.value = true }, reduced ? 0 : 520)
}

let ro = null
onMounted(async () => {
  await nextTick()
  paint()
  // ширина карточки меняется с поворотом экрана — перерисовать нетронутый слой
  ro = new ResizeObserver(() => { if (!strokes) paint() })
  if (card.value) ro.observe(card.value)
})
onUnmounted(() => { ro?.disconnect(); clearTimeout(fadeTimer) })
</script>

<style scoped>
.sc { display: flex; flex-direction: column; gap: 12px; }

.sc__card {
  position: relative;
  overflow: hidden;
  min-height: 220px;
  background: var(--paper);
  border: 2px solid color-mix(in srgb, var(--ink) 22%, var(--paper));
  border-radius: var(--mi-radius, 8px);
  box-shadow: 0 14px 22px -16px color-mix(in srgb, var(--rule) 80%, transparent);
}
.sc__img { display: block; width: 100%; max-height: 62dvh; object-fit: cover; }
.sc__text {
  margin: 0;
  padding: 16px 18px 18px;
  color: var(--ink);
  font-family: var(--font-d);
  font-weight: var(--font-d-wt, 400);
  font-size: 1.15rem;
  line-height: 1.4;
  text-align: center;
  text-wrap: balance;
  overflow-wrap: anywhere;
}
.sc__text--solo { display: grid; place-items: center; min-height: 220px; padding: 28px 22px; font-size: 1.4rem; }

.sc__cover {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  touch-action: none;
  cursor: crosshair;
}
.sc__cover--fade { pointer-events: none; animation: sc-fade .5s cubic-bezier(.2, .7, .2, 1) both; }
@keyframes sc-fade { to { opacity: 0; filter: blur(2px); } }

.sc__how { margin: 0; text-align: center; font-size: .9rem; color: var(--ink-soft); }

/* рамка открытой карточки — край предмета мира */
.mgw--metro   .sc__card { box-shadow: inset 0 8px 0 var(--chip), 0 14px 22px -16px color-mix(in srgb, var(--rule) 60%, transparent); }
.mgw--tarot   .sc__card { box-shadow: inset 0 0 0 4px var(--paper), inset 0 0 0 5.5px var(--chip), 0 14px 22px -16px color-mix(in srgb, var(--rule) 90%, transparent); }
.mgw--letters .sc__card { outline: 1.5px dashed color-mix(in srgb, var(--chip) 70%, var(--paper)); outline-offset: -6px; }
.mgw--ringbox .sc__card { border-radius: 16px; outline: 1.5px dashed color-mix(in srgb, var(--ink) 28%, var(--paper)); outline-offset: -7px; }
.mgw--diecut  .sc__card { border-color: var(--rule); }

@media (prefers-reduced-motion: reduce) {
  .sc__cover--fade { animation: none; opacity: 0; }
}
</style>
