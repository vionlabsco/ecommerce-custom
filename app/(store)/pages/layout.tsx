// Shared chrome for static info pages (shipping, returns, warranty, privacy,
// terms, about, contact). Keeps the typography + max-width consistent.

export default function InfoPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-2xl px-5 py-14 md:px-8 md:py-20">
      <div className="prose-vl space-y-5 text-ink-soft">{children}</div>
    </article>
  )
}
