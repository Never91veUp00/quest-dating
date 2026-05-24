<template>
  <div class="mo">

    <!-- Loading -->
    <div v-if="loading" class="mo__loading">
      <div class="mo__spinner"></div>
      <p>Загружаем заказ...</p>
    </div>

    <!-- Error -->
    <div v-else-if="fetchError || !order" class="mo__error">
      <div class="mo__error-icon">😕</div>
      <h1>Заказ не найден</h1>
      <p>Возможно, ссылка устарела или неверна.<br>Проверьте письмо, которое пришло после оформления.</p>
      <NuxtLink to="/" class="mo__error-btn">На главную</NuxtLink>
    </div>

    <!-- Order -->
    <div v-else class="mo__page">
      <div class="mo__container">

        <!-- Top nav -->
        <div class="mo__topbar">
          <NuxtLink to="/" class="mo__home-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Quest Dating
          </NuxtLink>
          <span class="mo__order-num">Заказ #{{ order.id }}</span>
        </div>

        <!-- Status -->
        <div class="mo__status-row">
          <span class="mo__status" :class="'mo__status--' + order.status">
            {{ STATUS_LABELS[order.status] || order.status }}
          </span>
          <span class="mo__created">{{ fmtDateTime(order.created_at) }}</span>
        </div>

        <!-- Quest card -->
        <div class="mo__card">
          <div v-if="order.template_image" class="mo__card-img">
            <img :src="order.template_image" :alt="order.template_title" />
          </div>
          <div v-else class="mo__card-img mo__card-img--empty"></div>
          <div class="mo__card-body">
            <p class="mo__card-label">Квест</p>
            <h1 class="mo__card-title">{{ order.template_title }}</h1>
          </div>
        </div>

        <!-- Details grid -->
        <div class="mo__details">
          <div class="mo__detail" v-if="order.event_date">
            <span class="mo__detail-icon">📅</span>
            <div>
              <div class="mo__detail-label">Дата</div>
              <div class="mo__detail-val">{{ fmtDate(order.event_date) }}</div>
            </div>
          </div>
          <div class="mo__detail" v-if="order.event_city">
            <span class="mo__detail-icon">📍</span>
            <div>
              <div class="mo__detail-label">Город</div>
              <div class="mo__detail-val">{{ order.event_city }}</div>
            </div>
          </div>
          <div class="mo__detail">
            <span class="mo__detail-icon">💰</span>
            <div>
              <div class="mo__detail-label">Сумма</div>
              <div class="mo__detail-val mo__detail-val--price">{{ fmtPrice(order.total_price) }}</div>
            </div>
          </div>
          <div class="mo__detail">
            <span class="mo__detail-icon">📧</span>
            <div>
              <div class="mo__detail-label">Email</div>
              <div class="mo__detail-val">{{ maskEmail(order.client_email) }}</div>
            </div>
          </div>
        </div>

        <!-- Features -->
        <div v-if="features.length" class="mo__features">
          <p class="mo__features-title">Дополнения</p>
          <div class="mo__features-list">
            <span v-for="f in features" :key="f" class="mo__feature">{{ f }}</span>
          </div>
        </div>

        <!-- Info banner -->
        <div class="mo__info-banner" v-if="order.status === 'pending' || order.status === 'confirmed'">
          <div class="mo__info-icon">✨</div>
          <p>Лиза работает над вашим квестом. Готовый сценарий придёт на&nbsp;<strong>{{ maskEmail(order.client_email) }}</strong> в&nbsp;течение 24&nbsp;часов.</p>
        </div>
        <div class="mo__info-banner mo__info-banner--done" v-else-if="order.status === 'completed'">
          <div class="mo__info-icon">🎉</div>
          <p>Квест готов! Проверьте почту — сценарий уже отправлен на&nbsp;<strong>{{ maskEmail(order.client_email) }}</strong>.</p>
        </div>

        <!-- Telegram CTA -->
        <a :href="botUrl" target="_blank" rel="noopener noreferrer" class="mo__tg-btn">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-2.018 9.506c-.146.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.881.715z"/>
          </svg>
          Следить в Telegram
        </a>

        <!-- Actions -->
        <div class="mo__actions">
          <NuxtLink to="/catalog" class="mo__btn">Другие квесты</NuxtLink>
          <NuxtLink to="/" class="mo__btn mo__btn--primary">На главную</NuxtLink>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const token = route.params.token

const { getOrderByToken } = useDatesApi()

const loading    = ref(true)
const order      = ref(null)
const fetchError = ref(null)

onMounted(async () => {
  try {
    const res = await getOrderByToken(token)
    order.value = res?.data ?? null
    if (!order.value) fetchError.value = 'not_found'
  } catch (e) {
    fetchError.value = e.message || 'error'
  } finally {
    loading.value = false
  }
})

const STATUS_LABELS = {
  pending:     'Ожидает подтверждения',
  confirmed:   'Подтверждён',
  in_progress: 'В работе',
  completed:   'Выполнен',
  cancelled:   'Отменён',
}

const FEATURE_LABELS = {
  background_music:  'Фоновая музыка',
  video_messages:    'Видеосообщения',
  custom_photos:     'Личные фото',
  qr_codes:          'QR-коды',
  partner_surprises: 'Сюрпризы',
}

const botUrl = computed(() => `https://t.me/questdating_bot?start=${token}`)

const features = computed(() => {
  const list = order.value?.selected_features
  if (!Array.isArray(list) || !list.length) return []
  return list.map(f => FEATURE_LABELS[f] || f)
})

function maskEmail(email) {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.slice(0, 2)
  return visible + '*'.repeat(Math.max(2, local.length - 2)) + '@' + domain
}
function fmtPrice(v) {
  if (!v) return '—'
  return (v / 100).toLocaleString('ru-RU') + '\u00a0\u20bd'
}
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '')
}
function fmtDateTime(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('ru-RU', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  })
}

useSeoMeta({
  title: () => order.value ? `Заказ #${order.value.id} — Quest Dating` : 'Заказ — Quest Dating',
  robots: 'noindex,nofollow',
})
</script>

<style scoped>
.mo {
  background: #0a0a0f;
  color: #f0ede8;
  min-height: 100vh;
}

/* Loading */
.mo__loading {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 16px;
  min-height: 60vh; text-align: center; padding: 40px 20px;
  color: rgba(240,237,232,.5);
}
.mo__spinner {
  width: 32px; height: 32px;
  border: 3px solid rgba(212,175,55,.2);
  border-top-color: #d4af37;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Error */
.mo__error {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 16px;
  min-height: 60vh; text-align: center; padding: 40px 20px;
}
.mo__error-icon { font-size: 3rem; }
.mo__error h1 { font-size: 1.4rem; font-weight: 900; margin: 0; }
.mo__error p { color: rgba(240,237,232,.5); margin: 0; line-height: 1.6; }
.mo__error-btn {
  display: inline-block;
  margin-top: 8px;
  padding: 12px 28px;
  background: #d4af37;
  color: #0a0a0f;
  font-weight: 700;
  font-size: 0.9rem;
  border-radius: 100px;
  text-decoration: none;
  transition: opacity .2s;
}
.mo__error-btn:hover { opacity: .85; }

/* Page */
.mo__page { padding-bottom: 60px; }
.mo__container { max-width: 560px; margin: 0 auto; padding: 0 16px; }

/* Topbar */
.mo__topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: calc(70px + env(safe-area-inset-top)) 0 20px;
}
.mo__home-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.8rem; color: rgba(240,237,232,.4); text-decoration: none;
}
.mo__home-link:hover { color: #f0ede8; }
.mo__order-num { font-size: 0.8rem; color: rgba(240,237,232,.3); }

/* Status */
.mo__status-row {
  display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;
}
.mo__status {
  display: inline-block; padding: 4px 14px; border-radius: 100px;
  font-size: 0.8rem; font-weight: 700; letter-spacing: .02em;
}
.mo__status--pending     { background: rgba(212,175,55,.15); color: #d4af37; }
.mo__status--confirmed   { background: rgba(99,211,157,.15); color: #63d39d; }
.mo__status--in_progress { background: rgba(99,180,255,.15); color: #63b4ff; }
.mo__status--completed   { background: rgba(99,211,157,.2);  color: #63d39d; }
.mo__status--cancelled   { background: rgba(248,113,113,.15);color: #f87171; }
.mo__created { font-size: 0.78rem; color: rgba(240,237,232,.3); }

/* Card */
.mo__card {
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 16px; overflow: hidden; margin-bottom: 20px;
}
.mo__card-img { height: 160px; overflow: hidden; background: #111118; }
.mo__card-img img { width: 100%; height: 100%; object-fit: cover; }
.mo__card-img--empty {
  background: radial-gradient(ellipse at center, rgba(212,175,55,.12), #0a0a0f);
}
.mo__card-body { padding: 16px 20px; }
.mo__card-label { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: rgba(240,237,232,.3); margin: 0 0 4px; }
.mo__card-title { font-size: 1.2rem; font-weight: 900; margin: 0; }

/* Details */
.mo__details {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;
}
.mo__detail {
  display: flex; align-items: flex-start; gap: 10px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.07);
  border-radius: 12px; padding: 12px 14px;
}
.mo__detail-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }
.mo__detail-label { font-size: 0.72rem; color: rgba(240,237,232,.35); margin-bottom: 2px; }
.mo__detail-val { font-size: 0.9rem; font-weight: 700; color: #f0ede8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mo__detail-val--price { color: #d4af37; font-size: 1rem; }

/* Features */
.mo__features { margin-bottom: 16px; }
.mo__features-title { font-size: 0.78rem; color: rgba(240,237,232,.4); text-transform: uppercase; letter-spacing: .06em; margin: 0 0 8px; }
.mo__features-list { display: flex; flex-wrap: wrap; gap: 6px; }
.mo__feature {
  background: rgba(212,175,55,.1); border: 1px solid rgba(212,175,55,.2);
  color: #d4af37; border-radius: 100px; padding: 3px 12px; font-size: 0.78rem; font-weight: 600;
}

/* Info banner */
.mo__info-banner {
  display: flex; align-items: flex-start; gap: 12px;
  background: rgba(212,175,55,.07); border: 1px solid rgba(212,175,55,.2);
  border-radius: 14px; padding: 14px 16px; margin-bottom: 16px;
}
.mo__info-banner--done {
  background: rgba(99,211,157,.07); border-color: rgba(99,211,157,.2);
}
.mo__info-icon { font-size: 1.2rem; flex-shrink: 0; }
.mo__info-banner p { margin: 0; font-size: 0.88rem; color: rgba(240,237,232,.7); line-height: 1.55; }
.mo__info-banner strong { color: #f0ede8; }

/* Telegram */
.mo__tg-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 13px;
  background: #229ED9; color: #fff; text-decoration: none;
  border-radius: 100px; font-weight: 700; font-size: 0.92rem;
  transition: opacity .2s; margin-bottom: 12px;
}
.mo__tg-btn:hover { opacity: .88; }

/* Actions */
.mo__actions { display: flex; gap: 10px; }
.mo__btn {
  flex: 1; padding: 12px; border-radius: 100px; font-weight: 700; font-size: 0.9rem;
  text-decoration: none; text-align: center; transition: opacity 0.2s;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
  color: rgba(240,237,232,.6);
}
.mo__btn--primary { background: #d4af37; color: #0a0a0f; border-color: transparent; }
.mo__btn:hover { opacity: .85; }
</style>
