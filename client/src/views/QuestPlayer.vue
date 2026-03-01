<template>
  <div class="qp" :style="cssVars">

    <!-- Подключаем шрифты текущей темы динамически -->
    <component :is="'style'">
      @import url('https://fonts.googleapis.com/css2?family={{ themeObj.fonts.googleFonts }}&display=swap');
    </component>

    <!-- Оверлей текстуры -->
    <div v-if="themeObj.overlay === 'scanlines'"  class="qp-overlay qp-overlay--scanlines" aria-hidden="true"></div>
    <div v-if="themeObj.overlay === 'grain'"       class="qp-overlay qp-overlay--grain"     aria-hidden="true"></div>
    <div v-if="themeObj.overlay === 'fog'"         class="qp-overlay qp-overlay--fog"        aria-hidden="true"></div>

    <!-- Загрузка -->
    <div v-if="loading" class="qp-loading">
      <div class="qp-loading__ring"></div>
      <div class="qp-loading__text">Загрузка...</div>
    </div>

    <!-- Ошибка -->
    <div v-else-if="fatalError" class="qp-error">
      <div class="qp-error__icon">💀</div>
      <div class="qp-error__title">Квест не найден</div>
      <div class="qp-error__sub">{{ fatalError }}</div>
      <router-link to="/" class="qp-error__link">← На главную</router-link>
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

      <!-- ── ПЛЕЕР ── -->
      <transition name="player-in">
        <div v-if="started && currentBlock && !isComplete" class="qp-player">

          <!-- HUD -->
          <header class="qp-hud">
            <div class="qp-hud__bar">
              <div class="qp-hud__fill" :style="{ width: progressPct + '%' }"></div>
            </div>
            <div class="qp-hud__row">
              <span class="qp-hud__step">{{ blockIdx + 1 }}<span class="qp-hud__step-of">/{{ totalBlocks }}</span></span>
              <span class="qp-hud__name">{{ questData.title }}</span>
              <span class="qp-hud__time">{{ elapsedStr }}</span>
              <button class="qp-hud__menu-btn" @click.stop="showMenu = !showMenu" aria-label="Меню">⋮</button>
            </div>
            <!-- Desktop dropdown -->
            <transition name="fade">
              <div v-if="showMenu" class="qp-hud__dropdown">
                <button class="qp-hud__dropdown-item" @click="confirmRestart">
                  🔄 Начать сначала
                </button>
              </div>
            </transition>
            <!-- Mobile bottom sheet (rendered outside header via teleport) -->
            <teleport to="body">
              <transition name="sheet">
                <div v-if="showMenu" class="qp-menu-sheet" @click.self="showMenu = false">
                  <div class="qp-menu-sheet__panel">
                    <div class="qp-menu-sheet__handle"></div>
                    <div class="qp-menu-sheet__title">Меню</div>
                    <button class="qp-menu-sheet__item" @click="confirmRestart">
                      <span class="qp-menu-sheet__ico">🔄</span>
                      <span>Начать сначала</span>
                    </button>
                    <button class="qp-menu-sheet__close" @click="showMenu = false">Закрыть</button>
                  </div>
                </div>
              </transition>
            </teleport>
          </header>

          <!-- Блок -->
          <main class="qp-main">
            <transition name="slide" mode="out-in">
              <QuestBlock
                :key="blockIdx"
                :block="currentBlock"
                :theme="themeObj"
                :index="blockIdx"
                :total="totalBlocks"
                :completedIds="completedIds"
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

          <!-- Footer -->
          <footer class="qp-foot">
            <div class="qp-foot__pts">
              <span class="qp-foot__pts-n">{{ points }}</span>
              <span class="qp-foot__pts-l">{{ themeObj.copy.pointsLabel }}</span>
            </div>
            <div class="qp-foot__dots">
              <span
                v-for="(_, i) in blocks"
                :key="i"
                class="qp-foot__dot"
                :class="{ cur: i === blockIdx, done: isBlockDone(i) }"
              ></span>
            </div>
          </footer>

        </div>
      </transition>

      <!-- ── ФИНАЛ ── -->
      <transition name="fade">
        <QuestFinish
          v-if="isComplete"
          :questData="questData"
          :theme="themeObj"
          :points="points"
          :completedCount="completedIds.length"
          :elapsed="elapsedStr"
          @share="share"
          @restart="confirmRestart"
        />
      </transition>

    </template>

    <!-- Достижение-тост — СВЕРХУ СПРАВА -->
    <transition name="pop">
      <div v-if="badge" class="qp-badge">
        <span class="qp-badge__ico">{{ badge.icon }}</span>
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
          <div class="qp-confirm__icon">🔄</div>
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
import { useRoute } from 'vue-router'
import { questService } from '@/services/questService'
import { getTheme, themeToCssVars } from '@/components/quest/themes.js'
import QuestSplash from '@/components/quest/QuestSplash.vue'
import QuestIntro  from '@/components/quest/QuestIntro.vue'
import QuestBlock  from '@/components/quest/QuestBlock.vue'
import QuestFinish from '@/components/quest/QuestFinish.vue'

// ─── Route ────────────────────────────────────────────────────
const route = useRoute()
const slug  = computed(() => route.params.slug)

// ─── API state ────────────────────────────────────────────────
const questData    = ref(null)
const sessionData  = ref(null)
const loading      = ref(true)
const fatalError   = ref(null)
const requiresCode = ref(false)
const codeError    = ref('')

// ─── Quest state ──────────────────────────────────────────────
const started      = ref(false)
const showIntro    = ref(false)
const isComplete   = ref(false)
const blockIdx     = ref(0)
const completedIds = ref([])
const points       = ref(0)
const hintsUsed    = ref(0)
const badge        = ref(null)
const showMenu     = ref(false)
const showRestartConfirm = ref(false)

// ─── Timer ────────────────────────────────────────────────────
const startTs = ref(0)
const nowTs   = ref(Date.now())
let ticker = null

// ─── Theme ───────────────────────────────────────────────────
const themeObj = computed(() => getTheme(questData.value?.theme || 'city'))
const cssVars  = computed(() => themeToCssVars(themeObj.value))

// ─── Computed ─────────────────────────────────────────────────
const blocks       = computed(() => questData.value?.blocks || [])
const totalBlocks  = computed(() => blocks.value.length)
const totalTasks   = computed(() => blocks.value.reduce((s, b) => s + (b.tasks?.length || 0), 0))
const currentBlock = computed(() => blocks.value[blockIdx.value] || null)
const isLast       = computed(() => blockIdx.value === totalBlocks.value - 1)

const progressPct  = computed(() =>
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

// ─── Load ─────────────────────────────────────────────────────
const loadQuest = async () => {
  loading.value = true
  fatalError.value = null
  try {
    // Проверяем preview-режим из админки
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

    const res = await questService.getBySlug(slug.value)
    questData.value = res.data ?? res
    requiresCode.value = false

    // Восстанавливаем сохранённый прогресс
    const saved = loadPersistedState()
    if (saved && saved.started) {
      blockIdx.value     = saved.blockIdx     ?? 0
      completedIds.value = saved.completedIds ?? []
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
    if (err.status === 403) {
      requiresCode.value = true
      questData.value = err.data ?? null
    } else {
      fatalError.value = err.message || 'Квест не найден'
    }
  } finally {
    loading.value = false
  }
}

const submitCode = async (code) => {
  codeError.value = ''
  try {
    // POST — код не попадает в URL
    const res = await questService.submitAccessCode(slug.value, code)
    questData.value = res.data ?? res
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
    sessionData.value = res.data ?? res
  } catch { /* оффлайн-режим */ }

  started.value = true
  startTs.value = Date.now()
  ticker = setInterval(() => { nowTs.value = Date.now() }, 1000)

  flash('⚡', 'Начинаем!', themeObj.value.copy.eyebrow)
}

// ─── Tasks ────────────────────────────────────────────────────
const onTaskComplete = (task) => {
  if (completedIds.value.includes(task.id)) return
  completedIds.value.push(task.id)
  points.value += task.points || 10

  if (completedIds.value.length === 1)
    flash('🎯', 'Первый шаг!', 'Продолжай в том же духе')
  else if (completedIds.value.length === totalTasks.value)
    flash('🏆', 'Все задания!', 'Финал близко...')

  saveProgress()
}

const onHint = (task) => {
  hintsUsed.value++
  points.value = Math.max(0, points.value - 10)
  saveProgress()
}

// Пропустить задание (для пазлов — неявная кнопка)
const onSkipTask = (task) => {
  if (completedIds.value.includes(task.id)) return
  completedIds.value.push(task.id)
  // Не начисляем очки за пропуск
  flash('⏭️', 'Пропущено', 'Можно вернуться позже')
  saveProgress()
}

// ─── Navigation ───────────────────────────────────────────────
const next = () => {
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
  started.value = false
  clearPersistedState()
}

// ─── Restart ─────────────────────────────────────────────────
const confirmRestart = () => {
  showMenu.value = false
  showRestartConfirm.value = true
}

const doRestart = async () => {
  showRestartConfirm.value = false
  clearInterval(ticker)

  // Сбрасываем на сервере если есть сессия
  if (sessionData.value) {
    try { await questService.restartQuest(sessionData.value.session_id, { quest_id: questData.value?.id }) }
    catch { }
  }

  // Сбрасываем локальное состояние
  blockIdx.value     = 0
  completedIds.value = []
  points.value       = 0
  hintsUsed.value    = 0
  isComplete.value   = false
  started.value      = false
  clearPersistedState()

  flash('🔄', 'Сброшено', 'Начинаем заново!')
}

// ─── Persist to localStorage ─────────────────────────────────
const STORAGE_KEY = computed(() => `quest_progress_${slug.value}`)

const persistState = () => {
  try {
    localStorage.setItem(STORAGE_KEY.value, JSON.stringify({
      blockIdx:     blockIdx.value,
      completedIds: completedIds.value,
      points:       points.value,
      hintsUsed:    hintsUsed.value,
      startTs:      startTs.value,
      started:      started.value,
      sessionId:    sessionData.value?.session_id || null,
      savedAt:      Date.now()
    }))
  } catch { /* приватный режим */ }
}

const loadPersistedState = () => {
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
  try { localStorage.removeItem(STORAGE_KEY.value) } catch { }
}

// ─── Save progress (server + local) ──────────────────────────
const saveProgress = async () => {
  persistState()

  if (!sessionData.value) return
  try {
    await questService.updateProgress(sessionData.value.session_id, {
      quest_id: questData.value?.id,
      completed_tasks: completedIds.value,
      current_block_position: blockIdx.value,
      points: points.value,
      hints_used: hintsUsed.value,
      achievements: []
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

// ─── Auto-save watcher ───────────────────────────────────────
watch([blockIdx, completedIds, points], () => {
  if (started.value) persistState()
}, { deep: true })

// Close menu on outside click (ignore clicks inside dropdown/sheet)
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
/* ── Root ─────────────────────────────────────────────────────── */
.qp {
  min-height: 100dvh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-b);
  position: relative;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
}

/* ── Overlays ─────────────────────────────────────────────────── */
.qp-overlay { pointer-events: none; position: fixed; inset: 0; z-index: 9999; }

.qp-overlay--scanlines {
  background: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px
  );
}

.qp-overlay--grain {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
  opacity: 0.5;
}

.qp-overlay--fog {
  background: radial-gradient(ellipse 100% 60% at 50% 100%, rgba(167,139,250,0.05) 0%, transparent 70%);
  animation: fog-shift 15s ease-in-out infinite alternate;
}
@keyframes fog-shift { to { transform: translateX(20px); } }

/* ── Loading ──────────────────────────────────────────────────── */
.qp-loading {
  min-height: 100dvh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 20px;
}
.qp-loading__ring {
  width: 48px; height: 48px; border: 3px solid var(--surf);
  border-top-color: var(--accent); border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.qp-loading__text { font-family: var(--font-d); font-size: .7rem; letter-spacing: .2em; color: var(--dim); }

/* ── Error ────────────────────────────────────────────────────── */
.qp-error {
  min-height: 100dvh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px; padding: 32px 20px; text-align: center;
}
.qp-error__icon { font-size: 4rem; }
.qp-error__title { font-family: var(--font-d); font-size: 1.2rem; color: #fff; }
.qp-error__sub { color: var(--dim); font-size: .9rem; }
.qp-error__link { color: var(--accent); font-size: .9rem; text-decoration: none; margin-top: 8px; }

/* ── Player ───────────────────────────────────────────────────── */
.qp-player { min-height: 100dvh; display: flex; flex-direction: column; padding: 68px 0 72px; }

/* ── HUD ──────────────────────────────────────────────────────── */
.qp-hud {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: color-mix(in srgb, var(--bg) 92%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--bord);
}
.qp-hud__bar { height: 3px; background: var(--surf); }
.qp-hud__fill { height: 100%; background: var(--accent); box-shadow: 0 0 8px var(--accent); transition: width .4s ease; }
.qp-hud__row { display: flex; align-items: center; padding: 10px 16px; gap: 8px; }
.qp-hud__step { font-family: var(--font-d); font-size: .75rem; color: var(--accent); white-space: nowrap; }
.qp-hud__step-of { color: var(--dim); }
.qp-hud__name { flex: 1; font-size: .8rem; color: var(--dim); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.qp-hud__time { font-family: var(--font-d); font-size: .7rem; color: var(--dim); white-space: nowrap; }
.qp-hud__menu-btn {
  background: none; border: none; color: var(--dim); font-size: 1.2rem;
  cursor: pointer; padding: 4px 8px; line-height: 1; border-radius: 4px;
  transition: color .2s;
}
.qp-hud__menu-btn:hover { color: var(--text); }
.qp-hud__dropdown {
  position: absolute; top: 100%; right: 12px;
  background: var(--surf); border: 1px solid var(--bord);
  border-radius: 8px; padding: 4px; min-width: 180px;
  box-shadow: 0 8px 24px rgba(0,0,0,.4);
}
.qp-hud__dropdown-item {
  width: 100%; background: none; border: none; color: var(--text);
  font-size: .85rem; padding: 10px 14px; cursor: pointer;
  border-radius: 6px; text-align: left; transition: background .15s;
}
.qp-hud__dropdown-item:hover { background: rgba(255,255,255,.06); }

/* ── Main ─────────────────────────────────────────────────────── */
.qp-main { flex: 1; padding: 20px 16px 0; max-width: 600px; margin: 0 auto; width: 100%; }

/* ── Footer ───────────────────────────────────────────────────── */
.qp-foot {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: color-mix(in srgb, var(--bg) 94%, transparent);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--bord);
  padding: 10px 16px;
  display: flex; align-items: center; justify-content: space-between; z-index: 100;
}
.qp-foot__pts { display: flex; align-items: baseline; gap: 5px; }
.qp-foot__pts-n { font-family: var(--font-d); font-size: 1.3rem; font-weight: 700; color: var(--accent); text-shadow: 0 0 8px var(--accent); }
.qp-foot__pts-l { font-size: .7rem; text-transform: uppercase; letter-spacing: .1em; color: var(--dim); }
.qp-foot__dots { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; justify-content: flex-end; max-width: 60%; }
.qp-foot__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--surf); border: 1px solid var(--bord); transition: all .3s; }
.qp-foot__dot.done { background: #3cffb4; border-color: #3cffb4; box-shadow: 0 0 5px #3cffb4; }
.qp-foot__dot.cur { background: var(--accent); border-color: var(--accent); box-shadow: 0 0 7px var(--accent); width: 14px; border-radius: 3px; }

/* ── Badge — СВЕРХУ СПРАВА ────────────────────────────────────── */
.qp-badge {
  position: fixed; top: 76px; right: 16px; z-index: 300;
  background: var(--surf); border: 1px solid var(--accent); border-radius: 11px;
  padding: 11px 16px; display: flex; align-items: center; gap: 11px; min-width: 200px; max-width: 300px;
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 28%, transparent), 0 8px 24px rgba(0,0,0,.4);
  backdrop-filter: blur(12px);
}
.qp-badge__ico { font-size: 1.5rem; flex-shrink: 0; }
.qp-badge__title { font-family: var(--font-d); font-size: .7rem; font-weight: 700; color: var(--accent); }
.qp-badge__sub { font-size: .72rem; color: var(--dim); margin-top: 2px; }

/* ── Confirm dialog ───────────────────────────────────────────── */
.qp-confirm-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(0,0,0,.7); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.qp-confirm {
  background: var(--surf); border: 1px solid var(--bord);
  border-radius: 16px; padding: 28px 24px; text-align: center;
  max-width: 320px; width: 100%;
}
.qp-confirm__icon { font-size: 2.5rem; margin-bottom: 12px; }
.qp-confirm__title { font-family: var(--font-d); font-size: 1.1rem; color: #fff; margin-bottom: 6px; }
.qp-confirm__text { font-size: .85rem; color: var(--dim); margin-bottom: 20px; }
.qp-confirm__btns { display: flex; gap: 10px; }
.qp-confirm__btn {
  flex: 1; padding: 12px; border-radius: 9px; font-weight: 600;
  font-family: var(--font-b); font-size: .88rem; cursor: pointer; border: none;
}
.qp-confirm__btn--cancel { background: var(--bg); color: var(--dim); border: 1px solid var(--bord); }
.qp-confirm__btn--confirm { background: #f87171; color: #fff; }

/* ── Transitions ──────────────────────────────────────────────── */
.splash-out-leave-active { transition: opacity .5s ease, transform .5s ease; }
.splash-out-leave-to     { opacity: 0; transform: scale(1.04); }
.player-in-enter-active  { transition: opacity .5s .1s ease; }
.player-in-enter-from    { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: opacity .22s ease, transform .22s ease; }
.slide-enter-from  { opacity: 0; transform: translateX(18px); }
.slide-leave-to    { opacity: 0; transform: translateX(-18px); }
.fade-enter-active { transition: opacity .3s ease; }
.fade-enter-from   { opacity: 0; }
.fade-leave-active { transition: opacity .2s ease; }
.fade-leave-to     { opacity: 0; }
.pop-enter-active  { transition: opacity .28s ease, transform .28s ease; }
.pop-leave-active  { transition: opacity .2s ease; }
.pop-enter-from    { opacity: 0; transform: translateY(-10px); }
.pop-leave-to      { opacity: 0; }

/* ── Mobile bottom sheet menu ─────────────────────────────────── */
.qp-menu-sheet {
  display: none; /* hidden on desktop */
}
@media (max-width: 480px) {
  /* Hide desktop dropdown on mobile */
  .qp-hud__dropdown { display: none !important; }

  /* Show bottom sheet on mobile */
  .qp-menu-sheet {
    display: flex;
    position: fixed; inset: 0; z-index: 400;
    align-items: flex-end;
    background: rgba(0,0,0,.55);
    backdrop-filter: blur(4px);
  }
  .qp-menu-sheet__panel {
    width: 100%;
    background: var(--surf);
    border-top: 1px solid var(--bord);
    border-radius: 20px 20px 0 0;
    padding: 12px 16px 32px;
  }
  .qp-menu-sheet__handle {
    width: 40px; height: 4px;
    background: var(--bord);
    border-radius: 2px;
    margin: 0 auto 16px;
  }
  .qp-menu-sheet__title {
    font-family: var(--font-d);
    font-size: .8rem;
    color: var(--dim);
    text-transform: uppercase;
    letter-spacing: .1em;
    margin-bottom: 12px;
  }
  .qp-menu-sheet__item {
    display: flex; align-items: center; gap: 14px;
    width: 100%; background: none; border: none;
    color: var(--text); font-size: 1rem;
    padding: 16px 8px; cursor: pointer;
    border-radius: 10px;
    text-align: left;
    transition: background .15s;
  }
  .qp-menu-sheet__item:hover { background: rgba(255,255,255,.06); }
  .qp-menu-sheet__ico { font-size: 1.3rem; width: 28px; text-align: center; }
  .qp-menu-sheet__close {
    display: block; width: 100%; margin-top: 8px;
    padding: 14px; background: rgba(255,255,255,.06);
    border: 1px solid var(--bord); border-radius: 12px;
    color: var(--dim); font-size: .9rem; cursor: pointer;
  }
}

/* ── Sheet transition ─────────────────────────────────────────── */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity .25s ease;
}
.sheet-enter-active .qp-menu-sheet__panel,
.sheet-leave-active .qp-menu-sheet__panel {
  transition: transform .3s cubic-bezier(.22,1,.36,1);
}
.sheet-leave-active .qp-menu-sheet__panel {
  transition: transform .2s ease-in;
}
.sheet-enter-from,
.sheet-leave-to { opacity: 0; }
.sheet-enter-from .qp-menu-sheet__panel,
.sheet-leave-to .qp-menu-sheet__panel { transform: translateY(100%); }

/* ── Mobile responsive ────────────────────────────────────────── */
@media (max-width: 480px) {
  .qp-main { padding: 16px 12px 0; }
  .qp-hud__row { padding: 8px 12px; gap: 6px; }
  .qp-hud__name { font-size: .72rem; }
  .qp-foot { padding: 8px 12px; }
  .qp-foot__pts-n { font-size: 1.1rem; }
  .qp-badge { right: 12px; min-width: 170px; padding: 10px 12px; }
  .qp-badge__ico { font-size: 1.2rem; }
  .qp-badge__title { font-size: .65rem; }
  .qp-badge__sub { font-size: .65rem; }
}
</style>