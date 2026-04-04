<!-- Левая колонка: основные данные, тема, заставка, шаблон -->
<template>
  <aside class="qe-meta">
    <div class="qe-section">
      <div class="qe-section__title">Основные данные</div>

      <div class="qe-field">
        <label>Имя клиента <span class="req">*</span></label>
        <input :value="form.client_name"
          @input="e => { form.client_name = e.target.value; $emit('auto-slug') }"
          placeholder="Лиза" />
      </div>

      <div class="qe-field">
        <label>Название квеста <span class="req">*</span></label>
        <input v-model="form.title" placeholder="Дело о пропавшем подарке" />
      </div>

      <div class="qe-field">
        <label>Slug (URL) <span class="req">*</span></label>
        <div class="qe-slug-row">
          <span class="qe-slug-prefix">/quest/</span>
          <input v-model="form.slug" placeholder="liza-ivan-2024" class="qe-slug-input" />
        </div>
        <div v-if="form.slug" class="qe-slug-link" @click="copySlugUrl" title="Нажми чтобы скопировать">
          <span v-if="slugCopied">✓ Скопировано!</span>
          <span v-else>{{ origin }}/quest/{{ form.slug }}</span>
        </div>
      </div>

      <!-- Тема -->
      <div class="qe-field">
        <label>Тема оформления</label>
        <div class="qe-themes">
          <button
            v-for="t in THEMES" :key="t.id"
            class="qe-theme-btn" :class="{ active: form.theme === t.id }"
            @click="form.theme = t.id"
          >
            <span>{{ t.icon }}</span><span>{{ t.label }}</span>
          </button>
        </div>
      </div>

      <!-- Заставка -->
      <div class="qe-field">
        <label>Заставка при запуске</label>
        <div class="qe-intro-options">
          <button class="qe-intro-opt" :class="{ active: !form.show_intro }"
            @click="form.show_intro = false">
            <span class="qe-intro-opt__icon">⏭️</span>
            <span class="qe-intro-opt__label">Без заставки</span>
            <span class="qe-intro-opt__sub">Сразу сплэш-экран</span>
          </button>
          <button class="qe-intro-opt" :class="{ active: form.show_intro }"
            @click="form.show_intro = true">
            <span class="qe-intro-opt__icon">{{ introMeta.icon }}</span>
            <span class="qe-intro-opt__label">С заставкой</span>
            <span class="qe-intro-opt__sub">{{ introMeta.desc }}</span>
          </button>
        </div>
        <div v-if="form.show_intro" class="qe-intro-preview">
          <div class="qe-intro-preview__badge">{{ introMeta.icon }} {{ introMeta.desc }}</div>
          <div class="qe-hint">~3 секунды, клиент может пропустить тапом</div>
        </div>
      </div>

      <!-- Версия плеера -->
      <div class="qe-field">
        <label>Версия плеера</label>
        <div class="qe-intro-options">
          <button class="qe-intro-opt" :class="{ active: form.player_version !== 'v2' }"
            @click="form.player_version = 'v1'">
            <span class="qe-intro-opt__icon">🎮</span>
            <span class="qe-intro-opt__label">Стандартный</span>
            <span class="qe-intro-opt__sub">Классический интерфейс</span>
          </button>
          <button class="qe-intro-opt" :class="{ active: form.player_version === 'v2' }"
            @click="form.player_version = 'v2'">
            <span class="qe-intro-opt__icon">✨</span>
            <span class="qe-intro-opt__label">Иммерсивный</span>
            <span class="qe-intro-opt__sub">Анимированный фон, полный экран</span>
          </button>
        </div>
      </div>

      <!-- Код доступа -->
      <div class="qe-field">
        <label>Код доступа</label>
        <input v-model="form.access_code" placeholder="Необязательно" />
        <div class="qe-hint">Если заполнен — клиент вводит его перед стартом</div>
      </div>

      <!-- Финальное послание -->
      <div class="qe-field">
        <label>Финальное послание</label>
        <textarea v-model="form.final_message"
          placeholder="Лиза, ты — лучшее, что случилось в моей жизни ❤️"
          rows="4"></textarea>
        <div class="qe-hint">Показывается на экране завершения</div>
      </div>
    </div>

    <!-- Шаблон -->
    <div class="qe-section">
      <div class="qe-section__title">Шаблон</div>
      <select :value="selectedTemplate" class="qe-select"
        @change="e => $emit('load-template', e.target.value)">
        <option value="">— Начать с нуля —</option>
        <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.title }}</option>
      </select>
      <div v-if="selectedTemplate" class="qe-hint">
        Блоки шаблона загружены. Можно редактировать.
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  form:             { type: Object, required: true },
  templates:        { type: Array,  default: () => [] },
  selectedTemplate: { type: [String, Object], default: '' },
  origin:           { type: String, default: '' },
})
defineEmits(['auto-slug', 'load-template'])

const slugCopied = ref(false)
const copySlugUrl = () => {
  const url = `${props.origin}/quest/${props.form.slug}`
  navigator.clipboard.writeText(url).then(() => {
    slugCopied.value = true
    setTimeout(() => { slugCopied.value = false }, 2000)
  })
}

const THEMES = [
  { id: 'detective', icon: '🕵️', label: 'Детектив' },
  { id: 'romantic',  icon: '❤️',  label: 'Романтик' },
  { id: 'city',      icon: '🏙️', label: 'Город' },
  { id: 'mystery',   icon: '🔮',  label: 'Мистика' },
  { id: 'treasure',  icon: '🗺️', label: 'Искатель клада' },
  { id: 'proposal',  icon: '💍',  label: 'Предложение' },
]
const INTRO_META = {
  detective: { icon: '🌧️', desc: 'Дождь + секретное досье' },
  romantic:  { icon: '💗', desc: 'Сердце + имя клиента' },
  mystery:   { icon: '🌌', desc: 'Звёзды + северное сияние' },
  city:      { icon: '💻', desc: 'Матрица + загрузка системы' },
  treasure:  { icon: '💰', desc: 'Золотые частицы + карта' },
  proposal:  { icon: '💍', desc: 'Золотые кольца + искры' },
}
const introMeta = computed(() => INTRO_META[props.form.theme] || { icon: '✨', desc: 'Анимированная заставка' })
</script>
