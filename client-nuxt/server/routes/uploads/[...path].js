/**
 * Nitro route: /uploads/**
 * Проксирует все запросы к /uploads/ на Express-сервер.
 * Работает в dev и production — перехватывает img src, fetch, XHR.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Берём apiBaseInternal и убираем /api — нужен корень Express
  const expressBase = config.apiBaseInternal.replace(/\/api$/, '')

  const path = event.context.params.path
  const query = getQuery(event)
  const queryStr = Object.keys(query).length
    ? '?' + new URLSearchParams(query).toString()
    : ''

  const targetUrl = `${expressBase}/uploads/${path}${queryStr}`

  try {
    const response = await fetch(targetUrl)

    const contentType = response.headers.get('content-type')
    if (contentType) setHeader(event, 'content-type', contentType)

    const cacheControl = response.headers.get('cache-control')
    if (cacheControl) setHeader(event, 'cache-control', cacheControl)

    if (!response.ok) {
      throw createError({ statusCode: response.status, message: `Upstream error: ${response.status}` })
    }

    return sendStream(event, response.body)
  } catch (err) {
    if (err.statusCode) throw err
    throw createError({ statusCode: 502, message: `Cannot reach Express: ${err.message}` })
  }
})