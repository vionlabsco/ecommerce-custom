import Link from 'next/link'

type Crumb = { label: string; href?: string }

/** Standard page header used across every admin page (Shopify-style). */
export function PageHeader({
  title,
  subtitle,
  crumbs,
  action,
}: {
  title: string
  subtitle?: string
  crumbs?: Crumb[]
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
      <div className="min-w-0">
        {crumbs && crumbs.length > 0 && (
          <nav className="mb-2 flex flex-wrap items-center gap-1 text-[13px] text-gray-500">
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="inline-flex items-center gap-1">
                {c.href ? (
                  <Link href={c.href} className="hover:text-gray-900">
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
                {i < crumbs.length - 1 && <span className="text-gray-300">/</span>}
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-display text-2xl font-bold text-gray-900 md:text-[26px]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
