'use server'

import { revalidatePath } from 'next/cache'
import { updateSettings } from './settings'

function str(v: FormDataEntryValue | null): string {
  return String(v ?? '').trim()
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
  await updateSettings({
    storeName: str(fd.get('storeName')),
    storeTagline: str(fd.get('storeTagline')),
    storeDescription: str(fd.get('storeDescription')),
    contactEmail: str(fd.get('contactEmail')),
    contactPhone: str(fd.get('contactPhone')),
  })
  revalidatePath('/admin/settings')
  revalidatePath('/', 'layout')
}

export async function updateAddressAction(fd: FormData) {
  await updateSettings({
    addressLine1: str(fd.get('addressLine1')),
    addressCity: str(fd.get('addressCity')),
    addressRegion: str(fd.get('addressRegion')),
    addressPostal: str(fd.get('addressPostal')),
    addressCountry: str(fd.get('addressCountry')),
  })
  revalidatePath('/admin/settings')
}

export async function updateMoneyAction(fd: FormData) {
  await updateSettings({
    currency: str(fd.get('currency')) || 'USD',
    locale: str(fd.get('locale')) || 'en-US',
    freeShippingThresholdCents: dollarsToCents(fd.get('freeShippingThreshold')),
    flatShippingCents: dollarsToCents(fd.get('flatShipping')),
    taxRate: percentToFraction(fd.get('taxRate')),
  })
  revalidatePath('/admin/settings')
  revalidatePath('/', 'layout')
}

export async function updateSocialAction(fd: FormData) {
  await updateSettings({
    socialInstagram: str(fd.get('socialInstagram')),
    socialTwitter: str(fd.get('socialTwitter')),
    socialFacebook: str(fd.get('socialFacebook')),
    socialTiktok: str(fd.get('socialTiktok')),
  })
  revalidatePath('/admin/settings')
}

export async function updateTrackingAction(fd: FormData) {
  await updateSettings({
    clarityProjectId: str(fd.get('clarityProjectId')),
    ga4MeasurementId: str(fd.get('ga4MeasurementId')),
    metaPixelId: str(fd.get('metaPixelId')),
    tiktokPixelId: str(fd.get('tiktokPixelId')),
    gtmContainerId: str(fd.get('gtmContainerId')),
    hotjarSiteId: str(fd.get('hotjarSiteId')),
  })
  revalidatePath('/admin/apps')
  // The storefront layout reads settings for script injection — invalidate it.
  revalidatePath('/', 'layout')
}
