'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { site } from '@/lib/site'

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

type Props = {
  name: string
  accent: string
  category: string
  /** Optional real photo. If it fails to load, we fall back to the tile. */
  image?: string
  className?: string
}

/**
 * Product visual. Uses a real photo when one is provided, otherwise renders a
 * cohesive, art-directed monogram tile so the store always looks finished
 * (and works offline). Drop a photo URL onto a product to replace the tile.
 */
export function ProductImage({ name, accent, category, image, className }: Props) {
  const [errored, setErrored] = useState(false)
  const showPhoto = image && !errored
  const initial = name.trim().charAt(0).toUpperCase()

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ backgroundColor: accent }}
    >
      {showPhoto ? (
        <img
          src={image}
          alt={name}
          loading="lazy"
          onError={() => setErrored(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          {/* light from top-left */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_18%_12%,rgba(255,255,255,0.30),transparent_55%)]" />
          {/* depth toward bottom */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.30))]" />
          {/* oversized monogram */}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="select-none font-display text-[44vw] leading-none text-paper/[0.16] sm:text-[200px]">
              {initial}
            </span>
          </span>
          {/* category + brand marks */}
          <span className="absolute left-4 top-4 text-[10px] uppercase tracking-[0.24em] text-paper/80">
            {category}
          </span>
          <span className="absolute bottom-4 right-4 font-display text-sm tracking-wide text-paper/70">
            {site.brand}
          </span>
          {/* grain */}
          <div
            className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
            style={{ backgroundImage: GRAIN }}
          />
        </>
      )}
    </div>
  )
}
