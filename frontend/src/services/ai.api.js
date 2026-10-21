import api, { USE_MOCKS } from './api-client'

export async function getAiHealth() {
  if (USE_MOCKS) {
    return {
      status: 'mock',
      provider: 'fallback',
      aiAvailable: false,
      fallbackAvailable: true,
      detail: 'Mock mode uses deterministic data. Start the backend and AI service for live matching.',
    }
  }
  const { data } = await api.get('/ai/health')
  return data
}

export async function normalizeText(text) {
  if (USE_MOCKS) {
    throw new Error('AI normalization needs the live backend and AI service')
  }
  const { data } = await api.post('/ai/normalize', { text })
  return data
}

export async function matchProducts(payload) {
  if (USE_MOCKS) {
    throw new Error('AI matching needs the live backend and AI service')
  }
  const { data } = await api.post('/ai/match', payload)
  return data
}
