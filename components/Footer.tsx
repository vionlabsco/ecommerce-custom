import Link from 'next/link'
import { site } from '@/lib/site'
import { NewsletterForm } from './NewsletterForm'

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', href: '/shop' },
      { label: 'Knitwear', href: '/shop?category=Knitwear' },
      { label: 'Shirting', href: '/shop?category=Shirting' },
      { label: 'Outerwear', href: '/shop?category=Outerwear' },
      { label: 'Accessories', href: '/shop?category=Accessories' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { label: 'About', href: '#' },
      { label: 'Journal', href: '#' },
      { label: 'Stockists', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Shipping & returns', href: '#' },
      { label: 'Size guide', href: '#' },
      { label: 'Garment care', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="mx-auto max-w-shell px-5 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-3xl tracking-tightest">{site.brand}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/70">{site.tagline}</p>
            <div className="mt-8">
              <p className="mb-3 text-[12px] uppercase tracking-[0.18em] text-paper/50">
                Letters, not spam
              </p>
              <NewsletterForm />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[12px] uppercase tracking-[0.18em] text-paper/50">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-paper/80 transition-colors hover:text-paper"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-paper/15 pt-6 text-[12px] text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.brand}. All rights reserved.
          </p>
          <p className="tracking-[0.16em] uppercase">Visa · Mastercard · Amex · Apple Pay</p>
        </div>
      </div>
    </footer>
  )
}
