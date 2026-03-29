// Frontend developer: Mehdi AGHAEI
import EmptyStateCard from '../components/cards/EmptyStateCard'
import StatCard from '../components/cards/StatCard'
import StatusBadge from '../components/common/StatusBadge'
import { buttonClassNames, surfaceClassNames } from '../styles'
import { formatDateTime } from '../utils/dateUtils'
import { getEventStatus, getParticipantRegistrations } from '../utils/eventUtils'

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
  const accessLabel = user?.role === 'admin' ? 'Admin access' : canEdit ? 'Editor access' : 'Viewer access'

  const sortedEvents = [...events].sort((leftEvent, rightEvent) => {
    return new Date(leftEvent.date).getTime() - new Date(rightEvent.date).getTime()
  })
  const nextEvents = sortedEvents.slice(0, 3)
  const recentParticipants = [...participants]
    .sort((leftParticipant, rightParticipant) => {
      return new Date(rightParticipant.created_at).getTime() - new Date(leftParticipant.created_at).getTime()
    })
    .slice(0, 4)
  const fullEvents = events.filter((event) => getEventStatus(event, registrations).label === 'Full')
  const confirmedRegistrations = registrations.filter(
    (registration) => registration.status === 'confirmed',
  ).length

  return (
    <section className="dashboard-grid">
      <div className="stat-grid">
        <StatCard
          description="All event records currently exposed by the API."
          label="Scheduled events"
          value={String(events.length)}
        />
        <StatCard
          description="Profiles available for future or current registrations."
          label="Participants"
          value={String(participants.length)}
        />
        <StatCard
          description="Attendees with an active place on an event."
          label="Confirmed registrations"
          value={String(confirmedRegistrations)}
        />
        <StatCard
          description="Events whose confirmed attendee count reached capacity."
          label="Full events"
          value={String(fullEvents.length)}
        />
      </div>

      <section className={`${surfaceClassNames.card} spotlight-card`}>
        <div className="section-heading">
          <div>
            <p className="panel-label">Welcome</p>
            <h3 className="surface-title">Hello {user?.full_name}</h3>
          </div>
          <StatusBadge label={accessLabel} tone={canEdit ? 'accent' : 'neutral'} />
        </div>
        <p className="surface-copy">
          Use the dashboard as a quick operational summary, then jump to the detailed event or
          participant pages for CRUD work and registration management.
        </p>
        <div className="button-row">
          <button className={buttonClassNames.primary} onClick={onNavigateToEvents} type="button">
            Open events
          </button>
          <button className={buttonClassNames.secondary} onClick={onNavigateToParticipants} type="button">
            Open participants
          </button>
        </div>
      </section>

      <section className={surfaceClassNames.card}>
        <div className="section-heading">
          <div>
            <p className="panel-label">Next on the calendar</p>
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
            description="Create your first event from the Events page to populate the dashboard."
            title="No events yet"
          />
        )}
      </section>

      <section className={surfaceClassNames.card}>
        <div className="section-heading">
          <div>
            <p className="panel-label">Fresh participant profiles</p>
            <h3 className="surface-title">Recent sign-ups</h3>
          </div>
        </div>

        {recentParticipants.length ? (
          <div className="list-stack">
            {recentParticipants.map((participant) => (
              <div className="list-row" key={participant.id}>
                <div>
                  <p className="list-title">
                    {participant.first_name} {participant.last_name}
                  </p>
                  <p className="list-meta">{participant.email}</p>
                </div>
                <span className="metric-pill">
                  {getParticipantRegistrations(registrations, participant.id).length} reg.
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="Once participants are added, the latest profiles will appear here."
            title="No participant profiles yet"
          />
        )}
      </section>
    </section>
  )
}
