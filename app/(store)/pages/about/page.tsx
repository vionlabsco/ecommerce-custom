import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = { title: 'About' }

export default function AboutPage() {
  return (
    <>
      <p className="label-accent">Our story</p>
      <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
        Peptide therapy. Without the needle.
      </h1>
      <p>
        {site.brand} develops non-invasive peptide delivery technology. Our
        flagship formulation delivers retatrutide — the triple-agonist metabolic
        peptide — under the tongue, using a proprietary Self-Nanoemulsifying
        Drug Delivery System (SNEDDS) instead of an injection.
      </p>
      <p>
        Retatrutide is one of the most promising next-generation metabolic
        peptides, combining GIP, GLP-1, and glucagon receptor activity in a
        single molecule. Injectable versions are currently in extensive clinical
        trials. Our platform is the first to make it available in a needle-free,
        sublingual liquid form — without sacrificing systemic delivery.
      </p>
      <p>
        We are focused on one thing: making effective peptide therapies easier
        to actually use. That means pharmaceutical-grade excipients, industrial
        manufacturing standards, third-party testing on every batch, and a
        product that a patient can take twice a day at home in seconds.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold text-ink">Our team</h2>
      <p>
        The formulation was developed by a multidisciplinary team of MD- and
        PhD-level pharmaceutical scientists and physicians, with more than
        60 years of combined experience in formulation development and
        non-invasive peptide delivery. Additional detail is available on
        request — reach us at{' '}
        <a href={`mailto:${site.contactEmail}`} className="text-accent hover:underline">
          {site.contactEmail}
        </a>
        .
      </p>

      <p className="mt-10 text-[12px] text-ink-mute">
        This site is a work in progress. Product claims, medical language, and
        regulatory statements are placeholders pending review by our medical
        and legal advisors. Not intended to diagnose, treat, cure, or prevent
        any disease.
      </p>
    </>
  )
}
