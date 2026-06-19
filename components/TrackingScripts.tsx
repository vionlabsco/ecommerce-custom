// Inject third-party tracking scripts into the storefront only, based on
// the IDs the admin saved via /admin/apps. This is a server component — it
// reads settings during render so a script appears the moment an ID is set.
//
// SECURITY: every ID is interpolated into an inline <script> tag, so it must
// be validated against a strict regex BEFORE rendering. Otherwise a malicious
// admin (or a compromised admin account) can inject arbitrary JS into every
// storefront page. See validate() below — any ID that doesn't match is
// silently dropped and the script never renders.

import Script from 'next/script'
import { getSettings } from '@/lib/admin/settings'

// Each tracker has a strict, well-known ID format. We allow only those chars.
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

  const clarity = safe(s.clarityProjectId, 'clarity')
  const gtm = safe(s.gtmContainerId, 'gtm')
  const ga4 = safe(s.ga4MeasurementId, 'ga4')
  const meta = safe(s.metaPixelId, 'meta')
  const tiktok = safe(s.tiktokPixelId, 'tiktok')
  const hotjar = safe(s.hotjarSiteId, 'hotjar')

  return (
    <>
      {clarity && (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarity}");`}
        </Script>
      )}

      {gtm && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
        </Script>
      )}

      {ga4 && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');`}
          </Script>
        </>
      )}

      {meta && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${meta}');fbq('track','PageView');`}
        </Script>
      )}

      {tiktok && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('${tiktok}');ttq.page();}(window,document,'ttq');`}
        </Script>
      )}

      {hotjar && (
        <Script id="hotjar" strategy="afterInteractive">
          {`(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${hotjar},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
        </Script>
      )}
    </>
  )
}
