import Link from 'next/link'
import type { Metadata } from 'next'
import { getTickets, type Ticket } from '@/lib/admin/store'
import { formatDate } from '@/lib/admin/format'
import { PageHeader } from '@/components/admin/PageHeader'
import { TicketBadge } from '@/components/admin/StatusBadge'
import { cn } from '@/lib/cn'

export const metadata: Metadata = { title: 'Support' }

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'pending', label: 'Pending' },
  { key: 'closed', label: 'Closed' },
] as const

export default function SupportPage({ searchParams }: { searchParams: { status?: string } }) {
  const active = FILTERS.some((f) => f.key === searchParams.status) ? searchParams.status! : 'all'
  const tickets = getTickets().filter((t: Ticket) => active === 'all' || t.status === active)

  return (
    <>
      <PageHeader
        title="Support"
        subtitle={`${tickets.length} ${tickets.length === 1 ? 'ticket' : 'tickets'} in this view`}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'all' ? '/admin/support' : `/admin/support?status=${f.key}`}
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
        {tickets.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500">No tickets in this view.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {tickets.map((t) => {
              const last = t.messages[t.messages.length - 1]
              return (
                <Link
                  key={t.id}
                  href={`/admin/support/${t.id}`}
                  className="block px-5 py-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-medium text-gray-900">{t.subject}</p>
                    <TicketBadge status={t.status} />
                  </div>
                  <p className="mt-1 truncate text-[13px] text-gray-500">
                    {t.customer.name}
                    {t.orderNumber ? ` · ${t.orderNumber}` : ''} · {formatDate(t.createdAt)}
                  </p>
                  {last && (
                    <p className="mt-1.5 truncate text-[13px] text-gray-500">
                      <span className="text-gray-700">{last.from === 'store' ? 'You: ' : ''}</span>
                      {last.body}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
