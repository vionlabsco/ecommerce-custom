// Normalize country strings to ISO-3166 alpha-2 codes.
//
// Historically the checkout form stored free-text ("United States") in
// `shippingAddress.country`, which broke the Canada Post integration
// (their API expects "US" / "CA", and our BuyLabelButton switch used exact
// matches). This helper normalizes both existing and future values.

const CANADA = new Set(['CA', 'CAN', 'CANADA'])
const UNITED_STATES = new Set([
  'US',
  'USA',
  'U.S.',
  'U.S.A.',
  'UNITED STATES',
  'UNITED STATES OF AMERICA',
  'AMERICA',
])

/** Return an ISO-2 code when we recognise the input; otherwise return the
 *  trimmed uppercase input (so downstream code can still pass it through
 *  to Canada Post, which accepts many ISO-2 codes we don't hardcode). */
export function normalizeCountry(raw: string | null | undefined): string {
  const s = (raw ?? '').trim().toUpperCase()
  if (!s) return 'CA' // sensible default for a Canadian merchant
  if (CANADA.has(s)) return 'CA'
  if (UNITED_STATES.has(s)) return 'US'
  return s
}

/** Sort helper: Canada + US first, then everything else alphabetically. */
function rank(code: string): number {
  if (code === 'CA') return 0
  if (code === 'US') return 1
  return 2
}

/** Country select options for the checkout form. Two most likely destinations
 *  first, then a curated shortlist. Extend as the client's shipping map grows. */
export const COUNTRY_OPTIONS: Array<{ code: string; label: string }> = [
  { code: 'CA', label: 'Canada' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'AU', label: 'Australia' },
  { code: 'NZ', label: 'New Zealand' },
  { code: 'IE', label: 'Ireland' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'ES', label: 'Spain' },
  { code: 'IT', label: 'Italy' },
  { code: 'SE', label: 'Sweden' },
  { code: 'NO', label: 'Norway' },
  { code: 'DK', label: 'Denmark' },
  { code: 'FI', label: 'Finland' },
  { code: 'CH', label: 'Switzerland' },
  { code: 'AT', label: 'Austria' },
  { code: 'BE', label: 'Belgium' },
  { code: 'PT', label: 'Portugal' },
  { code: 'JP', label: 'Japan' },
  { code: 'SG', label: 'Singapore' },
  { code: 'HK', label: 'Hong Kong' },
  { code: 'AE', label: 'United Arab Emirates' },
  { code: 'MX', label: 'Mexico' },
].sort((a, b) => {
  const r = rank(a.code) - rank(b.code)
  if (r !== 0) return r
  return a.label.localeCompare(b.label)
})
