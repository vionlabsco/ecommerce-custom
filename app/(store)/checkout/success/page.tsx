import Link from 'next/link'
import type { Metadata } from 'next'
import { formatPrice } from '@/lib/format'

export const metadata: Metadata = { title: 'Order confirmed' }

const STEPS = [
  { t: 'Confirmation email', s: 'A receipt is on its way to your inbox.' },
  { t: 'Packed with care', s: 'Your order is hand-packed within 1–2 business days.' },
  { t: 'On its way', s: "We'll send tracking the moment it ships." },
]

export default function SuccessPage({
  searchParams,
}: {
  searchParams: { order?: string; total?: string }
}) {
  const order = searchParams.order ?? 'MAR-000000'
  const totalCents = Number(searchParams.total)
  const hasTotal = Number.isFinite(totalCents) && totalCents > 0

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center md:py-32">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/15">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M5 12.5l4.2 4.2L19 7"
            stroke="#5f6b55"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      <p className="mt-7 text-[12px] uppercase tracking-[0.24em] text-clay">Thank you</p>
      <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
        Your order is confirmed
      </h1>
      <p className="mt-4 max-w-md leading-relaxed text-ink-soft text-pretty">
        We&apos;re thrilled you&apos;re here. A confirmation is on its way, and your pieces will
        be packed and shipped shortly.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 rounded-xl border border-line bg-card px-7 py-4 text-sm">
        <span className="text-ink-soft">
          Order <span className="font-medium text-ink">{order}</span>
        </span>
        {hasTotal && (
          <span className="text-ink-soft">
            Total <span className="font-medium text-ink">{formatPrice(totalCents)}</span>
          </span>
        )}
      </div>

      <div className="mt-12 grid w-full gap-4 text-left sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.t} className="rounded-lg border border-line bg-card p-5">
            <span className="font-display text-2xl text-clay">{i + 1}</span>
            <p className="mt-2 text-sm font-medium">{step.t}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{step.s}</p>
          </div>
        ))}
      </div>

      <Link
        href="/shop"
        className="mt-12 inline-block rounded-full bg-ink px-8 py-3.5 text-[13px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-clay"
      >
        Continue shopping
      </Link>
    </div>
  )
}
