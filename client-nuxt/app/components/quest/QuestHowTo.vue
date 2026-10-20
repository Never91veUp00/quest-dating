<template>
  <div class="howto">
    <button type="button" class="howto__tile" @click="open">
      <span class="howto__play" aria-hidden="true"><QuestIcon name="play" :size="26" /></span>
      <span class="howto__text">
        <span class="howto__title">Как это работает</span>
        <span class="howto__sub">{{ video ? 'Видео' : 'Короткое демо' }} · 15 секунд</span>
      </span>
    </button>

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
          <div class="howto__frame">
            <video
              v-if="video && !videoFailed"
              class="howto__video"
              :src="video"
              autoplay
              muted
              playsinline
              controls
              preload="metadata"
              @error="videoFailed = true"
            ></video>
            <QuestDemo v-else :decor="decor" />
          </div>
          <button ref="closeBtn" class="task__action howto__close" @click="close">Понятно</button>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import QuestIcon from './QuestIcon.vue'
import QuestDemo from './QuestDemo.vue'
import { themeToCssVars } from './themes.js'

// Универсальная инструкция «как это работает»: видео из настройки сайта
// (NUXT_PUBLIC_PLAYER_DEMO_VIDEO), а без него — анимированное демо на демо-поле.
const props = defineProps({
  theme: { type: Object, required: true },
})

const config = useRuntimeConfig()
const video = computed(() => config.public.playerDemoVideo || '')
const decor = computed(() => props.theme.world?.decor ?? null)
// Просмотрщик живёт в <body>, поэтому токены темы передаём явно
const cssVars = computed(() => themeToCssVars(props.theme))

const isOpen = ref(false)
const videoFailed = ref(false)
const closeBtn = ref(null)

const open = async () => {
  isOpen.value = true
  await nextTick()
  closeBtn.value?.focus()
}
const close = () => { isOpen.value = false }
</script>

<style scoped>
.howto__tile {
  display: flex; align-items: center; gap: 14px;
  width: 100%;
  min-height: 72px;
  padding: 12px 16px;
  background: var(--paper);
  color: var(--ink);
  border: none;
  border-radius: 12px;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 14px 22px -14px color-mix(in srgb, var(--rule) 80%, transparent);
  transition: transform .15s ease;
}
.howto__tile:active { transform: translateY(2px); }
.howto__tile:focus-visible { outline: 3px solid var(--field-ink); outline-offset: 3px; }
.howto__play {
  display: grid; place-items: center;
  flex-shrink: 0;
  width: 48px; height: 48px;
  border-radius: 50%;
  background: var(--action);
  color: var(--action-ink);
}
.howto__text { display: flex; flex-direction: column; gap: 2px; }
.howto__title { font-family: var(--font-d); font-size: 1.15rem; }
.howto__sub { font-family: var(--font-b); font-size: .98rem; color: var(--ink-soft); }

.howto__viewer {
  position: fixed; inset: 0; z-index: 950;
  display: flex; flex-direction: column; justify-content: center; gap: 18px;
  padding: max(20px, env(safe-area-inset-top)) 16px max(20px, env(safe-area-inset-bottom));
  background: var(--field);
  color: var(--field-ink);
}
.howto__frame { width: 100%; max-width: 520px; margin: 0 auto; }
.howto__video {
  display: block;
  width: 100%;
  max-height: 70svh;
  border-radius: 12px;
  background: var(--rule);
}
.howto__close { width: 100%; max-width: 520px; margin: 0 auto; }

.howto-enter-active { transition: opacity .25s ease-out, transform .4s cubic-bezier(.16, 1, .3, 1); }
.howto-leave-active { transition: opacity .2s ease-in; }
.howto-enter-from   { opacity: 0; transform: translateY(24px); }
.howto-leave-to     { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .howto-enter-active, .howto-leave-active, .howto__tile { transition: none; }
}
</style>
