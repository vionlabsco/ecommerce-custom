import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTicket } from '@/lib/admin/store'
import { replyTicketAction, ticketStatusAction } from '@/lib/admin/actions'
import { formatDateTime } from '@/lib/admin/format'
import { TicketBadge } from '@/components/admin/StatusBadge'
import { cn } from '@/lib/cn'

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const t = getTicket(params.id)
  return { title: t ? t.subject : 'Ticket' }
}

export default function TicketPage({ params }: { params: { id: string } }) {
  const ticket = getTicket(params.id)
  if (!ticket) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/support" className="text-[13px] text-ink-soft hover:text-clay">
        ← Inbox
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl">{ticket.subject}</h1>
            <TicketBadge status={ticket.status} />
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            {ticket.customer.name} · {ticket.customer.email}
            {ticket.orderNumber && (
              <>
                {' · '}
                <Link
                  href="/admin/orders"
                  className="text-ink underline-offset-2 hover:underline"
                >
                  {ticket.orderNumber}
                </Link>
              </>
            )}
          </p>
        </div>
        <form action={ticketStatusAction}>
          <input type="hidden" name="ticketId" value={ticket.id} />
          <input type="hidden" name="status" value={ticket.status === 'closed' ? 'open' : 'closed'} />
          <button className="rounded-lg border border-line bg-white px-4 py-2 text-[13px] font-medium transition-colors hover:border-ink">
            {ticket.status === 'closed' ? 'Reopen ticket' : 'Close ticket'}
          </button>
        </form>
      </div>

      {/* Thread */}
      <div className="space-y-4 rounded-xl border border-line bg-white p-5">
        {ticket.messages.map((m, i) => (
          <div key={i} className={cn('flex', m.from === 'store' && 'justify-end')}>
            <div
              className={cn(
                'max-w-[82%] rounded-2xl px-4 py-2.5',
                m.from === 'store' ? 'bg-ink text-paper' : 'border border-line bg-paper/60',
              )}
            >
              <p className="text-sm leading-relaxed">{m.body}</p>
              <p
                className={cn(
                  'mt-1.5 text-[11px]',
                  m.from === 'store' ? 'text-paper/50' : 'text-ink-soft',
                )}
              >
                {m.from === 'store' ? 'You' : ticket.customer.name} · {formatDateTime(m.at)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Reply */}
      <form action={replyTicketAction} className="rounded-xl border border-line bg-white p-5">
        <input type="hidden" name="ticketId" value={ticket.id} />
        <label htmlFor="body" className="mb-2 block font-display text-lg">
          Reply
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={3}
          placeholder="Write a reply to the customer…"
          className="w-full resize-y rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm focus:border-ink focus:outline-none"
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[12px] text-ink-soft">Sends to {ticket.customer.email} (demo — not actually emailed)</p>
          <button className="rounded-lg bg-ink px-5 py-2.5 text-[13px] font-medium text-paper transition-colors hover:bg-clay">
            Send reply
          </button>
        </div>
      </form>
    </div>
  )
}
