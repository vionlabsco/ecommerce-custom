import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Contact' }

export default function ContactPage() {
  return (
    <>
      <p className="label-accent">Get in touch</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Contact
      </h1>
      <p>
        Questions about an order, warranty, or just want to say hi? We read
        every message and reply within one business day.
      </p>

      <div className="mt-10 rounded-lg border border-line bg-card p-6">
        <p className="text-[11px] font-medium uppercase tracking-widest2 text-ink-soft">
          Email
        </p>
        <a
          href="mailto:hello@vionlabs.co"
          className="mt-1 block font-display text-xl font-bold text-ink hover:text-accent"
        >
          hello@vionlabs.co
        </a>
      </div>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Press &amp; partnerships</h2>
      <p>
        For press inquiries, creator partnerships, or wholesale, email{' '}
        <a href="mailto:partners@vionlabs.co" className="text-accent hover:underline">
          partners@vionlabs.co
        </a>
        .
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Order help</h2>
      <p>
        For order-specific questions, include your order number (begins with{' '}
        <code className="rounded bg-ink/5 px-1 py-0.5 text-[12px]">VL-</code>)
        so we can locate it instantly.
      </p>
    </>
  )
}
