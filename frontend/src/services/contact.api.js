import api, { USE_MOCKS } from './api-client'
import { mockGetContactCard } from '../mocks/products.mock'

export async function getSellerContact(productId) {
  if (USE_MOCKS) return mockGetContactCard(productId)
  const { data } = await api.get(`/contact/seller/${productId}`)
  return data
}
