<!-- Поля специфичные для каждого типа задания.
     task передаётся как объект — мутируем напрямую (реактивный ref из родителя). -->
<template>
  <!-- SIMPLE -->
  <template v-if="task.type === 'simple'">
    <div class="qe-field">
      <label>Подсказка</label>
      <input v-model="task.hint" placeholder="Необязательная подсказка" />
    </div>
  </template>

  <!-- RIDDLE -->
  <template v-else-if="task.type === 'riddle'">
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

  <!-- CODE_PHYSICAL -->
  <template v-else-if="task.type === 'code_physical'">
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

  <!-- LOCATION -->
  <template v-else-if="task.type === 'location'">
    <div class="qe-field">
      <label>Описание места <span class="req">*</span></label>
      <textarea v-model="task.location_desc" rows="2"
        placeholder="Иди к большому зеркалу в прихожей. Смотри под ковриком." />
    </div>
    <div class="qe-field">
      <label>Подсказка если не могут найти</label>
      <input v-model="task.location_hint" placeholder="Это место где встречают гостей" />
    </div>
  </template>

  <!-- SELFIE -->
  <template v-else-if="task.type === 'selfie'">
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

  <!-- PHOTO -->
  <template v-else-if="task.type === 'photo'">
    <div class="qe-field">
      <label>Инструкция</label>
      <input v-model="task.instruction" placeholder="Сфотографируйся у этого места" />
    </div>
  </template>

  <!-- TEXT_ANSWER -->
  <template v-else-if="task.type === 'text_answer'">
    <div class="qe-field">
      <label>Вопрос партнёру <span class="req">*</span></label>
      <textarea v-model="task.question" rows="2"
        placeholder="Расскажи о нашем самом смешном совместном воспоминании" />
    </div>
    <div class="qe-field">
      <label>Плейсхолдер в поле ввода</label>
      <input v-model="task.placeholder" placeholder="Напиши своими словами..." />
    </div>
  </template>

  <!-- MEDIA -->
  <template v-else-if="task.type === 'media'">
    <div class="qe-field">
      <label>Медиафайл <span class="req">*</span></label>

      <!-- Уже загружен -->
      <div v-if="task.media_url" class="qe-media-uploaded">
        <div class="qe-media-uploaded__info">
          <span class="qe-media-uploaded__icon">{{ task.media_type === 'video' ? '🎬' : '🎙️' }}</span>
          <span class="qe-media-uploaded__name">{{ task.media_original_name || 'Файл загружен' }}</span>
          <span class="qe-media-uploaded__size" v-if="task.media_size">
            {{ (task.media_size / 1024 / 1024).toFixed(1) }} МБ
          </span>
        </div>
        <div class="qe-media-uploaded__actions">
          <button class="qe-media-uploaded__preview" @click="previewMedia = !previewMedia" type="button">
            {{ previewMedia ? 'Скрыть' : 'Превью' }}
          </button>
          <button class="qe-media-uploaded__rm" @click="$emit('media-clear', task)" type="button">✕ Удалить</button>
        </div>
        <div v-if="previewMedia" class="qe-media-preview-box">
          <video v-if="task.media_type === 'video'" :src="mediaFullUrl(task.media_url)" controls class="qe-media-preview-box__video" />
          <audio v-else :src="mediaFullUrl(task.media_url)" controls class="qe-media-preview-box__audio" />
        </div>
      </div>

      <!-- Зона загрузки -->
      <div v-else class="qe-media-drop" @click="$emit('media-upload', task)" :class="{ uploading: task._mediaUploading }">
        <div v-if="task._mediaUploading" class="qe-media-drop__spinner">⏳ Загружается...</div>
        <template v-else>
          <div class="qe-media-drop__icon">🎬</div>
          <div class="qe-media-drop__text">Нажми чтобы выбрать файл</div>
          <div class="qe-hint">Видео: MP4, WebM, MOV · Аудио: MP3, OGG, WAV · до 200 МБ</div>
        </template>
      </div>
    </div>
  </template>

  <!-- QR -->
  <template v-else-if="task.type === 'qr'">
    <div class="qe-field">
      <label>Секретный код (спрятан в QR) <span class="req">*</span></label>
      <div class="qe-qr-row">
        <input v-model="task.answer" placeholder="SECRET42" class="qe-input--mono" />
        <button class="qe-qr-btn" @click="$emit('generate-qr', task)" :disabled="!task.answer">
          📄 Распечатать QR
        </button>
      </div>
      <div class="qe-hint">Клиент сканирует QR и вводит этот код. Распечатай и спрячь.</div>
    </div>
    <div class="qe-field">
      <label>Инструкция для клиента</label>
      <input v-model="task.qr_instruction" placeholder="Найди конверт под диваном и отсканируй QR" />
    </div>
    <div v-if="task.qr_preview" class="qe-qr-preview">
      <img :src="task.qr_preview" alt="QR" />
      <a :href="task.qr_preview" download="quest-qr.png" class="qe-qr-download">⬇ Скачать PNG</a>
    </div>
  </template>

  <!-- MINI_GAME -->
  <template v-else-if="task.type === 'mini_game'">
    <div class="qe-field">
      <label>Тип игры</label>
      <select v-model="task.game_type" class="qe-select qe-select--sm" @change="onGameType(task)">
        <option value="quiz">❓ Угадайка (4 варианта)</option>
        <option value="pairs">🃏 Найди пары</option>
        <option value="puzzle">🧩 Пазл из фото</option>
        <option value="word">🔤 Слово из букв</option>
        <option value="timeline">🗓️ Хронология пары</option>
        <option value="scratch">🪙 Скретч-карта</option>
        <option value="cipher">🔐 Шифр-колесо</option>
      </select>
    </div>

    <!-- Quiz -->
    <template v-if="task.game_type === 'quiz'">
      <div class="qe-field">
        <label>Вопрос <span class="req">*</span></label>
        <input v-model="task.game_question" placeholder="В каком городе мы познакомились?" />
      </div>
      <div class="qe-game-options">
        <div v-for="(_, i) in 4" :key="i"
          class="qe-game-option" :class="{ correct: task.game_correct === i }">
          <span class="qe-game-option__letter" @click="task.game_correct = i"
            title="Отметить правильным">{{ 'АБВГ'[i] }}</span>
          <input
            :value="(task.game_options || [])[i] || ''"
            @input="e => { if (!task.game_options) task.game_options = ['','','','']; task.game_options[i] = e.target.value }"
            :placeholder="`Вариант ${i + 1}`"
            class="qe-game-option__input" />
          <span v-if="task.game_correct === i" class="qe-game-option__check">✓</span>
        </div>
      </div>
      <div class="qe-hint">Кликни на букву чтобы отметить правильный ответ</div>
    </template>

    <!-- Pairs -->
    <template v-else-if="task.game_type === 'pairs'">
      <!-- Текстовые пары убраны из игры: старое задание без фото просит загрузить фото -->
      <div v-if="task.pairs?.length && !(task.game_images || []).length" class="qe-hint qe-hint--warn">
        Текстовые пары больше не поддерживаются — в квесте задание покажет только описание и кнопку «Идти дальше». Загрузи фото или выбери другую игру.
      </div>

      <!-- Фото — единственный режим пар -->
      <!-- Выбор размера матрицы -->
      <div class="qe-field">
        <label>Размер матрицы</label>
        <div class="qe-pairs-mode">
          <button
            class="qe-pairs-mode__btn"
            :class="{ active: !task.pairs_grid_size || task.pairs_grid_size === 2 }"
            @click="task.pairs_grid_size = 2; task.game_images = (task.game_images || []).slice(0, 2)"
          >2×2 <span style="opacity:.5;font-size:.75em">(2 фото)</span></button>
          <button
            class="qe-pairs-mode__btn"
            :class="{ active: task.pairs_grid_size === 3 }"
            @click="task.pairs_grid_size = 3; task.game_images = (task.game_images || []).slice(0, 6)"
          >3×4 <span style="opacity:.5;font-size:.75em">(6 фото)</span></button>
          <button
            class="qe-pairs-mode__btn"
            :class="{ active: task.pairs_grid_size === 4 }"
            @click="task.pairs_grid_size = 4"
          >4×4 <span style="opacity:.5;font-size:.75em">(8 фото)</span></button>
        </div>
      </div>
      <div class="qe-pairs-grid">
        <div
          v-for="(img, i) in (task.game_images || [])"
          :key="i"
          class="qe-pair-photo"
          @click="$emit('pair-image-upload', task, i)"
        >
          <img :src="img" class="qe-pair-photo__img" />
          <button class="qe-pair-photo__rm" @click.stop="$emit('remove-pair-image', task, i)">✕</button>
          <div class="qe-pair-photo__num">{{ i + 1 }}</div>
        </div>
        <div
          v-if="(task.game_images || []).length < pairsPhotoLimit(task)"
          class="qe-pair-photo qe-pair-photo--add"
          @click="$emit('pair-image-upload', task, null)"
        >
          <div class="qe-pair-photo__add-icon">+</div>
          <div class="qe-pair-photo__add-hint">Фото</div>
        </div>
      </div>
      <div v-if="(task.game_images || []).length < pairsPhotoLimit(task)" class="qe-hint qe-hint--warn">
        Нужно {{ pairsPhotoLimit(task) }} фото для матрицы {{ pairsGridLabel(task) }}
        (загружено {{ (task.game_images || []).length }})
      </div>
      <div v-else class="qe-hint qe-hint--ok">
        Матрица {{ pairsGridLabel(task) }} — {{ (task.game_images || []).length * 2 }} карточек, алгоритм перемешает
      </div>
    </template>

    <!-- Puzzle -->
    <template v-else-if="task.game_type === 'puzzle'">
      <div class="qe-field">
        <label>Фотография для пазла <span class="req">*</span></label>
        <div v-if="!task.puzzle_image" class="qe-photo-drop" @click="$emit('puzzle-upload', task)">
          <div class="qe-photo-drop__icon">🖼️</div>
          <div>Нажми чтобы выбрать фото</div>
          <div class="qe-hint">JPG или PNG, рекомендуется квадратное</div>
        </div>
        <div v-else class="qe-puzzle-preview">
          <img :src="task.puzzle_image" class="qe-puzzle-preview__img" />
          <button class="qe-puzzle-preview__rm" @click="task.puzzle_image = null">✕ Удалить</button>
        </div>
      </div>
      <div class="qe-field">
        <label>Ориентация фото</label>
        <div class="qe-pairs-mode">
          <button
            class="qe-pairs-mode__btn"
            :class="{ active: !task.puzzle_landscape }"
            @click="task.puzzle_landscape = false"
          >📱 Вертикальное</button>
          <button
            class="qe-pairs-mode__btn"
            :class="{ active: task.puzzle_landscape }"
            @click="task.puzzle_landscape = true"
          >🖼️ Горизонтальное</button>
        </div>
      </div>
      <div class="qe-field">
        <label>Количество частей</label>
        <select v-model.number="task.puzzle_pieces" class="qe-select qe-select--sm">
          <option :value="12">12 частей{{ task.puzzle_landscape ? ' (3×4)' : ' (4×3)' }} — лёгкий</option>
          <option :value="20">20 частей{{ task.puzzle_landscape ? ' (4×5)' : ' (5×4)' }} — средний</option>
          <option :value="30">30 частей{{ task.puzzle_landscape ? ' (5×6)' : ' (6×5)' }} — сложный</option>
          <option :value="35">35 частей{{ task.puzzle_landscape ? ' (5×7)' : ' (7×5)' }}</option>
          <option :value="42">42 части{{ task.puzzle_landscape ? ' (7×6)' : ' (6×7)' }}</option>
        </select>
      </div>
      <div v-if="task.puzzle_image" class="qe-hint qe-hint--ok">
        ✓ Фото загружено. Пазл будет собираться методом тап→выбрать→тап→поставить
      </div>
    </template>

    <!-- Слово из букв -->
    <template v-else-if="task.game_type === 'word'">
      <div class="qe-field">
        <label>Вопрос или подсказка</label>
        <input v-model="task.game_question" placeholder="Где мы впервые поцеловались?" />
      </div>
      <div class="qe-field">
        <label>Слово-ответ <span class="req">*</span></label>
        <input v-model="task.word_answer" placeholder="Старый мост" maxlength="24" />
      </div>
      <div class="qe-field">
        <label>Лишние буквы</label>
        <select v-model.number="task.word_decoys" class="qe-select qe-select--sm">
          <option :value="0">Без лишних</option>
          <option :value="2">2 лишние — средне</option>
          <option :value="4">4 лишние — сложно</option>
        </select>
      </div>
      <div class="qe-hint">Буквы перемешаются фишками, игрок соберёт слово по клеткам. Регистр, пробелы и Ё/Е не важны; до 24 знаков.</div>
    </template>

    <!-- Хронология пары -->
    <template v-else-if="task.game_type === 'timeline'">
      <div class="qe-field">
        <label>Вопрос или подсказка</label>
        <input v-model="task.game_question" placeholder="Расставь по порядку: что было раньше — выше" />
      </div>
      <div class="qe-field">
        <label>События в правильном порядке <span class="req">*</span></label>
        <div class="qe-timeline">
          <div v-for="(item, i) in task.timeline_items || []" :key="i" class="qe-timeline__row">
            <span class="qe-timeline__num">{{ i + 1 }}</span>
            <button type="button" class="qe-timeline__photo" title="Фото события (необязательно)"
              @click="$emit('image-upload', url => { item.image = url })">
              <img v-if="item.image" :src="item.image" alt="" />
              <span v-else>+ фото</span>
            </button>
            <div class="qe-timeline__fields">
              <input v-model="item.text" placeholder="Первое свидание в парке" />
              <input v-model="item.caption" placeholder="Подпись после решения: апрель 2021" />
            </div>
            <div class="qe-timeline__tools">
              <button type="button" :disabled="i === 0" title="Выше" @click="moveItem(task, i, -1)">↑</button>
              <button type="button" :disabled="i === task.timeline_items.length - 1" title="Ниже" @click="moveItem(task, i, 1)">↓</button>
              <button v-if="item.image" type="button" title="Убрать фото" @click="item.image = null">без фото</button>
              <button type="button" title="Удалить событие" @click="task.timeline_items.splice(i, 1)">✕</button>
            </div>
          </div>
        </div>
        <button v-if="(task.timeline_items || []).length < 6" type="button" class="qe-btn qe-btn--ghost qe-timeline__add"
          @click="task.timeline_items = [...(task.timeline_items || []), { text: '', caption: '', image: null }]">
          + Добавить событие
        </button>
      </div>
      <div v-if="(task.timeline_items || []).length < 3" class="qe-hint qe-hint--warn">
        Нужно от 3 до 6 событий (сейчас {{ (task.timeline_items || []).length }})
      </div>
      <div v-else class="qe-hint qe-hint--ok">В квесте события перемешаются, игрок расставит их по порядку</div>
    </template>

    <!-- Скретч-карта -->
    <template v-else-if="task.game_type === 'scratch'">
      <div class="qe-field">
        <label>Вопрос или подсказка</label>
        <input v-model="task.game_question" placeholder="Сотри — и узнаешь, что дальше" />
      </div>
      <div class="qe-field">
        <label>Фото под слоем</label>
        <div v-if="!task.scratch_image" class="qe-photo-drop" @click="$emit('image-upload', url => { task.scratch_image = url })">
          <div class="qe-photo-drop__icon">🖼️</div>
          <div>Нажми чтобы выбрать фото</div>
          <div class="qe-hint">Необязательно, если есть текст</div>
        </div>
        <div v-else class="qe-puzzle-preview">
          <img :src="task.scratch_image" class="qe-puzzle-preview__img" />
          <button class="qe-puzzle-preview__rm" @click="task.scratch_image = null">✕ Удалить</button>
        </div>
      </div>
      <div class="qe-field">
        <label>Текст под слоем</label>
        <textarea v-model="task.scratch_text" rows="2" placeholder="Билеты на субботу — в верхнем ящике комода"></textarea>
      </div>
      <div v-if="!task.scratch_image && !task.scratch_text?.trim()" class="qe-hint qe-hint--warn">Добавь фото или текст — иначе под слоем пусто</div>
      <div v-else class="qe-hint qe-hint--ok">Слой растворится, когда стёрто больше половины</div>
    </template>

    <!-- Шифр-колесо -->
    <template v-else-if="task.game_type === 'cipher'">
      <div class="qe-field">
        <label>Вопрос или подсказка</label>
        <input v-model="task.game_question" placeholder="Расшифруй записку" />
      </div>
      <div class="qe-field">
        <label>Фраза <span class="req">*</span></label>
        <input v-model="task.cipher_phrase" placeholder="Ищи под подушкой" maxlength="80" />
      </div>
      <div class="qe-field">
        <label>Ключ</label>
        <div class="qe-cipher-key">
          <span>А → {{ RU_ALPHABET[task.cipher_shift || 3] }}</span>
          <button type="button" class="qe-btn qe-btn--ghost" @click="task.cipher_shift = randomShift()">Другой ключ</button>
        </div>
      </div>
      <div v-if="task.cipher_phrase?.trim()" class="qe-hint">
        Игрок увидит: <b>{{ caesar(task.cipher_phrase, task.cipher_shift || 3) }}</b>
      </div>
      <div class="qe-hint">Шифр строится сам. Игрок крутит колесо, пока под А не встанет буква ключа.</div>
    </template>
  </template>
</template>

<script setup>
import { ref } from 'vue'
import { RU_ALPHABET, caesar, randomShift } from '~/utils/miniGames'

defineProps({ task: { type: Object, required: true } })
defineEmits(['generate-qr', 'add-pair-image', 'remove-pair-image', 'puzzle-upload', 'pair-image-upload', 'media-upload', 'media-clear', 'image-upload'])

// новая игра получает свои стартовые поля, чтобы редактор и плеер не гадали
const onGameType = (task) => {
  if (task.game_type === 'cipher' && !task.cipher_shift) task.cipher_shift = randomShift()
  if (task.game_type === 'timeline' && !task.timeline_items?.length) {
    task.timeline_items = [1, 2, 3].map(() => ({ text: '', caption: '', image: null }))
  }
  if (task.game_type === 'word' && task.word_decoys === undefined) task.word_decoys = 2
}
const moveItem = (task, i, dir) => {
  const arr = task.timeline_items, to = i + dir
  ;[arr[i], arr[to]] = [arr[to], arr[i]]
}

const previewMedia = ref(false)

const pairsPhotoLimit = (task) => ({ 2: 2, 3: 6, 4: 8 }[task.pairs_grid_size] ?? 8)
const pairsGridLabel  = (task) => ({ 2: '2×2', 3: '3×4', 4: '4×4' }[task.pairs_grid_size] ?? '4×4')

const API_BASE = useRuntimeConfig().public.apiBase.replace('/api', '')
const mediaFullUrl = (url) => url?.startsWith('http') ? url : API_BASE + url
</script>