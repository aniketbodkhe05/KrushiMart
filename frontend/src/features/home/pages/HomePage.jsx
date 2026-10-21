import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Handshake,
  Radar,
  Search,
  Sparkles,
  Store,
  TrendingUp,
} from 'lucide-react'
import SearchBar from '../../../components/common/SearchBar'
import ProductCard from '../../../components/common/ProductCard'
import CategoryIcon from '../../../components/common/CategoryIcon'
import { ErrorState } from '../../../components/feedback/StatePanel'
import { buttonClasses } from '../../../components/ui/buttonStyles'
import { categoryTone } from '../../../lib/categoryTone'
import { useApi } from '../../../hooks/useApi'
import { useAuth } from '../../../hooks/useAuth'
import { CATEGORY_OPTIONS } from '../../../lib/constants'
import { listProducts } from '../../../services/products.api'
import { recordSearchEvent } from '../../../services/search.api'

const CATEGORY_HREFS = {
  MACHINERY: '/marketplace?category=MACHINERY',
  TOOLS: '/marketplace?category=TOOLS',
  IRRIGATION: '/marketplace?category=IRRIGATION',
  SEEDS: '/marketplace?category=SEEDS',
  FERTILIZERS: '/marketplace?category=FERTILIZERS',
  PESTICIDES: '/marketplace?category=PESTICIDES',
  OTHER: '/marketplace?category=OTHER',
}

export default function HomePage() {
  const navigate = useNavigate()
  const { canSell } = useAuth()
  const featured = useApi(() => listProducts({ size: 4, sort: 'createdAt,desc' }), [])

  const search = (query) => {
    if (!query) return
    recordSearchEvent({ query, language: 'en' }).catch(() => {})
    navigate(`/marketplace?q=${encodeURIComponent(query)}`)
  }

  return (
    <div>
      <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-br from-leaf-50 via-stone-50 to-harvest-50">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-leaf-200/40 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-harvest-200/30 blur-3xl" />
        <div className="page-shell relative grid gap-10 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-leaf-200 bg-white/80 px-3 py-1 text-xs font-semibold text-leaf-800">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              AI-assisted matching · DemandGap Radar
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl">
              The farm supply you need is closer than you think.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
              KrushiMart connects farmers who need a product with farmers who already have it. Search
              locally, request what is missing, and let unmet demand guide the next listing.
            </p>
            <SearchBar onSubmit={search} className="mt-7 max-w-xl" placeholder="Try “mini tiller” or “ठिबक सिंचन”" />
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-stone-600">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-leaf-700" aria-hidden="true" /> English, Hindi, Marathi
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-leaf-700" aria-hidden="true" /> Consent-first contact
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-leaf-700" aria-hidden="true" /> Works without AI
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-soft backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-leaf-700">DemandGap Radar</p>
                  <p className="mt-1 text-lg font-semibold text-stone-900">Nashik · Machinery</p>
                </div>
                <span className="rounded-xl bg-harvest-100 p-2 text-harvest-700">
                  <Radar className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-stone-50 p-3">
                  <p className="text-2xl font-bold text-stone-900">3</p>
                  <p className="text-[11px] text-stone-500">requesters</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-3">
                  <p className="text-2xl font-bold text-stone-900">61</p>
                  <p className="text-[11px] text-stone-500">gap score</p>
                </div>
                <div className="rounded-xl bg-stone-50 p-3">
                  <p className="text-2xl font-bold text-stone-900">1</p>
                  <p className="text-[11px] text-stone-500">active listing</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-stone-500">
                Example from demo data. Scores are deterministic and explainable — never decided by the AI
                model.
              </p>
              <Link
                to={canSell ? '/demandgap' : '/register'}
                className={buttonClasses({ variant: 'harvest', size: 'sm', className: 'mt-4 w-full' })}
              >
                {canSell ? 'See farmer opportunities' : 'Join as a farmer'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell section-space">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Browse by need</p>
            <h2 className="mt-1 text-2xl font-bold text-stone-900">What are you looking for?</h2>
          </div>
          <Link to="/marketplace" className="text-sm font-semibold text-leaf-700 hover:text-leaf-900">
            View all listings →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {CATEGORY_OPTIONS.map((category) => (
            <Link
              key={category.value}
              to={CATEGORY_HREFS[category.value]}
              className="rounded-2xl border border-stone-200 bg-white p-4 text-center transition hover:-translate-y-0.5 hover:border-leaf-300 hover:shadow-sm"
            >
              <span className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl ${categoryTone(category.value)}`}>
                <CategoryIcon category={category.value} className="h-5 w-5" />
              </span>
              <span className="mt-2 block text-sm font-semibold text-stone-800">{category.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="page-shell section-space">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Fresh listings</p>
              <h2 className="mt-1 text-2xl font-bold text-stone-900">Recently added by farmers</h2>
            </div>
            <Link to="/marketplace?sort=createdAt,desc" className="text-sm font-semibold text-leaf-700 hover:text-leaf-900">
              Browse marketplace →
            </Link>
          </div>

          {featured.loading ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-80 skeleton" />
              ))}
            </div>
          ) : featured.error ? (
            <div className="mt-6">
              <ErrorState message={featured.error} onRetry={featured.reload} />
            </div>
          ) : featured.data?.items?.length ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-2xl bg-stone-50 p-6 text-sm text-stone-600">
              No listings yet. Be the first farmer to add one.
            </p>
          )}
        </div>
      </section>

      <section className="page-shell section-space">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Search,
              title: 'Search across the marketplace',
              text: 'Find tools, irrigation equipment, seeds and inputs listed by farmers in nearby regions.',
            },
            {
              icon: Handshake,
              title: 'Request or contact safely',
              text: 'No match? Submit a request. Seller phone numbers appear only when the seller opts in.',
            },
            {
              icon: TrendingUp,
              title: 'Turn unmet demand into a listing',
              text: 'DemandGap Radar surfaces explainable local demand so farmers know what is worth listing.',
            },
          ].map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-stone-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf-100 text-leaf-800">
                  <step.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="text-3xl font-bold text-stone-200">0{index + 1}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-stone-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell pb-16">
        <div className="overflow-hidden rounded-3xl bg-leaf-900 p-7 text-white sm:p-10">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-leaf-200">
                <Store className="h-4 w-4" aria-hidden="true" /> Built for both sides
              </span>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">A seller today can be a buyer tomorrow.</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-leaf-100">
                One account, role-appropriate tools. Farmers can list and buy. Customers can search,
                request, and track responses without a second app.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to={canSell ? '/products/new' : '/register'} className={buttonClasses({ variant: 'harvest', size: 'md' })}>
                  {canSell ? 'List your product' : 'Create an account'}
                </Link>
                <Link
                  to="/marketplace"
                  className={buttonClasses({ variant: 'secondary', size: 'md', className: 'bg-white/10 text-white ring-white/30 hover:bg-white/20' })}
                >
                  Explore listings
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-leaf-50">
              <p className="flex items-center gap-2 font-semibold text-white">
                <BadgeCheck className="h-4 w-4" aria-hidden="true" /> MVP scope, stated honestly
              </p>
              <ul className="mt-3 space-y-2 text-leaf-100">
                <li>• No online payments or delivery.</li>
                <li>• Initial contact happens by phone with consent.</li>
                <li>• AI matching is optional and has a tested fallback.</li>
                <li>• Demo accounts and data are for local development.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
