import Link from 'next/link'
import { ProductImage } from './ProductImage'
import { Price } from './Price'
import { isProductAvailable, type Product } from '@/lib/products'

export function ProductCard({ product }: { product: Product }) {
  const available = isProductAvailable(product)
  const onSale = !!product.compareAtCents && product.compareAtCents > product.priceCents

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-md border border-line bg-surface">
        <ProductImage
          name={product.name}
          accent={product.accent}
          category={product.category}
          image={product.image}
          className="aspect-square w-full transition-transform duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />

        {/* badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className="w-fit rounded-sm bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest2 text-ink">
              {product.badge}
            </span>
          )}
          {onSale && (
            <span className="w-fit rounded-sm bg-lime px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest2 text-paper">
              Sale
            </span>
          )}
        </div>

        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/75 backdrop-blur-[2px]">
            <span className="rounded-sm border border-line bg-paper px-4 py-1.5 text-[11px] font-medium uppercase tracking-widest2 text-ink">
              Sold out
            </span>
          </div>
        )}

        {/* hover affordance — accent bar slides up */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-accent py-2.5 text-center text-[11px] font-bold uppercase tracking-widest2 text-ink transition-transform duration-300 ease-out group-hover:translate-y-0">
          View product →
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="label-mono">{product.category}</p>
          <h3 className="mt-1 truncate font-display text-lg font-bold text-ink">
            {product.name}
          </h3>
        </div>
        <Price
          priceCents={product.priceCents}
          compareAtCents={product.compareAtCents}
          className="shrink-0 font-display text-lg font-bold text-ink"
        />
      </div>
    </Link>
  )
}
