import api, { USE_MOCKS, getErrorMessage } from './api-client'
import { getStoredUser } from '../lib/storage'
import { mockLogin, mockRegister, mockUpdateProfile } from '../mocks/users.mock'

export async function login(credentials) {
  if (USE_MOCKS) return mockLogin(credentials)
  const { data } = await api.post('/auth/login', credentials)
  return data
}

export async function register(payload) {
  if (USE_MOCKS) return mockRegister(payload)
  const { data } = await api.post('/auth/register', payload)
  return data
}

export async function me() {
  if (USE_MOCKS) {
    const user = getStoredUser()
    if (!user) throw new Error('You are not logged in')
    return user
  }
  const { data } = await api.get('/auth/me')
  return data
}

export async function updateProfile(values) {
  if (USE_MOCKS) {
    const user = getStoredUser()
    if (!user) throw new Error('You are not logged in')
    return mockUpdateProfile(user.id, values)
  }
  const { data } = await api.put('/users/me', values)
  return data
}

export { getErrorMessage }
