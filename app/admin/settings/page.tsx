import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/PageHeader'
import { ComingSoon } from '@/components/admin/ComingSoon'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Store details, plan, users, billing, taxes, shipping, and notifications."
      />
      <ComingSoon
        feature="Store settings"
        phase="Phase 3"
        description="Store profile, contact info, currency, tax rates, shipping zones, and user permissions. Coming in Phase 3."
      />
    </>
  )
}
