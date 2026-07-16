// Ship-from ("origin") address — shared by every shipping carrier we integrate.
//
// Reads from `SHIPPING_ORIGIN_*` env vars first; falls back to the legacy
// `CANADA_POST_ORIGIN_*` vars so the CP integration keeps working during the
// migration. New deployments should set the SHIPPING_ORIGIN_* names.

export type OriginAddress = {
  name: string
  addressLine: string
  city: string
  province: string
  postal: string
  phone: string
  country: string
}

function firstNonEmpty(...values: (string | undefined)[]): string {
  for (const v of values) {
    if (v && v.trim()) return v.trim()
  }
  return ''
}

export function getOriginAddress(): OriginAddress {
  const raw = {
    name: firstNonEmpty(process.env.SHIPPING_ORIGIN_NAME, process.env.CANADA_POST_ORIGIN_NAME),
    addressLine: firstNonEmpty(
      process.env.SHIPPING_ORIGIN_ADDRESS_LINE,
      process.env.CANADA_POST_ORIGIN_ADDRESS_LINE,
    ),
    city: firstNonEmpty(process.env.SHIPPING_ORIGIN_CITY, process.env.CANADA_POST_ORIGIN_CITY),
    province: firstNonEmpty(
      process.env.SHIPPING_ORIGIN_PROVINCE,
      process.env.CANADA_POST_ORIGIN_PROVINCE,
    ),
    postal: firstNonEmpty(process.env.SHIPPING_ORIGIN_POSTAL, process.env.CANADA_POST_ORIGIN_POSTAL),
    phone: firstNonEmpty(process.env.SHIPPING_ORIGIN_PHONE, process.env.CANADA_POST_ORIGIN_PHONE),
    country: firstNonEmpty(process.env.SHIPPING_ORIGIN_COUNTRY, 'CA'),
  }
  return {
    ...raw,
    postal: raw.postal.replace(/\s+/g, '').toUpperCase(),
    province: raw.province.toUpperCase(),
    country: raw.country.toUpperCase(),
  }
}

export function isOriginConfigured(): boolean {
  const o = getOriginAddress()
  return Boolean(o.name && o.addressLine && o.city && o.province && o.postal && o.phone)
}
