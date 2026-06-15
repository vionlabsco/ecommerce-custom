import Link from 'next/link'
import type { Metadata } from 'next'
import { getOrders, type Order } from '@/lib/admin/store'
import { formatPrice } from '@/lib/format'
import { formatDate } from '@/lib/admin/format'
import { PaymentBadge, FulfilmentBadge, Badge } from '@/components/admin/StatusBadge'
import { cn } from '@/lib/cn'

export const metadata: Metadata = { title: 'Orders' }

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'unfulfilled', label: 'Unfulfilled' },
  { key: 'fulfilled', label: 'Fulfilled' },
  { key: 'cancelled', label: 'Cancelled' },
] as const

function matches(o: Order, key: string): boolean {
  switch (key) {
    case 'cancelled':
      return o.cancelled
    case 'pending':
      return !o.cancelled && o.paymentStatus === 'pending'
    case 'unfulfilled':
      return !o.cancelled && o.paymentStatus === 'paid' && o.fulfillment.status === 'unfulfilled'
    case 'fulfilled':
      return !o.cancelled && o.fulfillment.status === 'fulfilled'
    default:
      return true
  }
}

export default async function OrdersPage({ searchParams }: { searchParams: { status?: string } }) {
  const active = FILTERS.some((f) => f.key === searchParams.status) ? searchParams.status! : 'all'
  const orders = (await getOrders()).filter((o) => matches(o, active))

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Orders</h1>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'all' ? '/admin/orders' : `/admin/orders?status=${f.key}`}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-[13px] transition-colors',
              active === f.key
                ? 'border-ink bg-ink text-paper'
                : 'border-line bg-white text-ink-soft hover:border-ink hover:text-ink',
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[1.1fr_1.3fr_1fr_0.8fr_1fr_1fr] gap-4 border-b border-line px-5 py-3 text-[11px] uppercase tracking-[0.1em] text-ink-soft">
              <span>Order</span>
              <span>Customer</span>
              <span>Date</span>
              <span className="text-right">Total</span>
              <span>Payment</span>
              <span>Fulfilment</span>
            </div>
            <div className="divide-y divide-line">
              {orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="grid grid-cols-[1.1fr_1.3fr_1fr_0.8fr_1fr_1fr] items-center gap-4 px-5 py-3.5 text-sm transition-colors hover:bg-paper/50"
                >
                  <span className="font-medium">{o.number}</span>
                  <span className="min-w-0">
                    <span className="block truncate">{o.customer.name}</span>
                    <span className="block truncate text-[12px] text-ink-soft">
                      {o.items.length} item{o.items.length > 1 ? 's' : ''}
                    </span>
                  </span>
                  <span className="text-ink-soft">{formatDate(o.placedAt)}</span>
                  <span className="text-right font-medium tabular-nums">{formatPrice(o.totalCents)}</span>
                  <span>
                    {o.cancelled ? <Badge tone="red">cancelled</Badge> : <PaymentBadge status={o.paymentStatus} />}
                  </span>
                  <span>
                    {o.cancelled ? (
                      <span className="text-[13px] text-ink-soft">—</span>
                    ) : (
                      <FulfilmentBadge status={o.fulfillment.status} />
                    )}
                  </span>
                </Link>
              ))}
              {orders.length === 0 && (
                <p className="px-5 py-10 text-center text-sm text-ink-soft">No orders in this view.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
