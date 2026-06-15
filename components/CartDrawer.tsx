'use client'

import Link from 'next/link'
import { useCart } from './CartProvider'
import { ProductImage } from './ProductImage'
import { formatPrice } from '@/lib/format'
import { site } from '@/lib/site'
import { cn } from '@/lib/cn'

export function CartDrawer() {
  const { isOpen, closeCart, items, count, subtotalCents, setQuantity, removeItem } = useCart()

  const remaining = site.freeShippingThresholdCents - subtotalCents
  const progress = Math.min(100, (subtotalCents / site.freeShippingThresholdCents) * 100)

  return (
    <div
      // `inert` (when closed) hides the drawer from assistive tech AND removes
      // its contents from the tab order / moves focus out — avoiding the
      // "aria-hidden on a focused descendant" violation.
      {...(!isOpen ? ({ inert: '' } as any) : {})}
      className={cn('fixed inset-0 z-50', isOpen ? 'pointer-events-auto' : 'pointer-events-none')}
    >
      <div
        onClick={closeCart}
        className={cn(
          'absolute inset-0 bg-ink/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
      />

      <aside
        role="dialog"
        aria-label="Shopping bag"
        className={cn(
          'absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl transition-transform duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-xl">
            Your bag{count > 0 && <span className="text-ink-soft"> · {count}</span>}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="text-2xl leading-none text-ink-soft transition-colors hover:text-ink"
          >
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-display text-2xl text-ink">Your bag is empty</p>
            <p className="max-w-xs text-sm text-ink-soft">
              Nothing here yet. Find something made to last.
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="mt-2 rounded-full bg-ink px-6 py-3 text-[13px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-clay"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <>
            {/* free-shipping meter */}
            <div className="border-b border-line px-6 py-4">
              {remaining > 0 ? (
                <p className="text-[13px] text-ink-soft">
                  You&apos;re{' '}
                  <span className="font-medium text-ink">{formatPrice(remaining)}</span> away from
                  free shipping
                </p>
              ) : (
                <p className="text-[13px] font-medium text-sage">
                  ✦ You&apos;ve unlocked free shipping
                </p>
              )}
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-clay transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* line items */}
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 py-5">
                  <Link
                    href={`/product/${item.slug}`}
                    onClick={closeCart}
                    className="shrink-0"
                  >
                    <ProductImage
                      name={item.name}
                      accent={item.accent}
                      category={item.category}
                      image={item.image}
                      className="h-24 w-20 rounded-[3px]"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="font-display text-base leading-tight hover:text-clay"
                      >
                        {item.name}
                      </Link>
                      <span className="shrink-0 text-sm">{formatPrice(item.priceCents * item.quantity)}</span>
                    </div>
                    <p className="mt-0.5 text-[12px] uppercase tracking-[0.12em] text-ink-soft">
                      {item.color} · {item.size}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-full border border-line">
                        <button
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          className="px-3 py-1 text-ink-soft transition-colors hover:text-ink"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQuantity}
                          className="px-3 py-1 text-ink-soft transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-[12px] uppercase tracking-[0.12em] text-ink-soft underline-offset-4 transition-colors hover:text-clay hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* footer */}
            <div className="border-t border-line px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm uppercase tracking-[0.14em] text-ink-soft">Subtotal</span>
                <span className="font-display text-xl">{formatPrice(subtotalCents)}</span>
              </div>
              <p className="mt-1 text-[12px] text-ink-soft">
                Shipping &amp; taxes calculated at checkout.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 text-[13px] uppercase tracking-[0.18em] text-paper transition-colors hover:bg-clay"
              >
                Checkout
              </Link>
              <button
                onClick={closeCart}
                className="mt-3 w-full text-center text-[12px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
