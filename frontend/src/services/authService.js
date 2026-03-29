// Frontend developer: Mehdi AGHAEI
import { readStoredProfileMeta } from '../utils/storage'
import { enrichUserWithProfileMeta } from '../utils/profileUtils'
import { requestJson } from './api'

function buildFullName(user) {
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim()
  return name || user?.username || 'EventHub user'
}

export function normalizeUser(user) {
  if (!user) {
    return null
  }

  const normalizedUser = {
    ...user,
    full_name: buildFullName(user),
    role: user.is_staff ? 'admin' : 'viewer',
  }

  return enrichUserWithProfileMeta(normalizedUser, readStoredProfileMeta(user))
}

export function loginUser(credentials) {
  return requestJson('/auth/token/', {
    method: 'POST',
    data: credentials,
  })
}

export function registerUser(formValues) {
  return requestJson('/auth/register/', {
    method: 'POST',
    data: {
      username: formValues.username.trim(),
      email: formValues.email.trim(),
      first_name: formValues.firstName.trim(),
      last_name: formValues.lastName.trim(),
      password: formValues.password,
      password2: formValues.passwordConfirmation,
    },
  })
}

export function fetchCurrentUser(accessToken, signal) {
  return requestJson('/auth/me/', {
    token: accessToken,
    signal,
  }).then(normalizeUser)
}

export function refreshAccessToken(refreshToken, signal) {
  return requestJson('/auth/token/refresh/', {
    method: 'POST',
    data: {
      refresh: refreshToken,
    },
    signal,
  })
}
