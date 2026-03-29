// Frontend developer: Mehdi AGHAEI
export function getPageMeta(route, events) {
  if (route.name === 'events') {
    return {
      title: 'Events workspace',
      subtitle: 'Create, edit, filter, and review the calendar of EventHub activities.',
    }
  }

  if (route.name === 'participants') {
    return {
      title: 'Participants workspace',
      subtitle: 'Maintain attendee profiles and track how many registrations each person owns.',
    }
  }

  if (route.name === 'event-details') {
    const matchingEvent = events.find((event) => event.id === route.eventId)
    return {
      title: matchingEvent ? matchingEvent.title : 'Event details',
      subtitle: 'Review one event, inspect participants, and manage registrations.',
    }
  }

  return {
    title: 'Dashboard',
    subtitle: 'Watch the whole platform at a glance before jumping into the operational pages.',
  }
}
