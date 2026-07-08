import Link from 'next/link'
import Image from 'next/image'
import { ProductCard } from '@/components/ProductCard'
import { Reveal } from '@/components/Reveal'
import { getAllProducts } from '@/lib/products'
import { site } from '@/lib/site'

export const revalidate = 60

// Editorial constants — all copy here is a starting draft. Client's medical +
// legal team must review before launch. Do not make efficacy or clinical claims
// beyond what regulatory review permits in your jurisdiction.

const EDITORIAL = [
  {
    src: '/product/retatrutide-hero.png',
    alt: 'Retatrutide Sublingual bottle with product details',
    label: 'The bottle',
    heading: 'Retatrutide Sublingual',
    body: '30 mL amber glass. Pump-metered sublingual spray. 6 mg per dose.',
  },
  {
    src: '/product/retatrutide-editorial.png',
    alt: 'Retatrutide Sublingual against a molecular-pattern background',
    label: 'The peptide',
    heading: 'A ~4,700 Da peptide',
    body: 'Triple agonist — GIP, GLP-1, and Glucagon receptors, in one molecule.',
  },
  {
    src: '/product/retatrutide-pair.png',
    alt: 'Two Retatrutide Sublingual bottles',
    label: 'The dose',
    heading: '2.5 mg per spray',
    body: 'Two sprays under the tongue. That is the whole dose. No syringe, no clinic.',
  },
]

const FORM_BENEFITS = [
  {
    title: 'Nanoemulsion protects the peptide',
    body: 'The SNEDDS platform encapsulates retatrutide the moment it hits saliva, shielding it from enzymatic degradation.',
  },
  {
    title: 'Rapid sublingual uptake',
    body: 'Ultra-fine droplets cross the vascularized oral mucosa directly into systemic circulation.',
  },
  {
    title: 'Bypasses first-pass metabolism',
    body: 'Skips the stomach, skips the liver — the active ingredient reaches the bloodstream intact.',
  },
  {
    title: 'Non-invasive, at-home',
    body: 'No cold chain, no refrigeration reminders, no needles. Two sprays under the tongue.',
  },
]

const HOW_IT_WORKS = [
  { name: 'Spray under the tongue', blurb: 'Two metered sprays. Hold for 30 seconds.' },
  { name: 'Nanoemulsion forms', blurb: 'Peptide-loaded droplets, instantly, on contact with saliva.' },
  { name: 'Crosses the mucosa', blurb: 'The sublingual lining is highly vascularized — uptake is direct.' },
  { name: 'Systemic delivery', blurb: 'The active peptide reaches the bloodstream. No injection.' },
]

const CLINICAL_NOTES = [
  {
    stat: '−6 lb',
    label: 'over 63 days',
    body: 'A single healthy volunteer, alternating 6 mg BID and 6 mg QD across nine weeks.',
  },
  {
    stat: '−3.4%',
    label: 'total body weight',
    body: 'From 178 lb (80.7 kg) at baseline to 172 lb (78.0 kg) at day 63.',
  },
  {
    stat: '0',
    label: 'reported GI adverse events',
    body: 'No nausea, vomiting, bloating, or abdominal pain over the observation period.',
  },
]

const FAQ = [
  {
    q: 'What is retatrutide?',
    a: 'Retatrutide is an investigational triple-agonist peptide — it activates the GIP, GLP-1, and glucagon receptors. It is being studied for weight and metabolic support and is currently only available in the U.S. as an injectable in clinical trials.',
  },
  {
    q: 'How is a sublingual formulation different from an injection?',
    a: "Injections bypass the stomach by design — they have to, because retatrutide's ~4,700 Da peptide is too fragile to survive digestion. Our SNEDDS platform achieves the same goal a different way: it forms a protective nanoemulsion in the mouth, so the peptide crosses the sublingual mucosa directly into circulation. No needle, no refrigeration, no clinic visit.",
  },
  {
    q: 'What is SNEDDS?',
    a: 'Self-Nanoemulsifying Drug Delivery System — a pharmaceutical platform that spontaneously forms ultra-fine droplets on contact with fluid. It is used to deliver drugs (peptides, poorly-soluble small molecules) that would otherwise be degraded or poorly absorbed through the oral route.',
  },
  {
    q: 'How do I take it?',
    a: 'Two metered sprays under the tongue, once or twice a day, per your provider\'s direction. Hold for 30 seconds before swallowing so the peptide has time to cross the mucosa.',
  },
  {
    q: 'Is this a substitute for medical care?',
    a: 'No. This product should be used only as part of a supervised metabolic-health plan. Consult a licensed clinician before starting, especially if you are pregnant, nursing, taking medication, or managing a medical condition.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Placeholder — this depends on the jurisdictional model chosen by Vion Labs. Client to finalise shipping regions + jurisdictional restrictions before launch.',
  },
]

export default async function HomePage() {
  const all = await getAllProducts()
  const hero = all[0]

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
            {site.brand}// Sublingual peptide therapy
          </p>
          <h1
            className="animate-rise mt-6 max-w-5xl font-display text-[clamp(2.75rem,10vw,7.5rem)] font-bold leading-[0.9] tracking-tightest text-balance text-paper"
            style={{ animationDelay: '120ms' }}
          >
            Peptide therapy.
            <br />
            <span className="text-ice">Without the needle.</span>
          </h1>
          <p
            className="animate-rise mt-8 max-w-2xl text-base leading-relaxed text-paper-soft md:text-lg"
            style={{ animationDelay: '220ms' }}
          >
            The first non-invasive sublingual retatrutide — a triple-agonist peptide (GIP · GLP-1 · Glucagon) delivered under the tongue. Bypasses injections, refrigeration, and clinic visits.
          </p>
          <div
            className="animate-rise mt-10 flex flex-wrap items-center gap-3"
            style={{ animationDelay: '320ms' }}
          >
            <Link
              href={hero ? `/product/${hero.slug}` : '/shop'}
              className="inline-flex items-center gap-2 rounded-md bg-ice px-7 py-4 text-[12px] font-bold uppercase tracking-widest2 text-navy transition-colors hover:bg-paper"
            >
              Order Retatrutide Sublingual
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="#how-it-works"
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
                Delivery
              </dt>
              <dd className="mt-2 font-display text-lg font-bold text-paper">Sublingual</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-widest2 text-paper-mute">
                Active
              </dt>
              <dd className="mt-2 font-display text-lg font-bold text-paper">Retatrutide 6 mg</dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="text-[10px] font-semibold uppercase tracking-widest2 text-paper-mute">
                Testing
              </dt>
              <dd className="mt-2 font-display text-lg font-bold text-paper">Third-party, per batch</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── Editorial 3-up (product shots) ────────────────────────────── */}
      <section className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
            The formulation
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tightest text-balance text-ink md:text-5xl">
            Engineered to be taken.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3 md:gap-6">
          {EDITORIAL.map((tile, i) => (
            <Reveal key={tile.label} delay={i * 90}>
              <div className="group block">
                <div className="overflow-hidden rounded-lg border border-line bg-surface">
                  <Image
                    src={tile.src}
                    alt={tile.alt}
                    width={1200}
                    height={720}
                    className="aspect-[5/3] w-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-widest2 text-ink-mute">
                  {tile.label}
                </p>
                <p className="mt-1 font-display text-xl font-bold text-ink">{tile.heading}</p>
                <p className="mt-1 text-sm text-ink-soft">{tile.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── "Form is the dose" — SNEDDS science ──────────────────────── */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-shell items-center gap-12 px-5 py-20 md:grid-cols-12 md:gap-16 md:px-8 md:py-28">
          <div className="md:col-span-6 md:order-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
              SNEDDS delivery platform
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tightest text-balance text-ink md:text-5xl">
              The peptide is only
              <br />
              as good as its delivery.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-soft">
              Retatrutide is a ~4,700 Dalton peptide — too large to survive digestion, too fragile for a pill. Injection works, but it's cold-chain, painful, and clinical. Our proprietary Self-Nanoemulsifying Drug Delivery System reaches the bloodstream a different way.
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
              <Image
                src="/product/retatrutide-portrait.png"
                alt="Retatrutide Sublingual bottle"
                width={1024}
                height={1024}
                className="aspect-square w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works — 4 steps ────────────────────────────────────── */}
      <section id="how-it-works" className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
              How it works
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tightest text-balance text-ink md:text-5xl">
              Four steps.
              <br />
              No injection.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-ink-soft">
            Two metered sprays under the tongue. Hold for 30 seconds. The nanoemulsion does the rest.
          </p>
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 md:mt-14 md:grid-cols-4 md:gap-4">
          {HOW_IT_WORKS.map((step, i) => (
            <Reveal key={step.name} delay={i * 60}>
              <div className="flex h-full flex-col justify-between rounded-lg border border-line bg-paper p-6 md:p-7">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest2 text-ink-mute">
                    Step 0{i + 1}
                  </span>
                  <p className="mt-4 font-display text-lg font-bold text-ink md:text-xl">
                    {step.name}
                  </p>
                  <p className="mt-2 text-sm text-ink-soft">{step.blurb}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Featured product (single-SKU) ─────────────────────────────── */}
      {hero && (
        <section className="border-t border-line bg-surface-2">
          <div className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
                  Available now
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold text-ink md:text-4xl">
                  Order the formulation
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden shrink-0 text-[11px] font-semibold uppercase tracking-widest2 text-ink-soft transition-colors hover:text-accent sm:block"
              >
                Product page →
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-4">
              <Reveal delay={0}>
                <ProductCard product={hero} />
              </Reveal>
              <div className="md:col-span-3 rounded-lg border border-line bg-paper p-6 md:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-widest2 text-ink-mute">
                  {hero.category}
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-ink md:text-3xl">
                  {hero.name}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
                  {hero.shortDescription}
                </p>
                <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                  {(hero.details ?? []).slice(0, 6).map((d) => (
                    <li key={d} className="flex gap-3 text-sm text-ink-soft">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/product/${hero.slug}`}
                  className="mt-8 inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-accent-hover"
                >
                  View product
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Preliminary observations (replaces testimonials) ──────────── */}
      <section className="mx-auto max-w-shell px-5 py-20 md:px-8 md:py-28">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
            Preliminary observations
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] tracking-tightest text-balance text-ink md:text-5xl">
            Nine weeks.
            <br />
            One healthy volunteer.
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-ink-soft md:text-base">
            Initial observations from a single healthy volunteer receiving the proprietary sublingual retatrutide formulation over a 63-day period. Alternating dosing: 6 mg twice daily (weeks 1, 3, 5, 7, 9) and 6 mg once daily (weeks 2, 4, 6, 8).
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-5">
          {CLINICAL_NOTES.map((note, i) => (
            <Reveal key={note.label} delay={i * 80}>
              <figure className="flex h-full flex-col justify-between rounded-lg border border-line bg-paper p-6 md:p-8">
                <div>
                  <p className="font-display text-5xl font-bold tracking-tightest text-ink md:text-6xl">
                    {note.stat}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-widest2 text-accent">
                    {note.label}
                  </p>
                </div>
                <p className="mt-6 text-sm leading-relaxed text-ink-soft">{note.body}</p>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-[12px] text-ink-mute">
          Placeholder observational data — not a controlled clinical trial and not intended to imply clinical efficacy. Individual results will vary. Replace with peer-reviewed data and appropriate regulatory language before launch.
        </p>
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
                <Link href="/pages/contact" className="underline underline-offset-4 hover:text-accent">
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
              A peptide you can actually take.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-paper-soft md:text-lg">
              Two sprays under the tongue. That's the whole thing.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={hero ? `/product/${hero.slug}` : '/shop'}
                className="inline-flex items-center gap-2 rounded-md bg-ice px-7 py-4 text-[12px] font-bold uppercase tracking-widest2 text-navy transition-colors hover:bg-paper"
              >
                Order the formulation
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/pages/contact"
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
              { t: 'Pharmaceutical grade', s: 'FDA IID-listed excipients only' },
              { t: 'Third-party tested', s: 'Independent lab, every batch' },
              { t: 'Non-invasive', s: 'No injection, no cold chain, no clinic' },
            ].map((v) => (
              <div key={v.t} className="px-2 py-8 sm:px-6 sm:py-10">
                <p className="text-[11px] font-semibold uppercase tracking-widest2 text-accent">
                  Standard
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
