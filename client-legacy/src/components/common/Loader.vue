<template>
  <div class="loader-wrapper" :class="`loader-${size}`">
    <div class="loader" :class="{ 'loader-overlay': overlay }">
      <div class="spinner"></div>
      <p v-if="text" class="loader-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  overlay: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.loader-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loader-small .spinner {
  width: 24px;
  height: 24px;
  border-width: 3px;
}

.loader-medium .spinner {
  width: 50px;
  height: 50px;
  border-width: 4px;
}

.loader-large .spinner {
  width: 80px;
  height: 80px;
  border-width: 6px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loader-text {
  color: #4a5568;
  font-weight: 500;
  margin: 0;
}

.loader-small .loader-text {
  font-size: 0.875rem;
}

.loader-medium .loader-text {
  font-size: 1rem;
}

.loader-large .loader-text {
  font-size: 1.25rem;
}
</style>