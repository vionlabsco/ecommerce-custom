import type { Metadata } from 'next'
import { getCustomers } from '@/lib/admin/store'
import { formatPrice } from '@/lib/format'
import { formatDate } from '@/lib/admin/format'
import { PageHeader } from '@/components/admin/PageHeader'

export const metadata: Metadata = { title: 'Customers' }

export default function CustomersPage() {
  const customers = getCustomers()

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} ${customers.length === 1 ? 'customer' : 'customers'}`}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {customers.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500">No customers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[1.6fr_1.2fr_0.7fr_0.9fr_0.9fr] gap-4 border-b border-gray-200 bg-gray-50 px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                <span>Customer</span>
                <span>Location</span>
                <span className="text-right">Orders</span>
                <span className="text-right">Spent</span>
                <span className="text-right">Since</span>
              </div>
              <div className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-[1.6fr_1.2fr_0.7fr_0.9fr_0.9fr] items-center gap-4 px-5 py-3 text-sm hover:bg-gray-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-gray-900">{c.name}</span>
                      <span className="block truncate text-[12px] text-gray-500">{c.email}</span>
                    </span>
                    <span className="text-gray-600">{c.location}</span>
                    <span className="text-right tabular-nums text-gray-700">{c.ordersCount}</span>
                    <span className="text-right font-medium tabular-nums text-gray-900">
                      {formatPrice(c.totalSpentCents)}
                    </span>
                    <span className="text-right text-gray-500">{formatDate(c.since)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
