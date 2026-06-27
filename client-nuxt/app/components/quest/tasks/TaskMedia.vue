<template>
  <div>
    <div class="task__media">
      <template v-if="resolvedType === 'video'">
        <video
          :src="fullUrl(task.media_url)"
          controls playsinline
          class="task__media__video"
          preload="metadata"
        ></video>
      </template>
      <template v-else-if="resolvedType === 'audio'">
        <div class="task__media__audio-wrap">
          <div class="task__media__audio-icon">🎙️</div>
          <audio
            :src="fullUrl(task.media_url)"
            controls
            class="task__media__audio"
            preload="metadata"
          ></audio>
        </div>
      </template>
      <template v-else-if="task.media_url">
        <a :href="task.media_url" target="_blank"
          class="task__media__tg-link">
          <div class="task__media__tg-icon">🎬</div>
          <div class="task__media__tg-text">
            <div class="task__media__tg-title">Медиа послание</div>
            <div class="task__media__tg-sub">Нажми чтобы открыть</div>
          </div>
          <div class="task__media__tg-arrow">→</div>
        </a>
      </template>
    </div>
    <button class="task__action" @click="$emit('complete', task)">
      Посмотрел(а) ✓
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

const API_BASE = useRuntimeConfig().public.apiBase.replace('/api', '')

const fullUrl = (url) => url?.startsWith('http') ? url : API_BASE + url

const resolvedType = computed(() => {
  const t = props.task
  if (t.media_type === 'video' || t.media_type === 'audio') return t.media_type
  const url = t.media_url || ''
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return 'video'
  if (/\.(mp3|ogg|wav|m4a)(\?|$)/i.test(url)) return 'audio'
  if (url.includes('/uploads/media/')) {
    const ext = url.split('.').pop().toLowerCase()
    return ['mp4', 'webm', 'mov'].includes(ext) ? 'video' : 'audio'
  }
  return null
})
</script>

<style scoped>
.task__media { display: flex; flex-direction: column; gap: 10px; }
.task__media__video { width: 100%; border-radius: 10px; max-height: 280px; }
.task__media__audio-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 20px; background: var(--bg2); border-radius: 10px;
}
.task__media__audio-icon { font-size: 2rem; }
.task__media__audio { width: 100%; }
.task__media__tg-link {
  display: flex; align-items: center; gap: 14px;
  background: var(--bg2); border: 1px solid var(--bord); border-radius: 12px;
  padding: 16px; text-decoration: none; color: var(--text); transition: border-color .2s;
}
.task__media__tg-link:hover { border-color: var(--accent); }
.task__media__tg-icon { font-size: 2rem; flex-shrink: 0; }
.task__media__tg-title { font-weight: 600; font-size: .95rem; color: #fff; }
.task__media__tg-sub { font-size: .78rem; color: var(--dim); margin-top: 2px; }
.task__media__tg-arrow { font-size: 1.2rem; color: var(--accent); margin-left: auto; }
@media (max-width: 480px) { .task__media__tg-link { padding: 14px; } }
</style>
