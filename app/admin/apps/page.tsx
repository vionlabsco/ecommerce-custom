import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/PageHeader'
import { ComingSoon } from '@/components/admin/ComingSoon'

export const metadata: Metadata = { title: 'Apps' }

export default function AppsPage() {
  return (
    <>
      <PageHeader
        title="Apps & integrations"
        subtitle="Connect tracking pixels, marketing tools, and third-party services."
      />
      <ComingSoon
        feature="Tracking & integrations"
        phase="Phase 3"
        description="Meta Pixel, Google Analytics, TikTok Pixel, Klaviyo and more. Coming in Phase 3."
      />
    </>
  )
}
