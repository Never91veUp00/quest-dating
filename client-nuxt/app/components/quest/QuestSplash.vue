<template>
  <div class="splash" :class="decor && `splash--${decor}`">
    <div class="splash__inner">
      <header class="splash__head">
        <h1 class="splash__title">{{ questData.title }}</h1>
        <p v-if="questData.client_name" class="splash__for">
          для <b>{{ questData.client_name }}</b>
        </p>
      </header>

      <!-- Код доступа: до него сервер не отдаёт ни блоков, ни сводки -->
      <section v-if="requiresCode" class="splash__code" aria-labelledby="code-label">
        <label id="code-label" for="access-code" class="splash__h">Код доступа</label>
        <p class="splash__note">Его знает тот, кто подарил тебе этот квест.</p>
        <div class="splash__code-row">
          <input
            id="access-code"
            v-model="codeInput"
            type="text"
            class="splash__code-input"
            :class="{ shake: codeError }"
            :aria-invalid="!!codeError"
            aria-describedby="code-error"
            inputmode="text"
            maxlength="20"
            autocomplete="off"
            spellcheck="false"
            @keyup.enter="submitCode"
          />
        </div>
        <p v-if="codeError" id="code-error" class="splash__code-error" role="alert">{{ codeError }}</p>
        <button class="task__action splash__cta" :disabled="!codeInput.trim()" @click="submitCode">
          Открыть
        </button>
      </section>

      <template v-else>
        <!-- Факты с коробки -->
        <p class="splash__facts">
          <span><b>{{ totalBlocks }}</b> {{ plural(totalBlocks, 'участок', 'участка', 'участков') }}</span>
          <span><b>{{ totalTasks }}</b> {{ plural(totalTasks, 'клетка', 'клетки', 'клеток') }}</span>
          <span v-if="minutes">около <b>{{ minutes }}</b> мин</span>
        </p>
        <p v-if="difficultyLabel || placeLabel" class="splash__facts splash__facts--soft">
          <span v-if="difficultyLabel">{{ difficultyLabel }}</span>
          <span v-if="placeLabel">{{ placeLabel }}</span>
        </p>

        <!-- Текст автора -->
        <section v-if="questData.briefing" class="splash__brief" aria-labelledby="brief-h">
          <template v-if="decor === 'casefile'">
            <span class="splash__tape splash__tape--l" aria-hidden="true"></span>
            <span class="splash__tape splash__tape--r" aria-hidden="true"></span>
          </template>
          <h2 id="brief-h" class="splash__h splash__h--ink">Перед стартом</h2>
          <p class="splash__brief-text">{{ questData.briefing }}</p>
        </section>

        <!-- Видео-инструкция (или демо) и правило игры -->
        <div class="splash__how">
          <QuestHowTo :theme="theme" />
          <p class="splash__note">Клетки открываются по очереди. Подглядывать вперёд не получится — так задумано.</p>
        </div>

        <button class="task__action splash__cta splash__cta--sticky" @click="$emit('start')">
          {{ startLabel }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import QuestHowTo from './QuestHowTo.vue'

// Внутренняя сторона крышки: правила игры, текст автора, спид-демо, старт.
const props = defineProps({
  questData:    { type: Object, required: true },
  theme:        { type: Object, required: true },
  requiresCode: { type: Boolean, default: false },
  codeError:    { type: String, default: '' },
})

const emit = defineEmits(['start', 'submit-code'])

const codeInput = ref('')
const submitCode = () => { if (codeInput.value.trim()) emit('submit-code', codeInput.value) }

const decor = computed(() => props.theme.world?.decor ?? null)

const totalBlocks = computed(() => props.questData.blocks?.length || 0)
const totalTasks  = computed(() =>
  (props.questData.blocks || []).reduce((s, b) => s + (b.tasks?.length || 0), 0)
)
const minutes = computed(() => props.questData.duration_minutes || null)

const difficultyLabel = computed(() => ({
  easy:   'Лёгкая сложность',
  medium: 'Средняя сложность',
  hard:   'Высокая сложность',
  expert: 'Для знатоков',
}[props.questData.difficulty] || null))

const placeLabel = computed(() => ({
  indoor:    'проходится дома',
  park:      'проходится в парке',
  city:      'проходится в городе',
  universal: 'проходится где угодно',
}[props.questData.location_type] || null))

// Кнопка — глагол из темы, без эмодзи
const startLabel = computed(() =>
  (props.theme.copy?.startBtn || 'Начать').replace(/\p{Extended_Pictographic}/gu, '').trim()
)

const plural = (n, one, few, many) => {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few
  return many
}
</script>

<style scoped>
.splash {
  min-height: 100dvh;
  background: var(--field);
  color: var(--field-ink);
  padding: 40px 16px max(20px, env(safe-area-inset-bottom));
}
.splash__inner {
  max-width: 560px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 22px;
}

.splash__title {
  margin: 0;
  font-family: var(--font-d);
  font-weight: 400;
  font-size: clamp(1.7rem, 8vw, 2.8rem);
  line-height: 1.04;
  hyphens: auto;
  overflow-wrap: break-word;
  letter-spacing: -0.01em;
  text-wrap: balance;
}
.splash__for {
  margin: 10px 0 0;
  font-family: var(--font-b);
  font-size: 1.15rem;
  color: var(--field-ink-soft);
}
.splash__for b { color: var(--field-ink); }

.splash__facts {
  display: flex; flex-wrap: wrap; gap: 6px 18px;
  margin: 0;
  font-family: var(--font-b);
  font-size: 1.1rem;
  font-variant-numeric: tabular-nums;
}
.splash__facts b { font-family: var(--font-d); font-weight: 400; font-size: 1.3rem; }
.splash__facts--soft { margin-top: -14px; color: var(--field-ink-soft); font-size: 1rem; }

.splash__h {
  display: block;
  margin: 0 0 12px;
  font-family: var(--font-d);
  font-weight: 400;
  font-size: 1.3rem;
  color: var(--field-ink);
}
.splash__h--ink { color: var(--ink); }
.splash__note {
  margin: 10px 0 0;
  font-family: var(--font-b);
  font-size: 1rem;
  line-height: 1.45;
  color: var(--field-ink-soft);
}

/* ── Перед стартом: лист автора ───────────────────────────────── */
.splash__brief {
  position: relative;
  background: var(--paper);
  color: var(--ink);
  border-radius: 12px;
  padding: 20px 18px;
  box-shadow: 0 16px 24px -16px color-mix(in srgb, var(--rule) 80%, transparent);
}
.splash__brief-text {
  margin: 0;
  font-family: var(--font-b);
  font-size: 1.08rem;
  line-height: 1.55;
  white-space: pre-line;
}
.splash--casefile .splash__brief { border-radius: 3px; padding-top: 26px; }
.splash__tape {
  position: absolute; top: -10px;
  width: 72px; height: 22px;
  background: color-mix(in srgb, var(--paper-edge) 70%, transparent);
}
.splash__tape--l { left: 14px; transform: rotate(-6deg); }
.splash__tape--r { right: 14px; transform: rotate(5deg); }

/* ── Код доступа ──────────────────────────────────────────────── */
.splash__code { display: flex; flex-direction: column; }
.splash__code .splash__note { margin: 0 0 14px; }
.splash__code-input {
  width: 100%;
  min-height: 60px;
  padding: 0 16px;
  background: var(--paper);
  color: var(--ink);
  caret-color: var(--chip);
  border: 3px solid var(--rule);
  border-radius: 12px;
  font-family: var(--font-d);
  font-size: 1.4rem;
  letter-spacing: .2em;
  text-align: center;
  text-transform: uppercase;
  outline: none;
  box-sizing: border-box;
}
.splash__code-input:focus { box-shadow: 0 0 0 4px color-mix(in srgb, var(--chip) 45%, transparent); }
.splash__code-input.shake { animation: shake .4s ease; }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
.splash__code-error {
  margin: 10px 0 0;
  padding: 10px 14px;
  background: var(--paper);
  color: var(--wrong);
  border-radius: 10px;
  font-family: var(--font-b);
  font-size: 1rem;
}
.splash__cta { margin-top: 16px; }

/* Кнопка старта под большим пальцем */
.splash__cta--sticky {
  position: sticky;
  bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 5;
  margin-top: 4px;
  box-shadow: 0 0 0 8px var(--field);
}

@media (prefers-reduced-motion: reduce) {
  .splash__code-input.shake { animation: none; }
}
</style>
