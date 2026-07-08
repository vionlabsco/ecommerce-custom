import { CartProvider } from '@/components/CartProvider'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'
import { TrackingScripts } from '@/components/TrackingScripts'
import { SizeGuideModal } from '@/components/SizeGuideModal'
import { SearchOverlay } from '@/components/SearchBar'
import { CookieConsent } from '@/components/CookieConsent'
import { AgeGate } from '@/components/AgeGate'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      {/* Search overlay mounted once — opens via the header magnifier or the
          "/" keyboard shortcut. Submits to /shop?q=...  */}
      <SearchOverlay />
      {/* Mounted once at the layout level — triggered via a `open-size-guide`
          window event from any "Size guide" button on a PDP. */}
      <SizeGuideModal />
      {/* Tracking pixels — admin-configured via /admin/apps. Gated by the
          cookie-consent banner: scripts only inject if analytics consent
          has been granted. */}
      <TrackingScripts />
      {/* Age verification — blocks storefront on first visit until the
          customer confirms they're 18+. Decision persists per device. */}
      <AgeGate />
      {/* GDPR / PIPEDA consent banner — shows once until decided. */}
      <CookieConsent />
    </CartProvider>
  )
}
