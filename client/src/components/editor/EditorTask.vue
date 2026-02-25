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
        @add-pair="$emit('add-pair', $event)"
        @remove-pair="(t, i) => $emit('remove-pair', t, i)"
        @puzzle-upload="$emit('puzzle-upload', $event)"
      />

      <!-- Hidden file input для пазла (один на задание) -->
      <input
        :ref="el => { puzzleInput = el }"
        type="file" accept="image/jpeg,image/png,image/webp"
        style="display:none"
        @change="onPuzzleFile"
      />
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
defineEmits(['move', 'remove', 'generate-qr', 'add-pair', 'remove-pair', 'puzzle-upload'])

let puzzleInput = null

const handlePuzzleUpload = () => puzzleInput?.click()

const onPuzzleFile = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { props.task.puzzle_image = ev.target.result }
  reader.readAsDataURL(file)
}

// Expose для EditorBlock — тот перехватывает puzzle-upload и вызывает этот метод
defineExpose({ triggerPuzzleUpload: handlePuzzleUpload })

const typeLabel = (t) => ({
  simple: '✓ Простое', riddle: '? Загадка', photo: '📷 Фото',
  location: '📍 Место', code_physical: '🔢 Код', selfie: '🤳 Селфи',
  qr: '◻️ QR', text_answer: '✍️ Вопрос', media: '🎬 Медиа', mini_game: '🎮 Игра',
}[t] || t)
</script>