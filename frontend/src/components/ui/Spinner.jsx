import { LoaderCircle } from 'lucide-react'

export default function Spinner({ className = 'h-5 w-5', label = 'Loading' }) {
  return (
    <span className="inline-flex items-center" role="status" aria-label={label}>
      <LoaderCircle className={`${className} animate-spin text-leaf-700`} aria-hidden="true" />
    </span>
  )
}
