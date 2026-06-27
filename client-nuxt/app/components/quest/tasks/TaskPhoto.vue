<template>
  <div>
    <p v-if="task.instruction" class="task__instruction">{{ task.instruction }}</p>
    <input
      ref="fileInputRef"
      type="file" accept="image/*" capture="environment"
      style="display:none"
      @change="onFileChange"
    />
    <div v-if="!photoPreview" class="task__photo-zone" @click="fileInputRef?.click()">
      <div style="font-size:1.6rem">📷</div>
      <div>{{ theme.copy.photoZone }}</div>
    </div>
    <div v-else class="task__photo-preview">
      <img :src="photoPreview" alt="" />
      <button class="task__photo-rm" @click="photoPreview = null">✕</button>
    </div>
    <button v-if="photoPreview" class="task__action" @click="$emit('complete', task)">
      Отправить →
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete'])

const fileInputRef = ref(null)
const photoPreview = ref(null)

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { photoPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.task__photo-zone {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: var(--bg2); border: 2px dashed var(--bord); border-radius: 10px;
  padding: 24px; cursor: pointer; transition: border-color .2s; text-align: center;
  font-size: .85rem; color: var(--dim);
}
.task__photo-zone:hover { border-color: var(--accent); }
.task__photo-preview { position: relative; border-radius: 10px; overflow: hidden; }
.task__photo-preview img { width: 100%; display: block; max-height: 260px; object-fit: cover; }
.task__photo-rm {
  position: absolute; top: 8px; right: 8px;
  background: rgba(0,0,0,.7); border: none; border-radius: 50%;
  width: 26px; height: 26px; color: #fff; font-size: .7rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
@media (max-width: 480px) { .task__photo-zone { padding: 20px 16px; } }
</style>
