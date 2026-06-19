// Product-page-shaped skeleton (image left, info right) so the click → render
// transition looks intentional instead of empty.

export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 md:px-8">
      <div className="h-3 w-48 rounded bg-ink/5" />

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        <div className="aspect-square rounded-lg bg-ink/5" />
        <div className="space-y-4">
          <div className="h-3 w-24 rounded bg-ink/10" />
          <div className="h-10 w-3/4 rounded bg-ink/10" />
          <div className="h-6 w-16 rounded bg-ink/10" />
          <div className="space-y-2">
            <div className="h-3 rounded bg-ink/5" />
            <div className="h-3 w-5/6 rounded bg-ink/5" />
            <div className="h-3 w-2/3 rounded bg-ink/5" />
          </div>
          <div className="mt-6 h-12 w-full rounded-full bg-ink/10" />
        </div>
      </div>
    </div>
  )
}
