'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { updateSettings } from './settings'

function str(v: FormDataEntryValue | null, max = 280): string {
  return String(v ?? '').trim().slice(0, max)
}

function dollarsToCents(v: FormDataEntryValue | null): number {
  const n = parseFloat(String(v ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? Math.round(n * 100) : 0
}

function percentToFraction(v: FormDataEntryValue | null): number {
  const n = parseFloat(String(v ?? '').replace(/[^0-9.]/g, ''))
  if (!Number.isFinite(n)) return 0
  return n > 1 ? n / 100 : n // accept either 8.25 or 0.0825
}

export async function updateStoreProfileAction(fd: FormData) {
  requireAdmin()
  await updateSettings({
    storeName: str(fd.get('storeName'), 120),
    storeTagline: str(fd.get('storeTagline'), 200),
    storeDescription: str(fd.get('storeDescription'), 1000),
    contactEmail: str(fd.get('contactEmail'), 200),
    contactPhone: str(fd.get('contactPhone'), 60),
  })
  revalidatePath('/admin/settings')
  revalidatePath('/', 'layout')
}

export async function updateAddressAction(fd: FormData) {
  requireAdmin()
  await updateSettings({
    addressLine1: str(fd.get('addressLine1'), 200),
    addressCity: str(fd.get('addressCity'), 120),
    addressRegion: str(fd.get('addressRegion'), 120),
    addressPostal: str(fd.get('addressPostal'), 32),
    addressCountry: str(fd.get('addressCountry'), 120),
  })
  revalidatePath('/admin/settings')
}

export async function updateMoneyAction(fd: FormData) {
  requireAdmin()
  await updateSettings({
    currency: str(fd.get('currency'), 8) || 'USD',
    locale: str(fd.get('locale'), 16) || 'en-US',
    freeShippingThresholdCents: Math.min(dollarsToCents(fd.get('freeShippingThreshold')), 100_000_000),
    flatShippingCents: Math.min(dollarsToCents(fd.get('flatShipping')), 100_000_000),
    taxRate: Math.min(Math.max(0, percentToFraction(fd.get('taxRate'))), 1),
  })
  revalidatePath('/admin/settings')
  revalidatePath('/', 'layout')
}

export async function updateSocialAction(fd: FormData) {
  requireAdmin()
  await updateSettings({
    socialInstagram: str(fd.get('socialInstagram'), 200),
    socialTwitter: str(fd.get('socialTwitter'), 200),
    socialFacebook: str(fd.get('socialFacebook'), 200),
    socialTiktok: str(fd.get('socialTiktok'), 200),
  })
  revalidatePath('/admin/settings')
}

export async function updateTrackingAction(fd: FormData) {
  requireAdmin()
  // Pixel IDs are length-capped here; format-validated in TrackingScripts
  // before they're ever interpolated into a <script> tag.
  await updateSettings({
    clarityProjectId: str(fd.get('clarityProjectId'), 40),
    ga4MeasurementId: str(fd.get('ga4MeasurementId'), 40),
    metaPixelId: str(fd.get('metaPixelId'), 40),
    tiktokPixelId: str(fd.get('tiktokPixelId'), 60),
    gtmContainerId: str(fd.get('gtmContainerId'), 40),
    hotjarSiteId: str(fd.get('hotjarSiteId'), 20),
  })
  revalidatePath('/admin/apps')
  // The storefront layout reads settings for script injection — invalidate it.
  revalidatePath('/', 'layout')
}
