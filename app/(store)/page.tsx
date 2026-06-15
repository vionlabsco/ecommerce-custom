import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { ProductImage } from '@/components/ProductImage'
import { Reveal } from '@/components/Reveal'
import { Price } from '@/components/Price'
import {
  getFeaturedProducts,
  getAllProducts,
  getProductBySlug,
  getProductsByCategory,
  CATEGORIES,
} from '@/lib/products'
import { site } from '@/lib/site'

export default function HomePage() {
  const featured = getFeaturedProducts()
  const all = getAllProducts()
  const hero = getProductBySlug('garun-wool-sweater')!
  const bandProduct = getProductBySlug('waxed-chore-jacket')!

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-shell items-center gap-10 px-5 pb-16 pt-12 md:grid-cols-2 md:gap-12 md:px-8 md:pt-16 lg:pb-24">
          <div>
            <p
              className="animate-rise text-[12px] uppercase tracking-[0.26em] text-clay"
              style={{ animationDelay: '40ms' }}
            >
              Autumn / Winter Collection
            </p>
            <h1
              className="animate-rise mt-5 font-display text-[clamp(2.75rem,7vw,5.5rem)] font-light leading-[0.94] tracking-tightest text-balance"
              style={{ animationDelay: '120ms' }}
            >
              Clothes you keep, not clothes you replace.
            </h1>
            <p
              className="animate-rise mt-6 max-w-md text-lg leading-relaxed text-ink-soft text-pretty"
              style={{ animationDelay: '220ms' }}
            >
              {site.tagline} Made in small batches from honest materials, and built
              to be worn long after the season turns.
            </p>
            <div
              className="animate-rise mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '320ms' }}
            >
              <Link
                href="/shop"
                className="rounded-full bg-ink px-8 py-3.5 text-[13px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-clay"
              >
                Shop the collection
              </Link>
              <Link
                href="/shop?category=Knitwear"
                className="rounded-full px-5 py-3.5 text-[13px] uppercase tracking-[0.16em] text-ink underline-offset-4 transition-colors hover:text-clay hover:underline"
              >
                Explore knitwear →
              </Link>
            </div>
            <ul
              className="animate-rise mt-11 flex flex-wrap gap-x-8 gap-y-2 text-[13px] text-ink-soft"
              style={{ animationDelay: '420ms' }}
            >
              <li>Small-batch made</li>
              <li className="text-clay">✦</li>
              <li>Free 30-day returns</li>
              <li className="text-clay">✦</li>
              <li>Carbon-neutral delivery</li>
            </ul>
          </div>

          <div className="animate-fade relative" style={{ animationDelay: '240ms' }}>
            <Link href={`/product/${hero.slug}`} className="group block">
              <div className="overflow-hidden rounded-lg ring-1 ring-inset ring-ink/5">
                <ProductImage
                  name={hero.name}
                  accent={hero.accent}
                  category={hero.category}
                  image={hero.image}
                  className="aspect-[4/5] w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-4 rounded-full bg-paper/92 py-2 pl-5 pr-2 shadow-lg backdrop-blur">
                <div>
                  <p className="font-display text-base leading-none">{hero.name}</p>
                  <Price priceCents={hero.priceCents} className="text-[13px] text-ink-soft" />
                </div>
                <span className="rounded-full bg-ink px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-paper transition-colors group-hover:bg-clay">
                  Shop
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured edit ── */}
      <section className="mx-auto max-w-shell px-5 py-16 md:px-8 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] uppercase tracking-[0.22em] text-clay">Featured</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">This week&apos;s edit</h2>
          </div>
          <Link
            href="/shop"
            className="hidden shrink-0 text-[13px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink sm:block"
          >
            View all →
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Brand statement band ── */}
      <section className="bg-ink text-paper">
        <div className="mx-auto grid max-w-shell items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-8 lg:py-28">
          <Reveal>
            <div>
              <p className="text-[12px] uppercase tracking-[0.22em] text-clay">Our promise</p>
              <h2 className="mt-4 font-display text-4xl leading-[1.05] text-balance md:text-5xl">
                Fewer things. Better made. Worn for years.
              </h2>
              <p className="mt-6 max-w-md leading-relaxed text-paper/70 text-pretty">
                We design a small, tightly edited collection and make it properly — natural
                fibres, real construction, and finishing you can feel. No drops you&apos;ll
                forget by spring.
              </p>
              <Link
                href="/shop"
                className="mt-9 inline-block rounded-full border border-paper/30 px-8 py-3.5 text-[13px] uppercase tracking-[0.16em] text-paper transition-colors hover:border-paper hover:bg-paper hover:text-ink"
              >
                Shop everything
              </Link>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="overflow-hidden rounded-lg">
              <ProductImage
                name={bandProduct.name}
                accent={bandProduct.accent}
                category={bandProduct.category}
                image={bandProduct.image}
                className="aspect-[5/6] w-full"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="mx-auto max-w-shell px-5 py-16 md:px-8 lg:py-20">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl md:text-4xl">Shop by category</h2>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {CATEGORIES.map((cat, i) => {
            const rep = getProductsByCategory(cat)[0]
            return (
              <Reveal key={cat} delay={i * 70}>
                <Link
                  href={`/shop?category=${encodeURIComponent(cat)}`}
                  className="group relative block overflow-hidden rounded-lg"
                >
                  <ProductImage
                    name={cat}
                    accent={rep?.accent ?? '#6b6f4e'}
                    category={cat}
                    image={rep?.image}
                    className="aspect-square w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/55 to-transparent p-4">
                    <span className="font-display text-xl text-paper">{cat}</span>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ── Full collection ── */}
      <section className="mx-auto max-w-shell px-5 pb-4 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] uppercase tracking-[0.22em] text-clay">Everything</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl">The full collection</h2>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {all.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Value props ── */}
      <section className="mx-auto mt-16 max-w-shell px-5 md:px-8">
        <div className="grid divide-y divide-line border-y border-line text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { t: 'Complimentary shipping', s: 'On every order over $150' },
            { t: 'Easy 30-day returns', s: 'Changed your mind? No trouble.' },
            { t: 'Made to last', s: 'Natural fibres, real construction' },
          ].map((v) => (
            <div key={v.t} className="px-6 py-10">
              <p className="font-display text-xl">{v.t}</p>
              <p className="mt-2 text-sm text-ink-soft">{v.s}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
