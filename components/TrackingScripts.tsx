// Server component: fetches the admin-saved pixel IDs from settings, validates
// each ID against a strict regex (so a malicious admin can't inject JS), and
// hands the safe values to a Client wrapper that gates rendering on customer
// consent (see CookieConsent + localStorage). With no consent granted, the
// Client returns null and no pixel scripts touch the DOM at all.
//
// SECURITY: validation must stay in this server component. Moving the regex
// to the client would let an admin who controls one of these IDs bypass the
// gate. The Client receives values that are already proven safe.

import { getSettings } from '@/lib/admin/settings'
import { TrackingScriptsClient } from './TrackingScriptsClient'

const PATTERNS: Record<string, RegExp> = {
  clarity: /^[a-z0-9]{6,20}$/i,
  gtm: /^GTM-[A-Z0-9]{4,12}$/,
  ga4: /^(G|UA)-[A-Z0-9-]{4,30}$/,
  meta: /^\d{6,20}$/,
  tiktok: /^[A-Z0-9]{16,40}$/,
  hotjar: /^\d{4,12}$/,
}

function safe(id: string, kind: keyof typeof PATTERNS): string | null {
  if (!id) return null
  const v = id.trim()
  return PATTERNS[kind].test(v) ? v : null
}

export async function TrackingScripts() {
  const s = await getSettings()
  return (
    <TrackingScriptsClient
      pixels={{
        clarity: safe(s.clarityProjectId, 'clarity'),
        gtm: safe(s.gtmContainerId, 'gtm'),
        ga4: safe(s.ga4MeasurementId, 'ga4'),
        meta: safe(s.metaPixelId, 'meta'),
        tiktok: safe(s.tiktokPixelId, 'tiktok'),
        hotjar: safe(s.hotjarSiteId, 'hotjar'),
      }}
    />
  )
}
