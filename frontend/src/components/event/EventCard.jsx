// Frontend developer: Mehdi AGHAEI
import { buttonClassNames } from '../../styles'
import { formatDateTime } from '../../utils/dateUtils'
import { getConfirmedRegistrationsCount, getEventStatus } from '../../utils/eventUtils'
import StatusBadge from '../common/StatusBadge'

export default function EventCard({
  canEdit,
  deletingId,
  event,
  onDelete,
  onEdit,
  onOpen,
  registrations,
}) {
  const confirmedCount = getConfirmedRegistrationsCount(event, registrations)
  const status = getEventStatus(event, registrations)

  return (
    <article className="event-card event-card--simple">
      <div className="event-card__body">
        <div className="event-card__summary">
          <h4>{event.title}</h4>
          <div className="event-card__details">
            <p className="card-meta">{formatDateTime(event.date)}</p>
            <p className="card-meta">{event.location}</p>
          </div>
          <p className="card-copy">{event.description || 'No description added yet.'}</p>
        </div>

        <div className="event-card__aside">
          <StatusBadge label={status.label} tone={status.tone} />
          <span className="metric-pill">
            {confirmedCount}/{event.capacity} seats
          </span>
        </div>
      </div>

      <div className="button-row event-card__actions">
        <button className={buttonClassNames.primary} onClick={() => onOpen(event.id)} type="button">
          Open event
        </button>
        {canEdit ? (
          <>
            <button className={buttonClassNames.ghost} onClick={() => onEdit(event)} type="button">
              Edit schedule
            </button>
            <button
              className={buttonClassNames.dangerGhost}
              disabled={deletingId === event.id}
              onClick={() => onDelete(event)}
              type="button"
            >
              {deletingId === event.id ? 'Deleting...' : 'Delete'}
            </button>
          </>
        ) : null}
      </div>
    </article>
  )
}
