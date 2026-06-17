import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { site } from '@/lib/site'

// Inter — body font. Satoshi (display) is loaded via Fontshare @import in
// globals.css and referenced through Tailwind's `font-display` utility.
const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: `${site.brand} — ${site.tagline}`,
    template: `%s · ${site.brand}`,
  },
  description: site.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={body.variable}>
      <body className="min-h-screen bg-ink font-body text-paper antialiased">
        {children}
      </body>
    </html>
  )
}
