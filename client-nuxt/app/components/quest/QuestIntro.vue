<template>
  <div
    class="lid"
    :class="[{ 'lid--open': opening }, decor && `lid--${decor}`]"
    role="button"
    tabindex="0"
    aria-label="Открыть коробку с квестом"
    @click="open"
    @keydown.enter.prevent="open"
    @keydown.space.prevent="open"
    @transitionend.self="onLifted"
  >
    <div class="lid__face">
      <p v-if="decor === 'casefile'" class="lid__case">Дело № {{ caseNo }}</p>
      <h1 class="lid__title">{{ questData.title }}</h1>
      <p v-if="questData.client_name" class="lid__for">
        для <b>{{ questData.client_name }}</b>
      </p>
      <span v-if="decor === 'casefile'" class="lid__stamp" aria-hidden="true">Секретно</span>
    </div>
    <p class="lid__hint">Нажми, чтобы открыть</p>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'

// Крышка коробки с игрой: название и имя игрока. Поднимается сама
// через пару секунд или по тапу и открывает правила (QuestSplash).
const props = defineProps({
  theme:     { type: Object, required: true },
  questData: { type: Object, required: true },
  duration:  { type: Number, default: 2600 },
})
const emit = defineEmits(['done'])

const decor   = computed(() => props.theme.world?.decor ?? null)
const caseNo  = computed(() => 1000 + (Number(props.questData.id) || 0))
const opening = ref(false)
let timer = null

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const open = () => {
  if (opening.value) return
  clearTimeout(timer)
  opening.value = true
  if (reduced()) emit('done')
}
const onLifted = () => { if (opening.value) emit('done') }

onMounted(() => { timer = setTimeout(open, props.duration) })
onUnmounted(() => clearTimeout(timer))
</script>

<style scoped>
.lid {
  position: fixed; inset: 0; z-index: 200;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  padding: 24px 20px max(28px, env(safe-area-inset-bottom));
  background: var(--field);
  color: var(--field-ink);
  cursor: pointer;
  box-shadow: 0 24px 40px -10px color-mix(in srgb, var(--rule) 80%, transparent);
  transition: transform .75s cubic-bezier(.7, 0, .2, 1);
}
.lid:focus-visible { outline: 3px solid var(--field-ink); outline-offset: -8px; }
.lid--open { transform: translateY(-104%); }

.lid__face {
  position: relative;
  width: 100%; max-width: 440px;
  padding: 40px 24px;
  border: 3px solid color-mix(in srgb, var(--field-ink) 45%, var(--field));
  border-radius: 14px;
  text-align: center;
}
.lid__title {
  margin: 0;
  font-family: var(--font-d);
  font-weight: 400;
  font-size: clamp(1.7rem, 8vw, 3rem);
  line-height: 1.04;
  hyphens: auto;
  overflow-wrap: break-word;
  letter-spacing: -0.01em;
  text-wrap: balance;
}
.lid__for {
  margin: 18px 0 0;
  font-family: var(--font-b);
  font-size: 1.15rem;
  color: var(--field-ink-soft);
}
.lid__for b { color: var(--field-ink); font-weight: 700; }
/* Номер дела — на язычке папки */
.lid__case {
  position: absolute; left: 0; bottom: 100%;
  margin: 0;
  padding: 8px 18px 6px;
  background: var(--paper-edge);
  border-radius: 10px 10px 0 0;
  font-family: var(--font-b);
  font-size: 1rem;
  color: var(--ink-soft);
  font-variant-numeric: tabular-nums;
}
.lid__hint {
  margin: 28px 0 0;
  font-family: var(--font-b);
  font-size: 1rem;
  color: var(--field-ink-soft);
}

/* ── Обличье дела: папка из крафта со штампом ─────────────────── */
.lid--casefile { background: var(--field); }
.lid--casefile .lid__face {
  background: var(--paper-edge);
  color: var(--ink);
  border: none;
  border-radius: 4px 18px 4px 4px;
  padding: 56px 24px 64px;
  box-shadow: 0 22px 30px -18px color-mix(in srgb, var(--rule) 90%, transparent);
}
.lid--casefile .lid__title { color: var(--ink); }
.lid--casefile .lid__for { color: var(--ink-soft); }
.lid--casefile .lid__for b { color: var(--ink); }
.lid__stamp {
  position: absolute; right: 18px; bottom: 16px;
  padding: 6px 12px;
  border: 3px double var(--chip);
  border-radius: 6px;
  color: var(--chip);
  font-family: var(--font-d);
  font-size: 1.15rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  transform: rotate(-9deg);
  opacity: .88;
}

@media (prefers-reduced-motion: reduce) {
  .lid { transition: none; }
}
</style>
