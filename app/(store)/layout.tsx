import { CartProvider } from '@/components/CartProvider'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'
import { TrackingScripts } from '@/components/TrackingScripts'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
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
