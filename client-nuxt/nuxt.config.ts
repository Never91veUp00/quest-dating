// nuxt.config.ts
export default defineNuxtConfig({
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
    '/':              { ssr: true, swr: 300   },
    '/catalog':       { ssr: true, swr: 300   },
    '/date/**':       { ssr: true, swr: 600   },
    '/categories/**': { ssr: true, isr: false },
    '/about':         { ssr: true, swr: 3600  },
    '/blog':           { prerender: true },
    '/blog/**':        { prerender: true },
    '/terms':         { ssr: true },
    '/privacy':       { ssr: true },
    '/admin/**':      { ssr: false },
    '/order/**':      { ssr: false },
    '/quest/**':      { ssr: false },
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
  },

  sitemap: {
    exclude: ['/admin/**', '/quest/**', '/order/**'],
    include: ['/blog', '/blog/**'],
  },

  robots: {
    disallow: ['/admin', '/quest', '/order'],
  },

  nitro: {
    devProxy: {
      // ВАЖНО: /templates НЕ проксируем — конфликт с Nuxt pages роутом /date/[slug]
      '/api':     { target: 'http://localhost:5000', changeOrigin: true },
      '/images':  { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    }
  },

  compatibilityDate: '2024-11-01',
})