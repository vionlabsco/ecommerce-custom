/** Seamless scrolling announcement strip. Pauses on hover. */
export function Marquee({ items }: { items: string[] }) {
  const content = [...items, ...items]
  return (
    <div className="group flex overflow-hidden bg-ink text-paper">
      <div className="flex w-max animate-marquee items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {content.map((text, i) => (
          <span
            key={i}
            className="flex items-center py-2.5 text-[11px] uppercase tracking-[0.22em]"
          >
            <span className="px-6">{text}</span>
            <span aria-hidden className="text-clay">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
