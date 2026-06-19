import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductImage } from '@/components/ProductImage'
import { AddToCart } from '@/components/AddToCart'
import { ProductCard } from '@/components/ProductCard'
import { Price } from '@/components/Price'
import { Reveal } from '@/components/Reveal'
import { getProductBySlug, getRelatedProducts } from '@/lib/products'

export const revalidate = 60

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
  const details = product.details ?? []

  return (
    <div className="mx-auto max-w-shell px-5 py-6 md:px-8 md:py-12">
      {/* breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-[10.5px] font-medium uppercase tracking-widest2 text-ink-soft">
        <Link href="/" className="hover:text-accent">Home</Link>
        <span className="text-ink-mute">/</span>
        <Link href="/shop" className="hover:text-accent">Shop</Link>
        <span className="text-ink-mute">/</span>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-accent"
        >
          {product.category}
        </Link>
        <span className="text-ink-mute">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 md:mt-8 lg:grid-cols-2 lg:gap-14">
        {/* gallery */}
        <div className="overflow-hidden rounded-md border border-line bg-surface">
          <ProductImage
            name={product.name}
            accent={product.accent}
            category={product.category}
            image={product.image}
            className="aspect-square w-full md:aspect-[4/5]"
          />
        </div>

        {/* details */}
        <div className="lg:py-2">
          <p className="label-accent">{product.category} series</p>
          <h1 className="mt-2 font-display text-3xl font-bold leading-tight text-ink md:text-5xl">
            {product.name}
          </h1>
          <Price
            priceCents={product.priceCents}
            compareAtCents={product.compareAtCents}
            className="mt-4 font-display text-2xl font-bold text-ink md:text-3xl"
          />

          {product.shortDescription && (
            <p className="mt-5 max-w-prose text-base leading-relaxed text-ink-soft text-pretty">
              {product.shortDescription}
            </p>
          )}

          <div className="mt-8 border-t border-line pt-8">
            <AddToCart product={product} />
          </div>

          <p className="mt-5 text-center text-[10.5px] font-medium uppercase tracking-widest2 text-ink-mute">
            Free shipping over $50 · 30-day returns
          </p>

          {/* At-a-glance spec card — derived from product fields so it stays
              in sync with admin edits without needing a separate spec schema. */}
          <div className="mt-8 overflow-hidden rounded-lg border border-line bg-card">
            <p className="border-b border-line bg-surface px-5 py-2.5 text-[10.5px] font-semibold uppercase tracking-widest2 text-ink-soft">
              Specs at a glance
            </p>
            <dl className="grid grid-cols-1 divide-y divide-line text-sm sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="px-5 py-3 sm:py-4">
                <dt className="text-[10.5px] font-medium uppercase tracking-widest2 text-ink-soft">Sizes</dt>
                <dd className="mt-1 font-medium text-ink">{product.sizes?.join(' · ') || '—'}</dd>
              </div>
              <div className="px-5 py-3 sm:py-4">
                <dt className="text-[10.5px] font-medium uppercase tracking-widest2 text-ink-soft">Colours</dt>
                <dd className="mt-1 font-medium text-ink">
                  {(product.colors ?? []).map((c) => c.name).join(' · ') || '—'}
                </dd>
              </div>
              <div className="px-5 py-3 sm:py-4">
                <dt className="text-[10.5px] font-medium uppercase tracking-widest2 text-ink-soft">Category</dt>
                <dd className="mt-1 font-medium text-ink">{product.category}</dd>
              </div>
              <div className="px-5 py-3 sm:py-4">
                <dt className="text-[10.5px] font-medium uppercase tracking-widest2 text-ink-soft">Warranty</dt>
                <dd className="mt-1 font-medium text-ink">
                  <Link href="/pages/warranty" className="hover:text-accent">1 year</Link>
                </dd>
              </div>
            </dl>
          </div>

          {/* accordions */}
          <div className="mt-8 divide-y divide-line border-y border-line">
            <details className="group py-4" open>
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-bold text-ink">
                Product details
                <span className="text-accent transition-transform group-open:rotate-45">+</span>
              </summary>
              {product.description && (
                <p className="mt-3 text-sm leading-relaxed text-ink-soft text-pretty">
                  {product.description}
                </p>
              )}
              {details.length > 0 && (
                <ul className="mt-4 space-y-2 text-[12px] font-medium uppercase tracking-widest2 text-ink-soft">
                  {details.map((d) => (
                    <li key={d} className="flex gap-3">
                      <span className="text-accent">●</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              )}
            </details>
            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-bold text-ink">
                Shipping &amp; returns
                <span className="text-accent transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Ships from Canada within 1–2 business days to the US and Canada.
                Free shipping over $50. Not right? Return it within 30 days for a
                full refund — we&apos;ll even cover the label.
              </p>
            </details>
          </div>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-20 md:mt-24">
          <p className="label-mono">Also from the rack</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink">
            You may also like
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5 md:gap-y-10">
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
