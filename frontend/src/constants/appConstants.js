// Frontend developer: Mehdi AGHAEI
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
).replace(/\/$/, '')

export const SESSION_STORAGE_KEY = 'eventhub.session'

export const EDITABLE_ROLES = Object.freeze(['admin', 'editor'])

export const EVENT_STATUS_OPTIONS = Object.freeze([
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'soon', label: 'Soon' },
  { value: 'today', label: 'Today' },
  { value: 'full', label: 'Full' },
])
