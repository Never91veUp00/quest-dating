<template>
  <article
    class="task"
    :class="{
      'task--review':   mode === 'review',
      'task--wrong':    mode === 'review' && earnedEntry?.wrong,
      'task--casefile': decor === 'casefile',
      [`task--${task.type}`]: true,
    }"
  >
    <template v-if="decor === 'casefile'">
      <span class="task__tape task__tape--l" aria-hidden="true"></span>
      <span class="task__tape task__tape--r" aria-hidden="true"></span>
    </template>

    <!-- Угол карточки: номер клетки и тип задания -->
    <header class="task__head">
      <span class="task__corner">
        <span class="task__no">{{ index + 1 }}</span>
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
          {{ theme.copy.taskDone }}<span v-if="task.points"> · +{{ earnedEntry?.points ?? task.points }} {{ theme.copy.pointsLabel }}</span>
        </template>
      </p>
    </template>

    <!-- Активная клетка → подкомпонент задания -->
    <component
      v-else-if="taskComponent"
      :is="taskComponent"
      :task="task"
      :theme="theme"
      @complete="$emit('complete', $event)"
      @hint="$emit('hint', $event)"
      @answer-change="$emit('answer-change', $event)"
      @skip-task="$emit('skip-task', $event)"
    />
  </article>
</template>

<script setup>
import { computed } from 'vue'
import QuestIcon        from './QuestIcon.vue'
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
  background: color-mix(in srgb, var(--paper) 86%, var(--ink));
  border: 2px solid color-mix(in srgb, var(--ink) 45%, var(--paper));
  border-radius: 10px;
  color: var(--ink);
  caret-color: var(--chip);
  font-family: var(--font-b);
  font-size: 1.1rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color .2s;
}
:deep(.task__input::placeholder) { color: color-mix(in srgb, var(--ink) 55%, var(--paper)); }
:deep(.task__input:focus) { border-color: var(--ink); box-shadow: 0 0 0 3px color-mix(in srgb, var(--chip) 35%, transparent); }
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
  font-size: 1rem;
  white-space: nowrap;
  cursor: pointer;
  transition: background .2s;
}
:deep(.task__ok:hover:not(:disabled)) { background: color-mix(in srgb, var(--action) 80%, var(--chip)); }
:deep(.task__ok:disabled) { opacity: .4; cursor: default; }
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
</style>
