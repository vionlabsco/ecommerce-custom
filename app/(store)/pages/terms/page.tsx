import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = { title: 'Terms of service' }

export default function TermsPage() {
  return (
    <>
      <p className="label-accent">Legal</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Terms of service
      </h1>
      <p className="text-[12px] text-ink-mute">
        Placeholder — replace with finalised legal copy before launch.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Use of the site</h2>
      <p>
        By using this site you agree to these terms. You may not use the site
        for any unlawful purpose or in any way that could disable, overburden,
        or impair it.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Orders & payment</h2>
      <p>
        Placing an order constitutes an offer to purchase. We reserve the right
        to refuse or cancel orders at our discretion. All prices are shown in
        USD unless otherwise noted. Sales tax is added at checkout where
        applicable.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Health disclaimer</h2>
      <p>
        Products sold on this site are dietary supplements and are not intended
        to diagnose, treat, cure, or prevent any disease. These statements have
        not been evaluated by the FDA. Consult a healthcare professional before
        starting any new supplement, especially if you are pregnant, nursing,
        taking medication, or managing a medical condition.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Intellectual property</h2>
      <p>
        All content on this site — including text, images, logos, formulas, and
        product designs — is the property of {site.brand} and protected by
        copyright. Do not reproduce without permission.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Limitation of liability</h2>
      <p>
        {site.brand} is not liable for any indirect, incidental, or consequential
        damages arising from use of our products or this site. Our maximum
        liability is limited to the purchase price of the affected product.
      </p>

      <p className="text-[12px] text-ink-mute">Last updated: 2026.</p>
    </>
  )
}
