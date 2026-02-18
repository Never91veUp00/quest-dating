<template>
  <div class="template-features">
    <h3 class="section-title">Что входит в квест</h3>
    
    <div class="features-grid">
      <div 
        v-for="(feature, index) in parsedFeatures"
        :key="index"
        class="feature-item"
      >
        <div class="feature-icon">{{ getFeatureIcon(feature) }}</div>
        <div class="feature-text">{{ feature }}</div>
      </div>
    </div>

    <!-- Структура квеста -->
    <div v-if="template.structure" class="quest-structure">
      <h4>Структура квеста</h4>
      <div class="structure-timeline">
        <div 
          v-for="(block, index) in structureBlocks"
          :key="index"
          class="structure-block"
        >
          <div class="block-number">{{ index + 1 }}</div>
          <div class="block-content">
            <div class="block-type">{{ getBlockTypeName(block.type) }}</div>
            <div v-if="block.count" class="block-count">
              {{ block.count }} заданий
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Кастомизация -->
    <div v-if="hasCustomization" class="customization-section">
      <h4>Возможности кастомизации</h4>
      <ul class="customization-list">
        <li v-for="(option, key) in template.customization_options" :key="key">
          <span class="option-icon">✓</span>
          {{ getCustomizationLabel(key, option) }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  template: {
    type: Object,
    required: true
  }
})

const parsedFeatures = computed(() => {
  if (!props.template.features) return []
  if (Array.isArray(props.template.features)) {
    return props.template.features
  }
  try {
    return JSON.parse(props.template.features)
  } catch {
    return []
  }
})

const structureBlocks = computed(() => {
  if (!props.template.structure) return []
  
  try {
    const structure = typeof props.template.structure === 'string' 
      ? JSON.parse(props.template.structure)
      : props.template.structure
    
    return structure.blocks || []
  } catch {
    return []
  }
})

const hasCustomization = computed(() => {
  return props.template.customization_options && 
         Object.keys(props.template.customization_options).length > 0
})

const getFeatureIcon = (feature) => {
  const featureLower = feature.toLowerCase()
  
  if (featureLower.includes('загадк')) return '🧩'
  if (featureLower.includes('фото')) return '📷'
  if (featureLower.includes('qr')) return '📱'
  if (featureLower.includes('подсказк')) return '💡'
  if (featureLower.includes('таймер')) return '⏱️'
  if (featureLower.includes('карт')) return '🗺️'
  if (featureLower.includes('музык')) return '🎵'
  if (featureLower.includes('видео')) return '🎥'
  if (featureLower.includes('приз')) return '🎁'
  
  return '✨'
}

const getBlockTypeName = (type) => {
  const typeMap = {
    intro: 'Вступление',
    map: 'Интерактивная карта',
    task: 'Задание',
    riddle: 'Загадка',
    puzzle: 'Головоломка',
    photo: 'Фото-задание',
    message: 'Послание',
    finale: 'Финал'
  }
  return typeMap[type] || type
}

const getCustomizationLabel = (key, value) => {
  const labelMap = {
    color_scheme: 'Выбор цветовой схемы',
    locations_count: `Количество локаций (${value.min}-${value.max})`,
    difficulty_adjust: 'Настройка сложности',
    custom_messages: 'Персональные послания',
    music: 'Фоновая музыка',
    photos: 'Загрузка собственных фото'
  }
  return labelMap[key] || key
}
</script>

<style scoped>
.template-features {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 24px 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 12px;
  transition: all 0.3s;
}

.feature-item:hover {
  background: #edf2f7;
  transform: translateX(4px);
}

.feature-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.feature-text {
  font-size: 0.95rem;
  color: #4a5568;
  font-weight: 500;
}

.quest-structure,
.customization-section {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid #e2e8f0;
}

.quest-structure h4,
.customization-section h4 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 20px 0;
}

.structure-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.structure-block {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(to right, #f7fafc 0%, white 100%);
  border-left: 4px solid #667eea;
  border-radius: 8px;
}

.block-number {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.block-content {
  flex: 1;
}

.block-type {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.block-count {
  font-size: 0.85rem;
  color: #718096;
}

.customization-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.customization-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #4a5568;
}

.option-icon {
  width: 24px;
  height: 24px;
  background: #48bb78;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .template-features {
    padding: 24px 20px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>