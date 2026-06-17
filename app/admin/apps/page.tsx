import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/admin/PageHeader'
import { getSettings } from '@/lib/admin/settings'
import { updateTrackingAction } from '@/lib/admin/settings-actions'

export const metadata: Metadata = { title: 'Apps & integrations' }
export const dynamic = 'force-dynamic'

const labelCls = 'mb-1.5 block text-[13px] font-medium text-gray-700'
const inputCls =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100'
const helpCls = 'mt-1 text-[12px] text-gray-500'

type Status = 'connected' | 'disconnected'

function StatusPill({ status }: { status: Status }) {
  return (
    <span
      className={
        status === 'connected'
          ? 'inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/15'
          : 'inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 ring-1 ring-inset ring-gray-200'
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status === 'connected' ? 'Connected' : 'Not configured'}
    </span>
  )
}

export default async function AppsPage() {
  const s = await getSettings()

  const status = {
    clarity: s.clarityProjectId ? 'connected' : 'disconnected',
    ga4: s.ga4MeasurementId ? 'connected' : 'disconnected',
    gtm: s.gtmContainerId ? 'connected' : 'disconnected',
    meta: s.metaPixelId ? 'connected' : 'disconnected',
    tiktok: s.tiktokPixelId ? 'connected' : 'disconnected',
    hotjar: s.hotjarSiteId ? 'connected' : 'disconnected',
  } as const

  return (
    <>
      <PageHeader
        title="Apps & integrations"
        subtitle="Paste tracking IDs and the storefront auto-injects each script site-wide. Admin pages are never tracked."
      />

      <form
        action={updateTrackingAction}
        className="space-y-5"
      >
        {/* Web analytics */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">Web analytics</h2>
              <p className="mt-0.5 text-[13px] text-gray-500">
                Traffic, conversion, source attribution.
              </p>
            </div>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <label className={labelCls} htmlFor="clarityProjectId">
                  Microsoft Clarity — Project ID
                </label>
                <StatusPill status={status.clarity} />
              </div>
              <input id="clarityProjectId" name="clarityProjectId" defaultValue={s.clarityProjectId} placeholder="abc12d34ef" className={inputCls} />
              <p className={helpCls}>
                Heatmaps + session recordings. Free, unlimited. Sign up at{' '}
                <a href="https://clarity.microsoft.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-800">
                  clarity.microsoft.com
                </a>{' '}
                — copy the Project ID from your dashboard URL.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className={labelCls} htmlFor="ga4MeasurementId">
                  Google Analytics 4 — Measurement ID
                </label>
                <StatusPill status={status.ga4} />
              </div>
              <input id="ga4MeasurementId" name="ga4MeasurementId" defaultValue={s.ga4MeasurementId} placeholder="G-XXXXXXXXXX" className={inputCls} />
              <p className={helpCls}>
                Get this from Google Analytics → Admin → Data Streams.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className={labelCls} htmlFor="gtmContainerId">
                  Google Tag Manager — Container ID
                </label>
                <StatusPill status={status.gtm} />
              </div>
              <input id="gtmContainerId" name="gtmContainerId" defaultValue={s.gtmContainerId} placeholder="GTM-XXXXXXX" className={inputCls} />
              <p className={helpCls}>
                Optional. If you use GTM, leave GA4 and Meta Pixel blank above and configure them inside GTM instead.
              </p>
            </div>
          </div>
        </div>

        {/* Ad platforms */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4">
            <h2 className="text-[15px] font-semibold text-gray-900">Ad platforms</h2>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Pixel snippets for conversion tracking on paid campaigns.
            </p>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <label className={labelCls} htmlFor="metaPixelId">
                  Meta Pixel — Pixel ID
                </label>
                <StatusPill status={status.meta} />
              </div>
              <input id="metaPixelId" name="metaPixelId" defaultValue={s.metaPixelId} placeholder="1234567890123456" className={inputCls} />
              <p className={helpCls}>
                From{' '}
                <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-800">
                  Meta Events Manager
                </a>{' '}
                → Data sources → your pixel → Settings.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className={labelCls} htmlFor="tiktokPixelId">
                  TikTok Pixel — Pixel ID
                </label>
                <StatusPill status={status.tiktok} />
              </div>
              <input id="tiktokPixelId" name="tiktokPixelId" defaultValue={s.tiktokPixelId} placeholder="C8XXXXXXXXXXX" className={inputCls} />
              <p className={helpCls}>
                From TikTok Ads Manager → Assets → Events.
              </p>
            </div>
          </div>
        </div>

        {/* User behavior */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4">
            <h2 className="text-[15px] font-semibold text-gray-900">User behaviour</h2>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Heatmaps and session replay. Open the tool&apos;s own dashboard for the deep stuff.
            </p>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <label className={labelCls} htmlFor="hotjarSiteId">
                  Hotjar — Site ID
                </label>
                <StatusPill status={status.hotjar} />
              </div>
              <input id="hotjarSiteId" name="hotjarSiteId" defaultValue={s.hotjarSiteId} placeholder="3456789" className={inputCls} />
              <p className={helpCls}>
                From Hotjar dashboard → Settings → Site info. Or skip — Clarity covers the same ground for free.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-emerald-700 px-5 py-2 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-emerald-800"
          >
            Save integrations
          </button>
        </div>
      </form>

      {/* Helper card */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900">How injection works</p>
            <p className="mt-0.5 text-[13px] text-gray-500">
              Each script loads only when its ID is filled in. Scripts are injected into the storefront layout only — never on{' '}
              <Link href="/admin" className="text-emerald-700 hover:text-emerald-800">/admin</Link> pages, so you won&apos;t track yourself.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
