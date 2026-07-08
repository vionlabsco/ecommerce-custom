'use client'

import { useEffect, useState } from 'react'
import { useCart } from './CartProvider'
import { getVariantState, type Product } from '@/lib/products'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/cn'
import { BackInStockForm } from './BackInStockForm'

const MAX_BY_STATE = { 'in-stock': 8, 'low-stock': 3, 'sold-out': 0 } as const

/** Decide if a hex colour is "dark" enough that a white tick reads better than
 *  a black one. Uses YIQ luminance — accurate enough for swatch contrast. */
function isHexDark(hex: string): boolean {
  const h = hex.replace('#', '')
  if (h.length !== 6 && h.length !== 3) return false
  const exp = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const r = parseInt(exp.slice(0, 2), 16)
  const g = parseInt(exp.slice(2, 4), 16)
  const b = parseInt(exp.slice(4, 6), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq < 145
}

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart()

  const colors = product.colors ?? []
  const sizes = product.sizes ?? []
  const hasColors = colors.length > 0
  const hasSizes = sizes.length > 0

  const initialColor = hasColors ? colors[0].name : ''
  const [color, setColor] = useState(initialColor)

  const sizesFor = (c: string) =>
    hasSizes ? sizes.filter((s) => getVariantState(product, c, s) !== 'sold-out') : []

  const [size, setSize] = useState<string | null>(() =>
    hasSizes ? (sizesFor(initialColor)[0] ?? null) : null,
  )

  useEffect(() => {
    if (!hasSizes) return
    const avail = sizesFor(color)
    setSize((prev) => (prev && avail.includes(prev) ? prev : (avail[0] ?? null)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color])

  const state = size ? getVariantState(product, color, size) : 'in-stock'
  const soldOut = hasSizes && size ? state === 'sold-out' : false
  const max = hasSizes && size ? MAX_BY_STATE[state] : 8
  const disabled = (hasSizes && !size) || soldOut

  const [qty, setQty] = useState(1)
  useEffect(() => {
    if (qty > max) setQty(Math.max(1, max))
  }, [max, qty])

  function handleAdd() {
    if (disabled) return
    addItem(
      {
        key: `${product.id}:${color || '_'}:${size || '_'}`,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        color,
        size: size ?? '',
        priceCents: product.priceCents,
        accent: product.accent,
        image: product.image,
        category: product.category,
        maxQuantity: max,
      },
      qty,
    )
  }

  const buttonLabel =
    hasSizes && !size
      ? 'Select a size'
      : soldOut
        ? 'Sold out'
        : `Add to bag — ${formatPrice(product.priceCents)}`

  const isOneSize = hasSizes && sizes.length === 1 && sizes[0] === 'One Size'

  return (
    <div className="flex flex-col gap-6">
      {/* Flavour swatch — selected chip gets a clear visual ring + checkmark
          overlay so the active state can't be missed against light or dark
          fills. Label reads as "Flavour" for supplement placeholder catalog;
          rename per-product if you carry non-flavoured SKUs. */}
      {hasColors && (
        <div>
          <div className="flex items-baseline justify-between">
            <span className="label-mono">Flavour</span>
            <span className="text-[13px] font-medium text-ink">{color}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {colors.map((c) => {
              const selected = color === c.name
              // Pick a contrasting check-icon colour based on swatch brightness
              // so the tick is always readable.
              const isDark = isHexDark(c.hex)
              const tickColor = isDark ? '#ffffff' : '#0a0a0a'
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(c.name)}
                  aria-label={c.name}
                  aria-pressed={selected}
                  title={c.name}
                  className={cn(
                    'relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all',
                    selected
                      ? 'scale-110 border-accent shadow-[0_0_0_4px_rgba(37,99,235,0.20)]'
                      : 'border-line hover:scale-105 hover:border-ink-soft',
                  )}
                  style={{ backgroundColor: c.hex }}
                >
                  {selected && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M5 12.5l4.2 4.2L19 7"
                        stroke={tickColor}
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Size */}
      {hasSizes && !isOneSize && (
        <div>
          <div className="flex items-baseline justify-between">
            <span className="label-mono">Size</span>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('open-size-guide'))}
              className="text-[11px] font-medium uppercase tracking-widest2 text-ink-soft hover:text-accent"
            >
              Size guide
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {sizes.map((s) => {
              const oos = getVariantState(product, color, s) === 'sold-out'
              const selected = size === s
              return (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  disabled={oos}
                  aria-pressed={selected}
                  className={cn(
                    'min-w-[3.5rem] rounded-md border px-4 py-2.5 text-[12px] font-medium uppercase tracking-widest2 transition',
                    selected
                      ? 'border-accent bg-accent text-paper'
                      : 'border-line bg-paper text-ink hover:border-accent hover:text-accent',
                    oos &&
                      'cursor-not-allowed border-line bg-surface text-ink-mute line-through hover:border-line hover:text-ink-mute',
                  )}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Stock indicator */}
      {hasSizes && size && (
        <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest2">
          <span
            className={cn(
              'inline-block h-2 w-2 rounded-full',
              state === 'in-stock' && 'bg-lime',
              state === 'low-stock' && 'bg-accent',
              state === 'sold-out' && 'bg-ink-mute',
            )}
          />
          <span className="text-ink-soft">
            {state === 'in-stock' && 'In stock — ships 1–2 days'}
            {state === 'low-stock' && 'Only a few left'}
            {state === 'sold-out' && 'Sold out in this size'}
          </span>
        </p>
      )}

      {soldOut ? (
        // When the selected variant is out of stock, swap the disabled "Sold
        // out" button for a real lead-capture form. Customer gets an active
        // way to be notified instead of a dead button.
        <BackInStockForm
          productId={product.id}
          variantKey={hasSizes ? `${color}/${size}` : color || undefined}
        />
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          {/* Quantity stepper */}
          <div
            role="group"
            aria-label="Quantity"
            className="inline-flex items-center rounded-md border border-line bg-paper"
          >
            <button
              type="button"
              onClick={() => setQty((n) => Math.max(1, n - 1))}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
              className="flex h-full w-11 items-center justify-center text-ink transition-colors hover:text-accent disabled:cursor-not-allowed disabled:text-ink-mute"
            >
              <svg width="14" height="2" viewBox="0 0 14 2" aria-hidden>
                <path d="M0 1h14" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
            <span
              aria-live="polite"
              className="min-w-[2rem] text-center font-display text-base font-bold text-ink"
            >
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((n) => Math.min(max, n + 1))}
              disabled={qty >= max}
              aria-label="Increase quantity"
              className="flex h-full w-11 items-center justify-center text-ink transition-colors hover:text-accent disabled:cursor-not-allowed disabled:text-ink-mute"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M7 0v14M0 7h14" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={disabled}
            className={cn(
              'flex-1 rounded-md px-6 py-4 text-[12px] font-bold uppercase tracking-widest2 transition-colors',
              disabled
                ? 'cursor-not-allowed border border-line bg-surface text-ink-mute'
                : 'bg-accent text-paper hover:bg-accent-hover',
            )}
          >
            {buttonLabel}
          </button>
        </div>
      )}
    </div>
  )
}
