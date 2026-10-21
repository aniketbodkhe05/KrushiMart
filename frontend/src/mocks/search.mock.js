import { getStoredUser } from '../lib/storage'
import { filterMockProducts } from './products.mock'
import { delay, readJson, writeJson } from './mockUtils'

const SEARCH_KEY = 'krushimart.mock.searches.v1'

const DEMO_SEARCHES = [
  {
    id: 1,
    userId: 4,
    query: 'mini tiller',
    category: 'MACHINERY',
    region: 'Nashik',
    language: 'en',
    matched: false,
    resultCount: 0,
    createdAt: '2026-10-18T06:10:00Z',
  },
  {
    id: 2,
    userId: 5,
    query: 'power tiller',
    category: 'MACHINERY',
    region: 'Nashik',
    language: 'en',
    matched: false,
    resultCount: 0,
    createdAt: '2026-10-19T06:20:00Z',
  },
  {
    id: 3,
    userId: 6,
    query: 'मिनी टिलर',
    category: 'MACHINERY',
    region: 'Nashik',
    language: 'mr',
    matched: false,
    resultCount: 0,
    createdAt: '2026-10-19T16:00:00Z',
  },
  {
    id: 4,
    userId: null,
    query: 'tractor rotavator',
    category: 'MACHINERY',
    region: 'Pune',
    language: 'en',
    matched: false,
    resultCount: 0,
    createdAt: '2026-10-20T04:00:00Z',
  },
]

export function readMockSearchEvents() {
  return readJson(SEARCH_KEY, DEMO_SEARCHES)
}

export async function mockRecordSearch(payload) {
  await delay(120)
  const matches = filterMockProducts({
    q: payload.query,
    category: payload.category,
    region: payload.region,
    available: true,
  })
  const events = readMockSearchEvents()
  const user = getStoredUser()
  const event = {
    id: Math.max(...events.map((item) => item.id), 0) + 1,
    userId: user?.id ?? null,
    query: payload.query.trim(),
    category: payload.category || null,
    region: payload.region || null,
    language: payload.language || 'en',
    matched: matches.length > 0,
    resultCount: matches.length,
    createdAt: new Date().toISOString(),
  }
  writeJson(SEARCH_KEY, [...events, event])
  return {
    id: event.id,
    matched: event.matched,
    resultCount: event.resultCount,
    message: event.matched
      ? 'Matching listings are available'
      : 'No matching listing is available right now. You can submit a request so farmers can respond.',
  }
}
