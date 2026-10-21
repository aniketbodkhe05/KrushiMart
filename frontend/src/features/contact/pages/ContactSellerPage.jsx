import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Phone, ShieldCheck, Store } from 'lucide-react'
import Card from '../../../components/ui/Card'
import { ErrorState, LoadingState } from '../../../components/feedback/StatePanel'
import { buttonClasses } from '../../../components/ui/buttonStyles'
import { useApi } from '../../../hooks/useApi'
import { getSellerContact } from '../../../services/contact.api'

export default function ContactSellerPage() {
  const { productId } = useParams()
  const contact = useApi(() => getSellerContact(productId), [productId])

  if (contact.loading) {
    return (
      <div className="page-shell py-10">
        <LoadingState label="Checking contact consent…" />
      </div>
    )
  }

  if (contact.error) {
    return (
      <div className="page-shell py-10">
        <ErrorState message={contact.error} onRetry={contact.reload} />
        <div className="mt-4 text-center">
          <Link to={`/products/${productId}`} className="text-sm font-semibold text-leaf-700">
            ← Back to product
          </Link>
        </div>
      </div>
    )
  }

  const seller = contact.data

  return (
    <div className="page-shell py-8 sm:py-10">
      <Link
        to={`/products/${productId}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-leaf-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to product
      </Link>

      <div className="mx-auto mt-5 max-w-xl">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-leaf-700 to-leaf-800 p-6 text-white">
            <div className="flex items-center gap-2 text-sm font-medium text-leaf-100">
              <Store className="h-4 w-4" aria-hidden="true" /> Seller contact
            </div>
            <h1 className="mt-3 text-2xl font-bold">{seller.sellerName}</h1>
            <p className="mt-1 text-sm text-leaf-100">{seller.region}</p>
          </div>

          <div className="p-6">
            {seller.contactVisible && seller.phone ? (
              <>
                <p className="text-sm text-stone-600">Call the seller directly about this listing.</p>
                <a
                  href={`tel:${String(seller.phone).replace(/[^\d+]/g, '')}`}
                  className={buttonClasses({ variant: 'primary', size: 'lg', className: 'mt-4 w-full' })}
                >
                  <Phone className="h-5 w-5" aria-hidden="true" /> {seller.phone}
                </a>
                <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-stone-500">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  KrushiMart does not provide in-app chat or payment protection. Confirm the product and
                  price before paying, and prefer inspection or a safe local exchange.
                </p>
              </>
            ) : (
              <div className="rounded-xl border border-harvest-200 bg-harvest-50 p-4">
                <p className="font-semibold text-harvest-900">Contact details are hidden</p>
                <p className="mt-1 text-sm leading-6 text-harvest-800">{seller.consentNote}</p>
                <Link
                  to="/marketplace"
                  className={buttonClasses({ variant: 'secondary', size: 'sm', className: 'mt-4' })}
                >
                  Find another listing
                </Link>
              </div>
            )}

            <div className="mt-5 flex items-start gap-2 border-t border-stone-100 pt-4 text-xs leading-5 text-stone-500">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-leaf-700" aria-hidden="true" />
              {seller.contactVisible
                ? seller.consentNote
                : 'The seller chooses whether to display a phone number. KrushiMart never reveals it without consent.'}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
