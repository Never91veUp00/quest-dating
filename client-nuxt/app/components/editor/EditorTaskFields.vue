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
      <select v-model="task.game_type" class="qe-select qe-select--sm">
        <option value="quiz">❓ Угадайка (4 варианта)</option>
        <option value="pairs">🃏 Найди пары</option>
        <option value="puzzle">🧩 Пазл из фото</option>
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
      <div class="qe-pairs-grid">
        <!-- Существующие фото -->
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

        <!-- Кнопка добавить (если меньше 12) -->
        <div
          v-if="(task.game_images || []).length < 12"
          class="qe-pair-photo qe-pair-photo--add"
          @click="$emit('pair-image-upload', task, null)"
        >
          <div class="qe-pair-photo__add-icon">+</div>
          <div class="qe-pair-photo__add-hint">Фото</div>
        </div>
      </div>

      <div v-if="(task.game_images || []).length < 2" class="qe-hint qe-hint--warn">
        Добавь минимум 2 фото — каждое станет парой карточек
      </div>
      <div v-else class="qe-hint qe-hint--ok">
        {{ (task.game_images || []).length }} фото → {{ (task.game_images || []).length * 2 }} карточек, алгоритм перемешает
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
        <label>Количество частей</label>
        <select v-model.number="task.puzzle_pieces" class="qe-select qe-select--sm">
          <option :value="30">30 частей (5×6)</option>
          <option :value="35">35 частей (5×7)</option>
          <option :value="42">42 части (6×7)</option>
        </select>
      </div>
      <div v-if="task.puzzle_image" class="qe-hint qe-hint--ok">
        ✓ Фото загружено. Пазл будет собираться методом тап→выбрать→тап→поставить
      </div>
    </template>
  </template>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ task: { type: Object, required: true } })
defineEmits(['generate-qr', 'add-pair-image', 'remove-pair-image', 'puzzle-upload', 'pair-image-upload', 'media-upload', 'media-clear'])

const previewMedia = ref(false)

const API_BASE = useRuntimeConfig().public.apiBase.replace('/api', '')
const mediaFullUrl = (url) => url?.startsWith('http') ? url : API_BASE + url
</script>