'use client'

import { useWishlist } from '@/lib/wishlist'
import { cn } from '@/lib/cn'

// Two sizes — `card` for the small button overlaid on ProductCard tiles,
// `pdp` for the larger version next to the Add-to-bag CTA on the PDP.
export function WishlistButton({
  slug,
  variant = 'card',
}: {
  slug: string
  variant?: 'card' | 'pdp'
}) {
  const { has, toggle, hydrated } = useWishlist()
  const saved = hydrated && has(slug)

  return (
    <button
      type="button"
      onClick={(e) => {
        // Prevent parent <Link> from also firing when this sits inside one.
        e.preventDefault()
        e.stopPropagation()
        toggle(slug)
      }}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={saved}
      className={cn(
        'group flex items-center justify-center rounded-full border transition-all',
        variant === 'card'
          ? 'h-8 w-8 border-line bg-paper/90 backdrop-blur-sm hover:border-accent'
          : 'h-11 w-11 border-line bg-paper hover:border-accent',
      )}
    >
      <svg
        width={variant === 'card' ? 14 : 18}
        height={variant === 'card' ? 14 : 18}
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        className={cn(
          'transition-colors',
          saved ? 'text-accent' : 'text-ink-soft group-hover:text-accent',
        )}
        aria-hidden
      >
        <path
          d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
