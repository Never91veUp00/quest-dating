export default defineEventHandler(async () => {
  const SITE_URL = 'https://questdating.ru'
  const API_BASE = process.env.NUXT_API_BASE_INTERNAL || 'http://server:5000/api'

  const urls: Array<{
    loc: string
    lastmod?: string
    changefreq?: string
    priority?: number
  }> = []

  const blogSlugs = [
    '20-idey-dlya-neobychnogo-svidaniya',
    'svidanie-kvest-doma',
    'kvest-syurpriz-dlya-devushki',
    'chto-podarit-devushke-na-godovshchinu',
    'svidanie-na-14-fevralya',
    'kvest-syurpriz-na-8-marta',
    'gorodskoe-svidanie-kvest',
    'istorii-par-svidaniya-kvesty',
  ]
  for (const slug of blogSlugs) {
    urls.push({
      loc: `${SITE_URL}/blog/${slug}`,
      changefreq: 'monthly',
      priority: 0.6,
    })
  }

  try {
    const templatesRes = await $fetch<{ data: Array<{ slug: string; updated_at: string }> }>(
      `${API_BASE}/templates?status=published&limit=200`
    ).catch(() => null)
    if (templatesRes?.data) {
      for (const t of templatesRes.data) {
        urls.push({
          loc: `${SITE_URL}/date/${t.slug}`,
          lastmod: t.updated_at ? new Date(t.updated_at).toISOString().split('T')[0] : undefined,
          changefreq: 'weekly',
          priority: 0.9,
        })
      }
    }

    const catsRes = await $fetch<{ data: Array<{ slug: string }> }>(
      `${API_BASE}/categories`
    ).catch(() => null)
    if (catsRes?.data) {
      for (const c of catsRes.data) {
        urls.push({
          loc: `${SITE_URL}/categories/${c.slug}`,
          changefreq: 'weekly',
          priority: 0.7,
        })
      }
    }
  } catch (e) {
    console.error('[sitemap-urls] fetch error:', e)
  }

  return urls
})
