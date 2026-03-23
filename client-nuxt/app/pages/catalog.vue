<template>
  <div class="cat">

    <!-- ── Шапка ── -->
    <section class="cat__head">
      <div class="cat__container">
        <h1 class="cat__title">Свидания-квесты</h1>
        <p class="cat__sub">Выберите сценарий — Лиза адаптирует под вас</p>
      </div>
    </section>

    <div class="cat__container">

      <!-- ── Поводы ── -->
      <OccasionFilters :reset-key="occasionResetKey" @filter="handleOccasionFilter" />

      <!-- ── Выбор Лизы ── -->
      <LizaPick :template="lizaPickTemplate" />

      <!-- ── Тулбар ── -->
      <div class="cat__toolbar">
        <div class="cat__count">
          <span v-if="pending">Загружаем...</span>
          <span v-else>
            {{ allDates.length ? `${allDates.length} ${pluralQuests(allDates.length)}` : 'Нет квестов' }}
          </span>

        </div>
        <div class="cat__toolbar-right">
          <select v-model="sortBy" @change="handleSortChange" class="cat__sort">
            <option value="newest">Новые</option>
            <option value="rating">По рейтингу</option>
            <option value="orders">Популярные</option>
            <option value="price">По цене</option>
          </select>
          <button class="cat__filter-btn" @click="sheetOpen = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
            </svg>
            Фильтры
            <span v-if="activeFiltersCount" class="cat__filter-badge">{{ activeFiltersCount }}</span>
          </button>
        </div>
      </div>

      <!-- ── Активные фильтры ── -->
      <div v-if="hasActiveFilters" class="cat__chips">
        <div v-if="filters.difficulty" class="cat__chip">
          {{ difficultyLabel(filters.difficulty) }}
          <button @click="removeFilter('difficulty')">×</button>
        </div>
        <div v-if="filters.locationType" class="cat__chip">
          {{ locationLabel(filters.locationType) }}
          <button @click="removeFilter('locationType')">×</button>
        </div>
        <div v-if="filters.duration" class="cat__chip">
          {{ durationLabel(filters.duration) }}
          <button @click="removeFilter('duration')">×</button>
        </div>
        <div v-if="filters.category" class="cat__chip">
          {{ getCategoryName(filters.category) }}
          <button @click="removeFilter('category')">×</button>
        </div>
        <div v-for="tagId in filters.tags" :key="tagId" class="cat__chip">
          {{ getTagName(tagId) }}
          <button @click="removeSingleTag(tagId)">×</button>
        </div>
        <button class="cat__chip cat__chip--reset" @click="handleFiltersReset">
          Сбросить все
        </button>
      </div>

      <!-- ── Карточки ── -->
      <div v-if="pending && visibleDates.length === 0" class="cat__loading">
        <Loader text="Загружаем квесты..." />
      </div>

      <div v-else-if="filteredDates.length === 0" class="cat__empty">
        <div class="cat__empty-icon">🔍</div>
        <h3>Квесты не найдены</h3>
        <p>Попробуйте изменить фильтры</p>
        <button @click="handleFiltersReset" class="cat__empty-btn">Сбросить фильтры</button>
      </div>

      <div v-else>
        <div class="cat__grid">
          <TemplateCard
            v-for="t in visibleDates"
            :key="t.id"
            :template="t"
            @quickView="openQuickView(t)"
          />
        </div>

        <!-- Загрузить ещё -->
        <div v-if="hasMore" class="cat__more">
          <button class="cat__more-btn" @click="loadMore" :disabled="pending">
            <span v-if="pending">Загружаем...</span>
            <span v-else>Показать ещё {{ Math.min(pageSize, filteredDates.length - visibleCount) }} {{ pluralQuests(Math.min(pageSize, filteredDates.length - visibleCount)) }}</span>
          </button>
          <p class="cat__more-hint">Показано {{ visibleCount }} из {{ filteredDates.length }}</p>
        </div>
      </div>

    </div>

    <!-- ── Bottom Sheet фильтры ── -->
    <Teleport to="body">
      <transition name="sheet-fade">
        <div v-if="sheetOpen" class="sheet-overlay" @click.self="sheetOpen = false">
          <div class="sheet">
            <div class="sheet__handle"></div>
            <div class="sheet__head">
              <h3 class="sheet__title">Фильтры</h3>
              <button class="sheet__close" @click="sheetOpen = false">×</button>
            </div>
            <div class="sheet__body">

              <!-- Сложность -->
              <div class="sheet__section">
                <p class="sheet__label">Сложность</p>
                <div class="sheet__pills">
                  <button
                    v-for="d in DIFFICULTIES"
                    :key="d.value"
                    class="sheet__pill"
                    :class="{ 'sheet__pill--active': filters.difficulty === d.value }"
                    @click="toggleFilter('difficulty', d.value)"
                  >{{ d.label }}</button>
                </div>
              </div>

              <!-- Место -->
              <div class="sheet__section">
                <p class="sheet__label">Где проходит</p>
                <div class="sheet__pills">
                  <button
                    v-for="l in LOCATIONS"
                    :key="l.value"
                    class="sheet__pill"
                    :class="{ 'sheet__pill--active': filters.locationType === l.value }"
                    @click="toggleFilter('locationType', l.value)"
                  >{{ l.label }}</button>
                </div>
              </div>

              <!-- Длительность -->
              <div class="sheet__section">
                <p class="sheet__label">Длительность</p>
                <div class="sheet__pills">
                  <button
                    v-for="d in DURATIONS"
                    :key="d.value"
                    class="sheet__pill"
                    :class="{ 'sheet__pill--active': filters.duration === d.value }"
                    @click="toggleFilter('duration', d.value)"
                  >{{ d.label }}</button>
                </div>
              </div>

              <!-- Категории -->
              <div class="sheet__section">
                <p class="sheet__label">Категория</p>
                <div class="sheet__pills">
                  <button
                    v-for="c in categories"
                    :key="c.id"
                    class="sheet__pill"
                    :class="{ 'sheet__pill--active': filters.category === c.id }"
                    @click="toggleFilter('category', c.id)"
                  >{{ c.name }}</button>
                </div>
              </div>

              <!-- Теги -->
              <div class="sheet__section">
                <p class="sheet__label">Теги</p>
                <div class="sheet__pills">
                  <button
                    v-for="tag in popularTags"
                    :key="tag.id"
                    class="sheet__pill"
                    :class="{ 'sheet__pill--active': filters.tags.includes(tag.id) }"
                    @click="toggleTag(tag.id)"
                  >{{ tag.name }}</button>
                </div>
              </div>

            </div>
            <div class="sheet__foot">
              <button class="sheet__reset" @click="handleFiltersReset">Сбросить</button>
              <button class="sheet__apply" @click="sheetOpen = false">
                Показать {{ filteredDates.length }} квестов
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ── Quick View ── -->
    <QuickViewModal
      :template="quickViewTemplate"
      :is-open="showQuickView"
      @close="showQuickView = false"
    />

    <!-- ── Sticky CTA ── -->
    <StickyCTA />

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const route  = useRoute()
const router = useRouter()
const { getDates, getCategories, getPopularTags } = useDatesApi()

useSeoMeta({
  title:       'Свидания-квесты — сценарии для пар | Quest Dating',
  description: 'Выберите сценарий свидания-квеста — Лиза Петри адаптирует его персонально под вас. Романтические квесты для пар от 499 руб.',
})

const {
  filters, activeFiltersCount, hasActiveFilters, getApiParams,
  resetFilters, resetFilter
} = useFilters()

const sortBy    = ref(route.query.sort_by || 'newest')
const occasionResetKey = ref(0)  // инкремент = сигнал сброса
// Фильтры установленные через поводы — не показываем как chips, не считаем в счётчике
const occasionFilters = ref({ locationType: null, difficulty: null, category: null })
const sheetOpen = ref(false)
const pageSize  = 6
const visibleCount = ref(pageSize)

const showQuickView     = ref(false)
const quickViewTemplate = ref(null)
const openQuickView = (t) => { quickViewTemplate.value = t; showQuickView.value = true }

// Данные
const { data: datesData, pending, refresh: refreshDates } = await useAsyncData(
  'catalog-dates',
  () => getDates({
    ...getApiParams.value,
    ...(occasionFilters.value.locationType ? { location_type: occasionFilters.value.locationType } : {}),
    ...(occasionFilters.value.difficulty   ? { difficulty:    occasionFilters.value.difficulty }   : {}),
    ...(occasionFilters.value.category     ? { category:      occasionFilters.value.category }     : {}),
  })
)
const { data: categoriesData } = await useAsyncData('catalog-categories', () => getCategories(), {
  getCachedData(key, nuxtApp) {
    const cached = nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    if (!cached) return undefined
    return (Date.now() - (cached._ts ?? 0)) < 10 * 60 * 1000 ? cached : undefined
  }
})
const { data: tagsData }       = await useAsyncData('catalog-tags', () => getPopularTags())

watch(filters, () => {
  visibleCount.value = pageSize
  refreshDates()
}, { deep: true })

const allDates    = computed(() => datesData.value?.data || datesData.value || [])
const categories  = computed(() => categoriesData.value?.data || categoriesData.value || [])
const popularTags = computed(() => tagsData.value?.data || tagsData.value || [])

const filteredDates = computed(() => {
  let list = [...allDates.value]
  switch (sortBy.value) {
    case 'rating':  list.sort((a, b) => (b.rating || 0)       - (a.rating || 0)); break
    case 'orders':  list.sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0)); break
    case 'price':   list.sort((a, b) => (a.base_price || 0)   - (b.base_price || 0)); break
    default:        list.sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at))
  }
  return list
})

const visibleDates = computed(() => filteredDates.value.slice(0, visibleCount.value))
const hasMore      = computed(() => visibleCount.value < filteredDates.value.length)

const loadMore = () => { visibleCount.value += pageSize }

// Якорный квест
const lizaPickTemplate = computed(() =>
  allDates.value.find(t => t.rating >= 4.5) || allDates.value[0] || null
)

// Справочники
const DIFFICULTIES = [
  { value: 'easy',   label: '😊 Лёгкий' },
  { value: 'medium', label: '🧠 Средний' },
  { value: 'hard',   label: '🔥 Сложный' },
]
const LOCATIONS = [
  { value: 'indoor',    label: '🏠 Дома' },
  { value: 'city',      label: '🏙 По городу' },
  { value: 'park',      label: '🌳 Парк' },
  { value: 'universal', label: '🌍 Любое' },
]
const DURATIONS = [
  { value: '0-60',   label: 'До 1 часа' },
  { value: '60-120', label: '1–2 часа' },
  { value: '120+',   label: '2+ часа' },
]

// Хелперы
const difficultyLabel = (v) => ({ easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный', expert: 'Эксперт' }[v] || v)
const locationLabel   = (v) => ({ indoor: 'Дома', city: 'По городу', park: 'Парк', universal: 'Любое' }[v] || v)
const durationLabel   = (v) => ({ '0-60': 'До 1 ч', '60-120': '1–2 ч', '120+': '2+ ч' }[v] || v)
const getCategoryName = (id) => categories.value.find(c => c.id === id || c.id === Number(id))?.name || `#${id}`
const getTagName      = (id) => popularTags.value.find(t => t.id === id || t.id === Number(id))?.name || `#${id}`

const toggleTag = (id) => {
  const idx = filters.value.tags.indexOf(id)
  if (idx > -1) filters.value.tags.splice(idx, 1)
  else filters.value.tags.push(id)
}

const toggleFilter = (key, value) => {
  filters.value[key] = filters.value[key] === value ? null : value
}
const removeFilter    = (key) => { filters.value[key] = null }
const removeSingleTag = (id)  => { filters.value.tags = filters.value.tags.filter(t => t !== id) }

const handleFiltersReset = () => {
  resetFilters()
  sortBy.value = 'newest'
  visibleCount.value = pageSize
  sheetOpen.value = false
  occasionFilters.value = { locationType: null, difficulty: null, category: null }
  occasionResetKey.value++  // сигнализируем OccasionFilters о сбросе
}

function pluralQuests(n) {
  const mod10  = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return 'квестов'
  if (mod10 === 1) return 'квест'
  if (mod10 >= 2 && mod10 <= 4) return 'квеста'
  return 'квестов'
}

const handleSortChange = () => {
  filters.value.sortBy = sortBy.value
  visibleCount.value = pageSize
}

const handleOccasionFilter = (f) => {
  const isReset = !f.locationType && !f.difficulty && !f.duration && !f.tag && !f.category
  // Сохраняем в отдельный объект — не попадает в activeFiltersCount
  occasionFilters.value = {
    locationType: isReset ? null : (f.locationType || null),
    difficulty:   isReset ? null : (f.difficulty   || null),
    category:     isReset ? null : (f.category     || null),
  }
  visibleCount.value = pageSize
  refreshDates()
}

// Блокируем скролл при открытом sheet
watch(sheetOpen, (open) => {
  if (import.meta.client) {
    document.body.style.overflow = open ? 'hidden' : ''
  }
})
</script>

<style scoped>
.cat { background: #0a0a0f; min-height: 100vh; color: #f0ede8; padding-bottom: 100px; }
.cat__container { max-width: 600px; margin: 0 auto; padding: 0 16px; }
@media (min-width: 768px) { .cat__container { max-width: 900px; padding: 0 24px; } }
@media (min-width: 1200px) { .cat__container { max-width: 1100px; } }

/* Head */
.cat__head {
  background: linear-gradient(to bottom, #111118, #0a0a0f);
  padding: 32px 0 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 20px;
}
.cat__title {
  font-size: clamp(1.5rem, 6vw, 2.2rem); font-weight: 900;
  margin: 0 0 6px; letter-spacing: -0.02em;
}
.cat__sub { font-size: 0.9rem; color: rgba(240,237,232,0.45); margin: 0; }

/* Toolbar */
.cat__toolbar {
  display: flex; align-items: center; justify-content: space-between;
  margin: 16px 0 12px; gap: 10px;
}
.cat__count { font-size: 0.85rem; color: rgba(240,237,232,0.45); }
.cat__toolbar-right { display: flex; align-items: center; gap: 8px; }

.cat__sort {
  padding: 7px 10px; font-size: 0.82rem;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; color: #f0ede8; cursor: pointer;
}
.cat__sort option { background: #1a1a24; }

.cat__filter-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 10px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  color: #f0ede8; font-size: 0.82rem; font-weight: 600; cursor: pointer;
  -webkit-tap-highlight-color: transparent; transition: border-color 0.2s;
}
.cat__filter-btn:hover { border-color: #d4af37; }
.cat__filter-badge {
  background: #d4af37; color: #0a0a0f;
  font-size: 10px; font-weight: 800; padding: 1px 5px; border-radius: 100px;
}

/* Chips */
.cat__chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.cat__chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px; border-radius: 100px; font-size: 0.78rem; font-weight: 600;
  background: rgba(212,175,55,0.1); border: 1px solid rgba(212,175,55,0.25);
  color: #d4af37;
}
.cat__chip button {
  background: none; border: none; color: inherit; cursor: pointer;
  font-size: 14px; line-height: 1; padding: 0; opacity: 0.7;
}
.cat__chip--reset {
  background: transparent; border-color: rgba(239,68,68,0.3); color: #f87171; cursor: pointer;
}

/* Grid */
.cat__grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
  margin-bottom: 20px; align-items: start;
}
@media (min-width: 640px)  { .cat__grid { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
@media (min-width: 1024px) { .cat__grid { grid-template-columns: repeat(4, 1fr); gap: 18px; } }

/* Load more */
.cat__more { text-align: center; padding: 8px 0 16px; }
.cat__more-btn {
  padding: 14px 32px; border-radius: 100px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12);
  color: #f0ede8; font-weight: 700; font-size: 0.95rem; cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  -webkit-tap-highlight-color: transparent; width: 100%; max-width: 320px;
}
.cat__more-btn:hover { border-color: #d4af37; background: rgba(212,175,55,0.06); }
.cat__more-btn:disabled { opacity: 0.5; cursor: default; }
.cat__more-hint { font-size: 0.78rem; color: rgba(240,237,232,0.3); margin: 8px 0 0; }

/* States */
.cat__loading { padding: 60px 0; text-align: center; }
.cat__empty { text-align: center; padding: 60px 20px; }
.cat__empty-icon { font-size: 3rem; opacity: 0.3; margin-bottom: 16px; }
.cat__empty h3 { font-size: 1.2rem; font-weight: 700; color: #f0ede8; margin: 0 0 8px; }
.cat__empty p { color: rgba(240,237,232,0.4); margin: 0 0 20px; font-size: 0.9rem; }
.cat__empty-btn {
  padding: 12px 28px; background: #d4af37; color: #0a0a0f;
  border: none; border-radius: 100px; font-weight: 700; cursor: pointer;
}

/* ── Bottom Sheet ── */
.sheet-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px); z-index: 2000;
  display: flex; align-items: flex-end;
}
.sheet {
  width: 100%; background: #111118;
  border-radius: 24px 24px 0 0;
  max-height: 85svh; display: flex; flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
}
.sheet__handle {
  width: 36px; height: 4px; border-radius: 2px;
  background: rgba(255,255,255,0.15); margin: 12px auto 0;
}
.sheet__head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sheet__title { font-size: 1rem; font-weight: 800; color: #f0ede8; margin: 0; }
.sheet__close {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.08); border: none;
  color: rgba(240,237,232,0.6); font-size: 1.2rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.sheet__body { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 20px; }

.sheet__section {}
.sheet__label {
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: rgba(240,237,232,0.35); margin: 0 0 10px;
}
.sheet__pills { display: flex; flex-wrap: wrap; gap: 6px; }

.sheet__pill {
  padding: 6px 12px; border-radius: 100px; font-size: 0.8rem; font-weight: 600;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(240,237,232,0.65); cursor: pointer; transition: all 0.15s;
  -webkit-tap-highlight-color: transparent; white-space: nowrap;
}
.sheet__pill:hover { border-color: rgba(255,255,255,0.2); color: #f0ede8; }
.sheet__pill--active {
  background: rgba(212,175,55,0.15); border-color: rgba(212,175,55,0.5); color: #d4af37;
}

.sheet__foot {
  display: flex; gap: 10px; padding: 14px 20px;
  border-top: 1px solid rgba(255,255,255,0.06);
}
.sheet__reset {
  flex: 1; padding: 13px; border-radius: 100px;
  background: transparent; border: 1px solid rgba(255,255,255,0.12);
  color: rgba(240,237,232,0.5); font-weight: 700; font-size: 0.9rem; cursor: pointer;
}
.sheet__apply {
  flex: 2; padding: 13px; border-radius: 100px;
  background: #d4af37; border: none; color: #0a0a0f;
  font-weight: 800; font-size: 0.9rem; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

/* Transitions */
.sheet-fade-enter-active, .sheet-fade-leave-active { transition: opacity 0.25s; }
.sheet-fade-enter-from, .sheet-fade-leave-to { opacity: 0; }
.sheet-fade-enter-active .sheet, .sheet-fade-leave-active .sheet { transition: transform 0.25s ease; }
.sheet-fade-enter-from .sheet, .sheet-fade-leave-to .sheet { transform: translateY(100%); }
</style>