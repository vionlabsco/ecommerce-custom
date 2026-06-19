import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-32 text-center">
      <p className="font-display text-7xl leading-none text-accent">404</p>
      <h1 className="mt-5 font-display text-3xl md:text-4xl">We couldn&apos;t find that page</h1>
      <p className="mt-3 text-ink-soft">
        It may have moved, sold out, or never existed. Let&apos;s get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-accent px-7 py-3.5 text-[13px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-accent-hover"
        >
          Back home
        </Link>
        <Link
          href="/shop"
          className="rounded-full border border-ink/20 px-7 py-3.5 text-[13px] uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink"
        >
          Browse the shop
        </Link>
      </div>
    </div>
  )
}
