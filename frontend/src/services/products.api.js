import api, { USE_MOCKS } from './api-client'
import {
  mockCreateProduct,
  mockDeactivateProduct,
  mockGetProduct,
  mockListProducts,
  mockUpdateProduct,
} from '../mocks/products.mock'

export async function listProducts(params = {}) {
  if (USE_MOCKS) return mockListProducts(params)
  const { data } = await api.get('/products', { params })
  return data
}

export async function getProduct(id) {
  if (USE_MOCKS) return mockGetProduct(id)
  const { data } = await api.get(`/products/${id}`)
  return data
}

export async function createProduct(payload) {
  if (USE_MOCKS) return mockCreateProduct(payload)
  const { data } = await api.post('/products', payload)
  return data
}

export async function updateProduct(id, payload) {
  if (USE_MOCKS) return mockUpdateProduct(id, payload)
  const { data } = await api.put(`/products/${id}`, payload)
  return data
}

export async function deactivateProduct(id) {
  if (USE_MOCKS) return mockDeactivateProduct(id)
  await api.delete(`/products/${id}`)
}
