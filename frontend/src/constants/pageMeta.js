// Frontend developer: Mehdi AGHAEI
export function getPageMeta(route, events) {
  if (route.name === 'events') {
    return {
      title: 'Events',
      subtitle: 'Browse events, open their details, and update schedules when needed.',
    }
  }

  if (route.name === 'participants') {
    return {
      title: 'Participants',
      subtitle: 'Search participant records and see how many registrations each person has.',
    }
  }

  if (route.name === 'event-details') {
    const matchingEvent = events.find((event) => event.id === route.eventId)
    return {
      title: matchingEvent ? matchingEvent.title : 'Event details',
      subtitle: 'See the event details, connect participants, and update the schedule.',
    }
  }

  return {
    title: 'Dashboard',
    subtitle: 'Discover events, understand registrations, and jump into the right page quickly.',
  }
}
