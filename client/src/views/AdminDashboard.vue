<template>
  <div class="adm">
    <AdminSidebar
      v-model="activeTab"
      :pending-count="pendingCount"
      @logout="handleLogout"
    />

    <main class="adm-main">
      <AdminDashboardTab
        v-if="activeTab === 'dashboard'"
        :loading="statsLoading"
        :stats="stats"
        :recent-orders="recentOrders"
        :recent-quests="recentQuests"
        @open-order="openOrder"
        @edit-quest="editQuest"
        @copy-link="copyLink"
      />

      <AdminOrdersTab
        v-if="activeTab === 'orders'"
        :orders="orders"
        :loading="ordersLoading"
        @open-order="openOrder"
        @create-quest="createQuestFromOrder"
        @row-action="handleOrderRowAction"
      />

      <AdminQuestsTab
        v-if="activeTab === 'quests'"
        :quests="quests"
        :loading="questsLoading"
        @create="createNewQuest"
        @edit="editQuest"
        @delete="deleteQuest"
        @copy-link="copyLink"
        @open-quest="openQuest"
      />

      <AdminTemplatesTab
        v-if="activeTab === 'templates'"
        :templates="templates"
        :loading="templatesLoading"
        @create="openTemplateForm(null)"
        @edit="openTemplateForm"
        @quick-status="quickStatusChange"
        @delete="deleteTemplate"
      />
    </main>

    <!-- Toast -->
    <div v-if="toast" class="adm-toast">{{ toast }}</div>

    <!-- Модалка заказа -->
    <AdminOrderModal
      :order="selectedOrder"
      :updating="orderStatusUpdating"
      @close="selectedOrder = null"
      @change-status="changeOrderStatus"
      @create-quest="createQuestFromOrder"
      @edit-quest="handleEditQuestFromModal"
      @copy-link="copyQuestLink"
      @reopen="reopenOrder"
    />

    <!-- Модалка шаблона -->
    <AdminTemplateModal
      :show="templateModal"
      :editing-template="editingTemplate"
      :categories="adminCategories"
      :tags="adminTags"
      :quests="quests"
      :saving="tFormSaving"
      :error="tFormError"
      @close="closeTemplateForm"
      @save="saveTemplate"
      @delete="(t) => { deleteTemplate(t); closeTemplateForm() }"
    />

    <!-- Диалог подтверждения -->
    <AdminConfirmDialog :dialog="confirmDialog" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/modules/auth'
import { apiClient } from '@/services/api'

import AdminSidebar       from '@/components/admin/AdminSidebar.vue'
import AdminDashboardTab  from '@/components/admin/AdminDashboardTab.vue'
import AdminOrdersTab     from '@/components/admin/AdminOrdersTab.vue'
import AdminQuestsTab     from '@/components/admin/AdminQuestsTab.vue'
import AdminTemplatesTab  from '@/components/admin/AdminTemplatesTab.vue'
import AdminOrderModal    from '@/components/admin/AdminOrderModal.vue'
import AdminTemplateModal from '@/components/admin/AdminTemplateModal.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'

const router = useRouter()
const auth   = useAuthStore()

// ─── Tab ──────────────────────────────────────────────────────
const activeTab = ref('dashboard')

// ─── State ────────────────────────────────────────────────────
const statsLoading  = ref(false)
const ordersLoading = ref(false)
const questsLoading = ref(false)
const templatesLoading = ref(false)

const stats        = ref({})
const recentOrders = ref([])
const recentQuests = ref([])
const orders       = ref([])
const quests       = ref([])
const templates    = ref([])
const adminCategories = ref([])
const adminTags       = ref([])
const selectedOrder   = ref(null)
const toast           = ref('')

const pendingCount = computed(() =>
  orders.value.filter(o => o.status === 'pending' || o.status === 'confirmed').length
)

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

const loadTemplates = async () => {
  if (templates.value.length) return
  templatesLoading.value = true
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

// ─── Tab lazy load ────────────────────────────────────────────
watch(activeTab, (tab) => {
  if (tab === 'orders')    loadOrders()
  if (tab === 'quests')    loadQuests()
  if (tab === 'templates') loadTemplates()
})

// ─── Helpers ──────────────────────────────────────────────────
const showToast = (msg) => {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 3000)
}

// ─── Auth ─────────────────────────────────────────────────────
const handleLogout = () => {
  auth.logout()
  router.push('/admin/login')
}

// ─── Orders ───────────────────────────────────────────────────
const openOrder = (o) => { selectedOrder.value = o }

const orderStatusUpdating = ref(false)

const changeOrderStatus = async (order, newStatus) => {
  if (orderStatusUpdating.value) return
  orderStatusUpdating.value = true
  try {
    const res = await apiClient.patch(`/admin/orders/${order.id}/status`, { status: newStatus })
    const updatedStatus = res.data.status
    order.status = updatedStatus
    const found = orders.value.find(o => o.id === order.id)
    if (found) found.status = updatedStatus
    showToast(`Статус изменён: ${{ pending: 'Новый', confirmed: 'Подтверждён', in_progress: 'В работе', completed: 'Выполнен', cancelled: 'Отменён' }[newStatus] || newStatus}`)
    selectedOrder.value = null
  } catch {
    showToast('Ошибка смены статуса')
  } finally {
    orderStatusUpdating.value = false
  }
}

const reopenOrder = async (order) => {
  if (orderStatusUpdating.value) return
  orderStatusUpdating.value = true
  try {
    const res = await apiClient.patch(`/admin/orders/${order.id}/status`, { status: 'in_progress' })
    order.status = res.data.status
    const found = orders.value.find(o => o.id === order.id)
    if (found) found.status = res.data.status
    selectedOrder.value = null
    order.created_quest_id ? editQuest(order.created_quest_id) : createQuestFromOrder(order)
  } catch {
    showToast('Ошибка смены статуса')
  } finally {
    orderStatusUpdating.value = false
  }
}

const handleOrderRowAction = (o) => {
  if (o.status === 'cancelled') {
    reopenOrder(o)
  } else if (o.created_quest_id) {
    editQuest(o.created_quest_id)
  } else {
    openOrder(o)
  }
}

const copyQuestLink = (order) => {
  const quest = quests.value.find(q => q.id === order.created_quest_id)
  if (quest?.slug) copyLink(quest.slug)
  else showToast('Slug квеста не найден')
}

const createQuestFromOrder = (o) => {
  router.push({
    path: '/admin/quest/new',
    query: { order_id: o.id, client_name: o.client_name, template_id: o.template_id }
  })
}

const handleEditQuestFromModal = (order) => {
  selectedOrder.value = null
  order.created_quest_id ? editQuest(order.created_quest_id) : createQuestFromOrder(order)
}

// ─── Quests ───────────────────────────────────────────────────
const createNewQuest = () => router.push('/admin/quest/new')
const editQuest      = (id)   => router.push(`/admin/quest/${id}/edit`)
const openQuest      = (slug) => window.open(`/quest/${slug}`, '_blank')

const copyLink = (slug) => {
  navigator.clipboard.writeText(`${window.location.origin}/quest/${slug}`)
  showToast('Ссылка скопирована')
}

const deleteQuest = (q) => {
  confirmDialog.value = {
    show: true,
    title: 'Удалить квест?',
    message: `«${q.title}» будет удалён без возможности восстановления.`,
    onConfirm: async () => {
      try {
        await apiClient.delete(`/admin/quests/${q.id}`)
        quests.value = quests.value.filter(x => x.id !== q.id)
        showToast('Квест удалён')
      } catch {
        showToast('Ошибка удаления')
      }
    }
  }
}

// ─── Templates ────────────────────────────────────────────────
const templateModal   = ref(false)
const editingTemplate = ref(null)
const tFormSaving     = ref(false)
const tFormError      = ref('')
const confirmDialog   = ref({ show: false, title: '', message: '', onConfirm: () => {} })

const openTemplateForm = async (t) => {
  tFormError.value = ''
  if (!adminCategories.value.length) {
    try { const r = await apiClient.get('/admin/categories'); adminCategories.value = r.data } catch {}
  }
  if (!adminTags.value.length) {
    try { const r = await apiClient.get('/tags'); adminTags.value = r.data } catch {}
  }
  if (t?.id) {
    try {
      const r = await apiClient.get(`/admin/templates/${t.id}`)
      editingTemplate.value = r.data
    } catch {
      editingTemplate.value = t
    }
  } else {
    editingTemplate.value = null
  }
  templateModal.value = true
}

const closeTemplateForm = () => {
  templateModal.value   = false
  editingTemplate.value = null
  tFormError.value      = ''
}

const saveTemplate = async (form) => {
  tFormError.value = ''
  tFormSaving.value = true
  try {
    const payload = {
      ...form,
      features: form.featuresText.split('\n').map(s => s.trim()).filter(Boolean),
      base_price: form.is_free ? 0 : form.base_price,
      gallery: form.gallery.map(item => item.url),
      tag_ids: form.tag_ids || [],
    }
    delete payload.featuresText
    if (editingTemplate.value) {
      await apiClient.put(`/admin/templates/${editingTemplate.value.id}`, payload)
      templates.value = []
      await loadTemplates()
      showToast('Шаблон обновлён')
    } else {
      await apiClient.post('/admin/templates/create', payload)
      templates.value = []
      await loadTemplates()
      showToast('Шаблон создан')
    }
    closeTemplateForm()
  } catch (e) {
    const msgs = Array.isArray(e.errors)
      ? e.errors.map(x => x.msg).join(', ')
      : null
    tFormError.value = msgs || e.message || 'Ошибка сохранения'
  } finally {
    tFormSaving.value = false
  }
}

const quickStatusChange = async (t, status) => {
  try {
    const res = await apiClient.patch(`/admin/templates/${t.id}/status`, { status })
    t.status = res?.data?.status || status
    // Обновляем в массиве templates
    const found = templates.value.find(x => x.id === t.id)
    if (found) found.status = t.status
    showToast(status === 'published' ? 'Шаблон опубликован' : 'Шаблон снят с публикации')
  } catch (e) {
    const msg = e?.message || e?.errors?.status?.msg || 'неизвестная ошибка'
    console.error('[quickStatusChange]', e)
    showToast('Ошибка смены статуса: ' + msg)
  }
}

const deleteTemplate = (t) => {
  confirmDialog.value = {
    show: true,
    title: 'Удалить шаблон?',
    message: `«${t.title}» будет удалён без возможности восстановления.`,
    onConfirm: async () => {
      try {
        await apiClient.delete(`/admin/templates/${t.id}`)
        templates.value = templates.value.filter(x => x.id !== t.id)
        showToast('Шаблон удалён')
      } catch {
        showToast('Ошибка удаления')
      }
    }
  }
}

// ─── Init ─────────────────────────────────────────────────────
onMounted(() => {
  loadDashboard()
  loadOrders()
})
</script>

<style scoped>
.adm {
  display: flex;
  min-height: 100vh;
  background: #0f1117;
  color: #c8d6ef;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
}

.adm-main { flex: 1; min-width: 0; overflow-y: auto; }

.adm-toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  background: #1a1f2e; border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px; padding: 12px 20px;
  color: #fff; font-size: 0.88rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  z-index: 9999;
  animation: toast-in 0.2s ease;
}
@keyframes toast-in {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
}
</style>