import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const TONES = {
  success: 'border-leaf-200 bg-white text-leaf-800',
  error: 'border-red-200 bg-white text-red-800',
  info: 'border-sky-200 bg-white text-sky-800',
}

export default function ToastViewport({ toasts, onDismiss }) {
  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-4 top-20 z-[60] flex flex-col items-end gap-2 sm:left-auto sm:right-4 sm:w-96"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant] || ICONS.info
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-4 shadow-lg ${
              TONES[toast.variant] || TONES.info
            }`}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.message ? <p className="mt-0.5 text-xs text-stone-600">{toast.message}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
