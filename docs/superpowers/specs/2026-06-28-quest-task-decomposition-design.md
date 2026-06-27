# Дизайн: декомпозиция QuestTask.vue

**Дата:** 2026-06-28  
**Статус:** утверждён  
**Контекст:** Фаза 3, подготовка к редизайну плеера. `QuestTask.vue` (1040 строк) содержит 10 типов задач и 3 мини-игры в одном файле — всё состояние вперемешку. Разбиваем на подкомпоненты (Вариант A: каждый тип → свой файл).

---

## Архитектура

### До
```
QuestTask.vue (1040 строк)
  └── 10 типов задач inline + 3 мини-игры inline
```

### После
```
QuestTask.vue (~80 строк) — тонкий orchestrator
  └── components/quest/tasks/
        TaskSimple.vue
        TaskRiddle.vue
        TaskCodePhysical.vue
        TaskLocation.vue
        TaskSelfie.vue
        TaskPhoto.vue
        TaskTextAnswer.vue
        TaskMedia.vue
        TaskQr.vue
        TaskMiniGame.vue          ← orchestrator мини-игр
        TaskHint.vue              ← переиспользуемый блок подсказки
        mini-games/
          MiniGameQuiz.vue
          MiniGamePairs.vue
          MiniGamePuzzle.vue      ← оставляем (реализован, пригодится)
```

Итого: **14 файлов** вместо 1.

---

## QuestTask.vue (orchestrator)

**Props:** `task`, `theme`, `index`, `isDone`, `isActive`, `isLocked` — без изменений.  
**Emits:** `complete`, `hint`, `answer-change`, `skip-task` — без изменений.

Шаблон:
- Обёртка `.task` с CSS-классами (done/active/locked) — остаётся здесь
- Маркер `.task__dot` — остаётся здесь
- `.task__title`, `.task__desc` — остаётся здесь
- Блок "выполнено" (`isDone`) — остаётся здесь
- При `isActive`: `<component :is="taskComponent" v-bind="taskProps" v-on="taskEmits" />`

Computed `taskComponent` — маппинг `task.type → компонент`:
```js
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
```

Базовые стили `.task`, `.task__dot`, `.task__body`, `.task__title`, `.task__desc`, `.task__done`, `.task__action`, `.task__input`, `.task__ok`, `.task__wrong`, `.task__row`, `.task__question` — **остаются в QuestTask.vue**, т.к. используются несколькими типами.

---

## Подкомпоненты

### Общий контракт
Каждый подкомпонент получает:
- `task: Object` — объект задачи
- `theme: Object` — тема (copy, accent и т.д.)

Каждый эмитирует:
- `complete(task)` — задача выполнена
- `hint(task)` — показана подсказка (для счётчика)
- `skip-task(task)` — (только MiniGamePuzzle)

### TaskHint.vue
Переиспользуемый блок подсказки. Используется в: `TaskSimple`, `TaskRiddle`, `TaskCodePhysical`.

Props: `hint: String`, `theme: Object`  
Emits: `hint` (при первом показе)  
Внутренний state: `shown: ref(false)`

### TaskSimple.vue
State: `hintShown` (через TaskHint)  
UI: кнопка подсказки + кнопка «выполнено»

### TaskRiddle.vue
State: `answerInput`, `isWrong`, `hintShown`  
UI: вопрос + input + OK + ошибка + TaskHint  
Logic: `submitAnswer` — нормализация + сравнение

### TaskCodePhysical.vue
State: `answerInput`, `isWrong`  
UI: инструкция + code_hint + input с маской + TaskHint  
Logic: та же `submitAnswer`

### TaskLocation.vue
State: нет  
UI: карточка локации + кнопка «Я здесь!»

### TaskSelfie.vue / TaskPhoto.vue
Практически идентичны, отличие только в `capture="user"` vs `capture="environment"` и иконке.  
State: `photoPreview`, `fileInputRef`  
Logic: `onFileChange` (FileReader → base64 preview)

### TaskTextAnswer.vue
State: `textAnswer`  
UI: вопрос + textarea + кнопка записать  
Emits дополнительно: `answer-change`

### TaskMedia.vue
State: нет  
Logic: `resolvedMediaType`, `mediaFullUrl` (useRuntimeConfig)  
UI: video / audio / fallback-ссылка + кнопка «Посмотрел(а)»

### TaskQr.vue
State: `answerInput`, `isWrong`  
UI: инструкция + ручной ввод кода  
Logic: та же `submitAnswer`

### TaskMiniGame.vue
Orchestrator по `task.game_type`:
```
quiz   → MiniGameQuiz
pairs  → MiniGamePairs
puzzle → MiniGamePuzzle
```

### MiniGameQuiz.vue
State: `quizAnswered`, `quizPicked`  
UI: вопрос + 4 варианта (АБВГ) + результат + «Продолжаем»

### MiniGamePairs.vue
Обрабатывает оба варианта: текстовые пары (`task.pairs`) и фото-пары (`task.game_images`).  
State: текстовые — `leftSelected`, `rightSelected`, `matched`, `wrong`, `rightShuffled`; фото — `cards`, `flipped`, `matched`, таймер.  
`onMounted`: инициализация фото-карточек

### MiniGamePuzzle.vue
State: `puzzleStarted`, `puzzleSlots`, `selectedSlot`, `hintSlot`  
Computed: `puzzleCols`, `puzzleRows`, `puzzleTotalPieces`, `puzzlePlaced`, `puzzleProgress`, `puzzleComplete`  
Logic: `initPuzzle`, `onSlotTap`, `slotStyle`  
Emits дополнительно: `skip-task`

---

## Стили

- **Общие** (`.task`, `.task__dot`, `.task__body`, `.task__title`, `.task__desc`, `.task__done`, `.task__action`, `.task__input`, `.task__ok`, `.task__wrong`, `.task__row`, `.task__question`, `.task__hint`, `.task__hint-btn`, `@media mobile`) → остаются в `QuestTask.vue`
- **Специфичные для типа** (`.task__selfie-condition`, `.task__photo-zone`, `.task__pairs`, `.task__puzzle__*` и т.д.) → переезжают в соответствующие компоненты

---

## Что не меняется

- Props/emits интерфейс `QuestTask.vue` — без изменений (QuestBlock.vue не трогаем)
- Логика `isDone` / `isLocked` / `isActive` остаётся в QuestTask.vue
- `typeIcon` computed остаётся в QuestTask.vue
- `QuestBlock.vue` — не трогаем

---

## Верификация

1. `nuxi build` — чистая сборка без ошибок
2. Открыть квест в браузере (dev-сервер), пройти несколько задач разных типов
3. Проверить quiz и pairs (они используются в реальных данных)
4. Playwright: если есть e2e тест квест-плеера — прогнать

---

## Порядок реализации

1. Создать директорию `tasks/` и `tasks/mini-games/`
2. Извлечь `TaskHint.vue` (переиспользуется несколькими)
3. Извлечь простые типы по одному: Simple → Location → Photo/Selfie → TextAnswer → Media → Qr
4. Извлечь Riddle и CodePhysical (общая submitAnswer-логика, но в каждом своя)
5. Извлечь мини-игры: Quiz → Pairs → Puzzle → TaskMiniGame (orchestrator)
6. Упростить QuestTask.vue до orchestrator
7. Проверить build и ручное тестирование
