import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Leaf, LogIn, Sprout } from 'lucide-react'
import Button from '../../../components/ui/Button'
import { buttonClasses } from '../../../components/ui/buttonStyles'
import { FormField, TextInput } from '../../../components/forms/FormField'
import { useAuth } from '../../../hooks/useAuth'
import { useToast } from '../../../hooks/useToast'
import { DEMO_ACCOUNTS } from '../../../lib/constants'
import { getErrorMessage } from '../../../services/api-client'

function safeRedirect(value) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export default function LoginPage() {
  const { user, login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const redirect = safeRedirect(searchParams.get('redirect') || location.state?.from?.pathname)

  const [form, setForm] = useState({ phone: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (user) navigate(redirect, { replace: true })
  }, [user, navigate, redirect])

  const submitCredentials = async (credentials) => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const signedIn = await login(credentials)
      addToast({ title: `Welcome back, ${signedIn.fullName.split(' ')[0]}`, message: 'You are signed in.' })
      navigate(redirect, { replace: true })
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!/^\d{10}$/.test(form.phone.trim())) nextErrors.phone = 'Enter a 10-digit Indian mobile number.'
    if (!form.password) nextErrors.password = 'Enter your password.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    await submitCredentials({ phone: form.phone.trim(), password: form.password })
  }

  return (
    <div className="page-shell py-10 sm:py-14">
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-stone-200 lg:grid-cols-2">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-leaf-800 p-8 text-white lg:flex">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-leaf-700/60" aria-hidden="true" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-leaf-700/40" aria-hidden="true" />
          <div className="relative">
            <div className="flex items-center gap-2 text-lg font-bold">
              <span className="rounded-xl bg-white/15 p-2">
                <Leaf className="h-5 w-5" aria-hidden="true" />
              </span>
              KrushiMart
            </div>
            <h1 className="mt-10 text-3xl font-bold leading-tight">
              Local products.
              <br />
              Visible demand.
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-leaf-100">
              Sign in to request products, contact consenting sellers, or see qualified demand gaps in
              your area.
            </p>
          </div>
          <div className="relative mt-10 rounded-2xl border border-white/15 bg-white/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sprout className="h-4 w-4" aria-hidden="true" /> Demo accounts
            </div>
            <p className="mt-1 text-xs leading-5 text-leaf-100">
              Try a farmer or customer account. All demo accounts use the password{' '}
              <span className="rounded bg-white/15 px-1.5 py-0.5 font-mono">password</span>.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-9">
          <div className="lg:hidden">
            <div className="flex items-center gap-2 text-lg font-bold text-leaf-800">
              <Leaf className="h-5 w-5" aria-hidden="true" /> KrushiMart
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-stone-900 lg:mt-0">Sign in</h2>
          <p className="mt-1 text-sm text-stone-600">
            New here?{' '}
            <Link
              to={`/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : ''}`}
              className="font-semibold text-leaf-700 hover:text-leaf-800"
            >
              Create an account
            </Link>
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <FormField label="Phone number" htmlFor="phone" required error={errors.phone}>
              <TextInput
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => {
                  setForm({ ...form, phone: event.target.value })
                  setErrors({ ...errors, phone: undefined })
                }}
                placeholder="10-digit mobile number"
                maxLength={10}
                invalid={Boolean(errors.phone)}
              />
            </FormField>
            <FormField label="Password" htmlFor="password" required error={errors.password}>
              <div className="relative">
                <TextInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(event) => {
                    setForm({ ...form, password: event.target.value })
                    setErrors({ ...errors, password: undefined })
                  }}
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

            {submitError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
                {submitError}
              </div>
            ) : null}

            <Button type="submit" icon={LogIn} loading={submitting} className="w-full">
              Sign in
            </Button>
          </form>

          <div className="mt-6 border-t border-stone-100 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              Quick demo sign-in
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.phone}
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setForm({ phone: account.phone, password: account.password })
                    submitCredentials({ phone: account.phone, password: account.password })
                  }}
                  className={`${buttonClasses({ variant: 'secondary', size: 'sm' })} justify-start`}
                >
                  {account.role === 'FARMER' ? 'Farmer' : 'Customer'}: {account.phone}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-stone-500">
              Demo data stays in this browser only. Password for all demo accounts: password
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
