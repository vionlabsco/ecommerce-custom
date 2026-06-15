import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getOrder } from '@/lib/admin/store'
import { fulfillOrderAction, markPaidAction, cancelOrderAction } from '@/lib/admin/actions'
import { formatPrice } from '@/lib/format'
import { formatDate, formatDateTime } from '@/lib/admin/format'
import { PaymentBadge, FulfilmentBadge, Badge } from '@/components/admin/StatusBadge'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const o = await getOrder(params.id)
  return { title: o ? o.number : 'Order' }
}

const CARRIERS = ['UPS', 'USPS', 'FedEx', 'DHL']
const cardClass = 'rounded-xl border border-line bg-white'
const labelClass = 'mb-1.5 block text-[12px] uppercase tracking-[0.1em] text-ink-soft'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id)
  if (!order) notFound()

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="text-[13px] text-ink-soft hover:text-clay">
        ← All orders
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">{order.number}</h1>
        {order.cancelled ? <Badge tone="red">cancelled</Badge> : <PaymentBadge status={order.paymentStatus} />}
        {!order.cancelled && <FulfilmentBadge status={order.fulfillment.status} />}
        <span className="text-sm text-ink-soft">Placed {formatDate(order.placedAt)}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: items, totals, timeline */}
        <div className="space-y-6 lg:col-span-2">
          <section className={cardClass}>
            <h2 className="border-b border-line px-5 py-4 font-display text-lg">Items</h2>
            <div className="divide-y divide-line">
              {order.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="font-medium">{it.name}</p>
                    <p className="text-[13px] text-ink-soft">
                      {it.variant} · qty {it.qty}
                    </p>
                  </div>
                  <span className="tabular-nums">{formatPrice(it.priceCents * it.qty)}</span>
                </div>
              ))}
            </div>
            <dl className="space-y-2 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(order.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd className="tabular-nums">
                  {order.shippingCents === 0 ? 'Free' : formatPrice(order.shippingCents)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Tax</dt>
                <dd className="tabular-nums">{formatPrice(order.taxCents)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-display text-lg">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(order.totalCents)}</dd>
              </div>
            </dl>
          </section>

          <section className={cardClass}>
            <h2 className="border-b border-line px-5 py-4 font-display text-lg">Timeline</h2>
            <ol className="space-y-4 px-5 py-5">
              {[...order.timeline].reverse().map((e, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-clay" />
                  <div>
                    <p className="text-sm">{e.label}</p>
                    <p className="text-[12px] text-ink-soft">{formatDateTime(e.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Right: customer, shipping, actions */}
        <div className="space-y-6">
          <section className={`${cardClass} p-5`}>
            <h2 className="font-display text-lg">Customer</h2>
            <p className="mt-3 font-medium">{order.customer.name}</p>
            <p className="text-[13px] text-ink-soft">{order.customer.email}</p>
            <h3 className="mt-5 text-[12px] uppercase tracking-[0.1em] text-ink-soft">Ship to</h3>
            <address className="mt-1 text-sm not-italic leading-relaxed">
              {order.shippingAddress.line1}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.region} {order.shippingAddress.postal}
              <br />
              {order.shippingAddress.country}
            </address>
          </section>

          <section className={`${cardClass} p-5`}>
            <h2 className="font-display text-lg">Actions</h2>

            {order.cancelled ? (
              <p className="mt-3 text-sm text-ink-soft">
                This order was cancelled and refunded. No further actions.
              </p>
            ) : (
              <div className="mt-4 space-y-5">
                {order.paymentStatus === 'pending' && (
                  <form action={markPaidAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button className="w-full rounded-lg bg-ink px-4 py-2.5 text-[13px] font-medium text-paper transition-colors hover:bg-clay">
                      Mark as paid
                    </button>
                    <p className="mt-1.5 text-[12px] text-ink-soft">Payment is still pending.</p>
                  </form>
                )}

                {order.fulfillment.status === 'unfulfilled' ? (
                  <form action={fulfillOrderAction} className="space-y-3">
                    <input type="hidden" name="orderId" value={order.id} />
                    <div>
                      <label className={labelClass} htmlFor="carrier">Carrier</label>
                      <select
                        id="carrier"
                        name="carrier"
                        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none"
                      >
                        {CARRIERS.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="tracking">Tracking number</label>
                      <input
                        id="tracking"
                        name="tracking"
                        placeholder="e.g. 1Z999AA10123456784"
                        className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink focus:outline-none"
                      />
                    </div>
                    <button className="w-full rounded-lg bg-ink px-4 py-2.5 text-[13px] font-medium text-paper transition-colors hover:bg-clay">
                      Mark as fulfilled
                    </button>
                  </form>
                ) : (
                  <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-inset ring-emerald-600/15">
                    <p className="font-medium">Fulfilled via {order.fulfillment.carrier}</p>
                    {order.fulfillment.tracking && (
                      <p className="mt-0.5 break-all text-[13px]">
                        Tracking: {order.fulfillment.tracking}
                      </p>
                    )}
                  </div>
                )}

                <form action={cancelOrderAction} className="border-t border-line pt-4">
                  <input type="hidden" name="orderId" value={order.id} />
                  <button className="w-full rounded-lg border border-rose-200 px-4 py-2.5 text-[13px] font-medium text-rose-700 transition-colors hover:bg-rose-50">
                    Cancel &amp; refund
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
