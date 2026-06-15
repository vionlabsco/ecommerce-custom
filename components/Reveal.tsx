import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  children: ReactNode
  /** Stagger delay in ms. */
  delay?: number
  className?: string
  as?: keyof JSX.IntrinsicElements
}

/**
 * Soft entrance animation. CSS-only and server-rendered: the content is always
 * present in the DOM and the keyframe ends fully visible, so it works without
 * JS, is crawlable, and degrades cleanly under prefers-reduced-motion (the
 * animation simply doesn't run — the element stays visible).
 */
export function Reveal({ children, delay = 0, className, as = 'div' }: Props) {
  const Tag = as as any
  return (
    <Tag
      style={{ animationDelay: `${delay}ms` }}
      className={cn('motion-safe:animate-rise', className)}
    >
      {children}
    </Tag>
  )
}
