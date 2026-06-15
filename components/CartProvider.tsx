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

type State = { items: CartItem[] }

type Action =
  | { type: 'HYDRATE'; items: CartItem[] }
  | { type: 'ADD'; item: AddPayload; quantity: number }
  | { type: 'SET_QTY'; key: string; quantity: number }
  | { type: 'REMOVE'; key: string }
  | { type: 'CLEAR' }

const STORAGE_KEY = 'marlowe-cart-v1'

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items }
    case 'ADD': {
      const existing = state.items.find((i) => i.key === action.item.key)
      if (existing) {
        const quantity = Math.min(
          existing.quantity + action.quantity,
          existing.maxQuantity,
        )
        return {
          items: state.items.map((i) =>
            i.key === action.item.key ? { ...i, quantity } : i,
          ),
        }
      }
      const quantity = Math.min(action.quantity, action.item.maxQuantity)
      return { items: [...state.items, { ...action.item, quantity }] }
    }
    case 'SET_QTY': {
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => i.key !== action.key) }
      }
      return {
        items: state.items.map((i) =>
          i.key === action.key
            ? { ...i, quantity: Math.min(action.quantity, i.maxQuantity) }
            : i,
        ),
      }
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.key !== action.key) }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

// ── Context ──────────────────────────────────────────────────────────────
type CartContextValue = {
  items: CartItem[]
  count: number
  subtotalCents: number
  hydrated: boolean
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: AddPayload, quantity?: number) => void
  setQuantity: (key: string, quantity: number) => void
  removeItem: (key: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] })
  const [hydrated, setHydrated] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Load persisted cart once on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const items = JSON.parse(raw) as CartItem[]
        if (Array.isArray(items)) dispatch({ type: 'HYDRATE', items })
      }
    } catch {
      // ignore malformed storage
    }
    setHydrated(true)
  }, [])

  // Persist on every change (after hydration so we don't clobber storage).
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items))
    } catch {
      // storage may be unavailable (private mode); fail quietly
    }
  }, [state.items, hydrated])

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

  const value: CartContextValue = {
    items: state.items,
    count,
    subtotalCents,
    hydrated,
    isOpen,
    openCart,
    closeCart,
    addItem,
    setQuantity,
    removeItem,
    clear,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within <CartProvider>')
  return ctx
}
