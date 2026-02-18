import { createRouter, createWebHistory } from 'vue-router'

// Импорт компонентов страниц
import Home from '@/views/Home.vue'
import Templates from '@/views/Templates.vue'
import TemplateDetail from '@/views/TemplateDetail.vue'
import Category from '@/views/Category.vue'
import Authors from '@/views/Authors.vue'
import AuthorProfile from '@/views/AuthorProfile.vue'
import Order from '@/views/Order.vue'
import BecomeAuthor from '@/views/BecomeAuthor.vue'
import Quest from '@/views/Quest.vue'
import About from '@/views/About.vue'
import NotFound from '@/views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Quest Dating - Маркетплейс шаблонов квестов для свиданий',
      description: 'Найдите идеальный квест для вашего свидания. Более 150 готовых шаблонов от профессиональных авторов.'
    }
  },
  {
    path: '/templates',
    name: 'Templates',
    component: Templates,
    meta: {
      title: 'Все шаблоны квестов - Quest Dating',
      description: 'Каталог всех шаблонов квестов с фильтрами по категориям, сложности и цене.'
    }
  },
  {
    path: '/template/:slug',
    name: 'TemplateDetail',
    component: TemplateDetail,
    meta: {
      title: 'Шаблон квеста - Quest Dating'
    },
    props: true
  },
  {
    path: '/categories/:slug',
    name: 'Category',
    component: Category,
    meta: {
      title: 'Категория - Quest Dating'
    },
    props: true
  },
  {
    path: '/authors',
    name: 'Authors',
    component: Authors,
    meta: {
      title: 'Авторы квестов - Quest Dating',
      description: 'Познакомьтесь с авторами наших квестов. Профессионалы с опытом создания незабываемых приключений.'
    }
  },
  {
    path: '/author/:username',
    name: 'AuthorProfile',
    component: AuthorProfile,
    meta: {
      title: 'Профиль автора - Quest Dating'
    },
    props: true
  },
  {
    path: '/order/:templateSlug',
    name: 'Order',
    component: Order,
    meta: {
      title: 'Оформление заказа - Quest Dating',
      requiresConsent: true
    },
    props: true
  },
  {
    path: '/become-author',
    name: 'BecomeAuthor',
    component: BecomeAuthor,
    meta: {
      title: 'Стать автором - Quest Dating',
      description: 'Создавайте квесты и зарабатывайте. Присоединяйтесь к команде профессиональных авторов.'
    }
  },
  {
    path: '/quest/:slug',
    name: 'Quest',
    component: Quest,
    meta: {
      title: 'Прохождение квеста - Quest Dating'
    },
    props: true
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: {
      title: 'О платформе - Quest Dating',
      description: 'Quest Dating - это маркетплейс готовых шаблонов квестов для романтических свиданий.'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '404 - Страница не найдена - Quest Dating'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Если есть сохраненная позиция (например, при навигации назад)
    if (savedPosition) {
      return savedPosition
    }
    
    // Если есть якорь (hash)
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    
    // По умолчанию прокручиваем наверх
    return { 
      top: 0,
      behavior: 'smooth'
    }
  }
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Обновление title страницы
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // Обновление meta description
  if (to.meta.description) {
    let descriptionTag = document.querySelector('meta[name="description"]')
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta')
      descriptionTag.setAttribute('name', 'description')
      document.head.appendChild(descriptionTag)
    }
    descriptionTag.setAttribute('content', to.meta.description)
  }

  // Проверка требований (например, согласие на обработку данных)
  if (to.meta.requiresConsent) {
    // TODO: Проверить согласие пользователя
    // const hasConsent = localStorage.getItem('userConsent')
    // if (!hasConsent) {
    //   return next({ name: 'Home', query: { consent: 'required' } })
    // }
  }

  // Логирование навигации (для аналитики)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: to.path,
      page_title: to.meta.title
    })
  }

  next()
})

router.afterEach((to, from) => {
  // Логирование после навигации
  if (import.meta.env.DEV) {
    console.log(`Navigated from ${from.path} to ${to.path}`)
  }
})

// Обработка ошибок маршрутизации
router.onError((error) => {
  console.error('Router error:', error)
  
  // Можно показать уведомление пользователю
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    window.location.reload()
  }
})

export default router