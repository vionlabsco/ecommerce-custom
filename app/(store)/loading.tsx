// Streams instantly on every storefront navigation so clicks feel responsive
// while the server does data fetching. Next.js streams this BEFORE the
// page component begins rendering — no blank-screen delay.

export default function StorefrontLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 md:px-8">
      <div className="h-6 w-32 rounded bg-ink/5" />
      <div className="mt-3 h-10 w-2/3 rounded bg-ink/10 md:w-1/2" />
      <div className="mt-2 h-5 w-1/3 rounded bg-ink/5" />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square rounded-lg bg-ink/5" />
            <div className="h-4 w-3/4 rounded bg-ink/10" />
            <div className="h-3 w-1/3 rounded bg-ink/5" />
          </div>
        ))}
      </div>
    </div>
  )
}
