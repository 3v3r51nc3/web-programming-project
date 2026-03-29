// Frontend developer: Mehdi AGHAEI
import { buttonClassNames } from '../../styles'
import EmptyStateCard from '../cards/EmptyStateCard'
import InlineNotice from '../common/InlineNotice'

export default function EventRegistrationForm({
  availableParticipants,
  canEdit,
  formState,
  formClassName = '',
  onChange,
  onGoToParticipants,
  onSubmit,
  values,
}) {
  if (!canEdit) {
    return (
      <EmptyStateCard
        description="This account can view the participant list, but only admins can add or update registrations."
        title="View only"
      />
    )
  }

  if (!availableParticipants.length) {
    return (
      <EmptyStateCard
        actionLabel="Go to participants"
        description="Every participant is already linked to this event, or no participant profiles exist yet. A participant can only be added once per event."
        onAction={onGoToParticipants}
        title="No available participants"
      />
    )
  }

  return (
    <form className={`form-grid ${formClassName}`.trim()} onSubmit={onSubmit}>
      <p className="micro-copy field--full">
        One participant can join many events, but the same participant cannot be added twice to
        this event.
      </p>

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

      <button className={`${buttonClassNames.primaryWide} field--full`} disabled={formState.pending} type="submit">
        {formState.pending ? 'Saving registration...' : 'Register participant'}
      </button>
    </form>
  )
}
