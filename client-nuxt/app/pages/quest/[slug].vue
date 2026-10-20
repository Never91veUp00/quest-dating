<template>
  <div class="qp" :style="cssVars">

    <!-- Подключаем шрифты текущей темы динамически -->


    <!-- Оверлей текстуры -->
    <div v-if="questData && themeObj.overlay === 'scanlines'" class="qp-overlay qp-overlay--scanlines" aria-hidden="true"></div>
    <div v-if="questData && themeObj.overlay === 'grain'"     class="qp-overlay qp-overlay--grain"     aria-hidden="true"></div>
    <div v-if="questData && themeObj.overlay === 'fog'"       class="qp-overlay qp-overlay--fog"       aria-hidden="true"></div>

    <!-- Загрузка -->
    <div v-if="loading" class="qp-loading" role="status">
      <div class="qp-loading__cells" aria-hidden="true">
        <span></span><span></span><span></span>
        <i class="qp-loading__chip"></i>
      </div>
      <div class="qp-loading__text">Раскладываем поле…</div>
    </div>

    <!-- Ошибка -->
    <div v-else-if="fatalError" class="qp-error">
      <div class="qp-error__title">{{ errorView.title }}</div>
      <div class="qp-error__sub">{{ errorView.text }}</div>
      <NuxtLink to="/" class="qp-error__link">На главную</NuxtLink>
    </div>

    <template v-else-if="questData">

      <!-- ── ЗАСТАВКА ── -->
      <QuestIntro
        v-if="showIntro"
        :theme="themeObj"
        :questData="questData"
        @done="showIntro = false"
      />

      <!-- ── СПЛЭШ ── -->
      <transition name="splash-out">
        <QuestSplash
          v-if="!started && !isComplete"
          :questData="questData"
          :theme="themeObj"
          :requiresCode="requiresCode"
          :codeError="codeError"
          @start="handleStart"
          @submit-code="submitCode"
        />
      </transition>

      <!-- ── ПЛЕЕР V1 ── -->
      <transition name="player-in">
        <div v-if="started && currentBlock && !isComplete" class="qp-player">

          <!-- HUD -->
          <header class="qp-hud">
            <div class="qp-hud__row">
              <span class="qp-hud__pts">
                {{ points }}<span class="qp-hud__pts-l"> {{ themeObj.copy.pointsLabel }}</span>
              </span>
              <span class="qp-hud__name">{{ questData.title }}</span>
              <span v-if="themeObj.showTimer" class="qp-hud__time">{{ elapsedStr }}</span>
              <button class="qp-hud__menu-btn" @click.stop="showMenu = !showMenu" aria-label="Меню"><QuestIcon name="menu" :size="22" /></button>
            </div>
            <!-- Desktop dropdown -->
            <transition name="fade">
              <div v-if="showMenu" class="qp-hud__dropdown">
                <button class="qp-hud__dropdown-item" @click="confirmRestart">
                  <QuestIcon name="restart" :size="18" /> Начать сначала
                </button>
              </div>
            </transition>
          </header>

          <!-- Блок -->
          <main class="qp-main">
            <transition name="slide" mode="out-in">
              <QuestBlockBridge
                v-if="showBridge && blocks[blockIdx + 1]"
                :key="'bridge-' + blockIdx"
                :theme="themeObj"
                :nextBlock="blocks[blockIdx + 1]"
                :nextIndex="blockIdx + 1"
                @advance="doNext"
              />
              <QuestBlock
                v-else
                :key="blockIdx"
                :block="currentBlock"
                :theme="themeObj"
                :index="blockIdx"
                :total="totalBlocks"
                :completedIds="completedIds"
                :earnedMap="earnedMap"
                :isLast="isLast"
                @complete-task="onTaskComplete"
                @use-hint="onHint"
                @prev="prev"
                @next="next"
                @finish="finish"
                @skip-task="onSkipTask"
              />
            </transition>
          </main>


        </div>
      </transition>

      <!-- ── МЕНЮ ── -->
      <teleport to="body">
        <transition name="sheet">
          <div v-if="showMenu" class="qp-menu-sheet" :style="cssVars" @click.self="showMenu = false">
            <div class="qp-menu-sheet__panel">
              <div class="qp-menu-sheet__handle"></div>
              <div class="qp-menu-sheet__title">Меню</div>
              <button class="qp-menu-sheet__item" @click="confirmRestart">
                <QuestIcon name="restart" :size="20" />
                <span>Начать сначала</span>
              </button>
              <button class="qp-menu-sheet__close" @click="showMenu = false">Закрыть</button>
            </div>
          </div>
        </transition>
      </teleport>

      <!-- ── ФИНАЛ ── -->
      <transition name="fade">
        <QuestFinish
          v-if="isComplete"
          :questData="questData"
          :theme="themeObj"
          :points="points"
          :maxPoints="maxPoints"
          :selfieUrl="selfiePhoto"
          :completedCount="completedIds.length"
          :elapsed="elapsedStr"
          @share="share"
          @restart="confirmRestart"
        />
      </transition>

    </template>

    <!-- Достижение-тост -->
    <transition name="pop">
      <div v-if="badge" class="qp-badge">
        <span class="qp-badge__ico" aria-hidden="true"><QuestIcon name="check" :size="20" /></span>
        <div>
          <div class="qp-badge__title">{{ badge.title }}</div>
          <div class="qp-badge__sub">{{ badge.sub }}</div>
        </div>
      </div>
    </transition>

    <!-- Confirm restart dialog -->
    <transition name="fade">
      <div v-if="showRestartConfirm" class="qp-confirm-overlay" @click.self="showRestartConfirm = false">
        <div class="qp-confirm">
          <div class="qp-confirm__title">Начать сначала?</div>
          <div class="qp-confirm__text">Весь прогресс будет сброшен</div>
          <div class="qp-confirm__btns">
            <button class="qp-confirm__btn qp-confirm__btn--cancel" @click="showRestartConfirm = false">Отмена</button>
            <button class="qp-confirm__btn qp-confirm__btn--confirm" @click="doRestart">Сбросить</button>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { getTheme, themeToCssVars } from '~/components/quest/themes.js'
import QuestBlockBridge from '~/components/quest/QuestBlockBridge.vue'
import QuestIcon from '../../components/quest/QuestIcon.vue'


const route = useRoute()
const slug  = computed(() => route.params.slug)

// ─── API ──────────────────────────────────────────────────────
const config  = useRuntimeConfig()

const apiFetch = (path, opts = {}) => {
  const baseURL = import.meta.client ? config.public.apiBase : config.apiBaseInternal
  const token   = useCookie('auth_token')
  return $fetch(`${baseURL}${path}`, {
    headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    ...opts,
  })
}

// ─── Quest service (inline) ───────────────────────────────────
// ─── SSR SEO (только мета-теги для превью) ───────────────────
const { data: seoData } = await useAsyncData(
  () => `quest-seo-${slug.value}`,
  async () => {
    try {
      const baseURL = import.meta.server
        ? (useRuntimeConfig().apiBaseInternal || 'http://server:5000/api')
        : useRuntimeConfig().public.apiBase
      const res = await $fetch(`${baseURL}/quests/${slug.value}`)
      return res?.data ?? res ?? null
    } catch { return null }
  }
)
const SITE_URL = 'https://questdating.ru'
useSeoMeta({
  title: () => seoData.value?.title ? `${seoData.value.title} — Quest Dating` : 'Quest Dating',
  ogTitle: () => seoData.value?.title || 'Свидание-квест',
  ogDescription: () => seoData.value?.tagline || 'Персональный квест-сюрприз для вашей пары',
  ogImage: () => seoData.value?.cover_image
    ? `${SITE_URL}${seoData.value.cover_image}`
    : `${SITE_URL}/og-image-quest.jpg`,
  ogUrl: () => `${SITE_URL}/quest/${slug.value}`,
  twitterCard: 'summary_large_image',
  twitterImage: () => seoData.value?.cover_image
    ? `${SITE_URL}${seoData.value.cover_image}`
    : `${SITE_URL}/og-image-quest.jpg`,
})

const questService = {
  getBySlug:      (slug, params = {})        => apiFetch(`/quests/${slug}`, { params }),
  submitAccessCode: (slug, code)             => apiFetch(`/quests/${slug}/access`, { method: 'POST', body: { access_code: code } }),
  createSession:  (questId, data = {})       => apiFetch(`/quests/${questId}/session`, { method: 'POST', body: data }),
  updateProgress: (sessionId, data)          => apiFetch(`/quests/session/${sessionId}`, { method: 'PATCH', body: data }),
  completeQuest:  (sessionId, data = {})     => apiFetch(`/quests/session/${sessionId}/complete`, { method: 'POST', body: data }),
  restartQuest:   (sessionId, questId)        => apiFetch(`/quests/session/${sessionId}/restart`, { method: 'POST', body: { quest_id: questId } }),
}

// ─── State ────────────────────────────────────────────────────
const questData    = ref(null)
const sessionData  = ref(null)
const loading      = ref(true)
const fatalError   = ref(null)
const requiresCode = ref(false)
const codeError    = ref('')


const started             = ref(false)
const showIntro           = ref(false)
const isComplete          = ref(false)
const blockIdx            = ref(0)
const completedIds        = ref([])
const earnedMap           = ref({})
const points              = ref(0)
const hintsUsed           = ref(0)
const badge               = ref(null)
const showMenu            = ref(false)
const showRestartConfirm  = ref(false)
const showBridge          = ref(false)
const selfiePhoto         = ref(null)

// ─── Timer ────────────────────────────────────────────────────
const startTs = ref(0)
const nowTs   = ref(Date.now())
let ticker = null

// ─── Ошибка для игрока ───────────────────────────────────────
const errorView = computed(() => {
  const msg = fatalError.value || ''
  if (/истёк/i.test(msg)) {
    return { title: 'Срок квеста истёк', text: 'Попроси того, кто подарил квест, продлить его.' }
  }
  if (/\b404\b|not found|не найден/i.test(msg)) {
    return { title: 'Квест не найден', text: 'В ссылке могла закрасться опечатка. Проверь её у того, кто подарил квест.' }
  }
  return { title: 'Квест не открылся', text: 'Проверь интернет и обнови страницу.' }
})

// ─── Theme ────────────────────────────────────────────────────
const themeObj = computed(() => ({
  ...getTheme(questData.value?.theme || 'city'),
  gender: questData.value?.recipient_gender || 'f',
}))
const cssVars  = computed(() => themeToCssVars(themeObj.value))

// Под плеером не должен проступать чёрный фон сайта: body = поле темы
useHead(() => ({
  htmlAttrs: { lang: 'ru' },
  bodyAttrs: { style: `background-color: ${cssVars.value['--field']}` },
}))

watchEffect(() => {
  if (!themeObj.value?.fonts?.googleFonts) return
  useHead({
    link: [{
      rel: 'stylesheet',
      href: `https://fonts.googleapis.com/css2?family=${themeObj.value.fonts.googleFonts}&display=swap`,
    }]
  })
})

// ─── Computed ─────────────────────────────────────────────────
const blocks       = computed(() => questData.value?.blocks || [])
const totalBlocks  = computed(() => blocks.value.length)
const totalTasks   = computed(() => blocks.value.reduce((s, b) => s + (b.tasks?.length || 0), 0))
const maxPoints    = computed(() => blocks.value.flatMap(b => b.tasks || []).reduce((s, t) => s + (t.points || 0), 0) || 100)
const currentBlock = computed(() => blocks.value[blockIdx.value] || null)
const isLast       = computed(() => blockIdx.value === totalBlocks.value - 1)

const progressPct = computed(() =>
  totalTasks.value ? Math.round((completedIds.value.length / totalTasks.value) * 100) : 0
)

const elapsedStr = computed(() => {
  if (!startTs.value) return '0:00'
  const s = Math.floor((nowTs.value - startTs.value) / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

const isBlockDone = (i) => {
  const b = blocks.value[i]
  return b?.tasks?.length && b.tasks.every(t => completedIds.value.includes(t.id))
}

// ─── Persist (localStorage — только client) ───────────────────
const STORAGE_KEY = computed(() => `quest_progress_${slug.value}`)

const persistState = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY.value, JSON.stringify({
      blockIdx:     blockIdx.value,
      completedIds: completedIds.value,
      earnedMap:    earnedMap.value,
      points:       points.value,
      hintsUsed:    hintsUsed.value,
      startTs:      startTs.value,
      started:      started.value,
      sessionId:    sessionData.value?.session_id || null,
      savedAt:      Date.now()
    }))
  } catch { }
}

const loadPersistedState = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY.value)
    if (!raw) return null
    const state = JSON.parse(raw)
    if (Date.now() - state.savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(STORAGE_KEY.value)
      return null
    }
    return state
  } catch { return null }
}

const clearPersistedState = () => {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(STORAGE_KEY.value) } catch { }
}

// ─── Load ─────────────────────────────────────────────────────
const loadQuest = async () => {
  loading.value    = true
  fatalError.value = null
  try {
    // Preview-режим из админки
    if (route.query.preview === '1') {
      try {
        const raw = sessionStorage.getItem('quest_preview')
        if (raw) {
          questData.value = JSON.parse(raw)
          showIntro.value = questData.value.show_intro !== false
          loading.value = false
          return
        }
      } catch {}
    }

    let res
    try {
      res = await questService.getBySlug(slug.value)
    } catch (err) {
      //  бросает исключение при 4xx.
      // 403 с requires_code — штатная ситуация (квест защищён кодом доступа).
      if (err?.data?.requires_code) {
        requiresCode.value = true
        questData.value = err.data?.data ?? null
        return
      }
      throw err
    }

    if (res?.requires_code) {
      requiresCode.value = true
      questData.value = res.data ?? null
      return
    }

    questData.value    = res?.data ?? res
    requiresCode.value = false

    // Восстанавливаем сохранённый прогресс
    const saved = loadPersistedState()
    if (saved && saved.started) {
      blockIdx.value     = saved.blockIdx     ?? 0
      completedIds.value = saved.completedIds ?? []
      earnedMap.value    = saved.earnedMap    ?? {}
      points.value       = saved.points       ?? 0
      hintsUsed.value    = saved.hintsUsed    ?? 0
      startTs.value      = saved.startTs      ?? Date.now()
      started.value      = true
      showIntro.value    = false
      if (saved.sessionId) sessionData.value = { session_id: saved.sessionId }
      ticker = setInterval(() => { nowTs.value = Date.now() }, 1000)
      flash('🔄', 'Прогресс восстановлен', `Блок ${(saved.blockIdx ?? 0) + 1}`)
    } else {
      showIntro.value = questData.value.show_intro !== false
    }
  } catch (err) {
    fatalError.value = err?.message || 'Квест не найден'
  } finally {
    loading.value = false
  }
}

const submitCode = async (code) => {
  codeError.value = ''
  try {
    const res = await questService.submitAccessCode(slug.value, code)
    questData.value    = res?.data ?? res
    requiresCode.value = false
  } catch {
    codeError.value = 'Неверный код'
    setTimeout(() => { codeError.value = '' }, 3000)
  }
}

// ─── Start ────────────────────────────────────────────────────
const handleStart = async () => {
  try {
    const res = await questService.createSession(questData.value.id)
    sessionData.value = res?.data ?? res
  } catch { /* оффлайн */ }

  started.value = true
  startTs.value = Date.now()
  ticker = setInterval(() => { nowTs.value = Date.now() }, 1000)
  flash('⚡', 'Начинаем!', themeObj.value.copy.eyebrow)
}

// ─── Tasks ────────────────────────────────────────────────────
const onTaskComplete = (task) => {
  if (completedIds.value.includes(task.id)) return
  completedIds.value.push(task.id)
  if (task._selfieUrl) selfiePhoto.value = task._selfieUrl
  const earned = task.points ?? 10
  earnedMap.value[task.id] = { points: earned, wrong: task._quizWrong === true }
  points.value += earned

  if (completedIds.value.length === 1)
    flash('🎯', 'Первый шаг!', 'Продолжай в том же духе')
  else if (completedIds.value.length === totalTasks.value)
    flash('🏆', 'Все задания!', 'Финал близко...')

  saveProgress()
}

const onHint = () => {
  hintsUsed.value++
  points.value = Math.max(0, points.value - 10)
  saveProgress()
}

const onSkipTask = (task) => {
  if (completedIds.value.includes(task.id)) return
  completedIds.value.push(task.id)
  earnedMap.value[task.id] = { points: 0, wrong: true }
  flash('⏭️', 'Пропущено', 'Можно вернуться позже')
  saveProgress()
}

// ─── Navigation ───────────────────────────────────────────────
const next = () => {
  doNext()
}
const doNext = () => {
  showBridge.value = false
  blockIdx.value++
  window.scrollTo({ top: 0, behavior: 'smooth' })
  saveProgress()
}

const prev = () => {
  if (blockIdx.value > 0) {
    blockIdx.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const finish = async () => {
  const secs = Math.floor((Date.now() - startTs.value) / 1000)
  clearInterval(ticker)
  if (sessionData.value) {
    try { await questService.completeQuest(sessionData.value.session_id, { total_time_seconds: secs, quest_id: questData.value?.id }) }
    catch { }
  }
  isComplete.value = true
  started.value    = false
  clearPersistedState()
}

// ─── Restart ──────────────────────────────────────────────────
const confirmRestart = () => {
  showMenu.value = false
  showRestartConfirm.value = true
}

const doRestart = async () => {
  showRestartConfirm.value = false
  clearInterval(ticker)

  if (sessionData.value) {
    try { await questService.restartQuest(sessionData.value.session_id, questData.value.id) } catch { }
  }

  blockIdx.value     = 0
  completedIds.value = []
  points.value       = 0
  hintsUsed.value    = 0
  isComplete.value   = false
  started.value      = false
  clearPersistedState()
  flash('🔄', 'Сброшено', 'Начинаем заново!')
}

// ─── Save progress ────────────────────────────────────────────
const saveProgress = async () => {
  persistState()
  if (!sessionData.value) return
  try {
    await questService.updateProgress(sessionData.value.session_id, {
      quest_id:               questData.value?.id,
      completed_tasks:        completedIds.value,
      current_block_position: blockIdx.value,
      points:                 points.value,
      hints_used:             hintsUsed.value,
      achievements:           []
    })
  } catch { }
}

// ─── Badge ────────────────────────────────────────────────────
const flash = (icon, title, sub) => {
  badge.value = { icon, title, sub }
  setTimeout(() => { badge.value = null }, 2800)
}

// ─── Share ────────────────────────────────────────────────────
const share = () => {
  const text = `Я прошёл квест «${questData.value.title}» и набрал ${points.value} ${themeObj.value.copy.pointsLabel}! 🎯`
  if (navigator.share) navigator.share({ title: 'Quest Dating', text, url: location.href })
  else navigator.clipboard?.writeText(text).then(() => flash('📋', 'Скопировано!', ''))
}

// ─── Watchers ─────────────────────────────────────────────────
watch([blockIdx, completedIds, points], () => {
  if (started.value) persistState()
}, { deep: true })

const closeMenu = (e) => {
  if (
    e.target.closest('.qp-hud__dropdown') ||
    e.target.closest('.qp-menu-sheet__panel') ||
    e.target.closest('.qp-hud__menu-btn')
  ) return
  showMenu.value = false
}

// ─── Lifecycle ────────────────────────────────────────────────
onMounted(() => {
  loadQuest()
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  clearInterval(ticker)
  document.removeEventListener('click', closeMenu)
})
</script>

<style scoped>
.qp { min-height: 100dvh; background: var(--base-bg); color: var(--text); font-family: var(--font-b); position: relative; overflow-x: hidden; overflow-x: clip; -webkit-font-smoothing: antialiased; -webkit-tap-highlight-color: transparent; }
.qp-overlay { pointer-events: none; position: fixed; inset: 0; z-index: 9999; }
.qp-overlay--scanlines { background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px); }
.qp-overlay--grain { background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"); background-repeat: repeat; background-size: 200px 200px; opacity: 0.5; }
.qp-overlay--fog { background: radial-gradient(ellipse 100% 60% at 50% 100%, rgba(167,139,250,0.05) 0%, transparent 70%); animation: fog-shift 15s ease-in-out infinite alternate; }
@keyframes fog-shift { to { transform: translateX(20px); } }
/* Загрузка и ошибка: тема ещё неизвестна — нейтральный картон, не зависит от темы */
.qp-loading, .qp-error { --board: #3a322b; --board-ink: #efe6d6; --board-soft: #d9cdb8; --note: #c9ad80; --pin: #9f2b25; background: var(--board); color: var(--board-ink); }
.qp-loading { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; }
.qp-loading__cells { position: relative; display: flex; gap: 14px; padding-top: 18px; }
.qp-loading__cells span { width: 26px; height: 26px; border-radius: 4px; background: var(--note); }
.qp-loading__chip { position: absolute; top: 0; left: 6px; width: 14px; height: 14px; border-radius: 50%; background: var(--pin); border: 2px solid #241e19; animation: qp-hop 1.5s cubic-bezier(.16, 1, .3, 1) infinite; }
@keyframes qp-hop { 0%, 20% { left: 6px; } 40%, 53% { left: 46px; } 73%, 100% { left: 86px; } }
@media (prefers-reduced-motion: reduce) { .qp-loading__chip { animation: none; } }
@keyframes spin { to { transform: rotate(360deg); } }
.qp-loading__text { font-family: 'PT Serif', Georgia, serif; font-size: 1.05rem; color: var(--board-soft); }
.qp-error { min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 32px 20px; text-align: center; }
.qp-error__title { font-family: 'PT Serif', Georgia, serif; font-weight: 700; font-size: 1.5rem; color: var(--board-ink); }
.qp-error__sub { font-family: 'PT Serif', Georgia, serif; color: var(--board-soft); font-size: 1.05rem; max-width: 32ch; }
.qp-error__link { display: inline-flex; align-items: center; min-height: 48px; margin-top: 8px; padding: 0 20px; border-radius: 10px; background: var(--board-ink); color: var(--board); font-family: 'PT Serif', Georgia, serif; font-weight: 700; text-decoration: none; }
.qp-error__link:focus-visible { outline: 3px solid var(--note); outline-offset: 3px; }
.qp-player { min-height: 100dvh; display: flex; flex-direction: column; padding: 64px 0 40px; background: var(--field); }
.qp-hud { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: var(--field); border-bottom: 2px solid color-mix(in srgb, var(--field-ink) 18%, var(--field)); }
.qp-hud__row { display: flex; align-items: center; padding: 8px 12px 8px 16px; gap: 10px; max-width: 600px; margin: 0 auto; }
.qp-hud__pts { font-family: var(--font-d); font-size: 1.15rem; color: var(--field-ink); white-space: nowrap; font-variant-numeric: tabular-nums; }
.qp-hud__pts-l { margin-left: 4px; font-family: var(--font-b); font-size: .9rem; color: var(--field-ink-soft); }
.qp-hud__name { flex: 1; font-family: var(--font-b); font-size: .95rem; color: var(--field-ink-soft); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qp-hud__time { font-family: var(--font-d); font-size: .9rem; color: var(--field-ink-soft); white-space: nowrap; font-variant-numeric: tabular-nums; }
.qp-hud__menu-btn { display: grid; place-items: center; width: 44px; height: 44px; background: none; border: 2px solid color-mix(in srgb, var(--field-ink) 30%, var(--field)); border-radius: 10px; color: var(--field-ink); cursor: pointer; }
.qp-hud__menu-btn:hover { border-color: var(--field-ink); }
.qp-hud__menu-btn:focus-visible { outline: 3px solid var(--field-ink); outline-offset: 2px; }
.qp-hud__dropdown { position: absolute; top: 100%; right: max(12px, calc(50% - 288px)); background: var(--paper); color: var(--ink); border-radius: 10px; padding: 6px; min-width: 200px; box-shadow: 0 16px 24px -12px color-mix(in srgb, var(--rule) 70%, transparent); }
.qp-hud__dropdown-item { display: flex; align-items: center; gap: 10px; width: 100%; background: none; border: none; color: var(--ink); font-family: var(--font-b); font-size: 1rem; padding: 12px 14px; cursor: pointer; border-radius: 6px; text-align: left; }
.qp-hud__dropdown-item:hover { background: color-mix(in srgb, var(--paper-edge) 35%, var(--paper)); }
/* Запас снизу: прилипшая кнопка-глагол не закрывает конец карточки */
.qp-main { flex: 1; padding: 16px 16px calc(88px + var(--kb, 0px)); max-width: 600px; margin: 0 auto; width: 100%; position: relative; }
.qp-badge { position: fixed; top: 68px; left: 50%; transform: translateX(-50%); z-index: 300; background: var(--paper); color: var(--ink); border-radius: 10px; padding: 12px 18px; display: flex; align-items: center; gap: 12px; min-width: 210px; max-width: 320px; box-shadow: 0 16px 24px -12px color-mix(in srgb, var(--rule) 75%, transparent); }
.qp-badge__ico { display: grid; place-items: center; width: 34px; height: 34px; flex-shrink: 0; border-radius: 50%; background: var(--action); color: var(--action-ink); }
.qp-badge__title { font-family: var(--font-d); font-size: 1rem; color: var(--ink); }
.qp-badge__sub { font-family: var(--font-b); font-size: .9rem; color: var(--ink-soft); margin-top: 2px; }
.qp-confirm-overlay { position: fixed; inset: 0; z-index: 500; background: color-mix(in srgb, var(--rule) 60%, transparent); display: flex; align-items: center; justify-content: center; padding: 20px; }
.qp-confirm { background: var(--paper); color: var(--ink); border-radius: 12px; padding: 26px 22px 22px; max-width: 340px; width: 100%; box-shadow: 0 20px 30px -16px color-mix(in srgb, var(--rule) 80%, transparent); }
.qp-confirm__title { font-family: var(--font-d); font-size: 1.35rem; color: var(--ink); margin-bottom: 8px; }
.qp-confirm__text { font-family: var(--font-b); font-size: 1.05rem; color: var(--ink-soft); margin-bottom: 22px; }
.qp-confirm__btns { display: flex; gap: 10px; }
.qp-confirm__btn { flex: 1; min-height: 52px; border-radius: 10px; font-family: var(--font-d); font-size: 1rem; cursor: pointer; border: none; }
.qp-confirm__btn--cancel { background: transparent; color: var(--ink); border: 2px solid var(--ink); }
.qp-confirm__btn--confirm { background: var(--wrong); color: var(--paper); }
.qp-confirm__btn:focus-visible { outline: 3px solid var(--chip); outline-offset: 2px; }
.qp ::selection { background: var(--chip); color: var(--paper); }
.qp { scrollbar-color: color-mix(in srgb, var(--field-ink) 35%, var(--field)) var(--field); }
.splash-out-leave-active { transition: opacity .5s ease, transform .5s ease; }
.splash-out-leave-to { opacity: 0; transform: scale(1.04); }
.player-in-enter-active { transition: opacity .5s .1s ease; }
.player-in-enter-from { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: opacity .55s cubic-bezier(.4,0,.2,1), transform .55s cubic-bezier(.4,0,.2,1); }
.slide-enter-from { opacity: 0; transform: translateX(48px); }
.slide-leave-to   { opacity: 0; transform: translateX(-48px); }
.fade-enter-active { transition: opacity .3s ease; }
.fade-enter-from { opacity: 0; }
.fade-leave-active { transition: opacity .2s ease; }
.fade-leave-to { opacity: 0; }
.pop-enter-active { transition: opacity .28s ease, transform .28s ease; }
.pop-leave-active { transition: opacity .2s ease; }
.pop-enter-from { opacity: 0; transform: translateY(-10px); }
.pop-leave-to { opacity: 0; }
.qp-menu-sheet { display: none; }
@media (max-width: 480px) {
  .qp-hud__dropdown { display: none !important; }
  .qp-menu-sheet { display: flex; position: fixed; inset: 0; z-index: 400; align-items: flex-end; background: color-mix(in srgb, var(--rule) 55%, transparent); }
  .qp-menu-sheet__panel { width: 100%; background: var(--paper); color: var(--ink); border-radius: 16px 16px 0 0; padding: 12px 16px max(28px, env(safe-area-inset-bottom, 0px) + 16px); }
  .qp-menu-sheet__handle { width: 44px; height: 5px; background: color-mix(in srgb, var(--ink) 30%, var(--paper)); border-radius: 3px; margin: 0 auto 18px; }
  .qp-menu-sheet__title { font-family: var(--font-d); font-size: 1.25rem; color: var(--ink); margin-bottom: 12px; }
  .qp-menu-sheet__item { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 56px; background: color-mix(in srgb, var(--paper-edge) 30%, var(--paper)); border: none; border-radius: 10px; color: var(--ink); font-family: var(--font-b); font-size: 1.05rem; padding: 0 16px; cursor: pointer; text-align: left; margin-bottom: 10px; }
  .qp-menu-sheet__close { display: block; width: 100%; min-height: 52px; background: transparent; border: 2px solid var(--ink); border-radius: 10px; color: var(--ink); font-family: var(--font-d); font-size: 1rem; cursor: pointer; }
  .qp-main { padding: 14px 12px calc(88px + var(--kb, 0px)); }
  .qp-hud__row { padding: 8px 10px 8px 14px; }
}
.sheet-enter-active, .sheet-leave-active { transition: opacity .25s ease; }
.sheet-enter-active .qp-menu-sheet__panel, .sheet-leave-active .qp-menu-sheet__panel { transition: transform .3s cubic-bezier(.22,1,.36,1); }
.sheet-leave-active .qp-menu-sheet__panel { transition: transform .2s ease-in; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .qp-menu-sheet__panel, .sheet-leave-to .qp-menu-sheet__panel { transform: translateY(100%); }
</style>