import Link from 'next/link'
import type { Metadata } from 'next'
import { getTickets, type Ticket } from '@/lib/admin/store'
import { formatDate } from '@/lib/admin/format'
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
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Support</h1>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key === 'all' ? '/admin/support' : `/admin/support?status=${f.key}`}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-[13px] transition-colors',
              active === f.key
                ? 'border-ink bg-ink text-paper'
                : 'border-line bg-white text-ink-soft hover:border-ink hover:text-ink',
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-line bg-white">
        <div className="divide-y divide-line">
          {tickets.map((t) => {
            const last = t.messages[t.messages.length - 1]
            return (
              <Link
                key={t.id}
                href={`/admin/support/${t.id}`}
                className="block px-5 py-4 transition-colors hover:bg-paper/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-medium">{t.subject}</p>
                  <TicketBadge status={t.status} />
                </div>
                <p className="mt-1 truncate text-[13px] text-ink-soft">
                  {t.customer.name}
                  {t.orderNumber ? ` · ${t.orderNumber}` : ''} · {formatDate(t.createdAt)}
                </p>
                {last && (
                  <p className="mt-1.5 truncate text-[13px] text-ink-soft">
                    <span className="text-ink">{last.from === 'store' ? 'You: ' : ''}</span>
                    {last.body}
                  </p>
                )}
              </Link>
            )
          })}
          {tickets.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-ink-soft">No tickets in this view.</p>
          )}
        </div>
      </div>
    </div>
  )
}
