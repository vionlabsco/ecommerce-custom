import Link from 'next/link'
import { getDashboardStats, getOrders, getTickets } from '@/lib/admin/store'
import { formatPrice } from '@/lib/format'
import { formatDate } from '@/lib/admin/format'
import { site } from '@/lib/site'
import { MetricCard } from '@/components/admin/MetricCard'
import { PaymentBadge, FulfilmentBadge, TicketBadge } from '@/components/admin/StatusBadge'

export default async function AdminDashboard() {
  const stats = await getDashboardStats()
  const recent = (await getOrders()).slice(0, 6)
  const openTickets = getTickets().filter((t) => t.status !== 'closed').slice(0, 4)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-soft">A snapshot of {site.brand} today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Revenue" value={formatPrice(stats.revenueCents)} sub="paid orders" accent />
        <MetricCard label="Orders" value={String(stats.orderCount)} sub="lifetime (demo)" />
        <MetricCard label="Awaiting fulfilment" value={String(stats.awaitingFulfilment)} sub="paid, not shipped" />
        <MetricCard label="Open tickets" value={String(stats.openTickets)} sub="need a reply" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <section className="overflow-hidden rounded-xl border border-line bg-white lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-lg">Recent orders</h2>
            <Link href="/admin/orders" className="text-[13px] text-ink-soft hover:text-clay">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-line">
            {recent.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-paper/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{o.number}</p>
                  <p className="truncate text-[13px] text-ink-soft">
                    {o.customer.name} · {formatDate(o.placedAt)}
                  </p>
                </div>
                <span className="hidden sm:block">
                  {o.cancelled ? (
                    <PaymentBadge status="refunded" />
                  ) : (
                    <FulfilmentBadge status={o.fulfillment.status} />
                  )}
                </span>
                <span className="w-20 text-right font-medium tabular-nums">
                  {formatPrice(o.totalCents)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Open tickets */}
        <section className="overflow-hidden rounded-xl border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-lg">Needs a reply</h2>
            <Link href="/admin/support" className="text-[13px] text-ink-soft hover:text-clay">
              Inbox →
            </Link>
          </div>
          <div className="divide-y divide-line">
            {openTickets.length === 0 && (
              <p className="px-5 py-6 text-sm text-ink-soft">All caught up ✦</p>
            )}
            {openTickets.map((t) => (
              <Link
                key={t.id}
                href={`/admin/support/${t.id}`}
                className="block px-5 py-3.5 transition-colors hover:bg-paper/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{t.subject}</p>
                  <TicketBadge status={t.status} />
                </div>
                <p className="mt-0.5 truncate text-[13px] text-ink-soft">
                  {t.customer.name}
                  {t.orderNumber ? ` · ${t.orderNumber}` : ''}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
