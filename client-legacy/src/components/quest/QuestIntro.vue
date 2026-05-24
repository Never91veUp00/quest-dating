<template>
  <transition name="intro-exit" @after-leave="$emit('done')">
    <div v-if="visible" class="intro" :class="`intro--${theme.id}`" @click="skip">

      <!-- ════ DETECTIVE ════ -->
      <template v-if="theme.id === 'detective'">
        <canvas ref="canvas" class="intro__canvas"></canvas>
        <div class="intro__det-vignette"></div>
        <div class="intro__det-scanline"></div>
        <div class="intro__det-body">
          <div class="intro__det-stamp">СОВЕРШЕННО СЕКРЕТНО</div>
          <div class="intro__det-file">
            <div v-for="(line, i) in detLines" :key="i"
              class="intro__det-line"
              :style="{ animationDelay: (0.3 + i * 0.15) + 's' }">
              {{ line }}
            </div>
          </div>
          <div class="intro__det-code-row">
            <span class="intro__det-code">{{ typedCode }}</span>
            <span class="intro__det-blink">█</span>
          </div>
        </div>
      </template>

      <!-- ════ ROMANTIC ════ -->
      <template v-else-if="theme.id === 'romantic'">
        <div class="intro__rom-bg"></div>
        <div class="intro__rom-particles">
          <div v-for="n in 22" :key="n" class="intro__rom-particle"
            :style="romParticle(n)">
            {{ ['❤️','💗','💖','✨','🌸','💫'][n % 6] }}
          </div>
        </div>
        <div class="intro__rom-center">
          <div class="intro__rom-heart-wrap">
            <div class="intro__rom-ring" v-for="n in 3" :key="n"
              :style="{ '--n': n, animationDelay: (n * 0.35) + 's' }"></div>
            <div class="intro__rom-heart">❤️</div>
          </div>
          <div class="intro__rom-text">
            <div class="intro__rom-for">специально для</div>
            <div class="intro__rom-name">{{ questData.client_name }}</div>
            <div class="intro__rom-divider"></div>
          </div>
        </div>
      </template>

      <!-- ════ MYSTERY ════ -->
      <template v-else-if="theme.id === 'mystery'">
        <div class="intro__mys-stars">
          <div v-for="n in 90" :key="n" class="intro__mys-star"
            :style="mysStarStyle(n)"></div>
        </div>
        <div class="intro__mys-aurora"></div>
        <div class="intro__mys-fog"></div>
        <div class="intro__mys-center">
          <div class="intro__mys-orb">
            <div class="intro__mys-orb-glow"></div>
            <div class="intro__mys-orb-icon">🔮</div>
            <div v-for="n in 5" :key="n" class="intro__mys-orbit"
              :style="{ '--i': n }">
              <div class="intro__mys-dot"></div>
            </div>
          </div>
          <transition name="prophecy" mode="out-in">
            <div :key="mystLine" class="intro__mys-prophecy">
              {{ mysteryLines[mystLine] }}
            </div>
          </transition>
          <div class="intro__mys-runes">᚛ ᛟ ᚺ ᚾ ᚢ ᛊ ᛏ ᛒ ᛖ ᚜</div>
        </div>
      </template>

      <!-- ════ CITY ════ -->
      <template v-else-if="theme.id === 'city'">
        <canvas ref="canvas" class="intro__canvas"></canvas>
        <div class="intro__city-corners">
          <div class="intro__city-corner" v-for="p in ['tl','tr','bl','br']" :key="p"
            :class="`intro__city-corner--${p}`"></div>
          <div class="intro__city-scanline"></div>
        </div>
        <div class="intro__city-body">
          <div class="intro__city-os">QUEST_OS v2.4.1</div>
          <div class="intro__city-bar-wrap">
            <div class="intro__city-bar">
              <div class="intro__city-fill" :style="{ width: cityProgress + '%' }"></div>
            </div>
            <span class="intro__city-pct">{{ Math.round(cityProgress) }}%</span>
          </div>
          <div class="intro__city-logs">
            <div v-for="(log, i) in visibleLogs" :key="i" class="intro__city-log">
              <span class="intro__city-log-ts">{{ log.time }}</span>
              <span>{{ log.text }}</span>
            </div>
          </div>
          <div class="intro__city-target" v-if="questData.client_name">
            TARGET: <span>{{ questData.client_name.toUpperCase() }}</span>
          </div>
        </div>
      </template>


      <!-- Искатель клада: карта и золото -->
      <template v-else-if="theme.id === 'treasure'">
        <div class="intro__treasure-bg">
          <span v-for="n in 25" :key="n" class="intro__coin" :style="treasureCoin(n)">🪙</span>
        </div>
        <div class="intro__treasure-body">
          <div class="intro__treasure-compass">🧭</div>
          <div class="intro__treasure-title">КАРТА СОКРОВИЩ</div>
          <div class="intro__treasure-line">Маршрут проложен</div>
          <div class="intro__treasure-line">Клад ждёт своего искателя</div>
          <div v-if="questData.client_name" class="intro__treasure-name">
            Искатель: <span>{{ questData.client_name }}</span>
          </div>
          <div class="intro__treasure-map">🗺️</div>
        </div>
      </template>

      <div class="intro__skip">нажми чтобы пропустить</div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  theme:     { type: Object, required: true },
  questData: { type: Object, required: true },
  duration:  { type: Number, default: 3400 },
})
const emit = defineEmits(['done'])

const visible = ref(true)
const canvas  = ref(null)
let endTimer, rafId

const skip = () => { clearTimeout(endTimer); visible.value = false }

onMounted(() => {
  endTimer = setTimeout(() => { visible.value = false }, props.duration)
  if (props.theme.id === 'detective') initDetective()
  if (props.theme.id === 'city')      initCity()
  if (props.theme.id === 'mystery')   initMystery()
  if (props.theme.id === 'treasure')  initTreasure()
})
onUnmounted(() => { clearTimeout(endTimer); cancelAnimationFrame(rafId) })

/* ── DETECTIVE ───────────────────────────────────────────────── */
const detLines = [
  'ДЕЛО №' + (1000 + Math.floor(Math.random() * 8999)),
  'СТАТУС: АКТИВИРОВАНО',
  'АГЕНТ:  ЗАСЕКРЕЧЕН',
  'ЦЕЛЬ:   ' + (props.questData.title || '').toUpperCase().slice(0, 20),
]
const typedCode = ref('')

const initDetective = () => {
  const code = 'SQ-' + Math.random().toString(36).slice(2,8).toUpperCase()
  let i = 0
  const iv = setInterval(() => {
    typedCode.value += code[i++]
    if (i >= code.length) clearInterval(iv)
  }, 90)

  const c = canvas.value; if (!c) return
  const ctx = c.getContext('2d')
  c.width = window.innerWidth; c.height = window.innerHeight

  const drops = Array.from({ length: 70 }, () => ({
    x: Math.random() * c.width,
    y: Math.random() * c.height,
    speed: 5 + Math.random() * 7,
    len: 50 + Math.random() * 80,
  }))

  const draw = () => {
    ctx.clearRect(0, 0, c.width, c.height)
    drops.forEach(d => {
      const g = ctx.createLinearGradient(d.x, d.y - d.len, d.x, d.y)
      g.addColorStop(0, 'transparent')
      g.addColorStop(1, 'rgba(232,197,71,.28)')
      ctx.strokeStyle = g; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(d.x, d.y - d.len); ctx.lineTo(d.x, d.y); ctx.stroke()
      d.y += d.speed
      if (d.y > c.height + d.len) d.y = -d.len
    })
    rafId = requestAnimationFrame(draw)
  }
  draw()
}

/* ── ROMANTIC ────────────────────────────────────────────────── */
const romParticle = (n) => ({
  '--x':    (n * 4.7 + 3) % 100 + '%',
  '--y':    (n * 6.3 + 5) % 100 + '%',
  '--size': (1 + (n % 3) * 0.5) + 'rem',
  '--del':  (n * 0.17) % 3.5 + 's',
  '--dur':  (2.2 + (n % 4) * 0.6) + 's',
})

/* ── MYSTERY ─────────────────────────────────────────────────── */
const mysteryLines = ['Пророчество ждало тебя…', 'Звёзды сошлись сегодня', 'Тайна раскрывается…']
const mystLine = ref(0)

const mysStarStyle = (n) => ({
  '--x':   (n * 1.13) % 100 + '%',
  '--y':   (n * 2.07) % 100 + '%',
  '--s':   (1 + (n % 4) * 0.9) + 'px',
  '--d':   (n * 0.08) % 4 + 's',
  '--dur': (1.2 + (n % 3) * 1) + 's',
  opacity: 0.2 + (n % 6) * 0.12,
})

const initMystery = () => {
  let i = 0
  const iv = setInterval(() => {
    mystLine.value = ++i % mysteryLines.length
  }, 950)
  setTimeout(() => clearInterval(iv), props.duration)
}


/* ── TREASURE ────────────────────────────────────────────────── */
const treasureCoin = (n) => ({
  '--x':     (n * 4.1) % 100 + '%',
  '--delay': (n * 0.18) % 4 + 's',
  '--speed': (2.5 + (n % 4) * 0.6) + 's',
  '--drift': (n % 2 === 0 ? 1 : -1) * (10 + n % 20) + 'px',
  '--size':  (0.9 + (n % 3) * 0.4) + 'rem',
  opacity:   0.5 + (n % 4) * 0.15,
})

const initTreasure = () => {
  // Анимация управляется CSS — JS не нужен
}

/* ── CITY ────────────────────────────────────────────────────── */
const cityProgress = ref(0)
const visibleLogs  = ref([])
const allLogs = [
  { time: '00:01', text: 'Инициализация квеста...' },
  { time: '00:02', text: 'Загрузка координат локаций' },
  { time: '00:03', text: 'Шифрование заданий' },
  { time: '00:04', text: `Агент: ${props.questData.client_name || 'ЗАСЕКРЕЧЕН'}` },
  { time: '00:05', text: 'Протокол активирован ✓' },
]

const initCity = () => {
  const t0 = performance.now()
  const dur = props.duration - 500
  const tick = (now) => {
    cityProgress.value = Math.min((now - t0) / dur * 100, 100)
    rafId = requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)

  allLogs.forEach((log, i) => {
    setTimeout(() => visibleLogs.value.push(log), i * 480)
  })

  const c = canvas.value; if (!c) return
  const ctx = c.getContext('2d')
  c.width = window.innerWidth; c.height = window.innerHeight

  const cols  = Math.floor(c.width / 18)
  const drops = Array.from({ length: cols }, () => Math.random() * (c.height / 18))
  const chars = 'QWESTABCDE012345ᚺᚾᛟ∅∞⌬⎔'

  const drawMatrix = () => {
    ctx.fillStyle = 'rgba(6,8,16,.15)'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.font = '13px monospace'
    drops.forEach((y, x) => {
      ctx.fillStyle = `rgba(0,245,196,${Math.random() * .45})`
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x * 18, y * 18)
      if (y * 18 > c.height && Math.random() > .975) drops[x] = 0
      else drops[x] += 0.38
    })
    rafId = requestAnimationFrame(drawMatrix)
  }
  drawMatrix()
}
</script>

<style scoped>
/* ── ROOT ────────────────────────────────────────────────────── */
.intro {
  position: fixed; inset: 0; z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden; cursor: pointer;
  background: var(--bg);
  font-family: var(--font-b);
  user-select: none; -webkit-user-select: none;
  touch-action: manipulation;
}
.intro__canvas { position: absolute; inset: 0; width: 100%; height: 100%; }

.intro__skip {
  position: absolute; bottom: max(28px, env(safe-area-inset-bottom) + 16px);
  left: 50%; transform: translateX(-50%);
  font-size: .6rem; letter-spacing: .22em; text-transform: uppercase;
  color: rgba(255,255,255,.18); white-space: nowrap;
  animation: skip-pulse 2.5s ease-in-out infinite;
}
@keyframes skip-pulse { 0%,100%{opacity:.2} 50%{opacity:.6} }

.intro-exit-leave-active { transition: opacity .45s ease, transform .45s ease; }
.intro-exit-leave-to { opacity: 0; transform: scale(1.05); }

.prophecy-enter-active, .prophecy-leave-active { transition: all .3s ease; }
.prophecy-enter-from  { opacity: 0; transform: translateY(8px); }
.prophecy-leave-to    { opacity: 0; transform: translateY(-8px); }

/* ══ DETECTIVE ═══════════════════════════════════════════════ */
.intro--detective { background: #050505; }

.intro__det-vignette {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,.88) 100%);
}
.intro__det-scanline {
  position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(
    to bottom, transparent 0px, transparent 2px,
    rgba(0,0,0,.06) 2px, rgba(0,0,0,.06) 4px);
}

.intro__det-body {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center; gap: 20px;
  padding: 24px;
}
.intro__det-stamp {
  font-family: 'Courier Prime', monospace;
  font-size: .68rem; letter-spacing: .42em; text-transform: uppercase;
  color: rgba(232,197,71,.65); border: 1px solid rgba(232,197,71,.25);
  padding: 5px 20px; border-radius: 2px;
  animation: stamp-pop .4s ease both;
}
@keyframes stamp-pop {
  from { opacity:0; transform:scale(1.5) rotate(-4deg); }
  to   { opacity:1; transform:scale(1) rotate(0); }
}

.intro__det-file {
  background: rgba(232,197,71,.03); border: 1px solid rgba(232,197,71,.14);
  border-radius: 4px; padding: 18px 24px; min-width: min(280px, 85vw);
}
.intro__det-line {
  font-family: 'Courier Prime', monospace; font-size: .75rem;
  color: rgba(200,184,154,.8); letter-spacing: .05em; line-height: 2;
  animation: type-reveal .25s ease both;
  overflow: hidden; white-space: nowrap;
}
@keyframes type-reveal {
  from { max-width:0; opacity:0 }
  to   { max-width: 500px; opacity:1 }
}

.intro__det-code-row { display: flex; align-items: center; gap: 4px; }
.intro__det-code {
  font-family: 'Courier Prime', monospace; font-size: 2rem; font-weight: 700;
  color: #e8c547; letter-spacing: .3em;
  text-shadow: 0 0 12px rgba(232,197,71,.5), 0 0 30px rgba(232,197,71,.2);
  animation: code-pulse 1.2s ease-in-out infinite alternate;
}
@keyframes code-pulse {
  from { text-shadow: 0 0 8px rgba(232,197,71,.4) }
  to   { text-shadow: 0 0 28px rgba(232,197,71,.9), 0 0 60px rgba(232,197,71,.3) }
}
.intro__det-blink {
  font-family: 'Courier Prime', monospace; color: #e8c547; font-size: 1.5rem;
  animation: blink .65s step-end infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ══ ROMANTIC ════════════════════════════════════════════════ */
.intro--romantic {
  background: radial-gradient(ellipse at 50% 35%, #210d18 0%, #0a0307 100%);
}
.intro__rom-bg {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 80% 50% at 50% 20%, rgba(244,114,182,.1) 0%, transparent 65%),
    radial-gradient(ellipse 60% 40% at 20% 80%, rgba(216,72,144,.06) 0%, transparent 55%);
  animation: rom-breathe 5s ease-in-out infinite;
}
@keyframes rom-breathe { 0%,100%{opacity:.7} 50%{opacity:1} }

.intro__rom-particles { position: absolute; inset: 0; pointer-events: none; }
.intro__rom-particle {
  position: absolute; left: var(--x); top: var(--y);
  font-size: var(--size);
  filter: drop-shadow(0 0 5px rgba(244,114,182,.4));
  animation: rom-float var(--dur) var(--del) ease-in-out infinite;
}
@keyframes rom-float {
  0%,100% { transform: translateY(0) scale(1);      opacity: .45; }
  50%     { transform: translateY(-20px) scale(1.2); opacity: .85; }
}

.intro__rom-center {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center; gap: 24px;
}
.intro__rom-heart-wrap {
  position: relative; width: 120px; height: 120px;
  display: flex; align-items: center; justify-content: center;
}
.intro__rom-ring {
  position: absolute; border-radius: 50%; border: 1px solid rgba(244,114,182,.25);
  animation: rom-ripple 1.8s ease-out infinite;
}
.intro__rom-ring:nth-child(1) { width: 80px;  height: 80px;  animation-delay: 0s; }
.intro__rom-ring:nth-child(2) { width: 110px; height: 110px; animation-delay: .5s; }
.intro__rom-ring:nth-child(3) { width: 140px; height: 140px; animation-delay: 1s; }
@keyframes rom-ripple {
  from { opacity:.7; transform:scale(.8); }
  to   { opacity:0;  transform:scale(1.6); }
}
.intro__rom-heart {
  font-size: 4.5rem; position: relative; z-index: 2;
  filter: drop-shadow(0 0 24px rgba(244,114,182,.8));
  animation: heartbeat .75s ease-in-out infinite;
}
@keyframes heartbeat {
  0%,100% { transform: scale(1); }
  14%     { transform: scale(1.18); }
  28%     { transform: scale(1); }
  42%     { transform: scale(1.10); }
}

.intro__rom-text { display: flex; flex-direction: column; align-items: center; gap: 6px; animation: rom-text-up .6s .3s ease both; }
@keyframes rom-text-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }

.intro__rom-for {
  font-family: 'Dancing Script', cursive; font-size: 1.1rem;
  color: rgba(249,208,224,.55); letter-spacing: .04em;
}
.intro__rom-name {
  font-family: 'Dancing Script', cursive; font-size: clamp(2rem, 8vw, 3rem); font-weight: 700;
  color: #f9d0e0; line-height: 1.1;
  text-shadow: 0 0 20px rgba(244,114,182,.55), 0 0 50px rgba(244,114,182,.2);
}
.intro__rom-divider {
  width: 0; height: 1px; background: linear-gradient(90deg, transparent, #f472b6, transparent);
  animation: line-grow .9s .6s ease both;
}
@keyframes line-grow { to { width: 90px; } }

/* ══ MYSTERY ══════════════════════════════════════════════════ */
.intro--mystery {
  background: radial-gradient(ellipse at 50% 25%, #0e0824 0%, #020110 100%);
}

.intro__mys-stars { position: absolute; inset: 0; pointer-events: none; }
.intro__mys-star {
  position: absolute; left: var(--x); top: var(--y);
  width: var(--s); height: var(--s); border-radius: 50%; background: #fff;
  animation: mys-twinkle var(--dur) var(--d) ease-in-out infinite;
}
@keyframes mys-twinkle { 0%,100%{transform:scale(1);opacity:.25} 50%{transform:scale(2.2);opacity:1} }

.intro__mys-aurora {
  position: absolute; top: 0; left: -20%; width: 140%; height: 50%; pointer-events: none;
  background:
    radial-gradient(ellipse 70% 80% at 35% 0%, rgba(167,139,250,.22) 0%, transparent 60%),
    radial-gradient(ellipse 55% 60% at 65% 0%, rgba(96,165,250,.14) 0%, transparent 55%),
    radial-gradient(ellipse 40% 45% at 50% 0%, rgba(52,211,153,.09) 0%, transparent 50%);
  filter: blur(3px);
  animation: aurora-drift 7s ease-in-out infinite alternate;
}
@keyframes aurora-drift {
  from { transform: translateX(-6%) scaleY(1); }
  to   { transform: translateX(6%) scaleY(1.15); }
}

.intro__mys-fog {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 130% 45% at 50% 70%, rgba(167,139,250,.07) 0%, transparent 65%);
  animation: fog-shift 9s ease-in-out infinite alternate;
}
@keyframes fog-shift { to { transform: translateX(25px); } }

.intro__mys-center {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center; gap: 24px;
}

.intro__mys-orb {
  position: relative; width: 130px; height: 130px;
  display: flex; align-items: center; justify-content: center;
}
.intro__mys-orb-glow {
  position: absolute; inset: -20px; border-radius: 50%;
  background: radial-gradient(circle, rgba(167,139,250,.35) 0%, transparent 65%);
  animation: orb-breathe 2.5s ease-in-out infinite;
}
@keyframes orb-breathe { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.2);opacity:1} }

.intro__mys-orb-icon {
  font-size: 3.8rem; position: relative; z-index: 2;
  filter: drop-shadow(0 0 22px rgba(167,139,250,.9));
  animation: orb-float 3.5s ease-in-out infinite;
}
@keyframes orb-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }

.intro__mys-orbit {
  position: absolute; inset: 0; border-radius: 50%;
  border: 1px solid rgba(167,139,250,.18);
  transform: rotate(calc(var(--i) * 36deg));
  animation: orbit-spin calc(4s + var(--i) * 0.6s) linear infinite;
}
@keyframes orbit-spin { to { transform: rotate(calc(360deg + var(--i) * 36deg)); } }

.intro__mys-dot {
  position: absolute; top: -3px; left: 50%;
  width: 5px; height: 5px; border-radius: 50%; margin-left: -2.5px;
  background: #a78bfa; box-shadow: 0 0 7px rgba(167,139,250,.9);
}

.intro__mys-prophecy {
  font-family: 'Cinzel', serif; font-size: clamp(.9rem, 3.5vw, 1.1rem);
  color: rgba(212,200,240,.9); letter-spacing: .1em; text-align: center; padding: 0 24px;
  text-shadow: 0 0 18px rgba(167,139,250,.5);
  min-height: 1.6em;
}

.intro__mys-runes {
  font-size: .72rem; color: rgba(167,139,250,.3); letter-spacing: .28em;
  animation: rune-flicker 2s ease-in-out infinite alternate;
}
@keyframes rune-flicker { to { color: rgba(167,139,250,.65); text-shadow: 0 0 8px rgba(167,139,250,.4); } }

/* ══ CITY ══════════════════════════════════════════════════════ */
.intro--city { background: #060810; }

.intro__city-corners { position: absolute; inset: 18px; pointer-events: none; }
.intro__city-corner {
  position: absolute; width: 26px; height: 26px;
}
.intro__city-corner::before,
.intro__city-corner::after {
  content: ''; position: absolute; background: #00f5c4;
  box-shadow: 0 0 5px rgba(0,245,196,.55);
}
.intro__city-corner::before { width: 100%; height: 2px; top: 0; left: 0; }
.intro__city-corner::after  { width: 2px; height: 100%; top: 0; left: 0; }
.intro__city-corner--tl { top: 0;    left: 0; }
.intro__city-corner--tr { top: 0;    right: 0;  transform: scaleX(-1); }
.intro__city-corner--bl { bottom: 0; left: 0;   transform: scaleY(-1); }
.intro__city-corner--br { bottom: 0; right: 0;  transform: scale(-1); }

.intro__city-scanline {
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0,245,196,.55), transparent);
  animation: city-scan 2.2s linear infinite;
}
@keyframes city-scan { from{top:0;opacity:1} to{top:100%;opacity:.2} }

.intro__city-body {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; gap: 12px;
  padding: 0 20px; max-width: min(340px, 90vw); width: 100%;
}
.intro__city-os {
  font-family: 'Orbitron', monospace; font-size: .6rem; letter-spacing: .35em;
  color: rgba(0,245,196,.65);
  animation: city-in .3s ease both;
}

.intro__city-bar-wrap {
  display: flex; align-items: center; gap: 10px;
  animation: city-in .3s .08s ease both;
}
.intro__city-bar {
  flex: 1; height: 3px; background: rgba(0,245,196,.1); border-radius: 2px; overflow: hidden;
}
.intro__city-fill {
  height: 100%; border-radius: 2px;
  background: linear-gradient(90deg, rgba(0,245,196,.4), #00f5c4);
  box-shadow: 0 0 8px rgba(0,245,196,.5);
  transition: width .05s linear;
}
.intro__city-pct {
  font-family: 'Orbitron', monospace; font-size: .6rem; color: #00f5c4; min-width: 34px; text-align: right;
}

.intro__city-logs { display: flex; flex-direction: column; gap: 5px; }
.intro__city-log {
  font-family: 'Courier New', monospace; font-size: .68rem;
  color: rgba(0,245,196,.6); display: flex; gap: 10px;
  animation: city-in .2s ease both;
}
.intro__city-log-ts { color: rgba(0,245,196,.28); flex-shrink: 0; }

@keyframes city-in { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:none} }

.intro__city-target {
  font-family: 'Orbitron', monospace; font-size: .65rem; letter-spacing: .18em;
  color: rgba(0,245,196,.45); margin-top: 4px;
  animation: city-in .3s .5s ease both;
}
.intro__city-target span {
  color: #00f5c4; text-shadow: 0 0 10px rgba(0,245,196,.7);
}

/* ── TREASURE ────────────────────────────────────────────────── */
.intro--treasure { background: #0d0a05; }

.intro__treasure-bg { position: absolute; inset: 0; overflow: hidden; }

.intro__coin {
  position: absolute;
  top: -2rem;
  left: var(--x);
  font-size: var(--size, 1rem);
  animation: intro-coin var(--speed) var(--delay) ease-in infinite;
}
@keyframes intro-coin {
  0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: .7; }
  100% { transform: translateY(110vh) translateX(var(--drift)) rotate(360deg); opacity: 0; }
}

.intro__treasure-body {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  text-align: center;
}
.intro__treasure-compass {
  font-size: 3rem;
  animation: compass-spin 3s ease-in-out infinite alternate;
}
@keyframes compass-spin {
  0%   { transform: rotate(-15deg); }
  100% { transform: rotate(15deg); }
}
.intro__treasure-title {
  font-family: var(--font-d);
  font-size: clamp(1.4rem, 5vw, 2.2rem);
  color: #f5a623;
  letter-spacing: .15em;
  text-shadow: 0 0 20px rgba(245,166,35,.6);
}
.intro__treasure-line {
  font-size: .85rem;
  color: #e8d5a3;
  letter-spacing: .08em;
  opacity: 0;
  animation: fade-in-up .6s ease forwards;
}
.intro__treasure-line:nth-child(3) { animation-delay: .4s; }
.intro__treasure-line:nth-child(4) { animation-delay: .9s; }
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: .8; transform: translateY(0); }
}
.intro__treasure-name {
  margin-top: 8px;
  font-size: .9rem;
  color: #e8d5a3;
  letter-spacing: .05em;
}
.intro__treasure-name span { color: #f5a623; font-weight: 600; }
.intro__treasure-map {
  font-size: 2.5rem;
  margin-top: 8px;
  animation: map-pulse 2s ease-in-out infinite;
}
@keyframes map-pulse {
  0%,100% { transform: scale(1); opacity: .8; }
  50%      { transform: scale(1.1); opacity: 1; }
}

</style>