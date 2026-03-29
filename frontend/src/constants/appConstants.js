// Frontend developer: Mehdi AGHAEI
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
).replace(/\/$/, '')

export const SESSION_STORAGE_KEY = 'eventhub.session'
export const THEME_STORAGE_KEY = 'eventhub.theme'
export const PROFILE_META_STORAGE_KEY = 'eventhub.profileMeta'

export const EDITABLE_ROLES = Object.freeze(['admin'])

export const SOCIAL_AUTH_PROVIDERS = Object.freeze([
  {
    id: 'google',
    label: 'Gmail / Google',
    href: import.meta.env.VITE_SOCIAL_GOOGLE_URL || '',
  },
  {
    id: 'github',
    label: 'GitHub',
    href: import.meta.env.VITE_SOCIAL_GITHUB_URL || '',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: import.meta.env.VITE_SOCIAL_LINKEDIN_URL || '',
  },
  {
    id: 'yahoo',
    label: 'Yahoo',
    href: import.meta.env.VITE_SOCIAL_YAHOO_URL || '',
  },
  {
    id: 'discord',
    label: 'Discord',
    href: import.meta.env.VITE_SOCIAL_DISCORD_URL || '',
  },
])

export const EVENT_STATUS_OPTIONS = Object.freeze([
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'soon', label: 'Soon' },
  { value: 'today', label: 'Today' },
  { value: 'full', label: 'Full' },
])
