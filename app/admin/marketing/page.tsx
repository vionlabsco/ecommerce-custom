import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/PageHeader'
import { ComingSoon } from '@/components/admin/ComingSoon'

export const metadata: Metadata = { title: 'Marketing' }

export default function MarketingPage() {
  return (
    <>
      <PageHeader
        title="Marketing"
        subtitle="Campaigns, automations and audience-building tools."
      />
      <ComingSoon
        feature="Marketing campaigns"
        phase="Phase 3"
        description="Email campaigns, customer segments, and automated flows. Coming in Phase 3."
      />
    </>
  )
}
