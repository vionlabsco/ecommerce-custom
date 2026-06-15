'use server'

// Server Actions — the write side of the backend. Each runs on the server,
// mutates the store, then revalidates the affected pages so the UI refreshes.
// In production these would wrap database writes (and, for fulfilment, a call
// to a shipping API; for refunds, a call to Stripe).

import { revalidatePath } from 'next/cache'
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
  const id = String(formData.get('orderId') ?? '')
  const carrier = String(formData.get('carrier') ?? '') || 'Standard'
  const tracking = String(formData.get('tracking') ?? '')
  await fulfillOrder(id, carrier, tracking)
  revalidateOrder(id)
}

export async function markPaidAction(formData: FormData) {
  const id = String(formData.get('orderId') ?? '')
  await markOrderPaid(id)
  revalidateOrder(id)
}

export async function cancelOrderAction(formData: FormData) {
  const id = String(formData.get('orderId') ?? '')
  await cancelOrder(id)
  revalidateOrder(id)
}

function revalidateTicket(id?: string) {
  revalidatePath('/admin')
  revalidatePath('/admin/support')
  if (id) revalidatePath(`/admin/support/${id}`)
}

export async function replyTicketAction(formData: FormData) {
  const id = String(formData.get('ticketId') ?? '')
  const body = String(formData.get('body') ?? '')
  addTicketReply(id, body)
  revalidateTicket(id)
}

export async function ticketStatusAction(formData: FormData) {
  const id = String(formData.get('ticketId') ?? '')
  const status = String(formData.get('status') ?? 'open') as TicketStatus
  setTicketStatus(id, status)
  revalidateTicket(id)
}

export async function setStockAction(formData: FormData) {
  const productId = String(formData.get('productId') ?? '')
  const stock = Number(formData.get('stock') ?? 0)
  setStock(productId, Number.isFinite(stock) ? stock : 0)
  revalidatePath('/admin')
  revalidatePath('/admin/products')
}
