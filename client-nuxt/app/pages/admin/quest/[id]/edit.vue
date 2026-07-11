<template>
  <div class="qe">
    <!-- Header -->
    <header class="qe-header">
      <button class="qe-back" @click="navigateTo('/admin')">← Назад</button>
      <h1 class="qe-header__title">{{ isEdit ? 'Редактировать квест' : 'Новый квест' }}</h1>
      <div class="qe-header__actions">
        <button class="qe-btn qe-btn--ghost" @click="previewQuest" :disabled="!form.slug">
          👁 Предпросмотр
        </button>
        <button class="qe-btn qe-btn--secondary" @click="save(false)" :disabled="saving">
          Сохранить черновик
        </button>
        <button class="qe-btn qe-btn--primary" @click="save(true)" :disabled="saving">
          <span v-if="saving" class="qe-spinner"></span>
          <span v-else>Опубликовать →</span>
        </button>
      </div>
    </header>

    <div class="qe-body">
      <!-- Левая колонка: мета -->
      <EditorMeta
        :form="form"
        :templates="templates"
        :selectedTemplate="selectedTemplate"
        :origin="origin"
        @auto-slug="autoSlug"
        @load-template="onLoadTemplate"
      />

      <!-- Правая колонка: блоки -->
      <div class="qe-editor">
        <div class="qe-editor__head">
          <span class="qe-section__title">Блоки квеста</span>
          <span class="qe-editor__count">{{ form.blocks.length }} {{ pluralBlock(form.blocks.length) }}</span>
        </div>

        <div class="qe-blocks">
          <EditorBlock
            v-for="(block, bi) in form.blocks"
            :key="block.id"
            :block="block"
            :index="bi"
            :isOpen="openBlocks.includes(block.id)"
            :isLast="bi === form.blocks.length - 1"
            @toggle="toggleBlock"
            @move="moveBlock"
            @remove="removeBlock"
            @add-task="addTask"
            @remove-task="removeTask"
            @move-task="moveTask"
            @generate-qr="generateQR"
            @add-pair-image="addPairImage"
            @remove-pair-image="removePairImage"
            @add-text-pair="addTextPair"
            @remove-text-pair="removeTextPair"
          />
        </div>

        <button class="qe-add-block" @click="addBlock">+ Добавить блок</button>

        <div v-if="errors.length" class="qe-errors">
          <div class="qe-errors__title">Исправь перед публикацией:</div>
          <ul>
            <li v-for="e in errors" :key="e">{{ e }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="qe-toast-slide">
      <div v-if="toast" class="qe-toast" :class="`qe-toast--${toast.type}`">
        {{ toast.msg }}
      </div>
    </transition>
  </div>
</template>

<script setup>

const auth = useAuthStore()
if (!auth.isAuthenticated) {
  await navigateTo('/admin/login')
}

const {
  form, saving, errors, openBlocks, templates, selectedTemplate, toast, isEdit, origin,
  addBlock, removeBlock, moveBlock, toggleBlock,
  addTask, removeTask, moveTask,
  generateQR, addPairImage, removePairImage, addTextPair, removeTextPair,
  loadTemplate, autoSlug,
  save, previewQuest,
} = useQuestEditor()

const onLoadTemplate = (tplId) => loadTemplate(tplId)

const pluralBlock = (n) =>
  ['блок', 'блока', 'блоков'][n % 100 > 10 && n % 100 < 20 ? 2 : [2, 0, 1, 1, 1, 2][Math.min(n % 10, 5)]]
</script>