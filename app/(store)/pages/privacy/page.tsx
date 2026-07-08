import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = { title: 'Privacy policy' }

export default function PrivacyPage() {
  return (
    <>
      <p className="label-accent">Legal</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Privacy policy
      </h1>
      <p className="text-[12px] text-ink-mute">
        Placeholder — replace with your finalised legal copy before launch. This
        page exists so checkout/payment processor onboarding succeeds.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">What we collect</h2>
      <ul className="ml-5 list-disc">
        <li>
          <strong>Order information</strong>: name, shipping address, email, items
          purchased, payment method (handled by our payment processor; we never
          see your card number).
        </li>
        <li>
          <strong>Account information</strong>: email if you sign up for our
          newsletter.
        </li>
        <li>
          <strong>Analytics</strong>: page views, device type, and aggregate
          interaction data via Google Analytics / Microsoft Clarity / Meta Pixel
          (only if enabled — see <a href="#" className="text-accent hover:underline">Cookie settings</a>).
        </li>
      </ul>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">How we use it</h2>
      <ul className="ml-5 list-disc">
        <li>To process and fulfil your order.</li>
        <li>To send you order updates and (if you opt in) newsletters.</li>
        <li>To improve the storefront based on aggregated analytics.</li>
      </ul>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Your rights</h2>
      <p>
        Under GDPR / CCPA you have the right to access, correct, or delete the
        personal data we hold about you. Email{' '}
        <a href={`mailto:${site.contactEmail}`} className="text-accent hover:underline">
          {site.contactEmail}
        </a>{' '}
        and we&apos;ll respond within 30 days.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Data retention</h2>
      <p>
        Order records are retained for 7 years for tax compliance. Newsletter
        subscriptions are retained until you unsubscribe.
      </p>

      <p className="text-[12px] text-ink-mute">Last updated: June 2026.</p>
    </>
  )
}
