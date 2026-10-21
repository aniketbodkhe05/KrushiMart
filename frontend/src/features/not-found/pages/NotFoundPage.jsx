import { Link } from 'react-router-dom'
import { Leaf, Sprout } from 'lucide-react'
import { buttonClasses } from '../../../components/ui/buttonStyles'

export default function NotFoundPage() {
  return (
    <div className="page-shell flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-leaf-100 text-leaf-700">
        <Sprout className="h-9 w-9" aria-hidden="true" />
      </span>
      <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-leaf-700">404</p>
      <h1 className="mt-1 text-3xl font-bold text-stone-900">This field is fallow</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-stone-600">
        The page you are looking for does not exist or has moved. Head back to the marketplace to keep
        browsing.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link to="/" className={buttonClasses({ variant: 'primary', size: 'md' })}>
          <Leaf className="h-4 w-4" aria-hidden="true" /> Go home
        </Link>
        <Link to="/marketplace" className={buttonClasses({ variant: 'secondary', size: 'md' })}>
          Browse products
        </Link>
      </div>
    </div>
  )
}
