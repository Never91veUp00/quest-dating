<!-- Одно задание: шапка (тип, очки, кнопки) + общие поля + специфичные поля -->
<template>
  <div class="qe-task">
    <!-- Шапка -->
    <div class="qe-task__header">
      <div class="qe-task__type-badge" :data-type="task.type">{{ typeLabel(task.type) }}</div>
      <span class="qe-task__name">{{ task.title || 'Новое задание' }}</span>
      <div class="qe-task__tools">
        <button class="qe-icon-btn" @click="$emit('move', -1)" :disabled="isFirst">↑</button>
        <button class="qe-icon-btn" @click="$emit('move', 1)"  :disabled="isLast">↓</button>
        <button class="qe-icon-btn qe-icon-btn--danger" @click="$emit('remove')">✕</button>
      </div>
    </div>

    <!-- Поля -->
    <div class="qe-task__fields">
      <!-- Тип + очки -->
      <div class="qe-task__row">
        <div class="qe-field">
          <label>Тип</label>
          <select v-model="task.type" class="qe-select qe-select--sm">
            <optgroup label="Базовые">
              <option value="simple">✓ Простое</option>
              <option value="riddle">? Загадка</option>
              <option value="photo">📷 Фото</option>
            </optgroup>
            <optgroup label="Офлайн">
              <option value="location">📍 Место</option>
              <option value="code_physical">🔢 Физический код</option>
              <option value="selfie">🤳 Селфи с условием</option>
              <option value="qr">◻️ QR-код</option>
            </optgroup>
            <optgroup label="Интерактив">
              <option value="text_answer">✍️ Вопрос партнёру</option>
              <option value="media">🎬 Медиа послание</option>
              <option value="mini_game">🎮 Мини-игра</option>
            </optgroup>
          </select>
        </div>
        <div class="qe-field">
          <label>Очки</label>
          <input v-model.number="task.points" type="number" min="0" max="1000" class="qe-input--sm" />
        </div>
      </div>

      <!-- Общие поля -->
      <div class="qe-field">
        <label>Заголовок задания</label>
        <input v-model="task.title" placeholder="Найти записку у зеркала" />
      </div>
      <div class="qe-field">
        <label>Описание / текст задания</label>
        <textarea v-model="task.description" rows="2"
          placeholder="Что должен сделать клиент..."></textarea>
      </div>

      <!-- Специфичные поля по типу -->
      <EditorTaskFields
        :task="task"
        @generate-qr="$emit('generate-qr', $event)"
        @add-pair-image="(t, url) => $emit('add-pair-image', t, url)"
        @remove-pair-image="(t, i) => $emit('remove-pair-image', t, i)"
        @puzzle-upload="$emit('puzzle-upload', $event)"
        @pair-image-upload="handlePairImageUpload"
        @media-upload="handleMediaUpload"
        @media-clear="handleMediaClear"
      />

      <!-- Hidden inputs -->
      <input :ref="el => { puzzleInput = el }" type="file" accept="image/jpeg,image/png,image/webp" style="display:none" @change="onPuzzleFile" />
      <input :ref="el => { pairInput = el }" type="file" accept="image/jpeg,image/png,image/webp" style="display:none" @change="onPairImageFile" />
      <input :ref="el => { pairReplaceInput = el }" type="file" accept="image/jpeg,image/png,image/webp" style="display:none" @change="onPairReplaceFile" />
      <input :ref="el => { mediaInput = el }" type="file" accept="video/mp4,video/webm,video/quicktime,audio/mpeg,audio/ogg,audio/wav,audio/mp4,audio/x-m4a" style="display:none" @change="onMediaFile" />
    </div>
  </div>
</template>

<script setup>
import EditorTaskFields from './EditorTaskFields.vue'

const props = defineProps({
  task:    { type: Object,  required: true },
  isFirst: { type: Boolean, default: false },
  isLast:  { type: Boolean, default: false },
})
const emit = defineEmits(['move', 'remove', 'generate-qr', 'add-pair-image', 'remove-pair-image', 'puzzle-upload'])

let puzzleInput      = null
let pairInput        = null
let pairReplaceInput = null
let pairReplaceIdx   = null
let mediaInput       = null
let mediaTask        = null

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

const handlePuzzleUpload = () => puzzleInput?.click()

const handlePairImageUpload = (task, idx) => {
  if (idx === null || idx === undefined) {
    pairInput?.click()
  } else {
    pairReplaceIdx = idx
    pairReplaceInput?.click()
  }
}

const handleMediaUpload = (task) => {
  mediaTask = task
  mediaInput?.click()
}

const handleMediaClear = (task) => {
  task.media_url = null
  task.media_type = null
  task.media_original_name = null
  task.media_size = null
}

const onPuzzleFile = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { props.task.puzzle_image = ev.target.result }
  reader.readAsDataURL(file)
  e.target.value = ''
}

const onPairImageFile = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const task = props.task
  e.target.value = ''
  const reader = new FileReader()
  reader.onload = (ev) => {
    task.game_images = [...(task.game_images || []), ev.target.result]
  }
  reader.readAsDataURL(file)
}

const onPairReplaceFile = (e) => {
  const file = e.target.files[0]
  const idx = pairReplaceIdx
  if (!file || idx === null) return
  pairReplaceIdx = null
  e.target.value = ''
  const task = props.task
  const reader = new FileReader()
  reader.onload = (ev) => {
    if (!task.game_images) return
    task.game_images[idx] = ev.target.result
  }
  reader.readAsDataURL(file)
}

const onMediaFile = async (e) => {
  const file = e.target.files[0]
  const task = mediaTask
  if (!file || !task) return
  e.target.value = ''
  mediaTask = null

  task._mediaUploading = true

  try {
    const formData = new FormData()
    formData.append('media', file)

    const tokenCookie = useCookie('auth_token')
    const token = tokenCookie.value
    const res = await fetch(`${API_BASE}/api/admin/upload/media`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    })
    const json = await res.json()

    if (!json.success) throw new Error(json.message)

    task.media_url = json.data.url
    task.media_type = json.data.type
    task.media_original_name = json.data.originalName
    task.media_size = json.data.size
  } catch (err) {
    console.error('Media upload error:', err)
    alert('Ошибка загрузки: ' + err.message)
  } finally {
    task._mediaUploading = false
  }
}

defineExpose({ triggerPuzzleUpload: handlePuzzleUpload })

const typeLabel = (t) => ({
  simple: '✓ Простое', riddle: '? Загадка', photo: '📷 Фото',
  location: '📍 Место', code_physical: '🔢 Код', selfie: '🤳 Селфи',
  qr: '◻️ QR', text_answer: '✍️ Вопрос', media: '🎬 Медиа', mini_game: '🎮 Игра',
}[t] || t)
</script>