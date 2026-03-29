// Frontend developer: Mehdi AGHAEI
import { buttonClassNames } from '../../styles'
import EmptyStateCard from '../cards/EmptyStateCard'
import InlineNotice from '../common/InlineNotice'

export default function EventRegistrationForm({
  availableParticipants,
  canEdit,
  formState,
  onChange,
  onGoToParticipants,
  onSubmit,
  values,
}) {
  if (!canEdit) {
    return (
      <EmptyStateCard
        description="Registration creation is disabled for read-only users."
        title="Viewer account"
      />
    )
  }

  if (!availableParticipants.length) {
    return (
      <EmptyStateCard
        actionLabel="Go to participants"
        description="Every participant is already linked to this event, or no participant profiles exist yet."
        onAction={onGoToParticipants}
        title="No available participants"
      />
    )
  }

  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <label className="field field--full">
        <span>Participant</span>
        <select name="participantId" onChange={onChange} value={values.participantId}>
          <option value="">Select a participant</option>
          {availableParticipants.map((participant) => (
            <option key={participant.id} value={participant.id}>
              {participant.first_name} {participant.last_name} · {participant.email}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Status</span>
        <select name="status" onChange={onChange} value={values.status}>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>

      {formState.error ? <InlineNotice message={formState.error} tone="error" /> : null}

      <button className={buttonClassNames.primaryWide} disabled={formState.pending} type="submit">
        {formState.pending ? 'Saving registration...' : 'Register participant'}
      </button>
    </form>
  )
}
