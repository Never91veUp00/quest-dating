<template>
  <div class="finish" :class="decor && `finish--${decor}`">
    <div class="finish__inner">
      <header class="finish__head">
        <h2 class="finish__title">{{ finishTitle }}</h2>
        <p class="finish__sub">{{ questData.title }}</p>
      </header>

      <p class="finish__facts">
        <span><b>{{ points }}</b> {{ pointsWord(theme, points) }}</span>
        <span><b>{{ completedCount }}</b> {{ plural(completedCount, 'клетка пройдена', 'клетки пройдены', 'клеток пройдено') }}</span>
        <span>за <b>{{ elapsed }}</b></span>
      </p>

      <!-- Послание автора — последняя карта игры -->
      <article v-if="questData.final_message" class="finish__message">
        <template v-if="decor === 'casefile'">
          <span class="finish__tape finish__tape--l" aria-hidden="true"></span>
          <span class="finish__tape finish__tape--r" aria-hidden="true"></span>
          <span class="finish__stamp" aria-hidden="true">Раскрыто</span>
        </template>
        <template v-else-if="decor === 'metro'">
          <span class="finish__perf" aria-hidden="true"></span>
          <!-- Талон пробит на каждой пройденной станции -->
          <span class="finish__holes" aria-hidden="true"><i v-for="n in Math.min(completedCount, 12)" :key="n"></i></span>
        </template>
        <template v-else-if="decor === 'letters'">
          <span class="finish__flap" aria-hidden="true"></span>
          <span class="finish__postmark" aria-hidden="true">
            <QuestPostmark :size="64" :no="deliveredOn" :seed="11" />
          </span>
        </template>
        <h3 class="finish__message-label">{{ messageLabel }}</h3>
        <p class="finish__message-text">{{ questData.final_message }}</p>
      </article>

      <!-- Селфи с прохождения -->
      <figure v-if="selfieUrl" class="finish__card" :class="`finish__card--${frameLevel}`">
        <img :src="selfieUrl" alt="Твоё фото с квеста" class="finish__card__photo" />
        <figcaption class="finish__card__label">{{ frameLabel }}</figcaption>
      </figure>

      <div class="finish__actions">
        <button v-if="selfieUrl" class="task__action" :disabled="saving" @click="saveCard">
          {{ saving ? 'Создаём карточку…' : 'Получить фото в Telegram' }}
        </button>
        <p v-if="cardError" class="finish__card-error" role="alert">{{ cardError }}</p>
        <button class="task__action" :class="{ 'finish__secondary': selfieUrl }" @click="$emit('share')">
          Поделиться результатом
        </button>
        <button class="finish__restart" @click="$emit('restart')">
          <QuestIcon name="restart" :size="18" />
          Пройти ещё раз
        </button>
      </div>
    </div>

    <!-- Скрытый canvas для генерации карточки -->
    <canvas ref="cardCanvas" style="display:none"></canvas>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import QuestIcon from './QuestIcon.vue'
import QuestPostmark from './QuestPostmark.vue'
import { plural, pointsWord } from './themes.js'

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

// Заголовок финала: язык темы, без эмодзи
const finishTitle = computed(() =>
  (props.theme.copy?.finishEyebrow || 'Квест пройден').replace(/\p{Extended_Pictographic}/gu, '').trim()
)
const decor = computed(() => props.theme.world?.decor ?? null)
// Дата в штемпеле — день, когда письмо дошло до адресата
const deliveredOn = ref('')
onMounted(() => { deliveredOn.value = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) })

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

    // Мир «Ходилки»: сплошное поле темы, без градиента
    ctx.fillStyle = props.theme.world?.field ?? props.theme.bg ?? '#1d1a17'
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
    ctx.fillText(pointsWord(props.theme, props.points), W / 2, photoY + photoR + 196)

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
  min-height: 100dvh;
  background: var(--field);
  color: var(--field-ink);
  padding: 48px 16px max(28px, env(safe-area-inset-bottom));
}
.finish__inner {
  max-width: 560px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 24px;
}

.finish__title {
  margin: 0;
  font-family: var(--font-d);
  font-weight: 400;
  font-size: clamp(1.9rem, 9vw, 3.2rem);
  line-height: 1.02;
  hyphens: auto;
  overflow-wrap: break-word;
  letter-spacing: -0.01em;
  text-wrap: balance;
}
.finish__sub {
  margin: 12px 0 0;
  font-family: var(--font-b);
  font-size: 1.15rem;
  color: var(--field-ink-soft);
}

.finish__facts {
  display: flex; flex-wrap: wrap; gap: 6px 18px;
  margin: 0;
  font-family: var(--font-b);
  font-size: 1.1rem;
  font-variant-numeric: tabular-nums;
}
.finish__facts b { font-family: var(--font-d); font-weight: 400; font-size: 1.35rem; }

/* ── Послание: последняя карта ────────────────────────────────── */
.finish__message {
  position: relative;
  background: var(--paper);
  color: var(--ink);
  border: 3px solid var(--rule);
  border-bottom-width: 7px;
  border-radius: 14px;
  padding: 22px 20px 26px;
  box-shadow: 0 18px 26px -16px color-mix(in srgb, var(--rule) 80%, transparent);
  animation: card-drop .7s cubic-bezier(.16, 1, .3, 1) .2s both;
}
@keyframes card-drop {
  from { opacity: 0; transform: translateY(-24px) rotate(-3deg); }
  to   { opacity: 1; transform: none; }
}
.finish__message-label {
  margin: 0 0 12px;
  font-family: var(--font-d);
  font-weight: 400;
  font-size: 1.3rem;
}
.finish__message-text {
  margin: 0;
  font-family: var(--font-b);
  font-size: 1.15rem;
  line-height: 1.6;
  white-space: pre-line;
}

.finish--casefile .finish__message { border: none; border-radius: 3px; padding-top: 30px; }
.finish__tape {
  position: absolute; top: -10px;
  width: 78px; height: 24px;
  background: color-mix(in srgb, var(--paper-edge) 70%, transparent);
}
.finish__tape--l { left: 14px; transform: rotate(-7deg); }
.finish__tape--r { right: 14px; transform: rotate(6deg); }
.finish__stamp {
  position: absolute; right: 14px; bottom: -14px;
  padding: 5px 12px;
  background: var(--paper);
  border: 3px double var(--chip);
  border-radius: 6px;
  color: var(--chip);
  font-family: var(--font-d);
  font-size: 1.05rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  transform: rotate(-8deg);
}

/* Обличье схемы: конечная — талон, пробитый на всех станциях */
.finish--metro .finish__title { font-weight: 700; }
.finish--metro .finish__message {
  border: none;
  border-radius: 6px;
  padding-top: 46px;
  box-shadow:
    inset 0 12px 0 var(--chip),
    0 18px 26px -16px color-mix(in srgb, var(--rule) 55%, transparent);
}
.finish--metro .finish__message::before,
.finish--metro .finish__message::after {
  content: "";
  position: absolute; top: 18px;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: var(--field);
}
.finish--metro .finish__message::before { left: -8px; }
.finish--metro .finish__message::after  { right: -8px; }
.finish__perf {
  position: absolute; left: 14px; right: 14px; top: 25px;
  border-top: 2px dashed color-mix(in srgb, var(--ink) 35%, var(--paper));
}
.finish__holes {
  position: absolute; right: 18px; top: 32px;
  display: flex; gap: 5px;
}
.finish__holes i {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--field);
  box-shadow: inset 0 1px 1px color-mix(in srgb, var(--rule) 45%, transparent);
}
.finish__holes i:nth-child(even) { transform: translateY(5px); }

/* Обличье переписки: последнее письмо, погашенное штемпелем «Доставлено» */
.finish--letters .finish__message { border: none; border-radius: 2px; margin-top: 10px; padding-top: 26px; }
.finish--letters .finish__message-label {
  font-family: var(--font-h);
  font-weight: 400;
  font-size: 1.6rem;
  padding-right: 92px;
}
.finish__flap {
  position: absolute; left: 50%; bottom: 100%;
  width: 62%; height: 18px;
  transform: translateX(-50%);
  background: var(--paper-edge);
  clip-path: polygon(0 100%, 50% 0, 100% 100%);
}
.finish__postmark {
  position: absolute; right: -6px; top: -18px;
  transform: rotate(-9deg);
  animation: postmark-hit .3s cubic-bezier(.7, 0, .84, 0) .9s both;
}
@keyframes postmark-hit {
  from { opacity: 0; transform: scale(1.5) rotate(-16deg); }
  70%  { opacity: 1; transform: scale(.96) rotate(-8deg); }
  to   { opacity: 1; transform: scale(1) rotate(-9deg); }
}
@media (prefers-reduced-motion: reduce) {
  .finish__postmark { animation: none; }
}

/* ── Селфи: полароид ──────────────────────────────────────────── */
.finish__card {
  align-self: center;
  width: min(100%, 300px);
  margin: 0;
  padding: 12px 12px 14px;
  background: var(--paper);
  color: var(--ink);
  border-radius: 4px;
  transform: rotate(-2deg);
  box-shadow: 0 18px 26px -16px color-mix(in srgb, var(--rule) 85%, transparent);
}
.finish__card__photo { display: block; width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 2px; }
.finish__card__label {
  margin-top: 10px;
  font-family: var(--font-d);
  font-size: 1rem;
  text-align: center;
}

/* ── Действия ─────────────────────────────────────────────────── */
.finish__actions { display: flex; flex-direction: column; gap: 12px; }
.finish__actions .task__action:focus-visible { outline-color: var(--field-ink); }
.finish__secondary {
  background: transparent;
  color: var(--field-ink);
  border: 3px solid var(--field-ink);
}
.finish__secondary:hover:not(:disabled) { background: color-mix(in srgb, var(--field-ink) 12%, var(--field)); }
.finish__restart {
  align-self: center;
  display: inline-flex; align-items: center; gap: 8px;
  min-height: 48px;
  padding: 0 8px;
  background: none; border: none;
  color: var(--field-ink-soft);
  font-family: var(--font-b);
  font-size: 1rem;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}
.finish__restart:hover { color: var(--field-ink); }
.finish__restart:focus-visible { outline: 3px solid var(--field-ink); outline-offset: 2px; border-radius: 6px; }
.finish__card-error {
  margin: 0;
  padding: 10px 14px;
  background: var(--paper);
  color: var(--wrong);
  border-radius: 10px;
  font-family: var(--font-b);
}

@media (prefers-reduced-motion: reduce) {
  .finish__message { animation: none; }
}
</style>
