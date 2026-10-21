<template>
  <article
    class="task"
    :class="{
      'task--review':   mode === 'review',
      'task--wrong':    mode === 'review' && earnedEntry?.wrong,
      'task--casefile': decor === 'casefile',
      'task--letters':  decor === 'letters',
      'task--metro':    decor === 'metro',
      'task--tarot':    decor === 'tarot',
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
        @complete="$emit('complete', $event)"
        @hint="$emit('hint', $event)"
        @answer-change="$emit('answer-change', $event)"
        @skip-task="$emit('skip-task', $event)"
      />
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import QuestIcon        from './QuestIcon.vue'
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
defineEmits(['complete', 'hint', 'answer-change', 'skip-task'])

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

const typeIcon = computed(() => ({
  simple:        'task',
  riddle:        'riddle',
  code_physical: 'code',
  location:      'location',
  selfie:        'selfie',
  photo:         'photo',
  text_answer:   'text',
  media:         'media',
  qr:            'qr',
  mini_game:     'game',
}[props.task.type] || 'task'))

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
:deep(.task__ok:hover:not(:disabled)) { background: color-mix(in srgb, var(--action) 80%, var(--chip)); }
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
