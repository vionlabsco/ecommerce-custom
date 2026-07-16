'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from './CartProvider'
import { ProductImage } from './ProductImage'
import { formatPrice } from '@/lib/format'
import { site } from '@/lib/site'
import { cn } from '@/lib/cn'
import { placeOrder } from '@/lib/place-order'
import { COUNTRY_OPTIONS, normalizeCountry } from '@/lib/shipping/countries'

const EXPRESS_CENTS = site.expressShippingCents
const inputClass =
  'w-full rounded-md border border-line bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink/20'
const labelClass = 'mb-1.5 block text-[12px] uppercase tracking-[0.12em] text-ink-soft'

type LiveRate = {
  carrier: 'fedex' | 'dhl' | 'canada-post'
  carrierLabel: string
  serviceCode: string
  serviceName: string
  totalCents: number
  transitDays: number | null
}

type ShippingSelection =
  | { kind: 'flat'; method: 'standard' | 'express' }
  | { kind: 'live'; rate: LiveRate }

export function CheckoutForm() {
  const router = useRouter()
  const { items, subtotalCents, discountCents, coupon, clear } = useCart()

  // Address fields we need to trigger a rate fetch. Kept in state so the form
  // re-renders when they change (input `defaultValue` alone doesn't do that).
  const [country, setCountry] = useState('US')
  const [postal, setPostal] = useState('')
  const [city, setCity] = useState('')

  // Live rate quotes — fetched from /api/shipping/rates whenever the
  // destination changes. Empty until we have enough address data.
  const [liveRates, setLiveRates] = useState<LiveRate[]>([])
  const [ratesLoading, setRatesLoading] = useState(false)
  const [ratesError, setRatesError] = useState<string | null>(null)

  // Selected shipping option. Defaults to the flat "standard" fallback, then
  // switches to the cheapest live rate the moment one comes back.
  const [selection, setSelection] = useState<ShippingSelection>({
    kind: 'flat',
    method: 'standard',
  })

  const [placing, setPlacing] = useState(false)
  const inFlight = useRef(false)

  const discountedSubtotal = Math.max(0, subtotalCents - discountCents)

  const standardShip =
    discountedSubtotal >= site.freeShippingThresholdCents ? 0 : site.flatShippingCents

  const shipping = useMemo(() => {
    if (selection.kind === 'live') return selection.rate.totalCents
    return selection.method === 'express' ? EXPRESS_CENTS : standardShip
  }, [selection, standardShip])

  const tax = Math.round(discountedSubtotal * site.taxRate)
  const total = discountedSubtotal + shipping + tax

  // ── Fetch live rates when destination becomes valid ──────────────────────
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  const fetchRates = useCallback(async () => {
    // Need at least postal + country + at least one item.
    if (!postal.trim() || !country.trim() || itemCount === 0) return
    setRatesLoading(true)
    setRatesError(null)
    try {
      const res = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPostal: postal.trim(),
          toCountry: normalizeCountry(country),
          toCity: city.trim(),
          itemCount,
        }),
      })
      const j = await res.json().catch(() => ({}))
      if (!res.ok || !j.ok) {
        setRatesError(j.error || `HTTP ${res.status}`)
        setLiveRates([])
        return
      }
      const rates: LiveRate[] = Array.isArray(j.rates) ? j.rates : []
      setLiveRates(rates)
      // Auto-select the cheapest live rate as soon as they arrive.
      if (rates.length > 0) {
        setSelection({ kind: 'live', rate: rates[0] })
      }
    } catch (e) {
      setRatesError((e as Error).message || 'network error')
      setLiveRates([])
    } finally {
      setRatesLoading(false)
    }
  }, [postal, country, city, itemCount])

  // Debounce the fetch — a customer typing their postal shouldn't fire on
  // every keystroke. Wait 700 ms of quiet before hitting the API.
  useEffect(() => {
    const t = setTimeout(fetchRates, 700)
    return () => clearTimeout(t)
  }, [fetchRates])

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (items.length === 0) return
    if (inFlight.current) return
    inFlight.current = true
    setPlacing(true)
    const fd = new FormData(e.currentTarget)
    try {
      // Server is authoritative for money. We send shipping as either a flat
      // method or a live rate reference — the server re-fetches the live rate
      // to compute the actual cents and stores our selection on the order.
      const res = await placeOrder({
        customer: {
          name: `${fd.get('firstName') ?? ''} ${fd.get('lastName') ?? ''}`.trim(),
          email: String(fd.get('email') ?? ''),
        },
        items: items.map((i) => ({
          productId: i.productId,
          variant: `${i.color} · ${i.size}`,
          qty: i.quantity,
        })),
        shippingAddress: {
          line1: String(fd.get('address') ?? ''),
          city: String(fd.get('city') ?? ''),
          region: String(fd.get('region') ?? ''),
          postal: String(fd.get('postal') ?? ''),
          country: normalizeCountry(String(fd.get('country') ?? '')),
        },
        shippingMethod: selection.kind === 'flat' ? selection.method : 'standard',
        liveRate:
          selection.kind === 'live'
            ? {
                carrier: selection.rate.carrier,
                serviceCode: selection.rate.serviceCode,
              }
            : undefined,
        discountCode: coupon?.code ?? null,
      })

      const mres = await fetch('/api/maef/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: res.number,
          billing: {
            first_name: String(fd.get('firstName') ?? ''),
            last_name: String(fd.get('lastName') ?? ''),
            email: String(fd.get('email') ?? ''),
            address_1: String(fd.get('address') ?? ''),
            address_2: String(fd.get('apt') ?? ''),
            city: String(fd.get('city') ?? ''),
            state: String(fd.get('region') ?? ''),
            postcode: String(fd.get('postal') ?? ''),
            country: normalizeCountry(String(fd.get('country') ?? '')),
          },
        }),
      })
      const mj = await mres.json().catch(() => ({}))
      clear()
      if (mj?.ok && mj.redirect_url) {
        window.location.href = mj.redirect_url
        return
      }
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
    <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      {/* ── Order summary ── */}
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
              <dt className="text-ink-soft">
                Shipping
                {selection.kind === 'live' && (
                  <span className="ml-1 text-[11px] uppercase tracking-widest text-ink-mute">
                    {selection.rate.carrierLabel}
                  </span>
                )}
              </dt>
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
        <fieldset>
          <legend className="font-display text-xl">Contact</legend>
          <div className="mt-4">
            <label className={labelClass} htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@email.com"
              className={inputClass}
            />
          </div>
        </fieldset>

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
              <input
                id="address"
                name="address"
                required
                placeholder="Street address"
                className={inputClass}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass} htmlFor="apt">Apartment, suite (optional)</label>
              <input id="apt" name="apt" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="region">State / Province</label>
              <input id="region" name="region" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="postal">Postal / ZIP code</label>
              <input
                id="postal"
                name="postal"
                required
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClass}
              >
                {COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* ── Delivery — live rates or flat fallback ── */}
        <fieldset>
          <legend className="font-display text-xl">Delivery</legend>

          {ratesLoading && (
            <p className="mt-4 text-[13px] text-ink-soft">Fetching live shipping rates…</p>
          )}

          {!ratesLoading && liveRates.length > 0 && (
            <div className="mt-4 space-y-3">
              {liveRates.map((rate) => {
                const id = `${rate.carrier}-${rate.serviceCode}`
                const active =
                  selection.kind === 'live' &&
                  selection.rate.carrier === rate.carrier &&
                  selection.rate.serviceCode === rate.serviceCode
                return (
                  <label
                    key={id}
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3.5 transition',
                      active ? 'border-ink bg-paper' : 'border-line hover:border-ink/40',
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery"
                        checked={active}
                        onChange={() => setSelection({ kind: 'live', rate })}
                        className="accent-ink"
                      />
                      <span>
                        <span className="text-sm font-medium">
                          {rate.carrierLabel} — {rate.serviceName}
                        </span>
                        <span className="block text-[12px] text-ink-soft">
                          {rate.transitDays
                            ? `~${rate.transitDays} business day${rate.transitDays === 1 ? '' : 's'}`
                            : 'Live rate'}
                        </span>
                      </span>
                    </span>
                    <span className="text-sm">{formatPrice(rate.totalCents)}</span>
                  </label>
                )
              })}
            </div>
          )}

          {!ratesLoading && liveRates.length === 0 && (
            <>
              {ratesError && (
                <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-[12.5px] text-amber-800 ring-1 ring-inset ring-amber-200">
                  Couldn&rsquo;t reach carriers for a live quote. Showing flat rates.
                </p>
              )}
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
                ].map((opt) => {
                  const active =
                    selection.kind === 'flat' && selection.method === opt.id
                  return (
                    <label
                      key={opt.id}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3.5 transition',
                        active ? 'border-ink bg-paper' : 'border-line hover:border-ink/40',
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="delivery"
                          checked={active}
                          onChange={() =>
                            setSelection({ kind: 'flat', method: opt.id })
                          }
                          className="accent-ink"
                        />
                        <span>
                          <span className="text-sm font-medium">{opt.title}</span>
                          <span className="block text-[12px] text-ink-soft">{opt.note}</span>
                        </span>
                      </span>
                      <span className="text-sm">
                        {opt.price === 0 ? 'Free' : formatPrice(opt.price)}
                      </span>
                    </label>
                  )
                })}
              </div>
            </>
          )}
        </fieldset>

        <fieldset>
          <legend className="flex items-center gap-3 font-display text-xl">
            Payment
            <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-accent">
              Secure checkout
            </span>
          </legend>
          <div className="mt-4 rounded-lg border border-line bg-card/60 p-5">
            <p className="text-[13px] leading-relaxed text-ink-soft">
              You&rsquo;ll enter your card on our secure checkout on the next step, over
              an encrypted connection — card details are never stored on this site. Major
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
