import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Send } from 'lucide-react'
import PageHeader from '../../../components/common/PageHeader'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { FormField, SelectInput, TextArea, TextInput } from '../../../components/forms/FormField'
import { useToast } from '../../../hooks/useToast'
import {
  CATEGORY_OPTIONS,
  LANGUAGE_OPTIONS,
  REGIONS,
  UNIT_OPTIONS,
} from '../../../lib/constants'
import { createRequest } from '../../../services/requests.api'
import { getErrorMessage } from '../../../services/api-client'

export default function RequestFormPage() {
  const [searchParams] = useSearchParams()
  const { addToast } = useToast()
  const [form, setForm] = useState({
    title: searchParams.get('title') || '',
    description: '',
    category: searchParams.get('category') || '',
    region: searchParams.get('region') || '',
    quantity: 1,
    unit: 'PIECE',
    language: 'en',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [created, setCreated] = useState(null)

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (form.title.trim().length < 3) nextErrors.title = 'Describe what you need in at least 3 characters.'
    if (form.description.trim().length < 5) nextErrors.description = 'Add a short explanation for farmers.'
    if (!form.category) nextErrors.category = 'Choose a category.'
    if (!form.region) nextErrors.region = 'Choose your approximate region.'
    if (!(Number(form.quantity) > 0)) nextErrors.quantity = 'Quantity must be greater than zero.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const request = await createRequest({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        quantity: Number(form.quantity),
      })
      setCreated(request)
      addToast({
        title: 'Request submitted',
        message: 'Eligible farmers in the relevant region or category can now see the demand.',
      })
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  if (created) {
    return (
      <div className="page-shell py-10">
        <Card className="mx-auto max-w-2xl p-6 text-center sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf-100 text-leaf-700">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-stone-900">Request submitted</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Request #{created.id} is open. It contributes to the DemandGap Radar and may notify eligible
            farmers. We will add a notification if a matching listing appears.
          </p>
          <div className="mx-auto mt-5 max-w-md rounded-xl bg-stone-50 p-4 text-left">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-stone-900">{created.title}</p>
              <Badge tone="green">Open</Badge>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              {created.category} · {created.region} · {created.quantity} {created.unit.toLowerCase()}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link
              to="/requests"
              className="inline-flex items-center justify-center rounded-xl bg-leaf-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-leaf-800"
            >
              View my requests
            </Link>
            <Link
              to="/marketplace"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-700 ring-1 ring-inset ring-stone-300 hover:bg-stone-100"
            >
              Back to marketplace
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="page-shell py-8 sm:py-10">
      <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-leaf-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to marketplace
      </Link>
      <PageHeader
        className="mt-4"
        eyebrow="Explicit request"
        title="Tell farmers what you need"
        description="A request is stronger than a failed search. It is visible to eligible farmers and contributes to the deterministic DemandGap score."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="p-5 sm:p-6">
          <form onSubmit={submit} className="space-y-5">
            <FormField label="What do you need?" htmlFor="title" required error={errors.title}>
              <TextInput
                id="title"
                value={form.title}
                onChange={update('title')}
                placeholder="e.g. Mini tiller for two acres"
                maxLength={140}
                invalid={Boolean(errors.title)}
              />
            </FormField>
            <FormField
              label="Details"
              htmlFor="description"
              required
              error={errors.description}
              hint="Condition, purchase or rental preference, quantity and timing."
            >
              <TextArea
                id="description"
                value={form.description}
                onChange={update('description')}
                rows={5}
                maxLength={2000}
                invalid={Boolean(errors.description)}
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Category" htmlFor="category" required error={errors.category}>
                <SelectInput
                  id="category"
                  value={form.category}
                  onChange={update('category')}
                  invalid={Boolean(errors.category)}
                >
                  <option value="">Choose category</option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectInput>
              </FormField>
              <FormField label="Approximate region" htmlFor="region" required error={errors.region}>
                <SelectInput
                  id="region"
                  value={form.region}
                  onChange={update('region')}
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
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Quantity" htmlFor="quantity" required error={errors.quantity}>
                <TextInput
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.quantity}
                  onChange={update('quantity')}
                  invalid={Boolean(errors.quantity)}
                />
              </FormField>
              <FormField label="Unit" htmlFor="unit">
                <SelectInput id="unit" value={form.unit} onChange={update('unit')}>
                  {UNIT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectInput>
              </FormField>
              <FormField label="Language" htmlFor="language">
                <SelectInput id="language" value={form.language} onChange={update('language')}>
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectInput>
              </FormField>
            </div>

            {submitError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                {submitError}
              </div>
            ) : null}

            <Button type="submit" icon={Send} loading={submitting}>
              Submit request
            </Button>
          </form>
        </Card>

        <aside className="space-y-4">
          <Card className="border-leaf-200 bg-leaf-50 p-5">
            <p className="text-sm font-semibold text-leaf-900">How this becomes an opportunity</p>
            <ol className="mt-3 list-decimal space-y-2 pl-4 text-xs leading-5 text-leaf-900">
              <li>Your explicit request is recorded.</li>
              <li>Requests are grouped by category and approximate region.</li>
              <li>A deterministic score combines distinct requesters, request count, recent searches and current supply.</li>
              <li>Only qualified gaps are shown to eligible opted-in farmers.</li>
            </ol>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-semibold text-stone-900">What is not shared</p>
            <p className="mt-2 text-xs leading-5 text-stone-600">
              Your exact farm location and personal search history are not exposed. Farmers see the
              category, approximate region, request details and demand counts.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  )
}
