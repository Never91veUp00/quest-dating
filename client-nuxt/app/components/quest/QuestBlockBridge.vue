<template>
  <div class="bridge" @click="advance">
    <div class="bridge__glow" aria-hidden="true"></div>

    <div class="bridge__done">
      <div class="bridge__check">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="19" stroke="currentColor" stroke-width="1.5" opacity=".3"/>
          <path d="M11 20.5L17.5 27L29 14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="bridge__check-path"/>
        </svg>
      </div>
      <div class="bridge__done-label">{{ theme.copy.taskDone }}</div>
    </div>

    <div class="bridge__divider" aria-hidden="true"></div>

    <div class="bridge__next-preview">
      <div class="bridge__next-label">{{ theme.copy.blockPrefix }} {{ nextIndex + 1 }}</div>
      <h3 class="bridge__next-title">{{ nextBlock.title }}</h3>
      <p v-if="nextBlock.location" class="bridge__next-loc">
        <span>📍</span> {{ nextBlock.location }}
      </p>
    </div>

    <button class="bridge__cta" @click.stop="advance">
      {{ theme.copy.startBtn === 'НАЧАТЬ МИССИЮ' ? 'Продолжить →' : 'Идём дальше →' }}
    </button>

    <div class="bridge__tap-hint">Нажми, чтобы продолжить</div>
  </div>
</template>

<script setup>
defineProps({
  theme:      { type: Object, required: true },
  nextBlock:  { type: Object, required: true },
  nextIndex:  { type: Number, required: true },
})
const emit = defineEmits(['advance'])

const advance = () => emit('advance')
</script>

<style scoped>
.bridge {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 24px 32px;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
}

.bridge__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 70% 50% at 50% 40%,
    color-mix(in srgb, var(--accent) 12%, transparent) 0%,
    transparent 70%);
  pointer-events: none;
}

/* ── Done state ── */
.bridge__check {
  width: 64px;
  height: 64px;
  color: var(--accent);
  margin: 0 auto 12px;
}

.bridge__check-path {
  stroke-dasharray: 30;
  stroke-dashoffset: 30;
  animation: draw-check .5s .1s ease forwards;
}

@keyframes draw-check {
  to { stroke-dashoffset: 0; }
}

.bridge__done-label {
  font-size: .8rem;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--accent);
  opacity: .8;
  font-family: var(--font-d);
}

/* ── Divider ── */
.bridge__divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom,
    color-mix(in srgb, var(--accent) 40%, transparent),
    transparent);
  margin: 24px auto;
}

/* ── Next block preview ── */
.bridge__next-label {
  font-size: .7rem;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--dim);
  margin-bottom: 10px;
  font-family: var(--font-d);
}

.bridge__next-title {
  font-size: 1.35rem;
  font-weight: 700;
  font-family: var(--font-d);
  color: #fff;
  line-height: 1.3;
  margin: 0 0 10px;
}

.bridge__next-loc {
  font-size: .82rem;
  color: var(--text);
  opacity: .7;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin: 0;
}

/* ── CTA ── */
.bridge__cta {
  margin-top: 32px;
  background: var(--accent);
  color: #000;
  font-weight: 700;
  font-family: var(--font-d);
  font-size: 1rem;
  border: none;
  border-radius: 16px;
  padding: 14px 32px;
  cursor: pointer;
  box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 35%, transparent);
  transition: transform .18s, box-shadow .18s;
}

.bridge__cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 36px color-mix(in srgb, var(--accent) 50%, transparent);
}

.bridge__tap-hint {
  margin-top: 14px;
  font-size: .72rem;
  color: var(--dim);
  opacity: .6;
  animation: pulse-hint 2s ease infinite;
}

@keyframes pulse-hint {
  0%, 100% { opacity: .4; }
  50% { opacity: .7; }
}

</style>
