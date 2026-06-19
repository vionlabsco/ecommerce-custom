'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'

// ── Types ────────────────────────────────────────────────────────────────
export type CartItem = {
  /** Unique per variant: `${productId}:${color}:${size}` */
  key: string
  productId: string
  slug: string
  name: string
  color: string
  size: string
  priceCents: number
  accent: string
  image?: string
  category: string
  quantity: number
  /** Most this variant can be added (derived from stock state). */
  maxQuantity: number
}

type AddPayload = Omit<CartItem, 'quantity'>

/** Discount applied to the cart. The discountCents is the value the server
 *  computed at apply-time; we re-validate against the current subtotal on
 *  every render in case the user has since changed quantities. */
export type AppliedCoupon = { code: string; discountCents: number }

type State = { items: CartItem[]; coupon: AppliedCoupon | null }

type Action =
  | { type: 'HYDRATE'; items: CartItem[]; coupon: AppliedCoupon | null }
  | { type: 'ADD'; item: AddPayload; quantity: number }
  | { type: 'SET_QTY'; key: string; quantity: number }
  | { type: 'REMOVE'; key: string }
  | { type: 'CLEAR' }
  | { type: 'SET_COUPON'; coupon: AppliedCoupon | null }

const STORAGE_KEY = 'marlowe-cart-v1'
const COUPON_KEY = 'marlowe-coupon-v1'

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items, coupon: action.coupon }
    case 'ADD': {
      const existing = state.items.find((i) => i.key === action.item.key)
      if (existing) {
        const quantity = Math.min(
          existing.quantity + action.quantity,
          existing.maxQuantity,
        )
        return {
          ...state,
          items: state.items.map((i) =>
            i.key === action.item.key ? { ...i, quantity } : i,
          ),
        }
      }
      const quantity = Math.min(action.quantity, action.item.maxQuantity)
      return { ...state, items: [...state.items, { ...action.item, quantity }] }
    }
    case 'SET_QTY': {
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.key !== action.key) }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.key === action.key
            ? { ...i, quantity: Math.min(action.quantity, i.maxQuantity) }
            : i,
        ),
      }
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter((i) => i.key !== action.key) }
    case 'CLEAR':
      return { items: [], coupon: null }
    case 'SET_COUPON':
      return { ...state, coupon: action.coupon }
    default:
      return state
  }
}

// ── Context ──────────────────────────────────────────────────────────────
type CartContextValue = {
  items: CartItem[]
  count: number
  subtotalCents: number
  /** Discount applied — cents to subtract from subtotal. 0 when no coupon. */
  discountCents: number
  /** The active coupon, or null. Customer UI uses this to render the chip. */
  coupon: AppliedCoupon | null
  hydrated: boolean
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: AddPayload, quantity?: number) => void
  setQuantity: (key: string, quantity: number) => void
  removeItem: (key: string) => void
  clear: () => void
  applyCoupon: (coupon: AppliedCoupon) => void
  removeCoupon: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], coupon: null })
  const [hydrated, setHydrated] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Load persisted cart + coupon once on mount.
  useEffect(() => {
    let items: CartItem[] = []
    let coupon: AppliedCoupon | null = null
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[]
        if (Array.isArray(parsed)) items = parsed
      }
      const couponRaw = window.localStorage.getItem(COUPON_KEY)
      if (couponRaw) {
        const parsed = JSON.parse(couponRaw) as AppliedCoupon
        if (parsed && typeof parsed.code === 'string') coupon = parsed
      }
    } catch {
      // ignore malformed storage
    }
    dispatch({ type: 'HYDRATE', items, coupon })
    setHydrated(true)
  }, [])

  // Persist on every change (after hydration so we don't clobber storage).
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
      if (state.coupon) {
        window.localStorage.setItem(COUPON_KEY, JSON.stringify(state.coupon))
      } else {
        window.localStorage.removeItem(COUPON_KEY)
      }
    } catch {
      // storage may be unavailable (private mode); fail quietly
    }
  }, [state.items, state.coupon, hydrated])

  // Lock body scroll while the cart drawer is open.
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addItem = useCallback((item: AddPayload, quantity = 1) => {
    dispatch({ type: 'ADD', item, quantity })
    setIsOpen(true)
  }, [])

  const setQuantity = useCallback(
    (key: string, quantity: number) => dispatch({ type: 'SET_QTY', key, quantity }),
    [],
  )
  const removeItem = useCallback((key: string) => dispatch({ type: 'REMOVE', key }), [])
  const clear = useCallback(() => dispatch({ type: 'CLEAR' }), [])
  const applyCoupon = useCallback(
    (coupon: AppliedCoupon) => dispatch({ type: 'SET_COUPON', coupon }),
    [],
  )
  const removeCoupon = useCallback(
    () => dispatch({ type: 'SET_COUPON', coupon: null }),
    [],
  )

  const { count, subtotalCents } = useMemo(() => {
    return state.items.reduce(
      (acc, i) => {
        acc.count += i.quantity
        acc.subtotalCents += i.quantity * i.priceCents
        return acc
      },
      { count: 0, subtotalCents: 0 },
    )
  }, [state.items])

  // Re-derive the discount on every render. If items have changed since the
  // coupon was applied, we cap the discount at the (new) subtotal so a
  // shrunken cart can't go negative. If the cart is empty we silently drop
  // the coupon so the UI never shows a chip on an empty bag.
  const discountCents = useMemo(() => {
    if (!state.coupon || subtotalCents === 0) return 0
    return Math.min(state.coupon.discountCents, subtotalCents)
  }, [state.coupon, subtotalCents])

  const value: CartContextValue = {
    items: state.items,
    count,
    subtotalCents,
    discountCents,
    coupon: state.coupon,
    hydrated,
    isOpen,
    openCart,
    closeCart,
    addItem,
    setQuantity,
    removeItem,
    clear,
    applyCoupon,
    removeCoupon,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within <CartProvider>')
  return ctx
}
