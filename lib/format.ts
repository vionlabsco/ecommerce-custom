import { site } from './site'

/** Format an integer number of cents as a currency string, e.g. 4200 -> "$42". */
export function formatPrice(cents: number): string {
  const value = cents / 100
  const hasFraction = Math.round(cents) % 100 !== 0
  return new Intl.NumberFormat(site.locale, {
    style: 'currency',
    currency: site.currency,
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value)
}
