<template>
  <div class="adm">
    <!-- Sidebar -->
    <aside class="adm-sidebar">
      <div class="adm-sidebar__logo">🗝️ Admin</div>
      <nav class="adm-nav">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="adm-nav__item"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <span class="adm-nav__icon">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
          <span v-if="tab.id === 'orders' && pendingCount" class="adm-nav__badge">
            {{ pendingCount }}
          </span>
        </button>
      </nav>
      <button class="adm-logout" @click="handleLogout">Выйти</button>
    </aside>

    <!-- Main -->
    <main class="adm-main">

      <!-- ── Дашборд ────────────────────────────── -->
      <section v-if="activeTab === 'dashboard'" class="adm-section">
        <div class="adm-section__head">
          <h1>Дашборд</h1>
        </div>

        <div v-if="statsLoading" class="adm-loading">Загрузка...</div>
        <template v-else>
          <div class="adm-stats">
            <div class="adm-stat">
              <div class="adm-stat__n">{{ Number(stats.pending_orders || 0) + Number(stats.confirmed_orders || 0) }}</div>
              <div class="adm-stat__l">Новых заказов</div>
            </div>
            <div class="adm-stat">
              <div class="adm-stat__n">{{ Number(stats.total_orders || 0) }}</div>
              <div class="adm-stat__l">Всего заказов</div>
            </div>
            <div class="adm-stat">
              <div class="adm-stat__n">{{ Number(stats.total_quests || 0) }}</div>
              <div class="adm-stat__l">Квестов создано</div>
            </div>
            <div class="adm-stat adm-stat--accent">
              <div class="adm-stat__n">{{ formatRub(stats.total_revenue) }}</div>
              <div class="adm-stat__l">Выручка</div>
            </div>
          </div>

          <div class="adm-row">
            <div class="adm-card">
              <div class="adm-card__title">Последние заказы</div>
              <div v-if="!recentOrders.length" class="adm-empty">Заказов пока нет</div>
              <div
                v-for="o in recentOrders"
                :key="o.id"
                class="adm-list-item"
                @click="openOrder(o)"
              >
                <div class="adm-list-item__main">
                  <span class="adm-list-item__name">{{ o.client_name }}</span>
                  <span class="adm-list-item__sub">{{ o.template_title || 'Без шаблона' }}</span>
                </div>
                <div class="adm-list-item__right">
                  <span class="adm-status" :class="`adm-status--${o.status}`">{{ statusLabel(o.status) }}</span>
                  <span class="adm-list-item__date">{{ formatDate(o.created_at) }}</span>
                </div>
              </div>
            </div>

            <div class="adm-card">
              <div class="adm-card__title">Последние квесты</div>
              <div v-if="!recentQuests.length" class="adm-empty">Квестов пока нет</div>
              <div
                v-for="q in recentQuests"
                :key="q.id"
                class="adm-list-item"
                @click="editQuest(q.id)"
              >
                <div class="adm-list-item__main">
                  <span class="adm-list-item__name">{{ q.client_name }}</span>
                  <span class="adm-list-item__sub">{{ q.title }}</span>
                </div>
                <div class="adm-list-item__right">
                  <span class="adm-link-btn" @click.stop="copyLink(q.slug)">Копировать ссылку</span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </section>

      <!-- ── Заказы ─────────────────────────────── -->
      <section v-if="activeTab === 'orders'" class="adm-section">
        <div class="adm-section__head">
          <h1>Заказы</h1>
          <div class="adm-search">
            <span class="adm-search__icon">🔍</span>
            <input
              v-model="ordersSearch"
              class="adm-search__input"
              placeholder="Имя, email, телефон, #id..."
              @keyup.esc="ordersSearch = ''"
            />
            <button v-if="ordersSearch" class="adm-search__clear" @click="ordersSearch = ''">✕</button>
          </div>
          <div class="adm-filter">
            <button
              v-for="f in statusFilters"
              :key="f.value"
              class="adm-filter__btn"
              :class="{ active: statusFilter === f.value }"
              @click="statusFilter = f.value"
            >{{ f.label }}<span v-if="f.count" class="adm-filter__count">{{ f.count }}</span></button>
          </div>
        </div>

        <div v-if="ordersLoading" class="adm-loading">Загрузка...</div>
        <div v-else-if="!filteredOrders.length" class="adm-empty-page">Заказов пока нет</div>
        <div v-else class="adm-table-wrap">
          <table class="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Клиент</th>
                <th>Шаблон</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Дата</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="o in filteredOrders"
                :key="o.id"
                class="adm-table__row"
                @click="openOrder(o)"
              >
                <td class="adm-table__id">#{{ o.id }}</td>
                <td>
                  <div class="adm-table__name">{{ o.client_name }}</div>
                  <div class="adm-table__sub">{{ o.client_email }}</div>
                </td>
                <td>{{ o.template_title || '—' }}</td>
                <td class="adm-table__price">{{ formatRub(o.total_price) }}</td>
                <td><span class="adm-status" :class="`adm-status--${o.status}`">{{ statusLabel(o.status) }}</span></td>
                <td class="adm-table__date">{{ formatDate(o.created_at) }}</td>
                <td>
                  <button
                    v-if="o.status === 'pending'"
                    class="adm-btn adm-btn--sm adm-btn--primary"
                    @click.stop="createQuestFromOrder(o)"
                  >✏️ Создать квест</button>
                  <button
                    v-else-if="o.status !== 'cancelled'"
                    class="adm-btn adm-btn--sm adm-btn--warning"
                    @click.stop="o.created_quest_id ? editQuest(o.created_quest_id) : createQuestFromOrder(o)"
                  >🔧 Редактировать</button>
                  <span v-else class="adm-cancelled">Отменён</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </section>

      <!-- ── Квесты ─────────────────────────────── -->
      <section v-if="activeTab === 'quests'" class="adm-section">
        <div class="adm-section__head">
          <h1>Квесты</h1>
          <button class="adm-btn adm-btn--primary" @click="createNewQuest">+ Создать квест</button>
        </div>

        <div v-if="questsLoading" class="adm-loading">Загрузка...</div>
        <div v-else-if="!quests.length" class="adm-empty-page">
          <div class="adm-empty-page__icon">🗺️</div>
          <div class="adm-empty-page__text">Квестов пока нет</div>
          <button class="adm-btn adm-btn--primary" @click="createNewQuest">Создать первый квест</button>
        </div>
        <div v-else class="adm-quests-grid">
          <div
            v-for="q in quests"
            :key="q.id"
            class="adm-quest-card"
          >
            <div class="adm-quest-card__theme" :data-theme="q.theme">
              {{ themeIcon(q.theme) }}
            </div>
            <div class="adm-quest-card__body">
              <div class="adm-quest-card__for">Для {{ q.client_name }}</div>
              <div class="adm-quest-card__title">{{ q.title }}</div>
              <div class="adm-quest-card__meta">
                <span>{{ q.blocks?.length || 0 }} блоков</span>
                <span>·</span>
                <span>{{ q.started_count || 0 }} запусков</span>
              </div>
            </div>
            <div class="adm-quest-card__actions">
              <button class="adm-icon-btn" title="Копировать ссылку" @click="copyLink(q.slug)">🔗</button>
              <button class="adm-icon-btn" title="Открыть квест" @click="openQuest(q.slug)">▶</button>
              <button class="adm-icon-btn" title="Редактировать" @click="editQuest(q.id)">✏️</button>
              <button class="adm-icon-btn adm-icon-btn--danger" title="Удалить" @click="deleteQuest(q)">🗑</button>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Шаблоны ────────────────────────────── -->
      <section v-if="activeTab === 'templates'" class="adm-section">
        <div class="adm-section__head">
          <h1>Шаблоны витрины</h1>
          <div class="adm-search">
            <span class="adm-search__icon">🔍</span>
            <input v-model="templatesSearch" class="adm-search__input" placeholder="Поиск по названию..." @keyup.esc="templatesSearch = ''" />
            <button v-if="templatesSearch" class="adm-search__clear" @click="templatesSearch = ''">✕</button>
          </div>
          <div class="adm-filter">
            <button v-for="f in templateStatusFilters" :key="f.value" class="adm-filter__btn" :class="{ active: templateStatusFilter === f.value }" @click="templateStatusFilter = f.value">
              {{ f.label }}<span v-if="f.count" class="adm-filter__count">{{ f.count }}</span>
            </button>
          </div>
          <button class="adm-btn adm-btn--primary" @click="openTemplateForm(null)">+ Новый шаблон</button>
        </div>

        <div v-if="templatesLoading" class="adm-loading">Загрузка...</div>
        <div v-else-if="!filteredTemplates.length" class="adm-empty-page">
          <div class="adm-empty-page__icon">📦</div>
          <div class="adm-empty-page__text">Шаблонов пока нет</div>
          <button class="adm-btn adm-btn--primary" @click="openTemplateForm(null)">Создать первый шаблон</button>
        </div>
        <div v-else class="adm-table-wrap">
          <table class="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Название</th>
                <th>Категория</th>
                <th>Сложность</th>
                <th>Длительность</th>
                <th>Цена</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in filteredTemplates" :key="t.id" class="adm-table__row" @click="openTemplateForm(t)">
                <td class="adm-table__id">#{{ t.id }}</td>
                <td>
                  <div class="adm-table__name">{{ t.title }}</div>
                  <div class="adm-table__sub">{{ t.tagline || '—' }}</div>
                </td>
                <td>{{ t.category_name || '—' }}</td>
                <td><span class="adm-difficulty" :class="`adm-difficulty--${t.difficulty}`">{{ difficultyLabel(t.difficulty) }}</span></td>
                <td>{{ t.duration_minutes }} мин</td>
                <td class="adm-table__price">{{ t.is_free ? 'Бесплатно' : formatRub(t.base_price) }}</td>
                <td>
                  <span class="adm-tstatus" :class="`adm-tstatus--${t.status}`">{{ tStatusLabel(t.status) }}</span>
                </td>
                <td @click.stop>
                  <div style="display:flex;gap:4px;">
                    <button class="adm-icon-btn" title="Редактировать" @click="openTemplateForm(t)">✏️</button>
                    <button
                      v-if="t.status !== 'published'"
                      class="adm-icon-btn" title="Опубликовать"
                      @click="quickStatusChange(t, 'published')"
                    >✅</button>
                    <button
                      v-else
                      class="adm-icon-btn" title="Снять с публикации"
                      @click="quickStatusChange(t, 'draft')"
                    >⏸</button>
                    <button class="adm-icon-btn adm-icon-btn--danger" title="Удалить" @click="deleteTemplate(t)">🗑</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>


    </main>

    <!-- Toast -->
    <div v-if="toast" class="adm-toast">{{ toast }}</div>
    <!-- Order detail modal — глобальный, работает со всех вкладок -->
  <teleport to="body">
    <div v-if="selectedOrder" class="adm-modal-overlay" @click.self="selectedOrder = null">
      <div class="adm-modal">
        <button class="adm-modal__close" @click="selectedOrder = null">✕</button>
        <h2 class="adm-modal__title">Заказ #{{ selectedOrder.id }}</h2>
        <div class="adm-modal__grid">
          <div class="adm-modal__field"><label>Клиент</label><span>{{ selectedOrder.client_name }}</span></div>
          <div class="adm-modal__field"><label>Email</label><span>{{ selectedOrder.client_email }}</span></div>
          <div class="adm-modal__field"><label>Телефон</label><span>{{ selectedOrder.client_phone || '—' }}</span></div>
          <div class="adm-modal__field"><label>Сумма</label><span>{{ formatRub(selectedOrder.total_price) }}</span></div>
          <div class="adm-modal__field adm-modal__field--full"><label>Пожелания</label><p>{{ selectedOrder.description || '—' }}</p></div>
        </div>
        <div class="adm-modal__actions">
          <button
            v-if="selectedOrder.status === 'pending'"
            class="adm-btn adm-btn--primary"
            @click="createQuestFromOrder(selectedOrder); selectedOrder = null"
          >✏️ Создать квест →</button>
          <button
            v-else-if="selectedOrder.status !== 'cancelled'"
            class="adm-btn adm-btn--warning"
            @click="selectedOrder.created_quest_id ? (editQuest(selectedOrder.created_quest_id), selectedOrder = null) : (createQuestFromOrder(selectedOrder), selectedOrder = null)"
          >🔧 Редактировать →</button>
          <span v-else class="adm-cancelled">Заказ отменён</span>
        </div>
      </div>
    </div>
  </teleport>
  <!-- Template form modal -->
  <teleport to="body">
    <div v-if="templateModal" class="adm-modal-overlay" @click.self="closeTemplateForm">
      <div class="adm-modal adm-modal--wide">
        <button class="adm-modal__close" @click="closeTemplateForm">✕</button>
        <h2 class="adm-modal__title">{{ editingTemplate ? 'Редактировать шаблон' : 'Новый шаблон' }}</h2>

        <div class="adm-tform">
          <!-- Row 1: title + tagline -->
          <div class="adm-tform__row adm-tform__row--2">
            <div class="adm-tform__field adm-tform__field--span2">
              <label>Название <span class="adm-tform__req">*</span></label>
              <input v-model="tForm.title" placeholder="Городское приключение" class="adm-tform__input" />
            </div>
            <div class="adm-tform__field adm-tform__field--span2">
              <label>Подзаголовок (tagline)</label>
              <input v-model="tForm.tagline" placeholder="Откройте город с новой стороны" class="adm-tform__input" />
            </div>
          </div>

          <!-- Row 2: description -->
          <div class="adm-tform__field">
            <label>Описание</label>
            <textarea v-model="tForm.description" rows="3" placeholder="Полное описание квеста для страницы шаблона..." class="adm-tform__textarea"></textarea>
          </div>

          <!-- Row 3: meta -->
          <div class="adm-tform__row adm-tform__row--4">
            <div class="adm-tform__field">
              <label>Категория</label>
              <select v-model="tForm.category_id" class="adm-tform__select">
                <option :value="null">— Без категории —</option>
                <option v-for="c in adminCategories" :key="c.id" :value="c.id">{{ c.icon }} {{ c.name }}</option>
              </select>
            </div>
            <div class="adm-tform__field">
              <label>Сложность <span class="adm-tform__req">*</span></label>
              <select v-model="tForm.difficulty" class="adm-tform__select">
                <option value="easy">Лёгкий</option>
                <option value="medium">Средний</option>
                <option value="hard">Сложный</option>
                <option value="expert">Эксперт</option>
              </select>
            </div>
            <div class="adm-tform__field">
              <label>Длительность (мин) <span class="adm-tform__req">*</span></label>
              <input v-model.number="tForm.duration_minutes" type="number" min="10" step="15" class="adm-tform__input" />
            </div>
            <div class="adm-tform__field">
              <label>Тип локации</label>
              <select v-model="tForm.location_type" class="adm-tform__select">
                <option value="universal">Универсальный</option>
                <option value="city">Город</option>
                <option value="indoor">В помещении</option>
                <option value="park">Парк/природа</option>
              </select>
            </div>
          </div>

          <!-- Row 4: price -->
          <div class="adm-tform__row adm-tform__row--3">
            <div class="adm-tform__field">
              <label>Цена (₽) <span class="adm-tform__req">*</span></label>
              <input v-model.number="tForm.base_price" type="number" min="0" step="100" class="adm-tform__input" :disabled="tForm.is_free" />
            </div>
            <div class="adm-tform__field adm-tform__field--checkbox">
              <label class="adm-tform__check-label">
                <input type="checkbox" v-model="tForm.is_free" />
                <span>Бесплатный</span>
              </label>
              <label class="adm-tform__check-label">
                <input type="checkbox" v-model="tForm.is_premium" />
                <span>Премиум</span>
              </label>
            </div>
            <div class="adm-tform__field">
              <label>Статус публикации</label>
              <select v-model="tForm.status" class="adm-tform__select">
                <option value="draft">Черновик</option>
                <option value="published">Опубликован</option>
                <option value="archived">Архив</option>
              </select>
            </div>
          </div>

          <!-- Row 5: features -->
          <div class="adm-tform__field">
            <label>Особенности (по одной на строку)</label>
            <textarea
              :value="tForm.featuresText"
              @input="tForm.featuresText = $event.target.value"
              rows="4"
              placeholder="Прогулка по историческому центру&#10;Загадки на основе архитектуры&#10;Финальная локация с видом на реку"
              class="adm-tform__textarea"
            ></textarea>
            <div class="adm-tform__hint">Каждая строка — отдельный пункт на карточке шаблона</div>
          </div>

          <!-- Row 6: gallery -->
          <div class="adm-tform__field">
            <label>Галерея изображений</label>

            <!-- Drop zone -->
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
            <input
              ref="galleryInput"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              style="display:none"
              @change="onGalleryFileChange"
            />

            <!-- Upload progress -->
            <div v-if="galleryUploading" class="adm-gallery-progress">
              <div class="adm-gallery-progress__bar" :style="{ width: galleryUploadProgress + '%' }"></div>
              <span>Загрузка {{ galleryUploadProgress }}%...</span>
            </div>

            <!-- Gallery grid -->
            <div v-if="tForm.gallery.length" class="adm-gallery-grid">
              <div
                v-for="(img, idx) in tForm.gallery"
                :key="img.url"
                class="adm-gallery-item"
                :class="{ 'adm-gallery-item--cover': img.url === tForm.cover_image }"
                draggable="true"
                @dragstart="galleryDragStart(idx)"
                @dragover.prevent
                @drop.prevent="galleryDragReorder(idx)"
              >
                <img :src="imgSrc(img.url)" class="adm-gallery-item__img" @error="e => e.target.src='/placeholder.jpg'" />
                <div class="adm-gallery-item__overlay">
                  <button
                    class="adm-gallery-item__btn"
                    :class="{ active: img.url === tForm.cover_image }"
                    title="Сделать обложкой"
                    @click.stop="setCover(img.url)"
                  >⭐</button>
                  <button
                    class="adm-gallery-item__btn adm-gallery-item__btn--del"
                    title="Удалить"
                    @click.stop="removeGalleryItem(idx)"
                  >✕</button>
                </div>
                <div v-if="img.url === tForm.cover_image" class="adm-gallery-item__cover-badge">Обложка</div>
              </div>
            </div>
            <div v-if="tForm.gallery.length" class="adm-tform__hint">⭐ — установить как обложку · ✕ — удалить · перетащи для сортировки</div>
          </div>
        </div>

        <div v-if="tFormError" class="adm-tform__error">{{ tFormError }}</div>

        <div class="adm-modal__actions" style="justify-content:space-between;">
          <button v-if="editingTemplate" class="adm-btn adm-btn--danger" @click="deleteTemplate(editingTemplate); closeTemplateForm()">🗑 Удалить</button>
          <div style="display:flex;gap:8px;margin-left:auto;">
            <button class="adm-btn" style="background:rgba(255,255,255,.06);color:#aaa;" @click="closeTemplateForm">Отмена</button>
            <button class="adm-btn adm-btn--primary" :disabled="tFormSaving" @click="saveTemplate">
              {{ tFormSaving ? 'Сохраняем...' : (editingTemplate ? 'Сохранить' : 'Создать') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>

</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { apiClient } from '@/services/api'

const router = useRouter()
const auth = useAuthStore()

const activeTab = ref('dashboard')
const tabs = [
  { id: 'dashboard', icon: '📊', label: 'Дашборд' },
  { id: 'orders',    icon: '📋', label: 'Заказы' },
  { id: 'quests',    icon: '🗺️', label: 'Квесты' },
  { id: 'templates',  icon: '📦', label: 'Шаблоны' },
]

// ─── State ────────────────────────────────────────────────────
const statsLoading = ref(false)
const ordersLoading = ref(false)
const ordersSearch  = ref('')
const statusFilter  = ref('all')

const STATUS_LABELS = {
  all: 'Все', pending: 'Новые', confirmed: 'Подтверждённые',
  in_progress: 'В работе', completed: 'Выполненные', cancelled: 'Отменённые'
}

const statusFilters = computed(() => {
  const counts = {}
  orders.value.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })
  return Object.entries(STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
    count: value === 'all' ? orders.value.length : (counts[value] || 0)
  }))
})

const filteredOrders = computed(() => {
  let list = orders.value
  if (statusFilter.value !== 'all') {
    list = list.filter(o => o.status === statusFilter.value)
  }
  const q = ordersSearch.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(o =>
    o.client_name?.toLowerCase().includes(q)  ||
    o.client_email?.toLowerCase().includes(q) ||
    o.client_phone?.includes(q)               ||
    String(o.id).includes(q)                  ||
    o.description?.toLowerCase().includes(q)
  )
})
const questsLoading = ref(false)

const stats        = ref({})
const recentOrders = ref([])
const recentQuests = ref([])
const orders       = ref([])
const quests       = ref([])
const selectedOrder = ref(null)
const toast        = ref('')

const pendingCount = computed(() => Number(stats.value.pending_orders || 0) + Number(stats.value.confirmed_orders || 0))

// ─── Load data ────────────────────────────────────────────────
const loadDashboard = async () => {
  statsLoading.value = true
  try {
    const res = await apiClient.get('/admin/dashboard')
    const d = res.data
    stats.value        = d.stats
    recentOrders.value = d.recent_orders
    recentQuests.value = d.recent_quests
  } catch { } finally {
    statsLoading.value = false
  }
}

const loadOrders = async () => {
  if (orders.value.length) return
  ordersLoading.value = true
  try {
    const res = await apiClient.get('/admin/orders')
    orders.value = res.data
  } catch { } finally {
    ordersLoading.value = false
  }
}

const loadQuests = async () => {
  questsLoading.value = true
  try {
    const res = await apiClient.get('/admin/quests')
    quests.value = res.data
  } catch { } finally {
    questsLoading.value = false
  }
}

// Lazy load tabs
const watchTab = (tab) => {
  if (tab === 'orders')    loadOrders()
  if (tab === 'quests')    loadQuests()
  if (tab === 'templates') loadTemplates()
}

// ─── Actions ──────────────────────────────────────────────────
const handleLogout = () => {
  auth.logout()
  router.push('/admin/login')
}

const openOrder = (o) => { selectedOrder.value = o }

const createQuestFromOrder = (o) => {
  router.push({
    path: '/admin/quest/new',
    query: {
      order_id:    o.id,
      client_name: o.client_name,
      template_id: o.template_id
    }
  })
}

const createNewQuest = () => router.push('/admin/quest/new')

const editQuest  = (id)   => router.push(`/admin/quest/${id}/edit`)
const openQuest  = (slug) => window.open(`/quest/${slug}`, '_blank')

const copyLink = (slug) => {
  const url = `${window.location.origin}/quest/${slug}`
  navigator.clipboard.writeText(url)
  showToast('Ссылка скопирована: ' + url)
}

const deleteQuest = async (q) => {
  if (!confirm(`Удалить квест «${q.title}»?`)) return
  try {
    await apiClient.delete(`/admin/quests/${q.id}`)
    quests.value = quests.value.filter(x => x.id !== q.id)
    showToast('Квест удалён')
  } catch {
    showToast('Ошибка удаления')
  }
}

const showToast = (msg) => {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 3000)
}

// ─── Helpers ──────────────────────────────────────────────────
const formatRub = (v) => v ? `${Math.round(Number(v) / 100).toLocaleString('ru')} ₽` : '—'
const formatDate = (d) => d ? new Date(d).toLocaleDateString('ru', { day: 'numeric', month: 'short' }) : '—'
const statusLabel = (s) => ({ pending: 'Новый', confirmed: 'Подтверждён', in_progress: 'В работе', completed: 'Выполнен', cancelled: 'Отменён' }[s] || s)
const themeIcon   = (t) => ({ detective: '🕵️', romantic: '❤️', city: '🏙️', mystery: '🔮' }[t] || '🕵️')


// ─── Templates ────────────────────────────────────────────────
const templatesLoading   = ref(false)
const templates          = ref([])
const adminCategories    = ref([])
const templatesSearch    = ref('')
const templateStatusFilter = ref('all')
const templateModal      = ref(false)
const editingTemplate    = ref(null)
const tFormSaving        = ref(false)
const tFormError         = ref('')

const emptyTForm = () => ({
  title: '', tagline: '', description: '',
  category_id: null, difficulty: 'medium',
  duration_minutes: 60, location_type: 'universal',
  base_price: 0, is_free: false, is_premium: false,
  featuresText: '', cover_image: '', gallery: [], status: 'draft'
})
const tForm = ref(emptyTForm())

const TEMPLATE_STATUS_LABELS = { all: 'Все', draft: 'Черновики', published: 'Опубликованы', archived: 'Архив' }
const DIFFICULTY_LABELS = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный', expert: 'Эксперт' }

const templateStatusFilters = computed(() => {
  const counts = {}
  templates.value.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1 })
  return Object.entries(TEMPLATE_STATUS_LABELS).map(([value, label]) => ({
    value, label,
    count: value === 'all' ? templates.value.length : (counts[value] || 0)
  }))
})

const filteredTemplates = computed(() => {
  let list = templates.value
  if (templateStatusFilter.value !== 'all') {
    list = list.filter(t => t.status === templateStatusFilter.value)
  }
  const q = templatesSearch.value.trim().toLowerCase()
  if (!q) return list
  return list.filter(t =>
    t.title?.toLowerCase().includes(q) ||
    t.tagline?.toLowerCase().includes(q) ||
    t.category_name?.toLowerCase().includes(q)
  )
})

const loadTemplates = async () => {
  if (templates.value.length) return  templatesLoading.value = true
  try {
    const [tRes, cRes] = await Promise.allSettled([
      apiClient.get('/admin/templates/all'),
      apiClient.get('/admin/categories')
    ])
    if (tRes.status === 'fulfilled') templates.value = tRes.value.data
    if (cRes.status === 'fulfilled') adminCategories.value = cRes.value.data
  } finally {
    templatesLoading.value = false
  }
}

const openTemplateForm = async (t) => {
  tFormError.value = ''
  if (!adminCategories.value.length) {
    try { const r = await apiClient.get('/admin/categories'); adminCategories.value = r.data } catch {}
  }
  if (t) {
    editingTemplate.value = t
    const featuresArr = Array.isArray(t.features) ? t.features : (JSON.parse(t.features || '[]'))
    const galleryRaw = Array.isArray(t.gallery) ? t.gallery : (JSON.parse(t.gallery || '[]'))
    // Normalize: string → {url}, {url} → {url}, avoid double-wrapping
    const galleryArr = galleryRaw.map(item => {
      if (typeof item === 'string') return { url: item }
      if (typeof item?.url === 'string') return { url: item.url }
      return { url: '' }
    }).filter(item => item.url)
    tForm.value = {
      title: t.title || '',
      tagline: t.tagline || '',
      description: t.description || '',
      category_id: t.category_id || null,
      difficulty: t.difficulty || 'medium',
      duration_minutes: t.duration_minutes || 60,
      location_type: t.location_type || 'universal',
      base_price: t.is_free ? 0 : Math.round(Number(t.base_price) / 100),
      is_free: t.is_free || false,
      is_premium: t.is_premium || false,
      featuresText: featuresArr.join('\n'),
      cover_image: t.cover_image || (galleryArr[0]?.url || ''),
      gallery: galleryArr,
      status: t.status || 'draft'
    }
  } else {
    editingTemplate.value = null
    tForm.value = emptyTForm()
  }
  templateModal.value = true
}

const closeTemplateForm = () => {
  templateModal.value = false
  editingTemplate.value = null
  tFormError.value = ''
}

const saveTemplate = async () => {
  tFormError.value = ''
  if (!tForm.value.title.trim()) { tFormError.value = 'Укажите название'; return }
  if (!tForm.value.duration_minutes || tForm.value.duration_minutes < 10) { tFormError.value = 'Укажите длительность (мин. 10)'; return }

  tFormSaving.value = true
  try {
    const payload = {
      ...tForm.value,
      features: tForm.value.featuresText.split('\n').map(s => s.trim()).filter(Boolean),
      base_price: tForm.value.is_free ? 0 : tForm.value.base_price,
      gallery: tForm.value.gallery.map(item => item.url),
    }
    delete payload.featuresText

    let res
    if (editingTemplate.value) {
      res = await apiClient.put(`/admin/templates/${editingTemplate.value.id}`, payload)
      // Reload full list to get fresh DB state (gallery as string[])
      templates.value = []
      await loadTemplates()
      showToast('Шаблон обновлён')
    } else {
      res = await apiClient.post('/admin/templates/create', payload)
      // Reload to get fresh data with correct types
      templates.value = []
      await loadTemplates()
      showToast('Шаблон создан')
    }
    closeTemplateForm()
  } catch (e) {
    const msgs = e.response?.data?.errors?.map(x => x.msg).join(', ')
    tFormError.value = msgs || e.response?.data?.message || 'Ошибка сохранения'
  } finally {
    tFormSaving.value = false
  }
}

const quickStatusChange = async (t, status) => {
  try {
    await apiClient.patch(`/admin/templates/${t.id}/status`, { status })
    t.status = status
    showToast(status === 'published' ? 'Шаблон опубликован' : 'Шаблон снят с публикации')
  } catch {
    showToast('Ошибка смены статуса')
  }
}

const deleteTemplate = async (t) => {
  if (!confirm(`Удалить шаблон «${t.title}»? Это действие нельзя отменить.`)) return
  try {
    await apiClient.delete(`/admin/templates/${t.id}`)
    templates.value = templates.value.filter(x => x.id !== t.id)
    showToast('Шаблон удалён')
  } catch {
    showToast('Ошибка удаления')
  }
}


// ─── Gallery ──────────────────────────────────────────────────
const galleryDragOver      = ref(false)
const galleryUploading     = ref(false)
const galleryUploadProgress = ref(0)
let galleryDragSrcIdx      = -1

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')

const imgSrc = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  // Relative path like /uploads/templates/... — prepend backend host
  return API_BASE + url
}

const uploadFiles = async (files) => {
  if (!files.length) return
  galleryUploading.value = true
  galleryUploadProgress.value = 0

  try {
    const formData = new FormData()
    Array.from(files).forEach(f => formData.append('images', f))

    // Simulate progress
    const timer = setInterval(() => {
      if (galleryUploadProgress.value < 85) galleryUploadProgress.value += 15
    }, 200)

    const res = await apiClient.post('/admin/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    clearInterval(timer)
    galleryUploadProgress.value = 100

    // apiClient interceptor returns response.data directly → res = { success, data: [...urls] }
    const urls = Array.isArray(res.data) ? res.data : (res.data ? [res.data.url] : [])
    const newItems = urls.map(url => ({ url }))
    tForm.value.gallery.push(...newItems)

    // Auto-set first uploaded as cover if no cover yet
    if (!tForm.value.cover_image && newItems.length) {
      tForm.value.cover_image = newItems[0].url
    }
    showToast(`Загружено ${newItems.length} фото`)
  } catch (e) {
    showToast('Ошибка загрузки фото')
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

const setCover = (url) => { tForm.value.cover_image = url }

const removeGalleryItem = (idx) => {
  const removed = tForm.value.gallery.splice(idx, 1)[0]
  if (tForm.value.cover_image === removed.url) {
    tForm.value.cover_image = tForm.value.gallery[0]?.url || ''
  }
}

const galleryDragStart = (idx) => { galleryDragSrcIdx = idx }
const galleryDragReorder = (targetIdx) => {
  if (galleryDragSrcIdx === -1 || galleryDragSrcIdx === targetIdx) return
  const arr = tForm.value.gallery
  const [moved] = arr.splice(galleryDragSrcIdx, 1)
  arr.splice(targetIdx, 0, moved)
  galleryDragSrcIdx = -1
}

const difficultyLabel = (d) => DIFFICULTY_LABELS[d] || d
const tStatusLabel    = (s) => ({ draft: 'Черновик', published: 'Опубликован', archived: 'Архив' }[s] || s)

// ─── Watch tab changes ────────────────────────────────────────
import { watch } from 'vue'
watch(activeTab, watchTab)

onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────────────────── */
.adm {
  display: flex;
  min-height: 100vh;
  background: #0f1117;
  color: #c8d6ef;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
}

/* ── Sidebar ─────────────────────────────────────────────────── */
.adm-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: #1a1f2e;
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  position: sticky;
  top: 0;
  height: 100vh;
}

.adm-sidebar__logo {
  font-size: 1.1rem;
  font-weight: 800;
  color: #fff;
  padding: 0 20px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 12px;
}

.adm-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; padding: 0 10px; }

.adm-nav__item {
  display: flex; align-items: center; gap: 10px;
  background: transparent; border: none;
  color: #718096; padding: 10px 12px; border-radius: 8px;
  cursor: pointer; font-size: 0.88rem; font-weight: 500;
  transition: all 0.15s; text-align: left; width: 100%;
}
.adm-nav__item:hover { background: rgba(255,255,255,0.05); color: #fff; }
.adm-nav__item.active { background: rgba(102,126,234,0.15); color: #667eea; }
.adm-nav__icon { font-size: 1rem; }
.adm-nav__badge {
  margin-left: auto;
  background: #e53e3e;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
}

.adm-logout {
  margin: 16px 10px 0;
  background: transparent; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; padding: 9px 12px; color: #718096;
  font-size: 0.82rem; cursor: pointer; transition: all 0.15s;
}
.adm-logout:hover { color: #fc8181; border-color: rgba(252,129,129,0.3); }

/* ── Main ────────────────────────────────────────────────────── */
.adm-main { flex: 1; min-width: 0; overflow-y: auto; }

.adm-section { padding: 32px; max-width: 1200px; }

.adm-section__head {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 28px; gap: 12px; flex-wrap: wrap;
}
.adm-section__head h1 { font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0; margin-right: auto; }

/* ── Search ─────────────────────────────────────────────────── */
.adm-search {
  display: flex; align-items: center; gap: 4px;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1);
  border-radius: 8px; padding: 0 4px 0 10px; min-width: 200px;
  transition: border-color .2s;
}
.adm-search:focus-within { border-color: #667eea; }
.adm-search__icon { font-size: .8rem; opacity: .5; flex-shrink: 0; }
.adm-search__input {
  flex: 1; background: transparent; border: none; outline: none;
  color: #fff; font-size: .88rem; padding: 8px 4px; min-width: 0;
}
.adm-search__input::placeholder { color: #4a5568; }
.adm-search__clear {
  background: none; border: none; color: #4a5568;
  cursor: pointer; padding: 4px 6px; font-size: .75rem; border-radius: 4px;
  flex-shrink: 0; transition: color .15s;
}
.adm-search__clear:hover { color: #fff; }

/* ── Filter ──────────────────────────────────────────────────── */
.adm-filter { display: flex; gap: 4px; flex-wrap: wrap; }
.adm-filter__btn {
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
  border-radius: 6px; padding: 6px 11px; color: #718096;
  font-size: .78rem; cursor: pointer; transition: all .15s; white-space: nowrap;
  display: flex; align-items: center; gap: 5px;
}
.adm-filter__btn:hover { color: #fff; border-color: rgba(255,255,255,.2); }
.adm-filter__btn.active { background: rgba(102,126,234,.15); border-color: #667eea; color: #667eea; }
.adm-filter__count {
  background: rgba(255,255,255,.1); border-radius: 10px;
  padding: 1px 6px; font-size: .7rem; min-width: 18px; text-align: center;
}
.adm-filter__btn.active .adm-filter__count { background: rgba(102,126,234,.3); }

/* ── Stats ───────────────────────────────────────────────────── */
.adm-stats {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
  margin-bottom: 28px;
}
.adm-stat {
  background: #1a1f2e;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 20px 24px;
}
.adm-stat--accent { border-color: rgba(102,126,234,0.3); }
.adm-stat__n { font-size: 2rem; font-weight: 900; color: #fff; }
.adm-stat--accent .adm-stat__n { color: #667eea; }
.adm-stat__l { font-size: 0.78rem; color: #718096; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }

/* ── Row / Cards ─────────────────────────────────────────────── */
.adm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.adm-card { background: #1a1f2e; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; }
.adm-card__title { font-size: 0.82rem; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; }

/* ── List items ─────────────────────────────────────────────── */
.adm-list-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);
  cursor: pointer; transition: background 0.1s; border-radius: 4px;
}
.adm-list-item:last-child { border-bottom: none; }
.adm-list-item:hover { background: rgba(255,255,255,0.03); }
.adm-list-item__main { display: flex; flex-direction: column; gap: 2px; }
.adm-list-item__name { font-weight: 600; color: #fff; font-size: 0.88rem; }
.adm-list-item__sub { font-size: 0.78rem; color: #718096; }
.adm-list-item__right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.adm-list-item__date { font-size: 0.75rem; color: #4a5568; }

.adm-link-btn {
  font-size: 0.75rem; color: #667eea; cursor: pointer;
  background: none; border: none; padding: 0;
}
.adm-link-btn:hover { text-decoration: underline; }

/* ── Status badges ───────────────────────────────────────────── */
.adm-status { font-size: 0.72rem; font-weight: 600; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
.adm-status--pending     { background: rgba(237,137,54,.15);  color: #ed8936; }
.adm-status--confirmed   { background: rgba(246,173,85,.15);  color: #f6ad55; }
.adm-status--in_progress { background: rgba(102,126,234,.15); color: #667eea; }
.adm-status--completed   { background: rgba(72,187,120,.15);  color: #48bb78; }
.adm-status--cancelled   { background: rgba(245,101,101,.15); color: #f56565; }

/* ── Table ───────────────────────────────────────────────────── */
.adm-table-wrap { overflow-x: auto; }
.adm-table { width: 100%; border-collapse: collapse; }
.adm-table th {
  text-align: left; padding: 10px 14px;
  font-size: 0.72rem; font-weight: 700; color: #718096;
  text-transform: uppercase; letter-spacing: 0.08em;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.adm-table__row {
  border-bottom: 1px solid rgba(255,255,255,0.04);
  cursor: pointer; transition: background 0.1s;
}
.adm-table__row:hover { background: rgba(255,255,255,0.03); }
.adm-table__row td { padding: 12px 14px; }
.adm-table__id { color: #4a5568; font-size: 0.82rem; }
.adm-table__name { font-weight: 600; color: #fff; }
.adm-table__sub { font-size: 0.75rem; color: #718096; }
.adm-table__price { font-weight: 700; color: #48bb78; }
.adm-table__date { color: #4a5568; font-size: 0.82rem; }

/* ── Quest grid ─────────────────────────────────────────────── */
.adm-quests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.adm-quest-card {
  background: #1a1f2e;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.adm-quest-card:hover { border-color: rgba(102,126,234,0.3); }
.adm-quest-card__theme {
  height: 64px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem;
  background: rgba(255,255,255,0.03);
}
.adm-quest-card__theme[data-theme="detective"] { background: rgba(255,60,110,0.08); }
.adm-quest-card__theme[data-theme="romantic"]  { background: rgba(255,158,210,0.08); }
.adm-quest-card__theme[data-theme="city"]      { background: rgba(60,255,180,0.08); }
.adm-quest-card__theme[data-theme="mystery"]   { background: rgba(176,108,255,0.08); }
.adm-quest-card__body { padding: 14px 16px; }
.adm-quest-card__for { font-size: 0.72rem; color: #718096; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
.adm-quest-card__title { font-weight: 700; color: #fff; font-size: 0.95rem; margin-bottom: 6px; }
.adm-quest-card__meta { font-size: 0.75rem; color: #4a5568; display: flex; gap: 6px; }
.adm-quest-card__actions {
  display: flex; gap: 4px; padding: 8px 12px;
  border-top: 1px solid rgba(255,255,255,0.05);
}

/* ── Buttons ─────────────────────────────────────────────────── */
.adm-btn {
  border: none; border-radius: 8px; padding: 9px 16px;
  font-size: 0.85rem; font-weight: 600; cursor: pointer;
  transition: all 0.15s;
}
.adm-btn--primary { background: #667eea; color: #fff; }
.adm-btn--primary:hover { background: #5a67d8; transform: translateY(-1px); }
.adm-btn--warning { background: #c05621; color: #fff; }
.adm-btn--warning:hover { background: #9c4221; transform: translateY(-1px); }
.adm-btn--success { background: #276749; color: #9ae6b4; }
.adm-btn--success:hover { background: #22543d; transform: translateY(-1px); }
.adm-btn--sm { padding: 6px 12px; font-size: 0.78rem; }
.adm-cancelled { font-size: 0.75rem; color: #718096; }

.adm-icon-btn {
  background: rgba(255,255,255,0.05); border: none;
  border-radius: 6px; width: 30px; height: 30px;
  font-size: 0.85rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.adm-icon-btn:hover { background: rgba(255,255,255,0.1); }
.adm-icon-btn--danger:hover { background: rgba(245,101,101,0.15); }

/* ── Modal ───────────────────────────────────────────────────── */
.adm-modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.adm-modal {
  background: #1a1f2e;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  position: relative;
}
.adm-modal__close {
  position: absolute; top: 16px; right: 16px;
  background: rgba(255,255,255,0.07); border: none;
  border-radius: 6px; width: 28px; height: 28px;
  color: #718096; cursor: pointer;
}
.adm-modal__title { font-size: 1.2rem; font-weight: 800; color: #fff; margin: 0 0 24px; }
.adm-modal__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px; margin-bottom: 24px; }
.adm-modal__field { display: flex; flex-direction: column; gap: 4px; }
.adm-modal__field--full { grid-column: 1/-1; }
.adm-modal__field label { font-size: 0.72rem; color: #718096; text-transform: uppercase; letter-spacing: 0.08em; }
.adm-modal__field span, .adm-modal__field p {
  color: #fff; font-size: 0.9rem; margin: 0; line-height: 1.5;
  word-break: break-word; overflow-wrap: anywhere;
}
.adm-modal__field--full p {
  max-height: 120px; overflow-y: auto;
  background: rgba(255,255,255,0.03); border-radius: 6px;
  padding: 8px 10px;
}
.adm-modal__actions { display: flex; justify-content: flex-end; }

/* ── Misc ────────────────────────────────────────────────────── */
.adm-loading { color: #718096; padding: 40px 0; text-align: center; }
.adm-empty { color: #4a5568; padding: 20px 0; text-align: center; font-size: 0.85rem; }
.adm-empty-page { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 0; }
.adm-empty-page__icon { font-size: 3rem; }
.adm-empty-page__text { color: #718096; }

.adm-toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  background: #1a1f2e; border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px; padding: 12px 20px;
  color: #fff; font-size: 0.88rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  z-index: 9999;
  animation: toast-in 0.2s ease;
}
@keyframes toast-in { from { opacity: 0; transform: translateX(-50%) translateY(8px); } }

@media (max-width: 1024px) {
  .adm-stats { grid-template-columns: repeat(2, 1fr); }
  .adm-row   { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .adm-sidebar { display: none; }
  .adm-section { padding: 20px; }
}
/* ── Template status badges ──────────────────────────────────── */
.adm-tstatus { font-size: 0.72rem; font-weight: 600; padding: 2px 8px; border-radius: 6px; }
.adm-tstatus--draft     { background: rgba(113,128,150,.15); color: #718096; }
.adm-tstatus--published { background: rgba(72,187,120,.15);  color: #48bb78; }
.adm-tstatus--archived  { background: rgba(245,101,101,.15); color: #f56565; }

/* ── Difficulty badges ───────────────────────────────────────── */
.adm-difficulty { font-size: 0.72rem; font-weight: 600; padding: 2px 8px; border-radius: 6px; }
.adm-difficulty--easy   { background: rgba(72,187,120,.12); color: #68d391; }
.adm-difficulty--medium { background: rgba(246,173,85,.12);  color: #f6ad55; }
.adm-difficulty--hard   { background: rgba(252,129,74,.12);  color: #fc814a; }
.adm-difficulty--expert { background: rgba(245,101,101,.12); color: #f56565; }

/* ── Gallery ─────────────────────────────────────────────────── */
.adm-gallery-drop {
  border: 2px dashed rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 28px 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  display: flex; flex-direction: column; align-items: center; gap: 6px;
}
.adm-gallery-drop:hover,
.adm-gallery-drop--over {
  border-color: #667eea;
  background: rgba(102,126,234,0.06);
}
.adm-gallery-drop__icon { font-size: 2rem; line-height: 1; }
.adm-gallery-drop__text { color: #c8d6ef; font-size: 0.88rem; font-weight: 500; }
.adm-gallery-drop__hint { color: #4a5568; font-size: 0.75rem; }

.adm-gallery-progress {
  margin-top: 8px;
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
  height: 28px;
  position: relative;
  overflow: hidden;
  display: flex; align-items: center; justify-content: center;
}
.adm-gallery-progress__bar {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: rgba(102,126,234,0.35);
  transition: width 0.2s;
}
.adm-gallery-progress span {
  position: relative; z-index: 1;
  font-size: 0.78rem; color: #a0aec0;
}

.adm-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 10px;
  margin-top: 12px;
}
.adm-gallery-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 4/3;
  border: 2px solid transparent;
  cursor: grab;
  transition: border-color 0.15s, transform 0.15s;
}
.adm-gallery-item:hover { transform: scale(1.02); }
.adm-gallery-item--cover { border-color: #f6ad55; }
.adm-gallery-item__img {
  width: 100%; height: 100%;
  object-fit: cover; display: block;
}
.adm-gallery-item__overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.55);
  opacity: 0;
  transition: opacity 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.adm-gallery-item:hover .adm-gallery-item__overlay { opacity: 1; }
.adm-gallery-item__btn {
  background: rgba(255,255,255,0.15);
  border: none; border-radius: 6px;
  width: 30px; height: 30px;
  font-size: 0.85rem; cursor: pointer; color: #fff;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.adm-gallery-item__btn:hover { background: rgba(255,255,255,0.3); }
.adm-gallery-item__btn.active { background: rgba(246,173,85,0.6); }
.adm-gallery-item__btn--del:hover { background: rgba(245,101,101,0.5); }
.adm-gallery-item__cover-badge {
  position: absolute; bottom: 4px; left: 0; right: 0;
  text-align: center;
  font-size: 0.62rem; font-weight: 700; color: #f6ad55;
  text-transform: uppercase; letter-spacing: 0.06em;
  background: rgba(0,0,0,0.6);
  padding: 2px 0;
}

/* ── Template form modal ─────────────────────────────────────── */
.adm-modal--wide { max-width: 780px; max-height: 90vh; overflow-y: auto; }

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
.adm-tform__cover-preview {
  margin-top: 8px; max-height: 120px; border-radius: 8px;
  object-fit: cover; border: 1px solid rgba(255,255,255,0.08);
}
.adm-tform__error {
  background: rgba(245,101,101,0.1); border: 1px solid rgba(245,101,101,0.3);
  border-radius: 8px; padding: 10px 14px; color: #fc8181;
  font-size: 0.85rem; margin-bottom: 16px;
}
.adm-btn--danger { background: rgba(245,101,101,0.15); color: #fc8181; border: 1px solid rgba(245,101,101,0.3); }
.adm-btn--danger:hover { background: rgba(245,101,101,0.25); }

@media (max-width: 900px) {
  .adm-tform__row--4 { grid-template-columns: 1fr 1fr; }
  .adm-tform__row--3 { grid-template-columns: 1fr 1fr; }
  .adm-tform__row--2 { grid-template-columns: 1fr; }
}

</style>