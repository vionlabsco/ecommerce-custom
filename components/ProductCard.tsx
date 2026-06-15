import Link from 'next/link'
import { ProductImage } from './ProductImage'
import { Price } from './Price'
import { isProductAvailable, type Product } from '@/lib/products'

export function ProductCard({ product }: { product: Product }) {
  const available = isProductAvailable(product)
  const onSale = !!product.compareAtCents && product.compareAtCents > product.priceCents

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-[4px] ring-1 ring-inset ring-ink/5">
        <ProductImage
          name={product.name}
          accent={product.accent}
          category={product.category}
          image={product.image}
          className="aspect-[4/5] w-full transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />

        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className="w-fit rounded-full bg-paper/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-ink backdrop-blur">
              {product.badge}
            </span>
          )}
          {onSale && (
            <span className="w-fit rounded-full bg-clay px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-paper">
              Sale
            </span>
          )}
        </div>

        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/55 backdrop-blur-[1px]">
            <span className="rounded-full border border-ink/30 bg-paper px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-ink">
              Sold out
            </span>
          </div>
        )}

        {/* quiet hover affordance */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-ink/90 py-2.5 text-center text-[11px] uppercase tracking-[0.2em] text-paper transition-transform duration-300 ease-out group-hover:translate-y-0">
          View product
        </div>
      </div>

      <div className="mt-3.5 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg leading-tight text-ink">
            {product.name}
          </h3>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-ink-soft">
            {product.category}
          </p>
        </div>
        <Price
          priceCents={product.priceCents}
          compareAtCents={product.compareAtCents}
          className="shrink-0 font-display text-lg text-ink"
        />
      </div>
    </Link>
  )
}
