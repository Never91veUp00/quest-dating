<template>
  <div class="block">
    <!-- Шапка блока -->
    <div class="block__head">
      <div v-if="block.location" class="block__location">
        <span>📍</span> {{ block.location }}
      </div>
      <div class="block__counter">
        {{ theme.copy.blockPrefix }} {{ index + 1 }} / {{ total }}
      </div>
      <h2 class="block__title">{{ block.title }}</h2>
      <p v-if="block.description" class="block__desc">{{ block.description }}</p>
    </div>

    <!-- Задания -->
    <div class="block__tasks">
      <QuestTask
        v-for="(task, ti) in block.tasks"
        :key="task.id"
        :task="task"
        :theme="theme"
        :index="ti"
        :isDone="completedIds.includes(task.id)"
        :isActive="!completedIds.includes(task.id) && isUnlocked(ti)"
        :isLocked="!isUnlocked(ti)"
        @complete="$emit('complete-task', $event)"
        @hint="$emit('use-hint', $event)"
      />
    </div>

    <!-- Навигация -->
    <div class="block__nav">
      <button v-if="index > 0" class="block__nav-back" @click="$emit('prev')">
        ← Назад
      </button>
      <div class="block__nav-space"></div>
      <button
        v-if="!isLast && blockDone"
        class="block__nav-next"
        @click="$emit('next')"
      >
        Дальше →
      </button>
      <button
        v-if="isLast && blockDone"
        class="block__nav-finish"
        @click="$emit('finish')"
      >
        🎯 {{ finishLabel }}
      </button>
      <div v-if="!blockDone" class="block__nav-hint">
        Выполни все задания чтобы продолжить
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import QuestTask from './QuestTask.vue'

const props = defineProps({
  block:        { type: Object, required: true },
  theme:        { type: Object, required: true },
  index:        { type: Number, default: 0 },
  total:        { type: Number, default: 1 },
  completedIds: { type: Array, default: () => [] },
  isLast:       { type: Boolean, default: false },
})

defineEmits(['prev', 'next', 'finish', 'complete-task', 'use-hint', 'skip-task'])

const isUnlocked = (ti) =>
  ti === 0 || props.completedIds.includes(props.block.tasks[ti - 1]?.id)

const blockDone = computed(() =>
  props.block.tasks?.every(t => props.completedIds.includes(t.id)) ?? true
)

const finishLabel = computed(() => ({
  detective: 'Закрыть дело',
  romantic:  'Завершить ❤️',
  mystery:   'Исполнить пророчество',
  city:      'Выполнить миссию',
}[props.theme.id] || 'Завершить'))
</script>

<style scoped>
.block { display: flex; flex-direction: column; gap: 20px; }

/* ── Head ─────────────────────────────────────────────────────── */
.block__head { display: flex; flex-direction: column; gap: 8px; }

.block__location {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: .7rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
  color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 20px; padding: 4px 12px; width: fit-content;
}

.block__counter {
  font-family: var(--font-d); font-size: .58rem; letter-spacing: .2em;
  color: var(--dim); text-transform: uppercase;
}

.block__title {
  font-family: var(--font-d);
  font-size: clamp(1.2rem, 5vw, 1.7rem);
  font-weight: 900; color: #fff; margin: 0; line-height: 1.2;
  text-shadow: 0 0 28px color-mix(in srgb, var(--accent) 25%, transparent);
}

.block__desc { font-size: .9rem; color: var(--dim); line-height: 1.6; margin: 0; }

/* ── Tasks ────────────────────────────────────────────────────── */
.block__tasks { display: flex; flex-direction: column; gap: 12px; }

/* ── Nav ──────────────────────────────────────────────────────── */
.block__nav {
  display: flex; align-items: center; gap: 10px; padding: 4px 0;
}
.block__nav-space { flex: 1; }
.block__nav-hint { font-size: .78rem; color: var(--dim); font-style: italic; }

.block__nav-back {
  background: var(--surf); border: 1px solid var(--bord); border-radius: 9px;
  padding: 11px 18px; color: var(--dim); font-family: var(--font-b);
  font-size: .88rem; font-weight: 600; cursor: pointer; transition: all .2s;
}
.block__nav-back:hover { color: var(--text); border-color: var(--dim); }

.block__nav-next, .block__nav-finish {
  background: var(--accent); border: none; border-radius: 9px;
  padding: 11px 24px; color: #000; font-family: var(--font-b);
  font-size: .9rem; font-weight: 700; cursor: pointer;
  box-shadow: 0 0 18px color-mix(in srgb, var(--accent) 30%, transparent);
  transition: all .25s;
}
.block__nav-next:hover, .block__nav-finish:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 28px color-mix(in srgb, var(--accent) 50%, transparent);
}

/* ── Mobile ───────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .block__title { font-size: clamp(1.1rem, 5vw, 1.5rem); }
  .block__desc { font-size: .85rem; }
  .block__nav { flex-wrap: wrap; }
  .block__nav-back { padding: 12px 16px; min-height: 48px; }
  .block__nav-next, .block__nav-finish { padding: 12px 20px; min-height: 48px; }
  .block__nav-hint { font-size: .72rem; text-align: center; width: 100%; }
}
</style>