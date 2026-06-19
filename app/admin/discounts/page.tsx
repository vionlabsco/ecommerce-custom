import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/PageHeader'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import {
  createDiscountAction,
  toggleDiscountAction,
  deleteDiscountAction,
} from '@/lib/admin/discount-actions'
import { formatPrice } from '@/lib/format'

export const metadata: Metadata = { title: 'Discounts' }
export const dynamic = 'force-dynamic'

type CodeRow = {
  code: string
  type: 'percent' | 'fixed'
  value: number
  min_subtotal_cents: number
  max_uses: number | null
  uses_count: number
  starts_at: string | null
  ends_at: string | null
  active: boolean
  created_at: string
}

async function fetchCodes(): Promise<CodeRow[]> {
  if (!isSupabaseConfigured || !supabase) return []
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('discounts fetch failed:', error)
    return []
  }
  return (data ?? []) as CodeRow[]
}

function describeValue(c: CodeRow): string {
  return c.type === 'percent' ? `${c.value}% off` : `${formatPrice(c.value)} off`
}

function describeUsage(c: CodeRow): string {
  if (c.max_uses == null) return `${c.uses_count} uses`
  return `${c.uses_count} / ${c.max_uses} uses`
}

const inputCls =
  'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100'
const labelCls = 'block text-[11px] font-medium uppercase tracking-wide text-gray-600'

export default async function DiscountsPage() {
  const codes = await fetchCodes()

  return (
    <>
      <PageHeader
        title="Discounts"
        subtitle={`${codes.length} ${codes.length === 1 ? 'code' : 'codes'}. Customers enter these at the cart drawer or checkout.`}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ── List ─────────────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {codes.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-gray-500">
              No codes yet — create your first one on the right.
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {codes.map((c) => {
                const expired = c.ends_at && new Date(c.ends_at) < new Date()
                const usedUp = c.max_uses != null && c.uses_count >= c.max_uses
                const status = !c.active
                  ? { label: 'Disabled', tone: 'bg-gray-100 text-gray-600' }
                  : expired
                    ? { label: 'Expired', tone: 'bg-amber-50 text-amber-700' }
                    : usedUp
                      ? { label: 'Used up', tone: 'bg-amber-50 text-amber-700' }
                      : { label: 'Active', tone: 'bg-emerald-50 text-emerald-700' }
                return (
                  <div key={c.code} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-[14px] font-semibold tracking-wide text-gray-900">
                          {c.code}
                        </p>
                        <span className={`rounded-full px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide ${status.tone}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[12.5px] text-gray-500">
                        {describeValue(c)} · {describeUsage(c)}
                        {c.min_subtotal_cents > 0 && ` · min ${formatPrice(c.min_subtotal_cents)}`}
                        {c.ends_at && ` · expires ${new Date(c.ends_at).toLocaleDateString('en-US', { dateStyle: 'medium' })}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <form action={toggleDiscountAction}>
                        <input type="hidden" name="code" value={c.code} />
                        <input type="hidden" name="nextActive" value={String(!c.active)} />
                        <button
                          type="submit"
                          className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                        >
                          {c.active ? 'Disable' : 'Enable'}
                        </button>
                      </form>
                      <form action={deleteDiscountAction}>
                        <input type="hidden" name="code" value={c.code} />
                        <button
                          type="submit"
                          className="rounded-md border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-rose-600 transition-colors hover:border-rose-300 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Create form ──────────────────────────────────────────────── */}
        <form
          action={createDiscountAction}
          className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div>
            <p className="font-display text-base font-bold text-gray-900">New discount code</p>
            <p className="mt-1 text-[12px] text-gray-500">Saved immediately — share the code with customers.</p>
          </div>

          <div>
            <label className={labelCls} htmlFor="code">Code</label>
            <input
              id="code"
              name="code"
              required
              minLength={3}
              maxLength={64}
              placeholder="WELCOME10"
              className={`${inputCls} font-mono uppercase tracking-wide`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="type">Type</label>
              <select id="type" name="type" defaultValue="percent" className={inputCls}>
                <option value="percent">% off</option>
                <option value="fixed">$ off</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="value">Value</label>
              <input
                id="value"
                name="value"
                type="number"
                required
                min={1}
                step={1}
                placeholder="10"
                className={inputCls}
              />
            </div>
          </div>
          <p className="text-[11.5px] text-gray-500">
            For percent: enter 10 for 10% off. For $ off: enter 5 for $5 off.
          </p>

          <div>
            <label className={labelCls} htmlFor="minSubtotal">Minimum order ($)</label>
            <input
              id="minSubtotal"
              name="minSubtotal"
              type="number"
              min={0}
              step="0.01"
              placeholder="0"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="maxUses">Max uses (optional)</label>
            <input
              id="maxUses"
              name="maxUses"
              type="number"
              min={1}
              step={1}
              placeholder="Unlimited"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="startsAt">Starts</label>
              <input id="startsAt" name="startsAt" type="datetime-local" className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="endsAt">Ends</label>
              <input id="endsAt" name="endsAt" type="datetime-local" className={inputCls} />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-emerald-700 px-4 py-2.5 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-emerald-800"
          >
            Create code
          </button>
        </form>
      </div>
    </>
  )
}
