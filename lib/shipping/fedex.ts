// FedEx REST API integration (server-only).
//
// Uses OAuth 2.0 client_credentials to obtain a short-lived Bearer token, then
// hits FedEx's JSON endpoints for rates, shipment creation (label buying), and
// tracking. Access tokens are cached in-memory per process; they're valid for
// ~60 minutes and we refresh a minute before expiry.
//
// Sandbox vs production:
//   FEDEX_MODE=sandbox    → https://apis-sandbox.fedex.com
//   FEDEX_MODE=production → https://apis.fedex.com
//
// Docs: https://developer.fedex.com/api/en-us/catalog.html

import { normalizeCountry } from './countries'
import { getOriginAddress, isOriginConfigured } from './origin'

const HOST_SANDBOX = 'https://apis-sandbox.fedex.com'
const HOST_PROD = 'https://apis.fedex.com'

const CLIENT_ID = process.env.FEDEX_CLIENT_ID || ''
const CLIENT_SECRET = process.env.FEDEX_CLIENT_SECRET || ''
const ACCOUNT_NUMBER = process.env.FEDEX_ACCOUNT_NUMBER || ''
const MODE = (process.env.FEDEX_MODE || 'sandbox').toLowerCase()

function host(): string {
  return MODE === 'production' ? HOST_PROD : HOST_SANDBOX
}

/** Enough config to authenticate + call rate/ship endpoints. */
export function fedexConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET && ACCOUNT_NUMBER)
}

/** Both API creds AND a valid ship-from address are required to create a label. */
export function fedexCanCreateShipment(): boolean {
  return fedexConfigured() && isOriginConfigured()
}

// ── OAuth token cache ───────────────────────────────────────────────────────

type TokenState = { token: string; expiresAt: number }
let tokenCache: TokenState | null = null

async function getAccessToken(): Promise<string> {
  const now = Date.now()
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.token
  }
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  })
  const res = await fetch(`${host()}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`FedEx OAuth failed: ${res.status} ${text.slice(0, 200)}`)
  }
  const j = (await res.json()) as { access_token: string; expires_in: number }
  if (!j.access_token) throw new Error('FedEx OAuth: no access_token in response')
  tokenCache = {
    token: j.access_token,
    expiresAt: now + Math.max(60_000, (j.expires_in ?? 3600) * 1000),
  }
  return j.access_token
}

// ── Types ───────────────────────────────────────────────────────────────────

export type FedExRateQuote = {
  serviceCode: string
  serviceName: string
  totalCents: number
  transitDays: number | null
}

export type FedExShipmentResult = {
  trackingNumber: string
  labelUrl: string // base64-encoded PDF wrapped in a data: URL for immediate download
  totalCents: number
}

export type ShippingDestination = {
  name: string
  line1: string
  line2?: string
  city: string
  region: string
  postal: string
  country: string
  phone?: string
  email?: string
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function money(quote: any): number {
  const total = quote?.totalNetChargeWithDutiesAndTaxes ?? quote?.totalNetCharge ?? 0
  return Math.round(Number(total) * 100)
}

async function authedFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken()
  const headers = new Headers(init?.headers)
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')
  headers.set('X-locale', 'en_CA')
  return fetch(`${host()}${path}`, { ...init, headers, cache: 'no-store' })
}

// ── getRates ────────────────────────────────────────────────────────────────

export async function getRates(input: {
  toPostal: string
  toCountry: string
  weightGrams: number
}): Promise<FedExRateQuote[]> {
  if (!fedexConfigured() || !isOriginConfigured()) return []
  const origin = getOriginAddress()
  const toCountry = normalizeCountry(input.toCountry)
  const weightLbs = Math.max(0.1, input.weightGrams / 453.592)

  const body = {
    accountNumber: { value: ACCOUNT_NUMBER },
    requestedShipment: {
      shipper: {
        address: {
          postalCode: origin.postal,
          countryCode: origin.country,
        },
      },
      recipient: {
        address: {
          postalCode: input.toPostal.replace(/\s+/g, '').toUpperCase(),
          countryCode: toCountry,
        },
      },
      pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
      rateRequestType: ['LIST', 'ACCOUNT'],
      requestedPackageLineItems: [
        {
          weight: { units: 'LB', value: Number(weightLbs.toFixed(2)) },
        },
      ],
    },
  }

  let res: Response
  try {
    res = await authedFetch('/rate/v1/rates/quotes', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  } catch (e) {
    console.error('[fedex/getRates] network:', (e as Error).message)
    return []
  }
  const j = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('[fedex/getRates] http', res.status, JSON.stringify(j).slice(0, 500))
    return []
  }
  const details = j?.output?.rateReplyDetails ?? []
  return details.flatMap((d: any) => {
    const code = d.serviceType
    const name = d.serviceName ?? code
    const shipment = d.ratedShipmentDetails?.[0]
    const cents = shipment ? money(shipment) : 0
    const days = d.commit?.transitDays?.description
      ? parseInt(d.commit.transitDays.description, 10) || null
      : null
    if (!code || cents <= 0) return []
    return [{ serviceCode: code, serviceName: name, totalCents: cents, transitDays: days }]
  })
}

// ── createShipment ──────────────────────────────────────────────────────────

export async function createShipment(input: {
  serviceCode: string
  weightGrams: number
  to: ShippingDestination
  orderNumber: string
}): Promise<FedExShipmentResult> {
  if (!fedexCanCreateShipment()) {
    throw new Error('FedEx is not fully configured for shipment creation')
  }
  const origin = getOriginAddress()
  const toCountry = normalizeCountry(input.to.country)
  const weightLbs = Math.max(0.1, input.weightGrams / 453.592)

  const body = {
    labelResponseOptions: 'LABEL',
    accountNumber: { value: ACCOUNT_NUMBER },
    requestedShipment: {
      shipper: {
        contact: {
          personName: origin.name,
          phoneNumber: origin.phone,
          companyName: origin.name,
        },
        address: {
          streetLines: [origin.addressLine],
          city: origin.city,
          stateOrProvinceCode: origin.province,
          postalCode: origin.postal,
          countryCode: origin.country,
        },
      },
      recipients: [
        {
          contact: {
            personName: input.to.name,
            phoneNumber: input.to.phone || origin.phone,
          },
          address: {
            streetLines: [input.to.line1, input.to.line2].filter(Boolean),
            city: input.to.city,
            stateOrProvinceCode: input.to.region,
            postalCode: input.to.postal.replace(/\s+/g, '').toUpperCase(),
            countryCode: toCountry,
          },
        },
      ],
      shipDatestamp: new Date().toISOString().slice(0, 10),
      serviceType: input.serviceCode,
      packagingType: 'YOUR_PACKAGING',
      pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
      shippingChargesPayment: {
        paymentType: 'SENDER',
        payor: {
          responsibleParty: {
            accountNumber: { value: ACCOUNT_NUMBER },
          },
        },
      },
      labelSpecification: {
        imageType: 'PDF',
        labelStockType: 'PAPER_4X6',
      },
      requestedPackageLineItems: [
        {
          weight: { units: 'LB', value: Number(weightLbs.toFixed(2)) },
          customerReferences: [
            { customerReferenceType: 'CUSTOMER_REFERENCE', value: input.orderNumber },
          ],
        },
      ],
    },
  }

  const res = await authedFetch('/ship/v1/shipments', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg =
      j?.errors?.[0]?.message ||
      j?.output?.alerts?.[0]?.message ||
      `HTTP ${res.status}`
    throw new Error(`FedEx: ${msg}`)
  }

  const shipment = j?.output?.transactionShipments?.[0]
  const trackingNumber = shipment?.masterTrackingNumber
  const labelBase64 =
    shipment?.pieceResponses?.[0]?.packageDocuments?.[0]?.encodedLabel

  if (!trackingNumber || !labelBase64) {
    throw new Error('FedEx: shipment created but response is missing tracking or label')
  }

  const totalCents = money(shipment?.shipmentRating?.shipmentRateDetails?.[0])
  return {
    trackingNumber,
    labelUrl: `data:application/pdf;base64,${labelBase64}`,
    totalCents,
  }
}
