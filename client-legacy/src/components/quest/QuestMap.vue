<template>
  <div class="quest-map">
    <h3 class="map-title">Карта локаций</h3>

    <!-- Список локаций -->
    <div class="locations-list">
      <div
        v-for="(location, index) in locations"
        :key="index"
        class="location-item"
        :class="{ 
          completed: location.completed,
          current: currentLocation === index,
          locked: index > currentLocation
        }"
        @click="selectLocation(index)"
      >
        <!-- Номер локации -->
        <div class="location-number">
          <span v-if="location.completed" class="number-check">✓</span>
          <span v-else-if="index <= currentLocation">{{ index + 1 }}</span>
          <span v-else>🔒</span>
        </div>

        <!-- Информация о локации -->
        <div class="location-info">
          <h4 class="location-title">{{ location.title }}</h4>
          <p class="location-address">{{ location.address }}</p>
          <p v-if="location.task" class="location-task">{{ location.task }}</p>
        </div>

        <!-- Статус -->
        <div class="location-status">
          <span v-if="location.completed" class="status-badge completed">
            Выполнено
          </span>
          <span v-else-if="index === currentLocation" class="status-badge current">
            Текущая
          </span>
          <span v-else-if="index < currentLocation" class="status-badge available">
            Доступно
          </span>
          <span v-else class="status-badge locked">
            Заблокировано
          </span>
        </div>
      </div>
    </div>

    <!-- Прогресс -->
    <div class="map-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
      <p class="progress-text">
        Пройдено: {{ completedCount }} из {{ locations.length }} локаций
      </p>
    </div>

    <!-- Интерактивная карта (если координаты есть) -->
    <div v-if="hasCoordinates" class="interactive-map">
      <div ref="mapContainer" class="map-container"></div>
      <p class="map-hint">
        💡 Нажмите на маркер для получения направления
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  locations: {
    type: Array,
    required: true,
    default: () => []
  },
  currentLocation: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['select-location', 'navigate-to'])

const mapContainer = ref(null)

const completedCount = computed(() => {
  return props.locations.filter(loc => loc.completed).length
})

const progressPercentage = computed(() => {
  if (props.locations.length === 0) return 0
  return Math.round((completedCount.value / props.locations.length) * 100)
})

const hasCoordinates = computed(() => {
  return props.locations.some(loc => loc.lat && loc.lng)
})

const selectLocation = (index) => {
  if (index <= props.currentLocation) {
    emit('select-location', index)
  }
}

const initMap = () => {
  // TODO: Интеграция с картами (Leaflet, Google Maps, Yandex Maps)
  // Placeholder для будущей реализации
  console.log('Map initialization placeholder')
}

onMounted(() => {
  if (hasCoordinates.value && mapContainer.value) {
    initMap()
  }
})
</script>

<style scoped>
.quest-map {
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.map-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 24px 0;
}

.locations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s;
  cursor: pointer;
}

.location-item.completed {
  background: linear-gradient(to right, #d1fae5 0%, #f0fdf4 100%);
  border-color: #48bb78;
}

.location-item.current {
  background: linear-gradient(to right, #dbeafe 0%, #eff6ff 100%);
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.location-item.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.location-item:not(.locked):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.location-number {
  width: 48px;
  height: 48px;
  background: white;
  border: 3px solid #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: #4a5568;
  flex-shrink: 0;
}

.location-item.completed .location-number {
  background: #48bb78;
  border-color: #48bb78;
  color: white;
}

.location-item.current .location-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.number-check {
  font-size: 1.5rem;
}

.location-info {
  flex: 1;
}

.location-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.location-address {
  font-size: 0.9rem;
  color: #718096;
  margin: 0 0 6px 0;
}

.location-task {
  font-size: 0.85rem;
  color: #4a5568;
  font-style: italic;
  margin: 0;
}

.location-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.completed {
  background: #48bb78;
  color: white;
}

.status-badge.current {
  background: #667eea;
  color: white;
}

.status-badge.available {
  background: #ed8936;
  color: white;
}

.status-badge.locked {
  background: #cbd5e0;
  color: #718096;
}

.map-progress {
  margin-bottom: 28px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.progress-text {
  text-align: center;
  font-weight: 600;
  color: #4a5568;
  margin: 0;
  font-size: 0.95rem;
}

.interactive-map {
  margin-top: 28px;
  padding-top: 28px;
  border-top: 2px solid #e2e8f0;
}

.map-container {
  width: 100%;
  height: 400px;
  background: #f7fafc;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #718096;
  font-size: 1rem;
  margin-bottom: 12px;
}

.map-container::before {
  content: '🗺️ Карта загружается...';
}

.map-hint {
  text-align: center;
  font-size: 0.85rem;
  color: #718096;
  margin: 0;
}

@media (max-width: 768px) {
  .quest-map {
    padding: 20px 16px;
  }

  .location-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .location-status {
    width: 100%;
  }

  .status-badge {
    display: block;
    text-align: center;
  }
}
</style>