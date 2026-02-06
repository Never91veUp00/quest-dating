import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'Quest Dating - Романтические квесты для свиданий' }
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue'),
    meta: { title: 'О нас - Quest Dating' }
  },
  {
    path: '/order',
    name: 'Order',
    component: () => import('@/views/Order.vue'),
    meta: { title: 'Заказать квест - Quest Dating' }
  },
  {
    path: '/quest/:slug',
    name: 'Quest',
    component: () => import('@/views/Quest.vue'),
    meta: { title: 'Ваше приключение начинается' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404 - Страница не найдена' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Quest Dating'
  next()
})

export default router