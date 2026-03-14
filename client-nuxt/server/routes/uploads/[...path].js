/**
 * Nitro route: /uploads/**
 *
 * Проксирует все запросы к статике /uploads/ на Express-сервер.
 *
 * Зачем нужен отдельный Nitro route вместо devProxy:
 *   nitro.devProxy работает только в dev-режиме и только для fetch/XHR.
 *   Браузерные запросы к <img src="/uploads/..."> идут напрямую к Nuxt
 *   dev-серверу, минуя devProxy → 404.
 *   Nitro server route перехватывает ВСЕ запросы по этому пути —
 *   и fetch, и img, и video src — в любом окружении (dev и prod).
 *
 * В prod Nginx сам проксирует /uploads/ на Express, этот route
 * не задействуется (Nuxt не обрабатывает запросы к /uploads/ напрямую).
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // В prod Nginx раздаёт /uploads/ сам — не проксируем через Nuxt
  if (process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 404, message: 'Not found' })
  }

  // Берём apiBaseInternal (server:5000 в Docker, localhost:5000 в dev)
  // и убираем /api суффикс — нам нужен корень Express
  const expressBase = config.apiBaseInternal.replace(/\/api$/, '')

  const path = event.context.params.path
  const query = getQuery(event)
  const queryStr = Object.keys(query).length
    ? '?' + new URLSearchParams(query).toString()
    : ''

  const targetUrl = `${expressBase}/uploads/${path}${queryStr}`

  try {
    const response = await fetch(targetUrl)

    // Пробрасываем Content-Type чтобы браузер правильно отображал картинки
    const contentType = response.headers.get('content-type')
    if (contentType) {
      setHeader(event, 'content-type', contentType)
    }

    // Кешируем на стороне браузера
    const cacheControl = response.headers.get('cache-control')
    if (cacheControl) {
      setHeader(event, 'cache-control', cacheControl)
    }

    if (!response.ok) {
      throw createError({ statusCode: response.status, message: `Upstream error: ${response.status}` })
    }

    return sendStream(event, response.body)
  } catch (err) {
    if (err.statusCode) throw err
    throw createError({ statusCode: 502, message: `Cannot reach Express: ${err.message}` })
  }
})