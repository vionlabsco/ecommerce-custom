import Link from 'next/link'
import { site } from '@/lib/site'
import { NewsletterForm } from './NewsletterForm'

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', href: '/shop' },
      { label: 'Glass pads', href: '/shop?category=Glass' },
      { label: 'Cloth pads', href: '/shop?category=Cloth' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Shipping & returns', href: '#' },
      { label: 'Warranty', href: '#' },
      { label: 'Spec sheet', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Journal', href: '#' },
      { label: 'Partners', href: '#' },
      { label: 'Press kit', href: '#' },
    ],
  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-line bg-ink">
      {/* Newsletter ribbon */}
      <div className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-shell items-center gap-10 px-5 py-14 md:grid-cols-[1.1fr_1fr] md:px-8 md:py-16">
          <div>
            <p className="label-accent">Newsletter — VL//Signal</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-[1.05] text-balance md:text-[2.75rem]">
              Drops, restocks, the&nbsp;occasional tear-down.
            </h2>
            <p className="mt-3 max-w-md text-sm text-paper-soft">
              One email a month, max. Unsubscribe with one click.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-shell px-5 py-14 md:px-8 md:py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-3xl font-bold tracking-tightest">
              {site.brand}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper-soft">
              {site.tagline}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-sm border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest2 text-paper-soft">
                Made in EU
              </span>
              <span className="rounded-sm border border-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest2 text-paper-soft">
                Carbon-neutral ship
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="label-mono">{col.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-paper transition-colors hover:text-accent"
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

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 text-[12px] text-paper-mute sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.brand}. All rights reserved.
          </p>
          <p className="font-mono uppercase tracking-widest2">
            v1.0 · vionlabs.co
          </p>
        </div>
      </div>
    </footer>
  )
}
