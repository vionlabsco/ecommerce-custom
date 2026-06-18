'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

type NavItem = { href: string; label: string; icon: JSX.Element; exact?: boolean }

const ICON = (path: React.ReactNode) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {path}
  </svg>
)

// Three sections, Shopify-style. Top group = core commerce ops, middle =
// growth tools, bottom = system + support.
const PRIMARY: NavItem[] = [
  { href: '/admin', label: 'Home', exact: true, icon: ICON(<path d="m3 12 9-9 9 9M5 10v10h14V10" />) },
  { href: '/admin/orders', label: 'Orders', icon: ICON(<path d="M6 7h12l-1 13H7L6 7Zm3 0a3 3 0 0 1 6 0" />) },
  { href: '/admin/products', label: 'Products', icon: ICON(<path d="M4 8 12 4l8 4v8l-8 4-8-4V8Zm8 4 8-4M12 12v8M12 12 4 8" />) },
  { href: '/admin/customers', label: 'Customers', icon: ICON(<path d="M16 19a4 4 0 0 0-8 0M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />) },
]

// Marketing + Discounts are intentionally omitted until their pages are built —
// no dead links in the sidebar. Add them back once the routes do real work.
const SECONDARY: NavItem[] = [
  { href: '/admin/analytics', label: 'Analytics', icon: ICON(<><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 5-6" /></>) },
]

const TERTIARY: NavItem[] = [
  { href: '/admin/apps', label: 'Apps', icon: ICON(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>) },
  { href: '/admin/support', label: 'Support', icon: ICON(<path d="M4 5h16v11H8l-4 4V5Z" />) },
  { href: '/admin/settings', label: 'Settings', icon: ICON(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></>) },
]

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] font-medium transition-colors',
        active
          ? 'bg-emerald-50 text-emerald-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
      )}
    >
      <span className={cn(active ? 'text-emerald-700' : 'text-gray-500')}>{item.icon}</span>
      {item.label}
    </Link>
  )
}

export function AdminNav() {
  const pathname = usePathname()
  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/')

  return (
    <nav className="flex flex-col gap-0.5">
      <div className="flex flex-col gap-0.5">
        {PRIMARY.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item)} />
        ))}
      </div>

      <div className="my-3 border-t border-gray-200" />

      <div className="flex flex-col gap-0.5">
        {SECONDARY.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item)} />
        ))}
      </div>

      <div className="my-3 border-t border-gray-200" />

      <div className="flex flex-col gap-0.5">
        {TERTIARY.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item)} />
        ))}
      </div>
    </nav>
  )
}
