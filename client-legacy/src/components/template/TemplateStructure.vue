<template>
  <div class="template-structure">
    <h3 class="section-title">Как устроен квест</h3>

    <div class="structure-visual">
      <div
        v-for="(block, index) in displayBlocks"
        :key="index"
        class="phase-card"
      >
        <div class="phase-header">
          <div class="phase-number">{{ index + 1 }}</div>
          <h4 class="phase-title">Блок {{ index + 1 }}</h4>
        </div>

        <p v-if="block.description" class="phase-description">{{ block.description }}</p>

        <div v-if="block.tasks && block.tasks.length" class="phase-items">
          <div
            v-for="(task, ti) in block.tasks"
            :key="ti"
            class="phase-item"
          >
            <span class="item-icon">{{ taskIcon(task.type) }}</span>
            <span class="item-text">{{ taskLabel(task.type) }}</span>
          </div>
        </div>

        <div v-if="index < displayBlocks.length - 1" class="phase-arrow">↓</div>
      </div>
    </div>

    <!-- Характеристики из реальных данных шаблона -->
    <div class="quest-specs">
      <div class="spec-item">
        <div class="spec-icon">⏱️</div>
        <div class="spec-label">Длительность</div>
        <div class="spec-value">{{ formatDuration(template.duration_minutes) }}</div>
      </div>
      <div class="spec-item">
        <div class="spec-icon">📱</div>
        <div class="spec-label">Формат</div>
        <div class="spec-value">Веб-квест</div>
      </div>
      <div class="spec-item">
        <div class="spec-icon">🎯</div>
        <div class="spec-label">Сложность</div>
        <div class="spec-value">
          <DifficultyBadge :difficulty="template.difficulty" />
        </div>
      </div>
      <div class="spec-item">
        <div class="spec-icon">📍</div>
        <div class="spec-label">Локация</div>
        <div class="spec-value">{{ locationLabel(template.location_type) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DifficultyBadge from '../marketplace/DifficultyBadge.vue'

const props = defineProps({
  template: { type: Object, required: true }
})

const TASK_ICONS = {
  simple:        '✅',
  riddle:        '🧩',
  code_physical: '🔑',
  location:      '📍',
  selfie:        '🤳',
  photo:         '📷',
  text_answer:   '✍️',
  media:         '🎬',
  qr:            '📲',
  mini_game:     '🎮',
}
const TASK_LABELS = {
  simple:        'Задание',
  riddle:        'Загадка',
  code_physical: 'Физический код',
  location:      'Локация',
  selfie:        'Селфи',
  photo:         'Фото-задание',
  text_answer:   'Текстовый ответ',
  media:         'Медиа-контент',
  qr:            'QR-код',
  mini_game:     'Мини-игра',
}

const taskIcon  = (type) => TASK_ICONS[type]  || '🎯'
const taskLabel = (type) => TASK_LABELS[type] || 'Задание'

// Дефолтные блоки — если демо-квест не выбран
const DEFAULT_BLOCKS = [
  {
    title: 'Начало приключения',
    description: 'Вступительная история погружает вас в атмосферу квеста',
    tasks: [
      { type: 'simple',  title: 'Сценарий и легенда' },
      { type: 'location', title: 'Постановка задачи' },
    ]
  },
  {
    title: 'Прохождение заданий',
    description: 'Выполняйте задания, разгадывайте загадки и двигайтесь по маршруту',
    tasks: [
      { type: 'riddle',  title: 'Загадки и головоломки' },
      { type: 'photo',   title: 'Фото-задания' },
      { type: 'selfie',  title: 'Совместные селфи' },
      { type: 'qr',      title: 'QR-охота' },
    ]
  },
  {
    title: 'Финал',
    description: 'Завершающий этап с особенным сюрпризом для вашей пары',
    tasks: [
      { type: 'mini_game', title: 'Финальное испытание' },
      { type: 'media',     title: 'Видео-сюрприз' },
    ]
  }
]

const displayBlocks = computed(() => {
  try {
    const raw = props.template?.demo_blocks
    if (!raw) return DEFAULT_BLOCKS
    const blocks = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (Array.isArray(blocks) && blocks.length) return blocks
  } catch {}
  return DEFAULT_BLOCKS
})

const formatDuration = (minutes) => {
  if (!minutes) return 'Не указано'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h > 0) return m > 0 ? `${h}ч ${m}м` : `${h}ч`
  return `${m}м`
}

const locationLabel = (type) => ({
  city:      'По городу',
  park:      'Парк / природа',
  indoor:    'В помещении',
  universal: 'Универсальный'
}[type] || type || '—')
</script>

<style scoped>
.template-structure {
  background: white; border-radius: 16px;
  padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.section-title {
  font-size: 1.5rem; font-weight: 700; color: #2d3748;
  margin: 0 0 32px 0; text-align: center;
}
.structure-visual { display: flex; flex-direction: column; gap: 0; margin-bottom: 40px; }
.phase-card {
  background: linear-gradient(to bottom, #f7fafc 0%, white 100%);
  border: 2px solid #e2e8f0; border-radius: 16px; padding: 24px; position: relative;
}
.phase-header { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
.phase-number {
  width: 40px; height: 40px; flex-shrink: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 1.2rem;
}
.phase-title { font-size: 1.25rem; font-weight: 700; color: #2d3748; margin: 0; }
.phase-description { color: #718096; line-height: 1.6; margin: 0 0 8px 0; padding-left: 56px; }
.phase-items {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px; padding-left: 56px;
}
.phase-item {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px;
  background: white; border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 0.9rem; color: #4a5568;
}
.item-icon { font-size: 1.1rem; }
.phase-arrow {
  text-align: center; font-size: 2rem; color: #667eea; margin: 16px 0;
  animation: bounce 2s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(8px); }
}
.quest-specs {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px; padding: 24px; background: #f7fafc; border-radius: 12px;
}
.spec-item { text-align: center; }
.spec-icon { font-size: 2rem; margin-bottom: 8px; }
.spec-label { font-size: 0.85rem; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.spec-value { font-weight: 700; color: #2d3748; font-size: 1.1rem; display: flex; justify-content: center; }

@media (max-width: 768px) {
  .template-structure { padding: 24px 20px; }
  .phase-items { grid-template-columns: 1fr; padding-left: 0; }
  .phase-description, .phase-location { padding-left: 0; }
  .quest-specs { grid-template-columns: repeat(2, 1fr); }
}
</style>