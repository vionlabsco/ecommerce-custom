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
   * set per-product weight/dimensions.
   *
   * Sized for a 30 mL amber glass sublingual bottle in a snug shipping box.
   * Small enough that dimensional weight ≈ actual weight — FedEx and DHL
   * charge by max(actualKg, lengthCm*widthCm*heightCm / 5000), so oversized
   * boxes get billed as heavier packages than they are.
   *
   * Empirical: for a 30 mL bottle the real shipping is ~$28-45 CAD via
   * FedEx International Economy CA→US at these dims, vs ~$247 with the
   * old 20x15x10 default. If the client ships multi-bottle orders, we may
   * need to add per-quantity dimension scaling here.
   */
  parcelDefaults: {
    /** Base packaging weight in grams (empty box + filler + dropper cap). */
    baseGrams: 120,
    /** Weight added per bottle. 30 mL amber glass ≈ 90 g full. */
    perItemGrams: 90,
    /** Dimensions in cm — 30 mL bottle in a tight mailer. */
    lengthCm: 12,
    widthCm: 8,
    heightCm: 5,
  },
  social: {
    instagram: 'https://instagram.com',
    twitter: 'https://twitter.com',
  },
} as const

export type Site = typeof site
