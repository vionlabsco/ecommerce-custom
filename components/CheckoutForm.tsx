'use client'

import { useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from './CartProvider'
import { ProductImage } from './ProductImage'
import { formatPrice } from '@/lib/format'
import { site } from '@/lib/site'
import { cn } from '@/lib/cn'
import { placeOrder } from '@/lib/place-order'
// CouponInput exists but isn't shown to customers right now — discount
// codes are wired end-to-end (admin + order pipeline) but not promoted.
// Re-add `<CouponInput compact />` in the summary block when ready.
// import { CouponInput } from './CouponInput'

const EXPRESS_CENTS = 1800
const inputClass =
  'w-full rounded-md border border-line bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/20'
const labelClass = 'mb-1.5 block text-[12px] uppercase tracking-[0.12em] text-ink-soft'

export function CheckoutForm() {
  const router = useRouter()
  const { items, subtotalCents, discountCents, coupon, clear } = useCart()
  const [method, setMethod] = useState<'standard' | 'express'>('standard')
  const [placing, setPlacing] = useState(false)
  // Ref guards against rapid double-submit before React re-renders with the
  // disabled button. Without it, a fast second click could fire a duplicate
  // order before setPlacing(true) takes effect.
  const inFlight = useRef(false)

  // Discount applies to subtotal first; shipping + tax compute on the
  // POST-discount amount so the customer doesn't pay tax on money they
  // didn't actually spend (industry standard for US/CA stores).
  const discountedSubtotal = Math.max(0, subtotalCents - discountCents)
  const standardShip =
    discountedSubtotal >= site.freeShippingThresholdCents ? 0 : site.flatShippingCents
  const shipping = method === 'express' ? EXPRESS_CENTS : standardShip
  const tax = Math.round(discountedSubtotal * site.taxRate)
  const total = discountedSubtotal + shipping + tax

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (items.length === 0) return
    if (inFlight.current) return
    inFlight.current = true
    setPlacing(true)
    // Read the form synchronously before any await (the event is recycled).
    const fd = new FormData(e.currentTarget)
    try {
      // Creates a real order the admin sees. Payment is still simulated here;
      // Stripe Checkout slots in at this call next.
      const res = await placeOrder({
        customer: {
          name: `${fd.get('firstName') ?? ''} ${fd.get('lastName') ?? ''}`.trim(),
          email: String(fd.get('email') ?? ''),
        },
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          variant: `${i.color} · ${i.size}`,
          qty: i.quantity,
          priceCents: i.priceCents,
        })),
        shippingAddress: {
          line1: String(fd.get('address') ?? ''),
          city: String(fd.get('city') ?? ''),
          region: String(fd.get('region') ?? ''),
          postal: String(fd.get('postal') ?? ''),
          country: String(fd.get('country') ?? ''),
        },
        shippingCents: shipping,
        discountCode: coupon?.code ?? null,
        discountCents: discountCents,
      })

      // Hand off to secure checkout to collect payment off-site. The order is
      // already recorded above (and the confirmation email sent), so we pass
      // only the server-computed total + billing for prefill.
      const mres = await fetch('/api/maef/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: res.number,
          totalCents: res.totalCents,
          shippingLabel: method === 'express' ? 'Express' : 'Standard',
          billing: {
            first_name: String(fd.get('firstName') ?? ''),
            last_name: String(fd.get('lastName') ?? ''),
            email: String(fd.get('email') ?? ''),
            address_1: String(fd.get('address') ?? ''),
            address_2: String(fd.get('apt') ?? ''),
            city: String(fd.get('city') ?? ''),
            state: String(fd.get('region') ?? ''),
            postcode: String(fd.get('postal') ?? ''),
            country: 'US',
          },
        }),
      })
      const mj = await mres.json().catch(() => ({}))
      clear()
      if (mj?.ok && mj.redirect_url) {
        window.location.href = mj.redirect_url
        return
      }
      // Fallback: secure checkout unavailable — show the confirmation we have.
      router.push(`/checkout/success?order=${res.number}&total=${res.totalCents}`)
    } catch {
      inFlight.current = false
      setPlacing(false)
    }
  }

  if (items.length === 0 && !placing) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="font-display text-3xl">Your bag is empty</h1>
        <p className="mt-3 text-ink-soft">Add something before heading to checkout.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-accent px-7 py-3.5 text-[13px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-accent-hover"
        >
          Browse the shop
        </Link>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-10 lg:grid-cols-2 lg:gap-16"
    >
      {/* ── Order summary (top on mobile, right on desktop) ── */}
      <section className="lg:order-2">
        <div className="rounded-xl border border-line bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl">Order summary</h2>
          <ul className="mt-5 divide-y divide-line">
            {items.map((item) => (
              <li key={item.key} className="flex gap-4 py-4 first:pt-0">
                <div className="relative shrink-0">
                  <ProductImage
                    name={item.name}
                    accent={item.accent}
                    category={item.category}
                    image={item.image}
                    className="h-20 w-16 rounded-[3px]"
                  />
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] text-paper">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex flex-1 justify-between gap-3">
                  <div>
                    <p className="font-display text-base leading-tight">{item.name}</p>
                    <p className="mt-0.5 text-[12px] uppercase tracking-[0.1em] text-ink-soft">
                      {item.color} · {item.size}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm">
                    {formatPrice(item.priceCents * item.quantity)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {/* Coupon input intentionally hidden — totals still show a
              discount line when an admin-applied discount exists. */}

          <dl className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd>{formatPrice(subtotalCents)}</dd>
            </div>
            {discountCents > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-soft">Discount{coupon ? ` · ${coupon.code}` : ''}</dt>
                <dd className="text-accent">−{formatPrice(discountCents)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink-soft">Shipping</dt>
              <dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Estimated tax</dt>
              <dd>{formatPrice(tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 font-display text-lg">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── Details ── */}
      <section className="flex flex-col gap-8 lg:order-1">
        {/* Contact */}
        <fieldset>
          <legend className="font-display text-xl">Contact</legend>
          <div className="mt-4">
            <label className={labelClass} htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required placeholder="you@email.com" className={inputClass} />
          </div>
        </fieldset>

        {/* Shipping address */}
        <fieldset>
          <legend className="font-display text-xl">Shipping address</legend>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="firstName">First name</label>
              <input id="firstName" name="firstName" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="lastName">Last name</label>
              <input id="lastName" name="lastName" required className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass} htmlFor="address">Address</label>
              <input id="address" name="address" required placeholder="Street address" className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass} htmlFor="apt">Apartment, suite (optional)</label>
              <input id="apt" name="apt" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="city">City</label>
              <input id="city" name="city" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="region">State / Region</label>
              <input id="region" name="region" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="postal">Postal code</label>
              <input id="postal" name="postal" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="country">Country</label>
              <input id="country" name="country" required defaultValue="United States" className={inputClass} />
            </div>
          </div>
        </fieldset>

        {/* Delivery */}
        <fieldset>
          <legend className="font-display text-xl">Delivery</legend>
          <div className="mt-4 space-y-3">
            {[
              {
                id: 'standard' as const,
                title: 'Standard',
                note: '3–5 business days',
                price: standardShip,
              },
              {
                id: 'express' as const,
                title: 'Express',
                note: '1–2 business days',
                price: EXPRESS_CENTS,
              },
            ].map((opt) => (
              <label
                key={opt.id}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3.5 transition',
                  method === opt.id ? 'border-ink bg-paper' : 'border-line hover:border-ink/40',
                )}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="delivery"
                    checked={method === opt.id}
                    onChange={() => setMethod(opt.id)}
                    className="accent-ink"
                  />
                  <span>
                    <span className="text-sm font-medium">{opt.title}</span>
                    <span className="block text-[12px] text-ink-soft">{opt.note}</span>
                  </span>
                </span>
                <span className="text-sm">{opt.price === 0 ? 'Free' : formatPrice(opt.price)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Payment — collected on secure checkout */}
        <fieldset>
          <legend className="flex items-center gap-3 font-display text-xl">
            Payment
            <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-accent">
              Secure checkout
            </span>
          </legend>
          <div className="mt-4 rounded-lg border border-line bg-card/60 p-5">
            <p className="text-[13px] leading-relaxed text-ink-soft">
              You&rsquo;ll enter your card on our secure checkout on the next step, over an
              encrypted connection — card details are never stored on this site. Major
              credit &amp; debit cards, Apple&nbsp;Pay and Google&nbsp;Pay are accepted.
            </p>
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={placing}
          className={cn(
            'w-full rounded-full px-6 py-4 text-[13px] uppercase tracking-[0.18em] transition-colors',
            placing ? 'cursor-wait bg-accent/60 text-paper' : 'bg-accent text-paper hover:bg-accent-hover',
          )}
        >
          {placing ? 'Placing order…' : `Place order — ${formatPrice(total)}`}
        </button>
        <p className="-mt-3 text-center text-[12px] text-ink-soft">
          By placing this order you agree to our terms. You&rsquo;ll complete payment on our secure checkout.
        </p>
      </section>
    </form>
  )
}
