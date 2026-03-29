// Frontend developer: Mehdi AGHAEI
const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function createDefaultDateTimeValue() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(18, 0, 0, 0)

  return toDateTimeLocalValue(date.toISOString())
}

export function toDateTimeLocalValue(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const timezoneOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

export function toApiDateTime(localValue) {
  const date = new Date(localValue)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString()
}

export function toDateInputValue(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDateTime(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date'
  }

  return dateTimeFormatter.format(date)
}

export function formatLastUpdated(dateValue) {
  if (!dateValue) {
    return 'Not synced yet'
  }

  return `Synced ${formatDateTime(dateValue)}`
}
