// Streamed instantly on every admin navigation so the click feels responsive
// while the real page does its data fetching.

export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-md bg-gray-200" />
        <div className="h-4 w-72 rounded-md bg-gray-100" />
      </div>

      {/* Card/table skeleton */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="space-y-3">
          <div className="h-4 w-1/3 rounded bg-gray-100" />
          <div className="h-4 w-2/3 rounded bg-gray-100" />
          <div className="h-4 w-1/2 rounded bg-gray-100" />
        </div>
      </div>

      {/* Second block */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="space-y-3">
          <div className="h-4 w-1/4 rounded bg-gray-100" />
          <div className="h-4 w-1/2 rounded bg-gray-100" />
          <div className="h-4 w-1/3 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  )
}
