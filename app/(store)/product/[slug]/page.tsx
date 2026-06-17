import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductImage } from '@/components/ProductImage'
import { AddToCart } from '@/components/AddToCart'
import { ProductCard } from '@/components/ProductCard'
import { Price } from '@/components/Price'
import { Reveal } from '@/components/Reveal'
import { getProductBySlug, getRelatedProducts } from '@/lib/products'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)
  return {
    title: product?.name ?? 'Product',
    description: product?.shortDescription,
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product, 4)

  return (
    <div className="mx-auto max-w-shell px-5 py-8 md:px-8 md:py-12">
      {/* breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-[12px] uppercase tracking-[0.12em] text-ink-soft">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-ink">Shop</Link>
        <span>/</span>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-ink"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* gallery */}
        <div className="overflow-hidden rounded-lg ring-1 ring-inset ring-ink/5">
          <ProductImage
            name={product.name}
            accent={product.accent}
            category={product.category}
            image={product.image}
            className="aspect-[4/5] w-full"
          />
        </div>

        {/* details */}
        <div className="lg:py-2">
          <p className="text-[12px] uppercase tracking-[0.22em] text-clay">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight md:text-5xl">{product.name}</h1>
          <Price
            priceCents={product.priceCents}
            compareAtCents={product.compareAtCents}
            className="mt-4 font-display text-2xl"
          />

          <p className="mt-6 max-w-prose leading-relaxed text-ink-soft text-pretty">
            {product.description}
          </p>

          <div className="mt-9">
            <AddToCart product={product} />
          </div>

          <p className="mt-5 text-center text-[12px] uppercase tracking-[0.12em] text-ink-soft">
            Free shipping over $150 · 30-day returns
          </p>

          {/* accordions */}
          <div className="mt-9 divide-y divide-line border-y border-line">
            <details className="group py-4" open>
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg">
                Product details
                <span className="text-ink-soft transition-transform group-open:rotate-45">+</span>
              </summary>
              <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-ink-soft">
                {product.details.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="text-clay">—</span>
                    {d}
                  </li>
                ))}
              </ul>
            </details>
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg">
                Shipping &amp; returns
                <span className="text-ink-soft transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Orders ship within 1–2 business days, carbon-neutral. Complimentary shipping
                over $150. Not right? Return it within 30 days for a full refund — we&apos;ll
                even cover the label.
              </p>
            </details>
          </div>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-3xl">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
