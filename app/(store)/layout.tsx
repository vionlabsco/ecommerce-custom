import { CartProvider } from '@/components/CartProvider'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'
import { Marquee } from '@/components/Marquee'
import { TrackingScripts } from '@/components/TrackingScripts'

const ANNOUNCEMENTS = [
  'Free shipping over $50',
  'Glass & cloth pads, built to last',
  '30-day returns',
  '1-year warranty',
]

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Marquee items={ANNOUNCEMENTS} />
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      {/* Tracking pixels — admin-configured via /admin/apps. Only injected on
          storefront pages, never on /admin/*. */}
      <TrackingScripts />
    </CartProvider>
  )
}
