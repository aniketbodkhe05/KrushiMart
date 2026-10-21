import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, PackageSearch, SlidersHorizontal, X } from 'lucide-react'
import SearchBar from '../../../components/common/SearchBar'
import ProductCard from '../../../components/common/ProductCard'
import { EmptyState, ErrorState } from '../../../components/feedback/StatePanel'
import Button from '../../../components/ui/Button'
import { buttonClasses } from '../../../components/ui/buttonStyles'
import { SelectInput } from '../../../components/forms/FormField'
import { useApi } from '../../../hooks/useApi'
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  REGIONS,
  SORT_OPTIONS,
} from '../../../lib/constants'
import { listProducts } from '../../../services/products.api'
import { recordSearchEvent } from '../../../services/search.api'

export default function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const region = searchParams.get('region') || ''
  const available = searchParams.get('available') || 'true'
  const sort = searchParams.get('sort') || 'createdAt,desc'
  const page = Math.max(Number(searchParams.get('page')) || 0, 0)

  const products = useApi(
    () =>
      listProducts({
        q: query || undefined,
        category: category || undefined,
        region: region || undefined,
        available: available !== 'false',
        sort,
        page,
        size: 12,
      }),
    [searchParams.toString()],
  )

  const updateParams = (updates, { resetPage = true } = {}) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === undefined || value === null) next.delete(key)
      else next.set(key, String(value))
    })
    if (resetPage) next.set('page', '0')
    setSearchParams(next)
  }

  const onSearch = (nextQuery) => {
    updateParams({ q: nextQuery })
    if (nextQuery) {
      recordSearchEvent({
        query: nextQuery,
        category: category || undefined,
        region: region || undefined,
        language: 'en',
      }).catch(() => {})
    }
  }

  const clearFilters = () => setSearchParams(new URLSearchParams())
  const hasFilters = Boolean(query || category || region || available === 'false')
  const total = products.data?.total ?? 0
  const totalPages = products.data?.totalPages ?? 0

  return (
    <div className="page-shell py-8 sm:py-10">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Marketplace</p>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">Find what your farm needs</h1>
        <p className="max-w-2xl text-sm text-stone-600">
          Search active listings from farmers. Contact details are shared only when the seller opts in.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <SearchBar initialQuery={query} onSubmit={onSearch} buttonLabel="Search" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParams({ category: '' })}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              !category ? 'bg-leaf-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All categories
          </button>
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateParams({ category: option.value })}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                category === option.value
                  ? 'bg-leaf-700 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-4 sm:flex-row sm:items-end">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-stone-500 sm:mb-2.5">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
        </div>
        <label className="flex-1 text-xs font-medium text-stone-600">
          Region
          <SelectInput
            className="mt-1 py-2"
            value={region}
            onChange={(event) => updateParams({ region: event.target.value })}
          >
            <option value="">All regions</option>
            {REGIONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </SelectInput>
        </label>
        <label className="flex-1 text-xs font-medium text-stone-600">
          Availability
          <SelectInput
            className="mt-1 py-2"
            value={available}
            onChange={(event) => updateParams({ available: event.target.value })}
          >
            <option value="true">Available only</option>
            <option value="false">Unavailable / inactive</option>
          </SelectInput>
        </label>
        <label className="flex-1 text-xs font-medium text-stone-600">
          Sort by
          <SelectInput
            className="mt-1 py-2"
            value={sort}
            onChange={(event) => updateParams({ sort: event.target.value })}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </label>
        {hasFilters ? (
          <Button variant="ghost" size="sm" icon={X} onClick={clearFilters} className="sm:mb-0.5">
            Clear
          </Button>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-600" aria-live="polite">
          {products.loading ? 'Searching…' : `${total} listing${total === 1 ? '' : 's'} found`}
          {category ? ` in ${CATEGORY_LABELS[category] || category}` : ''}
          {query ? ` for “${query}”` : ''}
        </p>
        {query ? (
          <button
            type="button"
            onClick={() => updateParams({ q: '' })}
            className="inline-flex items-center gap-1 text-xs font-semibold text-leaf-700 hover:text-leaf-900"
          >
            Clear search <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="mt-4">
        {products.loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-80 skeleton" />
            ))}
          </div>
        ) : products.error ? (
          <ErrorState message={products.error} onRetry={products.reload} />
        ) : total === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No matching listings"
            message="Try a broader search or a different region. If you still cannot find it, submit a request so eligible farmers can respond."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link
                  to="/requests/new"
                  className={buttonClasses({ variant: 'primary', size: 'sm' })}
                >
                  Request this product
                </Link>
                {hasFilters ? (
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : null}
              </div>
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.data.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {!products.loading && !products.error && totalPages > 1 ? (
        <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Marketplace pages">
          <Button
            variant="secondary"
            size="sm"
            icon={ChevronLeft}
            disabled={page <= 0}
            onClick={() => updateParams({ page: page - 1 }, { resetPage: false })}
          >
            Previous
          </Button>
          <span className="text-sm text-stone-600">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => updateParams({ page: page + 1 }, { resetPage: false })}
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </nav>
      ) : null}
    </div>
  )
}
