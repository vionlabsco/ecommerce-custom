'use client'

import { useEffect, useState } from 'react'
import { useCart } from './CartProvider'
import { getVariantState, type Product } from '@/lib/products'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/cn'

const MAX_BY_STATE = { 'in-stock': 8, 'low-stock': 3, 'sold-out': 0 } as const

export function AddToCart({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [color, setColor] = useState(product.colors[0].name)

  const sizesFor = (c: string) =>
    product.sizes.filter((s) => getVariantState(product, c, s) !== 'sold-out')

  const [size, setSize] = useState<string | null>(() => sizesFor(product.colors[0].name)[0] ?? null)

  // Reconcile size when colour changes: keep if still available, else pick first.
  useEffect(() => {
    const avail = sizesFor(color)
    setSize((prev) => (prev && avail.includes(prev) ? prev : (avail[0] ?? null)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color])

  const state = size ? getVariantState(product, color, size) : 'in-stock'
  const soldOut = size ? state === 'sold-out' : false
  const max = size ? MAX_BY_STATE[state] : 0
  const disabled = !size || soldOut

  function handleAdd() {
    if (!size || soldOut) return
    addItem({
      key: `${product.id}:${color}:${size}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      color,
      size,
      priceCents: product.priceCents,
      accent: product.accent,
      image: product.image,
      category: product.category,
      maxQuantity: max,
    })
  }

  const buttonLabel = !size
    ? 'Select a size'
    : soldOut
      ? 'Sold out in this size'
      : `Add to bag — ${formatPrice(product.priceCents)}`

  const isOneSize = product.sizes.length === 1 && product.sizes[0] === 'One Size'

  return (
    <div className="flex flex-col gap-7">
      {/* Colour */}
      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-[12px] uppercase tracking-[0.18em] text-ink-soft">Colour</span>
          <span className="text-[13px] text-ink">{color}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {product.colors.map((c) => (
            <button
              key={c.name}
              onClick={() => setColor(c.name)}
              aria-label={c.name}
              aria-pressed={color === c.name}
              title={c.name}
              className={cn(
                'h-9 w-9 rounded-full border transition',
                color === c.name
                  ? 'border-transparent ring-2 ring-ink ring-offset-2 ring-offset-paper'
                  : 'border-ink/15 hover:border-ink/50',
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      {!isOneSize && (
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] uppercase tracking-[0.18em] text-ink-soft">Size</span>
            <button className="text-[12px] uppercase tracking-[0.12em] text-ink-soft underline-offset-4 hover:text-ink hover:underline">
              Size guide
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {product.sizes.map((s) => {
              const oos = getVariantState(product, color, s) === 'sold-out'
              const selected = size === s
              return (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  disabled={oos}
                  aria-pressed={selected}
                  className={cn(
                    'min-w-[3.25rem] rounded-full border px-4 py-2 text-sm transition',
                    selected
                      ? 'border-ink bg-ink text-paper'
                      : 'border-ink/20 text-ink hover:border-ink',
                    oos && 'cursor-not-allowed text-ink-soft/45 line-through hover:border-ink/20',
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
      {size && (
        <p className="flex items-center gap-2 text-[13px]">
          <span
            className={cn(
              'inline-block h-1.5 w-1.5 rounded-full',
              state === 'in-stock' && 'bg-sage',
              state === 'low-stock' && 'bg-clay',
              state === 'sold-out' && 'bg-ink/30',
            )}
          />
          <span className="text-ink-soft">
            {state === 'in-stock' && 'In stock — ships in 1–2 days'}
            {state === 'low-stock' && 'Only a few left'}
            {state === 'sold-out' && 'Sold out in this size — try another'}
          </span>
        </p>
      )}

      <button
        onClick={handleAdd}
        disabled={disabled}
        className={cn(
          'w-full rounded-full px-6 py-4 text-[13px] uppercase tracking-[0.18em] transition-colors',
          disabled
            ? 'cursor-not-allowed bg-ink/15 text-ink-soft'
            : 'bg-ink text-paper hover:bg-clay',
        )}
      >
        {buttonLabel}
      </button>
    </div>
  )
}
