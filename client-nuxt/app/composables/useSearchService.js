// composables/useSearchService.js
// Заменяет client/src/services/searchService.js
// localStorage обёрнут в import.meta.client — не падает при SSR

export function useSearchService() {
  const { get } = useApi()

  function search(query, params = {}) {
    return get('/search', { q: query, ...params })
  }

  function getSuggestions(query, limit = 5) {
    return get('/search/suggestions', { q: query, limit })
  }

  function saveToHistory(query) {
    // ✅ Guard: на сервере пропускаем
    if (!query?.trim() || !import.meta.client) return
    try {
      const history  = getHistory()
      const trimmed  = query.trim()
      const filtered = history.filter(item => item !== trimmed)
      const updated  = [trimmed, ...filtered].slice(0, 10)
      localStorage.setItem('search_history', JSON.stringify(updated))
    } catch {}
  }

  function getHistory() {
    // ✅ Guard: на сервере возвращаем пустой массив
    if (!import.meta.client) return []
    try {
      const raw = localStorage.getItem('search_history')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  function clearHistory() {
    if (!import.meta.client) return
    try {
      localStorage.removeItem('search_history')
    } catch {}
  }

  return { search, getSuggestions, saveToHistory, getHistory, clearHistory }
}