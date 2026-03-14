<template>
  <div class="template-gallery">
    <!-- Главное изображение -->
    <div class="gallery-main">
      <!-- Есть картинки -->
      <img
        v-if="images.length > 0"
        :src="currentImage"
        :alt="template.title"
        :class="['main-image', { 'is-placeholder': currentImage === PLACEHOLDER }]"
        @error="onImgError"
      />
      <!-- Нет картинок — брендированная заглушка -->
      <div v-else class="gallery-placeholder">
        <img
          :src="PLACEHOLDER"
          :alt="`${template.title} — свидание-квест, фото`"
          class="placeholder-img"
        />
      </div>

      <!-- Навигация -->
      <button
        v-if="images.length > 1"
        class="gallery-nav gallery-prev"
        @click="previousImage"
      >
        ←
      </button>
      <button
        v-if="images.length > 1"
        class="gallery-nav gallery-next"
        @click="nextImage"
      >
        →
      </button>

      <!-- Индикатор -->
      <div v-if="images.length > 1" class="gallery-indicator">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>

    <!-- Thumbnails -->
    <div v-if="images.length > 1" class="gallery-thumbnails">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="thumbnail"
        :class="{ active: index === currentIndex }"
        @click="currentIndex = index"
      >
        <img
          :src="image"
          :alt="`${template.title} — свидание-квест, фото ${index + 1}`"
          @error="onImgError"
        />
      </div>
    </div>

    <!-- Video (если есть) -->
    <div v-if="template.demo_video_url" class="gallery-video">
      <h4>Демо-видео</h4>
      <div class="video-wrapper">
        <iframe
          :src="getEmbedUrl(template.demo_video_url)"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const { withFallback, isValidImageSrc, PLACEHOLDER } = useImageFallback()

// Реактивный Set индексов изображений с ошибкой загрузки
const failedIndexes = ref(new Set())

const onImgError = (e) => {
  failedIndexes.value = new Set([...failedIndexes.value, currentIndex.value])
}

const props = defineProps({
  template: {
    type: Object,
    required: true
  }
})

const currentIndex = ref(0)

const images = computed(() => {
  const gallery = (props.template.gallery || []).map(withFallback).filter(url => url !== PLACEHOLDER)
  const cover   = props.template.cover_image ? withFallback(props.template.cover_image) : null

  if (!cover && !gallery.length) return []

  // Дедупликация: cover первым
  const seen = new Set()
  const result = []
  for (const url of [cover, ...gallery]) {
    if (url && !seen.has(url)) {
      seen.add(url)
      result.push(url)
    }
  }
  return result
})

// Если images пустой — currentImage = null → в template используем v-if
const currentImage = computed(() => images.value[currentIndex.value] ?? null)

const nextImage = () => {
  currentIndex.value = (currentIndex.value + 1) % images.value.length
}

const previousImage = () => {
  currentIndex.value = currentIndex.value === 0
    ? images.value.length - 1
    : currentIndex.value - 1
}

const getEmbedUrl = (url) => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.split('v=')[1] || url.split('/').pop()
    return `https://www.youtube.com/embed/${videoId}`
  }
  return url
}
</script>

<style scoped>
.template-gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gallery-main {
  position: relative;
  width: 100%;
  height: 500px;
  border-radius: 16px;
  overflow: hidden;
  background: #f0f4ff;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.main-image.is-placeholder {
  object-fit: contain;
  padding: 60px;
  opacity: 0.7;
}

/* Заглушка когда нет ни одной картинки */
.gallery-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f2ff 0%, #e8eaf6 100%);
}

.placeholder-img {
  width: 55%;
  max-width: 280px;
  height: auto;
  opacity: 0.9;
}

.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  backdrop-filter: blur(4px);
}

.gallery-nav:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.1);
}

.gallery-prev { left: 16px; }
.gallery-next { right: 16px; }

.gallery-indicator {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 20px;
  font-size: 0.9rem;
  backdrop-filter: blur(4px);
}

.gallery-thumbnails {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.thumbnail {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 3px solid transparent;
  transition: all 0.3s;
}

.thumbnail:hover { border-color: #667eea; }

.thumbnail.active {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-video { margin-top: 24px; }

.gallery-video h4 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 12px;
}

.video-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 12px;
}

.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {
  .gallery-main { height: 300px; }
}
</style>