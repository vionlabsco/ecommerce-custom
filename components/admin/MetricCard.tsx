import { cn } from '@/lib/cn'

type Trend = { direction: 'up' | 'down' | 'flat'; value: string }

/**
 * Polaris-style metric card. White surface, hairline border, small label,
 * big value, optional sub-line and trend indicator.
 */
export function MetricCard({
  label,
  value,
  sub,
  trend,
  accent,
}: {
  label: string
  value: string
  sub?: string
  trend?: Trend
  accent?: boolean
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <p className="text-[12px] font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <p
          className={cn(
            'font-display text-3xl font-bold tabular-nums',
            accent ? 'text-emerald-700' : 'text-gray-900',
          )}
        >
          {value}
        </p>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium',
              trend.direction === 'up' && 'bg-emerald-50 text-emerald-700',
              trend.direction === 'down' && 'bg-rose-50 text-rose-700',
              trend.direction === 'flat' && 'bg-gray-100 text-gray-600',
            )}
          >
            {trend.direction === 'up' && '▲'}
            {trend.direction === 'down' && '▼'}
            {trend.direction === 'flat' && '—'}
            {trend.value}
          </span>
        )}
      </div>
      {sub && <p className="mt-1 text-[13px] text-gray-500">{sub}</p>}
    </div>
  )
}
