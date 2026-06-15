import type { Metadata } from 'next'
import { getCustomers } from '@/lib/admin/store'
import { formatPrice } from '@/lib/format'
import { formatDate } from '@/lib/admin/format'

export const metadata: Metadata = { title: 'Customers' }

export default function CustomersPage() {
  const customers = getCustomers()

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Customers</h1>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-[1.6fr_1.2fr_0.7fr_0.9fr_0.9fr] gap-4 border-b border-line px-5 py-3 text-[11px] uppercase tracking-[0.1em] text-ink-soft">
              <span>Customer</span>
              <span>Location</span>
              <span className="text-right">Orders</span>
              <span className="text-right">Spent</span>
              <span className="text-right">Since</span>
            </div>
            <div className="divide-y divide-line">
              {customers.map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-[1.6fr_1.2fr_0.7fr_0.9fr_0.9fr] items-center gap-4 px-5 py-3.5 text-sm"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{c.name}</span>
                    <span className="block truncate text-[12px] text-ink-soft">{c.email}</span>
                  </span>
                  <span className="text-ink-soft">{c.location}</span>
                  <span className="text-right tabular-nums">{c.ordersCount}</span>
                  <span className="text-right font-medium tabular-nums">{formatPrice(c.totalSpentCents)}</span>
                  <span className="text-right text-ink-soft">{formatDate(c.since)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
