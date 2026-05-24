<template>
  <div class="qpv2" :style="cssVars" @click="onBgTap">

    <!-- ── ANIMATED BACKGROUND ── -->
    <div class="qpv2__bg" aria-hidden="true">
      <div class="qpv2__orb qpv2__orb--1" />
      <div class="qpv2__orb qpv2__orb--2" />
      <div class="qpv2__orb qpv2__orb--3" />
      <div class="qpv2__grain" />
    </div>

    <!-- ── FLOATING PARTICLES ── -->
    <div class="qpv2__floats" aria-hidden="true">
      <span v-for="p in floatParticles" :key="p.id" class="qpv2__float" :style="p.style">{{ p.emoji }}</span>
    </div>

    <!-- ── TOUCH RIPPLES ── -->
    <span v-for="r in ripples" :key="r.id" class="qpv2__ripple"
      :style="{ '--rx': r.x + 'px', '--ry': r.y + 'px' }" />

    <!-- ── STORY BAR ── -->
    <div class="qpv2__stories">
      <div v-for="(b, bi) in allBlocks" :key="bi" class="qpv2__seg"
        :class="{ 'qpv2__seg--done': bi < index }">
        <div class="qpv2__seg-fill" :style="{ width: segWidth(bi) + '%' }" />
      </div>
    </div>

    <!-- ── TOP BAR ── -->
    <header class="qpv2__topbar">
      <div class="qpv2__loc">
        <span>📍</span>
        <span class="qpv2__loc-txt">{{ block.location || block.title }}</span>
      </div>
      <div class="qpv2__topbar-right">
        <span class="qpv2__timer">{{ elapsedStr }}</span>
        <button class="qpv2__menu-btn" @click.stop="$emit('menu')">⋮</button>
      </div>
    </header>

    <!-- ── HERO ── -->
    <div class="qpv2__hero">
      <p class="qpv2__hero-eyebrow">Локация {{ index + 1 }} / {{ total }}</p>
      <h2 class="qpv2__hero-title">{{ block.title }}</h2>
      <p class="qpv2__hero-desc" v-if="block.description">{{ block.description }}</p>
    </div>

    <!-- ── POINTS BADGE ── -->
    <div class="qpv2__pts-badge">
      <span class="qpv2__pts-n">{{ points }}</span>
      <span class="qpv2__pts-l">pts</span>
    </div>

    <!-- ── TASK SHEET ── -->
    <div
      ref="sheetRef"
      class="qpv2__sheet"
      :class="{ 'qpv2__sheet--done': blockComplete }"
      :style="sheetOffset !== 0 ? { transform: `translateY(${sheetOffset}px)` } : {}"
      @click.stop
    >
      <div class="qpv2__handle" @touchstart.stop.prevent="stDragStart" @touchmove.stop.prevent="stDragMove" @touchend.stop="stDragEnd" />

      <!-- Trail dots -->
      <div class="qpv2__trail" v-if="block.tasks && block.tasks.length > 1">
        <span v-for="(t, ti) in block.tasks" :key="t.id" class="qpv2__trail-dot"
          :class="{ done: completedIds.includes(t.id), active: ti === activeTaskIdx }" />
      </div>

      <!-- Task / Done transition -->
      <transition name="qtask" mode="out-in">

        <!-- Active task -->
        <div v-if="currentTask" :key="currentTask.id" class="qpv2__task-wrap">
          <div class="qpv2__task-hd">
            <div class="qpv2__ico-wrap">
              <span class="qpv2__ico">{{ taskIcon(currentTask.type) }}</span>
              <svg class="qpv2__ico-ring" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="21" stroke-width="1.5" />
              </svg>
            </div>
            <div class="qpv2__task-meta">
              <span class="qpv2__type-pill">{{ taskTypeName(currentTask.type) }}</span>
              <span class="qpv2__task-pts" v-if="currentTask.points">+{{ currentTask.points }}</span>
            </div>
          </div>
          <div class="qpv2__task-body">
            <QuestTask
              :task="currentTask"
              :theme="theme"
              :index="activeTaskIdx"
              :isDone="false"
              :isActive="true"
              :isLocked="false"
              @complete="onComplete"
              @hint="$emit('use-hint')"
              @skip-task="$emit('skip-task', $event)"
            />
          </div>
        </div>

        <!-- Block complete -->
        <div v-else key="v2-done" class="qpv2__done">
          <div class="qpv2__done-icon">{{ doneEmoji }}</div>
          <div class="qpv2__done-title">Локация пройдена!</div>
          <div class="qpv2__done-sub">Все задания выполнены</div>
          <button v-if="!isLast" class="qpv2__cta" @click="$emit('next')">
            Следующая локация →
          </button>
          <button v-else class="qpv2__cta qpv2__cta--finish" @click="$emit('finish')">
            🏁 Завершить квест
          </button>
        </div>

      </transition>
    </div>

    <!-- ── PREV BLOCK BUTTON ── -->
    <button v-if="index > 0" class="qpv2__prev" @click.stop="$emit('prev')">‹</button>

    <!-- ── CELEBRATION BURST ── -->
    <transition name="qburst">
      <div v-if="burstOn" class="qpv2__burst" :key="burstKey">
        <span v-for="b in burstItems" :key="b.id" class="qpv2__burst-p" :style="b.s">{{ b.e }}</span>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import QuestTask from './QuestTask.vue'

const props = defineProps({
  block:       { type: Object,  required: true },
  theme:       { type: Object,  required: true },
  index:       { type: Number,  required: true },
  total:       { type: Number,  required: true },
  allBlocks:   { type: Array,   default: () => [] },
  completedIds:{ type: Array,   required: true },
  isLast:      { type: Boolean, default: false },
  points:      { type: Number,  default: 0 },
  elapsedStr:  { type: String,  default: '0:00' },
})

const emit = defineEmits(['prev', 'next', 'finish', 'complete-task', 'use-hint', 'skip-task', 'menu'])

// ── CSS vars ───────────────────────────────────────────────────────────────
const cssVars = computed(() => ({
  '--v2a': props.theme?.accent || '#d4af37',
  '--v2b': props.theme?.bg     || '#0a0a0f',
  '--v2t': props.theme?.text   || '#fff',
  '--v2s': props.theme?.surf   || '#1a1a1f',
  '--v2d': props.theme?.dim    || '#888',
}))

// ── Active task ────────────────────────────────────────────────────────────
const activeTaskIdx = computed(() => {
  if (!props.block?.tasks) return -1
  return props.block.tasks.findIndex(t => !props.completedIds.includes(t.id))
})
const currentTask = computed(() =>
  activeTaskIdx.value >= 0 ? props.block.tasks[activeTaskIdx.value] : null
)
const blockComplete = computed(() =>
  props.block?.tasks?.length > 0 && activeTaskIdx.value < 0
)

// ── Story segment fill ─────────────────────────────────────────────────────
const segWidth = (bi) => {
  if (bi < props.index) return 100
  if (bi > props.index) return 0
  if (!props.block?.tasks?.length) return 0
  const done = props.block.tasks.filter(t => props.completedIds.includes(t.id)).length
  return Math.round(done / props.block.tasks.length * 100)
}

// ── Theme particles ────────────────────────────────────────────────────────
const EMOJIS = {
  detective: ['🔍','🔐','📋','⚡','🕵️','📎'],
  romantic:  ['💫','❤️','✨','🌸','💗','🌺'],
  mystery:   ['✨','🌟','💫','🔮','⭐','🌙'],
  city:      ['⚡','💡','🚀','⭐','✦','🏙️'],
  treasure:  ['🪙','⭐','💎','✨','🗺️','🔑'],
  proposal:  ['💍','✨','💫','🌸','💕','🌹'],
}
const floatParticles = computed(() => {
  const list = EMOJIS[props.theme?.id] || EMOJIS.romantic
  return Array.from({ length: 18 }, (_, i) => ({
    id: i,
    emoji: list[i % list.length],
    style: {
      left: `${3 + i * 5.5}%`,
      animationDelay: `${(i * 0.65) % 9}s`,
      animationDuration: `${9 + (i % 5) * 2.5}s`,
      fontSize: `${0.75 + (i % 4) * 0.35}rem`,
      opacity: String(0.11 + (i % 7) * 0.035),
    }
  }))
})

// ── Done emoji ─────────────────────────────────────────────────────────────
const doneEmoji = computed(() => ({
  detective:'🗂️', romantic:'💝', mystery:'🔮',
  city:'🏆', treasure:'💰', proposal:'💍',
}[props.theme?.id] || '✨'))

// ── Task helpers ───────────────────────────────────────────────────────────
const ICONS = { simple:'✅', riddle:'🧩', code_physical:'🔢', location:'📍', photo:'📸', selfie:'🤳', text_answer:'✍️', media:'▶️', qr:'📱', mini_game:'🎮' }
const NAMES = { simple:'Задание', riddle:'Загадка', code_physical:'Код', location:'Локация', photo:'Фото', selfie:'Селфи', text_answer:'Ответ', media:'Медиа', qr:'QR', mini_game:'Игра' }
const taskIcon = (t) => ICONS[t] || '📌'
const taskTypeName = (t) => NAMES[t] || t

// ── Touch ripples ──────────────────────────────────────────────────────────
const ripples = ref([])
let rId = 0
const onBgTap = (e) => {
  if (e.target.closest('.qpv2__sheet') || e.target.closest('.qpv2__prev')) return
  const id = ++rId
  ripples.value.push({ id, x: e.clientX, y: e.clientY })
  setTimeout(() => { ripples.value = ripples.value.filter(r => r.id !== id) }, 800)
}

// ── Sheet drag ─────────────────────────────────────────────────────────────
const sheetRef = ref(null)
const sheetOffset = ref(0)
let _sy = 0, _so = 0
const stDragStart = (e) => { _sy = e.touches[0].clientY; _so = sheetOffset.value }
const stDragMove  = (e) => { sheetOffset.value = Math.max(-80, Math.min(90, _so + (e.touches[0].clientY - _sy))) }
const stDragEnd   = () => { sheetOffset.value = sheetOffset.value > 52 ? 0 : sheetOffset.value < -52 ? -60 : 0 }

// ── Celebration burst ──────────────────────────────────────────────────────
const burstOn    = ref(false)
const burstKey   = ref(0)
const burstItems = ref([])

const triggerBurst = () => {
  const list = EMOJIS[props.theme?.id] || EMOJIS.romantic
  burstItems.value = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2
    const d = 32 + Math.random() * 28
    return { id: i, e: list[i % list.length], s: { '--bx': `${Math.cos(a)*d}vw`, '--by': `${Math.sin(a)*d}vh`, animationDelay: `${i * 0.045}s`, fontSize: `${1.1 + Math.random() * 0.9}rem` } }
  })
  burstOn.value = true; burstKey.value++
  setTimeout(() => { burstOn.value = false }, 1100)
}

const onComplete = (task) => { triggerBurst(); sheetOffset.value = 0; emit('complete-task', task) }
watch(() => activeTaskIdx.value, () => { sheetOffset.value = 0 })
</script>

<style scoped>
.qpv2 { position: fixed; inset: 0; background: var(--v2b); color: var(--v2t); font-family: system-ui,-apple-system,sans-serif; overflow: hidden; -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none; }

/* Background */
.qpv2__bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.qpv2__orb { position: absolute; border-radius: 50%; filter: blur(72px); animation: v2-drift 14s ease-in-out infinite alternate; }
.qpv2__orb--1 { width: 65vw; height: 65vw; background: color-mix(in srgb, var(--v2a) 18%, transparent); top: -18vw; right: -18vw; animation-duration: 16s; }
.qpv2__orb--2 { width: 55vw; height: 55vw; background: color-mix(in srgb, var(--v2a) 9%, transparent); bottom: 14vh; left: -18vw; animation-duration: 11s; animation-delay: -6s; }
.qpv2__orb--3 { width: 42vw; height: 42vw; background: color-mix(in srgb, var(--v2a) 12%, transparent); top: 28%; left: 18%; animation-duration: 20s; animation-delay: -10s; }
.qpv2__grain { position: absolute; inset: 0; opacity: .025; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 200px; }
@keyframes v2-drift { from { transform: translate(0,0) scale(1); } to { transform: translate(12px,-18px) scale(1.08); } }

/* Floating particles */
.qpv2__floats { position: absolute; inset: 0; pointer-events: none; z-index: 1; overflow: hidden; }
.qpv2__float { position: absolute; bottom: -8%; animation: v2-float linear infinite; will-change: transform; }
@keyframes v2-float { 0% { transform: translateY(0) rotate(0deg) scale(.8); opacity: 0; } 8% { opacity: 1; } 92% { opacity: 1; } 100% { transform: translateY(-110vh) rotate(310deg) scale(1.1); opacity: 0; } }

/* Ripples */
.qpv2__ripple { position: fixed; left: var(--rx); top: var(--ry); width: 12px; height: 12px; border-radius: 50%; border: 1.5px solid var(--v2a); transform: translate(-50%,-50%) scale(0); animation: v2-ripple .78s ease-out forwards; pointer-events: none; z-index: 100; opacity: .45; }
@keyframes v2-ripple { to { transform: translate(-50%,-50%) scale(16); opacity: 0; } }

/* Story bar */
.qpv2__stories { position: absolute; top: env(safe-area-inset-top,0px); left: 0; right: 0; display: flex; gap: 4px; padding: 10px 14px 0; z-index: 20; pointer-events: none; }
.qpv2__seg { flex: 1; height: 3px; border-radius: 2px; background: rgba(255,255,255,.18); overflow: hidden; }
.qpv2__seg-fill { height: 100%; background: var(--v2a); border-radius: 2px; transition: width .5s ease; }
.qpv2__seg--done .qpv2__seg-fill { width: 100% !important; }

/* Top bar */
.qpv2__topbar { position: absolute; top: calc(env(safe-area-inset-top,0px) + 22px); left: 0; right: 0; padding: 0 14px; display: flex; align-items: center; justify-content: space-between; z-index: 20; }
.qpv2__loc { display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,.4); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,.1); border-radius: 100px; padding: 6px 14px; font-size: .78rem; font-weight: 600; color: rgba(255,255,255,.82); max-width: 58vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qpv2__topbar-right { display: flex; align-items: center; gap: 8px; }
.qpv2__timer { font-size: .7rem; font-weight: 700; color: rgba(255,255,255,.4); font-variant-numeric: tabular-nums; }
.qpv2__menu-btn { width: 36px; height: 36px; border-radius: 50%; background: rgba(0,0,0,.4); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,.1); color: rgba(255,255,255,.72); font-size: 1.1rem; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }

/* Hero */
.qpv2__hero { position: absolute; top: 0; left: 0; right: 0; height: 48vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 110px 24px 0; text-align: center; z-index: 5; pointer-events: none; }
.qpv2__hero-eyebrow { font-size: .72rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--v2a); opacity: .85; margin: 0 0 10px; }
.qpv2__hero-title { font-size: clamp(1.6rem, 8vw, 3rem); font-weight: 900; letter-spacing: -.02em; line-height: 1.1; margin: 0 0 12px; text-shadow: 0 2px 24px rgba(0,0,0,.6); }
.qpv2__hero-desc { font-size: .88rem; color: rgba(255,255,255,.5); margin: 0; line-height: 1.55; max-width: 280px; }

/* Points badge */
.qpv2__pts-badge { position: absolute; bottom: calc(58vh + 16px); right: 16px; display: flex; align-items: baseline; gap: 3px; background: rgba(0,0,0,.38); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,.1); border-radius: 100px; padding: 5px 12px; z-index: 20; pointer-events: none; }
.qpv2__pts-n { font-size: 1rem; font-weight: 800; color: var(--v2a); text-shadow: 0 0 10px var(--v2a); }
.qpv2__pts-l { font-size: .65rem; color: rgba(255,255,255,.35); font-weight: 600; }

/* Task sheet */
.qpv2__sheet { position: absolute; bottom: 0; left: 0; right: 0; height: 58vh; background: rgba(10,10,16,.9); backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px); border: 1px solid rgba(255,255,255,.08); border-bottom: none; border-radius: 24px 24px 0 0; z-index: 30; transition: transform .32s cubic-bezier(.4,0,.2,1); display: flex; flex-direction: column; padding-bottom: env(safe-area-inset-bottom,20px); will-change: transform; }
.qpv2__sheet::before { content: ''; position: absolute; inset: 0; border-radius: 24px 24px 0 0; background: linear-gradient(180deg, color-mix(in srgb, var(--v2a) 6%, transparent) 0%, transparent 45%); pointer-events: none; }
.qpv2__handle { width: 38px; height: 4px; background: rgba(255,255,255,.14); border-radius: 2px; margin: 10px auto 14px; flex-shrink: 0; cursor: grab; }

/* Trail */
.qpv2__trail { display: flex; gap: 5px; padding: 0 20px; margin-bottom: 14px; flex-shrink: 0; }
.qpv2__trail-dot { flex: 1; height: 3px; border-radius: 2px; background: rgba(255,255,255,.12); transition: background .3s, transform .3s; }
.qpv2__trail-dot.done { background: var(--v2a); opacity: .55; }
.qpv2__trail-dot.active { background: var(--v2a); transform: scaleY(1.6); transform-origin: center; }

/* Task wrap */
.qpv2__task-wrap { flex: 1; overflow-y: auto; padding: 0 18px 18px; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; scrollbar-width: none; } .qpv2__task-wrap::-webkit-scrollbar { display: none; }

/* Task header */
.qpv2__task-hd { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.qpv2__ico-wrap { position: relative; width: 46px; height: 46px; flex-shrink: 0; }
.qpv2__ico { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
.qpv2__ico-ring { position: absolute; inset: 0; width: 46px; height: 46px; }
.qpv2__ico-ring circle { stroke: var(--v2a); opacity: .5; stroke-dasharray: 132; stroke-dashoffset: 0; animation: v2-ring 3.5s linear infinite; transform-origin: center; }
@keyframes v2-ring { to { stroke-dashoffset: -132; } }
.qpv2__type-pill { display: inline-block; font-size: .7rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--v2a); background: color-mix(in srgb, var(--v2a) 14%, transparent); border: 1px solid color-mix(in srgb, var(--v2a) 32%, transparent); border-radius: 6px; padding: 3px 9px; }
.qpv2__task-pts { margin-left: 7px; font-size: .7rem; font-weight: 700; color: rgba(255,255,255,.32); }

/* Override V1 task styles */
.qpv2__task-body :deep(.qt) { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; border-radius: 0 !important; margin: 0 !important; }
.qpv2__task-body :deep(.qt__title) { font-size: 1rem; font-weight: 700; margin-bottom: 14px; line-height: 1.4; }
.qpv2__task-body :deep(.qt__desc) { font-size: .88rem; color: rgba(255,255,255,.58); line-height: 1.55; margin-bottom: 14px; }
.qpv2__task-body :deep(.qt__btn) { width: 100%; padding: 15px; border-radius: 16px; font-size: .95rem; font-weight: 800; background: var(--v2a); color: #0a0a0f; border: none; cursor: pointer; margin-top: 14px; box-shadow: 0 6px 22px color-mix(in srgb, var(--v2a) 36%, transparent); transition: transform .15s, box-shadow .15s; -webkit-tap-highlight-color: transparent; }
.qpv2__task-body :deep(.qt__btn:active) { transform: scale(.97); }
.qpv2__task-body :deep(.qt__input) { background: rgba(255,255,255,.06) !important; border: 1px solid rgba(255,255,255,.12) !important; border-radius: 12px !important; color: #fff !important; padding: 12px 14px !important; font-size: .95rem !important; width: 100% !important; box-sizing: border-box !important; }
.qpv2__task-body :deep(.qt__answer-row) { display: flex; gap: 8px; }

/* Block done */
.qpv2__done { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px 24px 32px; text-align: center; }
.qpv2__done-icon { font-size: 3.6rem; margin-bottom: 16px; animation: v2-trophy .7s cubic-bezier(.36,.07,.19,.97); }
@keyframes v2-trophy { 0%,100% { transform: translateY(0) scale(1); } 30% { transform: translateY(-14px) scale(1.1); } 60% { transform: translateY(-6px) scale(1.05); } }
.qpv2__done-title { font-size: 1.25rem; font-weight: 900; margin: 0 0 6px; }
.qpv2__done-sub { font-size: .85rem; color: rgba(255,255,255,.42); margin: 0 0 28px; }
.qpv2__cta { width: 100%; max-width: 300px; padding: 16px 28px; border-radius: 100px; background: var(--v2a); color: #0a0a0f; font-size: .95rem; font-weight: 800; border: none; cursor: pointer; box-shadow: 0 8px 28px color-mix(in srgb, var(--v2a) 42%, transparent); transition: transform .2s, box-shadow .2s; -webkit-tap-highlight-color: transparent; }
.qpv2__cta:active { transform: scale(.97); }
.qpv2__cta--finish { background: linear-gradient(135deg, var(--v2a), color-mix(in srgb, var(--v2a) 65%, #fff)); }

/* Prev button */
.qpv2__prev { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 44px; height: 44px; border-radius: 50%; background: rgba(0,0,0,.42); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,.1); color: rgba(255,255,255,.62); font-size: 1.7rem; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 25; -webkit-tap-highlight-color: transparent; }

/* Burst */
.qpv2__burst { position: fixed; inset: 0; pointer-events: none; z-index: 200; display: flex; align-items: center; justify-content: center; }
.qpv2__burst-p { position: absolute; animation: v2-burst .95s cubic-bezier(.2,.8,.4,1) forwards; }
@keyframes v2-burst { 0% { transform: translate(0,0) scale(0) rotate(0deg); opacity: 1; } 100% { transform: translate(var(--bx,0), var(--by,0)) scale(1.3) rotate(180deg); opacity: 0; } }
.qburst-enter-active { animation: v2-fi .15s; }
.qburst-leave-active { animation: v2-fo .25s; }
@keyframes v2-fi { from { opacity: 0; } }
@keyframes v2-fo { to { opacity: 0; } }

/* Task transitions */
.qtask-enter-active { animation: qtask-in .28s cubic-bezier(.4,0,.2,1); }
.qtask-leave-active { animation: qtask-out .22s cubic-bezier(.4,0,.2,1); }
@keyframes qtask-in  { from { transform: translateX(22px); opacity: 0; } }
@keyframes qtask-out { to   { transform: translateX(-18px); opacity: 0; } }
</style>
