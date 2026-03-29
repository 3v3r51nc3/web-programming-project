// Frontend developer: Mehdi AGHAEI
import { normalizeUser } from './authService'

export async function fetchWorkspace(requester, signal) {
  const [user, events, participants, registrations] = await Promise.all([
    requester('/auth/me/', { signal }),
    requester('/events/', { signal }),
    requester('/participants/', { signal }),
    requester('/registrations/', { signal }),
  ])

  return {
    user: normalizeUser(user),
    events,
    participants,
    registrations,
  }
}
