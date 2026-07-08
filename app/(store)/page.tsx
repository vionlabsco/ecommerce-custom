import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { ProductImage } from '@/components/ProductImage'
import { Reveal } from '@/components/Reveal'
import { getAllProducts, getCategories } from '@/lib/products'
import { site } from '@/lib/site'

export const revalidate = 60

// Placeholder editorial content — client replaces via admin or by editing this file.
const GOAL_TILES = [
  { name: 'Sleep', blurb: 'Fall asleep. Stay asleep.' },
  { name: 'Focus', blurb: 'Clean, jitter-free clarity.' },
  { name: 'Immunity', blurb: 'Baseline defence, daily.' },
  { name: 'Energy', blurb: 'Sustained. No crash.' },
  { name: 'Recovery', blurb: 'For the day after.' },
  { name: 'Daily', blurb: 'The essentials, one dose.' },
]

const FORM_BENEFITS = [
  { title: 'Bioavailable form', body: 'Micro-dosed, fast-release. No horse pills.' },
  { title: 'Clean label', body: 'No fillers, no dyes, no proprietary blends.' },
  { title: 'Made for daily', body: 'Small enough to actually take. Every day.' },
  { title: 'Third-party tested', body: 'Every batch, published, no exceptions.' },
]

const TESTIMONIALS = [
  {
    quote: 'It just… works. I stopped noticing I was taking it, and noticed I was sleeping.',
    who: 'Ana R.',
    role: 'On Sleep, 4 months',
  },
  {
    quote: 'The first supplement my partner and I actually finished the bottle of.',
    who: 'Devon K.',
    role: 'On Daily, 6 months',
  },
  {
    quote: 'Focus without the coffee shakes. Genuinely surprised.',
    who: 'Priya M.',
    role: 'On Focus, 2 months',
  },
]

const FAQ = [
  {
    q: 'How long until I feel it?',
    a: 'Most formulas take 2–3 weeks of daily use before you notice the effect. Sleep and focus tend to be quicker; recovery and immunity are slower builds.',
  },
  {
    q: "What's actually in it?",
    a: 'Every ingredient and dose is on the label. No proprietary blends, no filler names. If we can\'t list the milligrams, it\'s not in the formula.',
  },
  {
    q: 'Do I need to take it every day?',
    a: 'Yes — these are daily formulas, dosed for a compounding effect. Skipping days undoes the build-up.',
  },
  {
    q: 'Is it third-party tested?',
    a: 'Every batch is tested by an independent lab for potency, purity, and contaminants. Test results are linked on each product page.',
  },
  {
    q: 'Shipping and returns?',
    a: 'Free shipping over $50. If your first bottle doesn\'t work for you, send it back — even empty — for a full refund within 30 days.',
  },
]

export default async function HomePage() {
  const all = await getAllProducts()
  const categories = await getCategories()
  const featured = all.filter((p) => p.featured).slice(0, 4)
  const editorial = (featured.length > 0 ? featured : all).slice(0, 3)
  const heroAccent = all.find((p) => p.featured) ?? all[0]

  return (
    <>
      {/* ── Hero — dark navy ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy text-paper">
        <div className="absolute inset-0 bg-grid-dark opacity-70" />
        <div className="relative mx-auto max-w-shell px-5 pb-20 pt-20 md:px-8 md:pb-32 md:pt-28">
          <p
            className="animate-rise text-[11px] font-semibold uppercase tracking-widest2 text-ice"
            style={{ animationDelay: '40ms' }}
          >
            {site.brand}// Daily Formulas
          </p>
          <h1
            className="animate-rise mt-6 max-w-5xl font-display text-[clamp(2.75rem,10vw,7.5rem)] font-bold leading-[0.9] tracking-tightest text-balance text-paper"
            style={{ animationDelay: '120ms' }}
          >
            Small formulas.
            <br />
            <span className="text-ice">Made to absorb.</span>
          </h1>
          <p
            className="animate-rise mt-8 max-w-lg text-base leading-relaxed text-paper-soft md:text-lg"
            style={{ animationDelay: '220ms' }}
          >
            A minimalist line of daily supplements — each blend dialed for a single outcome, dosed by the science of what your body actually uses.
          </p>
          <div
            className="animate-rise mt-10 flex flex-wrap items-center gap-3"
            style={{ animationDelay: '320ms' }}
          >
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-md bg-ice px-7 py-4 text-[12px] font-bold uppercase tracking-widest2 text-navy transition-colors hover:bg-paper"
            >
              Shop the line
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="#form"
              className="inline-flex items-center gap-2 rounded-md border border-paper/25 px-6 py-4 text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:border-ice hover:text-ice"
            >
              How it works
            </Link>
          </div>

          {/* Bottom strip — small proof points */}
          <dl
            className="animate-rise mt-16 grid max-w-3xl grid-cols-2 gap-6 border-t border-paper/15 pt-8 sm:grid-cols-3"
            style={{ animationDelay: '440ms' }}
          >
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-widest2 text-paper-mute">
                Bioavailability
              </dt>
              <dd className="mt-2 font-display text-lg font-bold text-paper">
                Micro-dosed
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-widest2 text-paper-mute">
                Testing
              </dt>
              <dd className="mt-2 font-display text-lg font-bold text-paper">
                Third-party, per batch
              </dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-[10px] font-semibold uppercase tracking-widest2 text-paper-mute">
                Guarantee
              </dt>
              <dd className="mt-2 font-display text-lg font-bold text-paper">
                30-day, no questions
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── Editorial 3-up ────────────────────────────────────────────── */}
      {editorial.length > 0 && (
        <section className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
              The Line
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tightest text-balance text-ink md:text-5xl">
              Built for the body&apos;s
              <br />
              actual chemistry.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
            {editorial.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <Link href={`/product/${p.slug}`} className="group block">
                  <div className="overflow-hidden rounded-lg border border-line bg-surface">
                    <ProductImage
                      name={p.name}
                      accent={p.accent}
                      category={p.category}
                      image={p.image}
                      className="aspect-[4/5] w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                  </div>
                  <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest2 text-ink-mute">
                    {p.category}
                  </p>
                  <p className="mt-1 font-display text-xl font-bold text-ink">{p.name}</p>
                  <p className="mt-1 text-sm text-ink-soft">{p.shortDescription}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── "Form is the dose" ────────────────────────────────────────── */}
      <section id="form" className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-shell items-center gap-12 px-5 py-20 md:grid-cols-12 md:gap-16 md:px-8 md:py-28">
          <div className="md:col-span-6 md:order-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
              Form is the dose
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tightest text-balance text-ink md:text-5xl">
              What good is a formula
              <br />
              if your body can&apos;t use it?
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
              Most supplements are dosed for the label, not for absorption. Ours are engineered around what actually crosses into your bloodstream — and skip everything that doesn&apos;t.
            </p>
            <ul className="mt-8 space-y-5">
              {FORM_BENEFITS.map((b) => (
                <li key={b.title} className="flex gap-4">
                  <span className="mt-1.5 h-1.5 w-6 shrink-0 rounded-full bg-accent" aria-hidden />
                  <div>
                    <p className="font-display text-base font-bold text-ink">{b.title}</p>
                    <p className="mt-1 text-sm text-ink-soft">{b.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-6 md:order-1">
            <div className="overflow-hidden rounded-lg border border-line bg-paper">
              <ProductImage
                name={heroAccent?.name ?? site.brand}
                accent={heroAccent?.accent ?? '#1e3a8a'}
                category={heroAccent?.category ?? 'Formula'}
                image={heroAccent?.image}
                className="aspect-[5/6] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Six goals ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
              Six goals
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tightest text-balance text-ink md:text-5xl">
              One formula line.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-ink-soft">
            Pick the one that matches what you&apos;re actually chasing. Each is a single, focused blend — no everything-supplements.
          </p>
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 md:mt-14 md:grid-cols-3 md:gap-4">
          {GOAL_TILES.map((tile, i) => {
            const catMatch = categories.find(
              (c) => c.toLowerCase() === tile.name.toLowerCase(),
            )
            const href = catMatch
              ? `/shop?category=${encodeURIComponent(catMatch)}`
              : '/shop'
            return (
              <Reveal key={tile.name} delay={i * 60}>
                <Link
                  href={href}
                  className="group flex h-full flex-col justify-between rounded-lg border border-line bg-paper p-6 transition-colors hover:border-accent md:p-7"
                >
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest2 text-ink-mute">
                      0{i + 1}
                    </span>
                    <p className="mt-4 font-display text-2xl font-bold text-ink md:text-3xl">
                      {tile.name}
                    </p>
                    <p className="mt-2 text-sm text-ink-soft">{tile.blurb}</p>
                  </div>
                  <span className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest2 text-accent">
                    Shop {tile.name.toLowerCase()}
                    <span aria-hidden className="transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ── Featured products (only if catalog present) ───────────────── */}
      {featured.length > 0 && (
        <section className="border-t border-line bg-surface-2">
          <div className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
                  Featured
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold text-ink md:text-4xl">
                  This month&apos;s edit
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden shrink-0 text-[11px] font-semibold uppercase tracking-widest2 text-ink-soft transition-colors hover:text-accent sm:block"
              >
                View all →
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 md:gap-x-5 md:gap-y-10">
              {featured.map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
            In their words
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tightest text-balance text-ink md:text-5xl">
            Real outcomes,
            <br />
            in their own words.
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.who} delay={i * 80}>
              <figure className="flex h-full flex-col justify-between rounded-lg border border-line bg-paper p-6 md:p-8">
                <blockquote className="font-display text-lg font-medium leading-snug text-balance text-ink md:text-xl">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-8 border-t border-line pt-4">
                  <p className="font-display text-sm font-bold text-ink">{t.who}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-widest2 text-ink-mute">
                    {t.role}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
                FAQ
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tightest text-balance text-ink md:text-5xl">
                Asked and answered.
              </h2>
              <p className="mt-6 text-sm text-ink-soft">
                Something else on your mind?{' '}
                <Link href="/contact" className="underline underline-offset-4 hover:text-accent">
                  Send us a note
                </Link>
                .
              </p>
            </div>
            <div className="md:col-span-8">
              <ul className="divide-y divide-line border-y border-line">
                {FAQ.map((f) => (
                  <li key={f.q}>
                    <details className="group">
                      <summary className="flex cursor-pointer items-center justify-between gap-6 py-6 font-display text-base font-bold text-ink transition-colors hover:text-accent md:text-lg">
                        {f.q}
                        <span
                          aria-hidden
                          className="text-2xl font-light text-ink-mute transition-transform group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <div className="pb-6 pr-10 text-sm leading-relaxed text-ink-soft md:text-base">
                        {f.a}
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA card ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
        <div className="relative overflow-hidden rounded-2xl bg-navy px-8 py-16 text-center md:px-16 md:py-24">
          <div className="absolute inset-0 bg-grid-dark opacity-60" />
          <div className="relative mx-auto max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-widest2 text-ice">
              Ready when you are
            </p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-[1.02] tracking-tightest text-balance text-paper md:text-6xl">
              Ready to feel the difference?
            </h2>
            <p className="mt-6 text-base leading-relaxed text-paper-soft md:text-lg">
              Start with one formula. If the first bottle doesn&apos;t change something, send it back.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-md bg-ice px-7 py-4 text-[12px] font-bold uppercase tracking-widest2 text-navy transition-colors hover:bg-paper"
              >
                Shop the line
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-md border border-paper/25 px-6 py-4 text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:border-ice hover:text-ice"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Promise strip ─────────────────────────────────────────────── */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-shell px-5 md:px-8">
          <div className="grid divide-y divide-line text-left sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { t: 'Free shipping', s: 'On every order over $50' },
              { t: '30-day returns', s: 'Empty bottle, no questions' },
              { t: 'Made properly', s: 'Third-party tested every batch' },
            ].map((v) => (
              <div key={v.t} className="px-2 py-8 sm:px-6 sm:py-10">
                <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
                  Promise
                </p>
                <p className="mt-2 font-display text-xl font-bold text-ink">{v.t}</p>
                <p className="mt-1.5 text-sm text-ink-soft">{v.s}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
