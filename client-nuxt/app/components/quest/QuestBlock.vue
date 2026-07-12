<template>
  <div class="block">
    <!-- Шапка блока -->
    <div class="block__head">
      <div v-if="block.location" class="block__location block__anim block__anim--1">
        <span>📍</span> {{ block.location }}
      </div>
      <div class="block__counter block__anim block__anim--2">
        {{ theme.copy.blockPrefix }} {{ index + 1 }} / {{ total }}
      </div>
      <h2 class="block__title block__anim block__anim--3">{{ block.title }}</h2>
      <p v-if="block.description" class="block__desc block__anim block__anim--4">{{ block.description }}</p>
    </div>

    <!-- Задания -->
    <div class="block__tasks block__anim block__anim--5">
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
        @skip-task="$emit('skip-task', $event)"
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
        {{ finishLabel }}
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
  detective: 'Закрыть дело →',
  romantic:  'Завершить ❤️',
  mystery:   'Финал →',
  city:      'Финиш →',
  treasure:  'Клад найден →',
  proposal:  'Завершить ✨',
}[props.theme.id] || 'Завершить →'))
</script>

<style scoped>
.block {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Head ─────────────────────────────────────────────────────── */
.block__head { display: flex; flex-direction: column; gap: 10px; }

.block__location {
  display: flex; align-items: center; gap: 6px;
  font-size: .78rem; color: var(--accent); font-weight: 600;
  letter-spacing: .04em;
}

.block__counter {
  font-size: .68rem; text-transform: uppercase;
  letter-spacing: .1em; color: var(--dim); font-weight: 600;
}

.block__title {
  font-size: clamp(1.25rem, 4.5vw, 1.55rem);
  font-weight: 800;
  line-height: 1.25;
  color: #fff;
  margin: 0;
  font-family: var(--font-d);
}

.block__desc {
  font-size: .95rem;
  line-height: 1.75;
  color: var(--dim);
  margin: 0;
}

/* ── Tasks ────────────────────────────────────────────────────── */
.block__tasks { display: flex; flex-direction: column; gap: 10px; }

/* ── Stagger animations ───────────────────────────────────────── */
.block__anim {
  animation: block-fade-up 0.3s ease both;
}
.block__anim--1 { animation-delay: 0.00s; }
.block__anim--2 { animation-delay: 0.05s; }
.block__anim--3 { animation-delay: 0.10s; }
.block__anim--4 { animation-delay: 0.16s; }
.block__anim--5 { animation-delay: 0.22s; }

@keyframes block-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

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
  .block { padding: 16px; border-radius: 16px; }
  .block__title { font-size: clamp(1.1rem, 4vw, 1.35rem); }
  .block__desc { font-size: .85rem; }
  .block__nav { flex-wrap: nowrap; }
  .block__nav-back { padding: 12px 16px; min-height: 48px; flex-shrink: 0; }
  .block__nav-next, .block__nav-finish { padding: 12px 16px; min-height: 48px; flex: 1; }
  .block__nav-hint { font-size: .72rem; text-align: center; }
}
</style>