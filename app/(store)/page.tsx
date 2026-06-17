import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { ProductImage } from '@/components/ProductImage'
import { Reveal } from '@/components/Reveal'
import { Price } from '@/components/Price'
import { getAllProducts, getCategories } from '@/lib/products'
import { site } from '@/lib/site'

// Cache for 60s — products change rarely; this makes click-through near-instant.
export const revalidate = 60

export default async function HomePage() {
  const all = await getAllProducts()
  const categories = await getCategories()

  if (all.length === 0) {
    return (
      <div className="mx-auto max-w-shell px-5 py-32 text-center md:px-8">
        <p className="label-mono">No catalogue</p>
        <h1 className="mt-3 font-display text-4xl font-bold">Add your first product</h1>
        <p className="mt-3 text-paper-soft">
          Spin up products in the admin and the store comes to life.
        </p>
      </div>
    )
  }

  const featured = all.filter((p) => p.featured)
  const hero = (all.find((p) => p.featured) ?? all[0])!
  const second = (all.find((p) => p.id !== hero.id) ?? all[0])!

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-line bg-ink bg-grid">
        <div className="mx-auto grid max-w-shell gap-10 px-5 pb-14 pt-10 md:grid-cols-12 md:gap-12 md:px-8 md:pb-20 md:pt-16">
          {/* Text */}
          <div className="md:col-span-7 md:py-6">
            <p
              className="animate-rise label-accent"
              style={{ animationDelay: '40ms' }}
            >
              VL//01 — Desk Surface Series
            </p>
            <h1
              className="animate-rise mt-5 font-display text-[clamp(2.5rem,9vw,6rem)] font-bold leading-[0.92] tracking-tightest text-balance text-paper"
              style={{ animationDelay: '120ms' }}
            >
              Engineered for <span className="text-accent">precision.</span>
              <br className="hidden sm:block" />
              Built to outlast.
            </h1>
            <p
              className="animate-rise mt-6 max-w-md text-base leading-relaxed text-paper-soft md:text-lg"
              style={{ animationDelay: '220ms' }}
            >
              {site.tagline} A 5&nbsp;mm tempered-glass pad and a stitched cloth pad —
              two surfaces, each tuned for fast, controlled tracking.
            </p>
            <div
              className="animate-rise mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '320ms' }}
            >
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3.5 font-mono text-[12px] font-bold uppercase tracking-widest2 text-ink transition-colors hover:bg-accent-hover"
              >
                Shop the collection
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/shop?category=Glass"
                className="inline-flex items-center gap-2 rounded-md border border-line bg-ink px-5 py-3.5 font-mono text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:border-paper-soft"
              >
                Glass spec
              </Link>
            </div>

            {/* Spec callouts */}
            <dl
              className="animate-rise mt-10 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:max-w-md md:max-w-lg md:grid-cols-3"
              style={{ animationDelay: '440ms' }}
            >
              <div>
                <dt className="label-mono">Surface</dt>
                <dd className="mt-1.5 font-display text-base font-bold text-paper">5mm tempered</dd>
              </div>
              <div>
                <dt className="label-mono">Edges</dt>
                <dd className="mt-1.5 font-display text-base font-bold text-paper">Stitched / polished</dd>
              </div>
              <div className="col-span-2 md:col-span-1">
                <dt className="label-mono">Warranty</dt>
                <dd className="mt-1.5 font-display text-base font-bold text-paper">1 year, no quibble</dd>
              </div>
            </dl>
          </div>

          {/* Hero product */}
          <div
            className="animate-fade relative md:col-span-5"
            style={{ animationDelay: '240ms' }}
          >
            <Link href={`/product/${hero.slug}`} className="group block">
              <div className="overflow-hidden rounded-md border border-line bg-surface">
                <ProductImage
                  name={hero.name}
                  accent={hero.accent}
                  category={hero.category}
                  image={hero.image}
                  className="aspect-[4/5] w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="label-accent">Featured</p>
                  <p className="mt-1 font-display text-xl font-bold text-paper">
                    {hero.name}
                  </p>
                </div>
                <Price
                  priceCents={hero.priceCents}
                  compareAtCents={hero.compareAtCents}
                  className="font-display text-xl font-bold text-paper"
                />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured edit ── */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-shell px-5 py-14 md:px-8 md:py-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="label-accent">Featured</p>
              <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
                This week&apos;s edit
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden shrink-0 font-mono text-[11px] uppercase tracking-widest2 text-paper-soft transition-colors hover:text-accent sm:block"
            >
              View all →
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:mt-10 md:grid-cols-4 md:gap-x-5 md:gap-y-10">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── Manifesto band ── */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-shell items-center gap-10 px-5 py-16 md:grid-cols-12 md:gap-12 md:px-8 md:py-24">
          <div className="md:col-span-7">
            <p className="label-accent">VL//Manifesto</p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-[1.05] text-balance md:text-5xl">
              Two pads.<br />Made properly.<br />
              <span className="text-accent">Built to last.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-paper-soft text-pretty">
              We make two pads — glass and cloth — and obsess over the surface, the
              base, the stitching, the edges. That&apos;s the whole catalogue, and
              that&apos;s the point.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-md border border-paper px-6 py-3 font-mono text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-paper hover:text-ink"
            >
              Shop everything
              <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="md:col-span-5">
            <div className="overflow-hidden rounded-md border border-line bg-ink">
              <ProductImage
                name={second.name}
                accent={second.accent}
                category={second.category}
                image={second.image}
                className="aspect-[5/6] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="mx-auto max-w-shell px-5 py-14 md:px-8 md:py-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="label-mono">Surfaces</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              Pick your weapon
            </h2>
          </div>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 md:gap-4">
          {categories.map((cat, i) => {
            const rep = all.find((p) => p.category === cat)
            return (
              <Reveal key={cat} delay={i * 70}>
                <Link
                  href={`/shop?category=${encodeURIComponent(cat)}`}
                  className="group relative block overflow-hidden rounded-md border border-line bg-surface"
                >
                  <ProductImage
                    name={cat}
                    accent={rep?.accent ?? '#262626'}
                    category={cat}
                    image={rep?.image}
                    className="aspect-[16/9] w-full transition-transform duration-700 ease-out group-hover:scale-[1.04] md:aspect-[5/3]"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-ink via-ink/40 to-transparent p-5">
                    <div className="w-full">
                      <p className="label-accent">{cat} series</p>
                      <div className="mt-1.5 flex items-baseline justify-between">
                        <span className="font-display text-2xl font-bold text-paper md:text-3xl">
                          {cat}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-widest2 text-paper-soft transition-colors group-hover:text-accent">
                          Explore →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ── Full collection ── */}
      <section className="mx-auto max-w-shell px-5 pb-6 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="label-mono">Inventory</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              The full rack
            </h2>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:mt-10 md:grid-cols-3 md:gap-x-5 md:gap-y-10 lg:grid-cols-4">
          {all.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Value props ── */}
      <section className="mx-auto mt-16 max-w-shell px-5 md:px-8">
        <div className="grid divide-y divide-line border-y border-line text-left sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { t: 'Free shipping', s: 'On every order over $50' },
            { t: 'Easy 30-day returns', s: 'Changed your mind? No trouble.' },
            { t: 'Built to last', s: '1-year warranty on every pad' },
          ].map((v) => (
            <div key={v.t} className="px-5 py-8 sm:px-6 sm:py-10">
              <p className="label-accent">Promise</p>
              <p className="mt-2 font-display text-xl font-bold text-paper">{v.t}</p>
              <p className="mt-1.5 text-sm text-paper-soft">{v.s}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
