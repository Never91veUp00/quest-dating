<template>
  <aside class="template-filters">
    <div class="filters-header">
      <h3>Фильтры</h3>
      <button @click="handleReset" class="btn-clear">
        Сбросить
      </button>
    </div>

    <!-- Категории -->
    <div class="filter-section">
      <h4 class="filter-title">Категории</h4>
      <div class="filter-options">
        <label
          v-for="category in categories"
          :key="category.id"
          class="filter-option"
        >
          <input
            type="radio"
            :value="category.id"
            v-model="localFilters.category"
            @change="emitFilters"
          />
          <span class="option-icon">{{ category.icon }}</span>
          <span class="option-label">{{ category.name }}</span>
          <span v-if="Number(category.templates_count) > 0" class="option-count">({{ category.templates_count }})</span>
        </label>
      </div>
    </div>

    <!-- Сложность -->
    <div class="filter-section">
      <h4 class="filter-title">Сложность</h4>
      <div class="filter-options">
        <label
          v-for="level in difficultyLevels"
          :key="level.value"
          class="filter-option"
        >
          <input
            type="radio"
            :value="level.value"
            v-model="localFilters.difficulty"
            @change="emitFilters"
          />
          <DifficultyBadge :difficulty="level.value" />
        </label>
      </div>
    </div>

    <!-- Цена -->
    <div class="filter-section">
      <h4 class="filter-title">Цена</h4>
      <div class="price-range">
        <div class="price-inputs">
          <input
            type="number"
            v-model.number="localFilters.priceRange[0]"
            placeholder="От"
            class="price-input"
            @change="emitFilters"
          />
          <span>—</span>
          <input
            type="number"
            v-model.number="localFilters.priceRange[1]"
            placeholder="До"
            class="price-input"
            @change="emitFilters"
          />
        </div>
        <input
          type="range"
          min="0"
          max="10000"
          step="100"
          v-model.number="localFilters.priceRange[1]"
          class="price-slider"
          @change="emitFilters"
        />
        <div class="price-labels">
          <span>0 ₽</span>
          <span>10 000 ₽</span>
        </div>
      </div>
    </div>

    <!-- Длительность -->
    <div class="filter-section">
      <h4 class="filter-title">Длительность</h4>
      <div class="filter-options">
        <label
          v-for="duration in durationOptions"
          :key="duration.value"
          class="filter-option"
        >
          <input
            type="radio"
            :value="duration.value"
            v-model="localFilters.duration"
            @change="emitFilters"
          />
          <span class="option-label">{{ duration.label }}</span>
        </label>
      </div>
    </div>

    <!-- Тип локации -->
    <div class="filter-section">
      <h4 class="filter-title">Место проведения</h4>
      <div class="filter-options">
        <label
          v-for="location in locationTypes"
          :key="location.value"
          class="filter-option"
        >
          <input
            type="radio"
            :value="location.value"
            v-model="localFilters.locationType"
            @change="emitFilters"
          />
          <span class="option-label">{{ location.label }}</span>
        </label>
      </div>
    </div>

    <!-- Теги -->
    <div class="filter-section">
      <h4 class="filter-title">Теги</h4>
      <div class="filter-tags">
        <label
          v-for="tag in popularTags"
          :key="tag.id"
          class="tag-checkbox"
        >
          <input
            type="checkbox"
            :value="tag.id"
            v-model="localFilters.tags"
            @change="emitFilters"
          />
          <TagBadge :tag="tag" size="small" />
        </label>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import DifficultyBadge from './DifficultyBadge.vue'
import TagBadge from './TagBadge.vue'

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  tags: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => ({
      category: null,
      difficulty: null,
      priceRange: [0, 10000],
      duration: null,
      locationType: null,
      tags: []
    })
  }
})

const emit = defineEmits(['update:filters', 'reset'])

const localFilters = ref({ ...props.filters })

const difficultyLevels = [
  { value: 'easy', label: 'Легко' },
  { value: 'medium', label: 'Средне' },
  { value: 'hard', label: 'Сложно' },
  { value: 'expert', label: 'Эксперт' }
]

const durationOptions = [
  { value: '0-60', label: 'До 1 часа' },
  { value: '60-120', label: '1-2 часа' },
  { value: '120-180', label: '2-3 часа' },
  { value: '180+', label: 'Более 3 часов' }
]

const locationTypes = [
  { value: 'city', label: 'По городу' },
  { value: 'park', label: 'Парк' },
  { value: 'indoor', label: 'В помещении' },
  { value: 'universal', label: 'Универсальный' }
]

const popularTags = computed(() => props.tags.slice(0, 10))

const emitFilters = () => {
  emit('update:filters', { ...localFilters.value })
}

const handleReset = () => {
  localFilters.value = {
    category: null,
    difficulty: null,
    priceRange: [0, 10000],
    duration: null,
    locationType: null,
    tags: []
  }
  emit('reset')
}

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })
</script>

<style scoped>
.template-filters {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 100px;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.filters-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.btn-clear {
  padding: 6px 12px;
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-clear:hover {
  background: #667eea;
  color: white;
}

.filter-section {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.filter-section:last-child {
  border-bottom: none;
}

.filter-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.filter-option:hover {
  background: #f7fafc;
}

.filter-option input[type="radio"],
.filter-option input[type="checkbox"] {
  cursor: pointer;
}

.option-icon {
  font-size: 1.2rem;
}

.option-label {
  flex: 1;
  font-size: 0.9rem;
  color: #4a5568;
}

.option-count {
  font-size: 0.85rem;
  color: #718096;
}

.price-range {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
}

.price-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
  -webkit-appearance: none;
}

.price-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
}

.price-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  border: none;
}

.price-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #718096;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-checkbox {
  cursor: pointer;
}

.tag-checkbox input[type="checkbox"] {
  display: none;
}

.tag-checkbox input[type="checkbox"]:checked + .tag-badge {
  background: #667eea;
  color: white;
}

@media (max-width: 1024px) {
  .template-filters {
    position: static;
  }
}
</style>