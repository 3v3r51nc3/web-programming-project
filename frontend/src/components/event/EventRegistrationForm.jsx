// Frontend developer: Mehdi AGHAEI
import { buttonClassNames } from '../../styles'
import EmptyStateCard from '../cards/EmptyStateCard'
import InlineNotice from '../common/InlineNotice'

export default function EventRegistrationForm({
  availableParticipants,
  canEdit,
  currentParticipant,
  currentRegistration,
  formState,
  formClassName = '',
  isEventFull = false,
  onChange,
  onGoToParticipants,
  onSubmit,
  values,
}) {
  if (!canEdit) {
    if (!currentParticipant) {
      return (
        <EmptyStateCard
          description="Your participant profile is not ready yet. Refresh the workspace or sign in again to finish linking your account."
          title="Profile needed"
        />
      )
    }

    if (currentRegistration) {
      return (
        <EmptyStateCard
          description={`You already have a ${currentRegistration.status} registration for this event.`}
          title="Already registered"
        />
      )
    }

    if (isEventFull) {
      return (
        <EmptyStateCard
          description="This event has reached capacity. If a seat opens later, you can register yourself here."
          title="Event is full"
        />
      )
    }

    return (
      <form className={`form-grid ${formClassName}`.trim()} onSubmit={onSubmit}>
        <p className="micro-copy field--full">
          This viewer account can register only its own participant profile for an event.
        </p>

        <label className="field field--full">
          <span>Participant</span>
          <input
            readOnly
            value={`${currentParticipant.first_name} ${currentParticipant.last_name} · ${currentParticipant.email}`}
          />
        </label>

        {formState.error ? <InlineNotice message={formState.error} tone="error" /> : null}

        <button className={`${buttonClassNames.primaryWide} field--full`} disabled={formState.pending} type="submit">
          {formState.pending ? 'Saving registration...' : 'Register me for this event'}
        </button>
      </form>
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
