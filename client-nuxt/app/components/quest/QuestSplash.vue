<template>
  <div class="splash" :class="`splash--${theme.id}`">

    <!-- Фоновая анимация -->
    <div class="splash__bg" aria-hidden="true">
      <!-- Детектив: дождь -->
      <template v-if="theme.bg_animation === 'rain'">
        <div class="splash__rain">
          <span v-for="n in 40" :key="n" class="splash__raindrop" :style="rainDrop(n)"></span>
        </div>
        <div class="splash__vignette"></div>
      </template>

      <!-- Романтик: лепестки -->
      <template v-if="theme.bg_animation === 'petals'">
        <span v-for="n in 20" :key="n" class="splash__petal" :style="petal(n)">🌸</span>
        <div class="splash__glow-warm"></div>
      </template>

      <!-- Мистика: звёзды + туман -->
      <template v-if="theme.bg_animation === 'stars'">
        <span v-for="n in 60" :key="n" class="splash__star" :style="star(n)">✦</span>
        <div class="splash__fog"></div>
      </template>

      <!-- Город: сетка -->
      <template v-if="theme.bg_animation === 'grid'">
        <div class="splash__grid"></div>
        <div class="splash__glow-neon"></div>
      </template>

      <!-- Искатель клада: золотые частицы -->
      <template v-if="theme.bg_animation === 'particles'">
        <span v-for="n in 30" :key="n" class="splash__coin" :style="coin(n)">🪙</span>
        <div class="splash__glow-gold"></div>
      </template>
    </div>

    <!-- Контент -->
    <div class="splash__body">
      <!-- Иконка -->
      <div class="splash__icon-wrap">
        <span class="splash__icon">{{ questData.category_icon || theme.icon }}</span>
        <div class="splash__ring"></div>
      </div>

      <!-- Заголовок -->
      <div class="splash__eyebrow">{{ theme.copy.eyebrow }}</div>
      <h1 class="splash__title">{{ questData.title }}</h1>
      <p v-if="questData.client_name" class="splash__for">
        <span class="splash__for-word">{{ forWord }}</span>
        <em>{{ questData.client_name }}</em>
      </p>

      <!-- Статистика -->
      <div class="splash__stats">
        <div class="splash__stat">
          <span class="splash__stat-n">{{ totalBlocks }}</span>
          <span class="splash__stat-l">{{ pluralLoc(totalBlocks) }}</span>
        </div>
        <div class="splash__divider"></div>
        <div class="splash__stat">
          <span class="splash__stat-n">{{ totalTasks }}</span>
          <span class="splash__stat-l">{{ pluralTask(totalTasks) }}</span>
        </div>
        <div class="splash__divider"></div>
        <div class="splash__stat">
          <span class="splash__stat-n">{{ questData.duration_minutes || totalTasks * 5 }}</span>
          <span class="splash__stat-l">минут</span>
        </div>
      </div>

      <!-- Код доступа -->
      <div v-if="requiresCode" class="splash__code">
        <div class="splash__code-label">КОД ДОСТУПА</div>
        <div class="splash__code-row">
          <input
            v-model="codeInput"
            type="text"
            class="splash__code-input"
            :class="{ 'shake': codeError }"
            placeholder="····"
            maxlength="20"
            autocomplete="off"
            spellcheck="false"
            @keyup.enter="$emit('submit-code', codeInput)"
          />
          <button class="splash__code-btn" @click="$emit('submit-code', codeInput)">→</button>
        </div>
        <div v-if="codeError" class="splash__code-error">{{ codeError }}</div>
      </div>

      <!-- Кнопка старта -->
      <button v-else class="splash__start" @click="$emit('start')">
        <span>{{ theme.copy.startBtn }}</span>
        <div class="splash__start-shine"></div>
      </button>

      <!-- Декоративные элементы темы -->
      <div class="splash__decor" aria-hidden="true">
        <span
          v-for="(el, i) in theme.splash_decor"
          :key="i"
          class="splash__decor-item"
          :style="decorItem(i)"
        >{{ el }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  questData:    { type: Object, required: true },
  theme:        { type: Object, required: true },
  requiresCode: { type: Boolean, default: false },
  codeError:    { type: String, default: '' },
})

defineEmits(['start', 'submit-code'])

const codeInput = ref('')

const totalBlocks = computed(() => props.questData.blocks?.length || 0)
const totalTasks  = computed(() =>
  (props.questData.blocks || []).reduce((s, b) => s + (b.tasks?.length || 0), 0)
)

const forWord = computed(() => ({
  detective: 'Досье на',
  romantic:  'Для',
  mystery:   'Предназначено',
  city:      'Агент',
}[props.theme.id] || 'Для'))

const pluralLoc  = (n) => n === 1 ? 'локация' : n < 5 ? 'локации' : 'локаций'
const pluralTask = (n) => n === 1 ? 'задание' : n < 5 ? 'задания' : 'заданий'

// Генераторы случайных позиций для анимаций
const rainDrop = (n) => ({
  '--x':     (n * 2.5) % 100 + '%',
  '--delay': (n * 0.11) % 2 + 's',
  '--speed': (1.2 + (n % 5) * 0.3) + 's',
  '--len':   (60 + (n % 40)) + 'px',
})

const petal = (n) => ({
  '--x':      (n * 5.1) % 100 + '%',
  '--delay':  (n * 0.4) % 6 + 's',
  '--speed':  (4 + (n % 4)) + 's',
  '--size':   (0.8 + (n % 3) * 0.4) + 'rem',
  '--swing':  (n % 2 === 0 ? 1 : -1) * (20 + n % 30) + 'px',
})

const star = (n) => ({
  '--x':      (n * 1.7) % 100 + '%',
  '--y':      (n * 2.3) % 100 + '%',
  '--size':   (0.4 + (n % 3) * 0.3) + 'rem',
  '--delay':  (n * 0.15) % 4 + 's',
  '--speed':  (2 + (n % 3)) + 's',
  opacity:    0.2 + (n % 5) * 0.12,
})

const coin = (n) => ({
  '--x':      (n * 3.3) % 100 + '%',
  '--delay':  (n * 0.2) % 5 + 's',
  '--speed':  (3 + (n % 4)) + 's',
  '--size':   (0.9 + (n % 3) * 0.4) + 'rem',
  '--drift':  (n % 2 === 0 ? 1 : -1) * (15 + n % 25) + 'px',
  opacity:    0.5 + (n % 4) * 0.15,
})

const decorItem = (i) => ({
  '--angle': (i * 72) + 'deg',
  '--r':     (120 + (i % 2) * 30) + 'px',
})
</script>

<style scoped>
/* ── Root ─────────────────────────────────────────────────────── */
.splash {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  overflow: hidden;
  background: var(--bg);
  font-family: var(--font-b);
  color: var(--text);
}

/* ── Backgrounds ─────────────────────────────────────────────── */
.splash__bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }

/* Rain */
.splash__rain { position: absolute; inset: 0; }
.splash__raindrop {
  position: absolute;
  left: var(--x);
  top: -100px;
  width: 1px;
  height: var(--len);
  background: linear-gradient(to bottom, transparent, rgba(232,197,71,0.3));
  animation: rain var(--speed) var(--delay) linear infinite;
}
@keyframes rain { to { transform: translateY(110vh); } }

.splash__vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%);
}

/* Petals */
.splash__petal {
  position: absolute;
  left: var(--x);
  top: -40px;
  font-size: var(--size);
  animation: petal-fall var(--speed) var(--delay) ease-in infinite;
  filter: hue-rotate(0deg);
}
@keyframes petal-fall {
  0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0.8; }
  100% { transform: translateY(110vh) translateX(var(--swing)) rotate(360deg); opacity: 0; }
}

.splash__glow-warm {
  position: absolute; top: 30%; left: 50%;
  transform: translate(-50%, -50%);
  width: 600px; height: 600px; border-radius: 50%;
  background: radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 70%);
  animation: breathe 5s ease-in-out infinite;
}

/* Stars */
.splash__star {
  position: absolute;
  left: var(--x);
  top: var(--y);
  font-size: var(--size);
  color: var(--accent);
  animation: twinkle var(--speed) var(--delay) ease-in-out infinite;
}
@keyframes twinkle { 0%,100%{opacity:0.2;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.3)} }

.splash__fog {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 40% at 20% 60%, rgba(167,139,250,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 60% 30% at 80% 30%, rgba(167,139,250,0.06) 0%, transparent 50%);
  animation: fog-drift 12s ease-in-out infinite alternate;
}
@keyframes fog-drift { to { transform: translateX(30px); } }

/* Grid */
.splash__grid {
  position: absolute; inset: -50%;
  background-image:
    linear-gradient(rgba(0,245,196,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,245,196,0.04) 1px, transparent 1px);
  background-size: 56px 56px;
  transform: perspective(600px) rotateX(20deg);
  animation: grid-move 18s linear infinite;
}
@keyframes grid-move { to { transform: perspective(600px) rotateX(20deg) translateY(56px); } }

.splash__glow-neon {
  position: absolute; top: 35%; left: 50%;
  transform: translate(-50%,-50%);
  width: 500px; height: 500px; border-radius: 50%;
  background: radial-gradient(circle, rgba(0,245,196,0.1) 0%, transparent 70%);
  animation: breathe 4s ease-in-out infinite;
}

/* ── Treasure: золотые частицы ────────────────────────────────── */
.splash__coin {
  position: absolute;
  top: -2rem;
  left: var(--x);
  font-size: var(--size);
  animation: coin-fall var(--speed) var(--delay) ease-in infinite;
}
@keyframes coin-fall {
  0%   { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: .8; }
  100% { transform: translateY(110vh) translateX(var(--drift)) rotate(360deg); opacity: 0; }
}

.splash__glow-gold {
  position: absolute; top: 40%; left: 50%;
  transform: translate(-50%,-50%);
  width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(245,166,35,0.12) 0%, transparent 70%);
  animation: breathe 6s ease-in-out infinite;
}

@keyframes breathe {
  0%,100%{opacity:.6;transform:translate(-50%,-50%) scale(1)}
  50%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}
}

/* ── Body ─────────────────────────────────────────────────────── */
.splash__body {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  text-align: center; gap: 20px; max-width: 420px; width: 100%;
}

/* ── Icon ─────────────────────────────────────────────────────── */
.splash__icon-wrap {
  position: relative; width: 100px; height: 100px;
  display: flex; align-items: center; justify-content: center;
  animation: float 3.5s ease-in-out infinite;
}
@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

.splash__icon { font-size: 3rem; }

.splash__ring {
  position: absolute; inset: 0; border-radius: 50%;
  border: 1.5px solid var(--accent);
  box-shadow: 0 0 20px var(--accent);
  animation: spin-slow 10s linear infinite;
}
@keyframes spin-slow { to { transform: rotate(360deg); } }

/* ── Text ─────────────────────────────────────────────────────── */
.splash__eyebrow {
  font-family: var(--font-d);
  font-size: 0.58rem; letter-spacing: 0.38em;
  color: var(--accent);
  text-shadow: 0 0 12px var(--accent);
  text-transform: uppercase;
}

.splash__title {
  font-family: var(--font-d);
  font-size: clamp(1.5rem, 6.5vw, 2.2rem);
  font-weight: 900; color: #fff; margin: 0; line-height: 1.15;
  text-shadow: 0 0 40px color-mix(in srgb, var(--accent) 30%, transparent);
}

/* Тема романтик: курсивный заголовок */
.splash--romantic .splash__title {
  font-weight: 700;
  letter-spacing: 0.01em;
}

/* Тема мистика: заглавные буквы */
.splash--mystery .splash__title {
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.splash__for { font-size: 1rem; color: var(--dim); margin: 0; }
.splash__for-word { margin-right: 4px; }
.splash__for em { color: var(--text); font-style: normal; font-weight: 600; }

/* Детектив: имя как в досье */
.splash--detective .splash__for em {
  font-family: var(--font-d);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-bottom: 1px solid var(--accent);
}

/* ── Stats ────────────────────────────────────────────────────── */
.splash__stats {
  display: flex; align-items: center; gap: 12px;
  background: var(--surf);
  border: 1px solid var(--bord);
  border-radius: 12px; padding: 14px 20px;
}
.splash__stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.splash__stat-n { font-family: var(--font-d); font-size: 1.4rem; font-weight: 700; color: var(--accent); text-shadow: 0 0 10px var(--accent); }
.splash__stat-l { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--dim); }
.splash__divider { width: 1px; height: 30px; background: var(--bord); }

/* ── Code input ───────────────────────────────────────────────── */
.splash__code { width: 100%; display: flex; flex-direction: column; gap: 8px; }
.splash__code-label { font-family: var(--font-d); font-size: 0.5rem; letter-spacing: 0.35em; color: var(--dim); text-align: left; }
.splash__code-row { display: flex; gap: 8px; }
.splash__code-input {
  flex: 1; background: var(--surf); border: 1px solid var(--bord); border-radius: 8px;
  padding: 12px 16px; color: #fff; font-family: var(--font-d); font-size: 1.1rem;
  letter-spacing: 0.3em; text-align: center; outline: none; transition: border-color .2s;
}
.splash__code-input:focus { border-color: var(--accent); }
.splash__code-btn { background: var(--accent); border: none; border-radius: 8px; color: #000; width: 48px; font-size: 1.2rem; cursor: pointer; font-weight: 700; }
.splash__code-error { font-size: 0.78rem; color: #f87171; }

/* ── Start button ─────────────────────────────────────────────── */
.splash__start {
  position: relative; overflow: hidden;
  background: transparent;
  border: 1.5px solid var(--accent);
  border-radius: 10px;
  padding: 16px 48px;
  color: var(--accent);
  font-family: var(--font-d); font-size: 0.9rem; font-weight: 700;
  letter-spacing: 0.18em; cursor: pointer;
  text-shadow: 0 0 10px var(--accent);
  box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 18%, transparent);
  transition: all .3s;
}
.splash__start:hover {
  background: var(--accent); color: #000; text-shadow: none;
  box-shadow: 0 0 40px color-mix(in srgb, var(--accent) 50%, transparent);
  transform: translateY(-2px);
}

/* Романтик: закруглённая кнопка */
.splash--romantic .splash__start {
  border-radius: 50px;
  letter-spacing: 0.05em;
  font-family: var(--font-b);
  font-size: 1.05rem;
}

/* Мистика: широкая рамка */
.splash--mystery .splash__start {
  border-width: 2px;
  letter-spacing: 0.25em;
}

.splash__start-shine {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent) 20%, transparent), transparent 70%);
  opacity: 0; transition: opacity .3s;
}
.splash__start:hover .splash__start-shine { opacity: 1; }

/* ── Decor items ──────────────────────────────────────────────── */
.splash__decor {
  position: absolute; top: 50%; left: 50%;
  width: 0; height: 0; pointer-events: none;
  z-index: -1;
}
.splash__decor-item {
  position: absolute;
  transform: rotate(var(--angle)) translateY(calc(-1 * var(--r)));
  font-size: 1.2rem;
  opacity: 0.12;
  animation: decor-pulse 4s ease-in-out infinite;
  animation-delay: calc(var(--angle) * 3s / 360);
}
@keyframes decor-pulse { 0%,100%{opacity:.08;transform:rotate(var(--angle)) translateY(calc(-1 * var(--r))) scale(.9)} 50%{opacity:.2;transform:rotate(var(--angle)) translateY(calc(-1 * var(--r))) scale(1.1)} }

/* ── Shake ────────────────────────────────────────────────────── */
.shake { animation: shake .4s ease; }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }

/* ── Mobile ───────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .splash { padding: 32px 16px; }
  .splash__icon-wrap { width: 80px; height: 80px; }
  .splash__icon { font-size: 2.4rem; }
  .splash__title { font-size: clamp(1.3rem, 6vw, 1.8rem); }
  .splash__stats { padding: 12px 14px; gap: 10px; }
  .splash__stat-n { font-size: 1.2rem; }
  .splash__start { padding: 16px 36px; font-size: .85rem; min-height: 52px; }
  .splash__code-input { padding: 14px; font-size: 1rem; min-height: 52px; }
  .splash__code-btn { min-height: 52px; width: 52px; }
}
</style>