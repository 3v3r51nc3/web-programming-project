// Frontend developer: Mehdi AGHAEI
import { buttonClassNames } from '../../styles'
import { formatDateTime } from '../../utils/dateUtils'
import EmptyStateCard from '../cards/EmptyStateCard'
import StatusBadge from '../common/StatusBadge'

export default function EventRegistrationList({
  activeRegistrationId,
  canEdit,
  eventRegistrations,
  onDelete,
  onToggleStatus,
  participants,
}) {
  if (!eventRegistrations.length) {
    return (
      <EmptyStateCard
        description="Registrations will appear here once attendees are added to this event."
        title="No registrations yet"
      />
    )
  }

  return (
    <div className="list-stack">
      {eventRegistrations.map((registration) => {
        const participant = participants.find(
          (currentParticipant) => currentParticipant.id === registration.participant,
        )

        return (
          <article className="list-row list-row--card" key={registration.id}>
            <div>
              <p className="list-title">
                {participant
                  ? `${participant.first_name} ${participant.last_name}`
                  : `Participant #${registration.participant}`}
              </p>
              <p className="list-meta">
                {participant?.email || registration.participant_email} · Registered{' '}
                {formatDateTime(registration.registered_at)}
              </p>
            </div>

            <div className="list-row__actions">
              <StatusBadge
                label={registration.status === 'confirmed' ? 'Confirmed' : 'Cancelled'}
                tone={registration.status === 'confirmed' ? 'success' : 'neutral'}
              />
              {canEdit ? (
                <>
                  <button
                    className={buttonClassNames.ghost}
                    disabled={activeRegistrationId === registration.id}
                    onClick={() => onToggleStatus(registration)}
                    type="button"
                  >
                    {registration.status === 'confirmed' ? 'Mark cancelled' : 'Restore confirmed'}
                  </button>
                  <button
                    className={buttonClassNames.dangerGhost}
                    disabled={activeRegistrationId === registration.id}
                    onClick={() => onDelete(registration)}
                    type="button"
                  >
                    {activeRegistrationId === registration.id ? 'Updating...' : 'Delete'}
                  </button>
                </>
              ) : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}
