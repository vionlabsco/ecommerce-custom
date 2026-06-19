'use server'

// Server Actions — the write side of the backend. Each runs on the server,
// mutates the store, then revalidates the affected pages so the UI refreshes.
// In production these would wrap database writes (and, for fulfilment, a call
// to a shipping API; for refunds, a call to Stripe).
//
// SECURITY: every action begins with `requireAdmin()` so it can't be invoked
// from outside the admin even if the action endpoint URL leaks.

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import {
  fulfillOrder,
  markOrderPaid,
  cancelOrder,
  addTicketReply,
  setTicketStatus,
  setStock,
  type TicketStatus,
} from './store'

function revalidateOrder(id?: string) {
  revalidatePath('/admin')
  revalidatePath('/admin/orders')
  if (id) revalidatePath(`/admin/orders/${id}`)
}

export async function fulfillOrderAction(formData: FormData) {
  requireAdmin()
  const id = String(formData.get('orderId') ?? '').slice(0, 64)
  const carrier = (String(formData.get('carrier') ?? '') || 'Standard').slice(0, 64)
  const tracking = String(formData.get('tracking') ?? '').slice(0, 128)
  await fulfillOrder(id, carrier, tracking)
  revalidateOrder(id)
}

export async function markPaidAction(formData: FormData) {
  requireAdmin()
  const id = String(formData.get('orderId') ?? '').slice(0, 64)
  await markOrderPaid(id)
  revalidateOrder(id)
}

export async function cancelOrderAction(formData: FormData) {
  requireAdmin()
  const id = String(formData.get('orderId') ?? '').slice(0, 64)
  await cancelOrder(id)
  revalidateOrder(id)
}

function revalidateTicket(id?: string) {
  revalidatePath('/admin')
  revalidatePath('/admin/support')
  if (id) revalidatePath(`/admin/support/${id}`)
}

export async function replyTicketAction(formData: FormData) {
  requireAdmin()
  const id = String(formData.get('ticketId') ?? '').slice(0, 64)
  const body = String(formData.get('body') ?? '').slice(0, 5000)
  await addTicketReply(id, body)
  revalidateTicket(id)
}

export async function ticketStatusAction(formData: FormData) {
  requireAdmin()
  const id = String(formData.get('ticketId') ?? '').slice(0, 64)
  const raw = String(formData.get('status') ?? 'open')
  const status: TicketStatus = ['open', 'pending', 'closed'].includes(raw)
    ? (raw as TicketStatus)
    : 'open'
  await setTicketStatus(id, status)
  revalidateTicket(id)
}

export async function setStockAction(formData: FormData) {
  requireAdmin()
  const productId = String(formData.get('productId') ?? '').slice(0, 64)
  const stock = Number(formData.get('stock') ?? 0)
  await setStock(productId, Number.isFinite(stock) ? Math.min(stock, 999_999) : 0)
  revalidatePath('/admin')
  revalidatePath('/admin/products')
}
