<template>
  <div class="finish" :class="`finish--${theme.id}`">

    <!-- Частицы -->
    <div class="finish__particles" aria-hidden="true">
      <span
        v-for="n in 20"
        :key="n"
        class="finish__particle"
        :style="particle(n)"
      ></span>
    </div>

    <div class="finish__body">

      <!-- Иконка успеха (зависит от темы) -->
      <div class="finish__trophy">{{ trophyIcon }}</div>

      <div class="finish__eyebrow">{{ theme.copy.finishEyebrow }}</div>
      <h2 class="finish__title">{{ questData.title }}</h2>

      <!-- Статы -->
      <div class="finish__grid">
        <div class="finish__cell">
          <div
            v-motion
            :initial="{ scale: 0.4, opacity: 0 }"
            :enter="{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 18, delay: 300 } }"
            class="finish__n"
          >{{ points }}</div>
          <div class="finish__l">{{ theme.copy.pointsLabel }}</div>
        </div>
        <div class="finish__cell">
          <div
            v-motion
            :initial="{ scale: 0.4, opacity: 0 }"
            :enter="{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 18, delay: 450 } }"
            class="finish__n"
          >{{ completedCount }}</div>
          <div class="finish__l">заданий</div>
        </div>
        <div class="finish__cell">
          <div
            v-motion
            :initial="{ scale: 0.4, opacity: 0 }"
            :enter="{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 18, delay: 600 } }"
            class="finish__n"
          >{{ elapsed }}</div>
          <div class="finish__l">времени</div>
        </div>
      </div>

      <!-- Финальное послание -->
      <div v-if="questData.final_message" class="finish__message">
        <div class="finish__message-label">{{ messageLabel }}</div>
        <p class="finish__message-text">{{ questData.final_message }}</p>
      </div>

      <!-- Кнопка поделиться -->
      <button class="finish__share finish__share--primary" @click="$emit('share')">
        {{ theme.copy.shareBtn }}
      </button>

      <!-- Кнопка начать сначала -->
      <button class="finish__restart" @click="$emit('restart')">
        🔄 Пройти ещё раз
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  questData:      { type: Object, required: true },
  theme:          { type: Object, required: true },
  points:         { type: Number, default: 0 },
  completedCount: { type: Number, default: 0 },
  elapsed:        { type: String, default: '0:00' },
})

defineEmits(['share', 'restart'])

const trophyIcon = computed(() => ({
  detective: '🗂️',
  romantic:  '💝',
  mystery:   '🔮',
  city:      '🏆',
}[props.theme.id] || '🏆'))

const messageLabel = computed(() => ({
  detective: 'Личное послание',
  romantic:  'Слова для тебя',
  mystery:   'Последнее пророчество',
  city:      'Личное сообщение',
}[props.theme.id] || 'Послание'))

const particle = (n) => ({
  '--x':  (n * 5.1) % 100 + '%',
  '--y':  (n * 3.7) % 100 + '%',
  '--s':  (4 + n % 6) + 'px',
  '--d':  (n * 0.2) % 2 + 's',
  '--t':  (2 + n % 3) + 's',
  background: props.theme.accent,
})
</script>

<style scoped>
.finish {
  position: fixed; inset: 0; z-index: 200;
  background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  padding: 32px 20px; overflow: hidden;
  font-family: var(--font-b);
}

/* ── Particles ────────────────────────────────────────────────── */
.finish__particles { position: absolute; inset: 0; pointer-events: none; }
.finish__particle {
  position: absolute; left: var(--x); top: var(--y);
  width: var(--s); height: var(--s); border-radius: 2px;
  opacity: 0;
  animation: confetti-fall var(--t) var(--d) ease-in both;
}
@keyframes confetti-fall {
  0%   { opacity: 0; transform: translateY(-30px) rotate(0deg); }
  15%  { opacity: 1; }
  85%  { opacity: .6; }
  100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
}

/* ── Body ─────────────────────────────────────────────────────── */
.finish__body {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  text-align: center; gap: 20px; max-width: 420px; width: 100%;
}

/* ── Trophy ───────────────────────────────────────────────────── */
.finish__trophy {
  font-size: 5rem;
  animation: trophy-in .6s cubic-bezier(.34,1.56,.64,1) both;
  filter: drop-shadow(0 0 20px var(--accent));
}
@keyframes trophy-in { from { transform: scale(0) rotate(-15deg); } to { transform: scale(1) rotate(0); } }

.finish__eyebrow {
  font-family: var(--font-d); font-size: .55rem;
  letter-spacing: .38em; color: var(--accent);
  text-shadow: 0 0 10px var(--accent);
  text-transform: uppercase;
}

.finish__title {
  font-family: var(--font-d);
  font-size: clamp(1.2rem, 5.5vw, 1.8rem);
  font-weight: 900; color: #fff; margin: 0; line-height: 1.2;
}

/* Романтик: курсив */
.finish--romantic .finish__title { font-weight: 700; }

/* ── Stats grid ───────────────────────────────────────────────── */
.finish__grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 2px; background: var(--bord);
  border: 1px solid var(--bord); border-radius: 12px;
  overflow: hidden; width: 100%;
}
.finish__cell { background: var(--surf); padding: 14px 8px; text-align: center; }
.finish__n { font-family: var(--font-d); font-size: 1.5rem; font-weight: 900; color: var(--accent); text-shadow: 0 0 10px var(--accent); }
.finish__l { font-size: .62rem; color: var(--dim); text-transform: uppercase; letter-spacing: .1em; margin-top: 3px; }

/* ── Message ──────────────────────────────────────────────────── */
.finish__message {
  background: var(--surf); border: 1px solid var(--bord);
  border-left: 3px solid var(--accent); border-radius: 10px;
  padding: 18px 20px; width: 100%; text-align: left;
}
.finish__message-label { font-size: .6rem; text-transform: uppercase; letter-spacing: .2em; color: var(--accent); margin-bottom: 8px; }
.finish__message-text { font-size: .95rem; line-height: 1.65; color: var(--text); margin: 0; font-style: italic; }

/* Романтик: особый стиль послания */
.finish--romantic .finish__message {
  background: linear-gradient(135deg, rgba(244,114,182,.06), rgba(0,0,0,0));
  border-left-color: var(--accent);
}
.finish--romantic .finish__message-text {
  font-family: var(--font-d); font-size: 1.1rem; line-height: 1.7;
}

/* ── Share ────────────────────────────────────────────────────── */
.finish__share--primary {
  background: var(--accent);
  border: none;
  border-radius: 14px;
  padding: 0 28px;
  min-height: 52px;
  color: #000;
  font-family: var(--font-b);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: all .2s ease;
  box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 40%, transparent);
}
.finish__share--primary:hover {
  box-shadow: 0 0 36px color-mix(in srgb, var(--accent) 60%, transparent);
  transform: translateY(-2px);
}

.finish__restart {
  background: transparent;
  border: 1px dashed rgba(255,255,255,.2);
  border-radius: 12px;
  padding: 12px 20px;
  color: var(--dim);
  font-family: var(--font-b);
  font-size: .85rem;
  cursor: pointer;
  transition: all .25s;
  opacity: .7;
  width: 100%;
}
.finish__restart:hover { opacity: 1; border-color: var(--dim); color: var(--text); }

/* ── Mobile ──────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .finish { padding: 24px 16px; }
  .finish__trophy { font-size: 4rem; }
  .finish__title { font-size: clamp(1rem, 5vw, 1.5rem); }
  .finish__grid { grid-template-columns: repeat(3, 1fr); }
  .finish__n { font-size: 1.2rem; }
  .finish__message { padding: 14px 16px; }
  .finish__message-text { font-size: .88rem; }
  .finish__share--primary { min-height: 56px; font-size: .95rem; }
}
</style>