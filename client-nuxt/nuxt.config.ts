// nuxt.config.ts
export default defineNuxtConfig({

  // ── Глобальный <head> — мобильная оптимизация ──────────────────
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      titleTemplate: '%s',
      meta: [
        // Retina / HiDPI — запрет масштабирования браузером
        { name: 'format-detection', content: 'telephone=no' },
        // iOS Safari — полноэкранный режим
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Quest Dating' },
        // Цвет статус-бара на Android Chrome и iOS Safari
        { name: 'theme-color', content: '#0a0a0f' },
        { name: 'msapplication-TileColor', content: '#0a0a0f' },
      ],
      link: [
        // Preconnect к Google Fonts — ускоряет загрузку шрифтов
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Cormorant Garamond для Лизы Петри
        { rel: 'preload', as: 'style', href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&display=swap', onload: "this.onload=null;this.rel='stylesheet'" },
        // Favicon — явно для Яндекса и других поисковиков
        { rel: 'shortcut icon', href: '/favicon.ico', type: 'image/x-icon' },
        { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon', sizes: '32x32' },
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      ],
    },
  },
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxtjs/seo',
  ],

  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
      }
    ]
  },

  css: [
    '~/assets/styles/variables.css',
    '~/assets/styles/main.css',
    '~/assets/styles/animations.css',
    '~/assets/styles/admin.css',
    '~/assets/styles/editor.css',
  ],

  runtimeConfig: {
    apiBaseInternal: process.env.NUXT_API_BASE_INTERNAL || 'http://server:5000/api',
    public: {
      // В dev: относительный /api — запросы идут через Nuxt devProxy -> localhost:5000
      // Playwright перехватывает localhost:3000/api/... через page.route('**/api/**')
      // В prod: задаётся через NUXT_PUBLIC_API_BASE
      apiBase:  process.env.NUXT_PUBLIC_API_BASE || '/api',
      appName:  'Quest Dating',
    }
  },

  routeRules: {
    // Production proxy: Nuxt проксирует /api/** на Express
    // /uploads/** обрабатывается через server/routes/uploads/[...path].js
    '/sitemap-urls': { ssr: true },
    '/api/**':    { proxy: { to: 'http://server:5000/api/**' } },
    '/':              { ssr: true, swr: 300   },
    '/catalog':       { ssr: true, swr: 300   },
    '/date/**':       { ssr: true, swr: 600   },
    '/categories/**': { ssr: true, isr: false },
    '/about':         { ssr: true, swr: 3600  },
    '/blog':           { ssr: true, swr: 3600 },
    '/blog/**':        { ssr: true, swr: 3600 },
    '/terms':         { ssr: true },
    '/privacy':       { ssr: true },
    '/admin/**':      { ssr: false },
    '/order/**':      { ssr: false },
    '/my-order/**':   { ssr: false },
    '/quest/**':      { ssr: true },
    '/templates':     { redirect: { to: '/catalog', statusCode: 301 } },
    '/template/**':   { redirect: { to: '/date/**', statusCode: 301 } },
    '/authors':       { redirect: { to: '/about',   statusCode: 301 } },
    '/author/**':     { redirect: { to: '/about',   statusCode: 301 } },
    '/become-author': { redirect: { to: '/',        statusCode: 301 } },
  },

  site: {
    url:           'https://questdating.ru',
    name:          'Quest Dating',
    description:   'Лиза Петри разработает и организует ваше свидание-квест: персональный сценарий для двоих.',
    defaultLocale: 'ru',
    titleSeparator: '—',
  },


  sitemap: {
    exclude: ['/admin/**', '/quest/**', '/order/**', '/my-order/**', '/sitemap-urls'],
    sources: [
      // Динамические URL: все /date/:slug и /categories/:slug из БД
      '/sitemap-urls',
    ],
    // Приоритеты и частота обновления для статических страниц
    urls: [
      { loc: '/',        priority: 1.0, changefreq: 'weekly'  },
      { loc: '/catalog', priority: 0.9, changefreq: 'weekly'  },
      { loc: '/about',   priority: 0.7, changefreq: 'monthly' },
      { loc: '/blog',    priority: 0.8, changefreq: 'weekly'  },
      { loc: '/privacy', priority: 0.2, changefreq: 'yearly'  },
      { loc: '/terms',   priority: 0.2, changefreq: 'yearly'  },
    ],
  },

  robots: {
    sitemap: ['https://questdating.ru/sitemap.xml'],
    disallow: ['/admin', '/quest', '/order', '/my-order', '/feedbacks', '/memberid'],
  },

  nitro: {
    devProxy: {
      // ВАЖНО: /templates НЕ проксируем — конфликт с Nuxt pages роутом /date/[slug]
      // /uploads убран — обрабатывается через server/routes/uploads/[...path].js
      // (devProxy работает только для fetch/XHR, не для <img src>)
      '/api':    { target: 'http://localhost:5000', changeOrigin: true },
      '/images': { target: 'http://localhost:5000', changeOrigin: true },
    }
  },

  experimental: {
    emitRouteChunkError: 'reload',
  },

  compatibilityDate: '2024-11-01',
})