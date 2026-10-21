import { delay, readJson, requireSessionUser, writeJson } from './mockUtils'

const NOTIFICATIONS_KEY = 'krushimart.mock.notifications.v1'

const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    userId: 1,
    type: 'DEMAND_OPPORTUNITY',
    title: 'Nashik machinery demand is rising',
    message:
      'Three separate customers requested mini/power tillers in Nashik. Your mini tiller listing is relevant.',
    read: false,
    relatedProductId: 1,
    relatedRequestId: 1,
    relatedOpportunityId: 1,
    createdAt: '2026-10-20T08:05:00Z',
  },
  {
    id: 2,
    userId: 1,
    type: 'SYSTEM',
    title: 'Welcome to KrushiMart',
    message:
      'Complete your farm profile and enable notifications to receive relevant demand opportunities.',
    read: true,
    relatedProductId: null,
    relatedRequestId: null,
    relatedOpportunityId: null,
    createdAt: '2026-10-15T05:00:00Z',
  },
]

function readAll() {
  return readJson(NOTIFICATIONS_KEY, DEMO_NOTIFICATIONS)
}

export async function mockListNotifications() {
  await delay(180)
  const user = requireSessionUser()
  return readAll()
    .filter((notification) => notification.userId === user.id)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
}

export async function mockMarkNotificationRead(id) {
  await delay(120)
  const user = requireSessionUser()
  const notifications = readAll()
  const index = notifications.findIndex(
    (notification) => notification.id === Number(id) && notification.userId === user.id,
  )
  if (index < 0) {
    const error = new Error('Notification not found')
    error.code = 'NOT_FOUND'
    throw error
  }
  notifications[index] = { ...notifications[index], read: true }
  writeJson(NOTIFICATIONS_KEY, notifications)
  return notifications[index]
}
