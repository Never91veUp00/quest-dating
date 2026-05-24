<template>
  <div v-if="isOpen" class="gallery-modal" @click.self="close">
    <div class="gallery-content">
      <button class="close-btn" @click="close">&times;</button>
      
      <button 
        v-if="images.length > 1" 
        class="nav-btn prev" 
        @click="prevImage"
        :disabled="currentIndex === 0"
      >
        ‹
      </button>
      
      <div class="image-container">
        <img 
          :src="currentImage" 
          :alt="`Image ${currentIndex + 1}`"
          class="main-image"
        >
        
        <div class="image-counter">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>
      </div>
      
      <button 
        v-if="images.length > 1" 
        class="nav-btn next" 
        @click="nextImage"
        :disabled="currentIndex === images.length - 1"
      >
        ›
      </button>
      
      <!-- Thumbnails -->
      <div v-if="images.length > 1" class="thumbnails">
        <img 
          v-for="(image, index) in images"
          :key="index"
          :src="image"
          :alt="`Thumbnail ${index + 1}`"
          class="thumbnail"
          :class="{ active: index === currentIndex }"
          @click="currentIndex = index"
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  images: {
    type: Array,
    default: () => []
  },
  startIndex: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close'])

const currentIndex = ref(props.startIndex)

const currentImage = computed(() => {
  return props.images[currentIndex.value] || '/images/placeholder.svg'
})

const close = () => {
  emit('close')
}

const nextImage = () => {
  if (currentIndex.value < props.images.length - 1) {
    currentIndex.value++
  }
}

const prevImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

// Keyboard navigation
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})

const handleKeydown = (e) => {
  switch(e.key) {
    case 'Escape':
      close()
      break
    case 'ArrowLeft':
      prevImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

// Reset index when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    currentIndex.value = props.startIndex
  }
})
</script>

<style scoped>
.gallery-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.gallery-content {
  position: relative;
  max-width: 1200px;
  width: 100%;
  height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 40px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  z-index: 10;
  line-height: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.image-container {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 20px;
}

.main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.image-counter {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 60px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  line-height: 1;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.nav-btn.prev {
  left: 20px;
}

.nav-btn.next {
  right: 20px;
}

.thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 10px 0;
  max-width: 100%;
}

.thumbnail {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  border: 2px solid transparent;
}

.thumbnail:hover {
  opacity: 0.8;
}

.thumbnail.active {
  opacity: 1;
  border-color: white;
}

@media (max-width: 768px) {
  .nav-btn {
    width: 40px;
    height: 40px;
    font-size: 40px;
  }
  
  .close-btn {
    width: 40px;
    height: 40px;
    font-size: 30px;
  }
  
  .thumbnail {
    width: 60px;
    height: 45px;
  }
}
</style>