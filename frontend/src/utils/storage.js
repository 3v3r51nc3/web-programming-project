// Frontend developer: Mehdi AGHAEI
import { SESSION_STORAGE_KEY } from '../constants/appConstants'

export function readStoredSession() {
  try {
    const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY)
    if (!rawValue) {
      return null
    }

    return JSON.parse(rawValue)
  } catch {
    return null
  }
}

export function writeStoredSession(session) {
  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}
