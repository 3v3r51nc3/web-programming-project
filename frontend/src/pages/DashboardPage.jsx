// Frontend developer: Mehdi AGHAEI
import EmptyStateCard from '../components/cards/EmptyStateCard'
import StatusBadge from '../components/common/StatusBadge'
import { buttonClassNames, surfaceClassNames } from '../styles'
import { formatDateTime } from '../utils/dateUtils'
import { getConfirmedRegistrationsCount, getEventStatus } from '../utils/eventUtils'

export default function DashboardPage({
  canEdit,
  events,
  onNavigateToEvent,
  onNavigateToEvents,
  onNavigateToParticipants,
  participants,
  registrations,
  user,
}) {
  const accessLabel = user?.role === 'admin' ? 'Admin' : canEdit ? 'Editor' : 'Viewer'

  const sortedEvents = [...events].sort((leftEvent, rightEvent) => {
    return new Date(leftEvent.date).getTime() - new Date(rightEvent.date).getTime()
  })
  const nextEvents = sortedEvents.slice(0, 4)
  const fullEvents = events.filter((event) => getEventStatus(event, registrations).label === 'Full')
  const confirmedRegistrations = events.reduce(
    (total, event) => total + getConfirmedRegistrationsCount(event, registrations),
    0,
  )
  const locationSummary = Object.values(
    events.reduce((locations, event) => {
      const locationKey = event.location?.trim() || 'Unknown location'

      if (!locations[locationKey]) {
        locations[locationKey] = {
          count: 0,
          location: locationKey,
          nextDate: event.date,
        }
      }

      locations[locationKey].count += 1

      if (new Date(event.date).getTime() < new Date(locations[locationKey].nextDate).getTime()) {
        locations[locationKey].nextDate = event.date
      }

      return locations
    }, {}),
  )
    .sort((leftLocation, rightLocation) => {
      if (rightLocation.count !== leftLocation.count) {
        return rightLocation.count - leftLocation.count
      }

      return new Date(leftLocation.nextDate).getTime() - new Date(rightLocation.nextDate).getTime()
    })
    .slice(0, 4)

  return (
    <section className="dashboard-grid dashboard-grid--simple">
      <section className={`${surfaceClassNames.wide} simple-section dashboard-summary`}>
        <div className="section-heading section-heading--wrap">
          <div>
            <p className="panel-label">Welcome</p>
            <h3 className="surface-title">Hello {user?.full_name}</h3>
            <p className="surface-copy">
              EventHub helps people discover events, follow what is coming next, and connect
              participants to the right event without duplicate registrations.
            </p>
          </div>
          <StatusBadge label={accessLabel} tone={canEdit ? 'accent' : 'neutral'} />
        </div>

        <div className="dashboard-stats-strip" aria-label="Summary">
          <div className="dashboard-stat">
            <span className="dashboard-stat__label">Scheduled events</span>
            <strong>{events.length}</strong>
          </div>
          <div className="dashboard-stat">
            <span className="dashboard-stat__label">Participants</span>
            <strong>{participants.length}</strong>
          </div>
          <div className="dashboard-stat">
            <span className="dashboard-stat__label">Confirmed registrations</span>
            <strong>{confirmedRegistrations}</strong>
          </div>
          <div className="dashboard-stat">
            <span className="dashboard-stat__label">Full events</span>
            <strong>{fullEvents.length}</strong>
          </div>
        </div>

        <p className="surface-copy">
          {canEdit
            ? 'Open any event to view its participants, add new registrations, and keep the schedule and capacity up to date.'
            : 'Open any event to check seat availability, review your registration, and sign yourself up when places are available.'}
        </p>
        <ul className="rule-list rule-list--compact">
          <li>One participant can register for multiple events.</li>
          <li>One event can include multiple participants.</li>
          <li>The same participant cannot be registered twice for the same event.</li>
        </ul>
        <div className="button-row">
          <button className={buttonClassNames.primary} onClick={onNavigateToEvents} type="button">
            Open event list
          </button>
          <button className={buttonClassNames.ghost} onClick={onNavigateToParticipants} type="button">
            Open participant list
          </button>
        </div>
      </section>

      <section className={`${surfaceClassNames.card} simple-section`}>
        <div className="section-heading">
          <div>
            <p className="panel-label">Coming up</p>
            <h3 className="surface-title">Upcoming events</h3>
          </div>
        </div>

        {nextEvents.length ? (
          <div className="list-stack">
            {nextEvents.map((event) => {
              const status = getEventStatus(event, registrations)
              return (
                <button
                  className="list-row list-row--interactive"
                  key={event.id}
                  onClick={() => onNavigateToEvent(event.id)}
                  type="button"
                >
                  <div>
                    <p className="list-title">{event.title}</p>
                    <p className="list-meta">
                      {event.location} · {formatDateTime(event.date)}
                    </p>
                  </div>
                  <StatusBadge label={status.label} tone={status.tone} />
                </button>
              )
            })}
          </div>
        ) : (
          <EmptyStateCard
            description="Create your first event from the Events page and it will appear here."
            title="No events yet"
          />
        )}
      </section>

      <section className={`${surfaceClassNames.card} simple-section`}>
        <div className="section-heading">
          <div>
            <p className="panel-label">Places</p>
            <h3 className="surface-title">Where events are happening</h3>
          </div>
        </div>

        {locationSummary.length ? (
          <div className="list-stack">
            {locationSummary.map((location) => (
              <div className="list-row" key={location.location}>
                <div>
                  <p className="list-title">{location.location}</p>
                  <p className="list-meta">Next event: {formatDateTime(location.nextDate)}</p>
                </div>
                <span className="metric-pill">{location.count} events</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="Once events are created, their locations will appear here."
            title="No event locations yet"
          />
        )}
      </section>
    </section>
  )
}
