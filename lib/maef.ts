// MAEF secure-checkout rail (server-only).
//
// Card payment is handled off-site on the masked parent storefront. On "Place
// order" the checkout POSTs the cart to /api/maef/create-session, which signs a
// payload with our shared HMAC secret and hands it to the parent; the parent
// returns a redirect URL and we send the customer there to pay. After payment
// the parent PUSHES the completed order back to /api/maef/confirm (signed), and
// we land the shopper on /checkout/success.
//
// MAEF_SECRET is server-only — never import this from a Client Component.

import crypto from 'crypto'

const PARENT_URL = process.env.MAEF_PARENT_URL || ''
const SECRET = process.env.MAEF_SECRET || ''
const LICENSE = process.env.MAEF_LICENSE_KEY || ''
const BRIDGE_PRODUCT_ID = Number(process.env.MAEF_BRIDGE_PRODUCT_ID || 0)

export function maefConfigured(): boolean {
  return Boolean(PARENT_URL && SECRET && LICENSE && BRIDGE_PRODUCT_ID)
}

export interface MaefBilling {
  first_name: string
  last_name: string
  email: string
  phone?: string
  address_1: string
  address_2?: string
  city: string
  state: string
  postcode: string
  country: string
}

export interface MaefSessionInput {
  /** Numeric reference for this order (echoed back on confirm). */
  ref: number
  /** Grand total the customer pays, in dollars (already includes shipping + tax). */
  totalDollars: number
  shippingLabel: string
  billing: MaefBilling
}

// The payload is deliberately CHILD-FREE: a single bridge line at the order
// total (the parent matches by price, not id), billing for prefill, and nothing
// that identifies this storefront — no domain, brand, product names, or
// return URL (the parent already knows the child domain + redirect from its
// own settings).
function buildPayload(input: MaefSessionInput) {
  const total = Math.round(input.totalDollars * 100) / 100
  return {
    wc_order_id: input.ref,
    total,
    shipping_cost: 0,
    shipping_label: input.shippingLabel,
    tax_total: 0,
    cart: [
      {
        product_id: BRIDGE_PRODUCT_ID,
        quantity: 1,
        price: total,
        line_total: total,
        name: `Order ${input.ref}`,
      },
    ],
    coupon_codes: [] as string[],
    discount_total: 0,
    billing_details: {
      first_name: input.billing.first_name,
      last_name: input.billing.last_name,
      email: input.billing.email,
      phone: input.billing.phone || '',
      address_1: input.billing.address_1,
      address_2: input.billing.address_2 || '',
      city: input.billing.city,
      state: input.billing.state,
      postcode: input.billing.postcode,
      country: input.billing.country || 'US',
    },
    payer_email: input.billing.email,
    customer_name: `${input.billing.first_name} ${input.billing.last_name}`.trim(),
    timestamp: Math.floor(Date.now() / 1000),
  }
}

function sign(jsonString: string): string {
  return crypto.createHmac('sha256', SECRET).update(jsonString).digest('hex')
}

export async function createMaefSession(
  input: MaefSessionInput,
): Promise<{ ok: true; redirect_url: string } | { ok: false; error: string }> {
  if (!maefConfigured()) return { ok: false, error: 'Secure checkout is not configured' }
  const payload = buildPayload(input)
  const body = JSON.stringify(payload)
  const signature = sign(body)
  let res: Response
  try {
    res = await fetch(`${PARENT_URL}/wp-json/maef/v1/create-order-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MAEF-License': LICENSE,
        'X-MAEF-Signature': signature,
      },
      body,
      cache: 'no-store',
    })
  } catch (e) {
    return { ok: false, error: `network: ${(e as Error).message}` }
  }
  if (!res.ok) return { ok: false, error: `parent HTTP ${res.status}` }
  let j: any
  try {
    j = await res.json()
  } catch {
    return { ok: false, error: 'parent returned non-JSON' }
  }
  if (j.redirect_url) return { ok: true, redirect_url: String(j.redirect_url) }
  if (j.token) return { ok: true, redirect_url: `${PARENT_URL}/?maef_start_checkout=${j.token}` }
  return { ok: false, error: 'parent did not return a redirect' }
}

export interface MaefComplete {
  parent_order_id?: number | string
  payment_status?: string
  original_payload?: {
    total?: number
    wc_order_id?: number
    /** Seconds since epoch — set by buildPayload on outbound. Used for
     *  freshness checks in verifyComplete to blunt signature replay. */
    timestamp?: number
  }
  [k: string]: unknown
}

/** Max age (seconds) of a valid maef_complete callback. Signed payloads older
 *  than this are rejected on verify — blunts replay of a captured signature. */
const MAX_COMPLETE_AGE_SECONDS = 15 * 60

// The parent PUSHES the finished order as ?maef_complete=<base64(json)>&sig=<hmac>.
// We HMAC the RAW json string (the bytes inside the base64) and compare to sig
// (timing-safe). Returns the decoded payload, or null if the signature fails
// OR the payload is too old (freshness check — fixes H3 replay).
export function verifyComplete(maefCompleteB64: string, sig: string): MaefComplete | null {
  if (!SECRET || !maefCompleteB64 || !sig) return null
  let jsonString: string
  try {
    jsonString = Buffer.from(maefCompleteB64, 'base64').toString('utf8')
  } catch {
    return null
  }
  const expected = sign(jsonString)
  const a = Buffer.from(expected)
  const b = Buffer.from(sig)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  let parsed: MaefComplete
  try {
    parsed = JSON.parse(jsonString) as MaefComplete
  } catch {
    return null
  }
  // Freshness: the outbound payload includes `timestamp` (seconds). Reject if
  // older than MAX_COMPLETE_AGE_SECONDS OR more than 5 minutes in the future
  // (clock-skew tolerance).
  const ts = Number(parsed.original_payload?.timestamp)
  if (!Number.isFinite(ts)) return null
  const nowSec = Math.floor(Date.now() / 1000)
  const age = nowSec - ts
  if (age > MAX_COMPLETE_AGE_SECONDS) return null
  if (age < -5 * 60) return null
  return parsed
}
