// Frontend developer: Mehdi AGHAEI
import { toDateInputValue } from './dateUtils'

export function getEventRegistrations(registrations, eventId) {
  return registrations.filter((registration) => registration.event === eventId)
}

export function getParticipantRegistrations(registrations, participantId) {
  return registrations.filter((registration) => registration.participant === participantId)
}

export function getConfirmedRegistrationsCount(event, registrations) {
  if (Number.isFinite(event?.confirmed_registrations_count)) {
    return event.confirmed_registrations_count
  }

  return getEventRegistrations(registrations, event.id).filter(
    (registration) => registration.status === 'confirmed',
  ).length
}

export function getRegistrationStatusMeta(registration) {
  if (registration.status === 'pending') {
    return { label: 'Pending', tone: 'accent' }
  }

  if (registration.status === 'confirmed') {
    return { label: 'Confirmed', tone: 'success' }
  }

  return { label: 'Cancelled', tone: 'neutral' }
}

export function getEventStatus(event, registrations) {
  const confirmedCount = getConfirmedRegistrationsCount(event, registrations)
  if (confirmedCount >= event.capacity) {
    return { label: 'Full', tone: 'warning' }
  }

  const eventDate = new Date(event.date)
  const now = new Date()

  if (toDateInputValue(eventDate) === toDateInputValue(now)) {
    return { label: 'Today', tone: 'accent' }
  }

  const differenceInDays = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (differenceInDays <= 7) {
    return { label: 'Soon', tone: 'success' }
  }

  return { label: 'Open', tone: 'neutral' }
}

export function matchesEventFilter(event, registrations, filters) {
  const searchTarget = [event.title, event.location, event.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  const query = filters.query.trim().toLowerCase()

  if (query && !searchTarget.includes(query)) {
    return false
  }

  if (filters.date && toDateInputValue(event.date) !== filters.date) {
    return false
  }

  if (filters.status === 'all') {
    return true
  }

  const statusLabel = getEventStatus(event, registrations).label.toLowerCase()
  return statusLabel === filters.status
}
