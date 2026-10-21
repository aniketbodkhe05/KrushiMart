import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../services/auth.api'
import { clearSession, getStoredToken, getStoredUser, saveSession } from '../lib/storage'
import ToastViewport from '../components/feedback/ToastViewport'
import { AuthContext, ToastContext } from './contexts'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [loading, setLoading] = useState(() => Boolean(getStoredToken() && !getStoredUser()))

  const applySession = useCallback((session) => {
    saveSession(session.token, session.user)
    setUser(session.user)
    setLoading(false)
    return session.user
  }, [])

  const login = useCallback(
    async (credentials) => {
      const session = await authApi.login(credentials)
      return applySession(session)
    },
    [applySession],
  )

  const register = useCallback(
    async (payload) => {
      const session = await authApi.register(payload)
      return applySession(session)
    },
    [applySession],
  )

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (values) => {
    const updated = await authApi.updateProfile(values)
    saveSession(getStoredToken(), updated)
    setUser(updated)
    return updated
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => logout()
    window.addEventListener('krushimart:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('krushimart:unauthorized', handleUnauthorized)
  }, [logout])

  const authValue = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      canSell: Boolean(user && ['FARMER', 'BOTH'].includes(user.role)),
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, loading, login, register, logout, updateProfile],
  )

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    ({ title, message, variant = 'success' }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      setToasts((current) => [...current, { id, title, message, variant }])
      window.setTimeout(() => removeToast(id), 4500)
      return id
    },
    [removeToast],
  )

  const toastValue = useMemo(() => ({ addToast, removeToast }), [addToast, removeToast])

  return (
    <ToastContext.Provider value={toastValue}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  )
}

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  )
}
