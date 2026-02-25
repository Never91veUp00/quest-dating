<template>
  <div class="qe">

    <!-- Header -->
    <header class="qe-header">
      <button class="qe-back" @click="$router.push('/admin')">← Назад</button>
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

      <!-- ══ Левая колонка ══ -->
      <EditorMeta
        :form="form"
        :templates="templates"
        :selectedTemplate="selectedTemplate"
        :origin="origin"
        @auto-slug="autoSlug"
        @load-template="onLoadTemplate"
      />

      <!-- ══ Правая колонка: блоки ══ -->
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
            @add-pair="addPair"
            @remove-pair="removePair"
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
import EditorMeta  from '@/components/editor/EditorMeta.vue'
import EditorBlock from '@/components/editor/EditorBlock.vue'
import { useQuestEditor } from '@/composables/useQuestEditor'

const {
  form, saving, errors, openBlocks, templates, selectedTemplate, toast, isEdit, origin,
  addBlock, removeBlock, moveBlock, toggleBlock,
  addTask, removeTask, moveTask,
  generateQR, addPair, removePair,
  loadTemplate, autoSlug,
  save, previewQuest,
} = useQuestEditor()

// Шаблон приходит по id из select — находим объект и передаём в composable
const onLoadTemplate = (id) => {
  if (!id) { selectedTemplate.value = ''; return }
  const tpl = templates.value.find(t => String(t.id) === String(id))
  if (tpl) { selectedTemplate.value = tpl; loadTemplate() }
}

const pluralBlock = (n) => n === 1 ? 'блок' : n < 5 ? 'блока' : 'блоков'
</script>

<style>
/* ── Root ─────────────────────────────────────────────────────── */
.qe {
  min-height: 100vh;
  background: #0f1117;
  color: #c8d6ef;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  display: flex;
  flex-direction: column;
}

/* ── Header ───────────────────────────────────────────────────── */
.qe-header {
  display: flex; align-items: center; gap: 16px;
  padding: 14px 24px;
  background: #1a1f2e;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  position: sticky; top: 0; z-index: 100;
}

.qe-back {
  background: transparent; border: none;
  color: #718096; font-size: 0.85rem; cursor: pointer;
  padding: 6px 10px; border-radius: 6px; white-space: nowrap;
}
.qe-back:hover { color: #fff; background: rgba(255,255,255,0.06); }

.qe-header__title { font-size: 1.05rem; font-weight: 700; color: #fff; flex: 1; margin: 0; }

.qe-header__actions { display: flex; gap: 8px; }

/* ── Body ─────────────────────────────────────────────────────── */
.qe-body {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 0;
  flex: 1;
  min-height: 0;
}

/* ── Sidebar (meta) ───────────────────────────────────────────── */
.qe-meta {
  border-right: 1px solid rgba(255,255,255,0.06);
  padding: 24px 20px;
  overflow-y: auto;
  max-height: calc(100vh - 57px);
  position: sticky; top: 57px;
  display: flex; flex-direction: column; gap: 8px;
}

.qe-section { display: flex; flex-direction: column; gap: 14px; }
.qe-section + .qe-section { padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); margin-top: 8px; }
.qe-section__title { font-size: 0.72rem; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.1em; }

/* ── Fields ───────────────────────────────────────────────────── */
.qe-field { display: flex; flex-direction: column; gap: 5px; }
.qe-field--full { grid-column: 1/-1; }
.qe-field label { font-size: 0.75rem; color: #718096; font-weight: 600; }
.req { color: #f56565; }

.qe-field input,
.qe-field textarea,
.qe-field select,
.qe-select {
  background: #0f1117;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 7px;
  padding: 9px 11px;
  color: #fff;
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  width: 100%;
}
.qe-field input:focus,
.qe-field textarea:focus,
.qe-field select:focus { border-color: #667eea; }

.qe-input--sm { width: 80px; }
.qe-select--sm { width: auto; }

.qe-hint { font-size: 0.72rem; color: #4a5568; line-height: 1.4; }

/* Slug row */
.qe-slug-row { display: flex; align-items: center; background: #0f1117; border: 1px solid rgba(255,255,255,0.1); border-radius: 7px; overflow: hidden; }
.qe-slug-prefix { padding: 9px 0 9px 11px; color: #4a5568; font-size: 0.82rem; white-space: nowrap; }
.qe-slug-input { border: none !important; border-radius: 0 !important; background: transparent !important; flex: 1; }
.qe-slug-link { font-size: 0.72rem; color: #667eea; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Themes */
.qe-themes { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
/* ── Intro selector ─────────────────────────────────────────── */
.qe-intro-options {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}
.qe-intro-opt {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px; padding: 14px 10px; cursor: pointer;
  transition: all .18s; text-align: center;
}
.qe-intro-opt:hover { border-color: rgba(255,255,255,.2); }
.qe-intro-opt.active { border-color: #667eea; background: rgba(102,126,234,.1); }
.qe-intro-opt__icon  { font-size: 1.6rem; line-height: 1; }
.qe-intro-opt__label { font-size: .82rem; color: #fff; font-weight: 600; }
.qe-intro-opt__sub   { font-size: .68rem; color: #4a5568; }
.qe-intro-preview {
  margin-top: 8px; background: rgba(102,126,234,.06);
  border: 1px solid rgba(102,126,234,.18); border-radius: 8px; padding: 10px 12px;
  display: flex; flex-direction: column; gap: 4px;
}
.qe-intro-preview__badge {
  font-size: .8rem; color: #a0aec0; font-weight: 500;
}

.qe-theme-btn {
  display: flex; align-items: center; gap: 6px;
  background: #0f1117; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 7px; padding: 8px 10px; cursor: pointer;
  color: #718096; font-size: 0.82rem;
  transition: all 0.15s;
}
.qe-theme-btn:hover { border-color: rgba(255,255,255,0.2); color: #fff; }
.qe-theme-btn.active { border-color: #667eea; color: #fff; background: rgba(102,126,234,0.1); }

/* ── Editor ───────────────────────────────────────────────────── */
.qe-editor { padding: 24px; overflow-y: auto; }

.qe-editor__head {
  display: flex; align-items: center; gap: 10px; margin-bottom: 20px;
}
.qe-editor__count { font-size: 0.75rem; color: #4a5568; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 10px; }

/* ── Blocks ───────────────────────────────────────────────────── */
.qe-blocks { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }

.qe-block {
  background: #1a1f2e;
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.qe-block:hover,
.qe-block--open { border-color: rgba(102,126,234,0.3); }

.qe-block__header {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 16px; cursor: pointer;
  user-select: none;
}
.qe-block__header:hover { background: rgba(255,255,255,0.02); }

.qe-block__num {
  width: 26px; height: 26px; border-radius: 50%;
  background: rgba(102,126,234,0.15); color: #667eea;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.78rem; font-weight: 700; flex-shrink: 0;
}

.qe-block__info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.qe-block__name { font-weight: 600; color: #fff; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qe-block__loc { font-size: 0.75rem; color: #718096; }
.qe-block__tasks-count { font-size: 0.72rem; color: #4a5568; }

.qe-block__tools { display: flex; align-items: center; gap: 4px; }
.qe-block__chevron { color: #4a5568; font-size: 0.7rem; margin-left: 4px; }

.qe-block__body { padding: 0 16px 16px; border-top: 1px solid rgba(255,255,255,0.05); }
.qe-block__fields { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-top: 14px; }

/* ── Tasks ────────────────────────────────────────────────────── */
.qe-tasks { margin-top: 16px; }
.qe-tasks__head { font-size: 0.72rem; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }

.qe-task {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
}

.qe-task__header {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.qe-task__type-badge {
  font-size: 0.68rem; font-weight: 700;
  padding: 2px 8px; border-radius: 4px; white-space: nowrap;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.qe-task__type-badge[data-type="simple"]  { background: rgba(72,187,120,.15);  color: #48bb78; }
.qe-task__type-badge[data-type="riddle"]  { background: rgba(237,137,54,.15);  color: #ed8936; }
.qe-task__type-badge[data-type="photo"]   { background: rgba(102,126,234,.15); color: #667eea; }

.qe-task__name { flex: 1; font-size: 0.85rem; color: #cbd5e0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qe-task__tools { display: flex; gap: 3px; }

.qe-task__fields { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.qe-task__row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.qe-input--mono { font-family: var(--font-d, monospace); letter-spacing: .12em; }

/* ── QR ───────────────────────────────────────────────────────── */
.qe-qr-row { display: flex; gap: 8px; }
.qe-qr-btn {
  background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12);
  border-radius: 7px; padding: 8px 12px; color: #fff; font-size: .82rem;
  cursor: pointer; white-space: nowrap; transition: all .15s; flex-shrink: 0;
}
.qe-qr-btn:hover:not(:disabled) { background: rgba(255,255,255,.12); }
.qe-qr-btn:disabled { opacity: .4; cursor: default; }

.qe-qr-preview {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: #fff; border-radius: 10px; padding: 12px; width: fit-content;
}
.qe-qr-preview img { width: 150px; height: 150px; display: block; }
.qe-qr-download {
  font-size: .78rem; color: #667eea; text-decoration: none;
}
.qe-qr-download:hover { text-decoration: underline; }

/* ── Mini-game ────────────────────────────────────────────────── */
.qe-game-options { display: flex; flex-direction: column; gap: 6px; }
.qe-game-option { display: flex; align-items: center; gap: 8px; }
.qe-game-option__letter {
  width: 24px; height: 24px; border-radius: 50%;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  display: flex; align-items: center; justify-content: center;
  font-size: .72rem; font-weight: 700; color: #718096; cursor: pointer;
  flex-shrink: 0; transition: all .15s; font-family: monospace;
}
.qe-game-option.correct .qe-game-option__letter { background: rgba(72,187,120,.2); border-color: #48bb78; color: #48bb78; }
.qe-game-option__input { flex: 1; }
.qe-game-option__check { color: #48bb78; font-size: .9rem; flex-shrink: 0; }

.qe-game-pairs { display: flex; flex-direction: column; gap: 6px; }

/* ── Puzzle editor ───────────────────────────────────────────── */
.qe-photo-drop {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: rgba(255,255,255,.03); border: 2px dashed rgba(255,255,255,.12);
  border-radius: 10px; padding: 28px 16px; cursor: pointer; text-align: center;
  font-size: .88rem; color: #718096; transition: border-color .2s;
}
.qe-photo-drop:hover { border-color: #667eea; color: #a0aec0; }
.qe-photo-drop__icon { font-size: 2rem; }
.qe-puzzle-preview { position: relative; display: inline-block; }
.qe-puzzle-preview__img { max-width: 100%; max-height: 200px; border-radius: 8px; display: block; }
.qe-puzzle-preview__rm {
  margin-top: 8px; background: rgba(245,101,101,.12); border: 1px solid rgba(245,101,101,.3);
  border-radius: 6px; color: #f56565; font-size: .78rem; padding: 5px 12px; cursor: pointer;
}
.qe-hint--ok { color: #48bb78; background: rgba(72,187,120,.08); border-radius: 6px; padding: 8px 12px; }
.qe-game-pair { display: flex; align-items: center; gap: 6px; }
.qe-game-pair input { flex: 1; }
.qe-game-pair__arrow { color: #4a5568; font-size: .9rem; flex-shrink: 0; }

/* ── Add task groups ──────────────────────────────────────────── */
.qe-add-task { display: flex; flex-direction: column; gap: 6px; margin-top: 6px; }
.qe-add-task__group { display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
.qe-add-task__label {
  font-size: .62rem; color: #4a5568; text-transform: uppercase;
  letter-spacing: .08em; min-width: 60px; flex-shrink: 0;
}
.qe-add-task__btn {
  background: transparent;
  border: 1px dashed rgba(255,255,255,0.12);
  border-radius: 6px;
  padding: 6px 12px;
  color: #718096; font-size: 0.78rem; cursor: pointer;
  transition: all 0.15s;
}
.qe-add-task__btn:hover { border-color: #667eea; color: #667eea; }

.qe-add-block {
  width: 100%;
  background: transparent;
  border: 2px dashed rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 14px;
  color: #718096; font-size: 0.88rem; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.qe-add-block:hover { border-color: #667eea; color: #667eea; background: rgba(102,126,234,0.04); }

/* ── Icon buttons ────────────────────────────────────────────── */
.qe-icon-btn {
  background: rgba(255,255,255,0.06); border: none;
  border-radius: 5px; width: 26px; height: 26px;
  font-size: 0.8rem; cursor: pointer; color: #718096;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.qe-icon-btn:hover:not(:disabled) { background: rgba(255,255,255,0.12); color: #fff; }
.qe-icon-btn:disabled { opacity: 0.3; cursor: default; }
.qe-icon-btn--danger:hover:not(:disabled) { background: rgba(245,101,101,0.15); color: #f56565; }

/* ── Buttons ─────────────────────────────────────────────────── */
.qe-btn {
  border: none; border-radius: 8px; padding: 9px 16px;
  font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; gap: 6px;
}
.qe-btn:disabled { opacity: 0.5; cursor: default; }
.qe-btn--primary   { background: #667eea; color: #fff; }
.qe-btn--primary:hover:not(:disabled) { background: #5a67d8; }
.qe-btn--secondary { background: rgba(255,255,255,0.08); color: #fff; }
.qe-btn--secondary:hover:not(:disabled) { background: rgba(255,255,255,0.12); }
.qe-btn--ghost     { background: transparent; color: #718096; border: 1px solid rgba(255,255,255,0.1); }
.qe-btn--ghost:hover:not(:disabled) { color: #fff; border-color: rgba(255,255,255,0.2); }

.qe-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Errors ──────────────────────────────────────────────────── */
.qe-errors {
  margin-top: 16px;
  background: rgba(245,101,101,0.08);
  border: 1px solid rgba(245,101,101,0.25);
  border-radius: 8px;
  padding: 14px 16px;
}
.qe-errors__title { font-weight: 700; color: #f56565; margin-bottom: 8px; font-size: 0.85rem; }
.qe-errors ul { padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
.qe-errors li { font-size: 0.82rem; color: #fc8181; }

/* ── Responsive ──────────────────────────────────────────────── */
@media (max-width: 900px) {
  .qe-body { grid-template-columns: 1fr; }
  .qe-meta { position: static; max-height: none; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .qe-header__actions { gap: 5px; }
  .qe-btn { padding: 8px 10px; font-size: 0.78rem; }
}
</style>

<style>
/* ── Toast ────────────────────────────────────────────────────── */
.qe-toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  z-index: 9999; padding: 13px 22px; border-radius: 10px;
  font-size: .9rem; font-weight: 600; max-width: 500px; text-align: center;
  box-shadow: 0 8px 24px rgba(0,0,0,.4);
}
.qe-toast--success { background: #276749; color: #9ae6b4; border: 1px solid #276749; }
.qe-toast--info    { background: #1a365d; color: #90cdf4; border: 1px solid #2b4c7e; }
.qe-toast--error   { background: #742a2a; color: #feb2b2; border: 1px solid #742a2a; }
.qe-toast-slide-enter-active { transition: all .3s ease; }
.qe-toast-slide-leave-active { transition: all .25s ease; }
.qe-toast-slide-enter-from   { opacity: 0; transform: translateX(-50%) translateY(12px); }
.qe-toast-slide-leave-to     { opacity: 0; transform: translateX(-50%) translateY(8px); }
</style>