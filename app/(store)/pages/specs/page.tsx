import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Spec sheet' }

export default function SpecsPage() {
  return (
    <>
      <p className="label-accent">Built for performance</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Spec sheet
      </h1>
      <p>
        Both Vionlabs pads are tuned for fast, controlled tracking at any DPI.
        Here&apos;s exactly what they&apos;re made of.
      </p>

      <div className="mt-10 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-[11px] font-semibold uppercase tracking-widest2 text-ink-soft">
            <tr>
              <th className="px-5 py-3">Spec</th>
              <th className="px-5 py-3">Glass Mouse Pad</th>
              <th className="px-5 py-3">Cloth Mouse Pad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-ink">
            <tr>
              <td className="px-5 py-3 font-medium">Surface</td>
              <td className="px-5 py-3">5mm tempered glass, micro-etched</td>
              <td className="px-5 py-3">Micro-weave cloth, low-friction</td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Base</td>
              <td className="px-5 py-3">Full anti-slip silicone</td>
              <td className="px-5 py-3">Natural rubber, anti-slip</td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Edges</td>
              <td className="px-5 py-3">Rounded, polished</td>
              <td className="px-5 py-3">Stitched, anti-fray</td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Sizes</td>
              <td className="px-5 py-3">Square / Rectangle</td>
              <td className="px-5 py-3">Square / Rectangle</td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Care</td>
              <td className="px-5 py-3">Wipe clean with damp cloth</td>
              <td className="px-5 py-3">Machine washable, air dry</td>
            </tr>
            <tr>
              <td className="px-5 py-3 font-medium">Warranty</td>
              <td className="px-5 py-3">1 year</td>
              <td className="px-5 py-3">1 year</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-8">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 rounded-md bg-accent px-6 py-3 text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-accent-hover"
        >
          Shop the collection <span aria-hidden>→</span>
        </Link>
      </p>
    </>
  )
}
