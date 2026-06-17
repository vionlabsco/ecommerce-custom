import type { Metadata } from 'next'
import { PageHeader } from '@/components/admin/PageHeader'
import { getSettings } from '@/lib/admin/settings'
import {
  updateStoreProfileAction,
  updateAddressAction,
  updateMoneyAction,
  updateSocialAction,
} from '@/lib/admin/settings-actions'

export const metadata: Metadata = { title: 'Settings' }
export const dynamic = 'force-dynamic'

const labelCls = 'mb-1.5 block text-[13px] font-medium text-gray-700'
const inputCls =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100'

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action: (fd: FormData) => Promise<void>
  children: React.ReactNode
}) {
  return (
    <form
      action={action}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"
    >
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-gray-500">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
      <div className="mt-5 flex justify-end border-t border-gray-100 pt-4">
        <button
          type="submit"
          className="rounded-md bg-emerald-700 px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-colors hover:bg-emerald-800"
        >
          Save
        </button>
      </div>
    </form>
  )
}

export default async function SettingsPage() {
  const s = await getSettings()
  const free = (s.freeShippingThresholdCents / 100).toFixed(2)
  const flat = (s.flatShippingCents / 100).toFixed(2)
  const taxPct = (s.taxRate * 100).toFixed(2)

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Store profile, address, money, social — all stored in your Supabase project."
      />

      <div className="space-y-5">
        {/* Store profile */}
        <Section
          title="Store profile"
          description="The basics that show up in the storefront header, footer, and emails."
          action={updateStoreProfileAction}
        >
          <div>
            <label className={labelCls} htmlFor="storeName">Store name</label>
            <input id="storeName" name="storeName" defaultValue={s.storeName} className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="storeTagline">Tagline</label>
            <input id="storeTagline" name="storeTagline" defaultValue={s.storeTagline} className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="storeDescription">Description</label>
            <textarea
              id="storeDescription"
              name="storeDescription"
              rows={3}
              defaultValue={s.storeDescription}
              placeholder="A short paragraph that appears in metadata + SEO."
              className={inputCls}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="contactEmail">Contact email</label>
              <input id="contactEmail" name="contactEmail" type="email" defaultValue={s.contactEmail} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="contactPhone">Contact phone</label>
              <input id="contactPhone" name="contactPhone" defaultValue={s.contactPhone} placeholder="optional" className={inputCls} />
            </div>
          </div>
        </Section>

        {/* Address */}
        <Section
          title="Business address"
          description="Used as the shipping origin and in legal / compliance footers."
          action={updateAddressAction}
        >
          <div>
            <label className={labelCls} htmlFor="addressLine1">Street address</label>
            <input id="addressLine1" name="addressLine1" defaultValue={s.addressLine1} className={inputCls} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className={labelCls} htmlFor="addressCity">City</label>
              <input id="addressCity" name="addressCity" defaultValue={s.addressCity} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="addressRegion">State / region</label>
              <input id="addressRegion" name="addressRegion" defaultValue={s.addressRegion} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="addressPostal">Postal code</label>
              <input id="addressPostal" name="addressPostal" defaultValue={s.addressPostal} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls} htmlFor="addressCountry">Country</label>
            <input id="addressCountry" name="addressCountry" defaultValue={s.addressCountry} className={inputCls} />
          </div>
        </Section>

        {/* Money & shipping */}
        <Section
          title="Money & shipping"
          description="Currency, free-shipping threshold, flat shipping rate, and estimated tax."
          action={updateMoneyAction}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="currency">Currency</label>
              <select id="currency" name="currency" defaultValue={s.currency} className={inputCls}>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="INR">INR — Indian Rupee</option>
                <option value="CAD">CAD — Canadian Dollar</option>
                <option value="AUD">AUD — Australian Dollar</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="locale">Locale</label>
              <input id="locale" name="locale" defaultValue={s.locale} placeholder="en-US" className={inputCls} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className={labelCls} htmlFor="freeShippingThreshold">Free shipping at (in {s.currency})</label>
              <input id="freeShippingThreshold" name="freeShippingThreshold" type="number" step="0.01" min="0" defaultValue={free} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="flatShipping">Flat shipping rate (in {s.currency})</label>
              <input id="flatShipping" name="flatShipping" type="number" step="0.01" min="0" defaultValue={flat} className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="taxRate">Tax rate (%)</label>
              <input id="taxRate" name="taxRate" type="number" step="0.01" min="0" defaultValue={taxPct} className={inputCls} />
            </div>
          </div>
        </Section>

        {/* Social */}
        <Section
          title="Social links"
          description="Linked from the footer. Paste full URLs."
          action={updateSocialAction}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="socialInstagram">Instagram</label>
              <input id="socialInstagram" name="socialInstagram" type="url" defaultValue={s.socialInstagram} placeholder="https://instagram.com/…" className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="socialTwitter">X / Twitter</label>
              <input id="socialTwitter" name="socialTwitter" type="url" defaultValue={s.socialTwitter} placeholder="https://x.com/…" className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="socialFacebook">Facebook</label>
              <input id="socialFacebook" name="socialFacebook" type="url" defaultValue={s.socialFacebook} placeholder="https://facebook.com/…" className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="socialTiktok">TikTok</label>
              <input id="socialTiktok" name="socialTiktok" type="url" defaultValue={s.socialTiktok} placeholder="https://tiktok.com/@…" className={inputCls} />
            </div>
          </div>
        </Section>
      </div>
    </>
  )
}
