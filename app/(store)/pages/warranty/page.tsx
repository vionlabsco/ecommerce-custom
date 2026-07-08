import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = { title: 'Guarantee' }

export default function WarrantyPage() {
  return (
    <>
      <p className="label-accent">Guarantee</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Product guarantee
      </h1>

      <p>
        Every bottle is manufactured to GMP standards and independently tested
        for potency and purity before it ships. If a bottle arrives damaged, is
        past its printed use-by date, or fails our internal QC, we replace it at
        no cost — email{' '}
        <a href={`mailto:${site.contactEmail}`} className="text-accent hover:underline">
          {site.contactEmail}
        </a>{' '}
        with your order number and a photo of the issue.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">
        Refunds and returns
      </h2>
      <p>
        Because this is a pharmaceutical-grade sublingual formulation, opened
        bottles cannot be returned once dispensed — a limitation shared by every
        legitimate pharmacy and compounding operation. Unopened bottles may be
        returned within 30 days of delivery for a full refund, less shipping.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">
        Damaged or defective shipments
      </h2>
      <ul className="ml-5 list-disc">
        <li>Bottle arrives cracked, leaking, or with a broken seal → replaced at no cost</li>
        <li>Bottle arrives past the printed use-by date → replaced at no cost</li>
        <li>Bottle fails internal QC (fails an independent lab retest) → full refund</li>
      </ul>

      <p className="mt-10 text-[12px] text-ink-mute">
        Placeholder — regulatory and refund language must be finalised by the
        client's legal team based on the jurisdiction(s) of sale and the
        applicable pharmacy / compounding rules. These statements have not been
        evaluated by the FDA. Products are not intended to diagnose, treat, cure,
        or prevent any disease. Consult a licensed clinician before use.
      </p>
    </>
  )
}
