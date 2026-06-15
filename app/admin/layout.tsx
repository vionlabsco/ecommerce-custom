import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminNav } from '@/components/admin/AdminNav'
import { site } from '@/lib/site'

// All admin pages read live (mutable) store state, so render them on demand
// rather than statically prerendering a snapshot at build time.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: `${site.brand} Admin`, template: `%s · ${site.brand} Admin` },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f6f4ee] text-ink">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col bg-ink px-4 py-6 md:flex">
        <Link href="/admin" className="px-3 font-display text-2xl tracking-tightest text-paper">
          {site.brand}
        </Link>
        <p className="mb-8 mt-0.5 px-3 text-[11px] uppercase tracking-[0.22em] text-paper/40">Admin</p>
        <AdminNav />
        <Link
          href="/"
          className="mt-auto px-3 text-[13px] text-paper/50 transition-colors hover:text-paper"
        >
          ← View storefront
        </Link>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:pl-60">
        <header className="flex items-center gap-3 border-b border-line bg-white/80 px-6 py-3 backdrop-blur">
          <span className="font-display text-lg md:hidden">{site.brand} Admin</span>
          <span className="ml-auto rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
            Demo · sample data, resets on restart
          </span>
        </header>
        <main className="flex-1 px-6 py-7 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
