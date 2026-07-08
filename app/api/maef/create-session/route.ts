import { NextRequest, NextResponse } from 'next/server'
import { createMaefSession } from '@/lib/maef'
import { getOrderByNumber } from '@/lib/admin/store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Called by the checkout on "Place order". Looks up the just-created order by
// number and signs the DB total for the payment parent — the client CANNOT
// influence the amount charged. (Prior to this hardening, the client posted
// `totalCents` verbatim, so anyone could pay $1 for a $100 cart.)
//
// Order numbers are `NM-` + 40 bits of random — not enumerable — so requiring
// the number as the only identifier is safe.
export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON' }, { status: 400 })
  }

  const orderNumber = String(body?.orderNumber || '').trim()
  const b = body?.billing || {}
  if (!/^[A-Za-z]{1,4}-[A-Za-z0-9]{6,32}$/.test(orderNumber)) {
    return NextResponse.json({ ok: false, error: 'missing or malformed order number' }, { status: 400 })
  }
  if (!b.email || !b.first_name) {
    return NextResponse.json({ ok: false, error: 'missing billing details' }, { status: 400 })
  }

  // Server-authoritative order lookup. Reject anything that isn't a valid,
  // still-pending order — we won't re-open a session for a paid order.
  const order = await getOrderByNumber(orderNumber)
  if (!order) {
    return NextResponse.json({ ok: false, error: 'order not found' }, { status: 404 })
  }
  if (order.paymentStatus === 'paid' || order.paymentStatus === 'refunded' || order.cancelled) {
    return NextResponse.json({ ok: false, error: 'order not payable' }, { status: 409 })
  }

  // Confirm billing email matches the order's customer email — mild replay
  // defense so a leaked order number doesn't let a third party pay against it
  // with their own card (unlikely attack, but the check is free).
  if (String(b.email).trim().toLowerCase() !== order.customer.email.trim().toLowerCase()) {
    return NextResponse.json({ ok: false, error: 'billing email mismatch' }, { status: 403 })
  }

  // Numeric reference the parent expects. Derive from the order number's
  // digits so it's stable across retries; fall back to a timestamp if the
  // number happens to be all letters.
  const digits = orderNumber.replace(/\D/g, '')
  const ref = digits ? Number(digits.slice(-9)) : Math.floor(Date.now() / 1000)

  const shippingLabel = order.shippingCents > 800 ? 'Express' : 'Standard'

  const result = await createMaefSession({
    ref,
    totalDollars: order.totalCents / 100, // ← authoritative DB total
    shippingLabel,
    billing: {
      first_name: String(b.first_name || ''),
      last_name: String(b.last_name || ''),
      email: order.customer.email, // ← authoritative order email
      phone: String(b.phone || ''),
      address_1: String(b.address_1 || ''),
      address_2: String(b.address_2 || ''),
      city: String(b.city || ''),
      state: String(b.state || ''),
      postcode: String(b.postcode || ''),
      country: String(b.country || 'US'),
    },
  })

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 })
  }
  return NextResponse.json({ ok: true, redirect_url: result.redirect_url })
}
