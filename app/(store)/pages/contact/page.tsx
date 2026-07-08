import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = { title: 'Contact' }

export default function ContactPage() {
  return (
    <>
      <p className="label-accent">Get in touch</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Contact
      </h1>
      <p>
        Questions about the formulation, the science, an order, or dosing?
        We read every message and reply within one business day.
      </p>

      <div className="mt-10 rounded-lg border border-line bg-card p-6">
        <p className="text-[11px] font-medium uppercase tracking-widest2 text-ink-soft">
          Email
        </p>
        <a
          href={`mailto:${site.contactEmail}`}
          className="mt-1 block font-display text-xl font-bold text-ink hover:text-accent"
        >
          {site.contactEmail}
        </a>
      </div>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">
        Clinical &amp; scientific inquiries
      </h2>
      <p>
        For formulation questions, technical inquiries, or requests from
        healthcare providers, email{' '}
        <a
          href={`mailto:science@${site.contactEmail.split('@')[1]}`}
          className="text-accent hover:underline"
        >
          science@{site.contactEmail.split('@')[1]}
        </a>
        .
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Press &amp; partnerships</h2>
      <p>
        For press, distribution, or partnership inquiries, email{' '}
        <a
          href={`mailto:partners@${site.contactEmail.split('@')[1]}`}
          className="text-accent hover:underline"
        >
          partners@{site.contactEmail.split('@')[1]}
        </a>
        .
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Order help</h2>
      <p>
        For order-specific questions, include your order number so we can locate
        it instantly.
      </p>
    </>
  )
}
