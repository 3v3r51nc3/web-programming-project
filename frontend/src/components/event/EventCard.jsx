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
  const confirmedCount = getConfirmedRegistrationsCount(registrations, event.id)
  const status = getEventStatus(event, registrations)

  return (
    <article className="event-card">
      <div className="event-card__header">
        <StatusBadge label={status.label} tone={status.tone} />
        <span className="metric-pill">
          {confirmedCount}/{event.capacity} seats
        </span>
      </div>

      <h4>{event.title}</h4>
      <p className="card-meta">{formatDateTime(event.date)}</p>
      <p className="card-meta">{event.location}</p>
      <p className="card-copy">{event.description || 'No description added yet.'}</p>

      <div className="button-row">
        <button className={buttonClassNames.secondary} onClick={() => onOpen(event.id)} type="button">
          View details
        </button>
        {canEdit ? (
          <>
            <button className={buttonClassNames.ghost} onClick={() => onEdit(event)} type="button">
              Edit
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
