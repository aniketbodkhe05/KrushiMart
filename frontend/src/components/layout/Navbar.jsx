import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  Bell,
  LayoutGrid,
  LogOut,
  Menu,
  Plus,
  Radar,
  UserRound,
  X,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { listNotifications } from '../../services/notifications.api'
import { buttonClasses } from '../ui/buttonStyles'

function navLinkClasses({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-leaf-100 text-leaf-800' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
  }`
}

export default function Navbar() {
  const { user, canSell, logout, isAuthenticated } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const location = useLocation()

  const loadUnread = useCallback(async () => {
    if (!user) {
      setUnread(0)
      return
    }
    try {
      const notifications = await listNotifications()
      setUnread(notifications.filter((notification) => !notification.read).length)
    } catch {
      setUnread(0)
    }
  }, [user])

  useEffect(() => {
    loadUnread()
  }, [loadUnread, location.pathname])

  useEffect(() => {
    const handler = () => loadUnread()
    window.addEventListener('krushimart:notifications-changed', handler)
    return () => window.removeEventListener('krushimart:notifications-changed', handler)
  }, [loadUnread])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const closeMenu = () => setMobileOpen(false)
  const handleLogout = () => {
    logout()
    closeMenu()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5" onClick={closeMenu}>
          <img src="/logo.svg" alt="" className="h-9 w-9" />
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-stone-900">KrushiMart</span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-leaf-700">
              Farmer to farmer
            </span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          <NavLink to="/marketplace" className={navLinkClasses}>
            Marketplace
          </NavLink>
          {canSell ? (
            <NavLink to="/demandgap" className={navLinkClasses}>
              DemandGap
            </NavLink>
          ) : null}
          {isAuthenticated ? (
            <NavLink to="/requests" className={navLinkClasses}>
              My requests
            </NavLink>
          ) : null}
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {canSell ? (
            <Link to="/products/new" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              List a product
            </Link>
          ) : null}

          {isAuthenticated ? (
            <>
              <Link
                to="/notifications"
                className="relative rounded-lg p-2 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {unread > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                ) : null}
              </Link>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-leaf-100 text-leaf-800">
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="max-w-28 truncate">{user.fullName.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-red-700"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
                Log in
              </Link>
              <Link to="/register" className={buttonClasses({ variant: 'primary', size: 'sm' })}>
                Join KrushiMart
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="ml-auto rounded-lg p-2 text-stone-700 hover:bg-stone-100 lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen ? (
        <div id="mobile-menu" className="border-t border-stone-200 bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            <NavLink to="/marketplace" className={navLinkClasses} onClick={closeMenu}>
              <span className="inline-flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" /> Marketplace
              </span>
            </NavLink>
            {canSell ? (
              <>
                <NavLink to="/demandgap" className={navLinkClasses} onClick={closeMenu}>
                  <span className="inline-flex items-center gap-2">
                    <Radar className="h-4 w-4" /> DemandGap opportunities
                  </span>
                </NavLink>
                <NavLink to="/products/new" className={navLinkClasses} onClick={closeMenu}>
                  <span className="inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" /> List a product
                  </span>
                </NavLink>
              </>
            ) : null}
            {isAuthenticated ? (
              <>
                <NavLink to="/requests" className={navLinkClasses} onClick={closeMenu}>
                  My requests
                </NavLink>
                <NavLink to="/notifications" className={navLinkClasses} onClick={closeMenu}>
                  <span className="inline-flex items-center gap-2">
                    <Bell className="h-4 w-4" /> Notifications
                    {unread > 0 ? (
                      <span className="rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">
                        {unread}
                      </span>
                    ) : null}
                  </span>
                </NavLink>
                <NavLink to="/profile" className={navLinkClasses} onClick={closeMenu}>
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4" /> {user.fullName}
                  </span>
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className={buttonClasses({ variant: 'secondary', size: 'sm' })}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className={buttonClasses({ variant: 'primary', size: 'sm' })}
                >
                  Join
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
