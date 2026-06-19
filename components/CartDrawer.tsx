'use client'

import Link from 'next/link'
import { useCart } from './CartProvider'
import { ProductImage } from './ProductImage'
import { CouponInput } from './CouponInput'
import { formatPrice } from '@/lib/format'
import { site } from '@/lib/site'
import { cn } from '@/lib/cn'

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    count,
    subtotalCents,
    discountCents,
    setQuantity,
    removeItem,
  } = useCart()

  const cartTotalCents = Math.max(0, subtotalCents - discountCents)
  // Free-shipping is gated on the POST-discount amount so applying a code
  // can't sneak past the threshold (and matches what the checkout charges).
  const remaining = site.freeShippingThresholdCents - cartTotalCents
  const progress = Math.min(
    100,
    (cartTotalCents / site.freeShippingThresholdCents) * 100,
  )

  return (
    <div
      {...(!isOpen ? ({ inert: '' } as any) : {})}
      className={cn(
        'fixed inset-0 z-50',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      <div
        onClick={closeCart}
        className={cn(
          'absolute inset-0 bg-ink/45 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0',
        )}
      />

      <aside
        role="dialog"
        aria-label="Shopping bag"
        className={cn(
          'absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-paper shadow-2xl transition-transform duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6 sm:py-5">
          <h2 className="font-display text-xl font-bold text-ink">
            Your bag
            {count > 0 && (
              <span className="ml-2 text-sm font-normal text-ink-soft">· {count}</span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-md border border-line p-2 text-ink-soft transition-colors hover:border-accent hover:text-accent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="label-mono">Empty</p>
            <p className="font-display text-2xl font-bold text-ink">Your bag is empty</p>
            <p className="max-w-xs text-sm text-ink-soft">
              Nothing here yet. Find a surface that fits how you move.
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="mt-2 inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-accent-hover"
            >
              Browse the shop →
            </Link>
          </div>
        ) : (
          <>
            {/* free-shipping meter */}
            <div className="border-b border-line bg-surface px-5 py-4 sm:px-6">
              {remaining > 0 ? (
                <p className="text-[11px] font-medium uppercase tracking-widest2 text-ink-soft">
                  <span className="font-bold text-ink">{formatPrice(remaining)}</span>{' '}
                  to free shipping
                </p>
              ) : (
                <p className="text-[11px] font-medium uppercase tracking-widest2 text-lime">
                  ● Free shipping unlocked
                </p>
              )}
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-accent transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* line items */}
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5 sm:px-6">
              {items.map((item) => (
                <li key={item.key} className="flex gap-3 py-4 sm:gap-4 sm:py-5">
                  <Link href={`/product/${item.slug}`} onClick={closeCart} className="shrink-0">
                    <div className="overflow-hidden rounded-md border border-line bg-surface">
                      <ProductImage
                        name={item.name}
                        accent={item.accent}
                        category={item.category}
                        image={item.image}
                        className="h-20 w-20 sm:h-24 sm:w-24"
                      />
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={closeCart}
                        className="font-display text-base font-bold leading-tight text-ink hover:text-accent"
                      >
                        {item.name}
                      </Link>
                      <span className="shrink-0 font-display text-sm font-bold text-ink">
                        {formatPrice(item.priceCents * item.quantity)}
                      </span>
                    </div>
                    {(item.color || item.size) && (
                      <p className="mt-0.5 text-[10.5px] font-medium uppercase tracking-widest2 text-ink-soft">
                        {[item.color, item.size].filter(Boolean).join(' · ')}
                      </p>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center rounded-md border border-line">
                        <button
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          className="px-3 py-1.5 text-ink-soft transition-colors hover:text-accent"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm text-ink tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          disabled={item.quantity >= item.maxQuantity}
                          className="px-3 py-1.5 text-ink-soft transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.key)}
                        className="text-[10.5px] font-medium uppercase tracking-widest2 text-ink-soft underline-offset-4 transition-colors hover:text-accent hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* footer */}
            <div className="border-t border-line bg-surface px-5 py-5 sm:px-6">
              {/* Coupon input — collapses to a chip once applied */}
              <div className="mb-4">
                <CouponInput compact />
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">Subtotal</span>
                  <span className="text-ink">{formatPrice(subtotalCents)}</span>
                </div>
                {discountCents > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-ink-soft">Discount</span>
                    <span className="text-accent">−{formatPrice(discountCents)}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
                <span className="label-mono">Total</span>
                <span className="font-display text-2xl font-bold text-ink">
                  {formatPrice(cartTotalCents)}
                </span>
              </div>
              <p className="mt-1 text-[10.5px] font-medium uppercase tracking-widest2 text-ink-mute">
                Shipping &amp; taxes calculated at checkout
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 flex w-full items-center justify-center rounded-md bg-accent px-6 py-3.5 text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-accent-hover"
              >
                Checkout →
              </Link>
              <button
                onClick={closeCart}
                className="mt-3 w-full text-center text-[11px] font-medium uppercase tracking-widest2 text-ink-soft transition-colors hover:text-ink"
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
