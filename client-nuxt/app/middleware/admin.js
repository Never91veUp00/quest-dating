// middleware/admin.js
// Заменяет router.beforeEach requiresAdmin guard из router/index.js
// Запускается и на сервере, и на клиенте — без document/localStorage

export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('auth_token')

  if (!token.value) {
    return navigateTo({
      path:  '/admin/login',
      query: { redirect: to.fullPath },
    })
  }

  // Проверяем срок действия JWT (без window, без document)
  try {
    const payload = JSON.parse(atob(token.value.split('.')[1]))
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      token.value = null
      return navigateTo({
        path:  '/admin/login',
        query: { redirect: to.fullPath },
      })
    }
  } catch {
    token.value = null
    return navigateTo({
      path:  '/admin/login',
      query: { redirect: to.fullPath },
    })
  }
})