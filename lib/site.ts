// ──────────────────────────────────────────────────────────────────────────
// Single source of truth for store-wide settings.
// Change the brand here and it updates everywhere (header, footer, metadata).
// ──────────────────────────────────────────────────────────────────────────

export const site = {
  /** Brand wordmark — typeset as ALL CAPS in the chrome. */
  brand: 'VIONLABS',
  tagline: 'Precision desk gear, engineered to last.',
  description:
    'Vionlabs makes precision-engineered mouse pads — a 5mm tempered-glass pad and a stitched cloth pad, each tuned for fast, controlled tracking.',

  /** Currency + money config. Prices throughout the app are stored in cents. */
  currency: 'USD',
  locale: 'en-US',

  /** Orders at or above this subtotal ship free (in cents). */
  freeShippingThresholdCents: 5000, // $50.00
  /** Flat shipping fee applied below the free-shipping threshold (in cents). */
  flatShippingCents: 800, // $8.00
  /** Estimated tax rate shown at checkout (display only — wire real tax later). */
  taxRate: 0.0825,

  contactEmail: 'hello@vionlabs.co',
  social: {
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
  },
} as const

export type Site = typeof site
