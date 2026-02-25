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
      <label>Тип медиа</label>
      <div class="qe-media-types">
        <button
          v-for="mt in MEDIA_TYPES" :key="mt.id"
          class="qe-media-type-btn" :class="{ active: task.media_type === mt.id }"
          @click="task.media_type = mt.id"
        >
          <span>{{ mt.icon }}</span><span>{{ mt.label }}</span>
        </button>
      </div>
    </div>
    <div class="qe-media-howto">
      <template v-if="task.media_type === 'telegram_video'">
        <div class="qe-media-howto__title">Как получить ссылку:</div>
        <ol class="qe-media-howto__steps">
          <li>Загрузи видео в <strong>Избранное</strong> или свой канал в Telegram</li>
          <li>Нажми на сообщение → «Поделиться» → «Копировать ссылку»</li>
          <li>Вставь ссылку ниже</li>
        </ol>
      </template>
      <template v-else-if="task.media_type === 'telegram_audio'">
        <div class="qe-media-howto__title">Как получить ссылку:</div>
        <ol class="qe-media-howto__steps">
          <li>Запиши голосовое или загрузи аудио в <strong>Избранное</strong></li>
          <li>Нажми на сообщение → «Поделиться» → «Копировать ссылку»</li>
          <li>Вставь ссылку ниже</li>
        </ol>
      </template>
      <template v-else-if="task.media_type === 'youtube'">
        <div class="qe-media-howto__title">YouTube:</div>
        <ol class="qe-media-howto__steps">
          <li>Загрузи видео на YouTube (можно «Только по ссылке»)</li>
          <li>Скопируй URL из адресной строки</li>
        </ol>
      </template>
    </div>
    <div class="qe-field">
      <label>Ссылка <span class="req">*</span></label>
      <input v-model="task.media_url" :placeholder="mediaPlaceholder(task.media_type)" />
    </div>
    <div v-if="task.media_url && task.media_type === 'youtube'" class="qe-media-preview">
      <div class="qe-media-preview__label">Превью:</div>
      <img
        :src="'https://img.youtube.com/vi/' + youtubeId(task.media_url) + '/mqdefault.jpg'"
        class="qe-media-preview__thumb"
        @error="e => e.target.style.display='none'"
      />
    </div>
    <div v-if="task.media_url && task.media_type !== 'youtube'" class="qe-media-preview">
      <a :href="task.media_url" target="_blank" class="qe-media-preview__tg-link">
        ↗ Проверить ссылку
      </a>
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
          <input v-model="task.game_options[i]" :placeholder="`Вариант ${i + 1}`"
            class="qe-game-option__input" />
          <span v-if="task.game_correct === i" class="qe-game-option__check">✓</span>
        </div>
      </div>
      <div class="qe-hint">Кликни на букву чтобы отметить правильный ответ</div>
    </template>

    <!-- Pairs -->
    <template v-else-if="task.game_type === 'pairs'">
      <div class="qe-game-pairs">
        <div v-for="(pair, pi) in (task.game_pairs || [{a:'',b:''}])" :key="pi"
          class="qe-game-pair">
          <input v-model="pair.a" :placeholder="`Карточка A${pi+1}`" />
          <span class="qe-game-pair__arrow">↔</span>
          <input v-model="pair.b" :placeholder="`Карточка B${pi+1}`" />
          <button class="qe-icon-btn qe-icon-btn--danger" @click="$emit('remove-pair', task, pi)">✕</button>
        </div>
      </div>
      <button class="qe-add-task__btn" @click="$emit('add-pair', task)">+ Добавить пару</button>
      <div class="qe-hint">Максимум 6 пар (12 карточек на экране)</div>
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
defineProps({ task: { type: Object, required: true } })
defineEmits(['generate-qr', 'add-pair', 'remove-pair', 'puzzle-upload'])

const MEDIA_TYPES = [
  { id: 'telegram_video', icon: '📹', label: 'Видео Telegram' },
  { id: 'telegram_audio', icon: '🎙️', label: 'Аудио Telegram' },
  { id: 'youtube',        icon: '▶️',  label: 'YouTube' },
]
const mediaPlaceholder = (type) => ({
  telegram_video: 'https://t.me/c/123456789/42',
  telegram_audio: 'https://t.me/c/123456789/43',
  youtube:        'https://youtube.com/watch?v=dQw4w9WgXcQ',
}[type] || 'https://')
const youtubeId = (url) => url?.match(/(?:v=|youtu\.be\/)([^&?\s]+)/)?.[1] || ''
</script>