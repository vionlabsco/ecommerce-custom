export function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="text-[12px] uppercase tracking-[0.12em] text-ink-soft">{label}</p>
      <p className={`mt-2 font-display text-3xl ${accent ? 'text-clay' : 'text-ink'}`}>{value}</p>
      {sub && <p className="mt-1 text-[13px] text-ink-soft">{sub}</p>}
    </div>
  )
}
