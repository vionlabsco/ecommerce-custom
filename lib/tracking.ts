// Map a carrier name + tracking number to a public tracking URL.
// Used by the order success page, the shipped-notification email, and the
// admin order detail. Carrier names are normalised (lower, trimmed) so
// "UPS", "ups", "U.P.S." all match.
//
// Returns null when we don't recognise the carrier — caller should fall back
// to showing the tracking number as plain text.

type CarrierEntry = {
  label: string
  url: (n: string) => string
}

const CARRIERS: Record<string, CarrierEntry> = {
  usps: {
    label: 'USPS',
    url: (n) => `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${encodeURIComponent(n)}`,
  },
  ups: {
    label: 'UPS',
    url: (n) => `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}`,
  },
  fedex: {
    label: 'FedEx',
    url: (n) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`,
  },
  dhl: {
    label: 'DHL',
    url: (n) => `https://www.dhl.com/global-en/home/tracking.html?tracking-id=${encodeURIComponent(n)}`,
  },
  'canada post': {
    label: 'Canada Post',
    url: (n) => `https://www.canadapost-postescanada.ca/track-reperage/en#/details/${encodeURIComponent(n)}`,
  },
  canadapost: {
    label: 'Canada Post',
    url: (n) => `https://www.canadapost-postescanada.ca/track-reperage/en#/details/${encodeURIComponent(n)}`,
  },
  stallion: {
    label: 'Stallion Express',
    url: (n) => `https://stallionexpress.ca/track/${encodeURIComponent(n)}`,
  },
  'stallion express': {
    label: 'Stallion Express',
    url: (n) => `https://stallionexpress.ca/track/${encodeURIComponent(n)}`,
  },
  'chit chats': {
    label: 'Chit Chats',
    url: (n) => `https://chitchats.com/tracking?tracking_code=${encodeURIComponent(n)}`,
  },
  chitchats: {
    label: 'Chit Chats',
    url: (n) => `https://chitchats.com/tracking?tracking_code=${encodeURIComponent(n)}`,
  },
  dpd: {
    label: 'DPD',
    url: (n) => `https://www.dpd.com/tracking?parcelNumber=${encodeURIComponent(n)}`,
  },
}

export type Tracking = {
  carrier: string
  trackingNumber: string
  /** Public-facing URL the customer can click to see live status. Null when
   *  the carrier isn't in our table — UI should render plain text instead. */
  url: string | null
  /** Pretty carrier name to display ("Canada Post" not "canadapost"). */
  carrierLabel: string
}

export function buildTracking(
  carrier: string | null | undefined,
  trackingNumber: string | null | undefined,
): Tracking | null {
  if (!carrier || !trackingNumber) return null
  const key = carrier.trim().toLowerCase().replace(/[.\s]+/g, ' ').trim()
  const entry = CARRIERS[key] ?? CARRIERS[key.replace(/\s+/g, '')]
  return {
    carrier,
    trackingNumber,
    url: entry ? entry.url(trackingNumber) : null,
    carrierLabel: entry ? entry.label : carrier,
  }
}
