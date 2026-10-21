import { CheckCircle2, CircleDashed, Clock3, PauseCircle, XCircle } from 'lucide-react'
import Badge from '../ui/Badge'

const STATUS = {
  OPEN: { label: 'Open', tone: 'green', icon: Clock3 },
  ACTIVE: { label: 'Active', tone: 'green', icon: CheckCircle2 },
  FULFILLED: { label: 'Fulfilled', tone: 'blue', icon: CheckCircle2 },
  INACTIVE: { label: 'Inactive', tone: 'neutral', icon: PauseCircle },
  SOLD: { label: 'Sold', tone: 'amber', icon: CircleDashed },
  CANCELLED: { label: 'Cancelled', tone: 'red', icon: XCircle },
  EXPIRED: { label: 'Expired', tone: 'neutral', icon: XCircle },
}

export default function StatusBadge({ status }) {
  const config = STATUS[status] || { label: status, tone: 'neutral', icon: CircleDashed }
  const Icon = config.icon
  return (
    <Badge tone={config.tone}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {config.label}
    </Badge>
  )
}
