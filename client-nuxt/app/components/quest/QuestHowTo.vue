<template>
  <section class="howto" aria-labelledby="howto-h">
    <!-- Ролик темы: превью по кругу без звука, тап — на весь экран -->
    <button
      v-if="reel"
      type="button"
      class="howto__reel"
      aria-label="Как это работает: открыть ролик на весь экран"
      @click="open"
    >
      <span class="howto__frame">
        <video
          ref="preview"
          class="howto__video"
          :src="reel.src"
          :poster="reel.poster"
          muted
          loop
          playsinline
          preload="metadata"
          aria-hidden="true"
          @error="reelFailed = true"
        ></video>
        <span v-if="!autoplay" class="howto__play" aria-hidden="true"><QuestIcon name="play" :size="26" /></span>
      </span>
      <span class="howto__text">
        <span id="howto-h" class="howto__title">Как это работает</span>
        <span class="howto__sub">Нажми, чтобы смотреть на весь экран</span>
      </span>
    </button>

    <!-- Ролика у темы нет (или он не загрузился) — демо на поле прямо здесь -->
    <template v-else>
      <h2 id="howto-h" class="howto__title howto__title--field">Как это работает</h2>
      <QuestDemo :decor="decor" />
    </template>

    <teleport to="body">
      <transition name="howto">
        <div
          v-if="isOpen"
          class="howto__viewer"
          :style="cssVars"
          role="dialog"
          aria-modal="true"
          aria-label="Как это работает"
          @keydown.esc="close"
        >
          <video
            class="howto__full"
            :src="reel.src"
            :poster="reel.poster"
            autoplay
            muted
            loop
            playsinline
            controls
          ></video>
          <button ref="closeBtn" class="task__action howto__close" @click="close">Понятно</button>
        </div>
      </transition>
    </teleport>
  </section>
</template>

<script setup>
import { computed, ref, nextTick, onMounted, onUnmounted } from 'vue'
import QuestIcon from './QuestIcon.vue'
import QuestDemo from './QuestDemo.vue'
import { themeToCssVars } from './themes.js'

// «Как это работает»: моушн-ролик темы (theme.reel) по кругу без звука,
// а у тем без ролика — анимированное демо на демо-поле.
const props = defineProps({
  theme: { type: Object, required: true },
})

const reelFailed = ref(false)
const reel = computed(() => (!reelFailed.value && props.theme.reel?.src) ? props.theme.reel : null)
const decor = computed(() => props.theme.world?.decor ?? null)
// Просмотрщик живёт в <body>, поэтому токены темы передаём явно
const cssVars = computed(() => themeToCssVars(props.theme))

const preview = ref(null)
const closeBtn = ref(null)
const isOpen = ref(false)

// Автозапуск, только если пользователь не просил меньше движения и не экономит трафик
const autoplay = ref(false)
let observer = null

onMounted(() => {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const saveData = navigator.connection?.saveData === true
  autoplay.value = !reduced && !saveData
  if (!autoplay.value || !preview.value) return
  // Играет, только пока виден: не тратим батарею и трафик за краем экрана
  observer = new IntersectionObserver(([entry]) => {
    const v = preview.value
    if (!v) return
    if (entry.isIntersecting) v.play().catch(() => {})
    else v.pause()
  }, { threshold: 0.4 })
  observer.observe(preview.value)
})
onUnmounted(() => observer?.disconnect())

const open = async () => {
  preview.value?.pause()
  isOpen.value = true
  await nextTick()
  closeBtn.value?.focus()
}
const close = () => {
  isOpen.value = false
  if (autoplay.value) preview.value?.play().catch(() => {})
}
</script>

<style scoped>
/* ── Превью ролика ────────────────────────────────────────────── */
.howto__reel {
  display: flex; align-items: center; gap: 16px;
  width: 100%;
  padding: 12px;
  background: var(--paper);
  color: var(--ink);
  border: none;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 14px 22px -14px color-mix(in srgb, var(--rule) 80%, transparent);
}
.howto__reel:focus-visible { outline: 3px solid var(--field-ink); outline-offset: 3px; }

.howto__frame {
  position: relative;
  flex-shrink: 0;
  width: 112px;
  aspect-ratio: 9 / 16;
  border-radius: 8px;
  overflow: hidden;
  background: var(--rule);
}
.howto__video { display: block; width: 100%; height: 100%; object-fit: cover; }
.howto__play {
  position: absolute; left: 50%; top: 50%;
  display: grid; place-items: center;
  width: 48px; height: 48px; margin: -24px 0 0 -24px;
  border-radius: 50%;
  background: var(--action);
  color: var(--action-ink);
}

.howto__text { display: flex; flex-direction: column; gap: 4px; }
.howto__title { font-family: var(--font-d); font-weight: 400; font-size: 1.2rem; }
.howto__title--field { margin: 0 0 10px; color: var(--field-ink); font-size: 1.3rem; }
.howto__sub { font-family: var(--font-b); font-size: 1rem; line-height: 1.4; color: var(--ink-soft); }

/* ── Ролик на весь экран ──────────────────────────────────────── */
.howto__viewer {
  position: fixed; inset: 0; z-index: 950;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
  padding: max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom));
  background: var(--field);
}
.howto__full {
  display: block;
  height: min(78svh, calc((100vw - 32px) * 16 / 9));
  aspect-ratio: 9 / 16;
  border-radius: 12px;
  background: var(--rule);
}
.howto__close { width: 100%; max-width: 440px; }

.howto-enter-active { transition: opacity .25s ease-out, transform .4s cubic-bezier(.16, 1, .3, 1); }
.howto-leave-active { transition: opacity .2s ease-in; }
.howto-enter-from   { opacity: 0; transform: translateY(24px); }
.howto-leave-to     { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .howto-enter-active, .howto-leave-active { transition: none; }
}
</style>
