import { createRouter, createWebHistory } from 'vue-router'

// Импорт компонентов страниц
import Home from '@/views/Home.vue'
import Templates from '@/views/Templates.vue'
import TemplateDetail from '@/views/TemplateDetail.vue'
import Category from '@/views/Category.vue'
import Order from '@/views/Order.vue'
import Quest from '@/views/Quest.vue'
import About from '@/views/About.vue'
import NotFound from '@/views/NotFound.vue'

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
    meta: {
      title: 'Оформление заказа — Quest Dating',
      requiresConsent: true
    },
    props: true
  },
  {
    path: '/quest/:slug',
    name: 'Quest',
    component: Quest,
    meta: { title: 'Прохождение квеста — Quest Dating' },
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

  // Редиректы со старых маршрутов — чтобы не было 404
  { path: '/authors', redirect: '/about' },
  { path: '/author/:username', redirect: '/about' },
  { path: '/become-author', redirect: '/' },

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
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
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