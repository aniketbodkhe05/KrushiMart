import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  BellRing,
  CheckCheck,
  Handshake,
  TrendingUp,
} from 'lucide-react'
import PageHeader from '../../../components/common/PageHeader'
import Card from '../../../components/ui/Card'
import Badge from '../../../components/ui/Badge'
import Button from '../../../components/ui/Button'
import { EmptyState, ErrorState, LoadingState } from '../../../components/feedback/StatePanel'
import { useApi } from '../../../hooks/useApi'
import { useToast } from '../../../hooks/useToast'
import { formatRelativeTime } from '../../../utils/format'
import { listNotifications, markNotificationRead } from '../../../services/notifications.api'
import { getErrorMessage } from '../../../services/api-client'

const TYPE_META = {
  DEMAND_OPPORTUNITY: { icon: TrendingUp, label: 'Demand opportunity', tone: 'green' },
  REQUEST_MATCH: { icon: Handshake, label: 'Request match', tone: 'amber' },
  SYSTEM: { icon: BellRing, label: 'System', tone: 'neutral' },
}

function notificationHref(notification) {
  if (notification.relatedProductId) return `/products/${notification.relatedProductId}`
  if (notification.relatedOpportunityId) return '/demandgap'
  if (notification.relatedRequestId) return '/requests'
  return null
}

export default function NotificationsPage() {
  const notifications = useApi(() => listNotifications(), [])
  const { addToast } = useToast()
  const [items, setItems] = useState(null)
  const [filter, setFilter] = useState('all')
  const [markingAll, setMarkingAll] = useState(false)
  const [markingId, setMarkingId] = useState(null)

  const source = items ?? notifications.data ?? []
  const unreadCount = source.filter((notification) => !notification.read).length
  const visible = filter === 'unread' ? source.filter((notification) => !notification.read) : source

  const markRead = async (notification, { silent = false } = {}) => {
    if (notification.read) return true
    setMarkingId(notification.id)
    try {
      await markNotificationRead(notification.id)
      setItems((current) =>
        (current ?? notifications.data ?? []).map((item) =>
          item.id === notification.id ? { ...item, read: true } : item,
        ),
      )
      window.dispatchEvent(new Event('krushimart:notifications-changed'))
      return true
    } catch (error) {
      if (!silent) {
        addToast({ title: 'Could not update notification', message: getErrorMessage(error), variant: 'error' })
      }
      return false
    } finally {
      setMarkingId(null)
    }
  }

  const markAllRead = async () => {
    const unread = source.filter((notification) => !notification.read)
    if (unread.length === 0) return
    setMarkingAll(true)
    let failures = 0
    for (const notification of unread) {
      const ok = await markRead(notification, { silent: true })
      if (!ok) failures += 1
    }
    setMarkingAll(false)
    if (failures > 0) {
      addToast({
        title: 'Some notifications were not updated',
        message: 'Refresh the page and try again.',
        variant: 'error',
      })
    }
  }

  return (
    <div className="page-shell py-8 sm:py-10">
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Demand opportunities, request matches and account notices. Notifications are created only for opted-in users."
        action={
          unreadCount > 0 ? (
            <Button variant="secondary" icon={CheckCheck} loading={markingAll} onClick={markAllRead}>
              Mark all read
            </Button>
          ) : null
        }
      />

      {!notifications.loading && !notifications.error ? (
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-stone-200">
          {[
            { value: 'all', label: `All (${source.length})` },
            { value: 'unread', label: `Unread (${unreadCount})` },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setFilter(tab.value)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
                filter === tab.value
                  ? 'border-leaf-700 text-leaf-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-5">
        {notifications.loading ? (
          <LoadingState label="Loading notifications…" />
        ) : notifications.error ? (
          <ErrorState message={notifications.error} onRetry={notifications.reload} />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            message={
              filter === 'unread'
                ? 'You are all caught up.'
                : 'Enable notifications in your profile to hear about relevant demand and matching requests.'
            }
            action={
              <Link to="/profile" className="text-sm font-semibold text-leaf-700">
                Notification settings
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {visible.map((notification) => {
              const meta = TYPE_META[notification.type] || TYPE_META.SYSTEM
              const Icon = meta.icon
              const href = notificationHref(notification)
              return (
                <Card
                  key={notification.id}
                  className={`p-4 sm:p-5 ${notification.read ? '' : 'border-leaf-200 bg-leaf-50/40'}`}
                >
                  <div className="flex gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        notification.read ? 'bg-stone-100 text-stone-500' : 'bg-leaf-100 text-leaf-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                        {!notification.read ? <span className="h-2 w-2 rounded-full bg-leaf-600" aria-label="Unread" /> : null}
                        <span className="text-xs text-stone-400">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                      <h2 className="mt-2 font-semibold text-stone-900">{notification.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-stone-600">{notification.message}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {href ? (
                          <Link
                            to={href}
                            onClick={() => markRead(notification)}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-leaf-700 hover:text-leaf-800"
                          >
                            View details <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        ) : null}
                        {!notification.read ? (
                          <button
                            type="button"
                            onClick={() => markRead(notification)}
                            disabled={markingId === notification.id}
                            className="text-xs font-medium text-stone-500 hover:text-stone-800 disabled:opacity-50"
                          >
                            {markingId === notification.id ? 'Marking…' : 'Mark as read'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
