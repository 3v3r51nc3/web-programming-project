// Frontend developer: Mehdi AGHAEI
import { buttonClassNames } from '../../styles'
import { formatDateTime } from '../../utils/dateUtils'
import { getRegistrationStatusMeta } from '../../utils/eventUtils'
import EmptyStateCard from '../cards/EmptyStateCard'
import StatusBadge from '../common/StatusBadge'

export default function EventRegistrationList({
  activeRegistrationId,
  canDeleteOwnRegistration,
  canManageEvent,
  emptyDescription,
  emptyTitle,
  eventRegistrations,
  onDelete,
  onToggleStatus,
  participants,
}) {
  if (!eventRegistrations.length) {
    return (
      <EmptyStateCard
        description={emptyDescription || 'Registrations will appear here once an admin adds attendees to this event.'}
        title={emptyTitle || 'No registrations yet'}
      />
    )
  }

  return (
    <div className="list-stack">
      {eventRegistrations.map((registration) => {
        const participant = participants.find(
          (currentParticipant) => currentParticipant.id === registration.participant,
        )
        const statusMeta = getRegistrationStatusMeta(registration)

        return (
          <article className="list-row list-row--card" key={registration.id}>
            <div>
              <p className="list-title">
                {participant
                  ? `${participant.first_name} ${participant.last_name}`
                  : registration.participant_name || `Participant #${registration.participant}`}
              </p>
              <p className="list-meta">
                {participant?.email || registration.participant_email} · Registered{' '}
                {formatDateTime(registration.registered_at)}
              </p>
            </div>

            <div className="list-row__actions">
              <StatusBadge label={statusMeta.label} tone={statusMeta.tone} />
              {canManageEvent ? (
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
              ) : canDeleteOwnRegistration ? (
                <button
                  className={buttonClassNames.dangerGhost}
                  disabled={activeRegistrationId === registration.id}
                  onClick={() => onDelete(registration)}
                  type="button"
                >
                  {activeRegistrationId === registration.id ? 'Removing...' : 'Remove registration'}
                </button>
              ) : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}
