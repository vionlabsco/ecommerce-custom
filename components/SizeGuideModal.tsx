'use client'

import { useEffect, useState } from 'react'

// Mouse-pad size reference. Dimensions are typical industry sizes for the
// Square and Rectangle SKUs Vionlabs sells. If the catalogue ever grows to
// include larger XL pads or QCK-format strips, add rows here. Real values
// can be updated by editing this file (no admin UI needed yet).
type SizeRow = {
  size: string
  inches: string
  mm: string
  use: string
}

const SIZES: SizeRow[] = [
  {
    size: 'Square',
    inches: '13.8" × 13.8"',
    mm: '350 × 350 mm',
    use: 'Low-DPI gaming · everyday desk use · compact setups',
  },
  {
    size: 'Rectangle',
    inches: '17.7" × 13.8"',
    mm: '450 × 350 mm',
    use: 'Wide mouse sweeps · keyboard + mouse on the same pad',
  },
]

export function SizeGuideModal() {
  const [open, setOpen] = useState(false)

  // Listen for the open event dispatched by the "Size guide" button in the
  // add-to-cart component. Keeps the modal decoupled from where it's
  // triggered so the same modal works for future trigger points.
  useEffect(() => {
    const handler = () => setOpen(true)
    window.addEventListener('open-size-guide', handler)
    return () => window.removeEventListener('open-size-guide', handler)
  }, [])

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-title"
    >
      <div
        className="absolute inset-0 bg-ink/45 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-t-2xl border border-line bg-paper shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 id="size-guide-title" className="font-display text-xl font-bold text-ink">
            Size guide
          </h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close size guide"
            className="rounded-md p-1 text-ink-soft transition-colors hover:bg-surface hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-ink-soft">
            Both Vionlabs pads come in two sizes — same surface, different
            footprint. Pick by the desk space you have and how wide your
            mouse sweeps.
          </p>

          <div className="mt-5 overflow-hidden rounded-lg border border-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-[10.5px] font-semibold uppercase tracking-widest2 text-ink-soft">
                <tr>
                  <th className="px-4 py-2">Size</th>
                  <th className="px-4 py-2">Dimensions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink">
                {SIZES.map((s) => (
                  <tr key={s.size} className="align-top">
                    <td className="px-4 py-3 font-medium">{s.size}</td>
                    <td className="px-4 py-3">
                      <div>{s.inches}</div>
                      <div className="text-[12px] text-ink-soft">{s.mm}</div>
                      <div className="mt-1.5 text-[12px] text-ink-soft">{s.use}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-[12px] text-ink-mute">
            Sizes are nominal — manufacturing tolerance is ±2 mm.
          </p>
        </div>

        <div className="border-t border-line bg-surface px-6 py-3 text-right">
          <button
            onClick={() => setOpen(false)}
            className="rounded-md bg-ink px-4 py-2 text-[12px] font-bold uppercase tracking-widest2 text-paper transition-colors hover:bg-accent"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
