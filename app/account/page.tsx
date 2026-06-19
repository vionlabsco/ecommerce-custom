import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { getOrdersByEmail, type Order } from '@/lib/admin/store'
import { formatPrice } from '@/lib/format'

export const metadata: Metadata = { title: 'Your account' }
export const dynamic = 'force-dynamic'

function statusLabel(o: Order): { label: string; tone: string } {
  if (o.cancelled) return { label: 'Cancelled', tone: 'bg-rose-50 text-rose-700' }
  if (o.fulfillment.status === 'fulfilled')
    return { label: 'Shipped', tone: 'bg-emerald-50 text-emerald-700' }
  if (o.paymentStatus === 'pending')
    return { label: 'Payment pending', tone: 'bg-amber-50 text-amber-700' }
  return { label: 'Processing', tone: 'bg-accent-soft text-accent' }
}

export default async function AccountPage() {
  // Middleware guarantees this header is set for /account/* (and signed-in
  // customers are gated to this subtree). If it's missing we still defend
  // by short-circuiting to a "please sign in" prompt.
  const email = headers().get('x-customer-email')
  if (!email) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="font-display text-3xl">Sign in to see your account</h1>
        <Link
          href="/account/login"
          className="mt-6 inline-block rounded-md bg-accent px-6 py-3 text-[12px] font-bold uppercase tracking-widest2 text-paper hover:bg-accent-hover"
        >
          Sign in
        </Link>
      </div>
    )
  }

  const orders = await getOrdersByEmail(email)

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-accent">Account</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink md:text-4xl">
            Your orders
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Signed in as <span className="text-ink">{email}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/account/wishlist"
            className="rounded-md border border-line bg-paper px-3 py-2 text-[11px] font-medium uppercase tracking-widest2 text-ink-soft transition-colors hover:border-accent hover:text-accent"
          >
            Wishlist
          </Link>
          <form action="/account/auth/signout" method="post">
            <button
              type="submit"
              className="rounded-md border border-line bg-paper px-3 py-2 text-[11px] font-medium uppercase tracking-widest2 text-ink-soft transition-colors hover:border-accent hover:text-accent"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mt-8 space-y-3">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-line bg-card p-10 text-center">
            <p className="label-mono">Nothing here yet</p>
            <p className="mt-2 font-display text-xl font-bold text-ink">
              You haven&apos;t ordered anything yet
            </p>
            <p className="mt-1.5 text-sm text-ink-soft">
              When you do, your orders + tracking will live right here.
            </p>
            <Link
              href="/shop"
              className="mt-5 inline-block rounded-md bg-accent px-5 py-2.5 text-[12px] font-bold uppercase tracking-widest2 text-paper hover:bg-accent-hover"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          orders.map((o) => {
            const status = statusLabel(o)
            return (
              <Link
                key={o.id}
                href={`/account/orders/${encodeURIComponent(o.number)}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-line bg-paper px-5 py-4 transition-colors hover:border-accent/40 hover:bg-card"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-[13px] font-semibold text-ink">{o.number}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide ${status.tone}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] text-ink-soft">
                    {new Date(o.placedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })} ·{' '}
                    {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-base font-bold tabular-nums text-ink">
                    {formatPrice(o.totalCents)}
                  </p>
                  <p className="text-[11px] font-medium uppercase tracking-widest2 text-ink-mute">
                    View →
                  </p>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
