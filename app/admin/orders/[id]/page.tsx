import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getOrder } from '@/lib/admin/store'
import { fulfillOrderAction, markPaidAction, cancelOrderAction } from '@/lib/admin/actions'
import { BuyLabelButton } from '@/components/admin/BuyLabelButton'
import { formatPrice } from '@/lib/format'
import { formatDate, formatDateTime } from '@/lib/admin/format'
import { PageHeader } from '@/components/admin/PageHeader'
import { PaymentBadge, FulfilmentBadge, Badge } from '@/components/admin/StatusBadge'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const o = await getOrder(params.id)
  return { title: o ? o.number : 'Order' }
}

const CARRIERS = ['UPS', 'USPS', 'FedEx', 'DHL']
const card = 'rounded-xl border border-gray-200 bg-white shadow-sm'
const label = 'mb-1.5 block text-[13px] font-medium text-gray-700'
const input =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100'

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id)
  if (!order) notFound()

  return (
    <>
      <PageHeader
        title={order.number}
        subtitle={`Placed ${formatDate(order.placedAt)}`}
        crumbs={[
          { label: 'Orders', href: '/admin/orders' },
          { label: order.number },
        ]}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {order.cancelled ? (
              <Badge tone="red">cancelled</Badge>
            ) : (
              <PaymentBadge status={order.paymentStatus} />
            )}
            {!order.cancelled && <FulfilmentBadge status={order.fulfillment.status} />}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: items, totals, timeline */}
        <div className="space-y-6 lg:col-span-2">
          <section className={card}>
            <h2 className="border-b border-gray-200 px-5 py-3.5 font-display text-base font-bold text-gray-900">
              Items
            </h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{it.name}</p>
                    <p className="text-[13px] text-gray-500">
                      {it.variant} · qty {it.qty}
                    </p>
                  </div>
                  <span className="tabular-nums text-gray-900">
                    {formatPrice(it.priceCents * it.qty)}
                  </span>
                </div>
              ))}
            </div>
            <dl className="space-y-2 border-t border-gray-200 px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Subtotal</dt>
                <dd className="tabular-nums text-gray-900">{formatPrice(order.subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Shipping</dt>
                <dd className="tabular-nums text-gray-900">
                  {order.shippingCents === 0 ? 'Free' : formatPrice(order.shippingCents)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Tax</dt>
                <dd className="tabular-nums text-gray-900">{formatPrice(order.taxCents)}</dd>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-display text-lg font-bold text-gray-900">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatPrice(order.totalCents)}</dd>
              </div>
            </dl>
          </section>

          <section className={card}>
            <h2 className="border-b border-gray-200 px-5 py-3.5 font-display text-base font-bold text-gray-900">
              Timeline
            </h2>
            <ol className="space-y-4 px-5 py-5">
              {[...order.timeline].reverse().map((e, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                  <div>
                    <p className="text-sm text-gray-900">{e.label}</p>
                    <p className="text-[12px] text-gray-500">{formatDateTime(e.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Right: customer, shipping, actions */}
        <div className="space-y-6">
          <section className={`${card} p-5`}>
            <h2 className="font-display text-base font-bold text-gray-900">Customer</h2>
            <p className="mt-3 font-medium text-gray-900">{order.customer.name}</p>
            <p className="text-[13px] text-gray-500">{order.customer.email}</p>
            <h3 className="mt-5 text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Ship to
            </h3>
            <address className="mt-1 text-sm not-italic leading-relaxed text-gray-700">
              {order.shippingAddress.line1}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.region}{' '}
              {order.shippingAddress.postal}
              <br />
              {order.shippingAddress.country}
            </address>
          </section>

          <section className={`${card} p-5`}>
            <h2 className="font-display text-base font-bold text-gray-900">Actions</h2>

            {order.cancelled ? (
              <p className="mt-3 text-sm text-gray-500">
                This order was cancelled and refunded. No further actions.
              </p>
            ) : (
              <div className="mt-4 space-y-5">
                {order.paymentStatus === 'pending' && (
                  <form action={markPaidAction}>
                    <input type="hidden" name="orderId" value={order.id} />
                    <button className="w-full rounded-md bg-emerald-700 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-emerald-800">
                      Mark as paid
                    </button>
                    <p className="mt-1.5 text-[12px] text-gray-500">Payment is still pending.</p>
                  </form>
                )}

                {order.fulfillment.status === 'unfulfilled' ? (
                  <div className="space-y-4">
                    <BuyLabelButton
                      orderNumber={order.number}
                      destinationCountry={order.shippingAddress.country || 'CA'}
                    />

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center" aria-hidden>
                        <div className="w-full border-t border-gray-200" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                          or enter tracking manually
                        </span>
                      </div>
                    </div>

                    <form action={fulfillOrderAction} className="space-y-3">
                      <input type="hidden" name="orderId" value={order.id} />
                      <div>
                        <label className={label} htmlFor="carrier">Carrier</label>
                        <select id="carrier" name="carrier" className={input}>
                          {CARRIERS.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={label} htmlFor="tracking">Tracking number</label>
                        <input
                          id="tracking"
                          name="tracking"
                          placeholder="e.g. 1Z999AA10123456784"
                          className={input}
                        />
                      </div>
                      <button className="w-full rounded-md bg-emerald-700 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-emerald-800">
                        Mark as fulfilled
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800 ring-1 ring-inset ring-emerald-600/15">
                    <p className="font-medium">Fulfilled via {order.fulfillment.carrier}</p>
                    {order.fulfillment.tracking && (
                      <p className="mt-0.5 break-all text-[13px]">
                        Tracking: {order.fulfillment.tracking}
                      </p>
                    )}
                  </div>
                )}

                <form action={cancelOrderAction} className="border-t border-gray-200 pt-4">
                  <input type="hidden" name="orderId" value={order.id} />
                  <button className="w-full rounded-md border border-rose-200 bg-white px-4 py-2 text-[13px] font-medium text-rose-700 transition-colors hover:bg-rose-50">
                    Cancel &amp; refund
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
