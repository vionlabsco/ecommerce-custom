import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/cn'

type Props = {
  priceCents: number
  compareAtCents?: number
  className?: string
}

/** Renders a price, with a struck-through compare-at price when on sale. */
export function Price({ priceCents, compareAtCents, className }: Props) {
  const onSale = !!compareAtCents && compareAtCents > priceCents
  return (
    <span className={cn('inline-flex items-baseline gap-2', className)}>
      <span className={cn(onSale && 'text-clay')}>{formatPrice(priceCents)}</span>
      {onSale && (
        <span className="text-sm text-ink-soft line-through decoration-clay/50">
          {formatPrice(compareAtCents!)}
        </span>
      )}
    </span>
  )
}
