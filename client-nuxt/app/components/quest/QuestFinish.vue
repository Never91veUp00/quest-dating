<template>
  <div class="finish" :class="`finish--${theme.id}`">

    <!-- Частицы -->
    <div class="finish__particles" aria-hidden="true">
      <span v-for="n in 20" :key="n" class="finish__particle" :style="particle(n)"></span>
    </div>

    <div class="finish__body">

      <!-- Иконка успеха -->
      <div class="finish__trophy">{{ trophyIcon }}</div>

      <div class="finish__eyebrow">{{ theme.copy.finishEyebrow }}</div>
      <h2 class="finish__title">{{ questData.title }}</h2>

      <!-- Статы -->
      <div class="finish__grid">
        <div class="finish__cell">
          <div class="finish__n">{{ points }}</div>
          <div class="finish__l">{{ theme.copy.pointsLabel }}</div>
        </div>
        <div class="finish__cell">
          <div class="finish__n">{{ completedCount }}</div>
          <div class="finish__l">заданий</div>
        </div>
        <div class="finish__cell">
          <div class="finish__n">{{ elapsed }}</div>
          <div class="finish__l">времени</div>
        </div>
      </div>

      <!-- Карточка с селфи -->
      <div v-if="selfieUrl" class="finish__card" :class="`finish__card--${frameLevel}`">
        <div class="finish__card__frame">
          <img :src="selfieUrl" alt="Твоё фото" class="finish__card__photo" />
          <div class="finish__card__frame-inner"></div>
        </div>
        <div class="finish__card__badge">
          <span class="finish__card__badge-icon">{{ frameBadge }}</span>
          <span class="finish__card__badge-label">{{ frameLabel }}</span>
        </div>
      </div>

      <!-- Финальное послание -->
      <div v-if="questData.final_message" class="finish__message">
        <div class="finish__message-label">{{ messageLabel }}</div>
        <p class="finish__message-text">{{ questData.final_message }}</p>
      </div>

      <!-- Кнопки -->
      <button v-if="selfieUrl" class="finish__share finish__share--primary"
        :disabled="saving" @click="saveCard">
        {{ saving ? 'Создаём карточку…' : '📸 Получить фото в Telegram' }}
      </button>
      <div v-if="cardError" class="finish__card-error">{{ cardError }}</div>
      <button class="finish__share" @click="$emit('share')">
        Поделиться результатом
      </button>

      <button class="finish__restart" @click="$emit('restart')">
        🔄 Пройти ещё раз
      </button>
    </div>

    <!-- Скрытый canvas для генерации карточки -->
    <canvas ref="cardCanvas" style="display:none"></canvas>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  questData:      { type: Object, required: true },
  theme:          { type: Object, required: true },
  points:         { type: Number, default: 0 },
  maxPoints:      { type: Number, default: 100 },
  selfieUrl:      { type: String, default: null },
  completedCount: { type: Number, default: 0 },
  elapsed:        { type: String, default: '0:00' },
})

defineEmits(['share', 'restart'])

const cardCanvas = ref(null)
const saving     = ref(false)
const cardError  = ref('')

const trophyIcon = computed(() => ({
  detective: '🗂️', romantic: '💝', mystery: '🔮', city: '🏆',
}[props.theme.id] || '🏆'))

const messageLabel = computed(() => ({
  detective: 'Личное послание', romantic: 'Слова для тебя',
  mystery: 'Последнее пророчество', city: 'Личное сообщение',
}[props.theme.id] || 'Послание'))

const ratio      = computed(() => props.maxPoints > 0 ? props.points / props.maxPoints : 0)
const frameLevel = computed(() => {
  if (ratio.value >= 0.8) return 'gold'
  if (ratio.value >= 0.4) return 'silver'
  return 'bronze'
})
const frameBadge = computed(() => ({ gold: '⭐', silver: '🥈', bronze: '🥉' }[frameLevel.value]))
const frameLabel = computed(() => ({
  gold:   'Звёздный результат!',
  silver: 'Отличный результат!',
  bronze: 'Первое прохождение!',
}[frameLevel.value]))

const particle = (n) => ({
  '--x':  (n * 5.1) % 100 + '%',
  '--y':  (n * 3.7) % 100 + '%',
  '--s':  (4 + n % 6) + 'px',
  '--d':  (n * 0.2) % 2 + 's',
  '--t':  (2 + n % 3) + 's',
  background: props.theme.accent,
})

// ── Canvas card generation ────────────────────────────────────────
const FRAME_COLORS = { gold: '#FFD700', silver: '#A8C4D4', bronze: '#C8A26E' }

const saveCard = async () => {
  if (saving.value) return
  saving.value = true
  cardError.value = ''

  // Открываем окно синхронно — iOS Safari блокирует window.open() внутри async-колбэков
  const tgWindow = window.open('about:blank', '_blank')

  try {
    const W = 800, H = 1060
    const canvas = cardCanvas.value
    canvas.width  = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#0d0d14'
    ctx.fillRect(0, 0, W, H)

    // Accent gradient
    const grad = ctx.createLinearGradient(0, 0, W, H * 0.55)
    grad.addColorStop(0, props.theme.accent + '30')
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    const frameColor = FRAME_COLORS[frameLevel.value]
    const photoR = 220
    const photoX = W / 2
    const photoY = 350

    // Selfie in circle
    const img = new Image()
    img.src = props.selfieUrl
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej })

    ctx.save()
    ctx.beginPath()
    ctx.arc(photoX, photoY, photoR, 0, Math.PI * 2)
    ctx.clip()
    const scale = Math.max((photoR * 2) / img.naturalWidth, (photoR * 2) / img.naturalHeight)
    const dw = img.naturalWidth * scale
    const dh = img.naturalHeight * scale
    ctx.drawImage(img, photoX - dw / 2, photoY - dh / 2, dw, dh)
    ctx.restore()

    // Gold outer glow ring
    if (frameLevel.value === 'gold') {
      ctx.beginPath()
      ctx.arc(photoX, photoY, photoR + 12, 0, Math.PI * 2)
      ctx.strokeStyle = '#FFD70050'
      ctx.lineWidth = 10
      ctx.stroke()
    }
    // Main frame ring
    ctx.beginPath()
    ctx.arc(photoX, photoY, photoR + 4, 0, Math.PI * 2)
    ctx.strokeStyle = frameColor
    ctx.lineWidth = 7
    ctx.stroke()

    // Quest title
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 38px system-ui, sans-serif'
    ctx.fillText(props.questData.title, W / 2, photoY + photoR + 66)

    // Points value
    ctx.font = 'bold 80px system-ui, sans-serif'
    ctx.fillStyle = props.theme.accent
    ctx.fillText(String(props.points), W / 2, photoY + photoR + 156)

    ctx.font = '28px system-ui, sans-serif'
    ctx.fillStyle = props.theme.accent + 'bb'
    ctx.fillText(props.theme.copy.pointsLabel, W / 2, photoY + photoR + 196)

    // Frame badge
    ctx.font = '30px system-ui, sans-serif'
    ctx.fillStyle = frameColor
    ctx.fillText(frameBadge.value + ' ' + frameLabel.value, W / 2, photoY + photoR + 260)

    // Watermark
    ctx.font = '22px system-ui, sans-serif'
    ctx.fillStyle = '#ffffff30'
    ctx.fillText('Quest Dating', W / 2, H - 36)

    // Конвертируем canvas в blob (промисифицируем для await)
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png', 0.92)
    })

    const res = await fetch('/api/telegram/card', {
      method:  'POST',
      headers: { 'Content-Type': 'image/png' },
      body:    blob,
    })
    if (!res.ok) throw new Error(`${res.status}`)
    const { token } = await res.json()

    // Перенаправляем уже открытое окно — работает на iOS
    if (tgWindow) tgWindow.location.href = `https://t.me/QUESTDATING_BOT?start=card_${token}`

  } catch {
    if (tgWindow) tgWindow.close()
    cardError.value = 'Не удалось загрузить карточку — попробуй ещё раз'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.finish {
  position: fixed; inset: 0; z-index: 200;
  background: var(--bg);
  display: flex; align-items: center; justify-content: center;
  padding: 32px 20px; overflow: hidden;
  font-family: var(--font-b);
}

/* ── Particles ─────────────────────────────────────────────────── */
.finish__particles { position: absolute; inset: 0; pointer-events: none; }
.finish__particle {
  position: absolute; left: var(--x); top: var(--y);
  width: var(--s); height: var(--s); border-radius: 2px; opacity: 0;
  animation: confetti-fall var(--t) var(--d) ease-in both;
}
@keyframes confetti-fall {
  0%   { opacity: 0; transform: translateY(-30px) rotate(0deg); }
  15%  { opacity: 1; }
  85%  { opacity: .6; }
  100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
}

/* ── Body ──────────────────────────────────────────────────────── */
.finish__body {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  text-align: center; gap: 16px; max-width: 420px; width: 100%;
  max-height: 100dvh; overflow-y: auto;
  padding-bottom: max(40px, env(safe-area-inset-bottom, 0px) + 24px);
}

/* ── Trophy ────────────────────────────────────────────────────── */
.finish__trophy {
  font-size: 4.5rem;
  animation: trophy-in .6s cubic-bezier(.34,1.56,.64,1) both;
  filter: drop-shadow(0 0 20px var(--accent));
}
@keyframes trophy-in { from { transform: scale(0) rotate(-15deg); } to { transform: scale(1) rotate(0); } }

.finish__eyebrow {
  font-family: var(--font-d); font-size: .55rem;
  letter-spacing: .38em; color: var(--accent);
  text-shadow: 0 0 10px var(--accent); text-transform: uppercase;
}
.finish__title {
  font-family: var(--font-d); font-size: clamp(1.1rem, 5vw, 1.6rem);
  font-weight: 900; color: #fff; margin: 0; line-height: 1.2;
}
.finish--romantic .finish__title { font-weight: 700; }

/* ── Stats ─────────────────────────────────────────────────────── */
.finish__grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 1px; background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.12); border-radius: 14px;
  overflow: hidden; width: 100%;
}
.finish__cell { background: rgba(255,255,255,.05); padding: 14px 8px; text-align: center; }
.finish__n { font-family: var(--font-d); font-size: 1.5rem; font-weight: 900; color: var(--accent); text-shadow: 0 0 12px var(--accent); }
.finish__l { font-size: .6rem; color: rgba(255,255,255,.5); text-transform: uppercase; letter-spacing: .1em; margin-top: 4px; }

/* ── Selfie card ───────────────────────────────────────────────── */
.finish__card {
  width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.finish__card__frame {
  position: relative; border-radius: 50%; overflow: hidden;
  width: 160px; height: 160px; flex-shrink: 0;
}
.finish__card__photo { width: 100%; height: 100%; object-fit: cover; display: block; }
.finish__card__frame-inner {
  position: absolute; inset: 0; border-radius: 50%; pointer-events: none;
}

.finish__card--bronze .finish__card__frame-inner {
  box-shadow: inset 0 0 0 4px #C8A26E, 0 0 16px #C8A26E44;
}
.finish__card--silver .finish__card__frame-inner {
  box-shadow: inset 0 0 0 4px #A8C4D4, 0 0 20px #A8C4D466;
}
.finish__card--gold .finish__card__frame-inner {
  box-shadow: inset 0 0 0 5px #FFD700, 0 0 28px #FFD70066, 0 0 56px #FFD70033;
  animation: gold-pulse 2s ease-in-out infinite;
}
@keyframes gold-pulse {
  0%, 100% { box-shadow: inset 0 0 0 5px #FFD700, 0 0 28px #FFD70066, 0 0 56px #FFD70033; }
  50%       { box-shadow: inset 0 0 0 5px #FFD700, 0 0 44px #FFD700aa, 0 0 80px #FFD70055; }
}

.finish__card__badge {
  display: flex; align-items: center; gap: 6px; font-size: .82rem; font-weight: 600;
}
.finish__card--bronze .finish__card__badge { color: #C8A26E; }
.finish__card--silver .finish__card__badge { color: #A8C4D4; }
.finish__card--gold   .finish__card__badge { color: #FFD700; }
.finish__card__badge-icon { font-size: 1.1rem; }

/* ── Message ───────────────────────────────────────────────────── */
.finish__message {
  background: var(--surf); border: 1px solid var(--bord);
  border-left: 3px solid var(--accent); border-radius: 10px;
  padding: 14px 16px; width: 100%; text-align: left;
}
.finish__message-label { font-size: .6rem; text-transform: uppercase; letter-spacing: .2em; color: var(--accent); margin-bottom: 6px; }
.finish__message-text { font-size: .9rem; line-height: 1.6; color: var(--text); margin: 0; font-style: italic; }
.finish--romantic .finish__message {
  background: linear-gradient(135deg, rgba(244,114,182,.06), rgba(0,0,0,0));
}
.finish--romantic .finish__message-text { font-family: var(--font-d); font-size: 1rem; line-height: 1.65; }

/* ── Buttons ───────────────────────────────────────────────────── */
.finish__share {
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.14);
  border-radius: 14px; padding: 0 28px; min-height: 48px; color: rgba(255,255,255,.8);
  font-family: var(--font-b); font-size: .9rem; font-weight: 600;
  cursor: pointer; width: 100%; transition: all .2s ease;
}
.finish__share:hover { border-color: rgba(255,255,255,.3); color: #fff; }

.finish__share--primary {
  background: var(--accent); border: none; border-radius: 14px;
  padding: 0 28px; min-height: 52px; color: #000;
  font-family: var(--font-b); font-size: 1rem; font-weight: 700;
  cursor: pointer; width: 100%;
  box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 40%, transparent);
  transition: all .2s ease;
}
.finish__share--primary:hover:not(:disabled) {
  box-shadow: 0 0 36px color-mix(in srgb, var(--accent) 60%, transparent);
  transform: translateY(-2px);
}
.finish__share--primary:disabled { opacity: .6; cursor: default; }

.finish__card-error {
  font-size: .8rem; color: #fc8181; text-align: center; padding: 4px 0;
}

.finish__restart {
  background: transparent; border: 1.5px solid rgba(255,255,255,.28);
  border-radius: 12px; padding: 12px 20px;
  color: rgba(255,255,255,.5); font-family: var(--font-b);
  font-size: .85rem; cursor: pointer; transition: all .25s; width: 100%;
  box-sizing: border-box;
}
.finish__restart:hover { border-color: rgba(255,255,255,.55); color: rgba(255,255,255,.9); }

/* ── Mobile ────────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .finish { padding: 20px 16px; align-items: flex-start; }
  .finish__body { gap: 12px; }
  .finish__trophy { font-size: 3.5rem; }
  .finish__title { font-size: clamp(1rem, 5vw, 1.4rem); }
  .finish__n { font-size: 1.2rem; }
  .finish__card__frame { width: 140px; height: 140px; }
  .finish__message { padding: 12px 14px; }
  .finish__message-text { font-size: .85rem; }
  .finish__share--primary { min-height: 50px; font-size: .95rem; }
}
</style>
