'use client'

import { useEffect, useState } from 'react'
import { useCart } from './CartProvider'
import { getVariantState, type Product } from '@/lib/products'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/cn'

const MAX_BY_STATE = { 'in-stock': 8, 'low-stock': 3, 'sold-out': 0 } as const

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

  function handleAdd() {
    if (disabled) return
    addItem({
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
    })
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
      {/* Colour */}
      {hasColors && (
        <div>
          <div className="flex items-baseline justify-between">
            <span className="label-mono">Colour</span>
            <span className="text-[12px] text-ink">{color}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            {colors.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c.name)}
                aria-label={c.name}
                aria-pressed={color === c.name}
                title={c.name}
                className={cn(
                  'h-10 w-10 rounded-md border-2 transition',
                  color === c.name
                    ? 'border-accent ring-2 ring-accent ring-offset-2 ring-offset-paper'
                    : 'border-line hover:border-ink-soft',
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size */}
      {hasSizes && !isOneSize && (
        <div>
          <div className="flex items-baseline justify-between">
            <span className="label-mono">Size</span>
            <button className="text-[11px] font-medium uppercase tracking-widest2 text-ink-soft hover:text-accent">
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
                      ? 'border-ink bg-ink text-paper'
                      : 'border-line bg-paper text-ink hover:border-ink',
                    oos &&
                      'cursor-not-allowed border-line bg-surface text-ink-mute line-through hover:border-line',
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

      <button
        onClick={handleAdd}
        disabled={disabled}
        className={cn(
          'w-full rounded-md px-6 py-4 text-[12px] font-bold uppercase tracking-widest2 transition-colors',
          disabled
            ? 'cursor-not-allowed border border-line bg-surface text-ink-mute'
            : 'bg-ink text-paper hover:bg-accent hover:text-ink',
        )}
      >
        {buttonLabel}
      </button>
    </div>
  )
}
