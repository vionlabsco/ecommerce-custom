// DHL Express (MyDHL API) integration (server-only).
//
// DHL Express uses HTTP Basic auth (API Key as username, API Secret as password)
// against a REST JSON API. Sandbox is a separate host with the same schema.
//
// Sandbox vs production:
//   DHL_MODE=sandbox    → https://express.api.dhl.com/mydhlapi/test
//   DHL_MODE=production → https://express.api.dhl.com/mydhlapi
//
// Docs: https://developer.dhl.com/api-reference/dhl-express-mydhl-api

import { normalizeCountry } from './countries'
import { getOriginAddress, isOriginConfigured } from './origin'

const HOST_BASE = 'https://express.api.dhl.com/mydhlapi'
const PATH_SANDBOX = '/test'
const PATH_PROD = ''

// Trim defensively — see fedex.ts note on why.
const API_KEY = (process.env.DHL_API_KEY || '').trim()
const API_SECRET = (process.env.DHL_API_SECRET || '').trim()
const ACCOUNT_NUMBER = (process.env.DHL_ACCOUNT_NUMBER || '').trim()
const MODE = (process.env.DHL_MODE || 'sandbox').trim().toLowerCase()

function host(): string {
  return `${HOST_BASE}${MODE === 'production' ? PATH_PROD : PATH_SANDBOX}`
}

function authHeader(): string {
  return 'Basic ' + Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')
}

/** Enough config to authenticate + call the rate/ship endpoints. */
export function dhlConfigured(): boolean {
  return Boolean(API_KEY && API_SECRET && ACCOUNT_NUMBER)
}

/** Both API creds AND a valid origin address required to buy a label. */
export function dhlCanCreateShipment(): boolean {
  return dhlConfigured() && isOriginConfigured()
}

// ── Types ───────────────────────────────────────────────────────────────────

export type DhlRateQuote = {
  serviceCode: string
  serviceName: string
  totalCents: number
  transitDays: number | null
}

export type DhlShipmentResult = {
  trackingNumber: string
  labelUrl: string // data: URL wrapping the label PDF for immediate download
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

async function dhlFetch(path: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers)
  headers.set('Authorization', authHeader())
  headers.set('Content-Type', 'application/json')
  headers.set('Accept', 'application/json')
  return fetch(`${host()}${path}`, { ...init, headers, cache: 'no-store' })
}

function money(charge: any): number {
  const value = charge?.totalPrice?.[0]?.price ?? charge?.price ?? 0
  return Math.round(Number(value) * 100)
}

// ── getRates ────────────────────────────────────────────────────────────────

export async function getRates(input: {
  toPostal: string
  toCountry: string
  toCity: string
  weightGrams: number
  lengthCm: number
  widthCm: number
  heightCm: number
}): Promise<DhlRateQuote[]> {
  if (!dhlConfigured() || !isOriginConfigured()) return []
  const origin = getOriginAddress()
  const toCountry = normalizeCountry(input.toCountry)
  const weightKg = Math.max(0.1, input.weightGrams / 1000)
  const shipDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const params = new URLSearchParams({
    accountNumber: ACCOUNT_NUMBER,
    originCountryCode: origin.country,
    originCityName: origin.city,
    originPostalCode: origin.postal,
    destinationCountryCode: toCountry,
    destinationCityName: input.toCity,
    destinationPostalCode: input.toPostal.replace(/\s+/g, '').toUpperCase(),
    weight: weightKg.toFixed(2),
    length: input.lengthCm.toFixed(1),
    width: input.widthCm.toFixed(1),
    height: input.heightCm.toFixed(1),
    plannedShippingDate: shipDate,
    isCustomsDeclarable: (toCountry !== origin.country).toString(),
    unitOfMeasurement: 'metric',
  })

  let res: Response
  try {
    res = await dhlFetch(`/rates?${params.toString()}`)
  } catch (e) {
    console.error('[dhl/getRates] network:', (e as Error).message)
    return []
  }
  const j = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('[dhl/getRates] http', res.status, JSON.stringify(j).slice(0, 500))
    return []
  }
  const products = j?.products ?? []
  return products.flatMap((p: any) => {
    const code = p.productCode
    const name = p.productName ?? code
    const cents = money(p.totalPrice?.[0])
    const days = p.deliveryCapabilities?.totalTransitDays
      ? parseInt(p.deliveryCapabilities.totalTransitDays, 10) || null
      : null
    if (!code || cents <= 0) return []
    return [{ serviceCode: code, serviceName: name, totalCents: cents, transitDays: days }]
  })
}

// ── createShipment ──────────────────────────────────────────────────────────

export async function createShipment(input: {
  serviceCode: string
  weightGrams: number
  lengthCm: number
  widthCm: number
  heightCm: number
  to: ShippingDestination
  orderNumber: string
  senderEmail?: string
}): Promise<DhlShipmentResult> {
  if (!dhlCanCreateShipment()) {
    throw new Error('DHL is not fully configured for shipment creation')
  }
  const origin = getOriginAddress()
  const toCountry = normalizeCountry(input.to.country)
  const weightKg = Math.max(0.1, input.weightGrams / 1000)
  const shipDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const body = {
    plannedShippingDateAndTime: `${shipDate}T10:00:00 GMT-05:00`,
    pickup: { isRequested: false },
    productCode: input.serviceCode,
    accounts: [{ typeCode: 'shipper', number: ACCOUNT_NUMBER }],
    customerDetails: {
      shipperDetails: {
        postalAddress: {
          cityName: origin.city,
          countryCode: origin.country,
          postalCode: origin.postal,
          addressLine1: origin.addressLine,
          provinceCode: origin.province,
        },
        contactInformation: {
          email: input.senderEmail || 'shipping@example.com',
          phone: origin.phone,
          companyName: origin.name,
          fullName: origin.name,
        },
      },
      receiverDetails: {
        postalAddress: {
          cityName: input.to.city,
          countryCode: toCountry,
          postalCode: input.to.postal.replace(/\s+/g, '').toUpperCase(),
          addressLine1: input.to.line1,
          addressLine2: input.to.line2 || undefined,
          provinceCode: input.to.region,
        },
        contactInformation: {
          email: input.to.email || 'customer@example.com',
          phone: input.to.phone || origin.phone,
          companyName: input.to.name,
          fullName: input.to.name,
        },
      },
    },
    content: {
      packages: [
        {
          weight: Number(weightKg.toFixed(2)),
          dimensions: {
            length: Number(input.lengthCm.toFixed(1)),
            width: Number(input.widthCm.toFixed(1)),
            height: Number(input.heightCm.toFixed(1)),
          },
          customerReferences: [{ value: input.orderNumber, typeCode: 'CU' }],
        },
      ],
      isCustomsDeclarable: toCountry !== origin.country,
      description: `Order ${input.orderNumber}`,
      incoterm: 'DAP',
      unitOfMeasurement: 'metric',
    },
    outputImageProperties: {
      encodingFormat: 'pdf',
      imageOptions: [
        { typeCode: 'label', templateName: 'ECOM26_A6_002', isRequested: true },
      ],
    },
  }

  const res = await dhlFetch('/shipments', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg =
      j?.detail || j?.additionalDetails?.[0] || j?.title || `HTTP ${res.status}`
    throw new Error(`DHL: ${msg}`)
  }

  const trackingNumber = j?.shipmentTrackingNumber
  const labelBase64 = j?.documents?.[0]?.content
  if (!trackingNumber || !labelBase64) {
    throw new Error('DHL: shipment created but response is missing tracking or label')
  }

  const totalCents =
    j?.shipmentCharges?.[0]?.price != null
      ? Math.round(Number(j.shipmentCharges[0].price) * 100)
      : 0

  return {
    trackingNumber,
    labelUrl: `data:application/pdf;base64,${labelBase64}`,
    totalCents,
  }
}
