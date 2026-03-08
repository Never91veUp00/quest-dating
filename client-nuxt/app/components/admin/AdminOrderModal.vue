<template>
  <teleport to="body">
    <div v-if="order" class="adm-modal-overlay" @click.self="$emit('close')">
      <div class="adm-modal">
        <button class="adm-modal__close" @click="$emit('close')">✕</button>
        <h2 class="adm-modal__title">Заказ #{{ order.id }}</h2>

        <!-- Прогресс статусов -->
        <div class="adm-modal__status-bar">
          <span
            v-for="step in orderSteps"
            :key="step.value"
            class="adm-status-step"
            :class="{
              'adm-status-step--done':    isStepDone(step.value),
              'adm-status-step--current': order.status === step.value,
              'adm-status-step--future':  isStepFuture(step.value),
            }"
          >{{ step.label }}</span>
        </div>

        <div class="adm-modal__grid">
          <div class="adm-modal__field"><label>Клиент</label><span>{{ order.client_name }}</span></div>
          <div class="adm-modal__field"><label>Email</label><span>{{ order.client_email }}</span></div>
          <div class="adm-modal__field"><label>Телефон</label><span>{{ order.client_phone || '—' }}</span></div>
          <div class="adm-modal__field"><label>Сумма</label><span>{{ formatRub(order.total_price) }}</span></div>
          <div class="adm-modal__field adm-modal__field--full"><label>Пожелания</label><p>{{ order.description || '—' }}</p></div>
        </div>

        <div class="adm-modal__actions adm-modal__actions--between">

          <!-- pending -->
          <template v-if="order.status === 'pending'">
            <button class="adm-btn adm-btn--primary" :disabled="updating" @click="$emit('change-status', order, 'confirmed')">
              ✓ Подтвердить заказ
            </button>
          </template>

          <!-- confirmed -->
          <template v-else-if="order.status === 'confirmed'">
            <button class="adm-btn adm-btn--primary" @click="$emit('create-quest', order)">
              ✏️ Создать квест →
            </button>
          </template>

          <!-- in_progress -->
          <template v-else-if="order.status === 'in_progress'">
            <div class="adm-modal__action-group">
              <button class="adm-btn adm-btn--warning" @click="$emit('edit-quest', order)">
                🔧 Редактировать квест
              </button>
              <button v-if="order.created_quest_id" class="adm-btn adm-btn--ghost" @click="$emit('copy-link', order)">
                🔗 Скопировать ссылку
              </button>
              <button class="adm-btn adm-btn--success" :disabled="updating" @click="$emit('change-status', order, 'completed')">
                ✅ Квест выдан клиенту
              </button>
            </div>
          </template>

          <!-- completed -->
          <template v-else-if="order.status === 'completed'">
            <div class="adm-modal__action-group">
              <button v-if="order.created_quest_id" class="adm-btn adm-btn--ghost" @click="$emit('copy-link', order)">
                🔗 Ссылка на квест
              </button>
              <button v-if="order.created_quest_id" class="adm-btn adm-btn--warning" @click="$emit('edit-quest', order)">
                🔧 Редактировать квест
              </button>
            </div>
          </template>

          <!-- cancelled -->
          <template v-else-if="order.status === 'cancelled'">
            <button v-if="order.created_quest_id" class="adm-btn adm-btn--warning" :disabled="updating" @click="$emit('reopen', order)">
              🔧 Возобновить и редактировать
            </button>
            <span v-else class="adm-cancelled">Заказ отменён</span>
          </template>

          <!-- Отменить — для всех кроме cancelled -->
          <button
            v-if="order.status !== 'cancelled'"
            class="adm-btn adm-btn--danger"
            :disabled="updating"
            @click="$emit('change-status', order, 'cancelled')"
          >✕ Отменить заказ</button>

        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
function formatRub(v) { return v ? `${Math.round(Number(v) / 100).toLocaleString('ru')} ₽` : '—' }

const props = defineProps({
  order:    { type: Object,  default: null },
  updating: { type: Boolean, default: false },
})
defineEmits(['close', 'change-status', 'create-quest', 'edit-quest', 'copy-link', 'reopen'])

const orderSteps = [
  { value: 'pending',     label: 'Новый' },
  { value: 'confirmed',   label: 'Подтверждён' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'completed',   label: 'Выполнен' },
]
const statusOrder = orderSteps.map(s => s.value)

const isStepDone   = (val) => {
  if (props.order?.status === 'cancelled') return false
  return statusOrder.indexOf(val) < statusOrder.indexOf(props.order?.status)
}
const isStepFuture = (val) => {
  if (props.order?.status === 'cancelled') return true
  return statusOrder.indexOf(val) > statusOrder.indexOf(props.order?.status)
}
</script>

<style scoped>
.adm-modal__status-bar {
  display: flex; align-items: center;
  margin-bottom: 20px;
  background: rgba(255,255,255,0.04);
  border-radius: 10px;
  padding: 10px 14px;
  overflow: hidden;
}
.adm-status-step {
  flex: 1; text-align: center;
  font-size: 0.72rem; font-weight: 600;
  padding: 6px 4px; border-radius: 6px;
  color: #4a5568; transition: all 0.2s; white-space: nowrap;
}
.adm-status-step--done    { color: #48bb78; }
.adm-status-step--current { background: rgba(102,126,234,.2); color: #667eea; }
.adm-status-step--future  { color: #2d3748; }
</style>