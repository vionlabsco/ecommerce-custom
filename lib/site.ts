// ──────────────────────────────────────────────────────────────────────────
// Single source of truth for store-wide settings.
// Change the brand here and it updates everywhere (header, footer, metadata).
// ──────────────────────────────────────────────────────────────────────────

export const site = {
  /** Brand wordmark — matches the brand-package casing ("Vion Labs"). */
  brand: 'Vion Labs',
  tagline: 'Peptide therapy. Without the needle.',
  description:
    'Vion Labs develops non-invasive peptide delivery technology. Our flagship formulation delivers retatrutide — a triple-agonist metabolic peptide — sublingually, bypassing injections entirely.',

  /** Currency + money config. Prices throughout the app are stored in cents. */
  currency: 'USD',
  locale: 'en-US',

  /** Orders at or above this subtotal ship free (in cents). */
  freeShippingThresholdCents: 5000, // $50.00
  /** Flat shipping fee applied below the free-shipping threshold (in cents). */
  flatShippingCents: 800, // $8.00
  /** Express shipping flat fee (in cents). Never free — even above threshold. */
  expressShippingCents: 1800, // $18.00
  /** Estimated tax rate shown at checkout (display only — wire real tax later). */
  taxRate: 0.0825,

  contactEmail: 'hello@vionlabs.co',

  /**
   * Default parcel assumptions for shipping-rate quotes when a merchant hasn't
   * set per-product weight/dimensions. Small-parcel supplement box sized to
   * fit up to ~4 bottles. Weight scales with item count.
   */
  parcelDefaults: {
    /** Base packaging weight in grams (empty box + filler). */
    baseGrams: 250,
    /** Weight added per line-item unit (one bottle / one pack). */
    perItemGrams: 100,
    /** Dimensions in cm. */
    lengthCm: 20,
    widthCm: 15,
    heightCm: 10,
  },
  social: {
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
  },
} as const

export type Site = typeof site
