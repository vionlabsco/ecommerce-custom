import { cn } from '@/lib/cn'
import type { PaymentStatus, FulfillmentStatus, TicketStatus } from '@/lib/admin/store'

type Tone = 'green' | 'amber' | 'red' | 'slate' | 'blue'

const TONES: Record<Tone, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  blue: 'bg-sky-50 text-sky-700 ring-sky-600/20',
}

export function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset',
        TONES[tone],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  )
}

const PAYMENT_TONE: Record<PaymentStatus, Tone> = { paid: 'green', pending: 'amber', refunded: 'red' }
const FULFILMENT_TONE: Record<FulfillmentStatus, Tone> = { fulfilled: 'green', unfulfilled: 'amber' }
const TICKET_TONE: Record<TicketStatus, Tone> = { open: 'amber', pending: 'blue', closed: 'slate' }

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return <Badge tone={PAYMENT_TONE[status]}>{status}</Badge>
}
export function FulfilmentBadge({ status }: { status: FulfillmentStatus }) {
  return <Badge tone={FULFILMENT_TONE[status]}>{status}</Badge>
}
export function TicketBadge({ status }: { status: TicketStatus }) {
  return <Badge tone={TICKET_TONE[status]}>{status}</Badge>
}
