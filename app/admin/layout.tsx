import type { Metadata } from 'next'
import Link from 'next/link'
import { AdminNav } from '@/components/admin/AdminNav'
import { UserMenu } from '@/components/admin/UserMenu'
import { site } from '@/lib/site'
import { createAuthClient } from '@/lib/supabase/auth-server'

// Admin pages always read mutable store state — never statically prerender.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: `${site.brand} Admin`, template: `%s · ${site.brand} Admin` },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createAuthClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // No session → render children bare so /admin/login can paint its own chrome.
  if (!user) return <>{children}</>

  return (
    // This wrapper "lifts" the admin out of the dark storefront body styling.
    // Everything inside is Polaris-light: gray-50 page background, white cards.
    <div className="min-h-screen bg-gray-50 font-body text-gray-900">
      {/* Sidebar — fixed on desktop, hidden on mobile (revisit with hamburger later) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-gray-200 bg-[#fbfbfb] md:flex">
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <Link
            href="/admin"
            className="font-display text-lg font-bold tracking-tightest text-gray-900"
          >
            {site.brand}
            <span className="ml-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-gray-400">
              admin
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <AdminNav />
        </div>
        <div className="border-t border-gray-200 px-3 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            ← View storefront
          </Link>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col md:pl-60">
        {/* Top bar — search + user menu */}
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 md:px-6">
          <div className="flex flex-1 items-center md:max-w-md">
            <div className="relative w-full">
              <svg
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                placeholder="Search orders, products, customers…"
                className="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>
          <div className="ml-auto">
            <UserMenu email={user.email ?? ''} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
