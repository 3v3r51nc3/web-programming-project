// Frontend developer: Mehdi AGHAEI
import { requestJson } from './api'

export function loginUser(credentials) {
  return requestJson('/auth/login/', {
    method: 'POST',
    data: credentials,
  })
}

export function logoutUser(token) {
  return requestJson('/auth/logout/', {
    method: 'POST',
    token,
  })
}
