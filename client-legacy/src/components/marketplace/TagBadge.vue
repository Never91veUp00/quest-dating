<template>
  <span 
    class="tag-badge" 
    :class="sizeClass"
    @click="handleClick"
  >
    {{ tag.name }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tag: {
    type: Object,
    required: true
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const sizeClass = computed(() => `tag-${props.size}`)

const handleClick = () => {
  if (props.clickable) {
    emit('click', props.tag)
  }
}
</script>

<style scoped>
.tag-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #edf2f7;
  color: #4a5568;
  border-radius: 12px;
  font-weight: 500;
  transition: all 0.3s;
}

.tag-small {
  font-size: 0.75rem;
  padding: 3px 10px;
}

.tag-medium {
  font-size: 0.85rem;
  padding: 4px 12px;
}

.tag-large {
  font-size: 0.95rem;
  padding: 6px 16px;
}

.tag-badge:hover {
  background: #667eea;
  color: white;
  cursor: pointer;
}
</style>