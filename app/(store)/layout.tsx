import { CartProvider } from '@/components/CartProvider'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'
import { TrackingScripts } from '@/components/TrackingScripts'
import { SizeGuideModal } from '@/components/SizeGuideModal'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      {/* Mounted once at the layout level — triggered via a `open-size-guide`
          window event from any "Size guide" button on a PDP. */}
      <SizeGuideModal />
      {/* Tracking pixels — admin-configured via /admin/apps. Only injected on
          storefront pages, never on /admin/*. */}
      <TrackingScripts />
    </CartProvider>
  )
}
