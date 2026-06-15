import { CartProvider } from '@/components/CartProvider'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CartDrawer } from '@/components/CartDrawer'
import { Marquee } from '@/components/Marquee'

const ANNOUNCEMENTS = [
  'Complimentary shipping over $150',
  'New-season knitwear has landed',
  'Made to last, not to last a season',
  'Free 30-day returns',
]

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Marquee items={ANNOUNCEMENTS} />
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  )
}
