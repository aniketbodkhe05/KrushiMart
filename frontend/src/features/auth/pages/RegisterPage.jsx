import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Leaf, UserPlus } from 'lucide-react'
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
import { getErrorMessage } from '../../../services/api-client'

function safeRedirect(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export default function RegisterPage() {
  const { register } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = safeRedirect(searchParams.get('redirect'))

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'FARMER',
    region: '',
    preferredCategories: [],
    notifyOptIn: true,
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (form.fullName.trim().length < 2) nextErrors.fullName = 'Enter your full name.'
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      nextErrors.phone = 'Enter a valid 10-digit Indian mobile number.'
    }
    if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'
    if (!form.region) nextErrors.region = 'Choose your region.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const user = await register({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role: form.role,
        region: form.region,
        preferredCategories: form.preferredCategories,
        notifyOptIn: form.notifyOptIn,
      })
      addToast({
        title: `Welcome, ${user.fullName.split(' ')[0]}`,
        message: 'Your account is ready. Add a listing or submit a request.',
      })
      navigate(redirect, { replace: true })
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-shell py-10 sm:py-14">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-stone-200 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="hidden bg-leaf-800 p-8 text-white lg:block">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="rounded-xl bg-white/15 p-2">
              <Leaf className="h-5 w-5" aria-hidden="true" />
            </span>
            KrushiMart
          </div>
          <h1 className="mt-10 text-3xl font-bold leading-tight">Grow with the local market.</h1>
          <p className="mt-4 text-sm leading-6 text-leaf-100">
            One account lets you list products, request what you need, and receive relevant demand
            opportunities when you opt in.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-leaf-100">
            <li>✓ Explicit requests, not hidden surveillance</li>
            <li>✓ Deterministic demand scoring</li>
            <li>✓ Contact details shared only with consent</li>
          </ul>
        </div>

        <div className="p-6 sm:p-9">
          <div className="lg:hidden">
            <div className="flex items-center gap-2 text-lg font-bold text-leaf-800">
              <Leaf className="h-5 w-5" aria-hidden="true" /> KrushiMart
            </div>
          </div>
          <h2 className="mt-3 text-2xl font-bold text-stone-900 lg:mt-0">Create your account</h2>
          <p className="mt-1 text-sm text-stone-600">
            Already registered?{' '}
            <Link
              to={`/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : ''}`}
              className="font-semibold text-leaf-700 hover:text-leaf-800"
            >
              Sign in
            </Link>
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full name" htmlFor="fullName" required error={errors.fullName}>
                <TextInput
                  id="fullName"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={update('fullName')}
                  invalid={Boolean(errors.fullName)}
                />
              </FormField>
              <FormField label="Phone number" htmlFor="phone" required error={errors.phone}>
                <TextInput
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  value={form.phone}
                  onChange={update('phone')}
                  placeholder="10-digit mobile"
                  invalid={Boolean(errors.phone)}
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Password" htmlFor="password" required error={errors.password}>
                <div className="relative">
                  <TextInput
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={update('password')}
                    invalid={Boolean(errors.password)}
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>
              <FormField
                label="Confirm password"
                htmlFor="confirmPassword"
                required
                error={errors.confirmPassword}
              >
                <TextInput
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={update('confirmPassword')}
                  invalid={Boolean(errors.confirmPassword)}
                />
              </FormField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="I am a…" htmlFor="role">
                <SelectInput id="role" value={form.role} onChange={update('role')}>
                  {ROLE_OPTIONS.map((option) => (
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

            {['FARMER', 'BOTH'].includes(form.role) ? (
              <CheckboxGroup
                legend="Preferred categories (optional)"
                options={CATEGORY_OPTIONS}
                values={form.preferredCategories}
                onChange={(values) => setForm({ ...form, preferredCategories: values })}
              />
            ) : null}

            <CheckboxField
              label="Notify me about relevant demand and matches"
              description="You can change this later in your profile. Notifications are in-app only in the MVP."
              checked={form.notifyOptIn}
              onChange={(event) => setForm({ ...form, notifyOptIn: event.target.checked })}
            />

            {submitError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                {submitError}
              </div>
            ) : null}

            <Button type="submit" icon={UserPlus} loading={submitting} className="w-full">
              Create account
            </Button>
            <p className="text-center text-[11px] leading-5 text-stone-500">
              By creating an account you accept that contact details are shared only when a seller opts in.
              KrushiMart does not process payments in this MVP.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
