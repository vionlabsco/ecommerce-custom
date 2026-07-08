import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <>
      <p className="label-accent">Our Story</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Small formulas. Made properly.
      </h1>
      <p>
        {site.brand} is a small formula-first studio building daily supplements
        for the body&apos;s actual chemistry. Each blend is dialed for a single
        outcome — sleep, focus, immunity, energy, recovery, or the daily baseline
        — and dosed by the science of what your body actually uses.
      </p>
      <p>
        We don&apos;t do everything-supplements. We don&apos;t hide behind
        proprietary blends. Every ingredient and dose is on the label; every
        batch is third-party tested and the results are public.
      </p>
      <p>
        The line is small on purpose. Six formulas, one job each, no filler.
        That&apos;s the whole catalogue and that&apos;s the point.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Where we ship</h2>
      <p>
        Formulated in-house. Manufactured and third-party tested to GMP standards.
        Most orders leave the warehouse within 1–2 business days.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Stay in touch</h2>
      <p>
        The fastest way to hear about a new formula is the newsletter at the
        bottom of any page — one email a month, unsubscribe with one click. Or
        reach us at{' '}
        <a href={`mailto:${site.contactEmail}`} className="text-accent hover:underline">
          {site.contactEmail}
        </a>
        .
      </p>
    </>
  )
}
