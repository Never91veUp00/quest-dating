<template>
  <div class="ts">
    <h2 class="ts__title">Как устроен квест</h2>

    <!-- Таймлайн -->
    <div class="ts__timeline">
      <div
        v-for="(block, i) in displayBlocks"
        :key="i"
        class="ts__block"
        :class="{ 'ts__block--last': i === displayBlocks.length - 1 }"
      >
        <!-- Линия + номер -->
        <div class="ts__block-aside">
          <div class="ts__block-num">{{ i + 1 }}</div>
          <div v-if="i < displayBlocks.length - 1" class="ts__block-line"></div>
        </div>

        <!-- Контент -->
        <div class="ts__block-body">
          <h3 class="ts__block-title">{{ block.title || `Блок ${i + 1}` }}</h3>
          <p v-if="block.description" class="ts__block-desc">{{ block.description }}</p>

          <!-- Задания -->
          <div v-if="block.tasks?.length" class="ts__tasks">
            <div
              v-for="(task, ti) in block.tasks"
              :key="ti"
              class="ts__task"
            >
              <span class="ts__task-icon">{{ taskIcon(task) }}</span>
              <span class="ts__task-text">{{ task.title || taskLabel(task.type) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Итого -->
    <div class="ts__summary">
      <div class="ts__summary-item">
        <span class="ts__summary-num">{{ displayBlocks.length }}</span>
        <span class="ts__summary-lbl">блоков</span>
      </div>
      <div class="ts__summary-div"></div>
      <div class="ts__summary-item">
        <span class="ts__summary-num">{{ totalTasks }}</span>
        <span class="ts__summary-lbl">заданий</span>
      </div>
      <div class="ts__summary-div"></div>
      <div class="ts__summary-item">
        <span class="ts__summary-num">{{ formatDuration(template.duration_minutes) }}</span>
        <span class="ts__summary-lbl">времени</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  template: { type: Object, required: true }
})


const TASK_ICONS = {
  simple:      '✅',
  riddle:      '🧩',
  text_answer: '✍️',
  mini_game:   '🎮',
  photo:       '📷',
  selfie:      '🤳',
  location:    '📍',
  qr:          '📲',
  media:       '🎬',
}
const TASK_LABELS = {
  simple:      'Задание',
  riddle:      'Загадка',
  text_answer: 'Текстовый ответ',
  mini_game:   'Мини-игра',
  photo:       'Фото-задание',
  selfie:      'Селфи',
  location:    'Локация',
  qr:          'QR-код',
  media:       'Медиа',
}

const taskIcon  = (task) => {
  if (task.type === 'mini_game') return task.game_type === 'quiz' ? '🧠' : task.game_type === 'pairs' ? '🔗' : '🎮'
  return TASK_ICONS[task.type] || '🎯'
}
const taskLabel = (type) => TASK_LABELS[type] || 'Задание'

const displayBlocks = computed(() => {
  try {
    const raw = props.template?.structure
    if (!raw) return []
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    // Массив блоков напрямую
    if (Array.isArray(parsed) && parsed.length) return parsed
    // Объект с полем blocks
    if (parsed.blocks && Array.isArray(parsed.blocks)) return parsed.blocks
  } catch {}
  return []
})

const totalTasks = computed(() =>
  displayBlocks.value.reduce((acc, b) => acc + (b.tasks?.length || 0), 0)
)

function formatDuration(minutes) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60), m = minutes % 60
  if (h > 0 && m > 0) return `${h}ч ${m}м`
  if (h > 0) return `${h}ч`
  return `${m}м`
}
</script>

<style scoped>
.ts { padding: 0; }

.ts__title {
  font-size: 1.2rem; font-weight: 900; color: #f0ede8;
  margin: 0 0 20px; letter-spacing: -0.01em;
}

/* Таймлайн */
.ts__timeline { display: flex; flex-direction: column; gap: 0; }

.ts__block {
  display: flex; gap: 14px; padding-bottom: 20px;
}
.ts__block--last { padding-bottom: 0; }

/* Левая часть — номер + линия */
.ts__block-aside {
  display: flex; flex-direction: column; align-items: center;
  flex-shrink: 0; width: 32px;
}
.ts__block-num {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4);
  color: #d4af37; font-size: 0.8rem; font-weight: 800;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ts__block-line {
  width: 1px; flex: 1; margin-top: 6px;
  background: linear-gradient(to bottom, rgba(212,175,55,0.3), rgba(212,175,55,0.05));
  min-height: 20px;
}

/* Правая часть — контент */
.ts__block-body { flex: 1; padding-top: 6px; }
.ts__block-title {
  font-size: 0.95rem; font-weight: 800; color: #f0ede8;
  margin: 0 0 4px; line-height: 1.2;
}
.ts__block-desc {
  font-size: 0.82rem; color: rgba(240,237,232,0.5);
  margin: 0 0 10px; line-height: 1.5;
}

/* Задания */
.ts__tasks { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 4px; }
.ts__task {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; padding: 5px 9px;
  font-size: 0.78rem; color: rgba(240,237,232,0.65);
}
.ts__task-icon { font-size: 12px; }

/* Итого */
.ts__summary {
  display: flex; align-items: center;
  background: rgba(212,175,55,0.06); border: 1px solid rgba(212,175,55,0.15);
  border-radius: 14px; padding: 14px; margin-top: 20px; gap: 0;
}
.ts__summary-item {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px;
}
.ts__summary-num { font-size: 1.2rem; font-weight: 900; color: #d4af37; }
.ts__summary-lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(240,237,232,0.35); }
.ts__summary-div { width: 1px; height: 32px; background: rgba(212,175,55,0.15); }
</style>