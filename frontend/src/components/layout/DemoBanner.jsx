import { FlaskConical } from 'lucide-react'
import { USE_MOCKS } from '../../services/api-client'

export default function DemoBanner() {
  if (!USE_MOCKS) return null

  return (
    <div className="bg-harvest-100 text-harvest-900">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-1.5 text-center text-xs sm:px-6">
        <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          <strong>Demo mode.</strong> Marketplace data lives in this browser. Set{' '}
          <code className="rounded bg-white/60 px-1 py-0.5">VITE_USE_MOCKS=false</code> to use the
          Spring Boot API.
        </span>
      </div>
    </div>
  )
}
