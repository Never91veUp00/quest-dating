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
              <div class="adm-stat__n">{{ stats.pending_orders || 0 }}</div>
              <div class="adm-stat__l">Новых заказов</div>
            </div>
            <div class="adm-stat">
              <div class="adm-stat__n">{{ stats.total_orders || 0 }}</div>
              <div class="adm-stat__l">Всего заказов</div>
            </div>
            <div class="adm-stat">
              <div class="adm-stat__n">{{ stats.total_quests || 0 }}</div>
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
        </div>

        <div v-if="ordersLoading" class="adm-loading">Загрузка...</div>
        <div v-else-if="!orders.length" class="adm-empty-page">Заказов пока нет</div>
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
                v-for="o in orders"
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
                    class="adm-btn adm-btn--sm adm-btn--primary"
                    @click.stop="createQuestFromOrder(o)"
                  >
                    Создать квест
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Order detail modal -->
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
              <button class="adm-btn adm-btn--primary" @click="createQuestFromOrder(selectedOrder); selectedOrder = null">
                Создать квест →
              </button>
            </div>
          </div>
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

    </main>

    <!-- Toast -->
    <div v-if="toast" class="adm-toast">{{ toast }}</div>
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
]

// ─── State ────────────────────────────────────────────────────
const statsLoading = ref(false)
const ordersLoading = ref(false)
const questsLoading = ref(false)

const stats        = ref({})
const recentOrders = ref([])
const recentQuests = ref([])
const orders       = ref([])
const quests       = ref([])
const selectedOrder = ref(null)
const toast        = ref('')

const pendingCount = computed(() => stats.value.pending_orders || 0)

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

const editQuest = (id) => router.push(`/admin/quest/${id}/edit`)

const openQuest = (slug) => window.open(`/quest/${slug}`, '_blank')

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
const statusLabel = (s) => ({ pending: 'Новый', in_progress: 'В работе', completed: 'Готов', cancelled: 'Отменён' }[s] || s)
const themeIcon   = (t) => ({ detective: '🕵️', romantic: '❤️', city: '🏙️', mystery: '🔮' }[t] || '🕵️')

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
  margin-bottom: 28px;
}
.adm-section__head h1 { font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0; }

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
.adm-btn--sm { padding: 6px 12px; font-size: 0.78rem; }

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
.adm-modal__field span, .adm-modal__field p { color: #fff; font-size: 0.9rem; margin: 0; line-height: 1.5; }
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
</style>