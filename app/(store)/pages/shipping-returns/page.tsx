import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Shipping & returns' }

export default function ShippingReturnsPage() {
  return (
    <>
      <p className="label-accent">Policies</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Shipping & returns
      </h1>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Where we ship</h2>
      <p>
        Vionlabs ships from Canada to the United States and Canada. Most orders
        leave the warehouse within 1–2 business days. Free standard shipping on
        US + Canadian orders over $50.
      </p>

      <h3 className="mt-6 font-display text-base font-bold text-ink">Canada</h3>
      <ul className="ml-5 list-disc">
        <li>Standard (Canada Post) — 3–6 business days</li>
        <li>Express (Canada Post Xpresspost) — 1–3 business days</li>
      </ul>

      <h3 className="mt-6 font-display text-base font-bold text-ink">United States</h3>
      <ul className="ml-5 list-disc">
        <li>Standard (USPS / Canada Post International) — 5–10 business days</li>
        <li>Express (UPS / FedEx) — 2–5 business days</li>
      </ul>

      <p>
        Shipping to the US clears customs as part of transit — there are no
        surprise fees at delivery on orders under $800 USD (the de minimis
        threshold). Once your order ships you&apos;ll receive a tracking link
        by email. If the tracking page hasn&apos;t updated within 48 hours of
        shipment,{' '}
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
