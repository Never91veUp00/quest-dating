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
      <span>Не удалось загрузить фото. Попробуй ещё раз.</span>
      <button class="task__photo-retry" @click="retry">Попробовать снова</button>
    </div>
    <!-- Видоискатель фронтальной камеры прямо в карточке: снимок как в зеркале -->
    <div v-else-if="cameraOn" class="task__selfie-cam">
      <div class="task__selfie-view">
        <video ref="videoRef" autoplay muted playsinline></video>
      </div>
      <div class="task__selfie-controls">
        <button type="button" class="task__selfie-cancel" @click="stopCamera">Отмена</button>
        <button type="button" class="task__selfie-shutter" :disabled="!cameraReady" aria-label="Сделать снимок" @click="shoot"></button>
        <span class="task__selfie-spacer" aria-hidden="true"></span>
      </div>
    </div>
    <div v-else-if="!photoPreview" class="task__photo-zone task__photo-zone--selfie"
      @click="openCamera">
      <QuestIcon class="task__photo-zone__icon" name="selfie" :size="32" />
      <div class="task__photo-zone__label">Нажми чтобы сфотографироваться</div>
      <div class="task__photo-zone__hint">{{ cameraDenied ? 'Камера недоступна — выбери готовое фото' : 'Этот момент останется навсегда' }}</div>
    </div>
    <div v-else class="task__photo-preview">
      <img :src="photoPreview" alt="Ваше фото" />
      <button class="task__photo-rm" @click="photoPreview = null" aria-label="Удалить фото">✕</button>
      <div class="task__photo-preview__glow"></div>
    </div>
    <button v-if="photoPreview" class="task__action task__action--photo"
      @click="$emit('complete', { ...task, _selfieUrl: photoPreview })">
      Сохранить этот момент
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick, onUnmounted } from 'vue'
import QuestIcon from '../QuestIcon.vue'

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
  openCamera()
}

// ─── Фронтальная камера ─────────────────────────────────────────
// capture="user" у <input type=file> iPhone и многие Android-камеры не слушают
// и открывают основную камеру, поэтому снимаем сами через getUserMedia.
// Нет камеры или доступа — прежний выбор файла (с capture="user").
const videoRef     = ref(null)
const cameraOn     = ref(false)
const cameraReady  = ref(false)
const cameraDenied = ref(false)
let stream = null

const openCamera = async () => {
  if (cameraDenied.value || !navigator.mediaDevices?.getUserMedia) { fileInputRef.value?.click(); return }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
      audio: false,
    })
  } catch {
    // доступ запрещён или камеры нет: сразу выбор файла (где браузер ещё помнит тап),
    // иначе подсказка в зоне, и следующий тап откроет выбор файла
    cameraDenied.value = true
    fileInputRef.value?.click()
    return
  }
  cameraOn.value = true
  cameraReady.value = false
  await nextTick()
  videoRef.value?.closest('.task__selfie-cam')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  const v = videoRef.value
  if (!v) return stopCamera()
  v.srcObject = stream
  v.onloadedmetadata = () => { cameraReady.value = true }
  v.play?.().catch(() => {})
}

const stopCamera = () => {
  stream?.getTracks().forEach(t => t.stop())
  stream = null
  cameraOn.value = false
  cameraReady.value = false
}

const shoot = () => {
  const v = videoRef.value
  if (!v?.videoWidth) return
  const c = document.createElement('canvas')
  c.width = v.videoWidth
  c.height = v.videoHeight
  const ctx = c.getContext('2d')
  // как в видоискателе — зеркально
  ctx.translate(c.width, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(v, 0, 0, c.width, c.height)
  photoPreview.value = c.toDataURL('image/jpeg', 0.9)
  stopCamera()
}

onUnmounted(stopCamera)
</script>

<style scoped>
.task__selfie-condition {
  display: flex; align-items: center; gap: 10px;
  background: color-mix(in srgb, var(--action) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--action) 20%, transparent);
  border-radius: 12px; padding: 12px 16px;
  font-size: .95rem; font-weight: 600; color: var(--ink);
  margin-bottom: 14px;
}
.task__selfie-condition__emoji { font-size: 1.5rem; flex-shrink: 0; }

.task__photo-zone {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: color-mix(in srgb, var(--action) 4%, color-mix(in srgb, var(--paper) 86%, var(--ink)));
  border: 2px dashed color-mix(in srgb, var(--action) 35%, transparent);
  border-radius: 16px; padding: 36px 24px;
  cursor: pointer; transition: border-color .25s, background .25s;
  text-align: center;
}
.task__photo-zone:hover, .task__photo-zone:active {
  border-color: var(--action);
  background: color-mix(in srgb, var(--action) 8%, color-mix(in srgb, var(--paper) 86%, var(--ink)));
}
.task__photo-zone__icon { font-size: 2.8rem; line-height: 1; margin-bottom: 4px; }
.task__photo-zone__label { font-size: .95rem; font-weight: 600; color: var(--ink); }
.task__photo-zone__hint { font-size: .78rem; color: var(--ink-soft); margin-top: 2px; font-style: italic; }

.task__selfie-cam { display: flex; flex-direction: column; gap: 14px; }
.task__selfie-view {
  position: relative;
  /* видоискатель и затвор помещаются в экран вместе с заголовком задания */
  height: min(46svh, 440px);
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: var(--rule);
}
.task__selfie-view video {
  width: 100%; height: 100%;
  display: block;
  object-fit: cover;
  transform: scaleX(-1);
}
.task__selfie-controls {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}
.task__selfie-cancel {
  justify-self: start;
  min-height: 44px;
  padding: 0 4px;
  background: none; border: none;
  color: var(--ink-soft);
  font-size: .95rem;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}
/* затвор: кольцо цвета действия с плотной серединой, у большого пальца */
.task__selfie-shutter {
  width: 72px; height: 72px;
  border-radius: 50%;
  border: 4px solid var(--action);
  background: var(--action);
  box-shadow: inset 0 0 0 4px var(--paper);
  cursor: pointer;
  transition: transform .12s ease-out, opacity .2s;
}
.task__selfie-shutter:active { transform: scale(.94); }
.task__selfie-shutter:disabled { opacity: .45; cursor: default; }
.task__selfie-shutter:focus-visible { outline: 3px solid var(--ink); outline-offset: 3px; }

.task__photo-preview {
  position: relative; border-radius: 16px; overflow: hidden;
  box-shadow: 0 12px 18px -12px color-mix(in srgb, var(--rule) 70%, transparent);
}
.task__photo-preview img {
  width: 100%; display: block;
  aspect-ratio: 4/3; object-fit: cover;
  border-radius: 16px;
}
.task__photo-preview__glow {
  position: absolute; inset: 0; border-radius: 16px; pointer-events: none;
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--action) 40%, transparent);
}
.task__photo-rm {
  position: absolute; top: 10px; right: 10px;
  background: color-mix(in srgb, var(--rule) 65%, transparent); border: none; border-radius: 50%;
  width: 30px; height: 30px; color: var(--paper); font-size: .75rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
}

.task__action--photo {
  width: 100%; margin-top: 14px;
  background: var(--action);
  color: var(--action-ink); font-weight: 700; font-size: 1rem;
  border: none; border-radius: 14px; padding: 16px;
  cursor: pointer; box-shadow: 0 12px 18px -12px color-mix(in srgb, var(--rule) 70%, transparent);
  transition: transform .15s, box-shadow .15s;
}
.task__action--photo:active { transform: scale(.97); }

.task__photo-error {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 24px; background: color-mix(in srgb, var(--wrong) 8%, transparent);
  border: 1px solid color-mix(in srgb, var(--wrong) 20%, transparent); border-radius: 12px;
  text-align: center; font-size: .88rem; color: var(--ink-soft);
}
.task__photo-error span:first-child { font-size: 2rem; }
.task__photo-retry {
  margin-top: 4px; background: none;
  border: 1px solid color-mix(in srgb, var(--wrong) 40%, transparent); border-radius: 8px;
  color: var(--wrong); padding: 6px 16px; cursor: pointer; font-size: .82rem;
}
</style>
