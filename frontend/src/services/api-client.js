import axios from 'axios'
import { getStoredToken } from '../lib/storage'

export const USE_MOCKS = String(import.meta.env.VITE_USE_MOCKS ?? 'true') !== 'false'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      window.dispatchEvent(new CustomEvent('krushimart:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(error) {
  if (!error) return 'Something went wrong'
  if (error.response?.data?.message) return error.response.data.message
  if (error.response?.data?.details?.length) {
    return error.response.data.details.map((detail) => detail.message).join(', ')
  }
  return error.message || 'Something went wrong'
}

export default api
