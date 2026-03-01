import { createRouter, createWebHistory } from 'vue-router'

// FIX: Все страницы переведены на lazy loading — это уменьшает начальный бандл
// и ускоряет первую загрузку. Каждая страница загружается только при переходе на неё.
const Home          = () => import('@/views/Home.vue')
const Templates     = () => import('@/views/Templates.vue')
const TemplateDetail = () => import('@/views/TemplateDetail.vue')
const Category      = () => import('@/views/Category.vue')
const Order         = () => import('@/views/Order.vue')
const QuestPlayer   = () => import('@/views/QuestPlayer.vue')
const About         = () => import('@/views/About.vue')
const NotFound      = () => import('@/views/NotFound.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Quest Dating — персональные квесты для романтических свиданий',
      description: 'Создам незабываемый квест специально для вас. Персональный подход, уникальный сценарий, готово за 24 часа.'
    }
  },
  {
    path: '/templates',
    name: 'Templates',
    component: Templates,
    meta: {
      title: 'Квесты для свиданий — Quest Dating',
      description: 'Готовые шаблоны квестов для свиданий. Каждый можно персонализировать под вашу пару.'
    }
  },
  {
    path: '/template/:slug',
    name: 'TemplateDetail',
    component: TemplateDetail,
    meta: { title: 'Квест — Quest Dating' },
    props: true
  },
  {
    path: '/categories/:slug',
    name: 'Category',
    component: Category,
    meta: { title: 'Категория квестов — Quest Dating' },
    props: true
  },
  {
    path: '/order/:templateSlug',
    name: 'Order',
    component: Order,
    meta: { title: 'Оформление заказа — Quest Dating', requiresConsent: true },
    props: true
  },
  {
    path: '/quest/:slug',
    name: 'QuestPlayer',
    component: QuestPlayer,
    meta: { title: 'Квест — Quest Dating', hideNav: true },
    props: true
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: 'О создателе — Quest Dating',
      description: 'Влад — создатель романтических квестов. Персональный подход к каждой паре.'
    }
  },

  // ── Админка ──────────────────────────────────────────────────
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/AdminLogin.vue'),
    meta: { title: 'Вход — Admin', hideNav: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/AdminDashboard.vue'),
    meta: { title: 'Дашборд — Admin', hideNav: true, requiresAdmin: true }
  },
  {
    path: '/admin/quest/new',
    name: 'QuestNew',
    component: () => import('@/views/QuestEditor.vue'),
    meta: { title: 'Новый квест — Admin', hideNav: true, requiresAdmin: true }
  },
  {
    path: '/admin/quest/:id/edit',
    name: 'QuestEdit',
    component: () => import('@/views/QuestEditor.vue'),
    meta: { title: 'Редактировать квест — Admin', hideNav: true, requiresAdmin: true },
    props: true
  },

  // Редиректы
  { path: '/authors', redirect: '/about' },
  { path: '/author/:username', redirect: '/about' },
  { path: '/become-author', redirect: '/' },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('@/views/Terms.vue'),
    meta: { title: 'Условия использования' }
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('@/views/Privacy.vue'),
    meta: { title: 'Политика конфиденциальности' }
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '404 — Страница не найдена — Quest Dating' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  }
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  if (to.meta.description) {
    let tag = document.querySelector('meta[name="description"]')
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('name', 'description')
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', to.meta.description)
  }

  // Auth guard для админки
  if (to.meta.requiresAdmin) {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      return next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
    }
    // Проверяем срок действия JWT
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('auth_token')
        return next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
      }
    } catch {
      localStorage.removeItem('auth_token')
      return next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
    }
  }

  if (typeof window !== 'undefined' && window.gtag && import.meta.env.VITE_GA_ID) {
    window.gtag('config', import.meta.env.VITE_GA_ID, {
      page_path: to.path,
      page_title: to.meta.title
    })
  }
  next()
})

router.afterEach((to, from) => {
  if (import.meta.env.DEV) {
    console.log(`Navigated from ${from.path} to ${to.path}`)
  }
})

router.onError((error) => {
  console.error('Router error:', error)
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    window.location.reload()
  }
})

export default router