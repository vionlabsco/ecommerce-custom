'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { formatPrice } from '@/lib/format'
import type { DailyPoint } from '@/lib/admin/analytics'

const ACCENT = '#047857' // emerald-700, matches the admin primary

function fmtAxisCurrency(cents: number) {
  if (cents >= 100_000) return `$${Math.round(cents / 100_000)}k`
  return `$${Math.round(cents / 100)}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip(props: any) {
  const { active, payload, label } = props
  if (!active || !payload || payload.length === 0) return null
  const point = payload[0].payload as DailyPoint
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-md">
      <p className="text-[12px] font-medium text-gray-500">{label}</p>
      <p className="mt-0.5 font-display text-[15px] font-bold text-gray-900">
        {formatPrice(point.revenue)}
      </p>
      <p className="text-[11px] text-gray-500">
        {point.orders} {point.orders === 1 ? 'order' : 'orders'}
      </p>
    </div>
  )
}

export function SalesChart({ data }: { data: DailyPoint[] }) {
  // Thin out X-axis labels if there are many points so they don't collide.
  const tickInterval =
    data.length <= 14 ? 0 : data.length <= 31 ? 2 : data.length <= 60 ? 4 : 6

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.28} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            interval={tickInterval}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={fmtAxisCurrency}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: ACCENT, strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={ACCENT}
            strokeWidth={2}
            fill="url(#salesGradient)"
            dot={false}
            activeDot={{ r: 4, fill: ACCENT, stroke: 'white', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
