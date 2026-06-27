# QuestTask Decomposition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Разбить `QuestTask.vue` (1040 строк, 10 типов задач) на 14 подкомпонентов, чтобы каждый тип задачи жил в изолированном файле.

**Architecture:** `QuestTask.vue` становится тонким orchestrator-ом: рендерит общую обёртку (dot, title, desc, done-state) и диспатчит активную задачу в `<component :is="taskComponent">`. Все 10 типов переезжают в `components/quest/tasks/`. Мини-игры дополнительно разбиваются на `MiniGameQuiz`, `MiniGamePairs`, `MiniGamePuzzle` под `tasks/mini-games/`.

**Tech Stack:** Vue 3 Composition API, Nuxt 3, `<script setup>`, scoped CSS, `useRuntimeConfig()` (для TaskMedia)

---

## Карта файлов

| Файл | Действие |
|------|----------|
| `client-nuxt/app/components/quest/QuestTask.vue` | Modify — стать orchestrator-ом |
| `client-nuxt/app/components/quest/tasks/TaskHint.vue` | Create |
| `client-nuxt/app/components/quest/tasks/TaskSimple.vue` | Create |
| `client-nuxt/app/components/quest/tasks/TaskRiddle.vue` | Create |
| `client-nuxt/app/components/quest/tasks/TaskCodePhysical.vue` | Create |
| `client-nuxt/app/components/quest/tasks/TaskLocation.vue` | Create |
| `client-nuxt/app/components/quest/tasks/TaskSelfie.vue` | Create |
| `client-nuxt/app/components/quest/tasks/TaskPhoto.vue` | Create |
| `client-nuxt/app/components/quest/tasks/TaskTextAnswer.vue` | Create |
| `client-nuxt/app/components/quest/tasks/TaskMedia.vue` | Create |
| `client-nuxt/app/components/quest/tasks/TaskQr.vue` | Create |
| `client-nuxt/app/components/quest/tasks/TaskMiniGame.vue` | Create |
| `client-nuxt/app/components/quest/tasks/mini-games/MiniGameQuiz.vue` | Create |
| `client-nuxt/app/components/quest/tasks/mini-games/MiniGamePairs.vue` | Create |
| `client-nuxt/app/components/quest/tasks/mini-games/MiniGamePuzzle.vue` | Create |

---

## Task 0: Ветка и директории

**Files:**
- Create dirs: `client-nuxt/app/components/quest/tasks/mini-games/`

- [ ] **Создать ветку от production**

```bash
git checkout production && git pull origin production
git checkout -b refactor/quest-task-decompose
git branch --show-current
# Expected: refactor/quest-task-decompose
```

- [ ] **Создать директории**

```bash
mkdir -p client-nuxt/app/components/quest/tasks/mini-games
```

- [ ] **Проверить что QuestTask.vue на месте**

```bash
wc -l client-nuxt/app/components/quest/QuestTask.vue
# Expected: 1041 (или около того)
```

---

## Task 1: TaskHint.vue

Переиспользуемый блок подсказки. Используется в `TaskSimple`, `TaskRiddle`, `TaskCodePhysical`.

**Files:**
- Create: `client-nuxt/app/components/quest/tasks/TaskHint.vue`

- [ ] **Создать файл**

```vue
<!-- client-nuxt/app/components/quest/tasks/TaskHint.vue -->
<template>
  <template v-if="hint">
    <button v-if="!shown" class="task__hint-btn" @click="show">
      {{ theme.copy.hintBtn }}
    </button>
    <div v-else class="task__hint">💡 {{ hint }}</div>
  </template>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  hint:  { type: String, default: '' },
  theme: { type: Object, required: true },
})
const emit = defineEmits(['hint'])

const shown = ref(false)
const show  = () => { shown.value = true; emit('hint') }
</script>
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npm run build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/components/quest/tasks/TaskHint.vue
git commit -m "feat(tasks): добавить TaskHint — переиспользуемый блок подсказки"
```

---

## Task 2: TaskSimple.vue

**Files:**
- Create: `client-nuxt/app/components/quest/tasks/TaskSimple.vue`

- [ ] **Создать файл**

```vue
<!-- client-nuxt/app/components/quest/tasks/TaskSimple.vue -->
<template>
  <div>
    <TaskHint :hint="task.hint" :theme="theme" @hint="$emit('hint', task)" />
    <button class="task__action" @click="$emit('complete', task)">
      {{ theme.copy.taskDone }} ✓
    </button>
  </div>
</template>

<script setup>
import TaskHint from './TaskHint.vue'

defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete', 'hint'])
</script>
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npm run build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/components/quest/tasks/TaskSimple.vue
git commit -m "feat(tasks): извлечь TaskSimple"
```

---

## Task 3: TaskLocation.vue

**Files:**
- Create: `client-nuxt/app/components/quest/tasks/TaskLocation.vue`

- [ ] **Создать файл**

```vue
<!-- client-nuxt/app/components/quest/tasks/TaskLocation.vue -->
<template>
  <div>
    <div v-if="task.location_desc" class="task__location-card">
      <div class="task__location-card__icon">📍</div>
      <div class="task__location-card__text">{{ task.location_desc }}</div>
    </div>
    <div v-if="task.location_hint" class="task__hint">💡 {{ task.location_hint }}</div>
    <button class="task__action task__action--location" @click="$emit('complete', task)">
      📍 Я здесь!
    </button>
  </div>
</template>

<script setup>
defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete'])
</script>

<style scoped>
.task__location-card {
  display: flex; align-items: flex-start; gap: 12px;
  background: color-mix(in srgb, var(--accent) 6%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 10px; padding: 14px;
}
.task__location-card__icon { font-size: 1.4rem; flex-shrink: 0; }
.task__location-card__text { font-size: .9rem; line-height: 1.55; color: var(--text); }
</style>
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npm run build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/components/quest/tasks/TaskLocation.vue
git commit -m "feat(tasks): извлечь TaskLocation"
```

---

## Task 4: TaskSelfie.vue и TaskPhoto.vue

Оба компонента используют FileReader для превью. Отличие: `capture="user"` у selfie, `capture="environment"` у photo.

**Files:**
- Create: `client-nuxt/app/components/quest/tasks/TaskSelfie.vue`
- Create: `client-nuxt/app/components/quest/tasks/TaskPhoto.vue`

- [ ] **Создать TaskSelfie.vue**

```vue
<!-- client-nuxt/app/components/quest/tasks/TaskSelfie.vue -->
<template>
  <div>
    <div class="task__selfie-condition">
      <span class="task__selfie-condition__emoji">{{ task.selfie_emoji || '🤳' }}</span>
      <span>{{ task.selfie_condition || 'Сделай селфи' }}</span>
    </div>
    <input
      ref="fileInputRef"
      type="file" accept="image/*" capture="user"
      style="display:none"
      @change="onFileChange"
    />
    <div v-if="!photoPreview" class="task__photo-zone task__photo-zone--selfie"
      @click="fileInputRef?.click()">
      <div style="font-size:2rem">🤳</div>
      <div>Нажми чтобы сфотографироваться</div>
    </div>
    <div v-else class="task__photo-preview">
      <img :src="photoPreview" alt="" />
      <button class="task__photo-rm" @click="photoPreview = null">✕</button>
    </div>
    <button v-if="photoPreview" class="task__action" @click="$emit('complete', task)">
      Готово →
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete'])

const fileInputRef = ref(null)
const photoPreview = ref(null)

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { photoPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.task__selfie-condition {
  display: flex; align-items: center; gap: 10px;
  background: color-mix(in srgb, var(--accent) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
  border-radius: 10px; padding: 12px 16px;
  font-size: .95rem; font-weight: 600; color: var(--text);
}
.task__selfie-condition__emoji { font-size: 1.5rem; flex-shrink: 0; }
.task__photo-zone {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: var(--bg2); border: 2px dashed var(--bord); border-radius: 10px;
  padding: 24px; cursor: pointer; transition: border-color .2s; text-align: center;
  font-size: .85rem; color: var(--dim);
}
.task__photo-zone:hover { border-color: var(--accent); }
.task__photo-zone--selfie { border-color: color-mix(in srgb, var(--accent) 40%, transparent); }
.task__photo-preview { position: relative; border-radius: 10px; overflow: hidden; }
.task__photo-preview img { width: 100%; display: block; max-height: 260px; object-fit: cover; }
.task__photo-rm {
  position: absolute; top: 8px; right: 8px;
  background: rgba(0,0,0,.7); border: none; border-radius: 50%;
  width: 26px; height: 26px; color: #fff; font-size: .7rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
@media (max-width: 480px) {
  .task__photo-zone { padding: 20px 16px; }
  .task__selfie-condition { padding: 10px 12px; font-size: .88rem; }
}
</style>
```

- [ ] **Создать TaskPhoto.vue**

```vue
<!-- client-nuxt/app/components/quest/tasks/TaskPhoto.vue -->
<template>
  <div>
    <p v-if="task.instruction" class="task__instruction">{{ task.instruction }}</p>
    <input
      ref="fileInputRef"
      type="file" accept="image/*" capture="environment"
      style="display:none"
      @change="onFileChange"
    />
    <div v-if="!photoPreview" class="task__photo-zone" @click="fileInputRef?.click()">
      <div style="font-size:1.6rem">📷</div>
      <div>{{ theme.copy.photoZone }}</div>
    </div>
    <div v-else class="task__photo-preview">
      <img :src="photoPreview" alt="" />
      <button class="task__photo-rm" @click="photoPreview = null">✕</button>
    </div>
    <button v-if="photoPreview" class="task__action" @click="$emit('complete', task)">
      Отправить →
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete'])

const fileInputRef = ref(null)
const photoPreview = ref(null)

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { photoPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}
</script>

<style scoped>
.task__photo-zone {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  background: var(--bg2); border: 2px dashed var(--bord); border-radius: 10px;
  padding: 24px; cursor: pointer; transition: border-color .2s; text-align: center;
  font-size: .85rem; color: var(--dim);
}
.task__photo-zone:hover { border-color: var(--accent); }
.task__photo-preview { position: relative; border-radius: 10px; overflow: hidden; }
.task__photo-preview img { width: 100%; display: block; max-height: 260px; object-fit: cover; }
.task__photo-rm {
  position: absolute; top: 8px; right: 8px;
  background: rgba(0,0,0,.7); border: none; border-radius: 50%;
  width: 26px; height: 26px; color: #fff; font-size: .7rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
@media (max-width: 480px) { .task__photo-zone { padding: 20px 16px; } }
</style>
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npm run build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/components/quest/tasks/TaskSelfie.vue \
        client-nuxt/app/components/quest/tasks/TaskPhoto.vue
git commit -m "feat(tasks): извлечь TaskSelfie и TaskPhoto"
```

---

## Task 5: TaskTextAnswer.vue

**Files:**
- Create: `client-nuxt/app/components/quest/tasks/TaskTextAnswer.vue`

- [ ] **Создать файл**

```vue
<!-- client-nuxt/app/components/quest/tasks/TaskTextAnswer.vue -->
<template>
  <div>
    <div v-if="task.question" class="task__question">{{ task.question }}</div>
    <textarea
      v-model="textAnswer"
      class="task__textarea"
      :placeholder="task.placeholder || 'Напиши свой ответ...'"
      rows="4"
      @input="$emit('answer-change', { task, value: textAnswer })"
    ></textarea>
    <button class="task__action" :disabled="!textAnswer.trim()" @click="submit">
      Записать ответ ✓
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
const emit = defineEmits(['complete', 'answer-change'])

const textAnswer = ref('')

const submit = () => {
  if (!textAnswer.value.trim()) return
  emit('complete', { ...props.task, saved_answer: textAnswer.value })
}
</script>

<style scoped>
.task__textarea {
  width: 100%; background: var(--bg2); border: 1px solid var(--bord);
  border-radius: 8px; padding: 11px 13px; color: #fff; font-family: var(--font-b);
  font-size: .9rem; line-height: 1.6; outline: none; resize: vertical;
  transition: border-color .2s; box-sizing: border-box;
}
.task__textarea:focus { border-color: var(--accent); }
@media (max-width: 480px) { .task__textarea { font-size: .88rem; } }
</style>
```

> ⚠️ В `submit` нужно использовать `props.task` — добавь `const props = defineProps(...)`:

```vue
<script setup>
import { ref } from 'vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
const emit = defineEmits(['complete', 'answer-change'])

const textAnswer = ref('')

const submit = () => {
  if (!textAnswer.value.trim()) return
  emit('complete', { ...props.task, saved_answer: textAnswer.value })
}
</script>
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npm run build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/components/quest/tasks/TaskTextAnswer.vue
git commit -m "feat(tasks): извлечь TaskTextAnswer"
```

---

## Task 6: TaskMedia.vue

**Files:**
- Create: `client-nuxt/app/components/quest/tasks/TaskMedia.vue`

- [ ] **Создать файл**

```vue
<!-- client-nuxt/app/components/quest/tasks/TaskMedia.vue -->
<template>
  <div>
    <div class="task__media">
      <template v-if="resolvedType === 'video'">
        <video
          :src="fullUrl(task.media_url)"
          controls playsinline
          class="task__media__video"
          preload="metadata"
        ></video>
      </template>
      <template v-else-if="resolvedType === 'audio'">
        <div class="task__media__audio-wrap">
          <div class="task__media__audio-icon">🎙️</div>
          <audio
            :src="fullUrl(task.media_url)"
            controls
            class="task__media__audio"
            preload="metadata"
          ></audio>
        </div>
      </template>
      <template v-else-if="task.media_url">
        <a :href="task.media_url" target="_blank"
          class="task__media__tg-link task__media__tg-link--video">
          <div class="task__media__tg-icon">🎬</div>
          <div class="task__media__tg-text">
            <div class="task__media__tg-title">Медиа послание</div>
            <div class="task__media__tg-sub">Нажми чтобы открыть</div>
          </div>
          <div class="task__media__tg-arrow">→</div>
        </a>
      </template>
    </div>
    <button class="task__action" @click="$emit('complete', task)">
      Посмотрел(а) ✓
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete'])

const API_BASE = useRuntimeConfig().public.apiBase.replace('/api', '')

const fullUrl = (url) => url?.startsWith('http') ? url : API_BASE + url

const resolvedType = computed(() => {
  const t = props.task
  if (t.media_type === 'video' || t.media_type === 'audio') return t.media_type
  const url = t.media_url || ''
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return 'video'
  if (/\.(mp3|ogg|wav|m4a)(\?|$)/i.test(url)) return 'audio'
  if (url.includes('/uploads/media/')) {
    const ext = url.split('.').pop().toLowerCase()
    return ['mp4', 'webm', 'mov'].includes(ext) ? 'video' : 'audio'
  }
  return null
})
</script>

<style scoped>
.task__media { display: flex; flex-direction: column; gap: 10px; }
.task__media__video { width: 100%; border-radius: 10px; max-height: 280px; }
.task__media__audio-wrap {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 20px; background: var(--bg2); border-radius: 10px;
}
.task__media__audio-icon { font-size: 2rem; }
.task__media__audio { width: 100%; }
.task__media__tg-link {
  display: flex; align-items: center; gap: 14px;
  background: var(--bg2); border: 1px solid var(--bord); border-radius: 12px;
  padding: 16px; text-decoration: none; color: var(--text); transition: border-color .2s;
}
.task__media__tg-link:hover { border-color: var(--accent); }
.task__media__tg-icon { font-size: 2rem; flex-shrink: 0; }
.task__media__tg-title { font-weight: 600; font-size: .95rem; color: #fff; }
.task__media__tg-sub { font-size: .78rem; color: var(--dim); margin-top: 2px; }
.task__media__tg-arrow { font-size: 1.2rem; color: var(--accent); margin-left: auto; }
@media (max-width: 480px) { .task__media__tg-link { padding: 14px; } }
</style>
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npm run build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/components/quest/tasks/TaskMedia.vue
git commit -m "feat(tasks): извлечь TaskMedia"
```

---

## Task 7: TaskRiddle.vue и TaskCodePhysical.vue и TaskQr.vue

Все три имеют схожую логику `submitAnswer` (нормализация строки + сравнение). Каждый получает свою копию — они самодостаточны.

**Files:**
- Create: `client-nuxt/app/components/quest/tasks/TaskRiddle.vue`
- Create: `client-nuxt/app/components/quest/tasks/TaskCodePhysical.vue`
- Create: `client-nuxt/app/components/quest/tasks/TaskQr.vue`

- [ ] **Создать TaskRiddle.vue**

```vue
<!-- client-nuxt/app/components/quest/tasks/TaskRiddle.vue -->
<template>
  <div>
    <div v-if="task.question" class="task__question">{{ task.question }}</div>
    <div class="task__row">
      <input
        v-model="answerInput"
        type="text"
        class="task__input"
        :class="{ shake: isWrong }"
        placeholder="Твой ответ..."
        autocomplete="off" spellcheck="false"
        @keyup.enter="submit"
      />
      <button class="task__ok" @click="submit" :disabled="!answerInput.trim()">OK</button>
    </div>
    <div v-if="isWrong" class="task__wrong">Не то, попробуй ещё раз 🤔</div>
    <TaskHint :hint="task.hint" :theme="theme" @hint="$emit('hint', task)" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TaskHint from './TaskHint.vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
const emit = defineEmits(['complete', 'hint'])

const answerInput = ref('')
const isWrong     = ref(false)

const submit = () => {
  const user    = answerInput.value.trim().toLowerCase().replace(/\s+/g, '')
  const correct = (props.task.answer || '').trim().toLowerCase().replace(/\s+/g, '')
  if (!correct || user === correct) {
    emit('complete', props.task)
  } else {
    isWrong.value = true
    setTimeout(() => { isWrong.value = false }, 700)
  }
}
</script>
```

- [ ] **Создать TaskCodePhysical.vue**

```vue
<!-- client-nuxt/app/components/quest/tasks/TaskCodePhysical.vue -->
<template>
  <div>
    <div v-if="task.instruction" class="task__instruction">🔍 {{ task.instruction }}</div>
    <div class="task__code-hint" v-if="task.code_hint">
      <span class="task__code-hint__label">Предметы:</span>
      {{ task.code_hint }}
    </div>
    <div class="task__row">
      <input
        v-model="answerInput"
        type="text"
        class="task__input task__input--code"
        :class="{ shake: isWrong }"
        :placeholder="task.answer ? task.answer.replace(/\S/g, '_').split('').join(' ') : '_ _ _ _'"
        autocomplete="off" spellcheck="false"
        maxlength="20"
        @keyup.enter="submit"
      />
      <button class="task__ok" @click="submit" :disabled="!answerInput.trim()">→</button>
    </div>
    <div v-if="isWrong" class="task__wrong">Неверный код, попробуй ещё</div>
    <TaskHint :hint="task.hint" :theme="theme" @hint="$emit('hint', task)" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TaskHint from './TaskHint.vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
const emit = defineEmits(['complete', 'hint'])

const answerInput = ref('')
const isWrong     = ref(false)

const submit = () => {
  const user    = answerInput.value.trim().toLowerCase().replace(/\s+/g, '')
  const correct = (props.task.answer || '').trim().toLowerCase().replace(/\s+/g, '')
  if (!correct || user === correct) {
    emit('complete', props.task)
  } else {
    isWrong.value = true
    setTimeout(() => { isWrong.value = false }, 700)
  }
}
</script>

<style scoped>
.task__code-hint {
  background: rgba(255,255,255,.03); border: 1px solid var(--bord);
  border-radius: 8px; padding: 10px 13px; font-size: .85rem; line-height: 1.5;
}
.task__code-hint__label {
  font-size: .7rem; color: var(--dim); text-transform: uppercase;
  letter-spacing: .08em; margin-bottom: 4px; display: block;
}
</style>
```

- [ ] **Создать TaskQr.vue**

```vue
<!-- client-nuxt/app/components/quest/tasks/TaskQr.vue -->
<template>
  <div>
    <div class="task__qr-instruction">
      <div class="task__qr-instruction__icon">◻️</div>
      <div>{{ task.qr_instruction || 'Найди предмет с QR-кодом и отсканируй его' }}</div>
    </div>
    <div class="task__qr-manual">
      <div class="task__qr-manual__label">Или введи код вручную:</div>
      <div class="task__row">
        <input
          v-model="answerInput"
          class="task__input task__input--code"
          :class="{ shake: isWrong }"
          placeholder="Код с QR-этикетки"
          autocomplete="off"
          @keyup.enter="submit"
        />
        <button class="task__ok" @click="submit" :disabled="!answerInput.trim()">→</button>
      </div>
      <div v-if="isWrong" class="task__wrong">Неверный код</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
const emit = defineEmits(['complete'])

const answerInput = ref('')
const isWrong     = ref(false)

const submit = () => {
  const user    = answerInput.value.trim().toLowerCase().replace(/\s+/g, '')
  const correct = (props.task.answer || '').trim().toLowerCase().replace(/\s+/g, '')
  if (!correct || user === correct) {
    emit('complete', props.task)
  } else {
    isWrong.value = true
    setTimeout(() => { isWrong.value = false }, 700)
  }
}
</script>

<style scoped>
.task__qr-instruction {
  display: flex; align-items: flex-start; gap: 12px;
  background: var(--bg2); border: 1px solid var(--bord);
  border-radius: 10px; padding: 14px; font-size: .9rem; line-height: 1.5; color: var(--text);
}
.task__qr-instruction__icon { font-size: 1.8rem; flex-shrink: 0; }
.task__qr-manual { display: flex; flex-direction: column; gap: 6px; }
.task__qr-manual__label { font-size: .72rem; color: var(--dim); }
</style>
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npm run build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/components/quest/tasks/TaskRiddle.vue \
        client-nuxt/app/components/quest/tasks/TaskCodePhysical.vue \
        client-nuxt/app/components/quest/tasks/TaskQr.vue
git commit -m "feat(tasks): извлечь TaskRiddle, TaskCodePhysical, TaskQr"
```

---

## Task 8: MiniGameQuiz.vue

**Files:**
- Create: `client-nuxt/app/components/quest/tasks/mini-games/MiniGameQuiz.vue`

- [ ] **Создать файл**

```vue
<!-- client-nuxt/app/components/quest/tasks/mini-games/MiniGameQuiz.vue -->
<template>
  <div>
    <div class="task__quiz-question">{{ task.game_question }}</div>
    <div class="task__quiz-options">
      <button
        v-for="(opt, oi) in task.game_options"
        :key="oi"
        class="task__quiz-opt"
        :class="{
          correct: answered && oi === task.game_correct,
          wrong:   answered && picked === oi && oi !== task.game_correct,
        }"
        :disabled="answered"
        @click="pick(oi)"
      >
        <span class="task__quiz-opt__letter">{{ 'АБВГ'[oi] }}</span>
        {{ opt }}
      </button>
    </div>
    <div v-if="answered && picked === task.game_correct"
      class="task__quiz-result task__quiz-result--right">
      Правильно! 🎉
    </div>
    <div v-if="answered && picked !== task.game_correct"
      class="task__quiz-result task__quiz-result--wrong">
      Не угадал(а), правильно: {{ task.game_options[task.game_correct] }}
    </div>
    <button v-if="answered" class="task__action" @click="$emit('complete', task)">
      Продолжаем →
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete'])

const answered = ref(false)
const picked   = ref(null)

const pick = (idx) => {
  if (answered.value) return
  picked.value   = idx
  answered.value = true
}
</script>

<style scoped>
.task__quiz-question {
  font-size: .95rem; font-weight: 600; color: var(--text); line-height: 1.5;
  border-left: 2px solid var(--accent); padding-left: 12px;
}
.task__quiz-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.task__quiz-opt {
  background: var(--bg2); border: 1px solid var(--bord); border-radius: 9px;
  padding: 11px 12px; color: var(--text); font-size: .85rem; cursor: pointer;
  text-align: left; display: flex; align-items: center; gap: 8px; transition: all .2s;
}
.task__quiz-opt:hover:not(:disabled) { border-color: var(--accent); }
.task__quiz-opt.correct { border-color: #3cffb4; background: rgba(60,255,180,.1); color: #3cffb4; }
.task__quiz-opt.wrong   { border-color: #f87171; background: rgba(248,113,113,.08); color: #f87171; }
.task__quiz-opt:disabled { cursor: default; }
.task__quiz-opt__letter {
  width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--bord);
  display: flex; align-items: center; justify-content: center;
  font-size: .7rem; font-weight: 700; flex-shrink: 0; font-family: var(--font-d);
}
.task__quiz-result {
  text-align: center; font-size: .9rem; padding: 8px; border-radius: 8px; font-weight: 600;
}
.task__quiz-result--right { color: #3cffb4; background: rgba(60,255,180,.08); }
.task__quiz-result--wrong { color: #f87171; background: rgba(248,113,113,.08); }
@media (max-width: 480px) {
  .task__quiz-options { grid-template-columns: 1fr; gap: 8px; }
  .task__quiz-opt { padding: 14px; min-height: 48px; }
}
</style>
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npm run build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/components/quest/tasks/mini-games/MiniGameQuiz.vue
git commit -m "feat(tasks): извлечь MiniGameQuiz"
```

---

## Task 9: MiniGamePairs.vue

**Files:**
- Create: `client-nuxt/app/components/quest/tasks/mini-games/MiniGamePairs.vue`

- [ ] **Создать файл**

```vue
<!-- client-nuxt/app/components/quest/tasks/mini-games/MiniGamePairs.vue -->
<template>
  <div>
    <!-- Текстовые пары -->
    <template v-if="task.pairs && task.pairs.length">
      <div class="task__text-pairs">
        <div class="task__text-pairs__cols">
          <div class="task__text-pairs__col">
            <button
              v-for="(pair, pi) in task.pairs" :key="'l'+pi"
              class="task__text-pairs__item"
              :class="{ selected: leftSelected === pi, matched: matchedLeft.includes(pi) }"
              :disabled="matchedLeft.includes(pi)"
              @click="selectLeft(pi)"
            >{{ pair.left }}</button>
          </div>
          <div class="task__text-pairs__col">
            <button
              v-for="(item, ri) in rightShuffled" :key="'r'+ri"
              class="task__text-pairs__item task__text-pairs__item--right"
              :class="{ selected: rightSelected === ri, matched: matchedRight.includes(ri) }"
              :disabled="matchedRight.includes(ri)"
              @click="selectRight(ri)"
            >{{ item.value }}</button>
          </div>
        </div>
      </div>
      <div v-if="wrongText" class="task__quiz-result task__quiz-result--wrong">
        Не совпадает, попробуй ещё раз
      </div>
      <div v-if="textComplete" class="task__quiz-result task__quiz-result--right">
        Все пары найдены! 🎉
      </div>
      <button v-if="textComplete" class="task__action" @click="$emit('complete', task)">
        Продолжаем →
      </button>
    </template>

    <!-- Фото-пары -->
    <template v-else>
      <div class="task__pairs">
        <button
          v-for="(card, ci) in photoCards" :key="ci"
          class="task__pairs__card"
          :class="{ flipped: photoFlipped.includes(ci), matched: photoMatched.includes(ci) }"
          :disabled="photoMatched.includes(ci) || photoFlipped.length === 2"
          @click="flipCard(ci)"
        >
          <div class="task__pairs__card__inner">
            <div class="task__pairs__card__back">?</div>
            <div class="task__pairs__card__front">
              <img v-if="isImage(card.value)" :src="card.value" class="task__pairs__card__img" />
              <span v-else>{{ card.value }}</span>
            </div>
          </div>
        </button>
      </div>
      <div v-if="photoComplete" class="task__quiz-result task__quiz-result--right">
        Все пары найдены! 🎉
      </div>
      <button v-if="photoComplete" class="task__action" @click="$emit('complete', task)">
        Продолжаем →
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete'])

// ── Текстовые пары ───────────────────────────────────────────────
const leftSelected  = ref(null)
const rightSelected = ref(null)
const matchedLeft   = ref([])
const matchedRight  = ref([])
const wrongText     = ref(false)

const rightShuffled = computed(() => {
  if (!props.task.pairs) return []
  return props.task.pairs
    .map((p, i) => ({ value: p.right, originalIdx: i }))
    .sort(() => Math.random() - 0.5)
})
const textComplete = computed(() =>
  props.task.pairs && matchedLeft.value.length === props.task.pairs.length
)

const selectLeft = (pi) => {
  wrongText.value = false
  leftSelected.value = pi
  if (rightSelected.value !== null) checkPair()
}
const selectRight = (ri) => {
  wrongText.value = false
  rightSelected.value = ri
  if (leftSelected.value !== null) checkPair()
}
const checkPair = () => {
  const li = leftSelected.value
  const ri = rightSelected.value
  const rightItem = rightShuffled.value[ri]
  if (rightItem.originalIdx === li) {
    matchedLeft.value  = [...matchedLeft.value, li]
    matchedRight.value = [...matchedRight.value, ri]
  } else {
    wrongText.value = true
    setTimeout(() => { wrongText.value = false }, 1000)
  }
  leftSelected.value  = null
  rightSelected.value = null
}

// ── Фото-пары ────────────────────────────────────────────────────
const photoCards   = ref([])
const photoFlipped = ref([])
const photoMatched = ref([])
let flipTimer = null

const photoComplete = computed(() =>
  photoCards.value.length > 0 && photoMatched.value.length === photoCards.value.length
)

onMounted(() => {
  const images = props.task.game_images || []
  if (images.length) {
    const cards = images.flatMap((img, i) => [
      { id: i,       value: img, pairId: i },
      { id: i + 100, value: img, pairId: i },
    ])
    photoCards.value = cards.sort(() => Math.random() - 0.5)
  }
})

onUnmounted(() => { if (flipTimer) clearTimeout(flipTimer) })

const isImage = (v) => v && (v.startsWith('data:image') || v.startsWith('http'))

const flipCard = (ci) => {
  if (photoFlipped.value.includes(ci) || photoFlipped.value.length === 2) return
  photoFlipped.value.push(ci)
  if (photoFlipped.value.length === 2) {
    const [a, b] = photoFlipped.value
    if (photoCards.value[a].pairId === photoCards.value[b].pairId) {
      photoMatched.value.push(a, b)
      photoFlipped.value = []
    } else {
      flipTimer = setTimeout(() => { photoFlipped.value = [] }, 900)
    }
  }
}
</script>

<style scoped>
.task__text-pairs { margin: 16px 0; }
.task__text-pairs__cols { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.task__text-pairs__col { display: flex; flex-direction: column; gap: 8px; }
.task__text-pairs__item {
  padding: 12px 14px; border-radius: 10px; font-size: 0.95rem; text-align: left;
  background: rgba(255,255,255,0.08); border: 2px solid transparent;
  color: inherit; cursor: pointer; transition: all 0.2s; line-height: 1.4;
}
.task__text-pairs__item:hover:not(:disabled) { border-color: var(--accent); }
.task__text-pairs__item.selected { border-color: var(--accent); background: rgba(102,126,234,0.15); }
.task__text-pairs__item.matched { border-color: #48bb78; background: rgba(72,187,120,0.15); opacity: 0.7; cursor: default; }
.task__text-pairs__item--right { text-align: center; }

.task__pairs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.task__pairs__card {
  aspect-ratio: 3/4; background: var(--bg2); border: 1px solid var(--bord);
  border-radius: 8px; cursor: pointer; perspective: 600px;
  transition: border-color .2s; overflow: hidden; padding: 0;
}
.task__pairs__card:hover:not(:disabled) { border-color: var(--accent); }
.task__pairs__card.matched { border-color: #3cffb4; opacity: .6; cursor: default; }
.task__pairs__card__inner {
  width: 100%; height: 100%; position: relative;
  transform-style: preserve-3d; transition: transform .35s;
  display: flex; align-items: center; justify-content: center;
}
.task__pairs__card.flipped .task__pairs__card__inner,
.task__pairs__card.matched .task__pairs__card__inner { transform: rotateY(180deg); }
.task__pairs__card__back,
.task__pairs__card__front {
  position: absolute; width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  backface-visibility: hidden; font-size: .85rem;
  padding: 4px; text-align: center; line-height: 1.3;
}
.task__pairs__card__back { color: var(--accent); font-size: 1.2rem; }
.task__pairs__card__front {
  transform: rotateY(180deg); color: var(--text);
  background: color-mix(in srgb, var(--accent) 8%, var(--bg2));
}
.task__pairs__card__img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; }
.task__quiz-result {
  text-align: center; font-size: .9rem; padding: 8px; border-radius: 8px; font-weight: 600;
}
.task__quiz-result--right { color: #3cffb4; background: rgba(60,255,180,.08); }
.task__quiz-result--wrong { color: #f87171; background: rgba(248,113,113,.08); }
@media (max-width: 480px) { .task__pairs { grid-template-columns: repeat(3, 1fr); gap: 6px; } }
</style>
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npm run build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/components/quest/tasks/mini-games/MiniGamePairs.vue
git commit -m "feat(tasks): извлечь MiniGamePairs (текстовые и фото пары)"
```

---

## Task 10: MiniGamePuzzle.vue

**Files:**
- Create: `client-nuxt/app/components/quest/tasks/mini-games/MiniGamePuzzle.vue`

- [ ] **Создать файл**

```vue
<!-- client-nuxt/app/components/quest/tasks/mini-games/MiniGamePuzzle.vue -->
<template>
  <div class="task__puzzle">
    <div v-if="!started" class="task__puzzle__intro">
      <div class="task__puzzle__intro-img-wrap">
        <img :src="task.puzzle_image" class="task__puzzle__intro-img" alt="Пазл" />
        <div class="task__puzzle__intro-overlay">Запомни картинку</div>
      </div>
      <div class="task__puzzle__intro-meta">
        {{ totalPieces }} частей · тапни чтобы выбрать кусок и поставить на место
      </div>
      <button class="task__action" @click="init">🧩 Начать пазл!</button>
    </div>

    <template v-else>
      <div class="task__puzzle__progress">
        <div class="task__puzzle__progress-bar">
          <div class="task__puzzle__progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <span class="task__puzzle__progress-txt">{{ placed }}/{{ totalPieces }} собрано</span>
      </div>

      <div class="task__puzzle__board" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
        <div
          v-for="slot in slots" :key="'s'+slot.i"
          class="task__puzzle__slot"
          :class="{
            filled:   slot.pieceIdx !== null,
            correct:  slot.pieceIdx === slot.i,
            selected: selectedSlot === slot.i,
            hint:     hintSlot === slot.i,
          }"
          :style="slotStyle(slot)"
          @click="onTap(slot.i)"
        ></div>
      </div>

      <div class="task__puzzle__tip">
        <template v-if="selectedSlot === null">👆 Тапни на кусок чтобы выбрать</template>
        <template v-else>👇 Тапни куда поставить выбранный кусок</template>
      </div>

      <button v-if="!complete" class="task__puzzle__skip" @click="$emit('skip-task', task)">
        Не получается? Пропустить
      </button>

      <div v-if="complete" class="task__quiz-result task__quiz-result--right">🎉 Пазл собран!</div>
      <button v-if="complete" class="task__action" @click="$emit('complete', task)">
        Продолжаем →
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete', 'skip-task'])

const started      = ref(false)
const slots        = ref([])
const selectedSlot = ref(null)
const hintSlot     = ref(null)

const cols = computed(() => {
  const p = props.task.puzzle_pieces || 30
  if (p === 42) return 6
  if (p === 35) return 7
  return 6
})
const rows = computed(() => {
  const p = props.task.puzzle_pieces || 30
  if (p === 42) return 7
  if (p === 35) return 5
  return 5
})
const totalPieces = computed(() => cols.value * rows.value)
const placed      = computed(() => slots.value.filter(s => s.pieceIdx === s.i).length)
const progress    = computed(() =>
  totalPieces.value ? Math.round(placed.value / totalPieces.value * 100) : 0
)
const complete = computed(() =>
  totalPieces.value > 0 && placed.value === totalPieces.value
)

const slotStyle = (slot) => {
  if (slot.pieceIdx === null || !props.task.puzzle_image) return {}
  const c    = slot.pieceIdx % cols.value
  const r    = Math.floor(slot.pieceIdx / cols.value)
  const posX = cols.value > 1 ? (c / (cols.value - 1)) * 100 : 0
  const posY = rows.value > 1 ? (r / (rows.value - 1)) * 100 : 0
  return {
    backgroundImage:    `url(${props.task.puzzle_image})`,
    backgroundSize:     `${cols.value * 100}% ${rows.value * 100}%`,
    backgroundPosition: `${posX}% ${posY}%`,
  }
}

const init = () => {
  const total    = totalPieces.value
  const shuffled = Array.from({ length: total }, (_, i) => i)
  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  slots.value        = shuffled.map((pieceIdx, i) => ({ i, pieceIdx }))
  selectedSlot.value = null
  started.value      = true
}

const onTap = (slotIdx) => {
  if (complete.value) return
  if (selectedSlot.value === null) { selectedSlot.value = slotIdx; return }
  if (selectedSlot.value === slotIdx) { selectedSlot.value = null; return }

  const a = slots.value[selectedSlot.value]
  const b = slots.value[slotIdx]
  const tmp = a.pieceIdx
  a.pieceIdx = b.pieceIdx
  b.pieceIdx = tmp

  if (a.pieceIdx === a.i && b.pieceIdx === b.i && 'vibrate' in navigator) {
    navigator.vibrate(40)
  }
  selectedSlot.value = null
}
</script>

<style scoped>
.task__puzzle { display: flex; flex-direction: column; gap: 12px; }
.task__puzzle__intro { display: flex; flex-direction: column; gap: 10px; }
.task__puzzle__intro-img-wrap { position: relative; border-radius: 10px; overflow: hidden; }
.task__puzzle__intro-img { width: 100%; display: block; max-height: 220px; object-fit: cover; }
.task__puzzle__intro-overlay {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,.35); color: #fff; font-size: .9rem; font-weight: 700;
  letter-spacing: .05em; pointer-events: none;
}
.task__puzzle__intro-meta { font-size: .8rem; color: var(--dim); text-align: center; }
.task__puzzle__progress { display: flex; align-items: center; gap: 10px; }
.task__puzzle__progress-bar {
  flex: 1; height: 6px; background: rgba(255,255,255,.08); border-radius: 3px; overflow: hidden;
}
.task__puzzle__progress-fill {
  height: 100%; background: var(--accent); border-radius: 3px;
  transition: width .3s ease; box-shadow: 0 0 6px color-mix(in srgb, var(--accent) 50%, transparent);
}
.task__puzzle__progress-txt { font-size: .72rem; color: var(--dim); white-space: nowrap; font-family: var(--font-d); }
.task__puzzle__board {
  display: grid; gap: 2px; width: 100%; border-radius: 8px; overflow: hidden;
  border: 1px solid var(--bord); background: var(--bg2); touch-action: manipulation;
}
.task__puzzle__slot {
  aspect-ratio: 1; cursor: pointer; border-radius: 2px;
  transition: transform .12s, box-shadow .12s, outline .12s;
  background-color: color-mix(in srgb, var(--bg2) 60%, transparent);
  background-repeat: no-repeat; outline: 2px solid transparent;
  user-select: none; -webkit-user-select: none;
}
.task__puzzle__slot:active { transform: scale(.94); }
.task__puzzle__slot:not([style*="url"]) {
  background-color: rgba(255,255,255,.04); border: 1px dashed rgba(255,255,255,.08);
}
.task__puzzle__slot.selected {
  outline: 3px solid var(--accent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 50%, transparent);
  transform: scale(1.06); z-index: 2;
}
.task__puzzle__slot.correct { outline: 2px solid #3cffb4; cursor: default; }
.task__puzzle__slot.hint { animation: puzzle-hint .35s ease 2; }
@keyframes puzzle-hint {
  0%,100% { outline-color: transparent; }
  50%      { outline: 3px solid #f87171; }
}
.task__puzzle__tip { text-align: center; font-size: .78rem; color: var(--dim); padding: 4px; min-height: 1.4em; }
.task__puzzle__skip {
  display: block; margin: 8px auto 0; background: none; border: none;
  color: var(--dim); font-size: .68rem; cursor: pointer;
  opacity: .4; transition: opacity .3s; padding: 6px 12px;
  text-decoration: underline; text-underline-offset: 3px;
}
.task__puzzle__skip:hover { opacity: .7; }
.task__quiz-result {
  text-align: center; font-size: .9rem; padding: 8px; border-radius: 8px; font-weight: 600;
}
.task__quiz-result--right { color: #3cffb4; background: rgba(60,255,180,.08); }
@media (max-width: 480px) { .task__puzzle__board { gap: 1px; } }
</style>
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npm run build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/components/quest/tasks/mini-games/MiniGamePuzzle.vue
git commit -m "feat(tasks): извлечь MiniGamePuzzle"
```

---

## Task 11: TaskMiniGame.vue

**Files:**
- Create: `client-nuxt/app/components/quest/tasks/TaskMiniGame.vue`

- [ ] **Создать файл**

```vue
<!-- client-nuxt/app/components/quest/tasks/TaskMiniGame.vue -->
<template>
  <component
    :is="gameComponent"
    v-if="gameComponent"
    :task="task"
    :theme="theme"
    @complete="$emit('complete', $event)"
    @skip-task="$emit('skip-task', $event)"
  />
  <div v-else class="task__wrong">Неизвестный тип игры: {{ task.game_type }}</div>
</template>

<script setup>
import { computed } from 'vue'
import MiniGameQuiz   from './mini-games/MiniGameQuiz.vue'
import MiniGamePairs  from './mini-games/MiniGamePairs.vue'
import MiniGamePuzzle from './mini-games/MiniGamePuzzle.vue'

const props = defineProps({
  task:  { type: Object, required: true },
  theme: { type: Object, required: true },
})
defineEmits(['complete', 'skip-task'])

const GAME_MAP = { quiz: MiniGameQuiz, pairs: MiniGamePairs, puzzle: MiniGamePuzzle }
const gameComponent = computed(() => GAME_MAP[props.task.game_type] || null)
</script>
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npm run build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/components/quest/tasks/TaskMiniGame.vue
git commit -m "feat(tasks): извлечь TaskMiniGame — orchestrator мини-игр"
```

---

## Task 12: Рефакторинг QuestTask.vue → тонкий orchestrator

Это финальный и самый ответственный шаг. Заменяем содержимое `QuestTask.vue` на orchestrator, который рендерит общую обёртку и диспатчит в подкомпонент.

**Files:**
- Modify: `client-nuxt/app/components/quest/QuestTask.vue`

- [ ] **Заменить содержимое QuestTask.vue**

```vue
<!-- client-nuxt/app/components/quest/QuestTask.vue -->
<template>
  <div
    class="task"
    :class="{
      'task--done':   isDone,
      'task--active': isActive,
      'task--locked': isLocked,
      [`task--${task.type}`]: true
    }"
    :style="{ '--i': index }"
  >
    <!-- Маркер слева -->
    <div class="task__dot">
      <span v-if="isDone">✓</span>
      <span v-else-if="isLocked">🔒</span>
      <span v-else>{{ typeIcon }}</span>
    </div>

    <div class="task__body">
      <div class="task__title">{{ task.title }}</div>
      <p v-if="task.description" class="task__desc">{{ task.description }}</p>

      <!-- Выполнено -->
      <div v-if="isDone" class="task__done">
        <span>{{ theme.copy.taskDone }}</span>
        <span v-if="task.points" class="task__pts">
          +{{ task.points }} {{ theme.copy.pointsLabel }}
        </span>
      </div>

      <!-- Активная задача → подкомпонент -->
      <component
        v-else-if="isActive && taskComponent"
        :is="taskComponent"
        :task="task"
        :theme="theme"
        @complete="$emit('complete', $event)"
        @hint="$emit('hint', $event)"
        @answer-change="$emit('answer-change', $event)"
        @skip-task="$emit('skip-task', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TaskSimple       from './tasks/TaskSimple.vue'
import TaskRiddle       from './tasks/TaskRiddle.vue'
import TaskCodePhysical from './tasks/TaskCodePhysical.vue'
import TaskLocation     from './tasks/TaskLocation.vue'
import TaskSelfie       from './tasks/TaskSelfie.vue'
import TaskPhoto        from './tasks/TaskPhoto.vue'
import TaskTextAnswer   from './tasks/TaskTextAnswer.vue'
import TaskMedia        from './tasks/TaskMedia.vue'
import TaskQr           from './tasks/TaskQr.vue'
import TaskMiniGame     from './tasks/TaskMiniGame.vue'

const props = defineProps({
  task:     { type: Object,  required: true },
  theme:    { type: Object,  required: true },
  index:    { type: Number,  default: 0 },
  isDone:   { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
  isLocked: { type: Boolean, default: false },
})
defineEmits(['complete', 'hint', 'answer-change', 'skip-task'])

const TYPE_MAP = {
  simple:        TaskSimple,
  riddle:        TaskRiddle,
  code_physical: TaskCodePhysical,
  location:      TaskLocation,
  selfie:        TaskSelfie,
  photo:         TaskPhoto,
  text_answer:   TaskTextAnswer,
  media:         TaskMedia,
  qr:            TaskQr,
  mini_game:     TaskMiniGame,
}

const taskComponent = computed(() => TYPE_MAP[props.task.type] || null)

const typeIcon = computed(() => ({
  simple:        '✓',
  riddle:        '?',
  code_physical: '🔢',
  location:      '📍',
  selfie:        '🤳',
  photo:         '📷',
  text_answer:   '✍️',
  media:         '🎬',
  qr:            '◻️',
  mini_game:     '🎮',
}[props.task.type] || props.index + 1))
</script>

<style scoped>
/* ── Task ─────────────────────────────────────────────────────── */
.task {
  background: var(--surf);
  border: 1px solid var(--bord);
  border-left: 3px solid var(--bord);
  border-radius: 12px;
  padding: 16px;
  display: flex; gap: 14px;
  animation: task-in .25s ease both;
  animation-delay: calc(var(--i, 0) * 0.06s);
  transition: opacity .2s, border-color .2s;
}
@keyframes task-in { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }

.task--active  { border-left-color: var(--accent); }
.task--active .task__dot { border-color: var(--accent); color: var(--accent); }
.task--done    { opacity: .55; border-left-color: #3cffb4; }
.task--done .task__dot { border-color: #3cffb4; color: #3cffb4; background: rgba(60,255,180,.06); }
.task--locked  { opacity: .3; pointer-events: none; }

/* ── Dot ──────────────────────────────────────────────────────── */
.task__dot {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
  border: 1px solid var(--bord);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; color: var(--dim); margin-top: 1px;
}

/* ── Body ─────────────────────────────────────────────────────── */
.task__body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; }
.task__title { font-size: .95rem; font-weight: 700; color: #fff; }
.task__desc { font-size: .88rem; color: var(--dim); line-height: 1.6; margin: 0; }
.task__instruction { font-size: .85rem; color: var(--text); font-style: italic; margin: 0; }

.task__done {
  display: flex; align-items: center; justify-content: space-between;
  font-size: .82rem; color: #3cffb4; padding: 6px 0;
}
.task__pts { font-family: var(--font-d); font-size: .72rem; opacity: .8; }

/* ── Shared UI (используется подкомпонентами через :deep или глобально) ── */
/* Эти стили применяются к элементам ВНУТРИ подкомпонентов через незаскопленные CSS vars */

/* ── Row / Input ──────────────────────────────────────────────── */
:deep(.task__row) { display: flex; gap: 8px; }
:deep(.task__question) {
  font-size: .88rem; font-style: italic; color: var(--text);
  background: rgba(255,255,255,.03);
  border-left: 2px solid var(--accent);
  padding: 9px 13px; border-radius: 0 8px 8px 0; line-height: 1.5;
}
:deep(.task__input) {
  flex: 1; background: var(--bg2); border: 1px solid var(--bord);
  border-radius: 8px; padding: 10px 13px; color: #fff;
  font-family: var(--font-b); font-size: .9rem; outline: none; transition: border-color .2s;
}
:deep(.task__input:focus) { border-color: var(--accent); }
:deep(.task__input--code) { font-family: var(--font-d); letter-spacing: .2em; text-align: center; font-size: 1rem; }
:deep(.task__input.shake) { animation: shake .4s ease; border-color: #f87171; }
@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }

:deep(.task__ok) {
  background: var(--accent); border: none; border-radius: 8px;
  color: #000; font-weight: 700; font-family: var(--font-d); font-size: .8rem;
  padding: 0 14px; cursor: pointer;
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 30%, transparent);
  transition: all .2s; white-space: nowrap;
}
:deep(.task__ok:disabled) { opacity: .4; cursor: default; }
:deep(.task__wrong) { font-size: .78rem; color: #f87171; }

/* ── Hint ─────────────────────────────────────────────────────── */
:deep(.task__hint-btn) {
  background: transparent; border: 1px dashed rgba(255,200,0,.3);
  border-radius: 8px; padding: 7px 12px; color: rgba(255,200,0,.7);
  font-size: .78rem; cursor: pointer; text-align: left; transition: all .2s; width: 100%;
}
:deep(.task__hint-btn:hover) { border-color: rgba(255,200,0,.6); color: #ffc800; }
:deep(.task__hint) {
  background: rgba(255,200,0,.05); border: 1px solid rgba(255,200,0,.2);
  border-radius: 8px; padding: 9px 13px; font-size: .83rem;
  color: rgba(255,200,0,.9); line-height: 1.5;
}

/* ── Action button ────────────────────────────────────────────── */
:deep(.task__action) {
  background: transparent; border: 1px solid var(--accent); border-radius: 9px;
  padding: 11px; color: var(--accent); font-family: var(--font-b);
  font-size: .9rem; font-weight: 600; cursor: pointer;
  text-shadow: 0 0 6px var(--accent); transition: all .25s; width: 100%;
}
:deep(.task__action:hover:not(:disabled)) { background: var(--accent); color: #000; text-shadow: none; }
:deep(.task__action:disabled) { opacity: .4; cursor: default; }
:deep(.task__action--location) { border-style: dashed; }

/* ── Mobile ───────────────────────────────────────────────────── */
@media (max-width: 480px) {
  .task { padding: 14px 12px; gap: 10px; }
  .task__dot { width: 24px; height: 24px; font-size: .65rem; }
  .task__title { font-size: .9rem; }
  .task__desc { font-size: .82rem; }
  :deep(.task__action) { padding: 13px; font-size: .88rem; min-height: 48px; }
  :deep(.task__ok) { min-height: 48px; padding: 0 16px; }
  :deep(.task__input) { padding: 12px; font-size: .88rem; min-height: 48px; }
  :deep(.task__hint-btn) { padding: 10px 12px; }
}
</style>
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npm run build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Проверить отсутствие старых компонентов в QuestTask.vue**

```bash
grep -c "v-else-if=\"task.type" client-nuxt/app/components/quest/QuestTask.vue
# Expected: 0
```

- [ ] **Финальный коммит**

```bash
git add client-nuxt/app/components/quest/QuestTask.vue
git commit -m "refactor(tasks): QuestTask.vue → тонкий orchestrator, 10 типов в подкомпонентах"
```

---

## Task 13: Push и PR

- [ ] **Пуш**

```bash
git push -u origin refactor/quest-task-decompose
```

- [ ] **Создать PR через GitHub UI**

Base: `production`  
Title: `refactor(tasks): декомпозиция QuestTask.vue — 10 типов задач в подкомпоненты`

Body:
```
## Что сделано

QuestTask.vue (1040 строк) разбит на 14 изолированных компонентов:

**`components/quest/tasks/`**
- `TaskHint.vue` — переиспользуемая подсказка
- `TaskSimple.vue`, `TaskRiddle.vue`, `TaskCodePhysical.vue`
- `TaskLocation.vue`, `TaskSelfie.vue`, `TaskPhoto.vue`
- `TaskTextAnswer.vue`, `TaskMedia.vue`, `TaskQr.vue`
- `TaskMiniGame.vue` — orchestrator мини-игр

**`tasks/mini-games/`**
- `MiniGameQuiz.vue`, `MiniGamePairs.vue`, `MiniGamePuzzle.vue`

**`QuestTask.vue`** — тонкий orchestrator (~80 строк):
общая обёртка + `<component :is="taskComponent">` по TYPE_MAP.

## Что не изменилось

- Props/emits интерфейс `QuestTask.vue` — без изменений
- `QuestBlock.vue` — не тронут
- Поведение всех типов задач — идентично оригиналу

## Проверка

- [ ] `nuxi build` зелёный
- [ ] Ручной тест: пройти квест (quiz + pairs обязательно, они в реальных данных)
```

- [ ] **Проверить CI зелёный** (серверные тесты — клиентских в CI нет)

---

## Дополнительно после merge

- Обновить `docs/upgrade-plan.md`: задача 3.1 (аудит компонентов) закрыта.
