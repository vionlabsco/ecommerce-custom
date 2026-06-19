import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Warranty' }

export default function WarrantyPage() {
  return (
    <>
      <p className="label-accent">Built to last</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Warranty
      </h1>

      <p>
        Every Vionlabs pad is covered by a <strong>1-year limited warranty</strong>{' '}
        against manufacturing defects. If anything goes wrong with normal use —
        delamination, edge fray, surface defects — we&apos;ll replace it.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">What&apos;s covered</h2>
      <ul className="ml-5 list-disc">
        <li>Surface coating defects (peeling, micro-cracks)</li>
        <li>Base adhesion failure under normal desk conditions</li>
        <li>Stitching unravel on the cloth pad within 12 months</li>
      </ul>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">What&apos;s not covered</h2>
      <ul className="ml-5 list-disc">
        <li>Cosmetic wear from normal use</li>
        <li>Damage from sharp objects, chemicals, or excessive heat</li>
        <li>Products purchased from unauthorised resellers</li>
      </ul>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">How to claim</h2>
      <p>
        Email{' '}
        <a href="mailto:hello@vionlabs.co" className="text-accent hover:underline">
          hello@vionlabs.co
        </a>{' '}
        with your order number and a photo of the issue. We&apos;ll confirm the
        claim within 2 business days and ship the replacement at no cost.
      </p>
    </>
  )
}
