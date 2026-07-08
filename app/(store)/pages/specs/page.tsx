import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'The science' }

export default function SpecsPage() {
  return (
    <>
      <p className="label-accent">The science</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Formulation &amp; delivery platform
      </h1>
      <p>
        Retatrutide is a large peptide (molecular weight ~4,700 Da) with agonist
        activity at the GIP, GLP-1, and glucagon receptors. Its size and
        susceptibility to enzymatic degradation have historically limited it to
        injectable formulations. Our sublingual formulation is engineered
        specifically around this delivery challenge.
      </p>

      <div className="mt-10 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-[11px] font-semibold uppercase tracking-widest2 text-ink-soft">
            <tr>
              <th className="px-5 py-3">Attribute</th>
              <th className="px-5 py-3">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink">
            <tr>
              <td className="px-5 py-3 font-medium">Active peptide</td>
              <td className="px-5 py-3">Retatrutide — triple agonist (GIP · GLP-1 · Glucagon)</td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Delivery platform</td>
              <td className="px-5 py-3">
                Self-Nanoemulsifying Drug Delivery System (SNEDDS) — spontaneously
                forms peptide-loaded ultra-fine droplets on contact with saliva.
              </td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Route</td>
              <td className="px-5 py-3">Sublingual (under the tongue)</td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Dose</td>
              <td className="px-5 py-3">6 mg per dose (2.5 mg per metered spray, two sprays)</td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Presentation</td>
              <td className="px-5 py-3">30 mL amber glass bottle with pump-metered sublingual sprayer</td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Excipients</td>
              <td className="px-5 py-3">
                Pharmaceutical-grade only — all listed in the FDA Inactive
                Ingredient Database. Non-irritating formulation designed for
                repeated sublingual use.
              </td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Manufacturing</td>
              <td className="px-5 py-3">GMP-standard, engineered for industrial-scale production</td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Testing</td>
              <td className="px-5 py-3">Independent third-party lab, every batch — potency, purity, contaminants</td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Storage</td>
              <td className="px-5 py-3">Room temperature. No refrigeration required.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-12 font-display text-xl font-bold text-ink">
        Why sublingual works for a peptide this size
      </h2>
      <p>
        A ~4,700 Da peptide will not survive the stomach. Even if it did, first-pass
        hepatic metabolism would inactivate it before it reached systemic
        circulation. The sublingual mucosa bypasses both barriers: it is highly
        vascularized, drains directly into the internal jugular vein, and does
        not expose the drug to digestive enzymes. What was previously an
        injection-only molecule becomes a two-spray at-home dose.
      </p>

      <p className="mt-10 text-[12px] text-ink-mute">
        Placeholder — swap for the finalised technical specifications, batch
        certificates of analysis, and any peer-reviewed publications from the
        client's regulatory affairs team before launch.
      </p>

      <p className="mt-8">
        <Link
          href="/product/retatrutide-sublingual"
          className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-accent-hover"
        >
          View the product <span aria-hidden>→</span>
        </Link>
      </p>
    </>
  )
}
