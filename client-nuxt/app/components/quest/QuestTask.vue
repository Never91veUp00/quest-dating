<template>
  <article
    class="task"
    :class="{
      'task--review':   mode === 'review',
      'task--nudge':    nudge,
      'task--wrong':    mode === 'review' && earnedEntry?.wrong,
      'task--casefile': decor === 'casefile',
      'task--letters':  decor === 'letters',
      'task--metro':    decor === 'metro',
      'task--tarot':    decor === 'tarot',
      'task--map':      decor === 'map',
      'task--ringbox':  decor === 'ringbox',
      'task--potion':   decor === 'potion',
      'task--diecut':   decor === 'diecut',
      [`task--${task.type}`]: true,
    }"
  >
    <template v-if="decor === 'casefile'">
      <span class="task__tape task__tape--l" aria-hidden="true"></span>
      <span class="task__tape task__tape--r" aria-hidden="true"></span>
    </template>
    <!-- Письмо вынуто из конверта: над листом стоит открытый клапан -->
    <span v-else-if="decor === 'letters'" class="task__flap" aria-hidden="true"></span>
    <span v-else-if="decor === 'metro'" class="task__perf" aria-hidden="true"></span>
    <!-- Вытянутая карта: двойная гравированная рамка по обрезу -->
    <span v-else-if="decor === 'tarot'" class="task__frame" aria-hidden="true"></span>
    <!-- Шёлк подкладки: прострочка по краю -->
    <span v-else-if="decor === 'ringbox'" class="task__stitch" aria-hidden="true"></span>
    <span v-else-if="decor === 'potion'" class="task__rule" aria-hidden="true"></span>

    <!-- Отметка мира: неверно / верно / отложено -->
    <QuestMark v-if="mark" :key="mark.key" :decor="decor" :kind="mark.kind" />

    <!-- Угол карточки: номер клетки и тип задания -->
    <header class="task__head">
      <span class="task__corner">
        <span class="task__no">{{ decor === 'tarot' ? roman(index + 1) : index + 1 }}</span>
        <QuestIcon :name="typeIcon" :size="20" />
        <span class="sr-only">{{ typeLabel }}</span>
      </span>
      <h3 class="task__title">{{ task.title }}</h3>
    </header>

    <div v-if="task.description" class="task__desc">
      <div v-if="task.description_type === 'html'" class="task__desc--html" v-html="task.description"></div>
      <template v-else>
        <p v-for="(para, pi) in descParagraphs" :key="pi">{{ para }}</p>
      </template>
    </div>

    <!-- Перечитывание пройденной клетки -->
    <template v-if="mode === 'review'">
      <p v-if="task.hint" class="task__hint">
        <QuestIcon name="hint" :size="18" />
        <span>{{ task.hint }}</span>
      </p>
      <p v-if="shownAnswer" class="task__answer">
        Ответ: <b>{{ shownAnswer }}</b>
      </p>
      <p class="task__result">
        <template v-if="earnedEntry?.wrong">Пропущено</template>
        <template v-else>
          {{ theme.copy.taskDone }}<span v-if="task.points"> · +{{ earnedEntry?.points ?? task.points }} {{ pointsWord(theme, earnedEntry?.points ?? task.points) }}</span>
        </template>
      </p>
    </template>

    <!-- Активная клетка → подкомпонент задания -->
    <div v-else-if="taskComponent" class="task__body">
      <component
        :is="taskComponent"
        :task="task"
        :theme="theme"
        @complete="onComplete"
        @hint="$emit('hint', $event)"
        @answer-change="$emit('answer-change', $event)"
        @skip-task="onSkip"
        @wrong="onWrong"
      />
    </div>
  </article>
</template>

<script setup>
import { computed, ref, onUnmounted } from 'vue'
import QuestIcon        from './QuestIcon.vue'
import { taskIcon }     from './taskIcons.js'
import QuestMark        from './QuestMark.vue'
import { pointsWord, roman } from './themes.js'
import TaskSimple       from './tasks/TaskSimple.vue'
import TaskRiddle       from './tasks/TaskRiddle.vue'
import TaskCodePhysical from './tasks/TaskCodePhysical.vue'
import TaskLocation     from './tasks/TaskLocation.vue'
import TaskSelfie       from './tasks/TaskSelfie.vue'
import TaskPhoto        from './tasks/TaskPhoto.vue'
import TaskTextAnswer   from './tasks/TaskTextAnswer.vue'
import TaskMedia        from './tasks/TaskMedia.vue'
import TaskQr           from './tasks/TaskQr.vue'
import TaskMiniGame     from './tasks/TaskMiniGame.vue'

const props = defineProps({
  task:        { type: Object, required: true },
  theme:       { type: Object, required: true },
  index:       { type: Number, default: 0 },
  mode:        { type: String, default: 'active' }, // 'active' | 'review'
  earnedEntry: { type: Object, default: null },
})
const emit = defineEmits(['complete', 'hint', 'answer-change', 'skip-task'])

const TYPE_MAP = {
  simple:        TaskSimple,
  riddle:        TaskRiddle,
  code_physical: TaskCodePhysical,
  location:      TaskLocation,
  selfie:        TaskSelfie,
  photo:         TaskPhoto,
  text_answer:   TaskTextAnswer,
  media:         TaskMedia,
  qr:            TaskQr,
  mini_game:     TaskMiniGame,
}

const taskComponent = computed(() => TYPE_MAP[props.task.type] || null)
const decor = computed(() => props.theme.world?.decor ?? null)

// ─── Реакции карточки ───────────────────────────────────────
// Отметка мира ложится на угол карточки. Верный ответ и пропуск сначала
// отмечаются на карточке и лишь потом уходят наверх — ход на доске после отметки.
const REACT_MS = 520
const mark = ref(null)
let markKey = 0
let passTimer = null
const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const showMark = (kind) => { mark.value = { kind, key: ++markKey } }
const pass = (event, payload, kind) => {
  if (passTimer) return
  showMark(kind)
  passTimer = setTimeout(() => { passTimer = null; emit(event, payload) }, reduced() ? 120 : REACT_MS)
}
// угадайка с неверным выбором уже отмечена «неверно» при выборе — дальше без второй отметки
const onComplete = (payload) => payload?._quizWrong ? emit('complete', payload) : pass('complete', payload, 'right')
const onSkip     = (payload) => pass('skip-task', payload, 'skip')
const nudge = ref(false)
const onWrong = () => {
  showMark('wrong')
  nudge.value = false
  requestAnimationFrame(() => { nudge.value = true })
}
onUnmounted(() => clearTimeout(passTimer))

const descParagraphs = computed(() =>
  props.task.description?.split(/\n{2,}/).map(p => p.trim()).filter(Boolean) || []
)

// Ответ показываем только при перечитывании и только для заданий с вводом
const shownAnswer = computed(() => {
  const t = props.task
  if (t.ignore_answer) return null
  if (t.type === 'code_physical') return t.correct_code || t.answer || null
  if (t.type === 'riddle' || t.type === 'text_answer') return t.answer || null
  return null
})

const typeIcon = computed(() => taskIcon(props.task.type))

const typeLabel = computed(() => ({
  simple:        'Задание',
  riddle:        'Загадка',
  code_physical: 'Код',
  location:      'Локация',
  selfie:        'Селфи',
  photo:         'Фото',
  text_answer:   'Ответ',
  media:         'Медиа',
  qr:            'QR-код',
  mini_game:     'Мини-игра',
}[props.task.type] || 'Задание'))
</script>

<style scoped>
/* Неверный ответ: поле ответа один раз коротко отступает и возвращается — без тряски */
.task--nudge :deep(.task__input) { animation: input-nudge .26s cubic-bezier(.2, .7, .2, 1) both; border-color: var(--wrong); }
@keyframes input-nudge {
  0%   { transform: translateX(0); }
  35%  { transform: translateX(-7px); }
  100% { transform: translateX(0); }
}
@media (prefers-reduced-motion: reduce) {
  .task--nudge :deep(.task__input) { animation: none; }
}

/* ── Карточка: игровая бумага ─────────────────────────────────── */
.task {
  position: relative;
  background: var(--paper);
  color: var(--ink);
  border: 3px solid var(--rule);
  border-bottom-width: 7px;
  border-radius: 14px;
  padding: 18px 18px 20px;
  display: flex; flex-direction: column; gap: 14px;
  box-shadow: 0 14px 22px -14px color-mix(in srgb, var(--rule) 70%, transparent);
}

/* Обличье дела: лист на скотче, без контура */
.task--casefile {
  border: none;
  border-radius: 3px;
  padding: 26px 20px 22px;
  box-shadow:
    0 1px 0 var(--paper-edge),
    0 18px 26px -16px color-mix(in srgb, var(--rule) 80%, transparent);
}
.task__tape {
  position: absolute; top: -10px;
  width: 78px; height: 24px;
  background: color-mix(in srgb, var(--paper-edge) 70%, transparent);
  border-left: 1px dashed color-mix(in srgb, var(--rule) 18%, transparent);
  border-right: 1px dashed color-mix(in srgb, var(--rule) 18%, transparent);
}
.task__tape--l { left: 14px;  transform: rotate(-7deg); }
.task__tape--r { right: 14px; transform: rotate(6deg); }

/* Обличье схемы: талон с цветной полосой, корешок отделён перфорацией */
.task--metro {
  border: none;
  border-radius: 6px;
  padding: 44px 20px 22px;
  box-shadow:
    inset 0 12px 0 var(--chip),
    0 1px 0 var(--paper-edge),
    0 16px 24px -16px color-mix(in srgb, var(--rule) 55%, transparent);
}
/* вырубка по краям линии отрыва — видно поле под талоном */
.task--metro::before,
.task--metro::after {
  content: "";
  position: absolute; top: 18px;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: var(--field);
}
.task--metro::before { left: -8px; }
.task--metro::after  { right: -8px; }
.task__perf {
  position: absolute; left: 14px; right: 14px; top: 25px;
  border-top: 2px dashed color-mix(in srgb, var(--ink) 35%, var(--paper));
}
/* номер — станция, как на линии */
.task--metro .task__corner { gap: 4px; }
.task--metro .task__no {
  display: grid; place-items: center;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--plate);
  border: 5px solid var(--chip);
  font-size: 1.1rem;
  font-weight: 700;
}
.task--metro .task__title { font-weight: 700; letter-spacing: -0.01em; }

/* Обличье вырубки: кремовая карточка с вогнутыми углами штанцевого ножа, номер — на оранжевой бирке */
.task--diecut {
  border: none;
  border-radius: 0;
  background:
    radial-gradient(circle at 0 0,       transparent 11px, var(--paper) 11.5px) top left     / 51% 51% no-repeat,
    radial-gradient(circle at 100% 0,    transparent 11px, var(--paper) 11.5px) top right    / 51% 51% no-repeat,
    radial-gradient(circle at 0 100%,    transparent 11px, var(--paper) 11.5px) bottom left  / 51% 51% no-repeat,
    radial-gradient(circle at 100% 100%, transparent 11px, var(--paper) 11.5px) bottom right / 51% 51% no-repeat;
  box-shadow: none;
  filter: drop-shadow(0 14px 14px color-mix(in srgb, var(--rule) 80%, transparent));
  padding: 24px 22px 22px;
}
.task--diecut .task__corner { flex-direction: row; align-items: center; gap: 8px; }
.task--diecut .task__no {
  display: grid; place-items: center;
  min-width: 40px; height: 32px;
  padding: 0 7px;
  border: 1.5px solid var(--rule);
  border-radius: 999px;
  background: var(--chip);
  font-size: 1.25rem;
}

/* Обличье зельеварни: страница рецепта, номер — на ярлыке флакона с подрезанными углами */
.task--potion {
  border: none;
  border-radius: 6px;
  box-shadow:
    0 1px 0 var(--paper-edge),
    0 18px 26px -16px color-mix(in srgb, var(--rule) 90%, transparent);
  padding: 26px 20px 22px;
}
/* шапка страницы рецепта: двойная линейка под заголовком, как в старой книге */
.task__rule {
  position: absolute; left: 18px; right: 18px; top: 10px;
  height: 4px;
  border-top: 1.5px solid color-mix(in srgb, var(--ink) 55%, var(--paper));
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 30%, var(--paper));
  pointer-events: none;
}
.task--potion .task__no {
  --cut: 6px;
  position: relative;
  isolation: isolate;
  display: grid; place-items: center;
  min-width: 42px; height: 30px;
  padding: 0 7px;
  background: var(--rule);
  clip-path: polygon(var(--cut) 0, calc(100% - var(--cut)) 0, 100% var(--cut), 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, var(--cut) 100%, 0 calc(100% - var(--cut)), 0 var(--cut));
  transform: rotate(-2deg);
  font-size: 1.15rem;
  font-weight: 700;
}
/* бумага ярлыка — внутренний слой той же формы, контур остаётся по всем граням, включая срезы */
.task--potion .task__no::before {
  content: "";
  position: absolute; inset: 1.5px;
  z-index: -1;
  background: var(--paper);
  clip-path: polygon(calc(var(--cut) - .6px) 0, calc(100% - var(--cut) + .6px) 0, 100% calc(var(--cut) - .6px), 100% calc(100% - var(--cut) + .6px), calc(100% - var(--cut) + .6px) 100%, calc(var(--cut) - .6px) 100%, 0 calc(100% - var(--cut) + .6px), 0 calc(var(--cut) - .6px));
}
.task--potion .task__title { font-weight: 700; }

/* Обличье футляра: шёлковая карточка подкладки с прострочкой, номер — на бархатной крышке */
.task--ringbox {
  border: none;
  border-radius: 12px;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--rule) 14%, transparent),
    0 16px 24px -16px color-mix(in srgb, var(--rule) 55%, transparent);
  padding: 24px 22px 22px;
}
.task__stitch {
  position: absolute;
  pointer-events: none;
}
/* прострочка подкладки: пунктирный шов, отступивший от края */
.task__stitch { inset: 7px; border: 1.5px dashed color-mix(in srgb, var(--ink) 28%, var(--paper)); border-radius: 7px; }
.task--ringbox .task__no {
  display: grid; place-items: center;
  width: 42px; height: 42px;
  border: 1.5px solid var(--rule);
  border-radius: 9px 9px 7px 7px;
  background: var(--back);
  font-size: 1.3rem;
}

/* Обличье карты: обрывок пергамента, рваный край сверху и снизу, номер — метка в кружке */
.task--map {
  margin: 8px 0;
  border: none;
  border-radius: 0;
  padding: 22px 20px 22px;
  box-shadow: 0 18px 26px -16px color-mix(in srgb, var(--rule) 90%, transparent);
}
.task--map::before,
.task--map::after {
  content: "";
  position: absolute; left: 0; right: 0;
  height: 7px;
  background: var(--paper);
  pointer-events: none;
}
.task--map::before { bottom: calc(100% - 1px); clip-path: var(--torn-top); }
.task--map::after  { top: calc(100% - 1px);    clip-path: var(--torn-bottom); }
.task--map .task__no {
  display: grid; place-items: center;
  width: 42px; height: 42px;
  border: 2px solid var(--ink);
  border-radius: 50%;
  font-size: 1.35rem;
}

/* Обличье колоды: вытянутая карта слоновой бумаги, рамка гравюрой */
.task--tarot {
  border: none;
  border-radius: 8px;
  padding: 28px 24px 24px;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--rule) 50%, transparent),
    0 2px 0 var(--paper-edge),
    0 18px 26px -16px color-mix(in srgb, var(--rule) 90%, transparent);
}
.task__frame,
.task__frame::after {
  position: absolute;
  border-radius: 4px;
  pointer-events: none;
}
.task__frame { inset: 8px; border: 1.5px solid color-mix(in srgb, var(--ink) 70%, var(--paper)); }
.task__frame::after {
  content: "";
  inset: 3px;
  border: 1px solid color-mix(in srgb, var(--ink) 40%, var(--paper));
  border-radius: 2px;
}
.task--tarot .task__no { font-weight: 700; font-size: 1.35rem; letter-spacing: .03em; }
.task--tarot .task__title { font-weight: 700; line-height: 1.1; }

/* Обличье переписки: лист письма над открытым конвертом, номер — на марке */
.task--letters {
  margin-top: 6px;
  border: none;
  border-radius: 2px;
  padding: 22px 20px 22px;
  box-shadow:
    0 1px 0 var(--paper-edge),
    0 18px 26px -16px color-mix(in srgb, var(--rule) 80%, transparent);
}
.task__flap {
  position: absolute; left: 50%; bottom: 100%;
  width: 62%; height: 18px;
  transform: translateX(-50%);
  background: var(--paper-edge);
  clip-path: polygon(0 100%, 50% 0, 100% 100%);
}
/* подкладка конверта: тонкая печатная полоска цвета ленты */
.task__flap::after {
  content: "";
  position: absolute; inset: 5px 14% 0;
  background: repeating-linear-gradient(115deg,
    color-mix(in srgb, var(--chip) 55%, var(--paper-edge)) 0 2px,
    var(--paper-edge) 2px 6px);
  clip-path: polygon(0 100%, 50% 0, 100% 100%);
}
.task--letters .task__corner {
  padding: 6px 7px 5px;
  min-width: 44px;
  background: color-mix(in srgb, var(--chip) 30%, var(--paper));
  color: var(--ink-soft);
  transform: rotate(2deg);
  /* зубцы марки: дырочки перфорации только по кромке */
  --perf: radial-gradient(circle, transparent 1.6px, currentColor 1.8px) 50% 50% / 6px 6px round;
  -webkit-mask: linear-gradient(currentColor 0 0) content-box, var(--perf);
          mask: linear-gradient(currentColor 0 0) content-box, var(--perf);
}
.task--letters .task__corner::before {
  content: "";
  position: absolute; inset: 5px;
  border: 1.5px solid color-mix(in srgb, var(--chip) 70%, var(--ink));
  pointer-events: none;
}
.task--letters .task__corner { position: relative; }
.task--letters .task__no { font-weight: 700; }
.task--letters .task__title { font-weight: 700; line-height: 1.08; }

.task__head { display: flex; align-items: flex-start; gap: 12px; }
.task__corner {
  flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  min-width: 34px;
  color: var(--ink-soft);
}
.task__no {
  font-family: var(--font-d);
  font-size: 1.6rem;
  line-height: 1;
  color: var(--ink);
}
.task__title {
  margin: 2px 0 0;
  font-family: var(--font-d);
  font-weight: 400;
  font-size: clamp(1.25rem, 5.4vw, 1.5rem);
  line-height: 1.15;
  color: var(--ink);
  text-wrap: balance;
}

.task__desc { display: flex; flex-direction: column; gap: 10px; }
.task__desc p, .task__desc--html {
  margin: 0;
  font-family: var(--font-b);
  font-size: 1.08rem;
  line-height: 1.55;
  color: var(--ink);
  white-space: pre-line;
}
.task__desc--html { white-space: normal; }
.task__desc--html :deep(p) { margin: 0 0 .6em; }
.task__desc--html :deep(ul), .task__desc--html :deep(ol) { padding-left: 1.4em; margin: .3em 0; }
.task__desc--html :deep(b), .task__desc--html :deep(strong) { font-weight: 700; }

/* ── Перечитывание ────────────────────────────────────────────── */
.task__hint {
  display: flex; gap: 8px; align-items: flex-start;
  margin: 0;
  padding: 12px 14px;
  background: color-mix(in srgb, var(--done) 30%, var(--paper));
  border-radius: 10px;
  font-family: var(--font-b);
  font-size: 1rem; line-height: 1.5;
}
.task__answer {
  margin: 0;
  font-family: var(--font-b);
  font-size: 1.05rem;
}
.task__answer b { font-family: var(--font-d); font-weight: 400; letter-spacing: .02em; }
.task__result {
  margin: 0;
  padding-top: 12px;
  border-top: 2px dashed color-mix(in srgb, var(--ink) 30%, var(--paper));
  font-family: var(--font-d);
  font-size: 1rem;
  color: var(--ink-soft);
}
.task--wrong .task__result { color: var(--wrong); }

.sr-only {
  position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0;
  overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
}

/* ── Общий интерфейс подкомпонентов ───────────────────────────── */
:deep(.task__row) { display: flex; gap: 8px; }
:deep(.task__question) {
  margin: 0;
  font-family: var(--font-b);
  font-size: 1.05rem; font-style: italic; line-height: 1.5;
  color: var(--ink);
  background: color-mix(in srgb, var(--paper-edge) 28%, var(--paper));
  padding: 12px 14px; border-radius: 10px;
}
:deep(.task__instruction) {
  margin: 0;
  font-family: var(--font-b);
  font-size: 1rem; font-style: italic; color: var(--ink-soft);
}
:deep(.task__input) {
  flex: 1;
  min-width: 0;
  min-height: 54px;
  padding: 12px 14px;
  background: var(--paper);
  border: 2px solid color-mix(in srgb, var(--ink) 55%, var(--paper));
  border-radius: 10px;
  color: var(--ink);
  caret-color: var(--chip);
  font-family: var(--font-b);
  font-size: 1.1rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color .2s;
}
:deep(.task__input::placeholder) { color: var(--ink-soft); opacity: 1; }
/* Поле в фокусе всегда остаётся над прилипшей кнопкой */
:deep(.task__input) { scroll-margin-bottom: calc(96px + var(--kb, 0px)); }
:deep(.task__input:focus) { border-color: var(--ink); box-shadow: 0 0 0 3px color-mix(in srgb, var(--focus) 35%, transparent); }
:deep(.task__input--code) { font-family: var(--font-d); letter-spacing: .25em; text-align: center; }
:deep(.task__input.shake) { animation: shake .4s ease; border-color: var(--wrong); }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }

:deep(.task__ok) {
  min-height: 54px;
  padding: 0 18px;
  background: var(--action);
  color: var(--action-ink);
  border: none;
  border-radius: 10px;
  font-family: var(--font-d);
  font-weight: var(--font-d-wt, 400);
  font-size: 1rem;
  white-space: nowrap;
  cursor: pointer;
  transition: background .2s;
}
:deep(.task__ok:hover:not(:disabled)) { background: var(--action-hover, color-mix(in srgb, var(--action) 80%, var(--chip))); }
:deep(.task__ok:disabled) { cursor: default; background: var(--paper); color: var(--ink); border: 2px dashed var(--ink); }
:deep(.task__wrong) { margin: 0; font-family: var(--font-b); font-size: 1rem; color: var(--wrong); }

:deep(.task__hint-btn) {
  width: 100%;
  min-height: 48px;
  padding: 10px 14px;
  background: transparent;
  border: 2px dashed color-mix(in srgb, var(--ink) 40%, var(--paper));
  border-radius: 10px;
  color: var(--ink-soft);
  font-family: var(--font-b);
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
}
:deep(.task__hint-btn:hover) { border-color: var(--ink); color: var(--ink); }
:deep(.task__hint) {
  padding: 12px 14px;
  background: color-mix(in srgb, var(--done) 30%, var(--paper));
  border-radius: 10px;
  font-family: var(--font-b);
  font-size: 1rem; line-height: 1.5;
  color: var(--ink);
  /* подсказка раскрывается сверху вниз, как вынутая записка */
  animation: hint-open .34s cubic-bezier(.2, .7, .2, 1) both;
}
@keyframes hint-open {
  from { clip-path: inset(0 0 100% 0); opacity: .4; }
  to   { clip-path: inset(0); opacity: 1; }
}
/* предмет мира, на котором написана подсказка */
.task--casefile :deep(.task__hint) {
  border-radius: 2px;
  background: var(--paper-edge);
  transform: rotate(-1deg);
  box-shadow: 0 6px 10px -6px color-mix(in srgb, var(--rule) 70%, transparent);
}
.task--letters :deep(.task__hint) {
  border-radius: 2px;
  background: color-mix(in srgb, var(--chip) 14%, var(--paper));
  font-family: var(--font-h);
  font-size: 1.15rem;
}
.task--metro :deep(.task__hint) {
  border-radius: 6px;
  background: var(--paper);
  border: 2px dashed color-mix(in srgb, var(--ink) 35%, var(--paper));
}
.task--tarot :deep(.task__hint) {
  border-radius: 4px;
  background: var(--paper);
  border: 1px solid color-mix(in srgb, var(--ink) 55%, var(--paper));
  outline: 1px solid color-mix(in srgb, var(--ink) 30%, var(--paper));
  outline-offset: 2px;
}
.task--map :deep(.task__hint) {
  border-radius: 0;
  background: color-mix(in srgb, var(--paper-edge) 55%, var(--paper));
  border: 1px solid color-mix(in srgb, var(--ink) 45%, var(--paper));
  transform: rotate(-.6deg);
}
.task--ringbox :deep(.task__hint) {
  border-radius: 10px;
  background: var(--paper);
  border: 1.5px dashed color-mix(in srgb, var(--ink) 28%, var(--paper));
}
.task--potion :deep(.task__hint) {
  border-radius: 0;
  background: var(--paper);
  border: 1.5px solid var(--rule);
  clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px);
  animation: none;
}
.task--diecut :deep(.task__hint) {
  border-radius: 14px;
  background: color-mix(in srgb, var(--chip) 18%, var(--paper));
  border: 1.5px solid var(--rule);
}
@media (prefers-reduced-motion: reduce) {
  :deep(.task__hint) { animation: none; }
}

:deep(.task__action--location) { border-style: dashed; }

/* ── Кнопка-глагол под большим пальцем ────────────────────────────
   Обёртки подкомпонента «прозрачны», поэтому кнопка липнет к низу
   экрана в пределах всей карточки и поднимается над клавиатурой (--kb). */
.task__body,
.task__body > :deep(div) { display: contents; }
.task__body :deep(.task__action) {
  position: sticky;
  bottom: calc(12px + env(safe-area-inset-bottom) + var(--kb, 0px));
  z-index: 5;
  box-shadow: 0 0 0 6px var(--paper);
}
/* Прилипшая кнопка не просвечивает: выключенное состояние — сплошной цвет */
/* Выключенная кнопка — пустая печатная плашка, не серый блок */
.task__body :deep(.task__action:disabled) {
  opacity: 1;
  background: var(--paper);
  color: var(--ink);
  border: 2px dashed var(--ink);
}
/* Короткая карточка тянется до низа экрана: кнопка всегда у большого пальца */
.task:not(.task--review) { min-height: calc(100svh - 256px - var(--kb, 0px)); }
.task__body :deep(.task__action) { margin-top: auto; }
/* В колонке карточки поле не растягивается по высоте; flex: 1 — только в ряду */
.task__body :deep(.task__input) { flex: none; }
.task__body :deep(.task__row .task__input) { flex: 1; }
</style>
