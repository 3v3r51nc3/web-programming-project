// Frontend developer: Mehdi AGHAEI
import { API_BASE_URL } from '../constants/appConstants'

function humanizeKey(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function flattenErrorDetails(details, fieldLabel = '') {
  if (Array.isArray(details)) {
    return details
      .map((value) => flattenErrorDetails(value, fieldLabel))
      .filter(Boolean)
      .join(' ')
  }

  if (details && typeof details === 'object') {
    return Object.entries(details)
      .map(([key, value]) => {
        const nextLabel =
          key === 'non_field_errors' || key === 'detail' ? fieldLabel : humanizeKey(key)
        return flattenErrorDetails(value, nextLabel)
      })
      .filter(Boolean)
      .join(' ')
  }

  if (typeof details === 'string') {
    return fieldLabel ? `${fieldLabel}: ${details}` : details
  }

  return ''
}

function extractErrorMessage(payload) {
  if (!payload) {
    return 'The server returned an empty response.'
  }

  if (typeof payload === 'string') {
    return payload
  }

  if (typeof payload.message === 'string') {
    return payload.message
  }

  if (typeof payload.detail === 'string') {
    return payload.detail
  }

  if (payload.details) {
    const detailsMessage = flattenErrorDetails(payload.details)
    if (detailsMessage) {
      return detailsMessage
    }
  }

  return 'The request could not be completed.'
}

export async function requestJson(path, { method = 'GET', token = '', data, signal } = {}) {
  const headers = {
    Accept: 'application/json',
  }

  if (data !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Token ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: data === undefined ? undefined : JSON.stringify(data),
    signal,
  })

  const rawBody = await response.text()
  let payload = null

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody)
    } catch {
      payload = rawBody
    }
  }

  if (!response.ok) {
    const error = new Error(extractErrorMessage(payload))
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}
