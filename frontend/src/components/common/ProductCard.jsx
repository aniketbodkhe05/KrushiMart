import { Link } from 'react-router-dom'
import { MapPin, PackageCheck, Store } from 'lucide-react'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import CategoryIcon from './CategoryIcon'
import { categoryTone } from '../../lib/categoryTone'
import { CATEGORY_LABELS } from '../../lib/constants'
import { formatCurrency, formatQuantity } from '../../utils/format'

export default function ProductCard({ product }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-soft">
      <Link
        to={`/products/${product.id}`}
        className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-stone-100 to-leaf-50"
        aria-label={`View ${product.title}`}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className={`rounded-2xl p-4 ${categoryTone(product.category)}`}>
            <CategoryIcon category={product.category} className="h-10 w-10" />
          </span>
        )}
        <span className="absolute left-3 top-3">
          <Badge tone="neutral">{CATEGORY_LABELS[product.category] || product.category}</Badge>
        </span>
        {!product.available ? (
          <span className="absolute right-3 top-3">
            <Badge tone={product.listingStatus === 'SOLD' ? 'amber' : 'neutral'}>
              {product.listingStatus === 'SOLD' ? 'Sold' : 'Unavailable'}
            </Badge>
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-stone-900">
          <Link to={`/products/${product.id}`} className="hover:text-leaf-700">
            {product.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-500">{product.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {product.region}
          </span>
          <span className="inline-flex items-center gap-1">
            <PackageCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {formatQuantity(product.quantityAvailable, product.unit)}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            <p className="text-lg font-bold text-stone-900">{formatCurrency(product.price)}</p>
            <p className="text-[11px] text-stone-500">per {product.unit?.toLowerCase()}</p>
          </div>
          <span className="inline-flex max-w-[45%] items-center gap-1 truncate text-xs text-stone-500">
            <Store className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{product.sellerName}</span>
          </span>
        </div>
      </div>
    </Card>
  )
}
