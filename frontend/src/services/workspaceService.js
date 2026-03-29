// Frontend developer: Mehdi AGHAEI
import { requestJson } from './api'

export async function fetchWorkspace(token, signal) {
  const [mePayload, events, participants, registrations] = await Promise.all([
    requestJson('/auth/me/', { token, signal }),
    requestJson('/events/', { token, signal }),
    requestJson('/participants/', { token, signal }),
    requestJson('/registrations/', { token, signal }),
  ])

  return {
    user: mePayload.user,
    events,
    participants,
    registrations,
  }
}
