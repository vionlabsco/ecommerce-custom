import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <>
      <p className="label-accent">VL//Story</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Two pads. Made properly.
      </h1>
      <p>
        Vionlabs is a small Canadian studio building precision desk gear.
        We make two products — a 5mm tempered-glass pad and a stitched
        cloth pad — and we obsess over the surface, the base, the stitching,
        and the edges.
      </p>
      <p>
        Every pad is tested against the same surface specs whether it costs
        $19 or $39: smooth, controlled glide for high-DPI sensors; a base
        that doesn&apos;t move under fast flicks; and edges that won&apos;t
        snag your wrist after eight hours of work.
      </p>
      <p>
        We don&apos;t do a hundred SKUs. We do two, and we do them properly.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Where we ship</h2>
      <p>
        Designed in Canada. We ship across the United States and Canada from
        our Canadian fulfilment partner — most orders go out within 1–2
        business days.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Stay in touch</h2>
      <p>
        The fastest way to follow new drops is the newsletter at the bottom of
        any page — one email a month, unsubscribe with one click. Or reach us
        at{' '}
        <a href="mailto:hello@vionlabs.co" className="text-accent hover:underline">
          hello@vionlabs.co
        </a>
        .
      </p>
    </>
  )
}
