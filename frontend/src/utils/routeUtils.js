// Frontend developer: Mehdi AGHAEI
import { APP_ROUTES, DEFAULT_ROUTE } from '../constants/routes'

export function normalizePath(path = '') {
  const strippedPath = path.replace(/^#/, '').trim()
  if (!strippedPath) {
    return DEFAULT_ROUTE
  }

  return strippedPath.startsWith('/') ? strippedPath : `/${strippedPath}`
}

export function navigateTo(path) {
  const normalizedPath = normalizePath(path)
  const nextHash = `#${normalizedPath}`

  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash
  }
}

export function parseRouteFromHash(hash) {
  const normalizedPath = normalizePath(hash)
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
