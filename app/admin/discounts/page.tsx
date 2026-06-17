import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/PageHeader'
import { ComingSoon } from '@/components/admin/ComingSoon'

export const metadata: Metadata = { title: 'Discounts' }

export default function DiscountsPage() {
  return (
    <>
      <PageHeader
        title="Discounts"
        subtitle="Discount codes, automatic discounts, and promotions."
      />
      <ComingSoon
        feature="Discount codes"
        phase="Phase 3"
        description="Create code-based and automatic discounts. Coming in Phase 3."
      />
    </>
  )
}
