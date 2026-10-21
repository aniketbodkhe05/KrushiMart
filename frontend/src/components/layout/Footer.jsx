import { Link } from 'react-router-dom'
import { Leaf, ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="h-8 w-8" />
            <span className="text-base font-bold text-stone-900">KrushiMart</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-stone-600">
            A farmer-first marketplace with AI-assisted product matching and an explainable DemandGap
            Radar. Built as a focused MVP, not a production trading platform.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">Marketplace</p>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>
              <Link to="/marketplace" className="hover:text-leaf-700">
                Browse products
              </Link>
            </li>
            <li>
              <Link to="/requests/new" className="hover:text-leaf-700">
                Request a product
              </Link>
            </li>
            <li>
              <Link to="/demandgap" className="hover:text-leaf-700">
                Farmer demand opportunities
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">Trust and scope</p>
          <ul className="mt-3 space-y-3 text-sm text-stone-600">
            <li className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-leaf-700" aria-hidden="true" />
              Phone numbers are shared only after the seller opts in.
            </li>
            <li className="flex gap-2">
              <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-leaf-700" aria-hidden="true" />
              No payments, delivery, or chat in this MVP. Contact happens off-platform.
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-100 px-4 py-4 text-center text-xs text-stone-500">
        KrushiMart MVP · October 2026 · Sample data is clearly marked as demo data
      </div>
    </footer>
  )
}
