import { UNIT_LABELS } from '../lib/constants'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
})

export function formatCurrency(value) {
  const number = Number(value)
  return Number.isFinite(number) ? currencyFormatter.format(number) : '—'
}

export function formatNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? numberFormatter.format(number) : '—'
}

export function formatQuantity(value, unit) {
  if (value === null || value === undefined) return '—'
  return `${formatNumber(value)} ${(UNIT_LABELS[unit] || unit || '').toLowerCase()}`
}

export function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatRelativeTime(value) {
  if (!value) return ''
  const date = new Date(value)
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const ranges = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ]
  for (const [unit, seconds] of ranges) {
    if (Math.abs(diffSeconds) >= seconds) {
      return formatter.format(Math.round(diffSeconds / seconds), unit)
    }
  }
  return 'just now'
}

export function truncate(value, length = 140) {
  if (!value) return ''
  return value.length > length ? `${value.slice(0, length - 1)}…` : value
}
