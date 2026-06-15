import type { Metadata } from 'next'
import { Fraunces, Hanken_Grotesk } from 'next/font/google'
import './globals.css'
import { site } from '@/lib/site'

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const body = Hanken_Grotesk({
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
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen bg-paper font-body text-ink antialiased">{children}</body>
    </html>
  )
}
