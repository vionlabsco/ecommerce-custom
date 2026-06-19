// Transactional email helper. Wraps Resend so the rest of the app just calls
// sendOrderConfirmation(order) — no SDK details leak elsewhere.
//
// Configured via two env vars:
//   RESEND_API_KEY  → from https://resend.com → API Keys
//   RESEND_FROM     → e.g. "Vionlabs <orders@send.vionlabs.co>"
//                     (or "onboarding@resend.dev" for testing before DNS is up)
//
// If either is unset, sendOrderConfirmation is a no-op that logs and returns
// — so the order itself never fails because the email did.

import { Resend } from 'resend'
import type { Order } from '@/lib/admin/store'
import { formatPrice } from '@/lib/format'
import { site } from '@/lib/site'
import { buildTracking } from '@/lib/tracking'

const STORE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vionlabs.co'

const apiKey = process.env.RESEND_API_KEY
const fromAddress = process.env.RESEND_FROM

let _client: Resend | null = null
function client(): Resend | null {
  if (!apiKey) return null
  if (_client) return _client
  _client = new Resend(apiKey)
  return _client
}

export const isEmailConfigured = Boolean(apiKey && fromAddress)

export async function sendOrderConfirmation(order: Order): Promise<void> {
  const c = client()
  if (!c || !fromAddress) {
    console.warn(
      '[email] RESEND_API_KEY or RESEND_FROM missing — skipping order confirmation.',
    )
    return
  }
  if (!order.customer.email) {
    console.warn('[email] Order has no customer email — skipping.')
    return
  }

  try {
    const { error } = await c.emails.send({
      from: fromAddress,
      to: order.customer.email,
      subject: `Your ${site.brand} order ${order.number} is confirmed`,
      html: renderOrderHtml(order),
      text: renderOrderText(order),
    })
    if (error) {
      console.error('[email] Resend rejected the order email:', error)
    }
  } catch (err) {
    console.error('[email] Failed to send order confirmation:', err)
  }
}

/** Sent when admin marks an order fulfilled. Includes a tracking link the
 *  customer can click, plus a link back to the order success page (which
 *  now also surfaces tracking). */
export async function sendShippedNotification(order: Order): Promise<void> {
  const c = client()
  if (!c || !fromAddress) return
  if (!order.customer.email) return
  if (order.fulfillment.status !== 'fulfilled') return

  const tracking = buildTracking(order.fulfillment.carrier, order.fulfillment.tracking)
  if (!tracking) {
    console.warn('[email] Order fulfilled without carrier+tracking — skipping shipped email.')
    return
  }

  try {
    const { error } = await c.emails.send({
      from: fromAddress,
      to: order.customer.email,
      subject: `Your ${site.brand} order ${order.number} has shipped`,
      html: renderShippedHtml(order, tracking),
      text: renderShippedText(order, tracking),
    })
    if (error) console.error('[email] Resend rejected shipped email:', error)
  } catch (err) {
    console.error('[email] Failed to send shipped notification:', err)
  }
}

function renderOrderHtml(o: Order): string {
  const itemsHtml = o.items
    .map(
      (i) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#0a0a0a;font-size:14px;">
          <div style="font-weight:600;">${escape(i.name)}</div>
          <div style="color:#525252;font-size:12px;margin-top:2px;">${escape(i.variant)} · Qty ${i.qty}</div>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;font-variant-numeric:tabular-nums;color:#0a0a0a;font-size:14px;font-weight:600;">
          ${formatPrice(i.priceCents * i.qty)}
        </td>
      </tr>`,
    )
    .join('')

  const a = o.shippingAddress
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Order ${escape(o.number)}</title>
</head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0a0a0a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafafa;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
        <tr><td style="padding:32px 32px 0 32px;">
          <div style="font-weight:700;letter-spacing:0.18em;font-size:16px;color:#0a0a0a;">${escape(site.brand)}</div>
        </td></tr>

        <tr><td style="padding:24px 32px 8px 32px;">
          <div style="color:#ff5c28;font-weight:600;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">Order confirmed</div>
          <h1 style="margin:8px 0 0 0;font-size:24px;line-height:1.2;font-weight:700;color:#0a0a0a;">
            Thanks${o.customer.name ? `, ${escape(o.customer.name.split(' ')[0])}` : ''} — your order is in.
          </h1>
          <p style="margin:8px 0 0 0;color:#525252;font-size:14px;line-height:1.6;">
            We&rsquo;ll pack it within 1&ndash;2 business days and send tracking the moment it ships.
          </p>
        </td></tr>

        <tr><td style="padding:24px 32px 0 32px;">
          <div style="background:#fff1ec;border-radius:8px;padding:14px 16px;color:#0a0a0a;font-size:13px;">
            Order <strong>${escape(o.number)}</strong> &middot; Placed ${new Date(o.placedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
          </div>
        </td></tr>

        <tr><td style="padding:24px 32px 0 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${itemsHtml}
          </table>
        </td></tr>

        <tr><td style="padding:16px 32px 0 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;color:#525252;">
            <tr><td style="padding:4px 0;">Subtotal</td><td style="padding:4px 0;text-align:right;font-variant-numeric:tabular-nums;">${formatPrice(o.subtotalCents)}</td></tr>
            ${o.discountCents > 0 ? `<tr><td style="padding:4px 0;color:#ff5c28;">Discount${o.discountCode ? ` · ${escape(o.discountCode)}` : ''}</td><td style="padding:4px 0;text-align:right;font-variant-numeric:tabular-nums;color:#ff5c28;">−${formatPrice(o.discountCents)}</td></tr>` : ''}
            <tr><td style="padding:4px 0;">Shipping</td><td style="padding:4px 0;text-align:right;font-variant-numeric:tabular-nums;">${o.shippingCents === 0 ? 'Free' : formatPrice(o.shippingCents)}</td></tr>
            <tr><td style="padding:4px 0;">Estimated tax</td><td style="padding:4px 0;text-align:right;font-variant-numeric:tabular-nums;">${formatPrice(o.taxCents)}</td></tr>
            <tr><td style="padding:12px 0 4px 0;border-top:1px solid #e5e7eb;font-size:16px;font-weight:700;color:#0a0a0a;">Total</td><td style="padding:12px 0 4px 0;border-top:1px solid #e5e7eb;text-align:right;font-variant-numeric:tabular-nums;font-size:16px;font-weight:700;color:#0a0a0a;">${formatPrice(o.totalCents)}</td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 32px 0 32px;">
          <div style="color:#ff5c28;font-weight:600;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">Shipping to</div>
          <div style="margin-top:6px;color:#0a0a0a;font-size:14px;line-height:1.5;">
            ${escape(o.customer.name)}<br />
            ${escape(a.line1)}<br />
            ${escape(a.city)}, ${escape(a.region)} ${escape(a.postal)}<br />
            ${escape(a.country)}
          </div>
        </td></tr>

        <tr><td style="padding:32px 32px 32px 32px;">
          <p style="margin:0;color:#525252;font-size:13px;line-height:1.6;">
            Questions about your order? Reply to this email or write to <a href="mailto:${escape(site.contactEmail)}" style="color:#ff5c28;text-decoration:none;">${escape(site.contactEmail)}</a> &mdash; we read every message.
          </p>
        </td></tr>
      </table>

      <p style="margin:18px 0 0 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#9ca3af;">
        ${escape(site.brand)} &middot; Built to last
      </p>
    </td></tr>
  </table>
</body>
</html>`
}

function renderOrderText(o: Order): string {
  const items = o.items
    .map((i) => `  - ${i.name} (${i.variant}) × ${i.qty}  ${formatPrice(i.priceCents * i.qty)}`)
    .join('\n')
  const a = o.shippingAddress
  return [
    `${site.brand} — order confirmed`,
    '',
    `Hi${o.customer.name ? ` ${o.customer.name.split(' ')[0]}` : ''}, your order is in.`,
    `We'll pack it within 1–2 business days and send tracking the moment it ships.`,
    '',
    `Order ${o.number}`,
    `Placed: ${new Date(o.placedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}`,
    '',
    'Items:',
    items,
    '',
    `Subtotal: ${formatPrice(o.subtotalCents)}`,
    ...(o.discountCents > 0
      ? [`Discount${o.discountCode ? ` (${o.discountCode})` : ''}: −${formatPrice(o.discountCents)}`]
      : []),
    `Shipping: ${o.shippingCents === 0 ? 'Free' : formatPrice(o.shippingCents)}`,
    `Tax:      ${formatPrice(o.taxCents)}`,
    `Total:    ${formatPrice(o.totalCents)}`,
    '',
    'Shipping to:',
    `  ${o.customer.name}`,
    `  ${a.line1}`,
    `  ${a.city}, ${a.region} ${a.postal}`,
    `  ${a.country}`,
    '',
    `Questions? Reply to this email or write to ${site.contactEmail}.`,
  ].join('\n')
}

function renderShippedHtml(
  o: Order,
  t: { carrierLabel: string; trackingNumber: string; url: string | null },
): string {
  const orderUrl = `${STORE_URL}/checkout/success?order=${encodeURIComponent(o.number)}&total=${o.totalCents}`
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Order ${escape(o.number)} shipped</title></head>
<body style="margin:0;padding:0;background:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0a0a0a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafafa;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">

        <tr><td style="padding:32px 32px 0 32px;">
          <div style="font-weight:700;letter-spacing:0.18em;font-size:16px;color:#0a0a0a;">${escape(site.brand)}</div>
        </td></tr>

        <tr><td style="padding:24px 32px 8px 32px;">
          <div style="color:#ff5c28;font-weight:600;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">Shipped</div>
          <h1 style="margin:8px 0 0 0;font-size:24px;line-height:1.2;font-weight:700;color:#0a0a0a;">
            Your order is on the way${o.customer.name ? `, ${escape(o.customer.name.split(' ')[0])}` : ''}.
          </h1>
          <p style="margin:8px 0 0 0;color:#525252;font-size:14px;line-height:1.6;">
            Order <strong>${escape(o.number)}</strong> shipped via ${escape(t.carrierLabel)}. Use the tracking link below for live status.
          </p>
        </td></tr>

        <tr><td style="padding:24px 32px 0 32px;">
          <div style="background:#fff1ec;border-radius:8px;padding:18px;">
            <div style="color:#ff5c28;font-weight:600;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">Tracking</div>
            <div style="margin-top:6px;color:#525252;font-size:14px;">${escape(t.carrierLabel)}</div>
            <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:13px;color:#0a0a0a;margin-top:4px;">${escape(t.trackingNumber)}</div>
            ${t.url ? `
            <div style="margin-top:14px;">
              <a href="${escape(t.url)}" style="display:inline-block;background:#ff5c28;color:#ffffff;padding:10px 18px;border-radius:6px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;text-decoration:none;">
                Track your package &rarr;
              </a>
            </div>` : ''}
          </div>
        </td></tr>

        <tr><td style="padding:24px 32px 32px 32px;">
          <p style="margin:0;color:#525252;font-size:13px;line-height:1.6;">
            You can also see this order &mdash; including the tracking link &mdash; at
            <a href="${escape(orderUrl)}" style="color:#ff5c28;text-decoration:none;">your order page</a>.
            Questions? Reply to this email or write to <a href="mailto:${escape(site.contactEmail)}" style="color:#ff5c28;text-decoration:none;">${escape(site.contactEmail)}</a>.
          </p>
        </td></tr>
      </table>
      <p style="margin:18px 0 0 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#9ca3af;">${escape(site.brand)} &middot; Built to last</p>
    </td></tr>
  </table>
</body>
</html>`
}

function renderShippedText(
  o: Order,
  t: { carrierLabel: string; trackingNumber: string; url: string | null },
): string {
  return [
    `${site.brand} — order shipped`,
    '',
    `Your order ${o.number} is on the way${o.customer.name ? `, ${o.customer.name.split(' ')[0]}` : ''}.`,
    '',
    `Carrier: ${t.carrierLabel}`,
    `Tracking: ${t.trackingNumber}`,
    ...(t.url ? ['', `Track it: ${t.url}`] : []),
    '',
    `Order page: ${STORE_URL}/checkout/success?order=${encodeURIComponent(o.number)}&total=${o.totalCents}`,
    '',
    `Questions? ${site.contactEmail}`,
  ].join('\n')
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
