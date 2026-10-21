import { Link } from 'react-router-dom'
import { ClipboardList, Plus, ShieldCheck } from 'lucide-react'
import PageHeader from '../../../components/common/PageHeader'
import CategoryIcon from '../../../components/common/CategoryIcon'
import StatusBadge from '../../../components/common/StatusBadge'
import Card from '../../../components/ui/Card'
import { buttonClasses } from '../../../components/ui/buttonStyles'
import { categoryTone } from '../../../lib/categoryTone'
import { EmptyState, ErrorState, LoadingState } from '../../../components/feedback/StatePanel'
import { useApi } from '../../../hooks/useApi'
import { CATEGORY_LABELS } from '../../../lib/constants'
import { formatDate, formatQuantity } from '../../../utils/format'
import { listMyRequests } from '../../../services/requests.api'

export default function MyRequestsPage() {
  const requests = useApi(() => listMyRequests(), [])
  const items = requests.data || []
  const openCount = items.filter((request) => request.status === 'OPEN').length

  return (
    <div className="page-shell py-8 sm:py-10">
      <PageHeader
        eyebrow="Requests"
        title="My product requests"
        description="Track what you have asked for. Open requests are eligible for DemandGap aggregation and matching notifications."
        action={
          <Link to="/requests/new" className={buttonClasses({ variant: 'primary', size: 'md' })}>
            <Plus className="h-4 w-4" aria-hidden="true" /> New request
          </Link>
        }
      />

      {!requests.loading && !requests.error ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-stone-600">
          <span className="rounded-full bg-white px-3 py-1 font-medium ring-1 ring-stone-200">
            {items.length} total
          </span>
          <span className="rounded-full bg-leaf-50 px-3 py-1 font-medium text-leaf-800 ring-1 ring-leaf-200">
            {openCount} open
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-leaf-700" aria-hidden="true" />
            Visible only to you and eligible farmers
          </span>
        </div>
      ) : null}

      <div className="mt-5">
        {requests.loading ? (
          <LoadingState label="Loading your requests…" />
        ) : requests.error ? (
          <ErrorState message={requests.error} onRetry={requests.reload} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No requests yet"
            message="If you cannot find a product in the marketplace, submit a request so eligible farmers can respond."
            action={
              <Link to="/requests/new" className={buttonClasses({ variant: 'primary', size: 'sm' })}>
                Submit a request
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {items.map((request) => (
              <Card key={request.id} className="p-5">
                <div className="flex flex-wrap items-start gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${categoryTone(request.category)}`}>
                    <CategoryIcon category={request.category} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-stone-900">{request.title}</h2>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="mt-1 text-sm leading-6 text-stone-600">{request.description}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
                      <span>{CATEGORY_LABELS[request.category] || request.category}</span>
                      <span>{request.region}</span>
                      <span>{formatQuantity(request.quantity, request.unit)}</span>
                      <span>Submitted {formatDate(request.createdAt)}</span>
                      <span className="font-mono text-stone-400">#{request.id}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
