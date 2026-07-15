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
    <div v-if="photoError" class="task__photo-error">
      <span>😔</span>
      <span>Не удалось загрузить фото. Попробуй ещё раз.</span>
      <button class="task__photo-retry" @click="retry">Попробовать снова</button>
    </div>
    <div v-else-if="!photoPreview" class="task__photo-zone task__photo-zone--selfie"
      @click="fileInputRef?.click()">
      <div class="task__photo-zone__icon">🤳</div>
      <div class="task__photo-zone__label">Нажми чтобы сфотографироваться</div>
      <div class="task__photo-zone__hint">Этот момент останется навсегда</div>
    </div>
    <div v-else class="task__photo-preview">
      <img :src="photoPreview" alt="Ваше фото" />
      <button class="task__photo-rm" @click="photoPreview = null" aria-label="Удалить фото">✕</button>
      <div class="task__photo-preview__glow"></div>
    </div>
    <button v-if="photoPreview" class="task__action task__action--photo"
      @click="$emit('complete', { ...task, _selfieUrl: photoPreview })">
      Сохранить этот момент ✨
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
const photoError   = ref(false)

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  photoError.value = false
  const reader = new FileReader()
  reader.onload  = (ev) => { photoPreview.value = ev.target.result }
  reader.onerror = ()   => { photoError.value = true }
  reader.readAsDataURL(file)
}

const retry = () => {
  photoError.value = false
  fileInputRef.value?.click()
}
</script>

<style scoped>
.task__selfie-condition {
  display: flex; align-items: center; gap: 10px;
  background: color-mix(in srgb, var(--accent) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 12px; padding: 12px 16px;
  font-size: .95rem; font-weight: 600; color: var(--text);
  margin-bottom: 14px;
}
.task__selfie-condition__emoji { font-size: 1.5rem; flex-shrink: 0; }

.task__photo-zone {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: color-mix(in srgb, var(--accent) 4%, var(--bg2));
  border: 2px dashed color-mix(in srgb, var(--accent) 35%, transparent);
  border-radius: 16px; padding: 36px 24px;
  cursor: pointer; transition: border-color .25s, background .25s;
  text-align: center;
}
.task__photo-zone:hover, .task__photo-zone:active {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, var(--bg2));
}
.task__photo-zone__icon { font-size: 2.8rem; line-height: 1; margin-bottom: 4px; }
.task__photo-zone__label { font-size: .95rem; font-weight: 600; color: var(--text); }
.task__photo-zone__hint { font-size: .78rem; color: var(--dim); margin-top: 2px; font-style: italic; }

.task__photo-preview {
  position: relative; border-radius: 16px; overflow: hidden;
  box-shadow: 0 8px 32px color-mix(in srgb, var(--accent) 25%, transparent);
}
.task__photo-preview img {
  width: 100%; display: block;
  aspect-ratio: 4/3; object-fit: cover;
  border-radius: 16px;
}
.task__photo-preview__glow {
  position: absolute; inset: 0; border-radius: 16px; pointer-events: none;
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--accent) 40%, transparent);
}
.task__photo-rm {
  position: absolute; top: 10px; right: 10px;
  background: rgba(0,0,0,.65); border: none; border-radius: 50%;
  width: 30px; height: 30px; color: #fff; font-size: .75rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
}

.task__action--photo {
  width: 100%; margin-top: 14px;
  background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, #fff));
  color: #000; font-weight: 700; font-size: 1rem;
  border: none; border-radius: 14px; padding: 16px;
  cursor: pointer; box-shadow: 0 4px 20px color-mix(in srgb, var(--accent) 40%, transparent);
  transition: transform .15s, box-shadow .15s;
}
.task__action--photo:active { transform: scale(.97); }

.task__photo-error {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 24px; background: rgba(248,113,113,.08);
  border: 1px solid rgba(248,113,113,.2); border-radius: 12px;
  text-align: center; font-size: .88rem; color: var(--dim);
}
.task__photo-error span:first-child { font-size: 2rem; }
.task__photo-retry {
  margin-top: 4px; background: none;
  border: 1px solid rgba(248,113,113,.4); border-radius: 8px;
  color: #f87171; padding: 6px 16px; cursor: pointer; font-size: .82rem;
}
</style>
