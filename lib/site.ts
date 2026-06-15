// ──────────────────────────────────────────────────────────────────────────
// Single source of truth for store-wide settings.
// Change the brand here and it updates everywhere (header, footer, metadata).
// ──────────────────────────────────────────────────────────────────────────

export const site = {
  /** Placeholder brand — swap this one string to rebrand the whole store. */
  brand: 'Marlowe',
  tagline: 'Quietly considered essentials, made to be worn for years.',
  description:
    'Marlowe is a small studio making considered, long-lasting clothing and goods for everyday life.',

  /** Currency + money config. Prices throughout the app are stored in cents. */
  currency: 'USD',
  locale: 'en-US',

  /** Orders at or above this subtotal ship free (in cents). */
  freeShippingThresholdCents: 15000, // $150.00
  /** Flat shipping fee applied below the free-shipping threshold (in cents). */
  flatShippingCents: 800, // $8.00
  /** Estimated tax rate shown at checkout (display only — wire real tax later). */
  taxRate: 0.0825,

  contactEmail: 'hello@marlowe.shop',
  social: {
    instagram: 'https://instagram.com',
    pinterest: 'https://pinterest.com',
  },
} as const

export type Site = typeof site
