import { useEffect, useState } from 'react'
import { CalendarDays, Save, ShieldCheck, UserRound } from 'lucide-react'
import PageHeader from '../../../components/common/PageHeader'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import {
  CheckboxField,
  CheckboxGroup,
  FormField,
  SelectInput,
  TextInput,
} from '../../../components/forms/FormField'
import { useAuth } from '../../../hooks/useAuth'
import { useToast } from '../../../hooks/useToast'
import { CATEGORY_OPTIONS, REGIONS, ROLE_OPTIONS } from '../../../lib/constants'
import { formatDate } from '../../../utils/format'
import { getErrorMessage } from '../../../services/api-client'

export default function ProfilePage() {
  const { user, updateProfile, canSell } = useAuth()
  const { addToast } = useToast()
  const [form, setForm] = useState({
    fullName: user.fullName,
    region: user.region,
    preferredCategories: user.preferredCategories || [],
    notifyOptIn: user.notifyOptIn,
    contactVisible: user.contactVisible,
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    setForm({
      fullName: user.fullName,
      region: user.region,
      preferredCategories: user.preferredCategories || [],
      notifyOptIn: user.notifyOptIn,
      contactVisible: user.contactVisible,
    })
  }, [user])

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (form.fullName.trim().length < 2) nextErrors.fullName = 'Enter your name.'
    if (!form.region) nextErrors.region = 'Choose your region.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSaving(true)
    setSaveError(null)
    try {
      await updateProfile({
        fullName: form.fullName.trim(),
        region: form.region,
        preferredCategories: form.preferredCategories,
        notifyOptIn: form.notifyOptIn,
        contactVisible: form.contactVisible,
      })
      addToast({ title: 'Profile updated', message: 'Your preferences are saved.' })
    } catch (error) {
      setSaveError(getErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const roleLabel = ROLE_OPTIONS.find((role) => role.value === user.role)?.label || user.role

  return (
    <div className="page-shell py-8 sm:py-10">
      <PageHeader
        eyebrow="Agricultural profile"
        title="Your profile and preferences"
        description="Your region and preferred categories help decide which demand opportunities are relevant. Notifications are opt-in."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="p-5 sm:p-6">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full name" htmlFor="fullName" required error={errors.fullName}>
                <TextInput
                  id="fullName"
                  value={form.fullName}
                  onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                  invalid={Boolean(errors.fullName)}
                />
              </FormField>
              <FormField label="Phone (login)" htmlFor="phone" hint="Phone cannot be changed in the MVP.">
                <TextInput id="phone" value={user.phone} disabled />
              </FormField>
            </div>

            <FormField label="Region" htmlFor="region" required error={errors.region}>
              <SelectInput
                id="region"
                value={form.region}
                onChange={(event) => setForm({ ...form, region: event.target.value })}
                invalid={Boolean(errors.region)}
              >
                <option value="">Choose region</option>
                {REGIONS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </SelectInput>
            </FormField>

            {canSell ? (
              <CheckboxGroup
                legend="Preferred categories (used for DemandGap eligibility)"
                options={CATEGORY_OPTIONS}
                values={form.preferredCategories}
                onChange={(values) => setForm({ ...form, preferredCategories: values })}
              />
            ) : (
              <div className="rounded-xl bg-stone-50 p-3 text-xs leading-5 text-stone-600">
                Category preferences are used by farmer accounts for demand opportunities. You can still
                search and request any product.
              </div>
            )}

            <CheckboxField
              label="Receive in-app demand and request notifications"
              description="We notify you only for eligible, qualified opportunities. You can turn this off at any time."
              checked={form.notifyOptIn}
              onChange={(event) => setForm({ ...form, notifyOptIn: event.target.checked })}
            />

            {canSell ? (
              <CheckboxField
                label="Show my phone number to buyers"
                description="When enabled, buyers can see your number on your available listings. Turning this off hides all contact details."
                checked={form.contactVisible}
                onChange={(event) => setForm({ ...form, contactVisible: event.target.checked })}
              />
            ) : null}

            {saveError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                {saveError}
              </div>
            ) : null}

            <Button type="submit" icon={Save} loading={saving}>
              Save profile
            </Button>
          </form>
        </Card>

        <aside className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <UserRound className="h-4 w-4 text-leaf-700" aria-hidden="true" /> Account
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-stone-500">Role</dt>
                <dd className="mt-0.5 font-medium text-stone-800">{roleLabel}</dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Member since</dt>
                <dd className="mt-0.5 inline-flex items-center gap-1.5 font-medium text-stone-800">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  {formatDate(user.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Categories</dt>
                <dd className="mt-0.5 font-medium text-stone-800">
                  {form.preferredCategories.length > 0 ? form.preferredCategories.join(', ') : 'Not set'}
                </dd>
              </div>
            </dl>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
              <ShieldCheck className="h-4 w-4 text-leaf-700" aria-hidden="true" /> Privacy note
            </div>
            <p className="mt-2 text-xs leading-5 text-stone-600">
              Opportunity feeds show category, approximate region and counts — never exact farm locations
              or another person's search history. Contact details require seller consent.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  )
}
