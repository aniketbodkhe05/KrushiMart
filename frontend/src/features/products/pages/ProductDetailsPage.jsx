import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Languages,
  MapPin,
  PackageCheck,
  Pencil,
  Phone,
  ShieldCheck,
  Store,
  Trash2,
} from 'lucide-react'
import CategoryIcon from '../../../components/common/CategoryIcon'
import StatusBadge from '../../../components/common/StatusBadge'
import ConfirmDialog from '../../../components/common/ConfirmDialog'
import { ErrorState, LoadingState } from '../../../components/feedback/StatePanel'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { buttonClasses } from '../../../components/ui/buttonStyles'
import { categoryTone } from '../../../lib/categoryTone'
import { useApi } from '../../../hooks/useApi'
import { useAuth } from '../../../hooks/useAuth'
import { useToast } from '../../../hooks/useToast'
import { CATEGORY_LABELS, LANGUAGE_OPTIONS } from '../../../lib/constants'
import { formatCurrency, formatDate, formatQuantity } from '../../../utils/format'
import { deactivateProduct, getProduct } from '../../../services/products.api'
import { getErrorMessage } from '../../../services/api-client'

export default function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()
  const productState = useApi(() => getProduct(id), [id])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  if (productState.loading) return <div className="page-shell py-10"><LoadingState label="Loading product…" /></div>
  if (productState.error) {
    return (
      <div className="page-shell py-10">
        <ErrorState message={productState.error} onRetry={productState.reload} />
        <div className="mt-4 text-center">
          <Link to="/marketplace" className="text-sm font-semibold text-leaf-700">← Back to marketplace</Link>
        </div>
      </div>
    )
  }

  const product = productState.data
  const isOwner = user?.id === product.sellerId
  const language = LANGUAGE_OPTIONS.find((option) => option.value === product.language)?.label || product.language
  const requestParams = new URLSearchParams({
    title: product.title,
    category: product.category,
    region: product.region,
  })
  const contactHref = user
    ? `/contact/${product.id}`
    : `/login?redirect=${encodeURIComponent(`/contact/${product.id}`)}`

  const handleDeactivate = async () => {
    setDeactivating(true)
    try {
      await deactivateProduct(product.id)
      addToast({
        title: 'Listing deactivated',
        message: 'The product is hidden from the available marketplace.',
      })
      setConfirmOpen(false)
      navigate('/marketplace')
    } catch (error) {
      addToast({ title: 'Could not deactivate', message: getErrorMessage(error), variant: 'error' })
    } finally {
      setDeactivating(false)
    }
  }

  return (
    <div className="page-shell py-8 sm:py-10">
      <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-leaf-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to marketplace
      </Link>

      <div className="mt-5 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div>
          <Card className="overflow-hidden">
            <div className="relative flex min-h-64 items-center justify-center bg-gradient-to-br from-stone-100 via-leaf-50 to-harvest-50 p-8 sm:min-h-80">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.title} className="max-h-80 rounded-xl object-cover" />
              ) : (
                <span className={`rounded-3xl p-8 ${categoryTone(product.category)}`}>
                  <CategoryIcon category={product.category} className="h-20 w-20" />
                </span>
              )}
              <div className="absolute left-5 top-5 flex gap-2">
                <Badge tone="neutral">{CATEGORY_LABELS[product.category] || product.category}</Badge>
                <StatusBadge status={product.listingStatus} />
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">{product.title}</h1>
                  <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-500">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" aria-hidden="true" /> {product.region}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <PackageCheck className="h-4 w-4" aria-hidden="true" />
                      {formatQuantity(product.quantityAvailable, product.unit)} available
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Languages className="h-4 w-4" aria-hidden="true" /> {language}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-stone-900">{formatCurrency(product.price)}</p>
                  <p className="text-xs text-stone-500">per {product.unit?.toLowerCase()}</p>
                </div>
              </div>

              <div className="mt-6 border-t border-stone-100 pt-5">
                <h2 className="text-sm font-semibold text-stone-900">About this listing</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-stone-600">{product.description}</p>
              </div>

              <dl className="mt-6 grid gap-4 rounded-xl bg-stone-50 p-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-stone-500">Availability</dt>
                  <dd className="mt-1 font-semibold text-stone-800">{product.available ? 'Available' : 'Not available'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-500">Listed</dt>
                  <dd className="mt-1 inline-flex items-center gap-1.5 font-semibold text-stone-800">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatDate(product.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-500">Currency</dt>
                  <dd className="mt-1 font-semibold text-stone-800">{product.currency}</dd>
                </div>
              </dl>

              {isOwner ? (
                <div className="mt-6 flex flex-wrap gap-2 border-t border-stone-100 pt-5">
                  <Link
                    to={`/products/${product.id}/edit`}
                    className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Edit listing
                  </Link>
                  {product.listingStatus !== 'INACTIVE' ? (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => setConfirmOpen(true)}
                    >
                      Deactivate
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <Store className="h-4 w-4 text-leaf-700" aria-hidden="true" /> Seller
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-leaf-100 text-base font-bold text-leaf-800">
                {product.sellerName?.slice(0, 1)}
              </span>
              <div>
                <p className="font-semibold text-stone-900">{product.sellerName}</p>
                <p className="text-xs text-stone-500">Based in {product.region}</p>
              </div>
            </div>

            {product.available ? (
              <Link
                to={contactHref}
                className={buttonClasses({ variant: 'primary', size: 'md', className: 'mt-5 w-full' })}
              >
                <Phone className="h-4 w-4" aria-hidden="true" /> Contact seller
              </Link>
            ) : (
              <div className="mt-5 rounded-xl border border-harvest-200 bg-harvest-50 p-3 text-xs leading-5 text-harvest-900">
                This listing is {product.listingStatus === 'SOLD' ? 'sold' : 'not active'}, so contact
                details are not shown. You can still submit a request for a similar product.
              </div>
            )}

            <Link
              to={`/requests/new?${requestParams.toString()}`}
              className={buttonClasses({ variant: 'secondary', size: 'md', className: 'mt-2 w-full' })}
            >
              Request a similar product
            </Link>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <ShieldCheck className="h-4 w-4 text-leaf-700" aria-hidden="true" /> Safe contact
            </div>
            <p className="mt-2 text-xs leading-5 text-stone-600">
              KrushiMart shares a seller's phone number only if that seller has opted in. Use the number
              only for this listing, and never send advance payments.
            </p>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Deactivate this listing?"
        confirmLabel="Deactivate listing"
        loading={deactivating}
        onConfirm={handleDeactivate}
        onClose={() => setConfirmOpen(false)}
      >
        This removes the listing from available search results. Existing requests and notifications are
        unaffected, and you can edit and reactivate it later.
      </ConfirmDialog>
    </div>
  )
}
