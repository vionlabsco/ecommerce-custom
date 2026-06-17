import type { Metadata } from 'next'
import { getOrders } from '@/lib/admin/store'
import {
  DEFAULT_RANGE,
  RANGE_OPTIONS,
  resolveRange,
  filterOrdersByRange,
  summarize,
  type RangePreset,
} from '@/lib/admin/analytics'
import { formatPrice } from '@/lib/format'
import { PageHeader } from '@/components/admin/PageHeader'
import { MetricCard } from '@/components/admin/MetricCard'
import { DateRangePicker } from '@/components/admin/DateRangePicker'
import { SalesChart } from '@/components/admin/SalesChart'

export const metadata: Metadata = { title: 'Analytics' }
export const dynamic = 'force-dynamic'

function isPreset(v: string | undefined): v is RangePreset {
  return !!v && RANGE_OPTIONS.some((p) => p.value === v)
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: { range?: string }
}) {
  const preset: RangePreset = isPreset(searchParams.range) ? searchParams.range : DEFAULT_RANGE
  const { from, to } = resolveRange(preset)

  const allOrders = await getOrders()
  const scopedOrders = filterOrdersByRange(allOrders, from, to)
  const summary = summarize(scopedOrders, from, to)

  const rangeLabel = RANGE_OPTIONS.find((p) => p.value === preset)?.label ?? ''
  const subtitle = `${rangeLabel} · ${from.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} – ${to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  const paidRate =
    summary.orderCount > 0
      ? `${Math.round((summary.paidCount / summary.orderCount) * 100)}%`
      : '—'

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle={subtitle}
        action={<DateRangePicker active={preset} />}
      />

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total sales" value={formatPrice(summary.revenueCents)} sub="Paid orders in range" accent />
        <MetricCard label="Orders" value={String(summary.orderCount)} sub={`${summary.paidCount} paid`} />
        <MetricCard label="Average order value" value={formatPrice(summary.aovCents)} sub={summary.paidCount ? `Across ${summary.paidCount} paid orders` : 'No paid orders yet'} />
        <MetricCard label="Conversion (paid)" value={paidRate} sub="Paid ÷ total orders" />
      </div>

      {/* Sales chart */}
      <section className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
          <div>
            <h2 className="font-display text-base font-bold text-gray-900">Sales over time</h2>
            <p className="text-[12px] text-gray-500">Daily revenue from paid orders</p>
          </div>
        </div>
        <div className="p-5">
          {scopedOrders.length === 0 ? (
            <div className="flex h-72 flex-col items-center justify-center gap-2 text-center">
              <p className="font-medium text-gray-700">No orders in this range</p>
              <p className="text-[13px] text-gray-500">
                Pick a longer range, or wait for orders to come in.
              </p>
            </div>
          ) : (
            <SalesChart data={summary.daily} />
          )}
        </div>
      </section>

      {/* Top products */}
      <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
          <div>
            <h2 className="font-display text-base font-bold text-gray-900">Top products</h2>
            <p className="text-[12px] text-gray-500">Ranked by revenue in the selected range</p>
          </div>
        </div>
        {summary.topProducts.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-500">
            No paid orders to rank yet.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-4 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
              <span>Product</span>
              <span className="text-right">Units</span>
              <span className="text-right">Revenue</span>
            </div>
            {summary.topProducts.map((p, i) => (
              <div
                key={p.name}
                className="grid grid-cols-[2fr_1fr_1fr] items-center gap-4 px-5 py-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-100 text-[11px] font-semibold text-gray-600">
                    {i + 1}
                  </span>
                  <span className="truncate font-medium text-gray-900">{p.name}</span>
                </div>
                <span className="text-right tabular-nums text-gray-700">{p.units}</span>
                <span className="text-right tabular-nums font-medium text-gray-900">
                  {formatPrice(p.revenueCents)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick out-link for deep behavioural data */}
      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M3 3h18v18H3z" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              Heatmaps, session recordings & drop-off analysis
            </p>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Wire Microsoft Clarity / Hotjar / PostHog from <strong>Apps → Integrations</strong> (landing in Phase 3) and open them directly to see behavioural data — no need to rebuild what they already do well.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
