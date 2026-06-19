'use server'

// Server action invoked by the storefront checkout. Creating the order here is
// what links the two sides: the order lands in the same store the admin reads,
// so a purchase shows up in the back-office immediately.
//
// Payment is still simulated (the order is recorded as paid). When Stripe is
// wired next, this is created as `pending` and the webhook flips it to paid.

import { createOrder, getOrder, type NewOrderInput } from '@/lib/admin/store'
import { sendOrderConfirmation } from '@/lib/email'

export async function placeOrder(
  input: NewOrderInput,
): Promise<{ number: string; totalCents: number }> {
  const order = await createOrder(input)

  // Fire the order-confirmation email. We don't await it — the customer
  // shouldn't see the success page held up by a slow email API, and if
  // Resend is down the order itself must not fail. The email function
  // handles its own errors and logs them.
  void (async () => {
    try {
      const full = (await getOrder(order.id)) ?? order
      await sendOrderConfirmation(full)
    } catch (err) {
      console.error('[placeOrder] order email failed:', err)
    }
  })()

  return { number: order.number, totalCents: order.totalCents }
}
