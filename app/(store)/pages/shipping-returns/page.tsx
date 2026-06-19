import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Shipping & returns' }

export default function ShippingReturnsPage() {
  return (
    <>
      <p className="label-accent">Policies</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Shipping & returns
      </h1>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Shipping</h2>
      <p>
        We ship from the EU within 1–2 business days. Free standard shipping on
        orders over $50 (or local equivalent). Express options are available at
        checkout.
      </p>
      <ul className="ml-5 list-disc">
        <li>Standard — 3–5 business days</li>
        <li>Express — 1–2 business days</li>
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
        Changed your mind? You have <strong>30 days</strong> from delivery to
        return any unused product for a full refund. The item must be in its
        original packaging.
      </p>
      <p>
        Email us at{' '}
        <a href="mailto:hello@vionlabs.co" className="text-accent hover:underline">
          hello@vionlabs.co
        </a>{' '}
        with your order number to start a return. We&apos;ll send a prepaid
        return label and process your refund within 5 business days of receiving
        the package.
      </p>

      <p className="text-[12px] text-ink-mute">
        Last updated: June 2026. We may update this policy from time to time.
      </p>
    </>
  )
}
