import Link from 'next/link'
import { getDashboardStats, getOrders, getTickets } from '@/lib/admin/store'
import { formatPrice } from '@/lib/format'
import { formatDate } from '@/lib/admin/format'
import { site } from '@/lib/site'
import { PageHeader } from '@/components/admin/PageHeader'
import { MetricCard } from '@/components/admin/MetricCard'
import { PaymentBadge, FulfilmentBadge, TicketBadge } from '@/components/admin/StatusBadge'

export default async function AdminDashboard() {
  const [stats, orders, allTickets] = await Promise.all([
    getDashboardStats(),
    getOrders(),
    getTickets(),
  ])
  const recent = orders.slice(0, 6)
  const openTickets = allTickets.filter((t) => t.status !== 'closed').slice(0, 4)

  // Simple AOV from the orders we have (placeholder until real analytics ship).
  const paid = orders.filter((o) => o.paymentStatus === 'paid')
  const aov = paid.length
    ? Math.round(paid.reduce((s, o) => s + o.totalCents, 0) / paid.length)
    : 0

  return (
    <>
      <PageHeader
        title="Home"
        subtitle={`A snapshot of ${site.brand} today.`}
        action={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-700 px-3.5 py-2 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-emerald-800"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add product
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Revenue"
          value={formatPrice(stats.revenueCents)}
          sub="Paid orders, lifetime"
          accent
        />
        <MetricCard
          label="Orders"
          value={String(stats.orderCount)}
          sub="Active orders"
        />
        <MetricCard
          label="Avg. order value"
          value={formatPrice(aov)}
          sub={`Across ${paid.length} paid orders`}
        />
        <MetricCard
          label="Awaiting fulfilment"
          value={String(stats.awaitingFulfilment)}
          sub="Paid, not yet shipped"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent orders */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
            <div>
              <h2 className="font-display text-base font-bold text-gray-900">Recent orders</h2>
              <p className="text-[12px] text-gray-500">Latest activity from your store</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-[13px] font-medium text-emerald-700 hover:text-emerald-800"
            >
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-500">
              No orders yet — they&apos;ll show up here.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recent.map((o) => (
                <Link
                  key={o.id}
                  href={`/admin/orders/${o.id}`}
                  className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{o.number}</p>
                    <p className="truncate text-[13px] text-gray-500">
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
                  <span className="w-20 text-right font-medium tabular-nums text-gray-900">
                    {formatPrice(o.totalCents)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Needs a reply */}
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
            <h2 className="font-display text-base font-bold text-gray-900">Needs a reply</h2>
            <Link
              href="/admin/support"
              className="text-[13px] font-medium text-emerald-700 hover:text-emerald-800"
            >
              Inbox →
            </Link>
          </div>
          {openTickets.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-500">All caught up ●</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {openTickets.map((t) => (
                <Link
                  key={t.id}
                  href={`/admin/support/${t.id}`}
                  className="block px-5 py-3 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-gray-900">{t.subject}</p>
                    <TicketBadge status={t.status} />
                  </div>
                  <p className="mt-0.5 truncate text-[13px] text-gray-500">
                    {t.customer.name}
                    {t.orderNumber ? ` · ${t.orderNumber}` : ''}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Quick links / hint card */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900">Getting set up</p>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Charts, tracking pixels, discounts and full settings are landing in Phase 2 / 3.
              For now, products, orders, customers and support are fully wired.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
