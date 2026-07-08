import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Quality & testing' }

export default function SpecsPage() {
  return (
    <>
      <p className="label-accent">Made properly</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Quality &amp; testing
      </h1>
      <p>
        Every formula is manufactured to GMP standards and third-party tested,
        every batch. If we can&apos;t list the milligrams, it&apos;s not in the
        formula. Test reports are published on each product page.
      </p>

      <div className="mt-10 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-[11px] font-semibold uppercase tracking-widest2 text-ink-soft">
            <tr>
              <th className="px-5 py-3">Standard</th>
              <th className="px-5 py-3">What it means</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink">
            <tr>
              <td className="px-5 py-3 font-medium">Manufacturing</td>
              <td className="px-5 py-3">
                GMP-certified facility, cold-processed where indicated to
                preserve potency.
              </td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Batch testing</td>
              <td className="px-5 py-3">
                Every batch tested by an independent lab for potency, purity,
                and contaminants. Results linked on each product page.
              </td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Sourcing</td>
              <td className="px-5 py-3">
                Actives sourced from suppliers with documented Certificates of
                Analysis. No proprietary blends.
              </td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Label transparency</td>
              <td className="px-5 py-3">
                Every ingredient and dose is on the label — including the ones
                you already knew about.
              </td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Free from</td>
              <td className="px-5 py-3">
                Artificial colours and flavours, high-fructose corn syrup, gluten,
                most common allergens (check the label per formula).
              </td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Storage</td>
              <td className="px-5 py-3">
                Cool, dry place. Bottles are amber or opaque where actives are
                light-sensitive.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-[12px] text-ink-mute">
        Placeholder — swap for the finalised sourcing, manufacturing, and testing
        specifics of your line before launch.
      </p>

      <p className="mt-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-accent-hover"
        >
          Shop the line <span aria-hidden>→</span>
        </Link>
      </p>
    </>
  )
}
