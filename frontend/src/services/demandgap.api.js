import api, { USE_MOCKS } from './api-client'
import { mockGetOpportunity, mockListOpportunities } from '../mocks/demandgap.mock'

export async function listOpportunities(params = {}) {
  if (USE_MOCKS) return mockListOpportunities(params)
  const { data } = await api.get('/demand/opportunities', { params })
  return data
}

export async function getOpportunity(id) {
  if (USE_MOCKS) return mockGetOpportunity(id)
  const { data } = await api.get(`/demand/opportunities/${id}`)
  return data
}
