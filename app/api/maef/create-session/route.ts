import { NextRequest, NextResponse } from 'next/server'
import { createMaefSession } from '@/lib/maef'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Called by the checkout on "Place order". Receives amounts in CENTS (the
// storefront's native unit) and a billing block; converts to the dollar
// payload the parent expects and returns a redirect URL to the secure
// checkout. No card data ever touches this app.
export async function POST(req: NextRequest) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON' }, { status: 400 })
  }

  const totalCents = Number(body?.totalCents)
  const b = body?.billing || {}
  if (!Number.isFinite(totalCents) || totalCents <= 0) {
    return NextResponse.json({ ok: false, error: 'missing total' }, { status: 400 })
  }
  if (!b.email || !b.first_name) {
    return NextResponse.json({ ok: false, error: 'missing billing details' }, { status: 400 })
  }

  // Numeric reference for this order (the order number is alphanumeric, so we
  // derive a stable integer from its digits, falling back to a timestamp).
  const digits = String(body?.orderNumber || '').replace(/\D/g, '')
  const ref = digits ? Number(digits.slice(-9)) : Math.floor(Date.now() / 1000)

  const result = await createMaefSession({
    ref,
    totalDollars: totalCents / 100,
    shippingLabel: String(body?.shippingLabel || 'Standard'),
    billing: {
      first_name: String(b.first_name || ''),
      last_name: String(b.last_name || ''),
      email: String(b.email || ''),
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
