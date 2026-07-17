<template>
  <div
    class="task"
    :class="{
      'task--done':   isDone,
      'task--wrong':  isDone && earnedEntry?.wrong,
      'task--active': isActive,
      'task--locked': isLocked,
      [`task--${task.type}`]: true
    }"
    :style="{ '--i': index }"
  >
    <!-- Шапка: маркер + тип задания -->
    <div class="task__head">
      <div class="task__dot">
        <span v-if="isDone">✓</span>
        <span v-else-if="isLocked">🔒</span>
        <span v-else>{{ typeIcon }}</span>
      </div>
      <div class="task__type-label">
        <span>{{ typeIcon }}</span> {{ typeLabel }}
      </div>
    </div>

    <!-- Полноширинный контент -->
    <div class="task__title">{{ task.title }}</div>
    <div v-if="task.description && !isDone" class="task__desc">
      <div v-if="task.description_type === 'html'" class="task__desc--html" v-html="task.description"></div>
      <template v-else>
        <p v-for="(para, pi) in descParagraphs" :key="pi">{{ para }}</p>
      </template>
    </div>

    <!-- Выполнено -->
    <div v-if="isDone" class="task__done">
      <span>{{ earnedEntry?.wrong ? 'Не выполнено' : theme.copy.taskDone }}</span>
      <span v-if="task.points" class="task__pts">
        +{{ earnedEntry?.points ?? task.points }} {{ theme.copy.pointsLabel }}
      </span>
    </div>

    <!-- Активная задача → подкомпонент -->
    <component
      v-else-if="isActive && taskComponent"
      :is="taskComponent"
      :task="task"
      :theme="theme"
      @complete="$emit('complete', $event)"
      @hint="$emit('hint', $event)"
      @answer-change="$emit('answer-change', $event)"
      @skip-task="$emit('skip-task', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
  task:     { type: Object,  required: true },
  theme:    { type: Object,  required: true },
  index:    { type: Number,  default: 0 },
  isDone:       { type: Boolean, default: false },
  isActive:     { type: Boolean, default: false },
  isLocked:     { type: Boolean, default: false },
  earnedEntry:  { type: Object,  default: null },
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

const descParagraphs = computed(() =>
  props.task.description?.split(/\n{2,}/).map(p => p.trim()).filter(Boolean) || []
)

const typeIcon = computed(() => ({
  simple:        '✓',
  riddle:        '?',
  code_physical: '🔢',
  location:      '📍',
  selfie:        '🤳',
  photo:         '📷',
  text_answer:   '✍️',
  media:         '🎬',
  qr:            '◻️',
  mini_game:     '🎮',
}[props.task.type] || props.index + 1))

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
/* ── Task ─────────────────────────────────────────────────────── */
.task {
  background: color-mix(in srgb, var(--surf) 80%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--bord);
  border-left: 3px solid var(--bord);
  border-radius: 12px;
  padding: 12px;
  display: flex; flex-direction: column; gap: 8px;
  animation: task-in .25s ease both;
  animation-delay: calc(var(--i, 0) * 0.06s);
  transition: opacity .2s, border-color .2s, box-shadow .2s;
  position: relative;
  z-index: 1;
}
.task--active {
  box-shadow: 0 4px 24px color-mix(in srgb, var(--accent) 12%, transparent);
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 6%, transparent), color-mix(in srgb, var(--surf) 80%, transparent) 70%);
}
@keyframes task-in { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }

.task--active  { border-left-color: var(--accent); }
.task--active .task__dot { border-color: var(--accent); color: var(--accent); }
.task--done    { opacity: .55; border-left-color: #3cffb4; }
.task--done .task__dot { border-color: #3cffb4; color: #3cffb4; background: rgba(60,255,180,.06); }
.task--wrong   {
  border-color: rgba(248,113,113,.35);
  border-left-color: #f87171;
  background: color-mix(in srgb, rgba(248,113,113,.06) 100%, var(--surf));
}
.task--wrong .task__dot   { border-color: #f87171; color: #f87171; background: rgba(248,113,113,.12); }
.task--wrong .task__pts   { color: #f87171; }
.task--wrong .task__done       { color: #f87171; }
.task--wrong .task__type-label { color: #f87171; }
.task--locked  { opacity: .3; pointer-events: none; }

/* ── Head row (dot + type label) ──────────────────────────────── */
.task__head { display: flex; align-items: center; gap: 10px; }

.task__dot {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
  border: 1px solid var(--bord);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; color: var(--dim);
}
.task__type-label {
  font-size: .62rem; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: var(--accent);
  display: inline-flex; align-items: center; gap: 4px;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border-radius: 4px; padding: 2px 7px;
}

/* ── Content (full card width) ─────────────────────────────────── */
.task__title { font-size: .95rem; font-weight: 700; color: #fff; }
.task__desc { display: flex; flex-direction: column; gap: 6px; }
.task__desc p { font-size: .85rem; color: var(--text); line-height: 1.5; margin: 0; opacity: .9; white-space: pre-line; }
.task__desc--html { font-size: .85rem; color: var(--text); line-height: 1.55; opacity: .9; }
.task__desc--html p { margin: 0 0 .5em; }
.task__desc--html ul, .task__desc--html ol { padding-left: 1.4em; margin: .3em 0; }
.task__desc--html li { margin-bottom: .2em; }
.task__desc--html b, .task__desc--html strong { font-weight: 700; color: #fff; }
.task__desc--html i, .task__desc--html em { font-style: italic; }
.task__instruction { font-size: .85rem; color: var(--text); font-style: italic; margin: 0; }

.task__done {
  display: flex; align-items: center; justify-content: space-between;
  font-size: .82rem; color: #3cffb4; padding: 6px 0;
}
.task__pts { font-family: var(--font-d); font-size: .72rem; opacity: .8; }

/* ── Shared UI (используется подкомпонентами через :deep) ── */
:deep(.task__row) { display: flex; gap: 8px; }
:deep(.task__question) {
  font-size: .88rem; font-style: italic; color: var(--text);
  background: rgba(255,255,255,.03);
  border-left: 2px solid var(--accent);
  padding: 9px 13px; border-radius: 0 8px 8px 0; line-height: 1.5;
}
:deep(.task__input) {
  flex: 1;
  background: var(--bg2);
  border: 1px solid var(--bord);
  border-radius: 12px;
  padding: 12px 16px;
  min-height: 48px;
  color: #fff;
  font-family: var(--font-b);
  font-size: .95rem;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
  box-sizing: border-box;
}
:deep(.task__input:focus) {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
}
:deep(.task__input--code) { font-family: var(--font-d); letter-spacing: .25em; text-align: center; font-size: 1rem; }
:deep(.task__input.shake) { animation: shake .4s ease; border-color: #f87171; }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }

:deep(.task__ok) {
  background: var(--accent);
  border: none;
  border-radius: 12px;
  color: #000;
  font-weight: 700;
  font-family: var(--font-d);
  font-size: .85rem;
  padding: 0 18px;
  min-height: 48px;
  cursor: pointer;
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 30%, transparent);
  transition: all .18s ease;
  white-space: nowrap;
}
:deep(.task__ok:hover:not(:disabled)) { box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 50%, transparent); transform: translateY(-1px); }
:deep(.task__ok:disabled) { opacity: .35; cursor: default; }
:deep(.task__wrong) { font-size: .78rem; color: #f87171; }

/* ── Hint ─────────────────────────────────────────────────────── */
:deep(.task__hint-btn) {
  background: transparent; border: 1px dashed rgba(255,200,0,.3);
  border-radius: 8px; padding: 7px 12px; color: rgba(255,200,0,.7);
  font-size: .78rem; cursor: pointer; text-align: left; transition: all .2s; width: 100%;
}
:deep(.task__hint-btn:hover) { border-color: rgba(255,200,0,.6); color: #ffc800; }
:deep(.task__hint) {
  background: rgba(255,200,0,.05); border: 1px solid rgba(255,200,0,.2);
  border-radius: 8px; padding: 9px 13px; font-size: .83rem;
  color: rgba(255,200,0,.9); line-height: 1.5;
}

/* ── Action button ──────────────────────────────────────────────── */
:deep(.task__action) {
  background: transparent;
  border: 1px solid var(--accent);
  border-radius: 14px;
  padding: 0;
  min-height: 52px;
  color: var(--accent);
  font-family: var(--font-b);
  font-size: .95rem;
  font-weight: 700;
  cursor: pointer;
  text-shadow: 0 0 6px color-mix(in srgb, var(--accent) 50%, transparent);
  transition: all .2s ease;
  width: 100%;
  display: flex; align-items: center; justify-content: center;
}
:deep(.task__action:hover:not(:disabled)) {
  background: var(--accent);
  color: #000;
  text-shadow: none;
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 40%, transparent);
  transform: translateY(-1px);
}
:deep(.task__action:active:not(:disabled)) { transform: translateY(0); }
:deep(.task__action:disabled) { opacity: .35; cursor: default; }
:deep(.task__action--location) { border-style: dashed; }

/* ── Mobile ───────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .task { padding: 12px; gap: 8px; }
  .task__dot { width: 24px; height: 24px; font-size: .65rem; }
  .task__title { font-size: .9rem; }
  .task__desc p { font-size: .82rem; }
  :deep(.task__action) { padding: 13px; font-size: .88rem; min-height: 48px; }
  :deep(.task__ok) { min-height: 48px; padding: 0 16px; }
  :deep(.task__input) { padding: 12px; font-size: .88rem; min-height: 48px; }
  :deep(.task__hint-btn) { padding: 10px 12px; }
}
</style>
