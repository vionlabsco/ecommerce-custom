import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = { title: 'Shipping & returns' }

export default function ShippingReturnsPage() {
  return (
    <>
      <p className="label-accent">Policies</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Shipping & returns
      </h1>
      <p className="text-[12px] text-ink-mute">
        Placeholder — replace ship-from region, carriers, and rates with your
        finalised logistics setup before launch.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Where we ship</h2>
      <p>
        {site.brand} ships nationwide. Most orders leave the warehouse within
        1–2 business days. Free standard shipping on orders over $50.
      </p>

      <h3 className="mt-6 font-display text-base font-bold text-ink">Domestic</h3>
      <ul className="ml-5 list-disc">
        <li>Standard — 3–5 business days</li>
        <li>Express — 1–2 business days (rate at checkout)</li>
      </ul>

      <h3 className="mt-6 font-display text-base font-bold text-ink">International</h3>
      <ul className="ml-5 list-disc">
        <li>Standard — 7–14 business days</li>
        <li>Any duties/taxes at the border are the recipient&apos;s responsibility</li>
      </ul>

      <p>
        Once your order ships you&apos;ll receive a tracking link by email. If
        the tracking page hasn&apos;t updated within 48 hours of shipment,{' '}
        <a href="/pages/contact" className="text-accent hover:underline">
          get in touch
        </a>
        .
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Returns</h2>
      <p>
        Unopened bottles can be returned within <strong>30 days</strong> of
        delivery for a full refund. For your first purchase of any formula, we
        accept opened and even empty bottles — see our{' '}
        <a href="/pages/warranty" className="text-accent hover:underline">
          30-day guarantee
        </a>
        .
      </p>
      <p>
        Email us at{' '}
        <a href={`mailto:${site.contactEmail}`} className="text-accent hover:underline">
          {site.contactEmail}
        </a>{' '}
        with your order number to start a return. We&apos;ll send a prepaid
        return label and process your refund within 5 business days of receiving
        the package.
      </p>

      <p className="text-[12px] text-ink-mute">
        Last updated: 2026. We may update this policy from time to time.
      </p>
    </>
  )
}
