// Frontend developer: Mehdi AGHAEI
import { APP_ROUTES, DEFAULT_ROUTE } from '../constants/routes'

const APP_NAVIGATION_EVENT = 'eventhub:navigation'

export function normalizePath(path = '', fallbackPath = DEFAULT_ROUTE) {
  const strippedPath = path.replace(/^#/, '').trim()
  if (!strippedPath) {
    return fallbackPath
  }

  return strippedPath.startsWith('/') ? strippedPath : `/${strippedPath}`
}

export function readCurrentPath(locationLike = window.location) {
  if (locationLike.hash) {
    return normalizePath(locationLike.hash)
  }

  const pathname = locationLike.pathname?.trim() || ''
  if (!pathname || pathname === '/' || pathname.endsWith('/index.html')) {
    return APP_ROUTES.login
  }

  return normalizePath(pathname)
}

export function navigateTo(path) {
  const normalizedPath = normalizePath(path, APP_ROUTES.login)

  if (normalizedPath === APP_ROUTES.login) {
    if (window.location.hash) {
      const nextUrl = `${window.location.pathname}${window.location.search}`
      window.history.pushState(null, '', nextUrl)
      window.dispatchEvent(new Event(APP_NAVIGATION_EVENT))
    }

    return
  }

  const nextHash = `#${normalizedPath}`

  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash
  }
}

export function parseRouteFromLocation(locationLike = window.location) {
  const normalizedPath = readCurrentPath(locationLike)
  const parts = normalizedPath.split('/').filter(Boolean)

  if (parts.length === 0 || parts[0] === APP_ROUTES.dashboard.slice(1)) {
    return { name: 'dashboard' }
  }

  if (parts[0] === APP_ROUTES.login.slice(1)) {
    return { name: 'login' }
  }

  if (parts[0] === APP_ROUTES.events.slice(1) && parts[1]) {
    const eventId = Number(parts[1])
    if (Number.isInteger(eventId) && eventId > 0) {
      return { name: 'event-details', eventId }
    }
  }

  if (parts[0] === APP_ROUTES.events.slice(1)) {
    return { name: 'events' }
  }

  if (parts[0] === APP_ROUTES.participants.slice(1)) {
    return { name: 'participants' }
  }

  return { name: 'dashboard' }
}

export function addNavigationListener(listener) {
  window.addEventListener('hashchange', listener)
  window.addEventListener('popstate', listener)
  window.addEventListener(APP_NAVIGATION_EVENT, listener)

  return () => {
    window.removeEventListener('hashchange', listener)
    window.removeEventListener('popstate', listener)
    window.removeEventListener(APP_NAVIGATION_EVENT, listener)
  }
}
