<template>
  <div
    class="lid"
    :class="[{ 'lid--open': opening, 'lid--ceremony': !!steps }, decor && `lid--${decor}`, stage && `lid--s${stage}`]"
    role="button"
    tabindex="0"
    :aria-label="hint"
    @click="open"
    @keydown.enter.prevent="open"
    @keydown.space.prevent="open"
    @transitionend.self="onLifted"
  >
    <!-- Схема: считыватель турникета над проездным — стоит на месте, проездной уходит под него -->
    <span v-if="decor === 'metro'" class="lid__gate" aria-hidden="true">
      <i class="lid__lamp"></i><b class="lid__gate-txt">Проходите</b>
    </span>

    <!-- Дело: крафтовая папка на красной нити. Нить сматывается с пуговицы, обложка
         раскрывается, лист дела выходит из папки — и под ним уже экран старта -->
    <div v-if="decor === 'casefile'" class="case">
      <p class="case__tab">Дело № {{ caseNo }}</p>
      <div class="case__inside" aria-hidden="true"></div>
      <div class="case__sheet" aria-hidden="true">
        <p class="case__sheet-head">Дело № {{ caseNo }}</p>
        <dl class="case__sheet-rows">
          <div><dt>Объект</dt><dd>{{ questData.client_name || 'не указан' }}</dd></div>
          <div><dt>Дело</dt><dd>{{ questData.title }}</dd></div>
          <div><dt>Статус</dt><dd>открыто</dd></div>
        </dl>
        <span class="case__sheet-stamp">Принято в работу</span>
      </div>
      <div class="case__cover">
        <div class="case__label">
          <h1 class="lid__title">{{ questData.title }}</h1>
          <p v-if="questData.client_name" class="lid__for">Кому: <b>{{ questData.client_name }}</b></p>
        </div>
        <span class="lid__stamp" aria-hidden="true">Секретно</span>
      </div>
      <!-- завязка: две пуговицы и красная нить восьмёркой между ними -->
      <svg class="case__tie" viewBox="0 0 60 120" aria-hidden="true">
        <path class="case__thread" pathLength="100" d="M30 28 C52 40 52 70 30 92 C8 70 8 40 30 28 C46 22 50 12 42 6" />
        <circle class="case__button" cx="30" cy="28" r="9" />
        <circle class="case__button" cx="30" cy="92" r="9" />
      </svg>
    </div>

    <div v-else class="lid__face">
      <!-- Хеллоуин: приглашение раскрывается — внутри тыква, на ней прорезается лицо -->
      <template v-if="decor === 'diecut'">
        <div class="inv inv--front">
          <svg class="lid__scene" viewBox="0 0 280 96" aria-hidden="true">
            <rect class="lid__scene-sky" width="280" height="96" />
            <circle class="lid__scene-moon" cx="196" cy="44" r="30" />
            <path class="lid__scene-hill" d="M0 96 V78 Q20 70 40 78 T80 76 T120 80 T160 74 T200 80 T240 76 T280 78 V96 Z" />
            <path class="lid__scene-cut" d="M66 80 C62 75 62 66 66 61 C64 59 64 54 65 50 L64 43 L69 47.6 C71 47 76 47 78 47.6 L83 43 L82 50 C83 54 83 59 81 61 C85 66 85 72 82 76 C86 76 89 73 89 69 L91 69 C91 76 87 80 80 79 Z" />
            <path class="lid__scene-cut" transform="translate(186 34) scale(1.1)" d="M0 2 C-3 -2 -6 -2 -8 -6 C-9 -2 -12 -1 -16 -3 C-15 1 -12 4 -8 4 C-6 7 -3 5 -1.5 7.5 L0 5 L1.5 7.5 C3 5 6 7 8 4 C12 4 15 1 16 -3 C12 -1 9 -2 8 -6 C6 -2 3 -2 0 2 Z" />
            <path class="lid__scene-cut" transform="translate(120 22) scale(.75)" d="M0 2 C-3 -2 -6 -2 -8 -6 C-9 -2 -12 -1 -16 -3 C-15 1 -12 4 -8 4 C-6 7 -3 5 -1.5 7.5 L0 5 L1.5 7.5 C3 5 6 7 8 4 C12 4 15 1 16 -3 C12 -1 9 -2 8 -6 C6 -2 3 -2 0 2 Z" />
            <path class="lid__scene-cut" transform="translate(248 16) scale(.6)" d="M0 2 C-3 -2 -6 -2 -8 -6 C-9 -2 -12 -1 -16 -3 C-15 1 -12 4 -8 4 C-6 7 -3 5 -1.5 7.5 L0 5 L1.5 7.5 C3 5 6 7 8 4 C12 4 15 1 16 -3 C12 -1 9 -2 8 -6 C6 -2 3 -2 0 2 Z" />
          </svg>
          <div class="lid__invite">
            <h1 class="lid__title">{{ questData.title }}</h1>
            <p v-if="questData.client_name" class="lid__for">Кому: <b>{{ questData.client_name }}</b></p>
          </div>
        </div>
        <div class="inv inv--inside" aria-hidden="true">
          <QuestPumpkin :size="150" :state="stage >= 3 ? 'done' : 'active'" :fresh="stage >= 3" />
          <p class="inv__name">{{ questData.client_name || questData.title }}</p>
        </div>
      </template>

      <!-- Колода: бандероль снимается, верхняя карта переворачивается лицом -->
      <template v-if="decor === 'tarot'">
        <span class="tc tc--back" aria-hidden="true"></span>
        <span class="tc tc--front" aria-hidden="true">
          <QuestArcana :no="0" :size="104" />
          <span class="tc__title">{{ questData.title }}</span>
          <span v-if="questData.client_name" class="tc__for">{{ questData.client_name }}</span>
        </span>
      </template>

      <!-- Зельеварня: сургуч откалывается, пробка выскакивает, зелье поднимается -->
      <QuestFlask v-if="decor === 'potion'" class="lid__flask" :size="260" :level="stage >= 3 ? .9 : .38" />
      <span v-if="decor === 'potion'" class="lid__wax" aria-hidden="true"></span>
      <!-- Свиток: печать ломается, свиток разворачивается в карту, крест рисуется пером -->
      <QuestSeal v-if="decor === 'map'" class="lid__seal lid__seal--map" :size="84" :seed="9" motto="★ КАРТА ★" />
      <!-- Конверт: сургуч ломается, клапан откидывается, письмо выходит -->
      <span v-if="decor === 'letters'" class="lid__flap" aria-hidden="true">
        <QuestSeal class="lid__seal" :size="88" :seed="5" motto="★ ПИСЬМО ★" />
      </span>
      <span v-if="decor === 'letters'" class="lid__slot" aria-hidden="true">
        <span class="lid__letter">
          <span class="lid__letter-to">{{ questData.client_name ? `${questData.client_name},` : questData.title }}</span>
          <i></i><i></i><i></i><i></i>
        </span>
      </span>
      <!-- Схема: компостер пробивает проездной, турникет пропускает -->
      <span v-if="decor === 'metro'" class="lid__holes" aria-hidden="true"><i></i><i></i><i></i></span>
      <!-- Футляр: бант развязывается, лента спадает, в коробке открывается футляр с кольцом -->
      <span v-if="decor === 'ringbox'" class="lid__ribbons" aria-hidden="true"></span>
      <svg v-if="decor === 'ringbox'" class="lid__bow" viewBox="0 0 80 50" aria-hidden="true">
        <path d="M40 25 C30 6 8 4 8 20 C8 34 28 32 40 25 Z" />
        <path d="M40 25 C50 6 72 4 72 20 C72 34 52 32 40 25 Z" />
        <path d="M37 27 L28 48 L34 46 L38 49 Z M43 27 L52 48 L46 46 L42 49 Z" />
        <rect x="34" y="19" width="12" height="12" rx="3" />
      </svg>
      <QuestRingbox v-if="decor === 'ringbox'" class="lid__ring" :size="150" ring :fresh="stage >= 3" />

      <div v-if="decor !== 'diecut'" :class="decor === 'tarot' ? 'lid__band' : decor === 'ringbox' ? 'lid__tag' : decor === 'potion' ? 'lid__label' : 'lid__text'">
        <h1 class="lid__title">{{ questData.title }}</h1>
        <p v-if="questData.client_name" class="lid__for">
          Кому: <b>{{ questData.client_name }}</b>
        </p>
      </div>
      <!-- карта под свитком: остров, пунктир пути и крест -->
      <span v-if="decor === 'map'" class="lid__chart" aria-hidden="true"><span class="lid__chart-in">
        <svg viewBox="0 0 200 92">
          <path class="lid__chart-isle" d="M18 52 C14 34 34 20 58 22 C74 10 104 12 118 22 C140 14 172 22 178 40 C190 54 178 74 156 74 C140 86 110 84 96 78 C76 88 44 84 34 72 C22 70 16 62 18 52 Z" />
          <path class="lid__chart-way" d="M40 58 C56 40 76 62 94 46 C110 32 130 54 148 44" />
          <path class="lid__chart-x" pathLength="100" d="M142 36 L156 52 M156 36 L142 52" />
        </svg>
      </span></span>
      <!-- Проездной: линия маршрута со станциями вдоль нижнего края -->
      <span v-if="decor === 'metro'" class="lid__route" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
    </div>
    <p class="lid__hint">{{ hint }}</p>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import QuestSeal from './QuestSeal.vue'
import QuestFlask from './QuestFlask.vue'
import QuestArcana from './QuestArcana.vue'
import QuestRingbox from './QuestRingbox.vue'
import QuestPumpkin from './QuestPumpkin.vue'

// Крышка коробки с игрой: название и имя игрока. Поднимается сама
// через пару секунд или по тапу и открывает правила (QuestSplash).
const props = defineProps({
  theme:     { type: Object, required: true },
  questData: { type: Object, required: true },
  duration:  { type: Number, default: 2600 },
})
const emit = defineEmits(['done'])

const decor   = computed(() => props.theme.world?.decor ?? null)
const caseNo  = computed(() => 1000 + (Number(props.questData.id) || 0))
const hint    = computed(() => props.theme.copy?.introHint ?? 'Нажми, чтобы открыть')
const opening = ref(false)
let timer = null

// Церемония открытия по стадиям (мс от тапа); последняя — крышка растворяется,
// под ней уже экран старта. Мир без церемонии поднимает крышку целиком, как раньше.
// Дело: нить сматывается, обложка раскрывается, лист выходит. Переписка: сургуч ломается,
// клапан откидывается, письмо выходит. Схема: компостер, турникет, проезд. Колода: бандероль,
// переворот карты, карта поднимается. Карта: печать, свиток разворачивается, крест. Футляр:
// бант, лента, футляр открывается. Зельеварня: сургуч, пробка, зелье поднимается.
// Вырубка: приглашение наклоняется, раскрывается, на тыкве прорезается лицо.
const CEREMONY = {
  casefile: [0, 420, 1050, 1500],
  letters:  [0, 320, 900, 1550],
  metro:    [0, 450, 900, 1450],
  tarot:    [0, 420, 1100, 1600],
  map:      [0, 320, 1000, 1650],
  ringbox:  [0, 380, 950, 1800],
  potion:   [0, 300, 720, 1550],
  diecut:   [0, 260, 900, 1600],
}
const steps = computed(() => CEREMONY[decor.value] ?? null)
const stage = ref(0)
const stageTimers = []

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const open = () => {
  if (opening.value) return
  clearTimeout(timer)
  opening.value = true
  if (reduced()) { emit('done'); return }
  steps.value?.forEach((ms, i) => stageTimers.push(setTimeout(() => { stage.value = i + 1 }, ms)))
}
const onLifted = () => { if (opening.value) emit('done') }

onMounted(() => { timer = setTimeout(open, props.duration) })
onUnmounted(() => { clearTimeout(timer); stageTimers.forEach(clearTimeout) })
</script>

<style scoped>
.lid {
  position: fixed; inset: 0; z-index: 200;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  padding: 24px 20px max(28px, env(safe-area-inset-bottom));
  background: var(--field);
  color: var(--field-ink);
  cursor: pointer;
  box-shadow: 0 24px 40px -10px color-mix(in srgb, var(--rule) 80%, transparent);
  transition: transform .75s cubic-bezier(.7, 0, .2, 1);
}
.lid:focus-visible { outline: 3px solid var(--field-ink); outline-offset: -8px; }
.lid--open { transform: translateY(-104%); }

/* Церемония открытия: крышка не уезжает — предмет раскрывается на месте по стадиям
   (lid--s1…s4), на последней слой растворяется, под ним уже экран старта */
.lid--ceremony { transition: opacity .32s ease .08s; }
.lid--ceremony.lid--open { transform: none; }
.lid--ceremony.lid--s4 { opacity: 0; pointer-events: none; }
.lid--ceremony .lid__hint { transition: opacity .2s; }
.lid--ceremony.lid--open .lid__hint { opacity: 0; }

.lid__face {
  container-type: inline-size;
  position: relative;
  width: 100%; max-width: 440px;
  padding: 40px 24px;
  border: 3px solid color-mix(in srgb, var(--field-ink) 45%, var(--field));
  border-radius: 14px;
  text-align: center;
}
.lid__text { display: contents; }
.lid__title {
  margin: 0;
  font-family: var(--font-d);
  font-weight: 400;
  /* по ширине папки: «расследование» помещается целиком */
  font-size: clamp(1.4rem, 8.6cqi, 2.9rem);
  line-height: 1.04;
  hyphens: auto;
  overflow-wrap: break-word;
  letter-spacing: -0.01em;
  text-wrap: balance;
}
.lid__for {
  margin: 18px 0 0;
  font-family: var(--font-b);
  font-size: 1.15rem;
  color: var(--field-ink-soft);
}
.lid__for b { color: var(--field-ink); font-weight: 700; }
.lid__hint {
  margin: 28px 0 0;
  font-family: var(--font-b);
  font-size: 1rem;
  color: var(--field-ink-soft);
}

/* ── Обличье дела: папка из крафта на красной нити ───────────────── */
.lid--casefile { background: var(--field); }

.case {
  container-type: inline-size;
  position: relative;
  width: min(88vw, 420px);
  aspect-ratio: 5 / 6.4;
  margin-top: 26px;
  perspective: 1400px;
}
/* язычок папки с номером дела */
.case__tab {
  position: absolute; left: 0; bottom: 100%;
  margin: 0;
  padding: 8px 18px 6px;
  background: var(--paper-edge);
  border-radius: 10px 10px 0 0;
  font-family: var(--font-b);
  font-size: 1rem;
  color: var(--ink-soft);
  font-variant-numeric: tabular-nums;
}
/* задняя половина папки: внутренняя сторона крафта */
.case__inside {
  position: absolute; inset: 0;
  background: color-mix(in srgb, var(--rule) 10%, var(--paper-edge));
  border-radius: 0 18px 4px 4px;
  box-shadow: 0 26px 34px -20px color-mix(in srgb, var(--rule) 95%, transparent);
}
/* лист дела внутри: печатный бланк на белой бумаге */
.case__sheet {
  position: absolute; inset: 7% 6% 6%;
  padding: 9cqi 7cqi;
  background: var(--paper);
  color: var(--ink);
  border-radius: 2px;
  box-shadow: 0 2px 0 color-mix(in srgb, var(--rule) 20%, transparent), 0 12px 18px -12px color-mix(in srgb, var(--rule) 70%, transparent);
  text-align: left;
  transition: transform .5s cubic-bezier(.2, .7, .2, 1);
}
.case__sheet-head {
  margin: 0 0 7cqi;
  padding-bottom: 3cqi;
  border-bottom: 2px solid var(--ink);
  font-family: var(--font-d);
  font-size: 7cqi;
  letter-spacing: .02em;
  font-variant-numeric: tabular-nums;
}
.case__sheet-rows { margin: 0; display: grid; gap: 4cqi; }
.case__sheet-rows div { display: grid; grid-template-columns: 30% 1fr; gap: 3cqi; align-items: baseline; }
.case__sheet-rows dt { font-family: var(--font-b); font-size: 3.6cqi; text-transform: uppercase; letter-spacing: .08em; color: var(--ink-soft); }
.case__sheet-rows dd { margin: 0; font-family: var(--font-b); font-size: 5cqi; border-bottom: 1px dotted color-mix(in srgb, var(--ink) 45%, var(--paper)); }

/* штамп ложится на лист, когда тот выходит из папки */
.case__sheet-stamp {
  position: absolute; right: 7cqi; bottom: 10cqi;
  padding: 2cqi 4cqi;
  border: 3px double var(--chip);
  border-radius: 6px;
  color: var(--chip);
  font-family: var(--font-d);
  font-size: 4.4cqi;
  letter-spacing: .05em;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0;
  transform: rotate(-7deg) scale(1.6);
}
.lid--s3 .case__sheet-stamp, .lid--s4 .case__sheet-stamp { animation: case-stamp .3s cubic-bezier(.2, .7, .2, 1) .12s forwards; }
@keyframes case-stamp {
  to { opacity: .92; transform: rotate(-7deg) scale(1); }
}

/* обложка: открывается вокруг левого корешка */
.case__cover {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; justify-content: center;
  padding: 0 8cqi;
  background: var(--paper-edge);
  border-radius: 0 18px 4px 4px;
  transform-origin: left center;
  transform-style: preserve-3d;
  transition: transform .62s cubic-bezier(.55, 0, .25, 1);
  box-shadow: 0 26px 34px -20px color-mix(in srgb, var(--rule) 95%, transparent);
}
/* изнанка обложки, видна в развороте */
.case__cover::after {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  background: color-mix(in srgb, var(--rule) 14%, var(--paper-edge));
  transform: rotateY(180deg);
  backface-visibility: hidden;
}
.case__label { backface-visibility: hidden; }
/* ярлык с названием дела, наклеенный на крафт */
.case__label {
  padding: 7cqi 6cqi 6cqi;
  background: var(--paper);
  border-radius: 2px;
  box-shadow: 0 1px 0 color-mix(in srgb, var(--rule) 25%, transparent);
  text-align: center;
}
.lid--casefile .lid__title { color: var(--ink); font-size: clamp(1.6rem, 10cqi, 3rem); }
.lid--casefile .lid__for { margin-top: 4cqi; color: var(--ink-soft); }
.lid--casefile .lid__for b { color: var(--ink); }
.lid__stamp {
  position: absolute; right: 7cqi; bottom: 9cqi;
  padding: 6px 14px;
  border: 3px double var(--chip);
  border-radius: 6px;
  color: var(--chip);
  font-family: var(--font-d);
  font-size: clamp(1.1rem, 6.4cqi, 1.6rem);
  letter-spacing: .06em;
  text-transform: uppercase;
  transform: rotate(-9deg);
  opacity: .9;
  backface-visibility: hidden;
}

/* завязка на правом краю: пуговицы и красная нить */
.case__tie {
  position: absolute; right: -3cqi; top: 50%;
  width: 15cqi; height: 30cqi;
  margin-top: -15cqi;
  overflow: visible;
  transition: opacity .2s .25s;
}
.case__button { fill: color-mix(in srgb, var(--rule) 30%, var(--paper-edge)); stroke: var(--rule); stroke-width: 2; }
.case__thread {
  fill: none;
  stroke: var(--chip);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 100;
  stroke-dashoffset: 0;
  filter: drop-shadow(0 1.5px 0 color-mix(in srgb, var(--rule) 45%, transparent));
  transition: stroke-dashoffset .42s cubic-bezier(.5, 0, .7, .4);
}

/* 1 — нить сматывается с пуговиц */
.lid--s1 .case__thread, .lid--s2 .case__thread, .lid--s3 .case__thread, .lid--s4 .case__thread { stroke-dashoffset: -100; }
.lid--s2 .case__tie, .lid--s3 .case__tie, .lid--s4 .case__tie { opacity: 0; }
/* 2 — обложка раскрывается */
.lid--s2 .case__cover, .lid--s3 .case__cover, .lid--s4 .case__cover { transform: rotateY(-158deg); }
/* 3 — лист дела выходит из папки навстречу */
.lid--s3 .case__sheet { transform: translateY(-6%) scale(1.06); }
/* 4 — лист уходит вверх, к заголовку экрана старта, и растворяется вместе со слоем */
.lid--s4 .case__sheet { transform: translateY(-16%) scale(1.1); opacity: 0; transition: transform .4s cubic-bezier(.2, .7, .2, 1), opacity .25s ease; }

/* ── Обличье переписки: конверт под сургучом ─────────────────── */
.lid--letters .lid__face {
  display: flex; flex-direction: column; justify-content: flex-end;
  aspect-ratio: 10 / 8;
  padding: 0 22px 26px;
  border: none;
  border-radius: 3px;
  color: var(--ink);
  background:
    linear-gradient(to top right, transparent calc(50% - 1px), color-mix(in srgb, var(--rule) 14%, var(--paper-edge)) calc(50% - 1px) calc(50% + .5px), transparent calc(50% + .5px)) left bottom / 50% 64% no-repeat,
    linear-gradient(to top left,  transparent calc(50% - 1px), color-mix(in srgb, var(--rule) 14%, var(--paper-edge)) calc(50% - 1px) calc(50% + .5px), transparent calc(50% + .5px)) right bottom / 50% 64% no-repeat,
    var(--paper-edge);
  box-shadow: 0 22px 30px -18px color-mix(in srgb, var(--rule) 90%, transparent);
  perspective: 900px;
}
.lid__flap {
  position: absolute; left: 0; right: 0; top: 0;
  height: 38cqi;
  transform-origin: top center;
  transition: transform .4s cubic-bezier(.5, 0, .3, 1);
  filter: drop-shadow(0 3px 2px color-mix(in srgb, var(--rule) 35%, transparent));
}
.lid__flap::before {
  content: "";
  position: absolute; inset: 0;
  background: color-mix(in srgb, var(--rule) 6%, var(--paper-edge));
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}
.lid__seal {
  position: absolute; left: 50%; bottom: 0;
  margin: 0 0 -36px -44px;
  /* тиснение антиквой темы, а не гротеском дела */
  --seal-face: 'Cormorant Garamond';
  font-weight: 700;
  transform: rotate(-8deg);
  transition: opacity .15s;
}
.lid--letters .lid__title { position: relative; color: var(--ink); font-weight: 700; }
.lid--letters .lid__for {
  position: relative;
  margin-top: 8px;
  font-family: var(--font-h);
  font-size: 1.55rem;
  color: var(--ink);
}
.lid--letters .lid__for b { color: var(--ink); font-weight: 400; }
/* сначала клапан откидывается, потом конверт уходит вверх */

/* ── Обличье схемы: проездной на бумаге схемы ───────────────── */
.lid--metro .lid__face {
  display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
  aspect-ratio: 85.6 / 54;
  padding: 22px 22px 58px 52px;
  border: none;
  border-radius: 14px;
  background: var(--paper);
  color: var(--ink);
  text-align: left;
  box-shadow:
    inset 30px 0 0 var(--chip),
    0 1px 0 var(--paper-edge),
    0 22px 30px -18px color-mix(in srgb, var(--rule) 60%, transparent);
  transition: transform .3s cubic-bezier(.7, 0, .84, 0);
}
.lid--metro .lid__title { font-weight: 700; color: var(--ink); font-size: clamp(1.4rem, 8cqi, 2.4rem); }
.lid--metro .lid__for { margin-top: 10px; color: var(--ink); }
.lid--metro .lid__for b { color: var(--ink); }
.lid__route {
  position: absolute; left: 52px; right: 26px; bottom: 24px;
  display: flex; justify-content: space-between; align-items: center;
  height: 16px;
}
.lid__route::before {
  content: "";
  position: absolute; left: 4px; right: 4px; top: 50%;
  height: 6px; margin-top: -3px;
  border-radius: 3px;
  background: var(--chip);
}
.lid__route i {
  position: relative;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: var(--plate);
  border: 4px solid var(--chip);
}
/* проездной проходит турникет: карточка уходит вверх, затем поднимается крышка */

/* ── Обличье вырубки: приглашение на вечеринку ──────────────────── */
/* вырубка углов маской: вогнутые углы режут и шапку-сцену; тень маска срезала бы, поэтому без неё */
.lid--diecut .lid__face {
  border: none;
  border-radius: 0;
  padding: 0 0 26px;
  background: var(--paper);
  -webkit-mask:
    radial-gradient(circle at 0 0,       transparent 11px, #000 11.5px) top left     / 51% 51% no-repeat,
    radial-gradient(circle at 100% 0,    transparent 11px, #000 11.5px) top right    / 51% 51% no-repeat,
    radial-gradient(circle at 0 100%,    transparent 11px, #000 11.5px) bottom left  / 51% 51% no-repeat,
    radial-gradient(circle at 100% 100%, transparent 11px, #000 11.5px) bottom right / 51% 51% no-repeat;
          mask:
    radial-gradient(circle at 0 0,       transparent 11px, #000 11.5px) top left     / 51% 51% no-repeat,
    radial-gradient(circle at 100% 0,    transparent 11px, #000 11.5px) top right    / 51% 51% no-repeat,
    radial-gradient(circle at 0 100%,    transparent 11px, #000 11.5px) bottom left  / 51% 51% no-repeat,
    radial-gradient(circle at 100% 100%, transparent 11px, #000 11.5px) bottom right / 51% 51% no-repeat;
  max-width: 320px;
  overflow: hidden;
  transition: transform .4s cubic-bezier(.5, 0, .3, 1);
}
.lid__scene { display: block; width: 100%; height: auto; margin-bottom: 18px; }
.lid__scene-sky  { fill: var(--back); }
.lid__scene-moon { fill: var(--chip); }
/* небо — слой бурого картона, холмы и силуэты — сплошной чёрный картон поверх */
.lid__scene-hill { fill: var(--rule); }
.lid__scene-cut  { fill: var(--rule); }
.lid__invite { padding: 0 22px; }
.lid--diecut .lid__title { color: var(--ink); font-size: clamp(1.6rem, 10cqi, 2.4rem); }
.lid--diecut .lid__for { margin-top: 10px; color: var(--ink-soft); }
.lid--diecut .lid__for b { color: var(--ink); }
/* приглашение наклоняется, затем крышка уходит вверх */

/* ── Обличье зельеварни: флакон с ярлыком, пробка выскакивает ─── */
.lid--potion .lid__face {
  display: grid; place-items: center;
  max-width: 300px;
  padding: 0;
  border: none;
  border-radius: 0;
  --fl-line: .8;
}
.lid__flask { filter: drop-shadow(0 26px 22px color-mix(in srgb, var(--rule) 80%, transparent)); }
.lid__flask :deep(.fl__cork) { transition: transform .35s cubic-bezier(.3, 0, .2, 1), opacity .35s; transform-box: fill-box; }
/* сургуч на пробке */
.lid__wax {
  position: absolute; left: 50%; top: 2px;
  width: 50px; height: 22px; margin-left: -25px;
  border-radius: 40% 45% 50% 50% / 50% 50% 60% 60%;
  background: var(--wax);
  box-shadow: inset 0 -4px 0 color-mix(in srgb, var(--rule) 30%, transparent);
  transition: transform .35s cubic-bezier(.3, 0, .2, 1), opacity .35s;
}
/* ярлык поверх колбы: бумага с подрезанными углами */
.lid__label {
  position: absolute; left: 50%; top: 62%;
  width: 78%;
  transform: translate(-50%, -50%) rotate(-2deg);
  padding: 18px 16px 16px;
  isolation: isolate;
  /* контур — сам ярлык, бумага — внутренний слой той же формы: линия идёт и по срезам углов */
  background: var(--rule);
  color: var(--ink);
  clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px);
}
.lid__label::before {
  content: "";
  position: absolute; inset: 1.5px;
  z-index: -1;
  background: var(--paper);
  clip-path: polygon(11.4px 0, calc(100% - 11.4px) 0, 100% 11.4px, 100% calc(100% - 11.4px), calc(100% - 11.4px) 100%, 11.4px 100%, 0 calc(100% - 11.4px), 0 11.4px);
}
.lid--potion .lid__title { color: var(--ink); font-weight: 700; font-size: clamp(1.4rem, 8cqi, 2.1rem); }
.lid--potion .lid__for { margin-top: 8px; color: var(--ink-soft); }
.lid--potion .lid__for b { color: var(--ink); }
/* пробка выскакивает, затем флакон уходит вверх */

/* ── Обличье футляра: коробка, перевязанная шёлковой лентой, бирка «Кому» ── */
.lid--ringbox .lid__face {
  display: grid; place-items: center;
  max-width: 340px;
  aspect-ratio: 1;
  padding: 0;
  border: 1.5px solid var(--rule);
  border-radius: 18px;
  /* гранатовая лента крест-накрест поверх бархата, кромка ленты темнее */
  --ribbon: var(--chip);
  --ribbon-edge: color-mix(in srgb, var(--chip) 70%, var(--rule));
  background: var(--back);
  align-content: end;
  padding-bottom: 26px;
  box-shadow:
    0 6px 0 color-mix(in srgb, var(--rule) 22%, var(--back)),
    0 30px 36px -18px color-mix(in srgb, var(--rule) 65%, transparent);
}
/* бант стоит на перекрестье ленты: 30% высоты коробки */
.lid__bow {
  position: absolute; left: 50%; top: 30%;
  width: 96px; height: 60px;
  margin: -30px 0 0 -48px;
  fill: var(--chip);
  stroke: var(--ribbon-edge);
  stroke-width: 1.2;
  stroke-linejoin: round;
  filter: drop-shadow(0 4px 4px color-mix(in srgb, var(--rule) 35%, transparent));
}
.lid__tag {
  position: relative;
  width: 78%;
  padding: 22px 18px 20px;
  border-radius: 10px;
  background: var(--paper);
  color: var(--ink);
  box-shadow:
    inset 0 0 0 6px var(--paper),
    inset 0 0 0 7.5px color-mix(in srgb, var(--ink) 25%, var(--paper)),
    0 10px 14px -8px color-mix(in srgb, var(--rule) 60%, transparent);
  transform: rotate(-3deg);
  transition: transform .4s cubic-bezier(.5, 0, .3, 1);
}
.lid--ringbox .lid__title { color: var(--ink); font-size: clamp(1.5rem, 9cqi, 2.3rem); }
.lid--ringbox .lid__for { margin-top: 10px; color: var(--ink-soft); }
.lid--ringbox .lid__for b { color: var(--ink); }
/* бирка поворачивается, затем крышка коробки поднимается */

/* ── Обличье карты: свиток под сургучом на море ───────────────── */
.lid--map {
  background:
    var(--art-sea-waves) 0 0 / 64px 40px,
    var(--field);
}
.lid--map .lid__face {
  max-width: 340px;
  margin: 22px 0;
  padding: 46px 26px 64px;
  border: none;
  border-radius: 0;
  background: var(--paper);
  color: var(--ink);
  box-shadow: 0 26px 34px -18px color-mix(in srgb, var(--rule) 95%, transparent);
}
/* скатанные концы свитка: валик чуть шире листа, с линией витка */
.lid--map .lid__face::before,
.lid--map .lid__face::after {
  content: "";
  position: absolute; left: -10px; right: -10px;
  height: 24px;
  border-radius: 12px;
  background: var(--paper-edge);
  box-shadow:
    inset 0 -5px 0 color-mix(in srgb, var(--ink) 16%, var(--paper-edge)),
    inset 0 2px 0 color-mix(in srgb, var(--paper) 70%, var(--paper-edge)),
    0 6px 8px -4px color-mix(in srgb, var(--rule) 70%, transparent);
}
.lid--map .lid__face::before { top: -14px; }
.lid--map .lid__face::after  { bottom: -14px; }
.lid--map .lid__hint { margin-top: 64px; }
.lid--map .lid__title { color: var(--ink); font-size: clamp(1.6rem, 10cqi, 2.6rem); }
.lid--map .lid__for { color: var(--ink-soft); }
.lid--map .lid__for b { color: var(--ink); }
.lid__seal--map {
  position: absolute; left: 50%; bottom: -36px;
  margin-left: -42px;
  z-index: 1;
  --seal-face: 'Kurale';
  transform: rotate(-6deg);
  transition: opacity .2s, transform .3s cubic-bezier(.7, 0, .84, 0);
}
/* сургуч ломается, потом свиток уходит вверх */

/* ── Обличье колоды: новая колода в бандероли ───────────────── */
.lid--tarot .lid__face {
  display: flex; flex-direction: column; justify-content: center;
  width: min(78vw, 340px); max-width: none;
  aspect-ratio: 5 / 7.4;
  padding: 0;
  border: none;
  border-radius: 12px;
  background:
    repeating-linear-gradient(45deg,  transparent 0 11px, color-mix(in srgb, var(--paper) 34%, var(--back)) 11px 12.5px),
    repeating-linear-gradient(-45deg, transparent 0 11px, color-mix(in srgb, var(--paper) 34%, var(--back)) 11px 12.5px),
    var(--back);
  /* срез колоды: слои карт под верхней */
  box-shadow:
    inset 0 0 0 9px var(--back),
    inset 0 0 0 11px var(--paper),
    0 3px 0 var(--paper-edge),
    0 6px 0 var(--paper),
    0 9px 0 var(--paper-edge),
    0 12px 0 var(--paper),
    0 30px 36px -18px color-mix(in srgb, var(--rule) 95%, transparent);
}
.lid__band {
  position: relative;
  margin: 0 -10px;
  padding: 22px 22px 20px;
  background: var(--paper);
  color: var(--ink);
  box-shadow:
    inset 0 5px 0 var(--paper), inset 0 6px 0 color-mix(in srgb, var(--ink) 45%, var(--paper)),
    inset 0 -5px 0 var(--paper), inset 0 -6px 0 color-mix(in srgb, var(--ink) 45%, var(--paper)),
    0 6px 10px -6px color-mix(in srgb, var(--rule) 80%, transparent);
  transition: transform .38s cubic-bezier(.5, 0, .3, 1), opacity .38s;
}
.lid--tarot .lid__title { color: var(--ink); font-weight: 700; font-size: clamp(1.4rem, 9cqi, 2.3rem); }
.lid--tarot .lid__for { margin-top: 10px; color: var(--ink-soft); }
.lid--tarot .lid__for b { color: var(--ink); }
/* сначала снимается бандероль, потом поднимается крышка */

/* ── Церемонии открытия миров ─────────────────────────────────── */

/* Переписка: 1 — сургуч ломается, 2 — клапан откидывается, 3 — письмо выходит */
.lid--s1 .lid__seal, .lid--s2 .lid__seal, .lid--s3 .lid__seal, .lid--s4 .lid__seal { opacity: 0; transform: rotate(-8deg) scale(1.25); transition: opacity .22s, transform .22s; }
.lid--letters.lid--s2 .lid__flap, .lid--letters.lid--s3 .lid__flap, .lid--letters.lid--s4 .lid__flap { transform: rotateX(180deg); }
.lid__slot {
  position: absolute; left: 7%; right: 7%; bottom: 100%;
  height: 78%;
  overflow: hidden;
  pointer-events: none;
}
.lid__letter {
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 100%;
  padding: 8cqi 8cqi;
  display: flex; flex-direction: column; gap: 5cqi;
  background: var(--paper);
  border-radius: 2px;
  box-shadow: 0 -2px 10px -6px color-mix(in srgb, var(--rule) 60%, transparent);
  transform: translateY(100%);
  transition: transform .55s cubic-bezier(.2, .7, .2, 1);
  text-align: left;
}
.lid__letter-to { font-family: var(--font-h); font-size: 8cqi; color: var(--ink); line-height: 1.1; }
.lid__letter i { display: block; height: 1px; background: color-mix(in srgb, var(--ink) 22%, var(--paper)); }
.lid__letter i:nth-child(odd) { margin-right: 22%; }
.lid--letters.lid--s3 .lid__letter, .lid--letters.lid--s4 .lid__letter { transform: translateY(12%); }
/* конверт чуть опускается, чтобы письму хватило места над ним */
.lid--letters .lid__face { transition: transform .5s cubic-bezier(.2, .7, .2, 1); }
.lid--letters.lid--s3 .lid__face, .lid--letters.lid--s4 .lid__face { transform: translateY(16%); }

/* Схема: 1 — компостер пробивает три дырочки, 2 — турникет: «Проходите», 3 — проездной уходит в считыватель */
.lid__gate {
  position: relative; z-index: 2;
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 30px;
  padding: 10px 18px;
  border-radius: 8px;
  background: var(--ink);
  color: var(--paper);
  font-family: var(--font-d);
  font-size: .95rem;
  white-space: nowrap;
}
.lid__lamp { width: 12px; height: 12px; border-radius: 50%; background: color-mix(in srgb, var(--paper) 30%, var(--ink)); transition: background-color .2s; }
.lid__gate-txt { font-weight: 700; opacity: .35; transition: opacity .2s; }
.lid--metro.lid--s2 .lid__lamp, .lid--metro.lid--s3 .lid__lamp, .lid--metro.lid--s4 .lid__lamp { background: var(--chip); }
.lid--metro.lid--s2 .lid__gate-txt, .lid--metro.lid--s3 .lid__gate-txt, .lid--metro.lid--s4 .lid__gate-txt { opacity: 1; }
.lid__holes { position: absolute; right: 22px; top: 22px; display: flex; gap: 6px; }
.lid__holes i {
  width: 11px; height: 11px; border-radius: 50%;
  background: var(--field);
  box-shadow: inset 0 1.5px 2px color-mix(in srgb, var(--rule) 55%, transparent);
  transform: scale(0);
  transition: transform .14s cubic-bezier(.2, .7, .2, 1);
}
.lid__holes i:nth-child(2) { transition-delay: .09s; }
.lid__holes i:nth-child(3) { transition-delay: .18s; }
.lid--metro.lid--open .lid__holes i { transform: scale(1); }
.lid--metro.lid--s3 .lid__face, .lid--metro.lid--s4 .lid__face { transform: translateY(-92px) scale(.9); opacity: .2; transition: transform .45s cubic-bezier(.6, 0, .3, 1), opacity .45s ease .1s; }

/* Колода: 1 — бандероль снимается, 2 — верхняя карта переворачивается лицом, 3 — карта поднимается */
.lid--tarot .lid__face { perspective: 1200px; }
.tc {
  position: absolute; inset: 0;
  border-radius: 12px;
  backface-visibility: hidden;
  transition: transform .62s cubic-bezier(.55, 0, .25, 1);
}
.tc--back {
  background:
    repeating-linear-gradient(45deg,  transparent 0 11px, color-mix(in srgb, var(--paper) 34%, var(--back)) 11px 12.5px),
    repeating-linear-gradient(-45deg, transparent 0 11px, color-mix(in srgb, var(--paper) 34%, var(--back)) 11px 12.5px),
    var(--back);
  box-shadow: inset 0 0 0 9px var(--back), inset 0 0 0 11px var(--paper);
}
.tc--front {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4cqi;
  padding: 10cqi 8cqi;
  background: var(--paper);
  color: var(--ink);
  box-shadow: inset 0 0 0 8px var(--paper), inset 0 0 0 10px var(--chip), inset 0 0 0 14px var(--paper), inset 0 0 0 15px color-mix(in srgb, var(--ink) 40%, var(--paper));
  transform: rotateY(180deg);
  --arcana-ink: var(--ink);
}
.tc__title { font-family: var(--font-d); font-weight: 700; font-size: 9cqi; line-height: 1.1; text-align: center; text-wrap: balance; }
.tc__for { font-family: var(--font-b); font-size: 5.4cqi; color: var(--ink-soft); }
.lid--s1 .lid__band, .lid--s2 .lid__band, .lid--s3 .lid__band, .lid--s4 .lid__band { transform: translateX(115%) rotate(4deg); opacity: 0; }
.lid--tarot.lid--s2 .tc--back, .lid--tarot.lid--s3 .tc--back, .lid--tarot.lid--s4 .tc--back { transform: rotateY(-180deg); }
.lid--tarot.lid--s2 .tc--front, .lid--tarot.lid--s3 .tc--front, .lid--tarot.lid--s4 .tc--front { transform: none; }
.lid--tarot.lid--s3 .lid__face, .lid--tarot.lid--s4 .lid__face { transform: translateY(-10px) scale(1.04); transition: transform .4s cubic-bezier(.2, .7, .2, 1); }

/* Карта: 1 — печать ломается, 2 — свиток разворачивается, 3 — крест рисуется пером */
.lid--s1 .lid__seal--map, .lid--s2 .lid__seal--map, .lid--s3 .lid__seal--map, .lid--s4 .lid__seal--map { opacity: 0; transform: rotate(-6deg) scale(1.3); }
.lid__chart {
  display: grid; grid-template-rows: 0fr;
  transition: grid-template-rows .6s cubic-bezier(.3, 0, .2, 1), margin-top .6s;
}
.lid__chart-in { min-height: 0; overflow: hidden; }
.lid__chart svg { display: block; width: 100%; height: auto; }
.lid--map.lid--s2 .lid__chart, .lid--map.lid--s3 .lid__chart, .lid--map.lid--s4 .lid__chart { grid-template-rows: 1fr; margin-top: 18px; }
.lid__chart-isle { fill: color-mix(in srgb, var(--paper-edge) 60%, var(--paper)); stroke: var(--ink); stroke-width: 1.4; }
.lid__chart-way { fill: none; stroke: var(--ink); stroke-width: 1.4; stroke-dasharray: 3 4; }
.lid__chart-x {
  fill: none; stroke: var(--chip); stroke-width: 4; stroke-linecap: round;
  stroke-dasharray: 100; stroke-dashoffset: 100;
  transition: stroke-dashoffset .4s cubic-bezier(.5, 0, .3, 1);
}
.lid--map.lid--s3 .lid__chart-x, .lid--map.lid--s4 .lid__chart-x { stroke-dashoffset: 0; }

/* Футляр: 1 — бант развязывается, 2 — лента спадает, бирка уходит, 3 — футляр открывается, в нём кольцо */
.lid__ribbons {
  position: absolute; inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(90deg, transparent calc(50% - 15px), var(--ribbon-edge) calc(50% - 15px) calc(50% - 14px), var(--ribbon) calc(50% - 14px) calc(50% + 14px), var(--ribbon-edge) calc(50% + 14px) calc(50% + 15px), transparent calc(50% + 15px)),
    linear-gradient(transparent calc(30% - 15px), var(--ribbon-edge) calc(30% - 15px) calc(30% - 14px), var(--ribbon) calc(30% - 14px) calc(30% + 14px), var(--ribbon-edge) calc(30% + 14px) calc(30% + 15px), transparent calc(30% + 15px));
  transition: transform .45s cubic-bezier(.5, 0, .3, 1), opacity .45s;
}
.lid__bow { transition: transform .32s cubic-bezier(.5, 0, .3, 1), opacity .32s; }
.lid__ring {
  position: absolute; left: 50%; top: 42%;
  transform: translate(-50%, -50%) scale(.6);
  opacity: 0;
  transition: transform .4s cubic-bezier(.16, 1, .3, 1), opacity .3s;
}
.lid--ringbox.lid--s1 .lid__bow, .lid--ringbox.lid--s2 .lid__bow, .lid--ringbox.lid--s3 .lid__bow, .lid--ringbox.lid--s4 .lid__bow { transform: scale(.4) rotate(40deg); opacity: 0; }
.lid--ringbox.lid--s2 .lid__ribbons, .lid--ringbox.lid--s3 .lid__ribbons, .lid--ringbox.lid--s4 .lid__ribbons { transform: translateY(18px); opacity: 0; }
.lid--ringbox.lid--s2 .lid__tag, .lid--ringbox.lid--s3 .lid__tag, .lid--ringbox.lid--s4 .lid__tag { transform: rotate(10deg) translateY(30px); opacity: 0; transition: transform .45s cubic-bezier(.5, 0, .3, 1), opacity .45s; }
.lid--ringbox.lid--s3 .lid__ring, .lid--ringbox.lid--s4 .lid__ring { transform: translate(-50%, -50%) scale(1); opacity: 1; }

/* Зельеварня: 1 — сургуч откалывается, 2 — пробка выскакивает, 3 — зелье поднимается к горлышку */
.lid--potion.lid--s1 .lid__wax, .lid--potion.lid--s2 .lid__wax, .lid--potion.lid--s3 .lid__wax, .lid--potion.lid--s4 .lid__wax { transform: translate(18px, 12px) rotate(30deg); opacity: 0; }
.lid--potion.lid--s2 .lid__flask :deep(.fl__cork), .lid--potion.lid--s3 .lid__flask :deep(.fl__cork), .lid--potion.lid--s4 .lid__flask :deep(.fl__cork) { transform: translateY(-34px) rotate(-18deg); opacity: 0; }
.lid__flask :deep(.fl__potion)   { transition: y .7s cubic-bezier(.3, 0, .2, 1); }
.lid__flask :deep(.fl__meniscus) { transition: d .7s cubic-bezier(.3, 0, .2, 1); }

/* Вырубка: 1 — приглашение наклоняется, 2 — раскрывается, 3 — на тыкве прорезается лицо */
.lid--diecut .lid__face { perspective: 1200px; padding: 0; }
.inv {
  backface-visibility: hidden;
  transition: transform .6s cubic-bezier(.55, 0, .25, 1);
}
.inv--front { padding-bottom: 26px; background: var(--paper); }
.inv--inside {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
  background: var(--back);
  transform: rotateY(180deg);
}
.inv__name { margin: 0; font-family: var(--font-d); font-size: clamp(1.4rem, 9cqi, 2.2rem); color: var(--paper); }
.lid--diecut.lid--s1 .lid__face { transform: rotate(-4deg); }
.lid--diecut.lid--s2 .inv--front, .lid--diecut.lid--s3 .inv--front, .lid--diecut.lid--s4 .inv--front { transform: rotateY(-180deg); }
.lid--diecut.lid--s2 .inv--inside, .lid--diecut.lid--s3 .inv--inside, .lid--diecut.lid--s4 .inv--inside { transform: none; }


@media (prefers-reduced-motion: reduce) {
  .lid { transition: none; }
  .case__cover, .case__sheet, .case__thread, .case__tie { transition: none; }
  .case__sheet-stamp { animation: none; }
  .lid__letter, .lid__holes i, .lid__lamp, .tc, .lid__chart, .lid__chart-x, .lid__ribbons, .lid__ring, .inv { transition: none; }
  .lid__flap, .lid--metro .lid__face, .lid__band, .lid__seal--map, .lid__tag, .lid__wax,
  .lid__flask :deep(.fl__cork), .lid--diecut .lid__face { transition: none; }
}
</style>
