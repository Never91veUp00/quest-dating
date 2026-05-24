<template>
  <div class="rating-stars" :class="sizeClass">
    <span 
      v-for="star in 5" 
      :key="star"
      class="star"
      :class="getStarClass(star)"
    >
      ★
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rating: {
    type: [Number, String],  // ← ИЗМЕНЕНО: принимаем и Number и String
    default: 0
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

const sizeClass = computed(() => `stars-${props.size}`)

const getStarClass = (position) => {
  // ← ИЗМЕНЕНО: конвертируем в число
  const rating = parseFloat(props.rating) || 0
  
  if (position <= Math.floor(rating)) {
    return 'star-full'
  } else if (position === Math.ceil(rating) && rating % 1 !== 0) {
    return 'star-half'
  }
  return 'star-empty'
}
</script>

<style scoped>
.rating-stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #cbd5e0;
  transition: color 0.3s;
}

.star-full {
  color: #fbbf24;
}

.star-half {
  background: linear-gradient(90deg, #fbbf24 50%, #cbd5e0 50%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.star-empty {
  color: #cbd5e0;
}

.stars-small {
  font-size: 0.9rem;
}

.stars-medium {
  font-size: 1.1rem;
}

.stars-large {
  font-size: 1.5rem;
}
</style>