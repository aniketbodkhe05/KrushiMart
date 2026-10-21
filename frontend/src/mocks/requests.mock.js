import { apiError, delay, readJson, requireSessionUser, writeJson } from './mockUtils'

const REQUESTS_KEY = 'krushimart.mock.requests.v1'

export const DEMO_REQUESTS = [
  {
    id: 1,
    requesterId: 4,
    requesterName: 'Asha Kulkarni',
    title: 'Mini tiller for a two-acre field',
    description:
      'Looking for a used mini tiller in working condition. Can inspect in or around Nashik.',
    category: 'MACHINERY',
    region: 'Nashik',
    quantity: 1,
    unit: 'PIECE',
    language: 'en',
    status: 'OPEN',
    createdAt: '2026-10-19T07:00:00Z',
    updatedAt: '2026-10-19T07:00:00Z',
  },
  {
    id: 2,
    requesterId: 5,
    requesterName: 'Ganesh Pawar',
    title: 'Power tiller required for orchard',
    description: 'Need a power tiller for inter-cultivation in a grape orchard. Purchase preferred.',
    category: 'MACHINERY',
    region: 'Nashik',
    quantity: 1,
    unit: 'PIECE',
    language: 'en',
    status: 'OPEN',
    createdAt: '2026-10-19T14:30:00Z',
    updatedAt: '2026-10-19T14:30:00Z',
  },
  {
    id: 3,
    requesterId: 6,
    requesterName: 'Meera Shinde',
    title: 'Mini tiller wanted',
    description:
      'Small farm owner looking for a mini tiller. Rental offers with a purchase option are also welcome.',
    category: 'MACHINERY',
    region: 'Nashik',
    quantity: 1,
    unit: 'PIECE',
    language: 'mr',
    status: 'OPEN',
    createdAt: '2026-10-20T05:45:00Z',
    updatedAt: '2026-10-20T05:45:00Z',
  },
  {
    id: 4,
    requesterId: 4,
    requesterName: 'Asha Kulkarni',
    title: 'Drip irrigation connectors',
    description: 'Need 100 pieces of 16mm connectors for a small plot.',
    category: 'IRRIGATION',
    region: 'Nashik',
    quantity: 100,
    unit: 'PIECE',
    language: 'en',
    status: 'OPEN',
    createdAt: '2026-10-20T08:15:00Z',
    updatedAt: '2026-10-20T08:15:00Z',
  },
]

export function readMockRequests() {
  return readJson(REQUESTS_KEY, DEMO_REQUESTS)
}

export async function mockListMyRequests() {
  await delay(180)
  const user = requireSessionUser()
  return readMockRequests()
    .filter((request) => request.requesterId === user.id)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
}

export async function mockGetRequest(id) {
  await delay(150)
  const request = readMockRequests().find((item) => item.id === Number(id))
  if (!request) throw apiError('Request not found', 'NOT_FOUND')
  return request
}

export async function mockCreateRequest(payload) {
  await delay()
  const user = requireSessionUser()
  const requests = readMockRequests()
  const now = new Date().toISOString()
  const request = {
    ...payload,
    id: Math.max(...requests.map((item) => item.id), 0) + 1,
    requesterId: user.id,
    requesterName: user.fullName,
    quantity: Number(payload.quantity),
    status: 'OPEN',
    language: payload.language || 'en',
    createdAt: now,
    updatedAt: now,
  }
  writeJson(REQUESTS_KEY, [...requests, request])
  return request
}
