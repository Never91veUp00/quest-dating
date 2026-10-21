<template>
  <teleport to="body">
    <transition name="mg-overlay">
      <div v-if="modelValue" class="mg-overlay" :class="decor && `mg-overlay--${decor}`" :style="cssVars">

        <!-- Header -->
        <div class="mg-overlay__head">
          <div class="mg-overlay__meta">
            <QuestIcon class="mg-overlay__icon" name="game" :size="22" />
            <span class="mg-overlay__label">{{ task.title }}</span>
          </div>
          <button class="mg-overlay__close" @click="$emit('update:modelValue', false)" aria-label="Закрыть"><QuestIcon name="close" :size="20" /></button>
        </div>

        <!-- Game content -->
        <div class="mg-overlay__body">
          <slot />
        </div>

      </div>
    </transition>
  </teleport>
</template>

<script setup>
import QuestIcon from '../../QuestIcon.vue'
defineProps({
  modelValue: { type: Boolean, required: true },
  task:       { type: Object,  required: true },
  cssVars:    { type: Object,  default: () => ({}) },
  decor:      { type: String,  default: null },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.mg-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: var(--paper); color: var(--ink);
  /* окно вынесено в body, мимо корня плеера: настройки шрифта темы ставим здесь */
  font-feature-settings: var(--font-feat, normal);
  font-size-adjust: var(--font-adjust, none);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  isolation: isolate;
  transform: translateZ(0);
}

.mg-overlay :deep(:is(button, input)) { font-feature-settings: inherit; font-size-adjust: inherit; }
.mg-overlay :deep(:focus-visible) { outline-color: var(--focus); }
.mg-overlay :deep(::selection) { background: var(--focus); color: var(--paper); }

/* Переписка, «Найди пары»: рубашка — конверт обратной стороной, клапан закрыт, знака вопроса нет */
.mg-overlay--letters :deep(.task__pairs__card__back) {
  font-size: 0;
  background:
    linear-gradient(to top right, transparent calc(50% - 1px), color-mix(in srgb, var(--rule) 30%, var(--back)) calc(50% - 1px) calc(50% + .5px), transparent calc(50% + .5px)) left bottom / 50% 60% no-repeat,
    linear-gradient(to top left,  transparent calc(50% - 1px), color-mix(in srgb, var(--rule) 30%, var(--back)) calc(50% - 1px) calc(50% + .5px), transparent calc(50% + .5px)) right bottom / 50% 60% no-repeat,
    var(--back);
}
.mg-overlay--letters :deep(.task__pairs__card__back::before) {
  content: "";
  position: absolute; inset: 0 0 46% 0;
  background: color-mix(in srgb, var(--field-ink) 14%, var(--back));
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}
.mg-overlay--letters :deep(.task__pairs__card) { border-width: 3px; border-radius: 4px; box-shadow: 0 6px 10px -6px color-mix(in srgb, var(--rule) 70%, transparent); }
.mg-overlay--letters :deep(.task__pairs__card:not(.selected):not(.matched):not(:hover)) { border-color: transparent; }
.mg-overlay--letters :deep(.task__pairs__card__back),
.mg-overlay--letters :deep(.task__pairs__card__front) { border-radius: 3px; clip-path: inset(0 round 3px); }

/* Схема, «Найди пары»: талоны лежат на бумаге схемы, а не на таком же талоне */
.mg-overlay--metro { background: var(--field); color: var(--field-ink); }
/* Схема, «Найди пары»: рубашка — талон с зелёной полосой, без знака вопроса */
.mg-overlay--metro :deep(.task__pairs__card__back) {
  font-size: 0;
  background: var(--paper);
  box-shadow: inset 0 14px 0 var(--chip);
}
.mg-overlay--metro :deep(.task__pairs__card__back::before) {
  content: "";
  position: absolute; left: 8px; right: 8px; top: 24px;
  border-top: 2px dashed color-mix(in srgb, var(--ink) 30%, var(--paper));
}
.mg-overlay--metro :deep(.task__pairs__card) { border-width: 3px; border-radius: 6px; box-shadow: 0 6px 10px -6px color-mix(in srgb, var(--rule) 50%, transparent); }
.mg-overlay--metro :deep(.task__pairs__card:not(.selected):not(.matched):not(:hover)) { border-color: transparent; }

/* Футляр, «Найди пары»: фон — бархат, рубашка — закрытый футляр со швом крышки */
.mg-overlay--ringbox { background: var(--field); color: var(--field-ink); }
.mg-overlay--ringbox :deep(.task__pairs__card__back) {
  font-size: 0;
  background:
    linear-gradient(transparent calc(34% - 1px), color-mix(in srgb, var(--rule) 55%, var(--back)) calc(34% - 1px) calc(34% + 1px), transparent calc(34% + 1px)),
    var(--back);
}
.mg-overlay--ringbox :deep(.task__pairs__card) { border-width: 2px; border-radius: 10px; box-shadow: 0 8px 12px -8px color-mix(in srgb, var(--rule) 70%, transparent); }
.mg-overlay--ringbox :deep(.task__pairs__card:not(.selected):not(.matched):not(:hover)) { border-color: var(--rule); }
.mg-overlay--ringbox :deep(.task__pairs__card__back),
.mg-overlay--ringbox :deep(.task__pairs__card__front) { border-radius: 8px; clip-path: inset(0 round 8px); }

/* Карта, «Найди пары»: рубашка — пергамент с чернильной розой ветров */
.mg-overlay--map :deep(.task__pairs__card__back) {
  font-size: 0;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cg fill='none' stroke='%232a1f14' stroke-width='1.4' stroke-linejoin='round'%3E%3Ccircle cx='20' cy='20' r='13'/%3E%3Cpath d='M20 3 L23 17 L37 20 L23 23 L20 37 L17 23 L3 20 L17 17 Z'/%3E%3C/g%3E%3Cpath d='M20 3 L23 17 L20 20 Z M37 20 L23 23 L20 20 Z M20 37 L17 23 L20 20 Z M3 20 L17 17 L20 20 Z' fill='%232a1f14'/%3E%3C/svg%3E") center / 62% no-repeat,
    var(--paper-edge);
}
.mg-overlay--map :deep(.task__pairs__card) { border-width: 3px; border-radius: 4px; box-shadow: 0 6px 10px -6px color-mix(in srgb, var(--rule) 70%, transparent); }
.mg-overlay--map :deep(.task__pairs__card:not(.selected):not(.matched):not(:hover)) { border-color: transparent; }

/* Колода, «Найди пары»: рубашка — киноварная решётка с рамкой, как у карт расклада */
.mg-overlay--tarot :deep(.task__pairs__card__back) {
  font-size: 0;
  background:
    repeating-linear-gradient(45deg,  transparent 0 7px, color-mix(in srgb, var(--paper) 38%, var(--back)) 7px 8px),
    repeating-linear-gradient(-45deg, transparent 0 7px, color-mix(in srgb, var(--paper) 38%, var(--back)) 7px 8px),
    var(--back);
  box-shadow: inset 0 0 0 4px var(--back), inset 0 0 0 5.5px var(--paper);
}
.mg-overlay--tarot :deep(.task__pairs__card) { border-width: 3px; border-radius: 6px; box-shadow: 0 6px 10px -6px color-mix(in srgb, var(--rule) 70%, transparent); }
.mg-overlay--tarot :deep(.task__pairs__card:not(.selected):not(.matched):not(:hover)) { border-color: transparent; }
.mg-overlay--tarot :deep(.task__pairs__card__back),
.mg-overlay--tarot :deep(.task__pairs__card__front) { border-radius: 4px; clip-path: inset(0 round 4px); }

/* ── Header ── */
.mg-overlay__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid color-mix(in srgb, var(--ink) 30%, var(--paper));
  flex-shrink: 0;
}
.mg-overlay__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.mg-overlay__icon { font-size: 1rem; flex-shrink: 0; }
.mg-overlay__label {
  font-size: .85rem;
  font-weight: 700;
  color: var(--ink); font-family: var(--font-d); font-weight: 400; font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mg-overlay__close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--ink) 30%, var(--paper));
  background: color-mix(in srgb, var(--paper) 86%, var(--ink));
  color: var(--ink); font-family: var(--font-d); font-weight: 400; font-size: 1rem;
  font-size: .85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background .15s;
}
.mg-overlay__close:hover { background: color-mix(in srgb, var(--paper) 86%, var(--ink)); }

/* ── Body ── */
.mg-overlay__body {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 16px;
  display: flex;
  flex-direction: column;
}

/* ── Transition ── */
.mg-overlay-enter-active,
.mg-overlay-leave-active { transition: opacity .22s ease, transform .22s ease; }
.mg-overlay-enter-from,
.mg-overlay-leave-to    { opacity: 0; transform: translateY(24px); }
</style>
