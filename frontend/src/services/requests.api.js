import api, { USE_MOCKS } from './api-client'
import { mockCreateRequest, mockGetRequest, mockListMyRequests } from '../mocks/requests.mock'

export async function createRequest(payload) {
  if (USE_MOCKS) return mockCreateRequest(payload)
  const { data } = await api.post('/requests', payload)
  return data
}

export async function listMyRequests() {
  if (USE_MOCKS) return mockListMyRequests()
  const { data } = await api.get('/requests/mine')
  return data
}

export async function getRequest(id) {
  if (USE_MOCKS) return mockGetRequest(id)
  const { data } = await api.get(`/requests/${id}`)
  return data
}
