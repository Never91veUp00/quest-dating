<template>
  <div>
    <div v-if="task.media_url" class="task__media">
      <video v-if="isVideo" :src="task.media_url" controls class="task__media__video" />
      <img  v-else           :src="task.media_url" alt="" class="task__media__img" />
    </div>
    <p v-if="task.media_caption" class="task__media__caption">{{ task.media_caption }}</p>
    <button class="task__action" @click="$emit('complete', task)">
      {{ theme.copy.taskDone }} ✓
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete'])

const isVideo = computed(() => {
  const url = props.task.media_url || ''
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)
})
</script>

<style scoped>
.task__media { border-radius: 10px; overflow: hidden; }
.task__media__video,
.task__media__img { width: 100%; display: block; max-height: 320px; object-fit: cover; }
.task__media__caption { font-size: .85rem; color: var(--dim); text-align: center; margin-top: 8px; }
</style>
