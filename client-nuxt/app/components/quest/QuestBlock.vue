<template>
  <div class="block">
    <!-- Полоса участка: всегда сверху, тап открывает доску -->
    <button
      type="button"
      class="block__strip"
      :aria-label="`${theme.copy.blockPrefix} ${index + 1} из ${total}: ${block.title}. Открыть доску`"
      @click="openBoard(false)"
    >
      <span class="block__strip-text">
        <span class="block__count">{{ theme.copy.blockPrefix }} <b>{{ index + 1 }}</b> из {{ total }}</span>
        <span class="block__strip-title">{{ block.title }}</span>
      </span>
      <span class="block__mini" aria-hidden="true">
        <span
          v-for="(t, ti) in tasks"
          :key="t.id"
          class="block__mini-cell"
          :class="{
            'is-done':   completedIds.includes(t.id),
            'is-active': ti === activeIdx,
          }"
        ></span>
      </span>
    </button>

    <!-- Доска: момент хода и обзор участка -->
    <transition name="board">
      <section
        v-if="boardOpen"
        class="block__board"
        role="dialog"
        aria-modal="true"
        :aria-label="`Доска: ${block.title}`"
        @pointerdown="holdBoard"
        @keydown.esc="closeBoard"
      >
        <div class="block__board-inner">
          <div class="block__meta">
            <span class="block__count">{{ theme.copy.blockPrefix }} <b>{{ index + 1 }}</b> из {{ total }}</span>
            <span class="block__count">клетка <b>{{ cellNo }}</b> из {{ tasks.length }}</span>
          </div>
          <h2 class="block__title">{{ block.title }}</h2>
          <p v-if="block.location" class="block__location">
            <QuestIcon name="pin" :size="18" />
            <span>{{ block.location }}</span>
          </p>
          <p v-if="block.description" class="block__desc">{{ block.description }}</p>

          <QuestTrack
            class="block__board-track"
            :tasks="tasks"
            :completedIds="boardCompleted"
            :earnedMap="earnedMap"
            :hasPrev="index > 0"
            :hasNext="!isLast"
            :decor="theme.world?.decor"
            :enter="entering"
            @open="reviewIdx = $event"
          />

          <button v-if="index > 0" class="block__back block__board-back" @click="closeBoard(); $emit('prev')">
            <QuestIcon name="back" :size="18" />
            Предыдущий участок
          </button>

          <button ref="boardClose" class="task__action block__board-close" @click="closeBoard">
            {{ activeTask ? 'К заданию' : 'Закрыть доску' }}
          </button>
        </div>
      </section>
    </transition>

    <!-- Карточка: одна активная клетка -->
    <transition name="card" mode="out-in">
      <QuestTask
        v-if="activeTask"
        :key="activeTask.id"
        :task="activeTask"
        :theme="theme"
        :index="activeIdx"
        mode="active"
        @complete="$emit('complete-task', $event)"
        @hint="$emit('use-hint', $event)"
        @skip-task="$emit('skip-task', $event)"
      />

      <article v-else key="done" class="block__done">
        <p class="block__done-text">
          {{ isLast ? 'Все клетки пройдены.' : 'Участок пройден. Фишка ждёт у выхода.' }}
        </p>
        <button v-if="!isLast" class="task__action" @click="$emit('next')">
          Идти дальше
          <QuestIcon name="forward" :size="22" />
        </button>
        <button v-else class="task__action" @click="$emit('finish')">
          {{ finishLabel }}
        </button>
      </article>
    </transition>

    <button v-if="index > 0" class="block__back" @click="$emit('prev')">
      <QuestIcon name="back" :size="18" />
      Предыдущий участок
    </button>

    <!-- Перечитать пройденную клетку -->
    <teleport to="body">
      <transition name="sheet">
        <div
          v-if="reviewTask"
          class="block__sheet"
          :style="cssVars"
          role="dialog"
          aria-modal="true"
          :aria-label="`Клетка ${reviewIdx + 1}: ${reviewTask.title}`"
          @click.self="reviewIdx = null"
          @keydown.esc="reviewIdx = null"
        >
          <div class="block__sheet-panel">
            <QuestTask
              :task="reviewTask"
              :theme="theme"
              :index="reviewIdx"
              :earnedEntry="earnedMap?.[reviewTask.id]"
              mode="review"
            />
            <button ref="closeBtn" class="block__sheet-close" @click="reviewIdx = null">
              Закрыть
            </button>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import QuestTask from './QuestTask.vue'
import QuestTrack from './QuestTrack.vue'
import QuestIcon from './QuestIcon.vue'
import { themeToCssVars } from './themes.js'

const props = defineProps({
  block:        { type: Object, required: true },
  theme:        { type: Object, required: true },
  index:        { type: Number, default: 0 },
  total:        { type: Number, default: 1 },
  completedIds: { type: Array,  default: () => [] },
  earnedMap:    { type: Object, default: () => ({}) },
  isLast:       { type: Boolean, default: false },
})

defineEmits(['prev', 'next', 'finish', 'complete-task', 'use-hint', 'skip-task'])

const tasks = computed(() => props.block.tasks ?? [])

// Открыта всегда первая невыполненная клетка: порядок прохождения прежний
const activeIdx  = computed(() => tasks.value.findIndex(t => !props.completedIds.includes(t.id)))
const activeTask = computed(() => activeIdx.value >= 0 ? tasks.value[activeIdx.value] : null)
const cellNo = computed(() => activeIdx.value >= 0 ? activeIdx.value + 1 : tasks.value.length)

const reviewIdx  = ref(null)
const reviewTask = computed(() => reviewIdx.value === null ? null : tasks.value[reviewIdx.value])
const closeBtn   = ref(null)
watch(reviewTask, async (t) => {
  if (!t) return
  await nextTick()
  closeBtn.value?.focus()
})

// ─── Доска: момент хода ───────────────────────────────────────
// После выполнения задания доска разворачивается, фишка делает ход,
// и через мгновение доска сворачивается в полосу. Тап по доске её удерживает.
const MOMENT_MS = 1700
const HOP_DELAY = 380
const boardOpen      = ref(false)
const boardCompleted = ref([...props.completedIds])
const boardClose     = ref(null)
let autoClose = null
let hopTimer  = null

const clearTimers = () => { clearTimeout(autoClose); clearTimeout(hopTimer) }
const openBoard = (moment) => {
  clearTimers()
  boardOpen.value = true
  if (moment) autoClose = setTimeout(closeBoard, MOMENT_MS)
  else nextTick(() => boardClose.value?.focus())
}
const entering = ref(false)
const closeBoard = () => {
  clearTimers()
  boardOpen.value = false
  entering.value = false
  boardCompleted.value = [...props.completedIds]
}
const holdBoard = () => { clearTimeout(autoClose) }

// Копия: плеер дописывает completedIds на месте, ссылка не меняется
watch(() => [...props.completedIds], (now, before = []) => {
  const fresh = now.filter(id => !before.includes(id))
  const inBlock = fresh.some(id => tasks.value.some(t => t.id === id))
  if (!inBlock) { boardCompleted.value = [...now]; return }
  // Доска открывается в прежнем состоянии, затем фишка переходит
  openBoard(true)
  hopTimer = setTimeout(() => { boardCompleted.value = [...now] }, HOP_DELAY)
})

// ─── Клавиатура: кнопка-глагол держится над ней ─────────────────
const setKeyboardInset = () => {
  const vv = window.visualViewport
  if (!vv) return
  const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
  document.documentElement.style.setProperty('--kb', `${Math.round(inset)}px`)
}

onMounted(() => {
  // Свежий участок: показываем доску, фишка заезжает на первую клетку
  if (!tasks.value.some(t => props.completedIds.includes(t.id))) {
    entering.value = true
    openBoard(true)
  }
  window.visualViewport?.addEventListener('resize', setKeyboardInset)
  window.visualViewport?.addEventListener('scroll', setKeyboardInset)
})
onUnmounted(() => {
  clearTimers()
  window.visualViewport?.removeEventListener('resize', setKeyboardInset)
  window.visualViewport?.removeEventListener('scroll', setKeyboardInset)
  document.documentElement.style.removeProperty('--kb')
})

// Шторка живёт в <body>, поэтому токены темы передаём ей явно
const cssVars = computed(() => themeToCssVars(props.theme))

const finishLabel = computed(() => ({
  detective: 'Закрыть дело',
  romantic:  'Завершить',
  mystery:   'К финалу',
  city:      'К финишу',
  treasure:  'Клад найден',
  proposal:  'Завершить',
}[props.theme.id] || 'Завершить'))
</script>

<style scoped>
.block {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Полоса участка ───────────────────────────────────────────── */
.block__strip {
  display: flex; align-items: center; gap: 14px;
  width: 100%;
  min-height: 60px;
  padding: 8px 4px;
  background: none;
  border: none;
  border-bottom: 2px dashed color-mix(in srgb, var(--field-ink) 28%, var(--field));
  color: var(--field-ink);
  text-align: left;
  cursor: pointer;
}
.block__strip:focus-visible { outline: 3px solid var(--field-ink); outline-offset: 2px; border-radius: 8px; }
.block__strip-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.block__strip-title {
  font-family: var(--font-d);
  font-size: 1.1rem;
  line-height: 1.15;
  color: var(--field-ink);
  text-wrap: balance;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.block__mini { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.block__mini-cell {
  position: relative;
  width: 16px; height: 16px;
  border-radius: 3px;
  background: var(--back);
  border: 2px solid color-mix(in srgb, var(--field-ink) 30%, var(--back));
}
.block__mini-cell.is-done   { background: var(--done); border-color: var(--rule); }
.block__mini-cell.is-active { width: 22px; height: 22px; background: var(--plate); border-color: var(--rule); }
.block__mini-cell.is-active::after {
  content: "";
  position: absolute; top: -7px; right: -7px;
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--chip);
  border: 2px solid var(--rule);
}

/* ── Доска: момент хода и обзор ───────────────────────────────── */
.block__board {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: var(--field);
  color: var(--field-ink);
  overflow-y: auto;
  padding: 76px 16px max(24px, env(safe-area-inset-bottom));
}
.block__board-inner {
  max-width: 600px; margin: 0 auto;
  min-height: 100%;
  display: flex; flex-direction: column;
}
.block__board-track { margin-top: 18px; height: clamp(200px, 34svh, 300px); }
.block__board-close { margin-top: auto; }
.block__board-back { margin: 8px 0 16px; }

.board-enter-active { transition: opacity .3s ease-out, transform .45s cubic-bezier(.16, 1, .3, 1); }
.board-leave-active { transition: opacity .25s ease-in, transform .3s ease-in; }
.board-enter-from   { opacity: 0; transform: translateY(-24px); }
.board-leave-to     { opacity: 0; transform: translateY(-40px); }

.block__meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-family: var(--font-b);
  font-size: .9rem;
  color: var(--field-ink-soft);
  font-variant-numeric: tabular-nums;
}
.block__count b {
  font-family: var(--font-d);
  font-weight: 400;
  color: var(--field-ink);
  font-size: 1.05rem;
}

.block__title {
  margin: 14px 0 0;
  font-family: var(--font-d);
  font-weight: 400;
  font-size: clamp(1.55rem, 7vw, 2.1rem);
  line-height: 1.08;
  letter-spacing: -0.01em;
  color: var(--field-ink);
  text-wrap: balance;
}

.block__location {
  display: flex; align-items: center; gap: 6px;
  margin: 8px 0 0;
  font-family: var(--font-b);
  font-size: 1rem;
  color: var(--field-ink-soft);
}

.block__desc {
  margin: 10px 0 0;
  font-family: var(--font-b);
  font-size: 1rem;
  line-height: 1.5;
  color: var(--field-ink-soft);
}

/* ── Участок пройден ──────────────────────────────────────────── */
.block__done {
  background: var(--paper);
  color: var(--ink);
  border: 3px solid var(--rule);
  border-bottom-width: 7px;
  border-radius: 14px;
  padding: 20px 18px 18px;
  display: flex; flex-direction: column; gap: 16px;
}
.block__done-text {
  margin: 0;
  font-family: var(--font-b);
  font-size: 1.15rem;
  line-height: 1.4;
}

.block__back {
  align-self: flex-start;
  display: inline-flex; align-items: center; gap: 6px;
  min-height: 44px;
  padding: 0 4px;
  background: none; border: none;
  color: var(--field-ink-soft);
  font-family: var(--font-b);
  font-size: .95rem;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}
.block__back:hover { color: var(--field-ink); }
.block__back:focus-visible { outline: 3px solid var(--field-ink); outline-offset: 2px; border-radius: 6px; }

/* ── Шторка перечитывания ─────────────────────────────────────── */
.block__sheet {
  position: fixed; inset: 0; z-index: 900;
  display: flex; align-items: flex-end; justify-content: center;
  background: color-mix(in srgb, var(--rule) 55%, transparent);
  padding: 12px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
}
.block__sheet-panel {
  width: 100%; max-width: 520px;
  max-height: 88svh;
  overflow-y: auto;
  display: flex; flex-direction: column; gap: 10px;
}
.block__sheet-close {
  min-height: 52px;
  background: var(--field);
  color: var(--field-ink);
  border: 3px solid var(--rule);
  border-radius: 12px;
  font-family: var(--font-d);
  font-size: 1rem;
  cursor: pointer;
}
.block__sheet-close:focus-visible { outline: 3px solid var(--plate); outline-offset: 2px; }

/* ── Движение ─────────────────────────────────────────────────── */
.card-enter-active { transition: transform .45s cubic-bezier(.16, 1, .3, 1), opacity .25s ease-out; }
.card-leave-active { transition: transform .2s ease-in, opacity .2s ease-in; }
.card-enter-from   { transform: translateY(28px); opacity: 0; }
.card-leave-to     { transform: translateY(-10px); opacity: 0; }

.sheet-enter-active, .sheet-leave-active { transition: opacity .25s ease-out; }
.sheet-enter-active .block__sheet-panel { transition: transform .4s cubic-bezier(.16, 1, .3, 1); }
.sheet-leave-active .block__sheet-panel { transition: transform .2s ease-in; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .block__sheet-panel, .sheet-leave-to .block__sheet-panel { transform: translateY(40px); }

@media (prefers-reduced-motion: reduce) {
  .card-enter-active, .card-leave-active,
  .sheet-enter-active, .sheet-leave-active,
  .sheet-enter-active .block__sheet-panel, .sheet-leave-active .block__sheet-panel,
  .board-enter-active, .board-leave-active { transition: none; }
}
</style>
