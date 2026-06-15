// ──────────────────────────────────────────────────────────────────────────
// Admin "backend" — an in-memory data store seeded with sample data.
//
// This is the operational data layer for the admin back-office: orders,
// customers, support tickets, and inventory. It's deliberately in-memory so the
// demo runs with zero setup — the trade-off is that it RESETS when the server
// restarts. In production this module is exactly what you'd replace with a
// database (Supabase/Postgres): keep these function signatures, swap the bodies
// for queries. The server actions in ./actions.ts call the mutators below.
// ──────────────────────────────────────────────────────────────────────────

import { PRODUCTS } from '@/lib/products'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type FulfillmentStatus = 'unfulfilled' | 'fulfilled'
export type TicketStatus = 'open' | 'pending' | 'closed'

export type OrderItem = { name: string; variant: string; qty: number; priceCents: number }
export type TimelineEvent = { at: string; label: string }

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
  shippingAddress: { line1: string; city: string; region: string; postal: string; country: string }
  paymentStatus: PaymentStatus
  cancelled: boolean
  fulfillment: { status: FulfillmentStatus; carrier?: string; tracking?: string; fulfilledAt?: string }
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
  'subtotalCents' | 'shippingCents' | 'taxCents' | 'totalCents'
>

/** Compute money from items so seed totals are always internally consistent. */
function seedOrder(o: OrderSeed): Order {
  const subtotalCents = o.items.reduce((s, i) => s + i.priceCents * i.qty, 0)
  const shippingCents = subtotalCents >= FREE_SHIP_CENTS ? 0 : FLAT_SHIP_CENTS
  const taxCents = Math.round(subtotalCents * TAX_RATE)
  const totalCents = subtotalCents + shippingCents + taxCents
  return { ...o, subtotalCents, shippingCents, taxCents, totalCents }
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

const SEED_CUSTOMERS: Customer[] = [
  { id: 'c_1', name: 'Hannah Pereira', email: 'hannah.p@email.com', location: 'Portland, OR', ordersCount: 2, totalSpentCents: 30000, since: '2026-03-02' },
  { id: 'c_2', name: 'Marcus Lindqvist', email: 'm.lindqvist@email.com', location: 'Brooklyn, NY', ordersCount: 1, totalSpentCents: 26521, since: '2026-05-19' },
  { id: 'c_3', name: 'Daniel Osei', email: 'daniel.osei@email.com', location: 'Austin, TX', ordersCount: 2, totalSpentCents: 51060, since: '2026-01-28' },
  { id: 'c_4', name: 'Sofia Marchetti', email: 'sofia.m@email.com', location: 'Chicago, IL', ordersCount: 1, totalSpentCents: 9242, since: '2026-04-11' },
  { id: 'c_5', name: 'Yuki Tanaka', email: 'yuki.tanaka@email.com', location: 'Seattle, WA', ordersCount: 1, totalSpentCents: 18186, since: '2026-02-15' },
  { id: 'c_6', name: 'Elena Vasquez', email: 'elena.v@email.com', location: 'Boston, MA', ordersCount: 1, totalSpentCents: 26521, since: '2026-06-09' },
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

// Simplified numeric inventory keyed by product id (the storefront uses
// variant-level stock states; this is a per-product count for the demo).
const SEED_STOCK: Record<string, number> = {
  p_garun_sweater: 24,
  p_lambswool_crew: 41,
  p_oxford_shirt: 60,
  p_camp_collar: 18,
  p_chore_jacket: 6,
  p_wide_trouser: 33,
  p_canvas_tote: 52,
  p_wool_beanie: 4,
}
// One shared instance across Next's per-route server bundles (single process),
// so a storefront checkout and an admin read hit the SAME data. (In live mode
// Supabase is that shared instance; this mirrors it for demo mode.)
const _store = ((globalThis as any).__mw_store ??= {
  orders: SEED_ORDERS,
  customers: SEED_CUSTOMERS,
  tickets: SEED_TICKETS,
  stock: { ...SEED_STOCK },
})
const orders: Order[] = _store.orders
const customers: Customer[] = _store.customers
const tickets: Ticket[] = _store.tickets
const stockLevels: Record<string, number> = _store.stock

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
    shippingAddress: r.shipping_address,
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
    shipping_address: o.shippingAddress,
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

export type NewOrderInput = {
  customer: { name: string; email: string }
  items: OrderItem[]
  shippingAddress: Order['shippingAddress']
  shippingCents: number
  paymentStatus?: PaymentStatus
}

/** Create an order from a storefront checkout — this is the storefront → admin
 *  sync: the new order lands in the same store the admin reads. */
export async function createOrder(input: NewOrderInput): Promise<Order> {
  const subtotalCents = input.items.reduce((s, i) => s + i.priceCents * i.qty, 0)
  const taxCents = Math.round(subtotalCents * TAX_RATE)
  const totalCents = subtotalCents + input.shippingCents + taxCents
  const seq = Math.floor(100000 + Math.random() * 900000)
  const placedAt = new Date().toISOString()
  const paymentStatus: PaymentStatus = input.paymentStatus ?? 'paid'
  const order: Order = {
    id: `o_${seq}`,
    number: `MAR-${seq}`,
    placedAt,
    customer: input.customer,
    items: input.items,
    subtotalCents,
    shippingCents: input.shippingCents,
    taxCents,
    totalCents,
    shippingAddress: input.shippingAddress,
    paymentStatus,
    cancelled: false,
    fulfillment: { status: 'unfulfilled' },
    timeline: [
      { at: placedAt, label: 'Order placed' },
      ...(paymentStatus === 'paid' ? [{ at: placedAt, label: 'Payment captured' }] : []),
    ],
  }
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('orders').insert(orderToRow(order))
    if (error) throw error
  } else {
    orders.unshift(order)
  }
  return order
}
export function getCustomers(): Customer[] {
  return customers
}
export function getTickets(): Ticket[] {
  return [...tickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
export function getTicket(id: string): Ticket | undefined {
  return tickets.find((t) => t.id === id)
}

export type ProductInventory = {
  id: string
  name: string
  category: string
  priceCents: number
  stock: number
}
export function getInventory(): ProductInventory[] {
  return PRODUCTS.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    priceCents: p.priceCents,
    stock: stockLevels[p.id] ?? 0,
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
  const live = (await getOrders()).filter((o) => !o.cancelled)
  return {
    revenueCents: live
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((s, o) => s + o.totalCents, 0),
    orderCount: live.length,
    awaitingFulfilment: live.filter(
      (o) => o.paymentStatus === 'paid' && o.fulfillment.status === 'unfulfilled',
    ).length,
    openTickets: tickets.filter((t) => t.status !== 'closed').length,
    lowStock: Object.values(stockLevels).filter((n) => n <= 5).length,
  }
}

// ── Mutators (called by server actions in ./actions.ts) ──────────────────────
export async function fulfillOrder(id: string, carrier: string, tracking: string) {
  const o = await getOrder(id)
  if (!o || o.cancelled) return
  const at = new Date().toISOString()
  o.fulfillment = { status: 'fulfilled', carrier, tracking, fulfilledAt: at }
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

export function addTicketReply(id: string, body: string) {
  const t = getTicket(id)
  if (!t || !body.trim()) return
  t.messages.push({ from: 'store', body: body.trim(), at: new Date().toISOString() })
  t.status = 'pending'
}

export function setTicketStatus(id: string, status: TicketStatus) {
  const t = getTicket(id)
  if (!t) return
  t.status = status
}

export function setStock(productId: string, stock: number) {
  if (!(productId in stockLevels)) return
  stockLevels[productId] = Math.max(0, Math.floor(stock))
}
