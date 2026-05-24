<template>
  <div class="occ-filters">
    <!-- Поводы -->
    <div class="occ-filters__occasions">
      <button
        v-for="o in OCCASIONS"
        :key="o.id"
        class="occ-btn"
        :class="{ 'occ-btn--active': activeOccasion === o.id }"
        @click="selectOccasion(o)"
      >
        <span class="occ-btn__emoji">{{ o.emoji }}</span>
        <span class="occ-btn__label">{{ o.label }}</span>
      </button>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({ resetKey: { type: Number, default: 0 } })
const emit  = defineEmits(['filter'])

// Сбрасываем когда родитель инкрементирует resetKey
watch(() => props.resetKey, (v) => {
  if (v > 0) {
    activeOccasion.value = 'all'
    emit('filter', buildFilter())
  }
})

const OCCASIONS = [
  { id: 'all',         emoji: '✨', label: 'Все' },
  { id: 'home',        emoji: '🏠', label: 'Дома',       category: 'home-quests' },
  { id: 'city',        emoji: '🏙️', label: 'По городу', category: 'city-quests' },
  { id: 'proposal',    emoji: '💍', label: 'Предложение', category: 'proposal' },
  { id: 'park',        emoji: '🌳', label: 'В парке',     category: 'park-adventures' },
  { id: 'cultural',    emoji: '🎭', label: 'Культурный',  category: 'cultural' },
  { id: 'gastronomic', emoji: '🍷', label: 'Гастро',      category: 'gastronomic' },
]

const activeOccasion = ref('all')

const hasAny = computed(() => activeOccasion.value !== 'all')

const buildFilter = () => {
  const occ = OCCASIONS.find(o => o.id === activeOccasion.value) || OCCASIONS[0]
  return {
    locationType: null,
    difficulty:   null,
    duration:     null,
    tag:          null,
    category:     occ.category || null,
  }
}

const selectOccasion = (o) => {
  activeOccasion.value = o.id
  // Для "Все" передаём пустой объект — явный сброс
  if (o.id === 'all') {
    emit('filter', { locationType: null, difficulty: null, duration: null, tag: null, category: null })
  } else {
    emit('filter', buildFilter())
  }
}


const reset = () => {
  activeOccasion.value = 'all'
  emit('filter', buildFilter())
}
</script>

<style scoped>
.occ-filters { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }

/* Поводы */
.occ-filters__occasions {
  display: flex; gap: 8px; overflow-x: auto;
  scrollbar-width: none; -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
}
.occ-filters__occasions::-webkit-scrollbar { display: none; }

.occ-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  flex-shrink: 0; padding: 10px 14px; border-radius: 14px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  cursor: pointer; transition: all 0.2s; -webkit-tap-highlight-color: transparent;
  min-width: 72px;
}
.occ-btn:hover { border-color: rgba(212,175,55,0.3); background: rgba(212,175,55,0.06); }
.occ-btn--active {
  background: rgba(212,175,55,0.12);
  border-color: rgba(212,175,55,0.5);
}
.occ-btn__emoji { font-size: 20px; }
.occ-btn__label { font-size: 10px; font-weight: 600; color: rgba(240,237,232,0.65); white-space: nowrap; }
.occ-btn--active .occ-btn__label { color: #d4af37; }


</style>