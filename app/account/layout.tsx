// Customer-account shell. Reuses the storefront header / footer so signed-in
// customers stay inside the same shop experience instead of being thrown
// into an admin-style chrome (which would be wrong — admin is for staff).
//
// The auth gate lives in middleware, so by the time a server-component
// child reads headers().get('x-customer-email') it can trust the value
// (or null when the page is one of the public sub-routes like /login).

import { CartProvider } from '@/components/CartProvider'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'
import { TrackingScripts } from '@/components/TrackingScripts'
import { SizeGuideModal } from '@/components/SizeGuideModal'
import { SearchOverlay } from '@/components/SearchBar'
import { CookieConsent } from '@/components/CookieConsent'

export const dynamic = 'force-dynamic'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <SizeGuideModal />
      <TrackingScripts />
      <CookieConsent />
    </CartProvider>
  )
}
