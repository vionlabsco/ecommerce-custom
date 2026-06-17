'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { RANGE_OPTIONS, type RangePreset } from '@/lib/admin/analytics'
import { cn } from '@/lib/cn'

/**
 * Shopify-style date range picker — a button that opens a dropdown of preset
 * ranges. Selecting one writes ?range= into the URL so the server re-renders
 * with new data.
 */
export function DateRangePicker({ active }: { active: RangePreset }) {
  const router = useRouter()
  const params = useSearchParams()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const activeLabel = RANGE_OPTIONS.find((p) => p.value === active)?.label ?? 'Last 30 days'

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const select = (value: RangePreset) => {
    const next = new URLSearchParams(params.toString())
    next.set('range', value)
    router.push(`/admin/analytics?${next.toString()}`)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((x) => !x)}
        className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
        {activeLabel}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden className={cn('transition-transform', open && 'rotate-180')}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1.5 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
          <ul className="py-1">
            {RANGE_OPTIONS.map((p) => (
              <li key={p.value}>
                <button
                  type="button"
                  onClick={() => select(p.value)}
                  className={cn(
                    'flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] transition-colors',
                    p.value === active
                      ? 'bg-emerald-50 font-medium text-emerald-700'
                      : 'text-gray-700 hover:bg-gray-50',
                  )}
                >
                  {p.label}
                  {p.value === active && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
