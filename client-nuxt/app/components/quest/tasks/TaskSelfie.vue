<template>
  <div>
    <div class="task__selfie-condition">
      <span class="task__selfie-condition__emoji">{{ task.selfie_emoji || '🤳' }}</span>
      <span>{{ task.selfie_condition || 'Сделай селфи' }}</span>
    </div>
    <input
      ref="fileInputRef"
      type="file" accept="image/*" capture="user"
      style="display:none"
      @change="onFileChange"
    />
    <div v-if="!photoPreview" class="task__photo-zone task__photo-zone--selfie"
      @click="fileInputRef?.click()">
      <div style="font-size:2rem">🤳</div>
      <div>Нажми чтобы сфотографироваться</div>
    </div>
    <div v-else class="task__photo-preview">
      <img :src="photoPreview" alt="" />
      <button class="task__photo-rm" @click="photoPreview = null">✕</button>
    </div>
    <button v-if="photoPreview" class="task__action" @click="$emit('complete', task)">
      Готово →
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
.task__selfie-condition {
  display: flex; align-items: center; gap: 10px;
  background: color-mix(in srgb, var(--accent) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 10px; padding: 12px 16px;
  font-size: .95rem; font-weight: 600; color: var(--text);
}
.task__selfie-condition__emoji { font-size: 1.5rem; flex-shrink: 0; }
.task__photo-zone {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: var(--bg2); border: 2px dashed var(--bord); border-radius: 10px;
  padding: 24px; cursor: pointer; transition: border-color .2s; text-align: center;
  font-size: .85rem; color: var(--dim);
}
.task__photo-zone:hover { border-color: var(--accent); }
.task__photo-zone--selfie { border-color: color-mix(in srgb, var(--accent) 40%, transparent); }
.task__photo-preview { position: relative; border-radius: 10px; overflow: hidden; }
.task__photo-preview img { width: 100%; display: block; max-height: 260px; object-fit: cover; }
.task__photo-rm {
  position: absolute; top: 8px; right: 8px;
  background: rgba(0,0,0,.7); border: none; border-radius: 50%;
  width: 26px; height: 26px; color: #fff; font-size: .7rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
@media (max-width: 480px) {
  .task__photo-zone { padding: 20px 16px; }
  .task__selfie-condition { padding: 10px 12px; font-size: .88rem; }
}
</style>
