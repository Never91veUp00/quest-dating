<template>
  <div class="customization-options">
    <div v-if="hasOptions" class="options-list">
      <!-- Количество локаций -->
      <div v-if="options.locations_count" class="option-group">
        <label class="option-label">
          Количество локаций
          <span class="option-range">
            ({{ options.locations_count.min }}-{{ options.locations_count.max }})
          </span>
        </label>
        <input
          type="range"
          :min="options.locations_count.min"
          :max="options.locations_count.max"
          v-model.number="localCustomization.locations_count"
          @input="updateCustomization"
          class="option-range-input"
        />
        <div class="range-value">{{ localCustomization.locations_count || options.locations_count.min }}</div>
      </div>

      <!-- Цветовая схема -->
      <div v-if="options.color_scheme" class="option-group">
        <label class="option-label">Цветовая схема</label>
        <div class="color-options">
          <label
            v-for="color in colorSchemes"
            :key="color.value"
            class="color-option"
          >
            <input
              type="radio"
              :value="color.value"
              v-model="localCustomization.color_scheme"
              @change="updateCustomization"
            />
            <div 
              class="color-preview"
              :style="{ background: color.gradient }"
            ></div>
            <span class="color-name">{{ color.name }}</span>
          </label>
        </div>
      </div>

      <!-- Настройка сложности -->
      <div v-if="options.difficulty_adjust" class="option-group">
        <label class="option-label">Настройка сложности</label>
        <select
          v-model="localCustomization.difficulty_adjust"
          @change="updateCustomization"
          class="option-select"
        >
          <option value="">Оставить как в шаблоне</option>
          <option value="easier">Сделать проще</option>
          <option value="harder">Сделать сложнее</option>
        </select>
      </div>

      <!-- Персональные послания -->
      <div v-if="options.custom_messages" class="option-group">
        <label class="option-label">
          Персональные послания
          <span class="option-hint">До 3 посланий</span>
        </label>
        <div class="messages-list">
          <textarea
            v-for="(message, index) in localCustomization.custom_messages || ['', '', '']"
            :key="index"
            v-model="localCustomization.custom_messages[index]"
            @input="updateCustomization"
            class="message-input"
            :placeholder="`Послание ${index + 1}`"
            rows="2"
            maxlength="200"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Дополнительные фичи -->
    <div class="features-section">
      <h4 class="features-title">Дополнительные возможности</h4>
      <div class="features-grid">
        <label
          v-for="feature in availableFeatures"
          :key="feature.value"
          class="feature-checkbox"
        >
          <input
            type="checkbox"
            :value="feature.value"
            v-model="localFeatures"
            @change="updateFeatures"
          />
          <div class="feature-card">
            <div class="feature-icon">{{ feature.icon }}</div>
            <div class="feature-info">
              <div class="feature-name">{{ feature.name }}</div>
              <div class="feature-description">{{ feature.description }}</div>
              <div class="feature-price">+{{ feature.price }} ₽</div>
            </div>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  template: {
    type: Object,
    required: true
  },
  modelValue: {
    type: Object,
    default: () => ({})
  },
  selectedFeatures: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'update:selectedFeatures', 'update:featuresData'])

const localCustomization = ref({ ...props.modelValue })
const localFeatures = ref([...props.selectedFeatures])

const options = computed(() => {
  return props.template.customization_options || {}
})

const hasOptions = computed(() => {
  return Object.keys(options.value).length > 0
})

const colorSchemes = [
  { value: 'romantic', name: 'Романтика', gradient: 'linear-gradient(135deg, #FF6B9D, #C06C84)' },
  { value: 'adventure', name: 'Приключение', gradient: 'linear-gradient(135deg, #4A90E2, #357ABD)' },
  { value: 'mystery', name: 'Тайна', gradient: 'linear-gradient(135deg, #7B68EE, #6A5ACD)' },
  { value: 'nature', name: 'Природа', gradient: 'linear-gradient(135deg, #48bb78, #38a169)' }
]

const availableFeatures = [
  {
    value: 'background_music',
    name: 'Фоновая музыка',
    description: 'Атмосферная музыка на фоне',
    icon: '🎵',
    price: 500
  },
  {
    value: 'video_messages',
    name: 'Видео-послания',
    description: 'Запишем ваши видео-поздравления',
    icon: '🎥',
    price: 1000
  },
  {
    value: 'custom_photos',
    name: 'Ваши фотографии',
    description: 'Добавим ваши фото в квест',
    icon: '📸',
    price: 500
  },
  {
    value: 'qr_codes',
    name: 'QR-коды',
    description: 'Физические QR-коды для локаций',
    icon: '📱',
    price: 800
  },
  {
    value: 'partner_surprises',
    name: 'Партнерские сюрпризы',
    description: 'Скидки в кафе и магазинах',
    icon: '🎁',
    price: 1500
  }
]

const updateCustomization = () => {
  emit('update:modelValue', { ...localCustomization.value })
}

const updateFeatures = () => {
  // Эмитим коды для v-model (внутренняя логика)
  emit('update:selectedFeatures', [...localFeatures.value])
  
  // Эмитим полные объекты для отображения и расчёта цены
  const fullFeatures = localFeatures.value.map(code =>
    availableFeatures.find(f => f.value === code)
  ).filter(Boolean)
  emit('update:featuresData', fullFeatures)
}

watch(() => props.modelValue, (newValue) => {
  localCustomization.value = { ...newValue }
}, { deep: true })

watch(() => props.selectedFeatures, (newValue) => {
  localFeatures.value = [...newValue]
})
</script>

<style scoped>
.customization-options {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.option-group {
  margin-bottom: 28px;
}

.option-label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 12px;
  font-size: 1rem;
}

.option-range,
.option-hint {
  font-size: 0.85rem;
  color: #718096;
  font-weight: 400;
  margin-left: 8px;
}

.option-range-input {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
  -webkit-appearance: none;
  margin-bottom: 8px;
}

.option-range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
}

.option-range-input::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: none;
}

.range-value {
  text-align: center;
  font-weight: 700;
  color: #667eea;
  font-size: 1.1rem;
}

.color-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.color-option {
  cursor: pointer;
  text-align: center;
}

.color-option input[type="radio"] {
  display: none;
}

.color-preview {
  width: 100%;
  height: 60px;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 3px solid transparent;
  transition: all 0.3s;
}

.color-option input[type="radio"]:checked + .color-preview {
  border-color: #2d3748;
  transform: scale(1.05);
}

.color-name {
  font-size: 0.85rem;
  color: #4a5568;
  font-weight: 500;
}

.option-select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.option-select:focus {
  outline: none;
  border-color: #667eea;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.3s;
}

.message-input:focus {
  outline: none;
  border-color: #667eea;
}

.features-section {
  padding: 24px;
  background: #f7fafc;
  border-radius: 12px;
}

.features-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 20px 0;
}

.features-grid {
  display: grid;
  gap: 16px;
}

.feature-checkbox {
  cursor: pointer;
}

.feature-checkbox input[type="checkbox"] {
  display: none;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s;
}

.feature-checkbox input[type="checkbox"]:checked + .feature-card {
  border-color: #667eea;
  background: linear-gradient(to right, #f7fafc 0%, white 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.feature-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.feature-info {
  flex: 1;
}

.feature-name {
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
}

.feature-description {
  font-size: 0.85rem;
  color: #718096;
  margin-bottom: 6px;
}

.feature-price {
  font-weight: 700;
  color: #667eea;
  font-size: 0.95rem;
}

@media (max-width: 640px) {
  .color-options {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>