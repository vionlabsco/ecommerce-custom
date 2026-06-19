import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { getOrderByNumber } from '@/lib/admin/store'
import { buildTracking } from '@/lib/tracking'
import { formatPrice } from '@/lib/format'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { number: string }
}): Promise<Metadata> {
  return { title: `Order ${params.number}` }
}

export default async function OrderDetailPage({
  params,
}: {
  params: { number: string }
}) {
  const email = headers().get('x-customer-email')
  const order = await getOrderByNumber(decodeURIComponent(params.number))

  // Defence in depth — the middleware gates /account/* behind auth, but we
  // also check the email here so signed-in customer A can't view signed-in
  // customer B's orders by guessing an order number.
  if (!order) notFound()
  if (!email || order.customer.email.toLowerCase() !== email.toLowerCase()) {
    notFound()
  }

  const tracking =
    order.fulfillment.status === 'fulfilled'
      ? buildTracking(order.fulfillment.carrier, order.fulfillment.tracking)
      : null

  const addr = order.shippingAddress

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 md:px-8 md:py-16">
      <Link
        href="/account"
        className="text-[11px] font-medium uppercase tracking-widest2 text-ink-soft hover:text-accent"
      >
        ← All orders
      </Link>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-accent">Order</p>
          <h1 className="mt-2 font-mono text-2xl font-bold text-ink md:text-3xl">
            {order.number}
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Placed {new Date(order.placedAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
          </p>
        </div>
      </header>

      {tracking && (
        <div className="mt-6 rounded-xl border border-accent/30 bg-accent-soft p-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
            Tracking
          </p>
          <p className="mt-2 text-sm text-ink-soft">{tracking.carrierLabel}</p>
          <p className="mt-0.5 font-mono text-[13px] text-ink">{tracking.trackingNumber}</p>
          {tracking.url && (
            <a
              href={tracking.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-accent-hover"
            >
              Track your package →
            </a>
          )}
        </div>
      )}

      <section className="mt-8 overflow-hidden rounded-xl border border-line bg-paper">
        <p className="border-b border-line bg-surface px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-widest2 text-ink-soft">
          Items
        </p>
        <ul className="divide-y divide-line">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-start justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-ink">{item.name}</p>
                <p className="mt-0.5 text-[12.5px] uppercase tracking-widest2 text-ink-soft">
                  {item.variant} · Qty {item.qty}
                </p>
              </div>
              <p className="shrink-0 text-sm font-medium tabular-nums text-ink">
                {formatPrice(item.priceCents * item.qty)}
              </p>
            </li>
          ))}
        </ul>

        <dl className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">Subtotal</dt>
            <dd className="text-ink">{formatPrice(order.subtotalCents)}</dd>
          </div>
          {order.discountCents > 0 && (
            <div className="flex justify-between">
              <dt className="text-ink-soft">Discount{order.discountCode ? ` · ${order.discountCode}` : ''}</dt>
              <dd className="text-accent">−{formatPrice(order.discountCents)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink-soft">Shipping</dt>
            <dd className="text-ink">
              {order.shippingCents === 0 ? 'Free' : formatPrice(order.shippingCents)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-soft">Tax</dt>
            <dd className="text-ink">{formatPrice(order.taxCents)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2.5 font-display text-base">
            <dt className="font-bold text-ink">Total</dt>
            <dd className="font-bold text-ink">{formatPrice(order.totalCents)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-line bg-paper px-5 py-4">
        <p className="text-[10.5px] font-semibold uppercase tracking-widest2 text-ink-soft">
          Shipping address
        </p>
        <div className="mt-2 text-sm text-ink leading-relaxed">
          {order.customer.name}<br />
          {addr.line1}<br />
          {addr.city}, {addr.region} {addr.postal}<br />
          {addr.country}
        </div>
      </section>

      <p className="mt-8 text-center text-[12px] text-ink-mute">
        Questions about this order?{' '}
        <Link href="/pages/contact" className="text-accent hover:underline">
          Get in touch
        </Link>
      </p>
    </div>
  )
}
