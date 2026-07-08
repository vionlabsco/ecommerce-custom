import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = { title: 'Guarantee' }

export default function WarrantyPage() {
  return (
    <>
      <p className="label-accent">30-Day Guarantee</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Our guarantee
      </h1>

      <p>
        If your first bottle doesn&apos;t change something for you, send it back
        — even empty — within <strong>30 days</strong> of delivery for a full
        refund. No forms, no back-and-forth. One email is all it takes.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Why we offer this</h2>
      <p>
        Supplements only work if you actually take them, and you&apos;ll only
        take them if they work. We&apos;d rather refund a bottle than have you
        stuck with something that doesn&apos;t fit.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">What&apos;s covered</h2>
      <ul className="ml-5 list-disc">
        <li>Any first-time purchase of any formula</li>
        <li>Full or partial bottles — even empty</li>
        <li>Within 30 days of the delivery date</li>
      </ul>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">What&apos;s not covered</h2>
      <ul className="ml-5 list-disc">
        <li>Repeat purchases (contact us — we&apos;ll usually still help)</li>
        <li>Products purchased from unauthorised resellers</li>
        <li>Bulk / wholesale orders</li>
      </ul>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">How to claim</h2>
      <p>
        Email{' '}
        <a href={`mailto:${site.contactEmail}`} className="text-accent hover:underline">
          {site.contactEmail}
        </a>{' '}
        with your order number and a one-line note on what didn&apos;t work.
        We&apos;ll confirm within 1 business day and refund within 5 business
        days of receiving the return.
      </p>

      <p className="mt-10 text-[12px] text-ink-mute">
        These statements have not been evaluated by the FDA. Products are not
        intended to diagnose, treat, cure, or prevent any disease. Placeholder —
        replace with finalised regulatory language before launch.
      </p>
    </>
  )
}
