// ──────────────────────────────────────────────────────────────────────────
// Admin "backend" — data layer for orders, customers, support tickets, and
// inventory. When Supabase is configured (the default for any deployed
// environment) every read/write hits Postgres; the only in-memory path left
// is a demo fallback for running with zero env vars locally.
//
// Customers are derived from orders (one row per email) rather than living in
// their own table — keeps the customer view always consistent with the actual
// order book.
// ──────────────────────────────────────────────────────────────────────────

import { randomBytes } from 'crypto'
import { getAllProducts, getProductById, setProductStock } from '@/lib/products'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { validateDiscountCode, incrementDiscountUse } from '@/lib/discounts'
import { site } from '@/lib/site'

/** Cryptographically random alphanumeric token. Used for order IDs / numbers
 *  so they can't be enumerated by walking sequential integers. */
function token(bytes = 8): string {
  return randomBytes(bytes).toString('hex').toUpperCase()
}

export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type FulfillmentStatus = 'unfulfilled' | 'fulfilled'
export type TicketStatus = 'open' | 'pending' | 'closed'

export type OrderItem = { name: string; variant: string; qty: number; priceCents: number }
export type TimelineEvent = { at: string; label: string }

/** Shipping choice the customer made at checkout. Stored on the order so the
 *  admin knows which carrier + service to buy the label from — no guessing.
 *  Null for orders placed before the multi-carrier picker landed. */
export type SelectedShipping = {
  carrier: 'fedex' | 'dhl' | 'canada-post'
  serviceCode: string
  serviceName: string
} | null

export type Order = {
  id: string
  number: string
  placedAt: string
  customer: { name: string; email: string }
  items: OrderItem[]
  subtotalCents: number
  shippingCents: number
  taxCents: number
  totalCents: number
  /** Applied discount code (uppercase), null when none. */
  discountCode: string | null
  /** Discount amount in cents — already subtracted from totalCents. */
  discountCents: number
  shippingAddress: { line1: string; city: string; region: string; postal: string; country: string }
  /** Which carrier + service the customer picked at checkout. */
  selectedShipping?: SelectedShipping
  paymentStatus: PaymentStatus
  cancelled: boolean
  fulfillment: {
    status: FulfillmentStatus
    carrier?: string
    tracking?: string
    fulfilledAt?: string
    /** Base64 data URL or absolute URL to the label PDF. Persists so the admin
     *  can re-download the label from the order page at any time. */
    labelUrl?: string
  }
  timeline: TimelineEvent[]
}

export type Customer = {
  id: string
  name: string
  email: string
  location: string
  ordersCount: number
  totalSpentCents: number
  since: string
}

export type TicketMessage = { from: 'customer' | 'store'; body: string; at: string }

export type Ticket = {
  id: string
  subject: string
  customer: { name: string; email: string }
  orderNumber?: string
  status: TicketStatus
  messages: TicketMessage[]
  createdAt: string
}

// ── Seed helpers ───────────────────────────────────────────────────────────
const TAX_RATE = 0.0825
const FREE_SHIP_CENTS = 15000
const FLAT_SHIP_CENTS = 800

type OrderSeed = Omit<
  Order,
  'subtotalCents' | 'shippingCents' | 'taxCents' | 'totalCents' | 'discountCode' | 'discountCents'
>

/** Compute money from items so seed totals are always internally consistent. */
function seedOrder(o: OrderSeed): Order {
  const subtotalCents = o.items.reduce((s, i) => s + i.priceCents * i.qty, 0)
  const shippingCents = subtotalCents >= FREE_SHIP_CENTS ? 0 : FLAT_SHIP_CENTS
  const taxCents = Math.round(subtotalCents * TAX_RATE)
  const totalCents = subtotalCents + shippingCents + taxCents
  return {
    ...o,
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents,
    discountCode: null,
    discountCents: 0,
  }
}

// ── Seeded data (mutable module state) ───────────────────────────────────────
const SEED_ORDERS: Order[] = [
  seedOrder({
    id: 'o_100231',
    number: 'MAR-100231',
    placedAt: '2026-06-14T09:24:00Z',
    customer: { name: 'Hannah Pereira', email: 'hannah.p@email.com' },
    items: [
      { name: 'Garún Wool Sweater', variant: 'Oat · M', qty: 1, priceCents: 16800 },
      { name: 'Ribbed Wool Beanie', variant: 'Moss · One Size', qty: 1, priceCents: 4200 },
    ],
    shippingAddress: { line1: '14 Alder Lane', city: 'Portland', region: 'OR', postal: '97204', country: 'United States' },
    paymentStatus: 'paid',
    cancelled: false,
    fulfillment: { status: 'unfulfilled' },
    timeline: [
      { at: '2026-06-14T09:24:00Z', label: 'Order placed' },
      { at: '2026-06-14T09:24:06Z', label: 'Payment captured' },
    ],
  }),
  seedOrder({
    id: 'o_100232',
    number: 'MAR-100232',
    placedAt: '2026-06-13T16:02:00Z',
    customer: { name: 'Marcus Lindqvist', email: 'm.lindqvist@email.com' },
    items: [{ name: 'Waxed Chore Jacket', variant: 'Field Tan · L', qty: 1, priceCents: 24500 }],
    shippingAddress: { line1: '5 Powell Row', city: 'Brooklyn', region: 'NY', postal: '11211', country: 'United States' },
    paymentStatus: 'paid',
    cancelled: false,
    fulfillment: { status: 'fulfilled', carrier: 'UPS', tracking: '1Z999AA10123456784', fulfilledAt: '2026-06-13T18:40:00Z' },
    timeline: [
      { at: '2026-06-13T16:02:00Z', label: 'Order placed' },
      { at: '2026-06-13T16:02:05Z', label: 'Payment captured' },
      { at: '2026-06-13T18:40:00Z', label: 'Fulfilled via UPS · 1Z999AA10123456784' },
    ],
  }),
  seedOrder({
    id: 'o_100233',
    number: 'MAR-100233',
    placedAt: '2026-06-13T11:48:00Z',
    customer: { name: 'Priya Raman', email: 'priya.raman@email.com' },
    items: [{ name: 'Everyday Oxford Shirt', variant: 'Sky · S', qty: 1, priceCents: 9600 }],
    shippingAddress: { line1: '90 Sutter St', city: 'San Francisco', region: 'CA', postal: '94104', country: 'United States' },
    paymentStatus: 'pending',
    cancelled: false,
    fulfillment: { status: 'unfulfilled' },
    timeline: [{ at: '2026-06-13T11:48:00Z', label: 'Order placed · awaiting payment' }],
  }),
  seedOrder({
    id: 'o_100234',
    number: 'MAR-100234',
    placedAt: '2026-06-12T20:15:00Z',
    customer: { name: 'Daniel Osei', email: 'daniel.osei@email.com' },
    items: [
      { name: 'Pleated Wide Trouser', variant: 'Navy · 32', qty: 1, priceCents: 13800 },
      { name: 'Lambswool Crewneck', variant: 'Charcoal · M', qty: 1, priceCents: 12800 },
    ],
    shippingAddress: { line1: '221 Baker St', city: 'Austin', region: 'TX', postal: '78701', country: 'United States' },
    paymentStatus: 'paid',
    cancelled: false,
    fulfillment: { status: 'unfulfilled' },
    timeline: [
      { at: '2026-06-12T20:15:00Z', label: 'Order placed' },
      { at: '2026-06-12T20:15:04Z', label: 'Payment captured' },
    ],
  }),
  seedOrder({
    id: 'o_100235',
    number: 'MAR-100235',
    placedAt: '2026-06-12T08:33:00Z',
    customer: { name: 'Sofia Marchetti', email: 'sofia.m@email.com' },
    items: [{ name: 'Canvas Weekend Tote', variant: 'Natural · One Size', qty: 1, priceCents: 7800 }],
    shippingAddress: { line1: '3 Canal St', city: 'Chicago', region: 'IL', postal: '60606', country: 'United States' },
    paymentStatus: 'paid',
    cancelled: false,
    fulfillment: { status: 'fulfilled', carrier: 'USPS', tracking: '9400111899223817612345', fulfilledAt: '2026-06-12T14:10:00Z' },
    timeline: [
      { at: '2026-06-12T08:33:00Z', label: 'Order placed' },
      { at: '2026-06-12T08:33:03Z', label: 'Payment captured' },
      { at: '2026-06-12T14:10:00Z', label: 'Fulfilled via USPS · 9400111899223817612345' },
    ],
  }),
  seedOrder({
    id: 'o_100236',
    number: 'MAR-100236',
    placedAt: '2026-06-11T13:05:00Z',
    customer: { name: 'Owen Fletcher', email: 'owen.fletcher@email.com' },
    items: [{ name: 'Camp-Collar Shirt', variant: 'Sage · M', qty: 1, priceCents: 11200 }],
    shippingAddress: { line1: '12 Hill Rd', city: 'Denver', region: 'CO', postal: '80202', country: 'United States' },
    paymentStatus: 'refunded',
    cancelled: true,
    fulfillment: { status: 'unfulfilled' },
    timeline: [
      { at: '2026-06-11T13:05:00Z', label: 'Order placed' },
      { at: '2026-06-11T13:05:05Z', label: 'Payment captured' },
      { at: '2026-06-11T15:20:00Z', label: 'Order cancelled · refunded' },
    ],
  }),
  seedOrder({
    id: 'o_100237',
    number: 'MAR-100237',
    placedAt: '2026-06-11T10:41:00Z',
    customer: { name: 'Hannah Pereira', email: 'hannah.p@email.com' },
    items: [{ name: 'Ribbed Wool Beanie', variant: 'Rust · One Size', qty: 2, priceCents: 4200 }],
    shippingAddress: { line1: '14 Alder Lane', city: 'Portland', region: 'OR', postal: '97204', country: 'United States' },
    paymentStatus: 'paid',
    cancelled: false,
    fulfillment: { status: 'unfulfilled' },
    timeline: [
      { at: '2026-06-11T10:41:00Z', label: 'Order placed' },
      { at: '2026-06-11T10:41:04Z', label: 'Payment captured' },
    ],
  }),
  seedOrder({
    id: 'o_100238',
    number: 'MAR-100238',
    placedAt: '2026-06-10T19:22:00Z',
    customer: { name: 'Yuki Tanaka', email: 'yuki.tanaka@email.com' },
    items: [{ name: 'Garún Wool Sweater', variant: 'Moss · L', qty: 1, priceCents: 16800 }],
    shippingAddress: { line1: '8 Market Pl', city: 'Seattle', region: 'WA', postal: '98101', country: 'United States' },
    paymentStatus: 'paid',
    cancelled: false,
    fulfillment: { status: 'fulfilled', carrier: 'FedEx', tracking: '7700 1234 5678', fulfilledAt: '2026-06-11T09:05:00Z' },
    timeline: [
      { at: '2026-06-10T19:22:00Z', label: 'Order placed' },
      { at: '2026-06-10T19:22:06Z', label: 'Payment captured' },
      { at: '2026-06-11T09:05:00Z', label: 'Fulfilled via FedEx · 7700 1234 5678' },
    ],
  }),
  seedOrder({
    id: 'o_100239',
    number: 'MAR-100239',
    placedAt: '2026-06-10T12:10:00Z',
    customer: { name: 'Daniel Osei', email: 'daniel.osei@email.com' },
    items: [
      { name: 'Lambswool Crewneck', variant: 'Ecru · M', qty: 1, priceCents: 12800 },
      { name: 'Everyday Oxford Shirt', variant: 'White · M', qty: 1, priceCents: 9600 },
    ],
    shippingAddress: { line1: '221 Baker St', city: 'Austin', region: 'TX', postal: '78701', country: 'United States' },
    paymentStatus: 'paid',
    cancelled: false,
    fulfillment: { status: 'unfulfilled' },
    timeline: [
      { at: '2026-06-10T12:10:00Z', label: 'Order placed' },
      { at: '2026-06-10T12:10:05Z', label: 'Payment captured' },
    ],
  }),
  seedOrder({
    id: 'o_100240',
    number: 'MAR-100240',
    placedAt: '2026-06-09T17:58:00Z',
    customer: { name: 'Elena Vasquez', email: 'elena.v@email.com' },
    items: [{ name: 'Waxed Chore Jacket', variant: 'Black Olive · M', qty: 1, priceCents: 24500 }],
    shippingAddress: { line1: '46 Larch Ave', city: 'Boston', region: 'MA', postal: '02108', country: 'United States' },
    paymentStatus: 'pending',
    cancelled: false,
    fulfillment: { status: 'unfulfilled' },
    timeline: [{ at: '2026-06-09T17:58:00Z', label: 'Order placed · awaiting payment' }],
  }),
]

const SEED_TICKETS: Ticket[] = [
  {
    id: 't_1',
    subject: 'Where is my order?',
    customer: { name: 'Marcus Lindqvist', email: 'm.lindqvist@email.com' },
    orderNumber: 'MAR-100232',
    status: 'open',
    createdAt: '2026-06-14T08:10:00Z',
    messages: [
      { from: 'customer', body: 'Hi — my order shipped yesterday but the tracking link hasn’t updated. Can you check on it?', at: '2026-06-14T08:10:00Z' },
    ],
  },
  {
    id: 't_2',
    subject: 'Exchange — need a larger size',
    customer: { name: 'Yuki Tanaka', email: 'yuki.tanaka@email.com' },
    orderNumber: 'MAR-100238',
    status: 'pending',
    createdAt: '2026-06-13T15:30:00Z',
    messages: [
      { from: 'customer', body: 'The Garún sweater is lovely but a touch snug. Could I exchange the L for an XL?', at: '2026-06-13T15:30:00Z' },
      { from: 'store', body: 'Of course! I’ve started an exchange — pop the L in the return mailer and we’ll ship the XL today. No charge.', at: '2026-06-13T16:05:00Z' },
    ],
  },
  {
    id: 't_3',
    subject: 'Return request',
    customer: { name: 'Sofia Marchetti', email: 'sofia.m@email.com' },
    orderNumber: 'MAR-100235',
    status: 'open',
    createdAt: '2026-06-13T09:02:00Z',
    messages: [
      { from: 'customer', body: 'The tote is gorgeous but bigger than I expected. What’s the return process?', at: '2026-06-13T09:02:00Z' },
    ],
  },
  {
    id: 't_4',
    subject: 'How should I wash the wool?',
    customer: { name: 'Hannah Pereira', email: 'hannah.p@email.com' },
    status: 'closed',
    createdAt: '2026-06-10T18:44:00Z',
    messages: [
      { from: 'customer', body: 'Any tips for keeping the sweater in good shape?', at: '2026-06-10T18:44:00Z' },
      { from: 'store', body: 'Cool wool wash, reshape, and dry flat — it’ll outlast all of us. Enjoy!', at: '2026-06-10T19:01:00Z' },
    ],
  },
]

// Demo-mode store (used only when Supabase env vars are absent). One shared
// instance across Next's per-route server bundles so a storefront checkout
// and an admin read hit the SAME data within a single process. In live mode
// Supabase is that shared instance.
const _store = ((globalThis as any).__mw_store ??= {
  orders: SEED_ORDERS,
  tickets: SEED_TICKETS,
})
const orders: Order[] = _store.orders
const tickets: Ticket[] = _store.tickets

// ── Order ⇄ DB row mapping (Supabase mode) ───────────────────────────────
function rowToOrder(r: any): Order {
  return {
    id: r.id,
    number: r.number,
    placedAt: r.placed_at,
    customer: r.customer,
    items: r.items,
    subtotalCents: r.subtotal_cents,
    shippingCents: r.shipping_cents,
    taxCents: r.tax_cents,
    totalCents: r.total_cents,
    discountCode: r.discount_code ?? null,
    discountCents: r.discount_cents ?? 0,
    shippingAddress: r.shipping_address,
    selectedShipping: r.selected_shipping ?? null,
    paymentStatus: r.payment_status,
    cancelled: r.cancelled,
    fulfillment: r.fulfillment,
    timeline: r.timeline,
  }
}
function orderToRow(o: Order) {
  return {
    id: o.id,
    number: o.number,
    placed_at: o.placedAt,
    customer: o.customer,
    items: o.items,
    subtotal_cents: o.subtotalCents,
    shipping_cents: o.shippingCents,
    tax_cents: o.taxCents,
    total_cents: o.totalCents,
    discount_code: o.discountCode,
    discount_cents: o.discountCents,
    shipping_address: o.shippingAddress,
    selected_shipping: o.selectedShipping ?? null,
    payment_status: o.paymentStatus,
    cancelled: o.cancelled,
    fulfillment: o.fulfillment,
    timeline: o.timeline,
  }
}

/** Persist a mutated order. Supabase: UPDATE the row. Demo: the order object is
 *  a live reference into the in-memory array, so it's already saved. */
async function persistOrder(o: Order) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('orders').update(orderToRow(o)).eq('id', o.id)
    if (error) throw error
  }
}

// ── Queries ──────────────────────────────────────────────────────────────
export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('placed_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(rowToOrder)
  }
  return [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt))
}

export async function getOrder(id: string): Promise<Order | undefined> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    return data ? rowToOrder(data) : undefined
  }
  return orders.find((o) => o.id === id)
}

/** Fetch every order placed with this email. Used by the customer dashboard
 *  at /account so signed-in users can see all their previous purchases —
 *  including guest orders made before they signed up, as long as they used
 *  the same email at checkout. */
export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const normalised = email.trim().toLowerCase()
  if (!normalised) return []

  if (isSupabaseConfigured && supabase) {
    // customer is jsonb; use the ->> operator to reach the email field.
    // We escape `%` and `_` (LIKE wildcards) so a crafted email like
    // `%@%.com` can't harvest other customers' orders. See security audit H2.
    const escaped = normalised.replace(/[\\%_]/g, '\\$&')
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .ilike('customer->>email', escaped)
      .order('placed_at', { ascending: false })
    if (error) {
      console.error('[getOrdersByEmail]', error)
      return []
    }
    return (data ?? []).map(rowToOrder)
  }
  return orders.filter((o) => o.customer.email.toLowerCase() === normalised)
}

/** Look up an order by its public-facing number (NM-XXXXXXXX). Used by the
 *  storefront success page so customers can revisit it via the link in their
 *  confirmation email and see live tracking once fulfilment lands. */
export async function getOrderByNumber(number: string): Promise<Order | undefined> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('number', number)
      .maybeSingle()
    if (error) throw error
    return data ? rowToOrder(data) : undefined
  }
  return orders.find((o) => o.number === number)
}

export type OrderItemWithId = OrderItem & { productId?: string }

/** Shipping method chosen by the customer. Server maps this to a cent amount —
 *  never trust a client-supplied shipping cost, since a negative value would
 *  drive `totalCents` below zero (real bug we shipped through). */
export type ShippingMethod = 'standard' | 'express'

/** Input for a new order. Prices for each item are looked up server-side by
 *  `productId` — clients can send anything for `variant` (display only) and
 *  `qty`, but they can NOT influence the actual charge. */
export type NewOrderInput = {
  customer: { name: string; email: string }
  items: Array<{
    productId: string
    /** Human-readable "colour · size" — display only, never trusted for pricing. */
    variant: string
    qty: number
  }>
  shippingAddress: Order['shippingAddress']
  shippingMethod: ShippingMethod
  /** Optional live-rate selection from the checkout carrier picker. If set,
   *  the server re-fetches the rate from the specified carrier + service to
   *  compute authoritative shippingCents. `shippingMethod` becomes the
   *  fallback when the live-rate lookup fails at order time. */
  liveRate?: {
    carrier: 'fedex' | 'dhl' | 'canada-post'
    serviceCode: string
  }
  /** Optional applied discount code — case-insensitive, validated server-side. */
  discountCode?: string | null
  paymentStatus?: PaymentStatus
}

/** Server-computes the shipping charge from method + post-discount subtotal.
 *  Standard is free at/above the free-shipping threshold. Express is never
 *  free. Everything is clamped ≥ 0. */
export function computeShippingCents(
  method: ShippingMethod,
  discountedSubtotalCents: number,
): number {
  if (method === 'express') return Math.max(0, site.expressShippingCents)
  if (discountedSubtotalCents >= site.freeShippingThresholdCents) return 0
  return Math.max(0, site.flatShippingCents)
}

/** Re-fetch a live rate the customer picked at checkout so the server (not
 *  the client) computes the authoritative shipping cents. Returns null if
 *  the carrier / service is no longer available — createOrder falls back to
 *  the flat rate in that case. Imports are lazy so a store without any
 *  carrier configured doesn't pay the load cost. */
async function refetchLiveRate(input: {
  carrier: 'fedex' | 'dhl' | 'canada-post'
  serviceCode: string
  toPostal: string
  toCountry: string
  toCity: string
  weightGrams: number
}): Promise<{ totalCents: number; serviceCode: string; serviceName: string } | null> {
  const p = site.parcelDefaults
  try {
    if (input.carrier === 'fedex') {
      const { getRates } = await import('@/lib/shipping/fedex')
      const rates = await getRates({
        toPostal: input.toPostal,
        toCountry: input.toCountry,
        weightGrams: input.weightGrams,
      })
      const match = rates.find((r) => r.serviceCode === input.serviceCode)
      return match
        ? { totalCents: match.totalCents, serviceCode: match.serviceCode, serviceName: match.serviceName }
        : null
    }
    if (input.carrier === 'dhl') {
      const { getRates } = await import('@/lib/shipping/dhl')
      const rates = await getRates({
        toPostal: input.toPostal,
        toCountry: input.toCountry,
        toCity: input.toCity || 'Unknown',
        weightGrams: input.weightGrams,
        lengthCm: p.lengthCm,
        widthCm: p.widthCm,
        heightCm: p.heightCm,
      })
      const match = rates.find((r) => r.serviceCode === input.serviceCode)
      return match
        ? { totalCents: match.totalCents, serviceCode: match.serviceCode, serviceName: match.serviceName }
        : null
    }
    if (input.carrier === 'canada-post') {
      const { getRates } = await import('@/lib/shipping/canada-post')
      const rates = await getRates({
        toPostal: input.toPostal,
        toCountry: input.toCountry,
        weightGrams: input.weightGrams,
        lengthCm: p.lengthCm,
        widthCm: p.widthCm,
        heightCm: p.heightCm,
      })
      const match = rates.find((r) => r.serviceCode === input.serviceCode)
      return match
        ? { totalCents: match.totalCents, serviceCode: match.serviceCode, serviceName: match.serviceName }
        : null
    }
  } catch (e) {
    console.error('[refetchLiveRate] failed:', (e as Error).message)
  }
  return null
}

/** Create an order from a storefront checkout — this is the storefront → admin
 *  sync: the new order lands in the same store the admin reads.
 *
 *  Every money value is authoritative from the server:
 *   - Item prices come from `products.priceCents` (DB), NOT the input.
 *   - Shipping is `computeShippingCents(method, discountedSubtotal)`.
 *   - Discount is re-validated against the live `discount_codes` table.
 *   - Tax is derived from post-discount subtotal.
 *  If any `productId` is unknown, the order is rejected — never partially
 *  priced. */
export async function createOrder(input: NewOrderInput): Promise<Order> {
  // 1. Fetch every product from the DB and reject if any is unknown.
  const products = await Promise.all(
    input.items.map((i) => getProductById(i.productId)),
  )
  const missingAt = products.findIndex((p) => !p)
  if (missingAt !== -1) {
    throw new Error(`Unknown product id: ${input.items[missingAt].productId}`)
  }

  // 2. Rebuild the items with server-side pricing. Clamp qty ≥ 1 and cap it
  //    at a defensive max so a $1M order can't be dialed in.
  const items: OrderItem[] = input.items.map((i, ix) => {
    const p = products[ix]!
    const qty = Math.max(1, Math.min(99, Math.floor(i.qty || 1)))
    return {
      name: p.name,
      variant: String(i.variant ?? '').slice(0, 200),
      qty,
      priceCents: Math.max(0, p.priceCents | 0),
    }
  })
  const subtotalCents = items.reduce((s, i) => s + i.priceCents * i.qty, 0)

  // 3. Re-validate the discount server-side. Never use client-supplied
  //    discountCents — the amount is derived from the live coupon.
  let discountCode: string | null = null
  let discountCents = 0
  if (input.discountCode) {
    const v = await validateDiscountCode(input.discountCode, subtotalCents)
    if (v.ok) {
      discountCode = v.code.code
      discountCents = Math.max(0, v.discountCents)
    }
  }

  const discountedSubtotal = Math.max(0, subtotalCents - discountCents)

  // 4. Shipping: if the customer picked a live rate at checkout, re-fetch it
  //    server-side and use the fresh cents. If lookup fails (carrier down,
  //    service no longer available), fall back to the flat method — better
  //    to charge flat than drop the order.
  let shippingCents = 0
  let selectedShipping: SelectedShipping = null
  if (input.liveRate) {
    const totalWeightGrams =
      site.parcelDefaults.baseGrams +
      site.parcelDefaults.perItemGrams *
        items.reduce((s, i) => s + i.qty, 0)
    const refetched = await refetchLiveRate({
      carrier: input.liveRate.carrier,
      serviceCode: input.liveRate.serviceCode,
      toPostal: input.shippingAddress.postal,
      toCountry: input.shippingAddress.country,
      toCity: input.shippingAddress.city,
      weightGrams: totalWeightGrams,
    })
    if (refetched) {
      shippingCents = Math.max(0, refetched.totalCents)
      selectedShipping = {
        carrier: input.liveRate.carrier,
        serviceCode: refetched.serviceCode,
        serviceName: refetched.serviceName,
      }
    } else {
      // Live rate unavailable — flat fallback.
      shippingCents = computeShippingCents(input.shippingMethod, discountedSubtotal)
    }
  } else {
    shippingCents = computeShippingCents(input.shippingMethod, discountedSubtotal)
  }

  const taxCents = Math.max(0, Math.round(discountedSubtotal * TAX_RATE))
  const totalCents = Math.max(0, discountedSubtotal + shippingCents + taxCents)
  const id = token(8)
  const placedAt = new Date().toISOString()
  const paymentStatus: PaymentStatus = input.paymentStatus ?? 'paid'
  const order: Order = {
    id: `o_${id}`,
    number: `NM-${id.slice(0, 10)}`,
    placedAt,
    customer: input.customer,
    items,
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents,
    discountCode,
    discountCents,
    shippingAddress: input.shippingAddress,
    selectedShipping,
    paymentStatus,
    cancelled: false,
    fulfillment: { status: 'unfulfilled' },
    timeline: [
      { at: placedAt, label: 'Order placed' },
      ...(selectedShipping
        ? [
            {
              at: placedAt,
              label: `Selected ${selectedShipping.carrier.toUpperCase()} ${selectedShipping.serviceName}`,
            },
          ]
        : []),
      ...(discountCode ? [{ at: placedAt, label: `Discount ${discountCode} applied` }] : []),
      ...(paymentStatus === 'paid' ? [{ at: placedAt, label: 'Payment captured' }] : []),
    ],
  }
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('orders').insert(orderToRow(order))
    if (error) throw error
  } else {
    orders.unshift(order)
  }

  // Bump the discount-code uses_count. Best-effort; failure doesn't fail
  // the order (it just means a code might over-apply by 1 in rare races).
  if (discountCode) {
    try {
      await incrementDiscountUse(discountCode)
    } catch (e) {
      console.error('[createOrder] increment discount use failed:', e)
    }
  }

  // Decrement on-hand stock for each line item. Best-effort: if update fails
  // we log but don't fail the whole order (the order is already persisted;
  // under-counting stock is safer than losing the order). Real inventory
  // accuracy requires a DB transaction — future work when volume warrants it.
  //
  // We reuse the products we already fetched (see step 1), one per input row.
  for (let i = 0; i < input.items.length; i++) {
    const p = products[i]!
    const qty = items[i].qty // server-clamped
    const next = Math.max(0, (p.stock ?? 0) - qty)
    try {
      await setProductStock(p.id, next)
    } catch (e) {
      console.error('Stock decrement failed for', p.id, e)
    }
  }

  return order
}
/** Customers are derived from the order book — one entry per email, with
 *  totals + counts rolled up from their orders. Keeps customers always in
 *  sync with reality (no separate seed/table to drift). */
export async function getCustomers(): Promise<Customer[]> {
  const all = await getOrders()
  const byEmail = new Map<string, Customer>()
  for (const o of all) {
    const email = o.customer.email.toLowerCase()
    const addr = o.shippingAddress
    const location = [addr.city, addr.region].filter(Boolean).join(', ')
    const existing = byEmail.get(email)
    if (existing) {
      existing.ordersCount += 1
      if (o.paymentStatus === 'paid' && !o.cancelled) {
        existing.totalSpentCents += o.totalCents
      }
      if (o.placedAt < existing.since) existing.since = o.placedAt
    } else {
      byEmail.set(email, {
        id: `c_${email}`,
        name: o.customer.name,
        email: o.customer.email,
        location,
        ordersCount: 1,
        totalSpentCents:
          o.paymentStatus === 'paid' && !o.cancelled ? o.totalCents : 0,
        since: o.placedAt,
      })
    }
  }
  return Array.from(byEmail.values()).sort((a, b) =>
    b.totalSpentCents - a.totalSpentCents,
  )
}

// ── Ticket ⇄ DB row mapping ──
function rowToTicket(r: any): Ticket {
  return {
    id: r.id,
    subject: r.subject,
    customer: r.customer,
    orderNumber: r.order_number ?? undefined,
    status: r.status,
    messages: r.messages,
    createdAt: r.created_at,
  }
}

/** PostgREST error code raised when the table doesn't exist in the schema cache
 *  (i.e. supabase/schema.sql hasn't been run yet). Treat that as "no rows" so
 *  the admin shows an empty inbox instead of a 500. */
function isMissingTableError(err: unknown): boolean {
  return Boolean(err && typeof err === 'object' && (err as { code?: string }).code === 'PGRST205')
}

export async function getTickets(): Promise<Ticket[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      if (isMissingTableError(error)) return []
      throw error
    }
    return (data ?? []).map(rowToTicket)
  }
  return [...tickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getTicket(id: string): Promise<Ticket | undefined> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) {
      if (isMissingTableError(error)) return undefined
      throw error
    }
    return data ? rowToTicket(data) : undefined
  }
  return tickets.find((t) => t.id === id)
}

export type ProductInventory = {
  id: string
  name: string
  category: string
  priceCents: number
  stock: number
}
export async function getInventory(): Promise<ProductInventory[]> {
  const products = await getAllProducts()
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    priceCents: p.priceCents,
    stock: p.stock ?? 0,
  }))
}

export type DashboardStats = {
  revenueCents: number
  orderCount: number
  awaitingFulfilment: number
  openTickets: number
  lowStock: number
}
export async function getDashboardStats(): Promise<DashboardStats> {
  const [live, allTickets, inventory] = await Promise.all([
    getOrders().then((os) => os.filter((o) => !o.cancelled)),
    getTickets(),
    getInventory(),
  ])
  return {
    revenueCents: live
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((s, o) => s + o.totalCents, 0),
    orderCount: live.length,
    awaitingFulfilment: live.filter(
      (o) => o.paymentStatus === 'paid' && o.fulfillment.status === 'unfulfilled',
    ).length,
    openTickets: allTickets.filter((t) => t.status !== 'closed').length,
    lowStock: inventory.filter((p) => p.stock <= 5).length,
  }
}

// ── Mutators (called by server actions in ./actions.ts) ──────────────────────
export async function fulfillOrder(
  id: string,
  carrier: string,
  tracking: string,
  labelUrl?: string,
) {
  const o = await getOrder(id)
  if (!o || o.cancelled) return
  const at = new Date().toISOString()
  o.fulfillment = {
    status: 'fulfilled',
    carrier,
    tracking,
    fulfilledAt: at,
    labelUrl: labelUrl || undefined,
  }
  if (o.paymentStatus === 'pending') o.paymentStatus = 'paid'
  o.timeline.push({ at, label: `Fulfilled via ${carrier}${tracking ? ` · ${tracking}` : ''}` })
  await persistOrder(o)
}

export async function markOrderPaid(id: string) {
  const o = await getOrder(id)
  if (!o || o.cancelled || o.paymentStatus === 'paid') return
  o.paymentStatus = 'paid'
  o.timeline.push({ at: new Date().toISOString(), label: 'Payment captured' })
  await persistOrder(o)
}

export async function cancelOrder(id: string) {
  const o = await getOrder(id)
  if (!o || o.cancelled) return
  o.cancelled = true
  if (o.paymentStatus === 'paid') o.paymentStatus = 'refunded'
  o.timeline.push({ at: new Date().toISOString(), label: 'Order cancelled · refunded' })
  await persistOrder(o)
}

export async function addTicketReply(id: string, body: string) {
  const trimmed = body.trim()
  if (!trimmed) return
  const t = await getTicket(id)
  if (!t) return
  const messages = [
    ...t.messages,
    { from: 'store' as const, body: trimmed, at: new Date().toISOString() },
  ]
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('tickets')
      .update({ messages, status: 'pending' })
      .eq('id', id)
    if (error) throw error
  } else {
    const live = tickets.find((x) => x.id === id)
    if (live) {
      live.messages = messages
      live.status = 'pending'
    }
  }
}

export async function setTicketStatus(id: string, status: TicketStatus) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', id)
    if (error) throw error
  } else {
    const live = tickets.find((x) => x.id === id)
    if (live) live.status = status
  }
}

export async function setStock(productId: string, stock: number) {
  await setProductStock(productId, Math.max(0, Math.floor(stock)))
}
