<template>
  <div class="template-structure">
    <h3 class="section-title">Как устроен квест</h3>
    
    <div class="structure-visual">
      <div 
        v-for="(phase, index) in questPhases"
        :key="index"
        class="phase-card"
      >
        <div class="phase-header">
          <div class="phase-number">{{ index + 1 }}</div>
          <h4 class="phase-title">{{ phase.title }}</h4>
        </div>
        
        <p class="phase-description">{{ phase.description }}</p>
        
        <div v-if="phase.items && phase.items.length > 0" class="phase-items">
          <div 
            v-for="(item, itemIndex) in phase.items"
            :key="itemIndex"
            class="phase-item"
          >
            <span class="item-icon">{{ item.icon }}</span>
            <span class="item-text">{{ item.text }}</span>
          </div>
        </div>

        <!-- Стрелка к следующему этапу -->
        <div v-if="index < questPhases.length - 1" class="phase-arrow">
          ↓
        </div>
      </div>
    </div>

    <!-- Характеристики -->
    <div class="quest-specs">
      <div class="spec-item">
        <div class="spec-icon">📍</div>
        <div class="spec-label">Локаций</div>
        <div class="spec-value">{{ template.min_locations }}-{{ template.max_locations }}</div>
      </div>
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
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DifficultyBadge from '../marketplace/DifficultyBadge.vue'

const props = defineProps({
  template: {
    type: Object,
    required: true
  }
})

const questPhases = computed(() => {
  // Генерируем фазы на основе структуры шаблона
  const phases = []
  
  // Начало
  phases.push({
    title: 'Начало приключения',
    description: 'Вступительная история погружает в атмосферу квеста',
    items: [
      { icon: '📖', text: 'Сценарий и легенда' },
      { icon: '🎯', text: 'Постановка задачи' }
    ]
  })

  // Основная часть
  phases.push({
    title: 'Прохождение локаций',
    description: 'Перемещение по точкам маршрута с выполнением заданий',
    items: [
      { icon: '🗺️', text: 'Интерактивная карта' },
      { icon: '🧩', text: 'Загадки и головоломки' },
      { icon: '📷', text: 'Фото-задания' },
      { icon: '💡', text: 'Система подсказок' }
    ]
  })

  // Кульминация
  phases.push({
    title: 'Финальное задание',
    description: 'Завершающий этап с особенным сюрпризом',
    items: [
      { icon: '🎁', text: 'Финальный сюрприз' },
      { icon: '🏆', text: 'Подведение итогов' }
    ]
  })

  return phases
})

const formatDuration = (minutes) => {
  if (!minutes) return 'Не указано'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`
  }
  return `${mins}м`
}
</script>

<style scoped>
.template-structure {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 32px 0;
  text-align: center;
}

.structure-visual {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-bottom: 40px;
}

.phase-card {
  background: linear-gradient(to bottom, #f7fafc 0%, white 100%);
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  position: relative;
}

.phase-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.phase-number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.phase-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.phase-description {
  color: #718096;
  line-height: 1.6;
  margin: 0 0 16px 0;
  padding-left: 56px;
}

.phase-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  padding-left: 56px;
}

.phase-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #4a5568;
}

.item-icon {
  font-size: 1.1rem;
}

.phase-arrow {
  text-align: center;
  font-size: 2rem;
  color: #667eea;
  margin: 16px 0;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(8px); }
}

.quest-specs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  padding: 24px;
  background: #f7fafc;
  border-radius: 12px;
}

.spec-item {
  text-align: center;
}

.spec-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.spec-label {
  font-size: 0.85rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.spec-value {
  font-weight: 700;
  color: #2d3748;
  font-size: 1.1rem;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .template-structure {
    padding: 24px 20px;
  }

  .phase-items {
    grid-template-columns: 1fr;
    padding-left: 0;
  }

  .phase-description {
    padding-left: 0;
  }

  .quest-specs {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>