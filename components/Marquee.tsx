/** Seamless scrolling announcement strip. Pauses on hover. */
export function Marquee({ items }: { items: string[] }) {
  const content = [...items, ...items, ...items, ...items]
  return (
    <div className="group flex overflow-hidden border-b border-line bg-surface">
      <div className="flex w-max animate-marquee items-center whitespace-nowrap group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {content.map((text, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center whitespace-nowrap py-2 font-mono text-[10.5px] uppercase tracking-widest2 text-paper-soft"
          >
            <span className="px-5">{text}</span>
            <span aria-hidden className="text-accent">
              ●
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
