'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/cn'

const ICONS: Record<string, JSX.Element> = {
  dashboard: (
    <path d="M3 3h7v7H3V3Zm0 11h7v7H3v-7ZM14 3h7v7h-7V3Zm0 11h7v7h-7v-7Z" />
  ),
  orders: <path d="M6 7h12l-1 13H7L6 7Zm3 0a3 3 0 0 1 6 0" />,
  customers: (
    <path d="M16 19a4 4 0 0 0-8 0M12 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
  ),
  support: <path d="M4 5h16v11H8l-4 4V5Z" />,
  inventory: <path d="M4 8 12 4l8 4v8l-8 4-8-4V8Zm8 4 8-4M12 12v8M12 12 4 8" />,
}

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'dashboard', exact: true },
  { href: '/admin/orders', label: 'Orders', icon: 'orders' },
  { href: '/admin/customers', label: 'Customers', icon: 'customers' },
  { href: '/admin/support', label: 'Support', icon: 'support' },
  { href: '/admin/products', label: 'Inventory', icon: 'inventory' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
              active ? 'bg-paper/15 text-paper' : 'text-paper/55 hover:bg-paper/10 hover:text-paper',
            )}
          >
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
              {ICONS[item.icon]}
            </svg>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
