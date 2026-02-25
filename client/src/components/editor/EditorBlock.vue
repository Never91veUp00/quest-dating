<!-- Один блок квеста: заголовок-аккордеон + поля блока + список заданий -->
<template>
  <div class="qe-block" :class="{ 'qe-block--open': isOpen }">

    <!-- Заголовок -->
    <div class="qe-block__header" @click="$emit('toggle', block.id)">
      <div class="qe-block__num">{{ index + 1 }}</div>
      <div class="qe-block__info">
        <span class="qe-block__name">{{ block.title || 'Блок без названия' }}</span>
        <span v-if="block.location" class="qe-block__loc">📍 {{ block.location }}</span>
        <span class="qe-block__tasks-count">{{ block.tasks.length }} заданий</span>
      </div>
      <div class="qe-block__tools">
        <button class="qe-icon-btn" @click.stop="$emit('move', index, -1)"
          :disabled="index === 0" title="Вверх">↑</button>
        <button class="qe-icon-btn" @click.stop="$emit('move', index, 1)"
          :disabled="isLast" title="Вниз">↓</button>
        <button class="qe-icon-btn qe-icon-btn--danger" @click.stop="$emit('remove', index)"
          title="Удалить блок">✕</button>
        <span class="qe-block__chevron">{{ isOpen ? '▲' : '▼' }}</span>
      </div>
    </div>

    <!-- Тело (только когда открыт) -->
    <div v-if="isOpen" class="qe-block__body">

      <!-- Поля блока -->
      <div class="qe-block__fields">
        <div class="qe-field">
          <label>Название блока</label>
          <input v-model="block.title" placeholder="Улика №1 — Прихожая" />
        </div>
        <div class="qe-field">
          <label>Локация</label>
          <input v-model="block.location" placeholder="Прихожая, у зеркала" />
        </div>
        <div class="qe-field qe-field--full">
          <label>Описание блока</label>
          <textarea v-model="block.description" rows="2"
            placeholder="Вводный текст для этой локации..."></textarea>
        </div>
      </div>

      <!-- Задания -->
      <div class="qe-tasks">
        <div class="qe-tasks__head">Задания</div>

        <EditorTask
          v-for="(task, ti) in block.tasks"
          :key="task.id"
          :ref="el => { if (el) taskRefs[task.id] = el }"
          :task="task"
          :isFirst="ti === 0"
          :isLast="ti === block.tasks.length - 1"
          @move="(dir) => $emit('move-task', block, ti, dir)"
          @remove="$emit('remove-task', block, ti)"
          @generate-qr="$emit('generate-qr', $event)"
          @add-pair="$emit('add-pair', $event)"
          @remove-pair="(t, i) => $emit('remove-pair', t, i)"
          @puzzle-upload="(task) => taskRefs[task.id]?.triggerPuzzleUpload()"
        />

        <!-- Кнопки добавления задания -->
        <div class="qe-add-task">
          <div class="qe-add-task__group">
            <span class="qe-add-task__label">Базовые</span>
            <button class="qe-add-task__btn" @click="$emit('add-task', block, 'simple')">✓ Простое</button>
            <button class="qe-add-task__btn" @click="$emit('add-task', block, 'riddle')">? Загадка</button>
            <button class="qe-add-task__btn" @click="$emit('add-task', block, 'photo')">📷 Фото</button>
          </div>
          <div class="qe-add-task__group">
            <span class="qe-add-task__label">Офлайн</span>
            <button class="qe-add-task__btn" @click="$emit('add-task', block, 'location')">📍 Место</button>
            <button class="qe-add-task__btn" @click="$emit('add-task', block, 'code_physical')">🔢 Код</button>
            <button class="qe-add-task__btn" @click="$emit('add-task', block, 'selfie')">🤳 Селфи</button>
            <button class="qe-add-task__btn" @click="$emit('add-task', block, 'qr')">◻️ QR</button>
          </div>
          <div class="qe-add-task__group">
            <span class="qe-add-task__label">Интерактив</span>
            <button class="qe-add-task__btn" @click="$emit('add-task', block, 'text_answer')">✍️ Вопрос</button>
            <button class="qe-add-task__btn" @click="$emit('add-task', block, 'media')">🎬 Медиа</button>
            <button class="qe-add-task__btn" @click="$emit('add-task', block, 'mini_game')">🎮 Игра</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import EditorTask from './EditorTask.vue'

defineProps({
  block:  { type: Object,  required: true },
  index:  { type: Number,  required: true },
  isOpen: { type: Boolean, default: false },
  isLast: { type: Boolean, default: false },
})
defineEmits([
  'toggle', 'move', 'remove',
  'add-task', 'remove-task', 'move-task',
  'generate-qr', 'add-pair', 'remove-pair',
])

// Refs на EditorTask — чтобы проксировать puzzle-upload к нужному экземпляру
const taskRefs = {}
</script>