<template>
  <div class="similar-templates">
    <h3 class="section-title">Похожие шаблоны</h3>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else-if="templates.length === 0" class="empty">
      <p>Похожих шаблонов пока нет</p>
    </div>

    <div v-else class="templates-slider">
      <button 
        v-if="canScrollLeft"
        class="slider-nav slider-prev"
        @click="scrollLeft"
      >
        ←
      </button>

      <div class="slider-track" ref="sliderTrack">
        <div 
          v-for="template in templates"
          :key="template.id"
          class="slider-item"
        >
          <TemplateCard :template="template" />
        </div>
      </div>

      <button 
        v-if="canScrollRight"
        class="slider-nav slider-next"
        @click="scrollRight"
      >
        →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const props = defineProps({
  templateSlug: {
    type: String,
    required: true
  }
})

// Используем useDatesApi вместо @/store
const { getSimilarDates } = useDatesApi()

const templates = ref([])
const loading = ref(true)
const sliderTrack = ref(null)
const scrollPosition = ref(0)

const canScrollLeft = computed(() => scrollPosition.value > 0)
const canScrollRight = computed(() => {
  if (!sliderTrack.value) return false
  return scrollPosition.value < sliderTrack.value.scrollWidth - sliderTrack.value.clientWidth
})

const scrollLeft = () => {
  if (sliderTrack.value) {
    sliderTrack.value.scrollBy({ left: -350, behavior: 'smooth' })
  }
}

const scrollRight = () => {
  if (sliderTrack.value) {
    sliderTrack.value.scrollBy({ left: 350, behavior: 'smooth' })
  }
}

const handleScroll = () => {
  if (sliderTrack.value) {
    scrollPosition.value = sliderTrack.value.scrollLeft
  }
}

onMounted(async () => {
  try {
    const response = await getSimilarDates(props.templateSlug)
    templates.value = response?.data || response || []
  } catch (error) {
    console.error('Failed to load similar templates:', error)
  } finally {
    loading.value = false
  }

  if (sliderTrack.value) {
    sliderTrack.value.addEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.similar-templates {
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 32px 0;
}

.loading,
.empty {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.templates-slider {
  position: relative;
}

.slider-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  font-size: 1.5rem;
  color: #667eea;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.slider-nav:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-50%) scale(1.1);
}

.slider-prev { left: -24px; }
.slider-next { right: -24px; }

.slider-track {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 8px 4px;
  margin: 0 -4px;
}

.slider-track::-webkit-scrollbar { display: none; }

.slider-item {
  flex: 0 0 350px;
  max-width: 350px;
}

@media (max-width: 768px) {
  .similar-templates { padding: 32px 20px; }
  .slider-nav { display: none; }
  .slider-item { flex: 0 0 280px; max-width: 280px; }
}
</style>