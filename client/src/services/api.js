import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  config => {
    // В будущем здесь можно добавить JWT токен
    // const token = localStorage.getItem('token')
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => Promise.reject(error)
)

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 404) {
      console.error('Resource not found')
    }
    return Promise.reject(error)
  }
)

export default apiClient