<template>
  <div class="op">

    <div v-if="loading" class="op__loading">
      <Loader text="Загружаем квест..." />
    </div>

    <div v-else-if="error || !template" class="op__error">
      <p>😕 Квест не найден</p>
      <NuxtLink to="/catalog" class="op__back">← В каталог</NuxtLink>
    </div>

    <template v-else>

      <!-- Шапка с инфо о квесте -->
      <section class="op__head">
        <div class="op__container">
          <NuxtLink :to="`/date/${template.slug}`" class="op__back-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            {{ template.title }}
          </NuxtLink>
          <h1 class="op__title">Оформление заказа</h1>
          <div class="op__meta">
            <span>⏱ {{ formatDur(template.duration_minutes) }}</span>
            <span class="op__dot">·</span>
            <span>{{ locationLabel }}</span>
            <span class="op__dot">·</span>
            <span class="op__price">{{ formatPrice(template.base_price) }}</span>
          </div>
        </div>
      </section>

      <!-- Форма + саммари -->
      <div class="op__container op__body">
        <div class="op__layout">

          <!-- Форма -->
          <div class="op__form-wrap">
            <!-- Ошибка заказа — всегда видна если toast не работает -->
            <transition name="err-slide">
              <div v-if="orderError" class="op__order-error">
                <span>⚠️ {{ orderError }}</span>
                <button @click="orderError = ''" class="op__order-error-close">×</button>
              </div>
            </transition>
            <OrderForm
              :template="template"
              :on-submit="handleSubmit"
            />
          </div>

          <!-- Саммари (десктоп) -->
          <aside class="op__aside">
            <div class="op__summary">
              <div class="op__summary-img">
                <img
                  v-if="template.cover_image"
                  :src="template.cover_image"
                  :alt="template.title"
                  loading="lazy"
                />
                <div v-else class="op__summary-fallback"></div>
              </div>
              <div class="op__summary-body">
                <p class="op__summary-cat">{{ template.category_name }}</p>
                <h3 class="op__summary-title">{{ template.title }}</h3>
                <p class="op__summary-tagline">{{ template.tagline }}</p>
                <div class="op__summary-price">
                  <span class="op__summary-price-label">Стоимость</span>
                  <span class="op__summary-price-val">{{ formatPrice(template.base_price) }}</span>
                </div>
              </div>
            </div>

            <div class="op__guarantee">
              <span class="op__guarantee-icon">🛡️</span>
              <div>
                <strong>Гарантия возврата</strong>
                <p>Если квест не понравится — вернём деньги</p>
              </div>
            </div>
            <div class="op__guarantee">
              <span class="op__guarantee-icon">⚡</span>
              <div>
                <strong>Готово за 24 часа</strong>
                <p>Лиза напишет сразу после получения заявки</p>
              </div>
            </div>
          </aside>

        </div>
      </div>

      <!-- Успех -->
      <Teleport to="body">
        <transition name="success-fade">
          <div v-if="showSuccess" class="op__success-overlay">
            <div class="op__success">
              <div class="op__success-icon">🎉</div>
              <h2>Заявка отправлена!</h2>
              <p>Лиза получила ваш заказ и уже начала работу. Квест будет готов в течение 24 часов — пришлём на {{ orderEmail }}.</p>
              <div class="op__success-detail">
                <span>Номер заказа:</span>
                <strong>#{{ orderId }}</strong>
              </div>
              <div class="op__success-actions">
                <NuxtLink to="/" class="op__success-btn op__success-btn--primary">На главную</NuxtLink>
                <NuxtLink to="/catalog" class="op__success-btn">Другие квесты</NuxtLink>
              </div>
            </div>
          </div>
        </transition>
      </Teleport>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const route  = useRoute()
const toast  = useToast()
const { getDate, createOrder } = useDatesApi()

const template    = ref(null)
const loading     = ref(true)
const error       = ref(null)
const showSuccess = ref(false)
const orderId     = ref(null)
const orderEmail  = ref('')
const orderError  = ref('')

useSeoMeta({
  title: () => template.value ? `Заказать «${template.value.title}» | Quest Dating` : 'Оформление заказа | Quest Dating',
})

const locationLabel = computed(() => ({
  indoor: 'Дома', city: 'По городу', park: 'Парк', universal: 'Любое'
}[template.value?.location_type] || ''))

const loadTemplate = async () => {
  loading.value = true
  error.value   = null
  try {
    const res = await getDate(route.params.templateSlug)
    template.value = res?.data ?? res
  } catch (e) {
    error.value = e.message || 'Не удалось загрузить квест'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async (orderData) => {
  try {
    const res = await createOrder({ ...orderData, template_id: template.value.id })
    orderId.value    = res?.data?.id ?? res?.id
    orderEmail.value = orderData.client_email
    showSuccess.value = true
    if (import.meta.client) document.body.style.overflow = 'hidden'
  } catch (e) {
    const msg = e.message || 'Ошибка при оформлении заказа'
    // Используем toast если доступен, иначе — встроенный alert (надёжно на мобильных)
    if (toast.error) {
      toast.error(msg)
    }
    // Всегда показываем встроенную ошибку — toast может не работать
    orderError.value = msg
  }
}

function formatPrice(v) { return v ? `${Math.round(Number(v)/100).toLocaleString('ru')} ₽` : '—' }
function formatDur(m) { if (!m) return ''; const h=Math.floor(m/60),mn=m%60; return h>0?(mn>0?`${h}ч ${mn}м`:`${h}ч`):`${mn}м` }

onMounted(loadTemplate)
</script>

<style scoped>
.op { background: #0a0a0f; color: #f0ede8; min-height: 100vh; padding-bottom: 60px; }
.op__container { max-width: 600px; margin: 0 auto; padding: 0 16px; }
@media (min-width: 1024px) { .op__container { max-width: 1100px; padding: 0 24px; } }

.op__loading, .op__error { text-align: center; padding: 100px 20px; display: flex; flex-direction: column; gap: 16px; align-items: center; }
.op__back { color: #d4af37; text-decoration: none; font-weight: 700; }

/* Head */
.op__head {
  padding: calc(70px + env(safe-area-inset-top)) 0 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
}
.op__back-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.8rem; color: rgba(240,237,232,0.4); text-decoration: none; margin-bottom: 8px;
  -webkit-tap-highlight-color: transparent;
}
.op__back-link:hover { color: #f0ede8; }
.op__title { font-size: clamp(1.4rem, 5vw, 1.8rem); font-weight: 900; margin: 0 0 8px; letter-spacing: -0.02em; }
.op__meta { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: rgba(240,237,232,0.45); flex-wrap: wrap; }
.op__dot { opacity: 0.4; }
.op__price { font-weight: 900; color: #d4af37; font-size: 1rem; }

/* Body */
.op__body { padding: 24px 16px; }
.op__layout { display: grid; grid-template-columns: 1fr; gap: 24px; }
@media (min-width: 1024px) { .op__layout { grid-template-columns: 1fr 320px; gap: 40px; align-items: flex-start; } }

/* Aside */
.op__aside { display: none; }
@media (min-width: 1024px) { .op__aside { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 90px; } }

.op__summary {
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; overflow: hidden;
}
.op__summary-img { height: 160px; background: #111118; overflow: hidden; }
.op__summary-img img { width: 100%; height: 100%; object-fit: cover; }
.op__summary-fallback { width: 100%; height: 100%; background: radial-gradient(ellipse at center, #d4af3720, #0a0a0f); }
.op__summary-body { padding: 16px; }
.op__summary-cat { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(240,237,232,0.35); margin: 0 0 4px; }
.op__summary-title { font-size: 1rem; font-weight: 900; color: #f0ede8; margin: 0 0 6px; }
.op__summary-tagline { font-size: 0.8rem; color: rgba(240,237,232,0.45); margin: 0 0 14px; line-height: 1.4; }
.op__summary-price { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px; }
.op__summary-price-label { font-size: 0.78rem; color: rgba(240,237,232,0.35); }
.op__summary-price-val { font-size: 1.2rem; font-weight: 900; color: #d4af37; }

.op__guarantee {
  display: flex; gap: 12px; align-items: flex-start;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px; padding: 14px;
}
.op__guarantee-icon { font-size: 1.3rem; flex-shrink: 0; }
.op__guarantee strong { display: block; font-size: 0.88rem; font-weight: 800; color: #f0ede8; margin-bottom: 2px; }
.op__guarantee p { font-size: 0.78rem; color: rgba(240,237,232,0.45); margin: 0; line-height: 1.4; }

/* Success */
.op__success-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.85);
  backdrop-filter: blur(8px); z-index: 2000;
  display: flex; align-items: center; justify-content: center; padding: 20px;
}
.op__success {
  background: #111118; border: 1px solid rgba(212,175,55,0.25);
  border-radius: 24px; padding: 32px 24px;
  max-width: 440px; width: 100%; text-align: center;
}
.op__success-icon { font-size: 3rem; margin-bottom: 16px; }
.op__success h2 { font-size: 1.4rem; font-weight: 900; color: #f0ede8; margin: 0 0 12px; }
.op__success p { font-size: 0.9rem; color: rgba(240,237,232,0.6); line-height: 1.6; margin: 0 0 20px; }
.op__success-detail {
  display: flex; justify-content: space-between;
  background: rgba(255,255,255,0.04); border-radius: 10px; padding: 10px 14px;
  font-size: 0.85rem; color: rgba(240,237,232,0.5); margin-bottom: 20px;
}
.op__success-detail strong { color: #d4af37; }
.op__success-actions { display: flex; gap: 10px; }
.op__success-btn {
  flex: 1; padding: 12px; border-radius: 100px; font-weight: 700; font-size: 0.9rem;
  text-decoration: none; text-align: center; transition: opacity 0.2s;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
  color: rgba(240,237,232,0.6);
}
.op__success-btn--primary { background: #d4af37; color: #0a0a0f; border-color: transparent; }

.success-fade-enter-active, .success-fade-leave-active { transition: opacity 0.25s; }
.success-fade-enter-from, .success-fade-leave-to { opacity: 0; }

/* Order error banner */
.op__order-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: rgba(248,113,113,0.12);
  border: 1px solid rgba(248,113,113,0.3);
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 16px;
  font-size: 0.88rem;
  color: #fca5a5;
}
.op__order-error-close {
  background: none;
  border: none;
  color: #fca5a5;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
}
.err-slide-enter-active, .err-slide-leave-active { transition: opacity 0.3s; }
.err-slide-enter-from, .err-slide-leave-to { opacity: 0; }

</style>