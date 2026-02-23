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
      <!-- ══ Левая колонка: мета-данные ══════════════════════ -->
      <aside class="qe-meta">
        <div class="qe-section">
          <div class="qe-section__title">Основные данные</div>

          <div class="qe-field">
            <label>Имя клиента <span class="req">*</span></label>
            <input v-model="form.client_name" placeholder="Лиза" @input="autoSlug" />
          </div>

          <div class="qe-field">
            <label>Название квеста <span class="req">*</span></label>
            <input v-model="form.title" placeholder="Дело о пропавшем подарке" />
          </div>

          <div class="qe-field">
            <label>Slug (URL) <span class="req">*</span></label>
            <div class="qe-slug-row">
              <span class="qe-slug-prefix">/quest/</span>
              <input v-model="form.slug" placeholder="anna-ivan-2024" class="qe-slug-input" />
            </div>
            <div v-if="form.slug" class="qe-slug-link">
              {{ origin }}/quest/{{ form.slug }}
            </div>
          </div>

          <div class="qe-field">
            <label>Тема оформления</label>
            <div class="qe-themes">
              <button
                v-for="t in themes"
                :key="t.id"
                class="qe-theme-btn"
                :class="{ active: form.theme === t.id }"
                @click="form.theme = t.id"
              >
                <span>{{ t.icon }}</span>
                <span>{{ t.label }}</span>
              </button>
            </div>
          </div>

          <div class="qe-field">
            <label>Код доступа</label>
            <input v-model="form.access_code" placeholder="Необязательно" />
            <div class="qe-hint">Если заполнен — клиент должен ввести его перед стартом</div>
          </div>

          <div class="qe-field">
            <label>Финальное послание</label>
            <textarea
              v-model="form.final_message"
              placeholder="Лиза, ты — лучшее, что случилось в моей жизни ❤️"
              rows="4"
            ></textarea>
            <div class="qe-hint">Показывается клиенту на экране завершения</div>
          </div>
        </div>

        <!-- Шаблон -->
        <div class="qe-section">
          <div class="qe-section__title">Шаблон</div>
          <select v-model="selectedTemplate" class="qe-select" @change="loadTemplate">
            <option value="">— Начать с нуля —</option>
            <option v-for="t in templates" :key="t.id" :value="t">
              {{ t.title }}
            </option>
          </select>
          <div v-if="selectedTemplate" class="qe-hint">
            Блоки шаблона будут загружены ниже. Можно редактировать.
          </div>
        </div>
      </aside>

      <!-- ══ Правая колонка: блоки ════════════════════════════ -->
      <div class="qe-editor">
        <div class="qe-editor__head">
          <span class="qe-section__title">Блоки квеста</span>
          <span class="qe-editor__count">{{ form.blocks.length }} {{ pluralBlock(form.blocks.length) }}</span>
        </div>

        <!-- Список блоков -->
        <div class="qe-blocks">
          <div
            v-for="(block, bi) in form.blocks"
            :key="block.id"
            class="qe-block"
            :class="{ 'qe-block--open': openBlocks.includes(block.id) }"
          >
            <!-- Заголовок блока -->
            <div class="qe-block__header" @click="toggleBlock(block.id)">
              <div class="qe-block__num">{{ bi + 1 }}</div>
              <div class="qe-block__info">
                <span class="qe-block__name">{{ block.title || 'Блок без названия' }}</span>
                <span v-if="block.location" class="qe-block__loc">📍 {{ block.location }}</span>
                <span class="qe-block__tasks-count">{{ block.tasks.length }} заданий</span>
              </div>
              <div class="qe-block__tools">
                <button class="qe-icon-btn" @click.stop="moveBlock(bi, -1)" :disabled="bi === 0" title="Вверх">↑</button>
                <button class="qe-icon-btn" @click.stop="moveBlock(bi, 1)" :disabled="bi === form.blocks.length - 1" title="Вниз">↓</button>
                <button class="qe-icon-btn qe-icon-btn--danger" @click.stop="removeBlock(bi)" title="Удалить блок">✕</button>
                <span class="qe-block__chevron">{{ openBlocks.includes(block.id) ? '▲' : '▼' }}</span>
              </div>
            </div>

            <!-- Тело блока -->
            <div v-if="openBlocks.includes(block.id)" class="qe-block__body">
              <div class="qe-block__fields">
                <div class="qe-field">
                  <label>Название блока</label>
                  <input v-model="block.title" placeholder="Улика №1 — Прихожая" />
                </div>
                <div class="qe-field">
                  <label>Локация</label>
                  <input v-model="block.location" placeholder="Прихожая, у зеркала" />
                </div>
                <div class="qe-field qe-field--full">
                  <label>Описание блока</label>
                  <textarea v-model="block.description" rows="2" placeholder="Вводный текст для этой локации..."></textarea>
                </div>
              </div>

              <!-- Задания -->
              <div class="qe-tasks">
                <div class="qe-tasks__head">Задания</div>

                <div
                  v-for="(task, ti) in block.tasks"
                  :key="task.id"
                  class="qe-task"
                >
                  <div class="qe-task__header">
                    <div class="qe-task__type-badge" :data-type="task.type">
                      {{ typeLabel(task.type) }}
                    </div>
                    <span class="qe-task__name">{{ task.title || 'Новое задание' }}</span>
                    <div class="qe-task__tools">
                      <button class="qe-icon-btn" @click="moveTask(block, ti, -1)" :disabled="ti === 0">↑</button>
                      <button class="qe-icon-btn" @click="moveTask(block, ti, 1)" :disabled="ti === block.tasks.length - 1">↓</button>
                      <button class="qe-icon-btn qe-icon-btn--danger" @click="removeTask(block, ti)">✕</button>
                    </div>
                  </div>

                  <div class="qe-task__fields">
                    <div class="qe-task__row">
                      <div class="qe-field">
                        <label>Тип</label>
                        <select v-model="task.type" class="qe-select qe-select--sm">
                          <option value="simple">✓ Простое</option>
                          <option value="riddle">? Загадка</option>
                          <option value="photo">📷 Фото</option>
                        </select>
                      </div>
                      <div class="qe-field">
                        <label>Очки</label>
                        <input v-model.number="task.points" type="number" min="0" max="1000" class="qe-input--sm" />
                      </div>
                    </div>

                    <div class="qe-field">
                      <label>Заголовок задания</label>
                      <input v-model="task.title" placeholder="Найти записку у зеркала" />
                    </div>

                    <div class="qe-field">
                      <label>Описание / текст задания</label>
                      <textarea v-model="task.description" rows="2" placeholder="Что должен сделать клиент..."></textarea>
                    </div>

                    <!-- ── SIMPLE ── -->
                    <template v-if="task.type === 'simple'">
                      <div class="qe-field">
                        <label>Подсказка</label>
                        <input v-model="task.hint" placeholder="Необязательная подсказка" />
                      </div>
                    </template>

                    <!-- ── RIDDLE ── -->
                    <template v-if="task.type === 'riddle'">
                      <div class="qe-field">
                        <label>Вопрос</label>
                        <input v-model="task.question" placeholder="Куда ведёт эта подсказка?" />
                      </div>
                      <div class="qe-task__row">
                        <div class="qe-field">
                          <label>Правильный ответ <span class="req">*</span></label>
                          <input v-model="task.answer" placeholder="ванная" />
                          <div class="qe-hint">Регистр и пробелы не важны</div>
                        </div>
                        <div class="qe-field">
                          <label>Подсказка</label>
                          <input v-model="task.hint" placeholder="Где умываются каждое утро?" />
                        </div>
                      </div>
                    </template>

                    <!-- ── CODE_PHYSICAL ── -->
                    <template v-if="task.type === 'code_physical'">
                      <div class="qe-field">
                        <label>Правильный код <span class="req">*</span></label>
                        <input v-model="task.answer" placeholder="LOVE" class="qe-input--mono" />
                        <div class="qe-hint">Что должен ввести клиент после сбора букв</div>
                      </div>
                      <div class="qe-field">
                        <label>Как найти код (описание предметов)</label>
                        <input v-model="task.code_hint" placeholder="На книге, чашке и магните — первые буквы" />
                      </div>
                      <div class="qe-field">
                        <label>Подсказка</label>
                        <input v-model="task.hint" placeholder="Посмотри внимательно на предметы рядом" />
                      </div>
                    </template>

                    <!-- ── LOCATION ── -->
                    <template v-if="task.type === 'location'">
                      <div class="qe-field">
                        <label>Описание места <span class="req">*</span></label>
                        <textarea v-model="task.location_desc" rows="2" placeholder="Иди к большому зеркалу в прихожей. Смотри под ковриком." />
                      </div>
                      <div class="qe-field">
                        <label>Подсказка если не могут найти</label>
                        <input v-model="task.location_hint" placeholder="Это место где встречают гостей" />
                      </div>
                    </template>

                    <!-- ── SELFIE ── -->
                    <template v-if="task.type === 'selfie'">
                      <div class="qe-task__row">
                        <div class="qe-field">
                          <label>Условие <span class="req">*</span></label>
                          <input v-model="task.selfie_condition" placeholder="Покажи язык и подмигни" />
                        </div>
                        <div class="qe-field">
                          <label>Emoji</label>
                          <input v-model="task.selfie_emoji" placeholder="🤳" class="qe-input--sm" maxlength="4" />
                        </div>
                      </div>
                    </template>

                    <!-- ── PHOTO ── -->
                    <template v-if="task.type === 'photo'">
                      <div class="qe-field">
                        <label>Инструкция</label>
                        <input v-model="task.instruction" placeholder="Сфотографируйся у этого места" />
                      </div>
                    </template>

                    <!-- ── TEXT_ANSWER ── -->
                    <template v-if="task.type === 'text_answer'">
                      <div class="qe-field">
                        <label>Вопрос партнёру <span class="req">*</span></label>
                        <textarea v-model="task.question" rows="2" placeholder="Расскажи о нашем самом смешном совместном воспоминании" />
                      </div>
                      <div class="qe-field">
                        <label>Плейсхолдер в поле ввода</label>
                        <input v-model="task.placeholder" placeholder="Напиши своими словами..." />
                      </div>
                    </template>

                    <!-- ── MEDIA ── -->
                    <template v-if="task.type === 'media'">
                      <div class="qe-task__row">
                        <div class="qe-field">
                          <label>Тип медиа</label>
                          <select v-model="task.media_type" class="qe-select qe-select--sm">
                            <option value="video">🎥 Видео (ссылка)</option>
                            <option value="audio">🎵 Аудио (ссылка)</option>
                            <option value="youtube">▶️ YouTube</option>
                          </select>
                        </div>
                      </div>
                      <div class="qe-field">
                        <label>URL <span class="req">*</span></label>
                        <input v-model="task.media_url" placeholder="https://youtube.com/watch?v=... или ссылка на файл" />
                      </div>
                    </template>

                    <!-- ── QR ── -->
                    <template v-if="task.type === 'qr'">
                      <div class="qe-field">
                        <label>Секретный код (спрятан в QR) <span class="req">*</span></label>
                        <div class="qe-qr-row">
                          <input v-model="task.answer" placeholder="SECRET42" class="qe-input--mono" />
                          <button class="qe-qr-btn" @click="generateQR(task)" :disabled="!task.answer">
                            📄 Распечатать QR
                          </button>
                        </div>
                        <div class="qe-hint">Клиент сканирует QR и вводит этот код. Распечатай и спрячь.</div>
                      </div>
                      <div class="qe-field">
                        <label>Инструкция для клиента</label>
                        <input v-model="task.qr_instruction" placeholder="Найди конверт под диваном и отсканируй QR" />
                      </div>
                      <!-- QR превью -->
                      <div v-if="task.qr_preview" class="qe-qr-preview">
                        <img :src="task.qr_preview" alt="QR" />
                        <a :href="task.qr_preview" download="quest-qr.png" class="qe-qr-download">⬇ Скачать PNG</a>
                      </div>
                    </template>

                    <!-- ── MINI_GAME ── -->
                    <template v-if="task.type === 'mini_game'">
                      <div class="qe-field">
                        <label>Тип игры</label>
                        <select v-model="task.game_type" class="qe-select qe-select--sm">
                          <option value="quiz">❓ Угадайка (4 варианта)</option>
                          <option value="pairs">🃏 Найди пары</option>
                        </select>
                      </div>

                      <!-- Quiz -->
                      <template v-if="task.game_type === 'quiz'">
                        <div class="qe-field">
                          <label>Вопрос <span class="req">*</span></label>
                          <input v-model="task.game_question" placeholder="В каком городе мы познакомились?" />
                        </div>
                        <div class="qe-game-options">
                          <div
                            v-for="(_, i) in 4"
                            :key="i"
                            class="qe-game-option"
                            :class="{ correct: task.game_correct === i }"
                          >
                            <span class="qe-game-option__letter" @click="task.game_correct = i" title="Отметить правильным">{{ 'АБВГ'[i] }}</span>
                            <input
                              v-model="task.game_options[i]"
                              :placeholder="`Вариант ${i + 1}`"
                              class="qe-game-option__input"
                            />
                            <span v-if="task.game_correct === i" class="qe-game-option__check">✓</span>
                          </div>
                        </div>
                        <div class="qe-hint">Кликни на букву чтобы отметить правильный ответ</div>
                      </template>

                      <!-- Pairs -->
                      <template v-if="task.game_type === 'pairs'">
                        <div class="qe-game-pairs">
                          <div
                            v-for="(pair, pi) in (task.game_pairs || [{a:'',b:''}])"
                            :key="pi"
                            class="qe-game-pair"
                          >
                            <input v-model="pair.a" :placeholder="`Карточка A${pi+1}`" />
                            <span class="qe-game-pair__arrow">↔</span>
                            <input v-model="pair.b" :placeholder="`Карточка B${pi+1}`" />
                            <button class="qe-icon-btn qe-icon-btn--danger" @click="removePair(task, pi)">✕</button>
                          </div>
                        </div>
                        <button class="qe-add-task__btn" @click="addPair(task)">+ Добавить пару</button>
                        <div class="qe-hint">Максимум 6 пар (12 карточек на экране)</div>
                      </template>
                    </template>

                  </div>
                </div>

                <!-- Добавить задание -->
                <div class="qe-add-task">
                  <div class="qe-add-task__group">
                    <span class="qe-add-task__label">Базовые</span>
                    <button class="qe-add-task__btn" @click="addTask(block, 'simple')">✓ Простое</button>
                    <button class="qe-add-task__btn" @click="addTask(block, 'riddle')">? Загадка</button>
                    <button class="qe-add-task__btn" @click="addTask(block, 'photo')">📷 Фото</button>
                  </div>
                  <div class="qe-add-task__group">
                    <span class="qe-add-task__label">Офлайн</span>
                    <button class="qe-add-task__btn" @click="addTask(block, 'location')">📍 Место</button>
                    <button class="qe-add-task__btn" @click="addTask(block, 'code_physical')">🔢 Код</button>
                    <button class="qe-add-task__btn" @click="addTask(block, 'selfie')">🤳 Селфи</button>
                    <button class="qe-add-task__btn" @click="addTask(block, 'qr')">◻️ QR</button>
                  </div>
                  <div class="qe-add-task__group">
                    <span class="qe-add-task__label">Интерактив</span>
                    <button class="qe-add-task__btn" @click="addTask(block, 'text_answer')">✍️ Вопрос</button>
                    <button class="qe-add-task__btn" @click="addTask(block, 'media')">🎬 Медиа</button>
                    <button class="qe-add-task__btn" @click="addTask(block, 'mini_game')">🎮 Игра</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Добавить блок -->
        <button class="qe-add-block" @click="addBlock">
          + Добавить блок
        </button>

        <!-- Ошибки -->
        <div v-if="errors.length" class="qe-errors">
          <div class="qe-errors__title">Исправь перед публикацией:</div>
          <ul>
            <li v-for="e in errors" :key="e">{{ e }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiClient } from '@/services/api'

const router = useRouter()
const route  = useRoute()

const isEdit = computed(() => !!route.params.id)
const origin = window.location.origin

// ─── Form ─────────────────────────────────────────────────────
const form = ref({
  title:         '',
  client_name:   '',
  slug:          '',
  theme:         'detective',
  access_code:   '',
  final_message: '',
  is_public:     false,
  order_id:      null,
  template_id:   null,
  blocks:        []
})

const themes = [
  { id: 'detective', icon: '🕵️', label: 'Детектив' },
  { id: 'romantic',  icon: '❤️',  label: 'Романтик' },
  { id: 'city',      icon: '🏙️', label: 'Город' },
  { id: 'mystery',   icon: '🔮',  label: 'Мистика' },
]

// ─── State ────────────────────────────────────────────────────
const saving         = ref(false)
const errors         = ref([])
const openBlocks     = ref([])
const templates      = ref([])
const selectedTemplate = ref('')

// ─── Init ─────────────────────────────────────────────────────
onMounted(async () => {
  // Загружаем список шаблонов
  try {
    const res = await apiClient.get('/admin/templates')
    templates.value = res.data
  } catch {}

  // Если редактирование — загружаем квест
  if (isEdit.value) {
    try {
      const res = await apiClient.get(`/admin/quests/${route.params.id}`)
      const q = res.data
      form.value = {
        title:         q.title,
        client_name:   q.client_name,
        slug:          q.slug,
        theme:         q.theme || 'detective',
        access_code:   q.access_code || '',
        final_message: q.final_message || '',
        is_public:     q.is_public,
        order_id:      q.order_id,
        template_id:   q.template_id,
        blocks:        q.blocks || []
      }
      // Открываем первый блок
      if (form.value.blocks.length) {
        openBlocks.value = [form.value.blocks[0].id]
      }
    } catch {
      alert('Квест не найден')
      router.push('/admin')
    }
    return
  }

  // Если создание из заказа — подставляем данные из query
  if (route.query.client_name) {
    form.value.client_name = route.query.client_name
    form.value.order_id    = route.query.order_id ? Number(route.query.order_id) : null
    form.value.template_id = route.query.template_id ? Number(route.query.template_id) : null
    autoSlug()
  }

  // Если задан template_id — загружаем шаблон сразу
  if (form.value.template_id) {
    const tpl = templates.value.find(t => t.id === form.value.template_id)
    if (tpl) {
      selectedTemplate.value = tpl
      applyTemplate(tpl)
    }
  }

  // Начинаем с одним пустым блоком
  if (!form.value.blocks.length) {
    addBlock()
  }
})

// ─── Auto slug ────────────────────────────────────────────────
const autoSlug = () => {
  if (isEdit.value) return
  const name = form.value.client_name
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
  const translit = cyrillicToLatin(name)
  const date = new Date().getFullYear()
  form.value.slug = translit ? `${translit}-${date}` : ''
  if (!form.value.title && form.value.client_name) {
    form.value.title = `Квест для ${form.value.client_name}`
  }
}

const cyrillicToLatin = (str) => {
  const map = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',
    к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',
    ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' }
  return str.split('').map(c => map[c] || c).join('')
}

// ─── Template ─────────────────────────────────────────────────
const loadTemplate = () => {
  if (!selectedTemplate.value) return
  if (form.value.blocks.length > 1 || (form.value.blocks.length === 1 && form.value.blocks[0].tasks.length)) {
    if (!confirm('Заменить текущие блоки блоками шаблона?')) {
      selectedTemplate.value = ''
      return
    }
  }
  applyTemplate(selectedTemplate.value)
}

const applyTemplate = (tpl) => {
  if (!tpl.structure) return
  // Клонируем блоки с новыми id чтобы не было конфликтов
  const blocks = JSON.parse(JSON.stringify(tpl.structure))
  blocks.forEach((b, bi) => {
    b.id = `block-${Date.now()}-${bi}`
    b.tasks = (b.tasks || []).map((t, ti) => ({
      ...t,
      id: `task-${Date.now()}-${bi}-${ti}`
    }))
  })
  form.value.blocks = blocks
  form.value.template_id = tpl.id
  openBlocks.value = blocks.length ? [blocks[0].id] : []
}

// ─── Blocks ───────────────────────────────────────────────────
const addBlock = () => {
  const id = `block-${Date.now()}`
  form.value.blocks.push({
    id,
    title:       '',
    description: '',
    location:    '',
    tasks:       []
  })
  openBlocks.value = [id]
}

const removeBlock = (idx) => {
  if (!confirm('Удалить этот блок?')) return
  const id = form.value.blocks[idx].id
  form.value.blocks.splice(idx, 1)
  openBlocks.value = openBlocks.value.filter(x => x !== id)
}

const moveBlock = (idx, dir) => {
  const arr = form.value.blocks
  const to = idx + dir
  if (to < 0 || to >= arr.length) return
  ;[arr[idx], arr[to]] = [arr[to], arr[idx]]
}

const toggleBlock = (id) => {
  if (openBlocks.value.includes(id)) {
    openBlocks.value = openBlocks.value.filter(x => x !== id)
  } else {
    openBlocks.value.push(id)
  }
}

// ─── Tasks ────────────────────────────────────────────────────
const addTask = (block, type) => {
  const defaults = {
    simple:        { points: 10, hint: '' },
    riddle:        { points: 30, question: '', answer: '', hint: '' },
    code_physical: { points: 30, answer: '', code_hint: '', hint: '' },
    location:      { points: 15, location_desc: '', location_hint: '' },
    selfie:        { points: 25, selfie_condition: '', selfie_emoji: '🤳' },
    photo:         { points: 20, instruction: '' },
    text_answer:   { points: 15, question: '', placeholder: '' },
    media:         { points: 10, media_type: 'youtube', media_url: '' },
    qr:            { points: 35, answer: '', qr_instruction: '', qr_preview: null },
    mini_game:     { points: 40, game_type: 'quiz', game_question: '', game_options: ['','','',''], game_correct: 0, game_pairs: [{a:'',b:''}] },
  }
  block.tasks.push({
    id:          `task-${Date.now()}`,
    type,
    title:       '',
    description: '',
    ...(defaults[type] || {})
  })
}

// QR-генератор через Google Charts API (не нужен бэкенд)
const generateQR = (task) => {
  const content = task.answer
  const url = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(content)}&choe=UTF-8`
  task.qr_preview = url
}

const addPair    = (task) => { task.game_pairs = [...(task.game_pairs || []), { a: '', b: '' }] }
const removePair = (task, idx) => { task.game_pairs.splice(idx, 1) }

const removeTask = (block, idx) => {
  block.tasks.splice(idx, 1)
}

const moveTask = (block, idx, dir) => {
  const arr = block.tasks
  const to = idx + dir
  if (to < 0 || to >= arr.length) return
  ;[arr[idx], arr[to]] = [arr[to], arr[idx]]
}

// ─── Validation ───────────────────────────────────────────────
const validate = () => {
  const errs = []
  if (!form.value.client_name.trim()) errs.push('Укажи имя клиента')
  if (!form.value.title.trim())       errs.push('Укажи название квеста')
  if (!form.value.slug.trim())        errs.push('Укажи slug')
  if (!form.value.blocks.length)      errs.push('Добавь хотя бы один блок')

  form.value.blocks.forEach((b, bi) => {
    if (!b.title.trim()) errs.push(`Блок ${bi + 1}: укажи название`)
    b.tasks.forEach((t, ti) => {
      if (!t.title.trim()) errs.push(`Блок ${bi + 1}, задание ${ti + 1}: укажи заголовок`)
      if (t.type === 'riddle' && !t.answer.trim())
        errs.push(`Блок ${bi + 1}, задание ${ti + 1}: укажи правильный ответ`)
    })
  })
  return errs
}

// ─── Save ─────────────────────────────────────────────────────
const save = async (publish) => {
  errors.value = []

  if (publish) {
    errors.value = validate()
    if (errors.value.length) return
  }

  saving.value = true
  try {
    const payload = {
      ...form.value,
      is_public: publish
    }

    let res
    if (isEdit.value) {
      res = await apiClient.put(`/admin/quests/${route.params.id}`, payload)
    } else {
      res = await apiClient.post('/admin/quests', payload)
    }

    const saved = res.data
    form.value.slug = saved.slug

    if (publish) {
      const url = `${origin}/quest/${saved.slug}`
      await navigator.clipboard.writeText(url).catch(() => {})
      alert(`✅ Квест опубликован!\n\nСсылка скопирована в буфер:\n${url}`)
    } else {
      alert('Черновик сохранён')
    }

    if (!isEdit.value) {
      router.replace(`/admin/quest/${saved.id}/edit`)
    }
  } catch (e) {
    if (e.errors) {
      errors.value = e.errors.map(x => x.msg)
    } else {
      errors.value = [e.message || 'Ошибка сохранения']
    }
  } finally {
    saving.value = false
  }
}

// ─── Preview ──────────────────────────────────────────────────
const previewQuest = () => {
  window.open(`/quest/${form.value.slug}`, '_blank')
}

// ─── Helpers ──────────────────────────────────────────────────
const typeLabel = (t) => ({ simple: '✓ Простое', riddle: '? Загадка', photo: '📷 Фото' }[t] || t)
const pluralBlock = (n) => n === 1 ? 'блок' : n < 5 ? 'блока' : 'блоков'
</script>

<style scoped>
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