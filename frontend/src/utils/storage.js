// Frontend developer: Mehdi AGHAEI
import { PROFILE_META_STORAGE_KEY, SESSION_STORAGE_KEY, THEME_STORAGE_KEY } from '../constants/appConstants'

const VISITOR_COUNT_STORAGE_KEY = 'eventhub_visitor_count'
const VISITOR_SESSION_STORAGE_KEY = 'eventhub_visitor_session'

export function readStoredSession() {
  try {
    const rawValue = window.localStorage.getItem(SESSION_STORAGE_KEY)
    if (!rawValue) {
      return null
    }

    const parsedSession = JSON.parse(rawValue)
    if (!parsedSession?.accessToken || !parsedSession?.refreshToken) {
      return null
    }

    return parsedSession
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

export function readStoredTheme() {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme
    }
  } catch {
    return 'light'
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function writeStoredTheme(themeMode) {
  if (themeMode !== 'light' && themeMode !== 'dark') {
    window.localStorage.removeItem(THEME_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
}

export function readStoredVisitorCount(defaultCount = 982) {
  try {
    const rawValue = window.localStorage.getItem(VISITOR_COUNT_STORAGE_KEY)
    const parsedCount = Number(rawValue)
    return Number.isInteger(parsedCount) && parsedCount > 0 ? parsedCount : defaultCount
  } catch {
    return defaultCount
  }
}

export function trackVisitorCount(defaultCount = 982) {
  try {
    const hasBeenCountedThisSession = window.sessionStorage.getItem(VISITOR_SESSION_STORAGE_KEY) === 'counted'
    const hasStoredCount = window.localStorage.getItem(VISITOR_COUNT_STORAGE_KEY) !== null
    const currentCount = readStoredVisitorCount(defaultCount)

    if (hasBeenCountedThisSession) {
      return currentCount
    }

    const nextCount = hasStoredCount ? currentCount + 1 : currentCount
    window.localStorage.setItem(VISITOR_COUNT_STORAGE_KEY, String(nextCount))
    window.sessionStorage.setItem(VISITOR_SESSION_STORAGE_KEY, 'counted')

    return nextCount
  } catch {
    return defaultCount
  }
}

function readStoredProfileMetaMap() {
  try {
    const rawValue = window.localStorage.getItem(PROFILE_META_STORAGE_KEY)
    if (!rawValue) {
      return {}
    }

    const parsedValue = JSON.parse(rawValue)
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {}
  } catch {
    return {}
  }
}

function writeStoredProfileMetaMap(profileMetaMap) {
  if (!profileMetaMap || typeof profileMetaMap !== 'object' || !Object.keys(profileMetaMap).length) {
    window.localStorage.removeItem(PROFILE_META_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(PROFILE_META_STORAGE_KEY, JSON.stringify(profileMetaMap))
}

function buildProfileMetaKeys({ email, username }) {
  return [email?.trim().toLowerCase(), username?.trim().toLowerCase()].filter(Boolean)
}

export function readStoredProfileMeta(userLike) {
  const profileMetaMap = readStoredProfileMetaMap()
  const lookupKeys = buildProfileMetaKeys(userLike)

  for (const key of lookupKeys) {
    if (profileMetaMap[key]) {
      return profileMetaMap[key]
    }
  }

  return null
}

export function writeStoredProfileMeta(userLike, profileMeta) {
  if (!profileMeta) {
    return
  }

  const profileMetaMap = readStoredProfileMetaMap()

  buildProfileMetaKeys(userLike).forEach((key) => {
    profileMetaMap[key] = profileMeta
  })

  writeStoredProfileMetaMap(profileMetaMap)
}
