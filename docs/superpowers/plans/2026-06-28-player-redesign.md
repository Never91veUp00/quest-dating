# Player Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Визуальный редизайн V1-плеера квестов — типографика, HUD, карточки, переходы, footer, финальный экран. Логика не трогается.

**Architecture:** Чистый CSS/template редизайн поверх существующей структуры. `@vueuse/motion` добавляется только для spring-анимации очков в `QuestFinish.vue`. Все остальные анимации — CSS. Два новых CSS-переменных (`--base-bg`, `--base-tone`) добавляются в систему тем.

**Tech Stack:** Vue 3, Nuxt 3, CSS (scoped + :deep()), `@vueuse/motion`

---

## Карта файлов

| Файл | Изменение |
|------|-----------|
| `client-nuxt/package.json` | Добавить `@vueuse/motion` |
| `client-nuxt/app/components/quest/themes.js` | Добавить `baseBg`, `baseTone`, `showTimer` в каждую тему; обновить `themeToCssVars` |
| `client-nuxt/app/pages/quest/[slug].vue` | HUD template (убрать step, добавить pts, conditional timer) + CSS overhaul |
| `client-nuxt/app/components/quest/QuestBlock.vue` | Glassmorphism-карточка + stagger-анимации |
| `client-nuxt/app/components/quest/QuestTask.vue` | Лейбл типа задачи в template + :deep() CSS для кнопок и инпутов |
| `client-nuxt/app/components/quest/QuestFinish.vue` | Spring-анимация очков через @vueuse/motion + усиленный confetti |

---

## Task 0: Установить @vueuse/motion

**Files:**
- Modify: `client-nuxt/package.json`

- [ ] **Установить пакет**

```bash
cd client-nuxt && npm install @vueuse/motion
```

- [ ] **Проверить что пакет появился в package.json**

```bash
grep "@vueuse/motion" client-nuxt/package.json
# Expected: "@vueuse/motion": "^X.X.X"
```

- [ ] **Добавить плагин в Nuxt**

Открыть `client-nuxt/nuxt.config.ts`, найти секцию `modules` и добавить:

```ts
modules: [
  // ... существующие модули ...
  '@vueuse/motion/nuxt',
],
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npx nuxi build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/package.json client-nuxt/package-lock.json client-nuxt/nuxt.config.ts
git commit -m "chore(player): установить @vueuse/motion"
```

---

## Task 1: themes.js — baseBg, baseTone, showTimer

**Files:**
- Modify: `client-nuxt/app/components/quest/themes.js`

- [ ] **Добавить новые поля в каждую тему**

В `client-nuxt/app/components/quest/themes.js` добавить три поля в каждый объект темы:

**detective:**
```js
baseBg:    '#0a0a0a',
baseTone:  'dark',
showTimer: false,
```

**romantic:**
```js
baseBg:    '#0f0608',
baseTone:  'dark',
showTimer: false,
```

**mystery:**
```js
baseBg:    '#060412',
baseTone:  'dark',
showTimer: false,
```

**treasure:**
```js
baseBg:    '#0d0a05',
baseTone:  'dark',
showTimer: false,
```

**proposal:**
```js
baseBg:    '#080508',
baseTone:  'dark',
showTimer: false,
```

**city:**
```js
baseBg:    '#060810',
baseTone:  'dark',
showTimer: false,
```

- [ ] **Обновить функцию themeToCssVars**

Найти в `themes.js` функцию `themeToCssVars` и заменить на:

```js
export const themeToCssVars = (theme) => ({
  '--accent':      theme.accent,
  '--accent-dim':  theme.accentDim,
  '--bg':          theme.bg,
  '--bg2':         theme.bg2,
  '--surf':        theme.surface,
  '--bord':        theme.border,
  '--text':        theme.text,
  '--dim':         theme.dim,
  '--font-d':      theme.fonts.display,
  '--font-b':      theme.fonts.body,
  '--base-bg':     theme.baseBg    ?? theme.bg,
  '--base-tone':   theme.baseTone  ?? 'dark',
})
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npx nuxi build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/components/quest/themes.js
git commit -m "feat(themes): добавить baseBg, baseTone, showTimer в систему тем"
```

---

## Task 2: [slug].vue — HUD template + CSS

**Files:**
- Modify: `client-nuxt/app/pages/quest/[slug].vue`

### Template-изменения

- [ ] **Удалить step-счётчик и добавить очки + conditional timer**

Найти в шаблоне блок `.qp-hud__row`:

```html
<div class="qp-hud__row">
  <span class="qp-hud__step">{{ blockIdx + 1 }}<span class="qp-hud__step-of">/{{ totalBlocks }}</span></span>
  <span class="qp-hud__name">{{ questData.title }}</span>
  <span class="qp-hud__time">{{ elapsedStr }}</span>
  <button class="qp-hud__menu-btn" @click.stop="showMenu = !showMenu" aria-label="Меню">⋮</button>
</div>
```

Заменить на:

```html
<div class="qp-hud__row">
  <span class="qp-hud__pts">
    {{ points }}<span class="qp-hud__pts-l"> {{ themeObj.copy.pointsLabel }}</span>
  </span>
  <span class="qp-hud__name">{{ questData.title }}</span>
  <span v-if="themeObj.showTimer" class="qp-hud__time">{{ elapsedStr }}</span>
  <button class="qp-hud__menu-btn" @click.stop="showMenu = !showMenu" aria-label="Меню">⋮</button>
</div>
```

### CSS-изменения

- [ ] **Обновить стили HUD** — найти строки с `.qp-hud__bar`, `.qp-hud__fill`, `.qp-hud__row`, `.qp-hud__step`, `.qp-hud__name`, `.qp-hud__time` и заменить:

```css
.qp-hud { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(12px); border-bottom: 1px solid var(--bord); }
.qp-hud__bar { height: 10px; background: rgba(255,255,255,.06); overflow: visible; }
.qp-hud__fill { height: 100%; background: var(--accent); box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 60%, transparent); transition: width .45s cubic-bezier(.4,0,.2,1); }
.qp-hud__row { display: flex; align-items: center; padding: 10px 16px; gap: 8px; }
.qp-hud__pts { font-family: var(--font-d); font-size: .85rem; font-weight: 700; color: var(--accent); white-space: nowrap; text-shadow: 0 0 8px color-mix(in srgb, var(--accent) 60%, transparent); }
.qp-hud__pts-l { font-size: .62rem; font-weight: 400; opacity: .7; }
.qp-hud__name { flex: 1; font-size: .8rem; color: var(--dim); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qp-hud__time { font-family: var(--font-d); font-size: .7rem; color: var(--dim); white-space: nowrap; }
.qp-hud__menu-btn { background: none; border: none; color: var(--dim); font-size: 1.2rem; cursor: pointer; padding: 4px 8px; line-height: 1; border-radius: 4px; transition: color .2s; }
.qp-hud__menu-btn:hover { color: var(--text); }
.qp-hud__dropdown { position: absolute; top: 100%; right: 12px; background: var(--surf); border: 1px solid var(--bord); border-radius: 8px; padding: 4px; min-width: 180px; box-shadow: 0 8px 24px rgba(0,0,0,.4); }
.qp-hud__dropdown-item { width: 100%; background: none; border: none; color: var(--text); font-size: .85rem; padding: 10px 14px; cursor: pointer; border-radius: 6px; text-align: left; transition: background .15s; }
.qp-hud__dropdown-item:hover { background: rgba(255,255,255,.06); }
```

Также удалить строки `.qp-hud__step` и `.qp-hud__step-of` если они ещё есть.

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npx nuxi build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/pages/quest/\[slug\].vue
git commit -m "feat(player): обновить HUD — progress bar с glow, очки в шапке, таймер по теме"
```

---

## Task 3: [slug].vue — slide transition + footer

**Files:**
- Modify: `client-nuxt/app/pages/quest/[slug].vue`

### Template-изменения

- [ ] **Удалить очки из footer**

Найти в шаблоне:

```html
<footer class="qp-foot">
  <div class="qp-foot__pts">
    <span class="qp-foot__pts-n">{{ points }}</span>
    <span class="qp-foot__pts-l">{{ themeObj.copy.pointsLabel }}</span>
  </div>
  <div class="qp-foot__dots">
```

Заменить на (убираем блок pts, оставляем только dots и центрируем):

```html
<footer class="qp-foot">
  <div class="qp-foot__dots">
```

### CSS-изменения

- [ ] **Обновить slide transition + footer** — найти строки `.slide-*`, `.qp-foot*` и заменить:

```css
.slide-enter-active, .slide-leave-active { transition: opacity .32s cubic-bezier(.4,0,.2,1), transform .32s cubic-bezier(.4,0,.2,1); }
.slide-enter-from { opacity: 0; transform: translateX(32px); }
.slide-leave-to   { opacity: 0; transform: translateX(-32px); }
.qp-foot { position: fixed; bottom: 0; left: 0; right: 0; background: color-mix(in srgb, var(--bg) 94%, transparent); backdrop-filter: blur(12px); border-top: 1px solid var(--bord); padding: 12px 16px; display: flex; align-items: center; justify-content: center; z-index: 100; }
.qp-foot__dots { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: center; }
.qp-foot__dot { width: 8px; height: 8px; border-radius: 999px; background: rgba(255,255,255,.15); transition: all .32s cubic-bezier(.4,0,.2,1); }
.qp-foot__dot.done { background: rgba(255,255,255,.45); }
.qp-foot__dot.cur { width: 24px; background: var(--accent); box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 60%, transparent); }
```

- [ ] **Обновить `.qp-player` padding** (footer стал тоньше без pts)

Найти строку:
```css
.qp-player { min-height: 100dvh; display: flex; flex-direction: column; padding: 68px 0 72px; }
```

Заменить на:
```css
.qp-player { min-height: 100dvh; display: flex; flex-direction: column; padding: 60px 0 60px; }
```

- [ ] **Обновить media query** — найти блок `@media (max-width: 480px)` и убрать строки про `.qp-foot__pts*`, обновить `.qp-foot`:

```css
@media (max-width: 480px) {
  .qp-hud__row { padding: 8px 12px; }
  .qp-main { padding: 16px 12px 0; }
  .qp-foot { padding: 10px 12px; }
  .qp-badge { right: 12px; min-width: 170px; padding: 10px 12px; }
  .qp-badge__ico { font-size: 1.2rem; }
  .qp-badge__title { font-size: .65rem; }
  .qp-badge__sub { font-size: .65rem; }
}
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npx nuxi build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/pages/quest/\[slug\].vue
git commit -m "feat(player): slide transition, footer-dots в пилюли, очки убраны из footer"
```

---

## Task 4: QuestBlock.vue — glassmorphism + stagger

**Files:**
- Modify: `client-nuxt/app/components/quest/QuestBlock.vue`

- [ ] **Прочитать текущий файл**

```bash
cat client-nuxt/app/components/quest/QuestBlock.vue
```

- [ ] **Добавить анимационные классы в template**

В `QuestBlock.vue` найти корневой `<div class="block">` и изменить:

```html
<div class="block">
  <div class="block__head">
    <div v-if="block.location" class="block__location">
```

На:

```html
<div class="block">
  <div class="block__head">
    <div v-if="block.location" class="block__location block__anim block__anim--1">
```

Также добавить классы к остальным элементам шапки:

```html
<div class="block__counter block__anim block__anim--2">
  {{ theme.copy.blockPrefix }} {{ index + 1 }} / {{ total }}
</div>
<h2 class="block__title block__anim block__anim--3">{{ block.title }}</h2>
<p v-if="block.description" class="block__desc block__anim block__anim--4">{{ block.description }}</p>
```

И секция задач:

```html
<div class="block__tasks block__anim block__anim--5">
```

- [ ] **Обновить/добавить CSS** в `<style scoped>` файла `QuestBlock.vue`

Найти или добавить стили (если уже есть `.block` — обновить, если нет — добавить):

```css
.block {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.block__head { display: flex; flex-direction: column; gap: 10px; }

.block__location {
  display: flex; align-items: center; gap: 6px;
  font-size: .78rem; color: var(--accent); font-weight: 600;
  letter-spacing: .04em;
}

.block__counter {
  font-size: .68rem; text-transform: uppercase;
  letter-spacing: .1em; color: var(--dim); font-weight: 600;
}

.block__title {
  font-size: clamp(1.25rem, 4.5vw, 1.55rem);
  font-weight: 800;
  line-height: 1.25;
  color: #fff;
  margin: 0;
  font-family: var(--font-d);
}

.block__desc {
  font-size: .95rem;
  line-height: 1.75;
  color: var(--dim);
  margin: 0;
}

.block__tasks { display: flex; flex-direction: column; gap: 10px; }

/* ── Stagger анимации ───────────────────────────────────── */
.block__anim {
  animation: block-fade-up 0.3s ease both;
}
.block__anim--1 { animation-delay: 0.00s; }
.block__anim--2 { animation-delay: 0.05s; }
.block__anim--3 { animation-delay: 0.10s; }
.block__anim--4 { animation-delay: 0.16s; }
.block__anim--5 { animation-delay: 0.22s; }

@keyframes block-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .block { padding: 16px; border-radius: 16px; }
  .block__title { font-size: clamp(1.1rem, 4vw, 1.35rem); }
}
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npx nuxi build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/components/quest/QuestBlock.vue
git commit -m "feat(player): QuestBlock — glassmorphism карточка + stagger анимации"
```

---

## Task 5: QuestTask.vue — лейбл типа + :deep() CSS

**Files:**
- Modify: `client-nuxt/app/components/quest/QuestTask.vue`

- [ ] **Добавить typeLabel computed и лейбл в template**

В `<script setup>` файла `QuestTask.vue` добавить после `typeIcon`:

```js
const typeLabel = computed(() => ({
  simple:        'Задание',
  riddle:        'Загадка',
  code_physical: 'Код',
  location:      'Локация',
  selfie:        'Селфи',
  photo:         'Фото',
  text_answer:   'Ответ',
  media:         'Медиа',
  qr:            'QR-код',
  mini_game:     'Мини-игра',
}[props.task.type] || 'Задание'))
```

- [ ] **Добавить лейбл в шаблон**

В `<template>` файла `QuestTask.vue` найти блок `.task__body` и добавить лейбл перед `.task__title`:

```html
<div class="task__body">
  <div class="task__type-label">
    <span>{{ typeIcon }}</span> {{ typeLabel }}
  </div>
  <div class="task__title">{{ task.title }}</div>
```

- [ ] **Обновить :deep() CSS в QuestTask.vue**

В `<style scoped>` найти секцию `:deep(.task__action)` и секции `:deep(.task__input)`, `:deep(.task__ok)` — заменить полностью:

```css
/* ── Action button ──────────────────────────────────────── */
:deep(.task__action) {
  background: transparent;
  border: 1px solid var(--accent);
  border-radius: 14px;
  padding: 0;
  min-height: 52px;
  color: var(--accent);
  font-family: var(--font-b);
  font-size: .95rem;
  font-weight: 700;
  cursor: pointer;
  text-shadow: 0 0 6px color-mix(in srgb, var(--accent) 50%, transparent);
  transition: all .2s ease;
  width: 100%;
  display: flex; align-items: center; justify-content: center;
}
:deep(.task__action:hover:not(:disabled)) {
  background: var(--accent);
  color: #000;
  text-shadow: none;
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 40%, transparent);
  transform: translateY(-1px);
}
:deep(.task__action:active:not(:disabled)) { transform: translateY(0); }
:deep(.task__action:disabled) { opacity: .35; cursor: default; }
:deep(.task__action--location) { border-style: dashed; }

/* ── Input ──────────────────────────────────────────────── */
:deep(.task__input) {
  flex: 1;
  background: var(--bg2);
  border: 1px solid var(--bord);
  border-radius: 12px;
  padding: 12px 16px;
  min-height: 48px;
  color: #fff;
  font-family: var(--font-b);
  font-size: .95rem;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
  box-sizing: border-box;
}
:deep(.task__input:focus) {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 18%, transparent);
}
:deep(.task__input--code) { font-family: var(--font-d); letter-spacing: .25em; text-align: center; font-size: 1rem; }
:deep(.task__input.shake) { animation: shake .4s ease; border-color: #f87171; }

/* ── OK button ──────────────────────────────────────────── */
:deep(.task__ok) {
  background: var(--accent);
  border: none;
  border-radius: 12px;
  color: #000;
  font-weight: 700;
  font-family: var(--font-d);
  font-size: .85rem;
  padding: 0 18px;
  min-height: 48px;
  cursor: pointer;
  box-shadow: 0 0 12px color-mix(in srgb, var(--accent) 30%, transparent);
  transition: all .18s ease;
  white-space: nowrap;
}
:deep(.task__ok:hover:not(:disabled)) { box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 50%, transparent); transform: translateY(-1px); }
:deep(.task__ok:disabled) { opacity: .35; cursor: default; }
```

- [ ] **Добавить CSS для лейбла типа**

В `<style scoped>` добавить:

```css
.task__type-label {
  font-size: .65rem;
  font-weight: 700;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: var(--accent);
  opacity: .75;
  display: flex;
  align-items: center;
  gap: 4px;
}
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npx nuxi build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/components/quest/QuestTask.vue
git commit -m "feat(player): QuestTask — лейбл типа задачи, крупные кнопки и инпуты"
```

---

## Task 6: QuestFinish.vue — spring-анимация + enhanced confetti

**Files:**
- Modify: `client-nuxt/app/components/quest/QuestFinish.vue`

- [ ] **Добавить @vueuse/motion к очкам в template**

В `QuestFinish.vue` найти блок `.finish__grid` и обернуть значение очков:

```html
<div class="finish__grid">
  <div class="finish__cell">
    <div
      v-motion
      :initial="{ scale: 0.4, opacity: 0 }"
      :enter="{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 18, delay: 300 } }"
      class="finish__n"
    >{{ points }}</div>
    <div class="finish__l">{{ theme.copy.pointsLabel }}</div>
  </div>
  <div class="finish__cell">
    <div
      v-motion
      :initial="{ scale: 0.4, opacity: 0 }"
      :enter="{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 18, delay: 450 } }"
      class="finish__n"
    >{{ completedCount }}</div>
    <div class="finish__l">заданий</div>
  </div>
  <div class="finish__cell">
    <div
      v-motion
      :initial="{ scale: 0.4, opacity: 0 }"
      :enter="{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 280, damping: 18, delay: 600 } }"
      class="finish__n"
    >{{ elapsed }}</div>
    <div class="finish__l">времени</div>
  </div>
</div>
```

- [ ] **Усилить кнопку "Поделиться"**

Найти `.finish__share` в template и заменить на:

```html
<button class="finish__share finish__share--primary" @click="$emit('share')">
  {{ theme.copy.shareBtn }}
</button>
```

- [ ] **Обновить CSS confetti и кнопок**

В `<style scoped>` заменить `.finish__particle`, `.finish__share`, `.finish__restart`:

```css
/* ── Enhanced confetti ──────────────────────────────────── */
.finish__particle {
  position: absolute; left: var(--x); top: var(--y);
  width: var(--s); height: var(--s); border-radius: 2px;
  opacity: 0;
  animation: confetti-fall var(--t) var(--d) ease-in both;
}
@keyframes confetti-fall {
  0%   { opacity: 0; transform: translateY(-30px) rotate(0deg); }
  15%  { opacity: 1; }
  85%  { opacity: .6; }
  100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
}

/* ── Share primary ──────────────────────────────────────── */
.finish__share--primary {
  background: var(--accent);
  border: none;
  border-radius: 14px;
  padding: 0 28px;
  min-height: 52px;
  color: #000;
  font-family: var(--font-b);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: all .2s ease;
  box-shadow: 0 0 24px color-mix(in srgb, var(--accent) 40%, transparent);
}
.finish__share--primary:hover {
  box-shadow: 0 0 36px color-mix(in srgb, var(--accent) 60%, transparent);
  transform: translateY(-2px);
}

/* ── Restart ghost ──────────────────────────────────────── */
.finish__restart {
  background: transparent;
  border: 1px dashed rgba(255,255,255,.2);
  border-radius: 12px;
  padding: 12px 20px;
  color: var(--dim);
  font-family: var(--font-b);
  font-size: .85rem;
  cursor: pointer;
  transition: all .25s;
  opacity: .7;
  width: 100%;
}
.finish__restart:hover { opacity: 1; border-color: var(--dim); color: var(--text); }

@media (max-width: 480px) {
  .finish { padding: 24px 16px; }
  .finish__trophy { font-size: 4rem; }
  .finish__share--primary { min-height: 56px; font-size: .95rem; }
}
```

- [ ] **Проверить сборку**

```bash
cd client-nuxt && npx nuxi build 2>&1 | tail -5
# Expected: ✨ Build complete!
```

- [ ] **Коммит**

```bash
git add client-nuxt/app/components/quest/QuestFinish.vue
git commit -m "feat(player): QuestFinish — spring-анимация статов, confetti, акцентная кнопка"
```

---

## Task 7: Push и PR

- [ ] **Запушить ветку**

```bash
git push -u origin <имя-ветки>
# имя ветки: feat/player-redesign-v1 (создать от production перед началом работ)
```

- [ ] **Создать PR**

Base: `production`  
Title: `feat(player): визуальный редизайн V1-плеера — типографика, HUD, карточки, анимации`

Body:
```
## Что сделано

Визуальный редизайн V1-плеера без изменения логики:

- **themes.js** — добавлены `baseBg`, `baseTone`, `showTimer` во все 6 тем
- **HUD** — прогресс-бар 10px с glow, очки перенесены в шапку, таймер по флагу темы, шаг-счётчик убран
- **Карточка блока** — glassmorphism (`blur(10px)`), stagger-анимации элементов
- **Задачи** — лейбл типа (`📍 Локация`), кнопки 52px (thumb-friendly), инпуты 48px с focus-ring
- **Переходы** — slide 320ms cubic-bezier, footer-точки растягиваются в пилюлю
- **Финал** — spring-анимация чисел (@vueuse/motion), confetti с вращением, кнопка «Поделиться» акцентная

## Что не изменилось

- Логика навигации, прогресса, таймера — не тронута
- Props/emits всех компонентов — без изменений
- Система тем — расширена, но обратно совместима (дефолты через `??`)

## Проверка

- [ ] `nuxi build` зелёный
- [ ] Открыть квест на мобильном (390px) — проверить HUD, слайд, точки
- [ ] Пройти до финала — confetti + spring-анимация очков
- [ ] Проверить тему `city` и `detective` — разные акцент-цвета, glow корректный
```

---

## Примечание: ветка

Перед началом работ создать ветку от production:

```bash
git checkout production && git pull origin production
git checkout -b feat/player-redesign-v1
git branch --show-current
# Expected: feat/player-redesign-v1
```
