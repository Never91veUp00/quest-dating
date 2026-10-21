<template>
  <div class="splash" :class="decor && `splash--${decor}`">
    <div class="splash__inner">
      <header class="splash__head">
        <h1 class="splash__title">{{ questData.title }}</h1>
        <p v-if="questData.client_name" class="splash__for">
          Кому: <b>{{ questData.client_name }}</b>
        </p>
      </header>

      <!-- Код доступа: до него сервер не отдаёт ни блоков, ни сводки -->
      <section v-if="requiresCode" class="splash__code" aria-labelledby="code-label">
        <label id="code-label" for="access-code" class="splash__h">Код доступа</label>
        <p class="splash__note">Его знает тот, кто подарил тебе этот квест.</p>
        <div class="splash__code-row">
          <input
            id="access-code"
            v-model="codeInput"
            type="text"
            class="splash__code-input"
            :class="{ shake: codeError }"
            :aria-invalid="!!codeError"
            aria-describedby="code-error"
            inputmode="text"
            maxlength="20"
            autocomplete="off"
            spellcheck="false"
            @keyup.enter="submitCode"
          />
        </div>
        <p v-if="codeError" id="code-error" class="splash__code-error" role="alert">{{ codeError }}</p>
        <button class="task__action splash__cta" :disabled="!codeInput.trim()" @click="submitCode">
          Открыть
        </button>
      </section>

      <template v-else>
        <!-- Факты с коробки -->
        <p class="splash__facts">
          <span><b>{{ totalBlocks }}</b> {{ plural(totalBlocks, ...(theme.copy.blockForms ?? ['участок', 'участка', 'участков'])) }}</span>
          <span><b>{{ totalTasks }}</b> {{ plural(totalTasks, ...(theme.copy.cellForms ?? ['клетка', 'клетки', 'клеток'])) }}</span>
          <span v-if="minutes">около <b>{{ minutes }}</b> мин</span>
        </p>
        <p v-if="difficultyLabel || placeLabel" class="splash__facts splash__facts--soft">
          <span v-if="difficultyLabel">{{ difficultyLabel }}</span>
          <span v-if="placeLabel">{{ placeLabel }}</span>
        </p>

        <!-- Текст автора -->
        <section v-if="questData.briefing" class="splash__brief" aria-labelledby="brief-h">
          <template v-if="decor === 'casefile'">
            <span class="splash__tape splash__tape--l" aria-hidden="true"></span>
            <span class="splash__tape splash__tape--r" aria-hidden="true"></span>
          </template>
          <span v-else-if="decor === 'letters'" class="splash__flap" aria-hidden="true"></span>
          <span v-else-if="decor === 'metro'" class="splash__perf" aria-hidden="true"></span>
          <span v-else-if="decor === 'tarot'" class="splash__frame" aria-hidden="true"></span>
          <span v-else-if="decor === 'ringbox'" class="splash__stitch" aria-hidden="true"></span>
          <span v-else-if="decor === 'potion'" class="splash__rule" aria-hidden="true"></span>
          <h2 id="brief-h" class="splash__h splash__h--ink">Перед стартом</h2>
          <p class="splash__brief-text">{{ questData.briefing }}</p>
        </section>

        <!-- Видео-инструкция (или демо) и правило игры -->
        <div class="splash__how">
          <QuestHowTo :theme="theme" />
          <p class="splash__note">Клетки открываются по очереди. Подглядывать вперёд не получится — так задумано.</p>
        </div>

        <button class="task__action splash__cta splash__cta--sticky" @click="$emit('start')">
          {{ startLabel }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QuestHowTo from './QuestHowTo.vue'
import { plural } from './themes.js'

// Внутренняя сторона крышки: правила игры, текст автора, спид-демо, старт.
const props = defineProps({
  questData:    { type: Object, required: true },
  theme:        { type: Object, required: true },
  requiresCode: { type: Boolean, default: false },
  codeError:    { type: String, default: '' },
})

const emit = defineEmits(['start', 'submit-code'])

const codeInput = ref('')
const submitCode = () => { if (codeInput.value.trim()) emit('submit-code', codeInput.value) }

const decor = computed(() => props.theme.world?.decor ?? null)

const totalBlocks = computed(() => props.questData.blocks?.length || 0)
const totalTasks  = computed(() =>
  (props.questData.blocks || []).reduce((s, b) => s + (b.tasks?.length || 0), 0)
)
const minutes = computed(() => props.questData.duration_minutes || null)

const difficultyLabel = computed(() => ({
  easy:   'Лёгкая сложность',
  medium: 'Средняя сложность',
  hard:   'Высокая сложность',
  expert: 'Для знатоков',
}[props.questData.difficulty] || null))

const placeLabel = computed(() => ({
  indoor:    'проходится дома',
  park:      'проходится в парке',
  city:      'проходится в городе',
  universal: 'проходится где угодно',
}[props.questData.location_type] || null))

// Кнопка — глагол из темы, без эмодзи
const startLabel = computed(() =>
  (props.theme.copy?.startBtn || 'Начать').replace(/\p{Extended_Pictographic}/gu, '').trim()
)

</script>

<style scoped>
.splash {
  min-height: 100dvh;
  background: var(--field);
  color: var(--field-ink);
  padding: 40px 16px max(20px, env(safe-area-inset-bottom));
}
.splash__inner {
  max-width: 560px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 22px;
}

.splash__title {
  margin: 0;
  font-family: var(--font-d);
  font-weight: 400;
  font-size: clamp(1.7rem, 8vw, 2.8rem);
  line-height: 1.04;
  hyphens: auto;
  overflow-wrap: break-word;
  letter-spacing: -0.01em;
  text-wrap: balance;
}
.splash__for {
  margin: 10px 0 0;
  font-family: var(--font-b);
  font-size: 1.15rem;
  color: var(--field-ink-soft);
}
.splash__for b { color: var(--field-ink); }

.splash__facts {
  display: flex; flex-wrap: wrap; gap: 6px 18px;
  margin: 0;
  font-family: var(--font-b);
  font-size: 1.1rem;
  font-variant-numeric: tabular-nums;
}
.splash__facts b { font-family: var(--font-d); font-weight: 400; font-size: 1.3rem; }
.splash__facts--soft { margin-top: -14px; color: var(--field-ink-soft); font-size: 1rem; }

.splash__h {
  display: block;
  margin: 0 0 12px;
  font-family: var(--font-d);
  font-weight: 400;
  font-size: 1.3rem;
  color: var(--field-ink);
}
.splash__h--ink { color: var(--ink); }
.splash__note {
  margin: 10px 0 0;
  font-family: var(--font-b);
  font-size: 1rem;
  line-height: 1.45;
  color: var(--field-ink-soft);
}

/* ── Перед стартом: лист автора ───────────────────────────────── */
.splash__brief {
  position: relative;
  background: var(--paper);
  color: var(--ink);
  border-radius: 12px;
  padding: 20px 18px;
  box-shadow: 0 16px 24px -16px color-mix(in srgb, var(--rule) 80%, transparent);
}
.splash__brief-text {
  margin: 0;
  font-family: var(--font-b);
  font-size: 1.08rem;
  line-height: 1.55;
  white-space: pre-line;
}
.splash--casefile .splash__brief { border-radius: 3px; padding-top: 26px; }
.splash__tape {
  position: absolute; top: -10px;
  width: 72px; height: 22px;
  background: color-mix(in srgb, var(--paper-edge) 70%, transparent);
}
.splash__tape--l { left: 14px; transform: rotate(-6deg); }
.splash__tape--r { right: 14px; transform: rotate(5deg); }

/* Обличье переписки: письмо автора над открытым конвертом, обращение от руки */
.splash--letters .splash__brief { border-radius: 2px; margin-top: 10px; }
.splash--letters .splash__brief .splash__h {
  font-family: var(--font-h);
  font-weight: 400;
  font-size: 1.5rem;
}
.splash__flap {
  position: absolute; left: 50%; bottom: 100%;
  width: 62%; height: 18px;
  transform: translateX(-50%);
  background: var(--paper-edge);
  clip-path: polygon(0 100%, 50% 0, 100% 100%);
}

/* Обличье схемы: «Перед стартом» — талон с полосой и линией отрыва */
.splash--metro .splash__brief {
  border-radius: 6px;
  padding-top: 42px;
  box-shadow:
    inset 0 12px 0 var(--chip),
    0 16px 24px -16px color-mix(in srgb, var(--rule) 55%, transparent);
}
.splash--metro .splash__brief::before,
.splash--metro .splash__brief::after {
  content: "";
  position: absolute; top: 18px;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: var(--field);
}
.splash--metro .splash__brief::before { left: -8px; }
.splash--metro .splash__brief::after  { right: -8px; }
.splash__perf {
  position: absolute; left: 14px; right: 14px; top: 25px;
  border-top: 2px dashed color-mix(in srgb, var(--ink) 35%, var(--paper));
}
.splash--metro .splash__title { font-weight: 700; }

/* Обличье вырубки: «Перед стартом» — кремовая карточка с вогнутыми углами */
.splash--diecut .splash__brief {
  border: none;
  border-radius: 0;
  background:
    radial-gradient(circle at 0 0,       transparent 11px, var(--paper) 11.5px) top left     / 51% 51% no-repeat,
    radial-gradient(circle at 100% 0,    transparent 11px, var(--paper) 11.5px) top right    / 51% 51% no-repeat,
    radial-gradient(circle at 0 100%,    transparent 11px, var(--paper) 11.5px) bottom left  / 51% 51% no-repeat,
    radial-gradient(circle at 100% 100%, transparent 11px, var(--paper) 11.5px) bottom right / 51% 51% no-repeat;
  box-shadow: none;
  filter: drop-shadow(0 14px 14px color-mix(in srgb, var(--rule) 80%, transparent));
  padding: 22px 20px 20px;
}

/* Обличье зельеварни: «Перед стартом» — страница рецепта */
.splash--potion .splash__brief {
  border: none;
  border-radius: 6px;
  box-shadow:
    0 1px 0 var(--paper-edge),
    0 18px 26px -16px color-mix(in srgb, var(--rule) 90%, transparent);
  padding-top: 26px;
}
/* шапка страницы рецепта: двойная линейка под заголовком, как в старой книге */
.splash__rule {
  position: absolute; left: 18px; right: 18px; top: 10px;
  height: 4px;
  border-top: 1.5px solid color-mix(in srgb, var(--ink) 55%, var(--paper));
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 30%, var(--paper));
  pointer-events: none;
}
.splash--potion .splash__title { font-weight: 700; }

/* Обличье футляра: «Перед стартом» — шёлковая карточка с прострочкой */
.splash--ringbox .splash__brief {
  border: none;
  border-radius: 12px;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--rule) 14%, transparent),
    0 16px 24px -16px color-mix(in srgb, var(--rule) 55%, transparent);
  padding: 24px 22px 22px;
}
.splash__stitch {
  position: absolute;
  pointer-events: none;
}
/* прострочка подкладки: пунктирный шов, отступивший от края */
.splash__stitch { inset: 7px; border: 1.5px dashed color-mix(in srgb, var(--ink) 28%, var(--paper)); border-radius: 7px; }

/* Обличье карты: «Перед стартом» — обрывок пергамента */
.splash--map .splash__brief { border-radius: 0; margin: 8px 0; }
.splash--map .splash__brief::before,
.splash--map .splash__brief::after {
  content: "";
  position: absolute; left: 0; right: 0;
  height: 7px;
  background: var(--paper);
  pointer-events: none;
}
.splash--map .splash__brief::before { bottom: calc(100% - 1px); clip-path: polygon(0 100%, 0.0% 43%, 3.8% 28%, 7.7% 70%, 11.5% 21%, 15.4% 61%, 19.2% 46%, 23.1% 20%, 26.9% 58%, 30.8% 18%, 34.6% 52%, 38.5% 21%, 42.3% 23%, 46.2% 51%, 50.0% 85%, 53.8% 26%, 57.7% 34%, 61.5% 68%, 65.4% 96%, 69.2% 64%, 73.1% 49%, 76.9% 98%, 80.8% 19%, 84.6% 88%, 88.5% 40%, 92.3% 27%, 96.2% 25%, 100.0% 41%, 100% 100%); }
.splash--map .splash__brief::after  { top: calc(100% - 1px);    clip-path: polygon(0 0, 0.0% 69%, 3.8% 15%, 7.7% 49%, 11.5% 54%, 15.4% 32%, 19.2% 47%, 23.1% 5%, 26.9% 5%, 30.8% 18%, 34.6% 58%, 38.5% 36%, 42.3% 27%, 46.2% 50%, 50.0% 39%, 53.8% 25%, 57.7% 68%, 61.5% 59%, 65.4% 21%, 69.2% 49%, 73.1% 45%, 76.9% 74%, 80.8% 62%, 84.6% 24%, 88.5% 83%, 92.3% 10%, 96.2% 36%, 100.0% 64%, 100% 0); }

/* Обличье колоды: «Перед стартом» — карта с гравированной рамкой */
.splash--tarot .splash__brief {
  border-radius: 8px;
  padding: 26px 24px 24px;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--rule) 50%, transparent),
    0 2px 0 var(--paper-edge),
    0 16px 24px -16px color-mix(in srgb, var(--rule) 90%, transparent);
}
.splash__frame,
.splash__frame::after {
  position: absolute;
  border-radius: 4px;
  pointer-events: none;
}
.splash__frame { inset: 8px; border: 1.5px solid color-mix(in srgb, var(--ink) 70%, var(--paper)); }
.splash__frame::after {
  content: "";
  inset: 3px;
  border: 1px solid color-mix(in srgb, var(--ink) 40%, var(--paper));
  border-radius: 2px;
}
.splash--tarot .splash__title,
.splash--tarot .splash__brief .splash__h { font-weight: 700; }

/* ── Код доступа ──────────────────────────────────────────────── */
.splash__code { display: flex; flex-direction: column; }
.splash__code .splash__note { margin: 0 0 14px; }
.splash__code-input {
  width: 100%;
  min-height: 60px;
  padding: 0 16px;
  background: var(--paper);
  color: var(--ink);
  caret-color: var(--chip);
  border: 3px solid var(--rule);
  border-radius: 12px;
  font-family: var(--font-d);
  font-size: 1.4rem;
  letter-spacing: .2em;
  text-align: center;
  text-transform: uppercase;
  outline: none;
  box-sizing: border-box;
}
.splash__code-input:focus { box-shadow: 0 0 0 4px color-mix(in srgb, var(--chip) 45%, transparent); }
.splash__code-input.shake { animation: shake .4s ease; }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
.splash__code-error {
  margin: 10px 0 0;
  padding: 10px 14px;
  background: var(--paper);
  color: var(--wrong);
  border-radius: 10px;
  font-family: var(--font-b);
  font-size: 1rem;
}
.splash__cta { margin-top: 16px; }
/* кнопка на поле: кольцо фокуса мелом, как у остальных элементов поля */
.splash__cta:focus-visible { outline-color: var(--field-ink); }

/* Кнопка старта под большим пальцем */
.splash__cta--sticky {
  position: sticky;
  bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 5;
  margin-top: 4px;
  box-shadow: 0 0 0 8px var(--field);
}

@media (prefers-reduced-motion: reduce) {
  .splash__code-input.shake { animation: none; }
}
</style>
