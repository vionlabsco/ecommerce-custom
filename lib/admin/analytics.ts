// ──────────────────────────────────────────────────────────────────────────
// Analytics helpers — pure functions that take the order list and compute
// the numbers shown on /admin/analytics. Date-range presets, summaries,
// daily series, and top-product aggregations.
// ──────────────────────────────────────────────────────────────────────────

import type { Order } from './store'

export type RangePreset = 'today' | '7d' | '30d' | '90d' | 'ytd' | 'all'

export const RANGE_OPTIONS: { value: RangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'ytd', label: 'Year to date' },
  { value: 'all', label: 'All time' },
]

export const DEFAULT_RANGE: RangePreset = '30d'

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** Resolve a preset into concrete start/end Date objects. */
export function resolveRange(preset: RangePreset): { from: Date; to: Date } {
  const now = new Date()
  const today = startOfDay(now)
  switch (preset) {
    case 'today':
      return { from: today, to: now }
    case '7d': {
      const from = new Date(today)
      from.setDate(today.getDate() - 6)
      return { from, to: now }
    }
    case '30d': {
      const from = new Date(today)
      from.setDate(today.getDate() - 29)
      return { from, to: now }
    }
    case '90d': {
      const from = new Date(today)
      from.setDate(today.getDate() - 89)
      return { from, to: now }
    }
    case 'ytd':
      return { from: new Date(now.getFullYear(), 0, 1), to: now }
    case 'all':
    default:
      return { from: new Date(0), to: now }
  }
}

export function filterOrdersByRange(orders: Order[], from: Date, to: Date): Order[] {
  const start = from.getTime()
  const end = to.getTime()
  return orders.filter((o) => {
    const t = new Date(o.placedAt).getTime()
    return t >= start && t <= end
  })
}

export type DailyPoint = { date: string; label: string; revenue: number; orders: number }

/** Build a complete daily series for the range — fills in empty days with 0s
 *  so the chart looks continuous. Caps at 90 days for readability. */
function fillDailySeries(from: Date, to: Date): Map<string, DailyPoint> {
  const out = new Map<string, DailyPoint>()
  const cursor = startOfDay(from)
  const end = startOfDay(to)
  while (cursor <= end) {
    const iso = cursor.toISOString().slice(0, 10)
    const label = cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    out.set(iso, { date: iso, label, revenue: 0, orders: 0 })
    cursor.setDate(cursor.getDate() + 1)
  }
  return out
}

export type TopProduct = { name: string; revenueCents: number; units: number }

export type AnalyticsSummary = {
  revenueCents: number
  orderCount: number
  paidCount: number
  aovCents: number
  daily: DailyPoint[]
  topProducts: TopProduct[]
}

/** Compute every number the analytics dashboard renders. */
export function summarize(
  orders: Order[],
  from: Date,
  to: Date,
): AnalyticsSummary {
  const paid = orders.filter((o) => o.paymentStatus === 'paid' && !o.cancelled)
  const revenueCents = paid.reduce((s, o) => s + o.totalCents, 0)
  const aovCents = paid.length ? Math.round(revenueCents / paid.length) : 0

  // Daily series — start with a fully-populated map, then layer order data on top.
  const series = fillDailySeries(from, to)
  for (const o of orders) {
    const iso = o.placedAt.slice(0, 10)
    const point = series.get(iso)
    if (!point) continue // out of range (shouldn't happen, we filtered already)
    point.orders += 1
    if (o.paymentStatus === 'paid' && !o.cancelled) {
      point.revenue += o.totalCents
    }
  }

  // Top products — aggregate line items from PAID orders.
  const productAgg = new Map<string, TopProduct>()
  for (const o of paid) {
    for (const item of o.items) {
      const key = item.name
      const acc = productAgg.get(key) ?? { name: item.name, revenueCents: 0, units: 0 }
      acc.units += item.qty
      acc.revenueCents += item.priceCents * item.qty
      productAgg.set(key, acc)
    }
  }
  const topProducts = Array.from(productAgg.values())
    .sort((a, b) => b.revenueCents - a.revenueCents)
    .slice(0, 10)

  return {
    revenueCents,
    orderCount: orders.length,
    paidCount: paid.length,
    aovCents,
    daily: Array.from(series.values()),
    topProducts,
  }
}
