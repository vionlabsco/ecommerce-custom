'use server'

// Server action invoked by the storefront checkout. Creating the order here is
// what links the two sides: the order lands in the same store the admin reads,
// so a purchase shows up in the back-office immediately.
//
// Payment is still simulated (the order is recorded as paid). When Stripe is
// wired next, this is created as `pending` and the webhook flips it to paid.

import { createOrder, type NewOrderInput } from '@/lib/admin/store'

export async function placeOrder(
  input: NewOrderInput,
): Promise<{ number: string; totalCents: number }> {
  const order = await createOrder(input)
  return { number: order.number, totalCents: order.totalCents }
}
