import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckoutForm } from '@/components/CheckoutForm'

export const metadata: Metadata = { title: 'Checkout' }

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-shell px-5 py-10 md:px-8 md:py-14">
      <div className="mb-10 flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl md:text-4xl">Checkout</h1>
        <Link
          href="/shop"
          className="shrink-0 text-[13px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
        >
          ← Continue shopping
        </Link>
      </div>
      <CheckoutForm />
    </div>
  )
}
