import Link from 'next/link'
import type { Metadata } from 'next'
import { getOrders, type Order } from '@/lib/admin/store'
import { formatPrice } from '@/lib/format'
import { formatDate } from '@/lib/admin/format'
import { PageHeader } from '@/components/admin/PageHeader'
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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const active = FILTERS.some((f) => f.key === searchParams.status) ? searchParams.status! : 'all'
  const orders = (await getOrders()).filter((o) => matches(o, active))

  return (
    <>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} ${orders.length === 1 ? 'order' : 'orders'} in this view`}
      />

      {/* Filter pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'all' ? '/admin/orders' : `/admin/orders?status=${f.key}`}
            className={cn(
              'rounded-md border px-3 py-1.5 text-[13px] font-medium transition-colors',
              active === f.key
                ? 'border-emerald-700 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50',
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {orders.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500">No orders in this view.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[820px]">
              <div className="grid grid-cols-[1.1fr_1.3fr_1fr_0.8fr_1fr_1fr] gap-4 border-b border-gray-200 bg-gray-50 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                <span>Order</span>
                <span>Customer</span>
                <span>Date</span>
                <span className="text-right">Total</span>
                <span>Payment</span>
                <span>Fulfilment</span>
              </div>
              <div className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/admin/orders/${o.id}`}
                    className="grid grid-cols-[1.1fr_1.3fr_1fr_0.8fr_1fr_1fr] items-center gap-4 px-5 py-3 text-sm transition-colors hover:bg-gray-50"
                  >
                    <span className="font-medium text-gray-900">{o.number}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-gray-900">{o.customer.name}</span>
                      <span className="block truncate text-[12px] text-gray-500">
                        {o.items.length} item{o.items.length > 1 ? 's' : ''}
                      </span>
                    </span>
                    <span className="text-gray-500">{formatDate(o.placedAt)}</span>
                    <span className="text-right font-medium tabular-nums text-gray-900">
                      {formatPrice(o.totalCents)}
                    </span>
                    <span>
                      {o.cancelled ? (
                        <Badge tone="red">cancelled</Badge>
                      ) : (
                        <PaymentBadge status={o.paymentStatus} />
                      )}
                    </span>
                    <span>
                      {o.cancelled ? (
                        <span className="text-[13px] text-gray-400">—</span>
                      ) : (
                        <FulfilmentBadge status={o.fulfillment.status} />
                      )}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
