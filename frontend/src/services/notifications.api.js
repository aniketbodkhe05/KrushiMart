import api, { USE_MOCKS } from './api-client'
import { mockListNotifications, mockMarkNotificationRead } from '../mocks/notifications.mock'

export async function listNotifications() {
  if (USE_MOCKS) return mockListNotifications()
  const { data } = await api.get('/notifications')
  return data
}

export async function markNotificationRead(id) {
  if (USE_MOCKS) return mockMarkNotificationRead(id)
  const { data } = await api.patch(`/notifications/${id}/read`)
  return data
}
