// Buy a DHL Express label for an order (admin-only).
// Same shape as the Canada Post + FedEx routes.

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import {
  createShipment,
  dhlCanCreateShipment,
  type ShippingDestination,
} from '@/lib/shipping/dhl'
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

  if (!dhlCanCreateShipment()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'DHL is not fully configured. Fill DHL_* env vars + SHIPPING_ORIGIN_* address.',
      },
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
    return NextResponse.json({ ok: false, error: 'order is already fulfilled' }, { status: 409 })
  }

  const totalItems = order.items.reduce((s, i) => s + i.qty, 0)
  const p = site.parcelDefaults
  const weightGrams = p.baseGrams + p.perItemGrams * totalItems

  const to: ShippingDestination = {
    name: order.customer.name,
    email: order.customer.email,
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

    await fulfillOrder(order.id, 'DHL Express', shipment.trackingNumber)
    void (async () => {
      try {
        const fresh = await getOrder(order.id)
        if (fresh) await sendShippedNotification(fresh)
      } catch (err) {
        console.error('[dhl/labels] shipped email failed:', err)
      }
    })()

    return NextResponse.json({
      ok: true,
      trackingPin: shipment.trackingNumber,
      labelUrl: shipment.labelUrl,
      totalCents: shipment.totalCents,
    })
  } catch (e) {
    console.error('[dhl/labels] createShipment failed:', e)
    return NextResponse.json(
      { ok: false, error: (e as Error).message || 'label creation failed' },
      { status: 502 },
    )
  }
}
