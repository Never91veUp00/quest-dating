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
  text:    { type: String,  default: '' },
  size:    { type: String,  default: 'medium', validator: (v) => ['small', 'medium', 'large'].includes(v) },
  overlay: { type: Boolean, default: false }
})
</script>

<style scoped>
.loader-wrapper { display: flex; align-items: center; justify-content: center; }
.loader { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.loader-overlay {
  position: fixed; inset: 0;
  background: rgba(10,10,15,0.85); backdrop-filter: blur(8px);
  z-index: 9999; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.spinner {
  border-radius: 50%; animation: spin 0.75s linear infinite;
  border-color: rgba(212,175,55,0.15);
  border-style: solid;
  border-top-color: #d4af37;
}
.loader-small  .spinner { width: 24px; height: 24px; border-width: 2px; }
.loader-medium .spinner { width: 40px; height: 40px; border-width: 3px; }
.loader-large  .spinner { width: 56px; height: 56px; border-width: 4px; }
@keyframes spin { to { transform: rotate(360deg); } }
.loader-text { color: rgba(240,237,232,0.45); font-weight: 500; margin: 0; }
.loader-small  .loader-text { font-size: 0.8rem; }
.loader-medium .loader-text { font-size: 0.9rem; }
.loader-large  .loader-text { font-size: 1rem; }
</style>