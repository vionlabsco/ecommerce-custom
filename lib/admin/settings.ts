// ──────────────────────────────────────────────────────────────────────────
// Site settings — single-row table read/write for store profile, money,
// social, and tracking-pixel IDs. The storefront reads this for tracking
// script injection; admin reads it to populate the settings form.
// ──────────────────────────────────────────────────────────────────────────

import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

export type SiteSettings = {
  storeName: string
  storeTagline: string
  storeDescription: string
  contactEmail: string
  contactPhone: string
  addressLine1: string
  addressCity: string
  addressRegion: string
  addressPostal: string
  addressCountry: string
  currency: string
  locale: string
  freeShippingThresholdCents: number
  flatShippingCents: number
  taxRate: number
  socialInstagram: string
  socialTwitter: string
  socialFacebook: string
  socialTiktok: string
  clarityProjectId: string
  ga4MeasurementId: string
  metaPixelId: string
  tiktokPixelId: string
  gtmContainerId: string
  hotjarSiteId: string
}

const DEFAULTS: SiteSettings = {
  storeName: 'Vionlabs',
  storeTagline: 'Precision desk gear, engineered to last.',
  storeDescription: '',
  contactEmail: 'info@vionlabs.co',
  contactPhone: '',
  addressLine1: '',
  addressCity: '',
  addressRegion: '',
  addressPostal: '',
  addressCountry: '',
  currency: 'USD',
  locale: 'en-US',
  freeShippingThresholdCents: 5000,
  flatShippingCents: 800,
  taxRate: 0.0825,
  socialInstagram: '',
  socialTwitter: '',
  socialFacebook: '',
  socialTiktok: '',
  clarityProjectId: '',
  ga4MeasurementId: '',
  metaPixelId: '',
  tiktokPixelId: '',
  gtmContainerId: '',
  hotjarSiteId: '',
}

const FIELD_MAP: Record<keyof SiteSettings, string> = {
  storeName: 'store_name',
  storeTagline: 'store_tagline',
  storeDescription: 'store_description',
  contactEmail: 'contact_email',
  contactPhone: 'contact_phone',
  addressLine1: 'address_line1',
  addressCity: 'address_city',
  addressRegion: 'address_region',
  addressPostal: 'address_postal',
  addressCountry: 'address_country',
  currency: 'currency',
  locale: 'locale',
  freeShippingThresholdCents: 'free_shipping_threshold_cents',
  flatShippingCents: 'flat_shipping_cents',
  taxRate: 'tax_rate',
  socialInstagram: 'social_instagram',
  socialTwitter: 'social_twitter',
  socialFacebook: 'social_facebook',
  socialTiktok: 'social_tiktok',
  clarityProjectId: 'clarity_project_id',
  ga4MeasurementId: 'ga4_measurement_id',
  metaPixelId: 'meta_pixel_id',
  tiktokPixelId: 'tiktok_pixel_id',
  gtmContainerId: 'gtm_container_id',
  hotjarSiteId: 'hotjar_site_id',
}

function rowToSettings(r: Record<string, unknown>): SiteSettings {
  const out = { ...DEFAULTS }
  for (const [appKey, dbKey] of Object.entries(FIELD_MAP) as [keyof SiteSettings, string][]) {
    const v = r[dbKey]
    if (v === null || v === undefined) continue
    if (appKey === 'taxRate') {
      ;(out[appKey] as number) = typeof v === 'number' ? v : parseFloat(String(v))
    } else if (
      appKey === 'freeShippingThresholdCents' ||
      appKey === 'flatShippingCents'
    ) {
      ;(out[appKey] as number) = typeof v === 'number' ? v : parseInt(String(v), 10)
    } else {
      ;(out[appKey] as string) = String(v)
    }
  }
  return out
}

export async function getSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured || !supabase) return DEFAULTS
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()
  if (error || !data) return DEFAULTS
  return rowToSettings(data)
}

export async function updateSettings(patch: Partial<SiteSettings>): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return
  const row: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(patch) as [keyof SiteSettings, unknown][]) {
    const dbKey = FIELD_MAP[key]
    if (dbKey) row[dbKey] = value
  }
  row.updated_at = new Date().toISOString()
  const { error } = await supabase.from('site_settings').update(row).eq('id', 1)
  if (error) throw error
}
