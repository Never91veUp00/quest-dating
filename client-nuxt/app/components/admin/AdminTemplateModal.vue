<template>
  <teleport to="body">
    <div v-if="show" class="adm-modal-overlay" @click.self="$emit('close')">
      <div class="adm-modal adm-modal--wide">
        <button class="adm-modal__close" @click="$emit('close')">✕</button>
        <h2 class="adm-modal__title">{{ editingTemplate ? 'Редактировать шаблон' : 'Новый шаблон' }}</h2>

        <div v-if="form" class="adm-tform">
          <div class="adm-tform__row adm-tform__row--2">
            <div class="adm-tform__field adm-tform__field--span2">
              <label>Название <span class="adm-tform__req">*</span></label>
              <input v-model="form.title" placeholder="Городское приключение" class="adm-tform__input" />
            </div>
            <div class="adm-tform__field adm-tform__field--span2">
              <label>Подзаголовок (tagline)</label>
              <input v-model="form.tagline" placeholder="Откройте город с новой стороны" class="adm-tform__input" />
            </div>
          </div>

          <div class="adm-tform__field">
            <label>Описание <span class="adm-tform__req">*</span></label>
            <textarea v-model="form.description" rows="3" placeholder="Полное описание квеста для страницы шаблона..." class="adm-tform__textarea"></textarea>
          </div>

          <div class="adm-tform__field">
            <label>Краткое описание для быстрого просмотра</label>
            <textarea v-model="form.quick_view_description" rows="2" placeholder="Короткий тизер (1–2 предложения) — показывается во всплывающем окне при клике «Быстрый просмотр»" class="adm-tform__textarea"></textarea>
            <div class="adm-tform__hint">Если не заполнено — будут взяты первые 200 символов описания</div>
          </div>

          <div class="adm-tform__row adm-tform__row--4">
            <div class="adm-tform__field">
              <label>Категория</label>
              <select v-model="form.category_id" class="adm-tform__select">
                <option :value="null">— Без категории —</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.icon }} {{ c.name }}</option>
              </select>
            </div>
            <div class="adm-tform__field">
              <label>Сложность <span class="adm-tform__req">*</span></label>
              <select v-model="form.difficulty" class="adm-tform__select">
                <option value="easy">Лёгкий</option>
                <option value="medium">Средний</option>
                <option value="hard">Сложный</option>
                <option value="expert">Эксперт</option>
              </select>
            </div>
            <div class="adm-tform__field">
              <label>Длительность (мин) <span class="adm-tform__req">*</span></label>
              <input v-model.number="form.duration_minutes" type="number" min="10" step="15" class="adm-tform__input" />
            </div>
            <div class="adm-tform__field">
              <label>Тип локации</label>
              <select v-model="form.location_type" class="adm-tform__select">
                <option value="universal">Универсальный</option>
                <option value="city">Город</option>
                <option value="indoor">В помещении</option>
                <option value="park">Парк/природа</option>
              </select>
            </div>
          </div>

          <div class="adm-tform__row adm-tform__row--4">
            <div class="adm-tform__field">
              <label>Мин. локаций</label>
              <input v-model.number="form.min_locations" type="number" min="1" step="1" placeholder="1" class="adm-tform__input" />
            </div>
            <div class="adm-tform__field">
              <label>Макс. локаций</label>
              <input v-model.number="form.max_locations" type="number" min="1" step="1" placeholder="10" class="adm-tform__input" />
            </div>
            <div class="adm-tform__field adm-tform__field--span2">
              <label>Ссылка на видео (YouTube / Telegram)</label>
              <input v-model="form.demo_video_url" type="url" placeholder="https://youtube.com/..." class="adm-tform__input" />
              <div class="adm-tform__hint">Видео-превью квеста для страницы шаблона</div>
            </div>
          </div>

          <div class="adm-tform__row adm-tform__row--3">
            <div class="adm-tform__field">
              <label>Цена (₽) <span class="adm-tform__req">*</span></label>
              <input v-model.number="form.base_price" type="number" min="0" step="100" class="adm-tform__input" :disabled="form.is_free" />
            </div>
            <div class="adm-tform__field adm-tform__field--checkbox">
              <label class="adm-tform__check-label">
                <input type="checkbox" v-model="form.is_free" />
                <span>Бесплатный</span>
              </label>
              <label class="adm-tform__check-label">
                <input type="checkbox" v-model="form.is_premium" />
                <span>Премиум</span>
              </label>
            </div>
            <div class="adm-tform__field">
              <label>Статус публикации</label>
              <select v-model="form.status" class="adm-tform__select">
                <option value="draft">Черновик</option>
                <option value="published">Опубликован</option>
                <option value="archived">Архив</option>
              </select>
            </div>
          </div>

          <div class="adm-tform__field">
            <label>Особенности (по одной на строку)</label>
            <textarea
              :value="form.featuresText"
              @input="form.featuresText = $event.target.value"
              rows="4"
              placeholder="Прогулка по историческому центру&#10;Загадки на основе архитектуры&#10;Финальная локация с видом на реку"
              class="adm-tform__textarea"
            ></textarea>
            <div class="adm-tform__hint">Каждая строка — отдельный пункт на карточке шаблона</div>
          </div>

          <!-- Теги -->
          <div v-if="tags.length" class="adm-tform__field">
            <label>Теги</label>
            <div class="adm-tags-picker">
              <button
                v-for="tag in tags"
                :key="tag.id"
                type="button"
                class="adm-tag-btn"
                :class="{ active: form.tag_ids.includes(tag.id) }"
                @click="toggleTag(tag.id)"
              >{{ tag.name }}</button>
            </div>
          </div>

          <!-- Демо-квест для страницы шаблона -->
          <div class="adm-tform__field">
            <label>Демо-квест <span class="adm-tform__hint-inline">(блок «Как устроен квест» берётся отсюда)</span></label>
            <select v-model="form.demo_quest_id" class="adm-tform__select">
              <option :value="null">— Не выбран (показываются стандартные этапы) —</option>
              <option v-for="q in quests" :key="q.id" :value="q.id">
                {{ q.title }}{{ q.template_title ? ` (шаблон: ${q.template_title})` : '' }}
              </option>
            </select>
            <div class="adm-tform__hint">Выберите готовый квест — его структура отобразится на публичной странице шаблона</div>
          </div>

          <!-- Тема и параметры редактора квестов -->
          <div class="adm-tform__row adm-tform__row--3">
            <div class="adm-tform__field">
              <label>Тема оформления по умолчанию</label>
              <select v-model="form.default_theme" class="adm-tform__select">
                <option value="detective">🕵️ Детектив</option>
                <option value="romantic">❤️ Романтик</option>
                <option value="city">🏙️ Город</option>
                <option value="mystery">🔮 Мистика</option>
                <option value="treasure">🗺️ Искатель клада</option>
                <option value="proposal">💍 Предложение</option>
              </select>
              <div class="adm-tform__hint">Применяется автоматически в редакторе при выборе шаблона</div>
            </div>
            <div class="adm-tform__field">
              <label>Версия плеера по умолчанию</label>
              <select v-model="form.default_player_version" class="adm-tform__select">
                <option value="v1">🎮 Стандартный</option>
                <option value="v2">✨ Иммерсивный</option>
              </select>
            </div>
            <div class="adm-tform__field adm-tform__field--checkbox" style="padding-top:24px;">
              <label class="adm-tform__check-label">
                <input type="checkbox" v-model="form.default_show_intro" />
                <span>Показывать заставку по умолчанию</span>
              </label>
            </div>
          </div>

          <!-- Галерея -->
          <div class="adm-tform__field">
            <label>Галерея изображений</label>
            <div
              class="adm-gallery-drop"
              :class="{ 'adm-gallery-drop--over': galleryDragOver }"
              @click="$refs.galleryInput.click()"
              @dragover.prevent="galleryDragOver = true"
              @dragleave="galleryDragOver = false"
              @drop.prevent="onGalleryDrop"
            >
              <div class="adm-gallery-drop__icon">🖼️</div>
              <div class="adm-gallery-drop__text">Перетащи фото сюда или нажми для выбора</div>
              <div class="adm-gallery-drop__hint">JPG, PNG, WEBP · до 5 МБ каждый · можно несколько сразу</div>
            </div>
            <input ref="galleryInput" type="file" accept="image/jpeg,image/png,image/webp" multiple style="display:none" @change="onGalleryFileChange" />

            <div v-if="galleryUploading" class="adm-gallery-progress">
              <div class="adm-gallery-progress__bar" :style="{ width: galleryUploadProgress + '%' }"></div>
              <span>Загрузка {{ galleryUploadProgress }}%...</span>
            </div>

            <div v-if="form.gallery.length" class="adm-gallery-grid">
              <div
                v-for="(img, idx) in form.gallery"
                :key="img.url"
                class="adm-gallery-item"
                :class="{ 'adm-gallery-item--cover': img.url === form.cover_image }"
                draggable="true"
                @dragstart="galleryDragStart(idx)"
                @dragover.prevent
                @drop.prevent="galleryDragReorder(idx)"
              >
                <img :src="imgSrc(img.url)" class="adm-gallery-item__img" @error="onImgError" />
                <div class="adm-gallery-item__overlay">
                  <button class="adm-gallery-item__btn" :class="{ active: img.url === form.cover_image }" title="Сделать обложкой" @click.stop="form.cover_image = img.url">⭐</button>
                  <button class="adm-gallery-item__btn adm-gallery-item__btn--del" title="Удалить" @click.stop="removeGalleryItem(idx)">✕</button>
                </div>
                <div v-if="img.url === form.cover_image" class="adm-gallery-item__cover-badge">Обложка</div>
              </div>
            </div>
            <div v-if="form.gallery.length" class="adm-tform__hint">⭐ — установить как обложку · ✕ — удалить · перетащи для сортировки</div>
          </div>
        </div>

        <div v-if="error" class="adm-tform__error">{{ error }}</div>

        <div v-if="validationError" class="adm-tform__error">{{ validationError }}</div>

        <div class="adm-modal__actions" style="justify-content:space-between;">
          <button v-if="editingTemplate" class="adm-btn adm-btn--danger" @click="$emit('delete', editingTemplate)">🗑 Удалить</button>
          <div style="display:flex;gap:8px;margin-left:auto;">
            <button class="adm-btn" style="background:rgba(255,255,255,.06);color:#aaa;" @click="$emit('close')">Отмена</button>
            <button class="adm-btn adm-btn--primary" :disabled="saving" @click="handleSave">
              {{ saving ? 'Сохраняем...' : (editingTemplate ? 'Сохранить' : 'Создать') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show:            { type: Boolean, default: false },
  editingTemplate: { type: Object,  default: null },
  categories:      { type: Array,   default: () => [] },
  tags:            { type: Array,   default: () => [] },
  quests:          { type: Array,   default: () => [] },
  saving:          { type: Boolean, default: false },
  error:           { type: String,  default: '' },
})
const { onImgError } = useImageFallback()
const emit = defineEmits(['close', 'save', 'delete'])

// ── Tag toggling ───────────────────────────────────────────────
const toggleTag = (id) => {
  const idx = form.value.tag_ids.indexOf(id)
  if (idx === -1) form.value.tag_ids.push(id)
  else form.value.tag_ids.splice(idx, 1)
}

// ── Validation ────────────────────────────────────────────────
const validationError = ref('')

const handleSave = () => {
  validationError.value = ''
  if (!form.value) {
    validationError.value = 'Форма не инициализирована, попробуйте закрыть и открыть снова'
    return
  }
  if (!form.value.title?.trim()) {
    validationError.value = 'Укажите название шаблона'
    return
  }
  if (!form.value.description?.trim()) {
    validationError.value = 'Заполните описание шаблона'
    return
  }
  if (!form.value.duration_minutes || form.value.duration_minutes < 10) {
    validationError.value = 'Длительность должна быть не менее 10 минут'
    return
  }
  if (!form.value.is_free && (!form.value.base_price || form.value.base_price <= 0)) {
    validationError.value = 'Укажите цену или отметьте шаблон как бесплатный'
    return
  }
  emit('save', form.value)
}

// ── Form state (живёт внутри модалки) ─────────────────────────
const emptyForm = () => ({
  title: '', tagline: '', description: '', quick_view_description: '',
  category_id: null, difficulty: 'medium',
  duration_minutes: 60, location_type: 'universal',
  min_locations: null, max_locations: null, demo_video_url: '',
  base_price: 0, is_free: false, is_premium: false,
  featuresText: '', cover_image: '', gallery: [],
  tag_ids: [], demo_quest_id: null, status: 'draft',
  default_theme: 'detective', default_player_version: 'v1', default_show_intro: true
})


const form = ref(emptyForm())

watch(() => props.editingTemplate, (t) => {
  if (!props.show) return
  validationError.value = ''
  if (t) {
    const featuresArr = Array.isArray(t.features) ? t.features : JSON.parse(t.features || '[]')
    const galleryRaw  = Array.isArray(t.gallery)  ? t.gallery  : JSON.parse(t.gallery  || '[]')
    const galleryArr  = galleryRaw.map(item =>
      typeof item === 'string' ? { url: item } : { url: item?.url || '' }
    ).filter(i => i.url)
    form.value = {
      title:            t.title            || '',
      tagline:          t.tagline          || '',
      description:      t.description      || '',
      quick_view_description: t.quick_view_description || '',
      category_id:      t.category_id      || null,
      difficulty:       t.difficulty       || 'medium',
      duration_minutes: t.duration_minutes || 60,
      location_type:    t.location_type    || 'universal',
      min_locations:    t.min_locations    || null,
      max_locations:    t.max_locations    || null,
      demo_video_url:   t.demo_video_url   || '',
      base_price:       t.is_free ? 0 : Math.round(Number(t.base_price) / 100),
      is_free:          t.is_free          || false,
      is_premium:       t.is_premium       || false,
      featuresText:     featuresArr.join('\n'),
      cover_image:      t.cover_image      || galleryArr[0]?.url || '',
      gallery:          galleryArr,
      status:           t.status           || 'draft',
      demo_quest_id:    t.demo_quest_id    || null,
      tag_ids:          Array.isArray(t.tags) ? t.tags.map(tg => tg.id) : [],
      default_theme:          t.default_theme          || 'detective',
      default_player_version: t.default_player_version || 'v1',
      default_show_intro:     t.default_show_intro !== undefined ? t.default_show_intro : true,
    }
  } else {
    form.value = emptyForm()
  }
}, { deep: false })

watch(() => props.show, (show) => {
  if (!show) { validationError.value = ''; return }
  if (!props.editingTemplate) form.value = emptyForm()
})

// ── Gallery ────────────────────────────────────────────────────
const galleryDragOver       = ref(false)
const galleryUploading      = ref(false)
const galleryUploadProgress = ref(0)
let   galleryDragSrcIdx     = -1

const API_BASE = useRuntimeConfig().public.apiBase.replace('/api', '')
const imgSrc   = (url) => (!url ? '' : url.startsWith('http') ? url : API_BASE + url)

const uploadFiles = async (files) => {
  if (!files.length) return
  galleryUploading.value = true
  galleryUploadProgress.value = 0
  try {
    const formData = new FormData()
    Array.from(files).forEach(f => formData.append('images', f))
    const timer = setInterval(() => {
      if (galleryUploadProgress.value < 85) galleryUploadProgress.value += 15
    }, 200)
    const token = useCookie('auth_token')
    const config = useRuntimeConfig()
    const baseURL = import.meta.server ? config.apiBaseInternal : config.public.apiBase
    const res = await $fetch(`${baseURL}/admin/upload/images`, {
      method: 'POST',
      body: formData,
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    })
    clearInterval(timer)
    galleryUploadProgress.value = 100
    const urls     = Array.isArray(res.data) ? res.data : (res.data ? [res.data.url] : [])
    const newItems = urls.map(url => ({ url }))
    form.value.gallery.push(...newItems)
    if (!form.value.cover_image && newItems.length) form.value.cover_image = newItems[0].url
  } catch {
    // silent
  } finally {
    galleryUploading.value = false
    setTimeout(() => { galleryUploadProgress.value = 0 }, 600)
  }
}

const onGalleryFileChange = (e) => {
  const files = Array.from(e.target.files || []).filter(f =>
    ['image/jpeg','image/png','image/webp'].includes(f.type) && f.size <= 5 * 1024 * 1024
  )
  if (files.length) uploadFiles(files)
  e.target.value = ''
}

const onGalleryDrop = (e) => {
  galleryDragOver.value = false
  const files = Array.from(e.dataTransfer.files || []).filter(f =>
    ['image/jpeg','image/png','image/webp'].includes(f.type) && f.size <= 5 * 1024 * 1024
  )
  if (files.length) uploadFiles(files)
}

const removeGalleryItem = (idx) => {
  const removed = form.value.gallery.splice(idx, 1)[0]
  if (form.value.cover_image === removed.url) {
    form.value.cover_image = form.value.gallery[0]?.url || ''
  }
}

const galleryDragStart   = (idx) => { galleryDragSrcIdx = idx }
const galleryDragReorder = (targetIdx) => {
  if (galleryDragSrcIdx === -1 || galleryDragSrcIdx === targetIdx) return
  const arr    = form.value.gallery
  const [moved] = arr.splice(galleryDragSrcIdx, 1)
  arr.splice(targetIdx, 0, moved)
  galleryDragSrcIdx = -1
}
</script>

<style scoped>
.adm-tform { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
.adm-tform__row { display: grid; gap: 12px; }
.adm-tform__row--2 { grid-template-columns: 1fr 1fr; }
.adm-tform__row--3 { grid-template-columns: 1fr 1fr 1fr; }
.adm-tform__row--4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
.adm-tform__field { display: flex; flex-direction: column; gap: 6px; }
.adm-tform__field--span2 { grid-column: 1 / -1; }
.adm-tform__field--checkbox { flex-direction: row; align-items: center; gap: 16px; padding-top: 24px; }
.adm-tform__field label:not(.adm-tform__check-label) {
  font-size: 0.72rem; font-weight: 700; color: #718096;
  text-transform: uppercase; letter-spacing: 0.06em;
}
.adm-tform__req { color: #fc8181; }
.adm-tform__input, .adm-tform__textarea, .adm-tform__select {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; padding: 9px 12px; color: #fff; font-size: 0.88rem;
  transition: border-color 0.2s; font-family: inherit;
}
.adm-tform__input:focus, .adm-tform__textarea:focus, .adm-tform__select:focus {
  outline: none; border-color: #667eea;
}
.adm-tform__input:disabled { opacity: 0.4; cursor: not-allowed; }
.adm-tform__select option { background: #1a1f2e; }
.adm-tform__textarea { resize: vertical; min-height: 72px; }
.adm-tform__hint { font-size: 0.72rem; color: #4a5568; }
.adm-tform__check-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 0.88rem; color: #c8d6ef; cursor: pointer;
}
.adm-tform__check-label input { accent-color: #667eea; }
.adm-tform__error {
  background: rgba(245,101,101,0.1); border: 1px solid rgba(245,101,101,0.3);
  border-radius: 8px; padding: 10px 14px; color: #fc8181;
  font-size: 0.85rem; margin-bottom: 16px;
}

/* Tag picker */
.adm-tags-picker { display: flex; flex-wrap: wrap; gap: 6px; }
.adm-tag-btn {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px; padding: 4px 12px; color: #718096;
  font-size: 0.8rem; cursor: pointer; transition: all 0.15s;
}
.adm-tag-btn:hover { border-color: rgba(255,255,255,0.2); color: #fff; }
.adm-tag-btn.active { background: rgba(102,126,234,0.2); border-color: #667eea; color: #667eea; }

/* Phases editor */
.adm-phases { display: flex; flex-direction: column; gap: 10px; }
.adm-phase {
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px;
  background: rgba(255,255,255,0.02);
}
.adm-phase__head { display: flex; align-items: center; gap: 8px; }
.adm-phase__num {
  width: 24px; height: 24px; flex-shrink: 0;
  background: rgba(102,126,234,0.3); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; color: #667eea;
}
.adm-phase__title { flex: 1; }
.adm-tform__hint-inline { font-size: 0.72rem; color: #4a5568; font-weight: 400; text-transform: none; letter-spacing: 0; }
.adm-gallery-drop {
  border: 2px dashed rgba(255,255,255,0.12);
  border-radius: 10px; padding: 28px 20px; text-align: center;
  cursor: pointer; transition: border-color 0.2s, background 0.2s;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.adm-gallery-drop:hover,
.adm-gallery-drop--over { border-color: #667eea; background: rgba(102,126,234,0.06); }
.adm-gallery-drop__icon { font-size: 2rem; line-height: 1; }
.adm-gallery-drop__text { color: #c8d6ef; font-size: 0.88rem; font-weight: 500; }
.adm-gallery-drop__hint { color: #4a5568; font-size: 0.75rem; }

.adm-gallery-progress {
  margin-top: 8px; background: rgba(255,255,255,0.05);
  border-radius: 6px; height: 28px; position: relative;
  overflow: hidden; display: flex; align-items: center; justify-content: center;
}
.adm-gallery-progress__bar {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: rgba(102,126,234,0.35); transition: width 0.2s;
}
.adm-gallery-progress span { position: relative; z-index: 1; font-size: 0.78rem; color: #a0aec0; }

.adm-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px; margin-top: 12px;
}
.adm-gallery-item {
  position: relative; border-radius: 8px; overflow: hidden;
  aspect-ratio: 4/3; border: 2px solid transparent;
  cursor: grab; transition: border-color 0.15s, transform 0.15s;
}
.adm-gallery-item:hover { transform: scale(1.02); }
.adm-gallery-item--cover { border-color: #f6ad55; }
.adm-gallery-item__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.adm-gallery-item__overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.55);
  opacity: 0; transition: opacity 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.adm-gallery-item:hover .adm-gallery-item__overlay { opacity: 1; }
.adm-gallery-item__btn {
  background: rgba(255,255,255,0.15); border: none; border-radius: 6px;
  width: 30px; height: 30px; font-size: 0.85rem; cursor: pointer; color: #fff;
  display: flex; align-items: center; justify-content: center; transition: background 0.15s;
}
.adm-gallery-item__btn:hover { background: rgba(255,255,255,0.3); }
.adm-gallery-item__btn.active { background: rgba(246,173,85,0.6); }
.adm-gallery-item__btn--del:hover { background: rgba(245,101,101,0.5); }
.adm-gallery-item__cover-badge {
  position: absolute; bottom: 4px; left: 0; right: 0; text-align: center;
  font-size: 0.62rem; font-weight: 700; color: #f6ad55;
  text-transform: uppercase; letter-spacing: 0.06em;
  background: rgba(0,0,0,0.6); padding: 2px 0;
}

@media (max-width: 900px) {
  .adm-tform__row--4 { grid-template-columns: 1fr 1fr; }
  .adm-tform__row--3 { grid-template-columns: 1fr 1fr; }
  .adm-tform__row--2 { grid-template-columns: 1fr; }
}
</style>