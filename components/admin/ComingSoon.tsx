/** Polaris-style empty/coming-soon state used for placeholder admin pages. */
export function ComingSoon({
  feature,
  phase,
  description,
}: {
  feature: string
  phase: string
  description?: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
      <h2 className="font-display text-xl font-bold text-gray-900">{feature}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
        {description ?? `Coming in ${phase}.`}
      </p>
    </div>
  )
}
