import api, { USE_MOCKS } from './api-client'
import { mockRecordSearch } from '../mocks/search.mock'

export async function recordSearchEvent(payload) {
  if (USE_MOCKS) return mockRecordSearch(payload)
  const { data } = await api.post('/search-events', payload)
  return data
}
