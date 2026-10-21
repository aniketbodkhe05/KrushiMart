import { getStoredUser } from '../lib/storage'

export function delay(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

export function readJson(key, fallback) {
  const raw = localStorage.getItem(key)
  if (!raw) return clone(fallback)
  try {
    return JSON.parse(raw)
  } catch {
    return clone(fallback)
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function apiError(message, code = 'MOCK_ERROR') {
  const error = new Error(message)
  error.code = code
  return error
}

export function requireSessionUser() {
  const user = getStoredUser()
  if (!user) throw apiError('Please log in to continue', 'UNAUTHORIZED')
  return user
}

export function userIdFromToken() {
  return getStoredUser()?.id ?? null
}
