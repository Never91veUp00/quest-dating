<template>
  <div class="finish" :class="decor && `finish--${decor}`">
    <div class="finish__inner">
      <header class="finish__head">
        <h2 class="finish__title">{{ finishTitle }}</h2>
        <p class="finish__sub">{{ questData.title }}</p>
      </header>

      <p class="finish__facts">
        <span><b>{{ points }}</b> {{ pointsWord(theme, points) }}</span>
        <span><b>{{ completedCount }}</b> {{ plural(completedCount, ...(theme.copy.cellsDone ?? ['клетка пройдена', 'клетки пройдены', 'клеток пройдено'])) }}</span>
        <span>за <b>{{ elapsed }}</b></span>
      </p>

      <!-- Зельеварня: полный флакон зелья для двоих -->
      <div v-if="decor === 'potion'" class="finish__flask">
        <QuestFlask :size="150" :level=".8" label="на двоих" fresh />
      </div>

      <!-- Футляр: открыт, на подушечке кольцо. Вопрос экран не задаёт — его задают вслух -->
      <div v-if="decor === 'ringbox'" class="finish__box">
        <QuestRingbox :size="190" ring fresh />
      </div>

      <!-- Карта: пунктир через пройденные метки к большому красному кресту -->
      <svg v-if="decor === 'map'" class="finish__chart" viewBox="0 0 320 130" aria-hidden="true">
        <path class="finish__chart-route" d="M8 112 C30 112 36 104 50 104 S80 64 96 64 S128 84 140 80 S166 72 178 70" />
        <g class="finish__chart-marks">
          <circle v-for="(m, i) in chartMarks" :key="i" :cx="m[0]" :cy="m[1]" r="7" />
        </g>
        <!-- островок клада: крест ставится на суше, а не в море -->
        <path class="finish__chart-isle" d="M299.0 58.8 Q298.9 64.0 297.6 69.0 Q296.4 74.0 295.9 79.3 Q295.3 84.6 290.4 88.4 Q285.5 92.1 281.7 96.2 Q277.9 100.4 270.5 100.6 Q263.2 100.8 257.2 100.6 Q251.1 100.4 246.7 105.5 Q242.3 110.6 236.0 110.9 Q229.7 111.2 223.0 111.2 Q216.4 111.2 210.9 108.3 Q205.4 105.4 200.2 102.5 Q194.9 99.6 189.8 96.4 Q184.6 93.2 180.1 89.1 Q175.6 85.0 175.7 79.5 Q175.8 74.0 174.8 69.0 Q173.8 64.0 173.2 58.7 Q172.6 53.5 173.7 48.1 Q174.9 42.7 178.4 38.0 Q181.9 33.3 184.8 27.7 Q187.7 22.1 194.2 19.1 Q200.6 16.1 208.9 17.3 Q217.1 18.5 223.1 15.5 Q229.1 12.5 235.8 13.9 Q242.5 15.3 248.8 16.7 Q255.1 18.1 260.9 20.2 Q266.8 22.4 272.4 25.0 Q278.0 27.6 283.7 30.6 Q289.4 33.7 291.0 39.0 Q292.6 44.3 295.9 48.9 Q299.1 53.5 299.0 58.8 Z" />
        <g class="finish__chart-x" transform="translate(236 62)">
          <path d="M-28 -28 L28 28" /><path d="M28 -28 L-28 28" />
        </g>
      </svg>

      <!-- Колода: расклад из открытых карт веером, у каждой свой знак -->
      <div v-if="decor === 'tarot' && spread" class="finish__spread" :style="{ '--n': spread }" aria-hidden="true">
        <span v-for="i in spread" :key="i" class="finish__spread-card" :style="{ '--i': i - 1 }">
          <QuestArcana :no="i - 1" :size="38" />
        </span>
      </div>

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
        <span v-else-if="decor === 'tarot'" class="finish__frame" aria-hidden="true"></span>
        <span v-else-if="decor === 'ringbox'" class="finish__stitch" aria-hidden="true"></span>
        <span v-else-if="decor === 'potion'" class="finish__rule" aria-hidden="true"></span>
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
          {{ theme.copy.finishShare ?? 'Поделиться результатом' }}
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
import QuestArcana from './QuestArcana.vue'
import QuestRingbox from './QuestRingbox.vue'
import QuestFlask from './QuestFlask.vue'
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
// Метки на пунктире к кладу: по одной на пройденную, не больше трёх
const CHART_PTS = [[50, 104], [96, 64], [140, 80]]
const chartMarks = computed(() => CHART_PTS.slice(0, Math.min(props.completedCount, 3)))
// Карт в раскладе: по одной на пройденную клетку, веер не шире семи
const spread = computed(() => Math.min(props.completedCount, 7))
// Дата в штемпеле — день, когда письмо дошло до адресата
const deliveredOn = ref('')
onMounted(() => { deliveredOn.value = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) })

const messageLabel = computed(() => ({
  detective: 'Личное послание', romantic: 'Слова для тебя',
  mystery: 'Последняя карта', city: 'Личное сообщение',
  treasure: 'Записка в сундуке', proposal: 'От меня', potion: 'К зелью прилагается',
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
/* корешок пробит: по дырочке на каждую пройденную станцию, между полосой и линией отрыва */
.finish__holes {
  position: absolute; right: 22px; top: 13px;
  display: flex; gap: 6px;
}
.finish__holes i {
  width: 11px; height: 11px;
  border-radius: 50%;
  background: var(--field);
  box-shadow:
    inset 0 2px 2px color-mix(in srgb, var(--rule) 55%, transparent),
    0 0 0 1px color-mix(in srgb, var(--paper-edge) 80%, var(--ink));
}

/* Обличье зельеварни: полный флакон и записка на странице рецепта */
.finish--potion .finish__title { font-weight: 700; }
.finish__flask {
  --fl-line: .9;
  display: grid; place-items: center;
  margin: 4px 0 0;
  filter: drop-shadow(0 18px 18px color-mix(in srgb, var(--rule) 70%, transparent));
}
.finish__flask :deep(.fl__no) { font-size: 4.6px; font-weight: 400; }
.finish--potion .finish__message {
  position: relative;
  border: none;
  border-radius: 6px;
  box-shadow:
    0 1px 0 var(--paper-edge),
    0 18px 26px -16px color-mix(in srgb, var(--rule) 90%, transparent);
  padding-top: 28px;
}
/* шапка страницы рецепта: двойная линейка под заголовком, как в старой книге */
.finish__rule {
  position: absolute; left: 18px; right: 18px; top: 10px;
  height: 4px;
  border-top: 1.5px solid color-mix(in srgb, var(--ink) 55%, var(--paper));
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 30%, var(--paper));
  pointer-events: none;
}

/* Обличье футляра: открытый футляр с кольцом и послание на шёлке */
.finish--ringbox .finish__title { text-wrap: balance; }
.finish__box {
  /* крупный футляр — тоньше линии, как на гравюре ювелирного каталога */
  --rb-line: .9;
  display: grid; place-items: center;
  margin: 6px 0 2px;
  filter: drop-shadow(0 18px 18px color-mix(in srgb, var(--rule) 30%, transparent));
}
.finish--ringbox .finish__message {
  position: relative;
  border: none;
  border-radius: 12px;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--rule) 14%, transparent),
    0 16px 24px -16px color-mix(in srgb, var(--rule) 55%, transparent);
  padding: 26px 24px 24px;
}
.finish__stitch {
  position: absolute;
  pointer-events: none;
}
/* прострочка подкладки: пунктирный шов, отступивший от края */
.finish__stitch { inset: 7px; border: 1.5px dashed color-mix(in srgb, var(--ink) 28%, var(--paper)); border-radius: 7px; }

/* Обличье карты: путь к кладу и записка на обрывке пергамента */
.finish__chart { display: block; width: 100%; max-width: 380px; height: auto; margin: 4px auto -4px; overflow: visible; }
.finish__chart-route {
  fill: none;
  stroke: var(--field-ink);
  stroke-width: 2.5;
  stroke-dasharray: 8 8;
  stroke-linecap: round;
}
.finish__chart-isle { fill: var(--paper); stroke: var(--ink); stroke-width: 2; }
.finish__chart-marks circle { fill: var(--field); stroke: var(--field-ink); stroke-width: 2.5; }
.finish__chart-x path {
  fill: none;
  stroke: var(--chip);
  stroke-width: 9;
  stroke-linecap: round;
  stroke-dasharray: 80;
  animation: chart-x .3s cubic-bezier(.6, 0, .4, 1) .3s both;
}
.finish__chart-x path + path { animation-delay: .7s; }
@keyframes chart-x { from { stroke-dashoffset: 80; } to { stroke-dashoffset: 0; } }
.finish--map .finish__message { border: none; border-radius: 0; margin: 8px 0; }
.finish--map .finish__message::before,
.finish--map .finish__message::after {
  content: "";
  position: absolute; left: 0; right: 0;
  height: 7px;
  background: var(--paper);
  pointer-events: none;
}
.finish--map .finish__message::before { bottom: calc(100% - 1px); clip-path: polygon(0 100%, 0.0% 43%, 3.8% 28%, 7.7% 70%, 11.5% 21%, 15.4% 61%, 19.2% 46%, 23.1% 20%, 26.9% 58%, 30.8% 18%, 34.6% 52%, 38.5% 21%, 42.3% 23%, 46.2% 51%, 50.0% 85%, 53.8% 26%, 57.7% 34%, 61.5% 68%, 65.4% 96%, 69.2% 64%, 73.1% 49%, 76.9% 98%, 80.8% 19%, 84.6% 88%, 88.5% 40%, 92.3% 27%, 96.2% 25%, 100.0% 41%, 100% 100%); }
.finish--map .finish__message::after  { top: calc(100% - 1px);    clip-path: polygon(0 0, 0.0% 69%, 3.8% 15%, 7.7% 49%, 11.5% 54%, 15.4% 32%, 19.2% 47%, 23.1% 5%, 26.9% 5%, 30.8% 18%, 34.6% 58%, 38.5% 36%, 42.3% 27%, 46.2% 50%, 50.0% 39%, 53.8% 25%, 57.7% 68%, 61.5% 59%, 65.4% 21%, 69.2% 49%, 73.1% 45%, 76.9% 74%, 80.8% 62%, 84.6% 24%, 88.5% 83%, 92.3% 10%, 96.2% 36%, 100.0% 64%, 100% 0); }
@media (prefers-reduced-motion: reduce) {
  .finish__chart-x path { animation: none; }
}

/* Обличье колоды: веер открытых карт и последняя карта с рамкой */
.finish--tarot .finish__title { font-weight: 700; }
.finish__spread {
  position: relative;
  height: 170px;
  margin: 8px 0 -4px;
}
.finish__spread-card {
  --mid: calc((var(--n) - 1) / 2);
  position: absolute; left: 50%; bottom: 0;
  display: grid; place-items: center;
  width: 74px; height: 111px;
  margin-left: -37px;
  border-radius: 5px;
  background: var(--paper);
  color: var(--ink);
  box-shadow:
    inset 0 0 0 3px var(--paper),
    inset 0 0 0 4px color-mix(in srgb, var(--ink) 55%, var(--paper)),
    0 0 0 1px color-mix(in srgb, var(--rule) 60%, transparent),
    0 10px 14px -8px color-mix(in srgb, var(--rule) 95%, transparent);
  transform-origin: 50% 220%;
  transform: translateX(calc((var(--i) - var(--mid)) * 26px)) rotate(calc((var(--i) - var(--mid)) * 8deg));
  animation: spread-out .5s cubic-bezier(.16, 1, .3, 1) both;
  animation-delay: calc(var(--i) * 70ms + .15s);
}
@keyframes spread-out {
  from { transform: none; opacity: 0; }
}
.finish--tarot .finish__message {
  border: none;
  border-radius: 8px;
  padding: 28px 24px 24px;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--rule) 50%, transparent),
    0 2px 0 var(--paper-edge),
    0 18px 26px -16px color-mix(in srgb, var(--rule) 90%, transparent);
}
.finish__frame,
.finish__frame::after {
  position: absolute;
  border-radius: 4px;
  pointer-events: none;
}
.finish__frame { inset: 8px; border: 1.5px solid color-mix(in srgb, var(--ink) 70%, var(--paper)); }
.finish__frame::after {
  content: "";
  inset: 3px;
  border: 1px solid color-mix(in srgb, var(--ink) 40%, var(--paper));
  border-radius: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .finish__spread-card { animation: none; }
}

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
