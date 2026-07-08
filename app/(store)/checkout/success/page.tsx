import Link from 'next/link'
import type { Metadata } from 'next'
import { formatPrice } from '@/lib/format'
import { getOrderByNumber } from '@/lib/admin/store'
import { buildTracking } from '@/lib/tracking'

export const metadata: Metadata = { title: 'Order confirmed' }

// Customers reach this page right after checkout, AND later by clicking the
// link in their order email — so we have to handle both "just-placed,
// nothing tracked yet" and "shipped, tracking is live" states.
const STEPS_UNFULFILLED = [
  { t: 'Confirmation email', s: 'A receipt is on its way to your inbox.' },
  { t: 'Packed with care', s: 'Your order is hand-packed within 1–2 business days.' },
  { t: 'On its way', s: "We'll email tracking the moment it ships." },
]

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { order?: string; total?: string }
}) {
  const orderNumber = searchParams.order ?? ''
  const totalCents = Number(searchParams.total)
  const hasTotal = Number.isFinite(totalCents) && totalCents > 0

  // Lookup is best-effort — if the order can't be found (demo mode, stale
  // link, typo) we still render the basic confirmation. Tracking just won't
  // appear until we successfully find the order.
  const order = orderNumber ? await getOrderByNumber(orderNumber).catch(() => undefined) : undefined
  const tracking =
    order?.fulfillment?.status === 'fulfilled'
      ? buildTracking(order.fulfillment.carrier, order.fulfillment.tracking)
      : null

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center md:py-32">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12.5l4.2 4.2L19 7"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <p className="mt-7 text-[12px] uppercase tracking-[0.24em] text-accent">
        {tracking ? 'Order shipped' : 'Thank you'}
      </p>
      <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
        {tracking ? 'Your order is on the way' : 'Your order is confirmed'}
      </h1>
      <p className="mt-4 max-w-md leading-relaxed text-ink-soft text-pretty">
        {tracking
          ? `Your order shipped via ${tracking.carrierLabel}. Use the tracking link below for live status.`
          : "We're thrilled you're here. A confirmation is on its way, and your pieces will be packed and shipped shortly."}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 rounded-xl border border-line bg-card px-7 py-4 text-sm">
        <span className="text-ink-soft">
          Order <span className="font-medium text-ink">{orderNumber}</span>
        </span>
        {hasTotal && (
          <span className="text-ink-soft">
            Total <span className="font-medium text-ink">{formatPrice(totalCents)}</span>
          </span>
        )}
      </div>

      {/* Tracking block — only when the order has been marked fulfilled */}
      {tracking && (
        <div className="mt-6 w-full max-w-md rounded-xl border border-accent/30 bg-accent-soft p-5 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
            Tracking
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {tracking.carrierLabel}
          </p>
          <p className="mt-0.5 font-mono text-[13px] text-ink">{tracking.trackingNumber}</p>
          {tracking.url && (
            <a
              href={tracking.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-accent-hover"
            >
              Track your package
              <span aria-hidden>→</span>
            </a>
          )}
        </div>
      )}

      {/* "What happens next" steps — only when not yet shipped */}
      {!tracking && (
        <div className="mt-12 grid w-full gap-4 text-left sm:grid-cols-3">
          {STEPS_UNFULFILLED.map((step, i) => (
            <div key={step.t} className="rounded-lg border border-line bg-card p-5">
              <span className="font-display text-2xl text-accent">{i + 1}</span>
              <p className="mt-2 text-sm font-medium">{step.t}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{step.s}</p>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/shop"
        className="mt-12 inline-block rounded-full bg-accent px-8 py-3.5 text-[13px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-accent-hover"
      >
        Continue shopping
      </Link>
    </div>
  )
}
