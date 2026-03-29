// Frontend developer: Mehdi AGHAEI
import { requestJson } from './api'

export function fetchPublicEventsRequest(signal) {
  return requestJson('/events/', { signal })
}

export function saveEventRequest(requester, payload, eventId) {
  return requester(eventId ? `/events/${eventId}/` : '/events/', {
    method: eventId ? 'PATCH' : 'POST',
    data: payload,
  })
}

export function deleteEventRequest(requester, eventId) {
  return requester(`/events/${eventId}/`, {
    method: 'DELETE',
  })
}
