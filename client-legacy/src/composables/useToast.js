import { ref } from 'vue'

// Глобальный ref — один на всё приложение
const toastRef = ref(null)

export const useToast = () => {
  const setRef = (ref) => {
    toastRef.value = ref
  }

  const error = (message) => toastRef.value?.add(message, 'error')
  const success = (message) => toastRef.value?.add(message, 'success')
  const warning = (message) => toastRef.value?.add(message, 'warning')
  const info = (message) => toastRef.value?.add(message, 'info')

  return { setRef, error, success, warning, info }
}