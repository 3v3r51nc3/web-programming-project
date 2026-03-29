// Frontend developer: Mehdi AGHAEI
import { createDefaultDateTimeValue, toDateTimeLocalValue } from './dateUtils'

export function createEmptyEventForm() {
  return {
    title: '',
    description: '',
    location: '',
    date: createDefaultDateTimeValue(),
    capacity: '25',
  }
}

export function createEmptyParticipantForm() {
  return {
    first_name: '',
    last_name: '',
    email: '',
  }
}

export function eventToForm(event) {
  return {
    title: event.title || '',
    description: event.description || '',
    location: event.location || '',
    date: toDateTimeLocalValue(event.date),
    capacity: String(event.capacity ?? 25),
  }
}

export function participantToForm(participant) {
  return {
    first_name: participant.first_name || '',
    last_name: participant.last_name || '',
    email: participant.email || '',
  }
}
