<template>
  <span class="difficulty-badge" :class="`difficulty-${difficulty}`">
    {{ difficultyLabel }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  difficulty: {
    type: String,
    required: true,
    validator: (value) => ['easy', 'medium', 'hard', 'expert'].includes(value)
  }
})

const difficultyLabel = computed(() => {
  const labels = {
    easy: 'Легко',
    medium: 'Средне',
    hard: 'Сложно',
    expert: 'Эксперт'
  }
  return labels[props.difficulty] || props.difficulty
})
</script>

<style scoped>
.difficulty-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.difficulty-easy {
  background: #48bb78;
  color: white;
}

.difficulty-medium {
  background: #ed8936;
  color: white;
}

.difficulty-hard {
  background: #f56565;
  color: white;
}

.difficulty-expert {
  background: #9f7aea;
  color: white;
}
</style>