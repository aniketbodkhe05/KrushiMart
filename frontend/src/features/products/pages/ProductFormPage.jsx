import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import PageHeader from '../../../components/common/PageHeader'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { FormField, SelectInput, TextArea, TextInput } from '../../../components/forms/FormField'
import { ErrorState, LoadingState } from '../../../components/feedback/StatePanel'
import { useApi } from '../../../hooks/useApi'
import { useAuth } from '../../../hooks/useAuth'
import { useToast } from '../../../hooks/useToast'
import {
  CATEGORY_OPTIONS,
  LANGUAGE_OPTIONS,
  LISTING_STATUS_OPTIONS,
  REGIONS,
  UNIT_OPTIONS,
} from '../../../lib/constants'
import { createProduct, getProduct, updateProduct } from '../../../services/products.api'
import { getErrorMessage } from '../../../services/api-client'

function emptyForm(prefill = {}) {
  return {
    title: prefill.title || '',
    description: prefill.description || '',
    category: prefill.category || '',
    price: prefill.price ?? '',
    quantityAvailable: prefill.quantityAvailable ?? '',
    unit: prefill.unit || 'PIECE',
    listingStatus: prefill.listingStatus || 'ACTIVE',
    language: prefill.language || 'en',
    region: prefill.region || '',
    imageUrl: prefill.imageUrl || '',
  }
}

function validate(form) {
  const errors = {}
  if (form.title.trim().length < 3) errors.title = 'Use at least 3 characters.'
  if (form.description.trim().length < 10) errors.description = 'Describe the product in at least 10 characters.'
  if (!form.category) errors.category = 'Choose a category.'
  if (!form.region) errors.region = 'Choose a region.'
  if (form.price === '' || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
    errors.price = 'Enter a valid price of zero or more.'
  }
  if (
    form.quantityAvailable === '' ||
    Number.isNaN(Number(form.quantityAvailable)) ||
    Number(form.quantityAvailable) < 0
  ) {
    errors.quantityAvailable = 'Enter a valid quantity of zero or more.'
  }
  return errors
}

export default function ProductFormPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [form, setForm] = useState(() =>
    emptyForm({
      title: searchParams.get('title') || '',
      category: searchParams.get('category') || '',
      region: searchParams.get('region') || '',
    }),
  )
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const productState = useApi(
    () => (editing ? getProduct(id) : Promise.resolve(null)),
    [id, editing],
  )

  useEffect(() => {
    if (productState.data) {
      setForm(emptyForm(productState.data))
    }
  }, [productState.data])

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = validate(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        price: Number(form.price),
        quantityAvailable: Number(form.quantityAvailable),
        unit: form.unit,
        listingStatus: form.listingStatus,
        language: form.language,
        region: form.region,
        imageUrl: form.imageUrl.trim() || null,
      }
      const saved = editing ? await updateProduct(id, payload) : await createProduct(payload)
      addToast({
        title: editing ? 'Listing updated' : 'Listing published',
        message: saved.available
          ? 'Your listing is now visible to buyers.'
          : 'Saved. It will not appear in available search results until it is active with stock.',
      })
      navigate(`/products/${saved.id}`)
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  if (editing && productState.loading) {
    return (
      <div className="page-shell py-10">
        <LoadingState label="Loading listing…" />
      </div>
    )
  }

  if (editing && productState.error) {
    return (
      <div className="page-shell py-10">
        <ErrorState message={productState.error} onRetry={productState.reload} />
      </div>
    )
  }

  if (editing && productState.data && productState.data.sellerId !== user?.id) {
    return (
      <div className="page-shell py-10">
        <ErrorState message="Only the listing owner can edit this product." />
        <div className="mt-4 text-center">
          <Link to={`/products/${id}`} className="text-sm font-semibold text-leaf-700">
            ← Back to product
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell py-8 sm:py-10">
      <Link
        to={editing ? `/products/${id}` : '/marketplace'}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-leaf-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {editing ? 'Back to product' : 'Back to marketplace'}
      </Link>
      <PageHeader
        className="mt-4"
        eyebrow={editing ? 'Edit listing' : 'New listing'}
        title={editing ? 'Update your product' : 'List an agricultural product'}
        description="Use a clear title and approximate region. The seller identity is taken from your signed-in account, not from this form."
      />

      <form onSubmit={submit} className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="space-y-5 p-5 sm:p-6">
          <FormField label="Product title" htmlFor="title" required error={errors.title}>
            <TextInput
              id="title"
              value={form.title}
              onChange={update('title')}
              placeholder="e.g. Mini Tiller 7HP"
              maxLength={140}
              invalid={Boolean(errors.title)}
            />
          </FormField>

          <FormField
            label="Description"
            htmlFor="description"
            required
            error={errors.description}
            hint="Condition, included parts, pickup or inspection details. Do not include personal addresses."
          >
            <TextArea
              id="description"
              value={form.description}
              onChange={update('description')}
              rows={6}
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
            <FormField label="Region" htmlFor="region" required error={errors.region}>
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
            <FormField label="Price (INR)" htmlFor="price" required error={errors.price}>
              <TextInput
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={update('price')}
                invalid={Boolean(errors.price)}
              />
            </FormField>
            <FormField
              label="Quantity available"
              htmlFor="quantityAvailable"
              required
              error={errors.quantityAvailable}
            >
              <TextInput
                id="quantityAvailable"
                type="number"
                min="0"
                step="0.01"
                value={form.quantityAvailable}
                onChange={update('quantityAvailable')}
                invalid={Boolean(errors.quantityAvailable)}
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
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="space-y-4 p-5">
            <FormField label="Listing language" htmlFor="language">
              <SelectInput id="language" value={form.language} onChange={update('language')}>
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField label="Listing status" htmlFor="listingStatus">
              <SelectInput id="listingStatus" value={form.listingStatus} onChange={update('listingStatus')}>
                {LISTING_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </FormField>
            <FormField
              label="Image URL (optional)"
              htmlFor="imageUrl"
              hint="A public image URL. Leave blank to use a category illustration."
            >
              <TextInput
                id="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={update('imageUrl')}
                placeholder="https://…"
              />
            </FormField>
            <div className="rounded-xl bg-leaf-50 p-3 text-xs leading-5 text-leaf-900">
              Only <strong>active</strong> listings with quantity above zero appear as available in search.
              Sellers set the price and contact consent; KrushiMart does not process payments.
            </div>
          </Card>

          {submitError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              {submitError}
            </div>
          ) : null}

          <div className="flex gap-2">
            <Button type="submit" icon={Save} loading={submitting} className="flex-1">
              {editing ? 'Save changes' : 'Publish listing'}
            </Button>
            <Link
              to={editing ? `/products/${id}` : '/marketplace'}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-600 ring-1 ring-inset ring-stone-300 hover:bg-stone-100"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
