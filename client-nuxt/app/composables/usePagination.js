// composables/usePagination.js
import { ref, computed } from 'vue'

export function usePagination(items, perPage = 15) {
  const page = ref(1)

  const totalPages = computed(() => Math.ceil(items.value.length / perPage))

  const paged = computed(() => {
    const start = (page.value - 1) * perPage
    return items.value.slice(start, start + perPage)
  })

  const reset = () => { page.value = 1 }

  return { page, totalPages, paged, reset }
}