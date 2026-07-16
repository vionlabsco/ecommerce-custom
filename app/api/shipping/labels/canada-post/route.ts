// Buy a Canada Post label for an order (admin-only).
//
// Flow:
//   POST /api/shipping/labels/canada-post { orderNumber, serviceCode }
//   → look up order in DB
//   → call Canada Post createShipment() with order details
//   → attach tracking PIN + label URL to the order's fulfillment record
//   → return { trackingPin, labelUrl, totalCents } to the admin UI
//
// Admin UI can then download the PDF (open labelUrl in a new tab; Canada Post
// serves it with our HTTP Basic auth, so the fetch is proxied through
// /api/shipping/labels/canada-post/pdf?url=... in a follow-up if needed).

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import {
  createShipment,
  canPostCreateShipment,
  type ShippingAddress,
} from '@/lib/shipping/canada-post'
import { getOrderByNumber, fulfillOrder, getOrder } from '@/lib/admin/store'
import { sendShippedNotification } from '@/lib/email'
import { site } from '@/lib/site'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    requireAdmin()
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  if (!canPostCreateShipment()) {
    return NextResponse.json(
      { ok: false, error: 'Canada Post is not fully configured. Fill CANADA_POST_* env vars.' },
      { status: 503 },
    )
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON' }, { status: 400 })
  }
  const orderNumber = String(body?.orderNumber || '').trim()
  const serviceCode = String(body?.serviceCode || '').trim()
  if (!orderNumber || !serviceCode) {
    return NextResponse.json(
      { ok: false, error: 'orderNumber and serviceCode are required' },
      { status: 400 },
    )
  }

  const order = await getOrderByNumber(orderNumber)
  if (!order) {
    return NextResponse.json({ ok: false, error: 'order not found' }, { status: 404 })
  }
  if (order.fulfillment.status === 'fulfilled') {
    return NextResponse.json(
      { ok: false, error: 'order is already fulfilled' },
      { status: 409 },
    )
  }

  const totalItems = order.items.reduce((s, i) => s + i.qty, 0)
  const p = site.parcelDefaults
  const weightGrams = p.baseGrams + p.perItemGrams * totalItems

  const to: ShippingAddress = {
    name: order.customer.name,
    line1: order.shippingAddress.line1,
    city: order.shippingAddress.city,
    region: order.shippingAddress.region,
    postal: order.shippingAddress.postal,
    country: order.shippingAddress.country || 'CA',
  }

  try {
    const shipment = await createShipment({
      serviceCode,
      weightGrams,
      lengthCm: p.lengthCm,
      widthCm: p.widthCm,
      heightCm: p.heightCm,
      to,
      orderNumber,
    })

    // Attach tracking to the order so the customer sees it on the success
    // page. Fire the shipped-notification email in the background — a slow
    // Resend response shouldn't hold up the admin's "Buy label" click.
    await fulfillOrder(
      order.id,
      'Canada Post',
      shipment.trackingPin,
      shipment.labelUrl,
    )
    void (async () => {
      try {
        const fresh = await getOrder(order.id)
        if (fresh) await sendShippedNotification(fresh)
      } catch (err) {
        console.error('[canada-post/labels] shipped email failed:', err)
      }
    })()

    return NextResponse.json({
      ok: true,
      shipmentId: shipment.shipmentId,
      trackingPin: shipment.trackingPin,
      labelUrl: shipment.labelUrl,
      totalCents: shipment.totalCents,
    })
  } catch (e) {
    console.error('[canada-post/labels] createShipment failed:', e)
    return NextResponse.json(
      { ok: false, error: (e as Error).message || 'label creation failed' },
      { status: 502 },
    )
  }
}
