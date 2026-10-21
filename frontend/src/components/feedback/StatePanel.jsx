import { AlertTriangle, Inbox, LoaderCircle, RotateCw, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import { buttonClasses } from '../ui/buttonStyles'

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white p-8 text-stone-600">
      <LoaderCircle className="h-7 w-7 animate-spin text-leaf-700" aria-hidden="true" />
      <p className="text-sm font-medium" role="status">
        {label}
      </p>
    </div>
  )
}

export function ErrorState({ message, onRetry, className = '' }) {
  return (
    <div
      className={`flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-8 text-center ${className}`}
      role="alert"
    >
      <AlertTriangle className="h-8 w-8 text-red-600" aria-hidden="true" />
      <div>
        <p className="font-semibold text-red-900">Could not load this content</p>
        <p className="mt-1 text-sm text-red-700">{message || 'Please try again.'}</p>
      </div>
      {onRetry ? (
        <Button variant="secondary" size="sm" icon={RotateCw} onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}

export function EmptyState({ icon = Inbox, title, message, action, className = '' }) {
  const Icon = icon
  return (
    <div
      className={`flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center ${className}`}
    >
      <span className="rounded-2xl bg-white p-3 text-leaf-700 shadow-sm">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </span>
      <div>
        <p className="font-semibold text-stone-900">{title}</p>
        {message ? <p className="mx-auto mt-1 max-w-md text-sm text-stone-600">{message}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function AccessDenied({ message = 'This page is only available to farmer accounts.' }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-harvest-200 bg-harvest-50 p-10 text-center">
      <ShieldAlert className="h-10 w-10 text-harvest-700" aria-hidden="true" />
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Access restricted</h1>
        <p className="mt-2 text-sm text-stone-600">{message}</p>
      </div>
      <div className="flex gap-2">
        <Link to="/marketplace" className={buttonClasses({ variant: 'primary', size: 'sm' })}>
          Browse marketplace
        </Link>
        <Link to="/requests/new" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
          Request a product
        </Link>
      </div>
    </div>
  )
}
