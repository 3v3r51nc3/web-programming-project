// Frontend developer: Mehdi AGHAEI
import { useEffect, useState } from 'react'
import EmptyStateCard from '../components/cards/EmptyStateCard'
import EventCrudForm from '../components/event/EventCrudForm'
import EventRegistrationForm from '../components/event/EventRegistrationForm'
import EventRegistrationList from '../components/event/EventRegistrationList'
import StatusBadge from '../components/common/StatusBadge'
import { useWorkspace } from '../context/WorkspaceContext'
import { buttonClassNames, surfaceClassNames } from '../styles'
import { formatDateTime } from '../utils/dateUtils'
import { eventToForm } from '../utils/formUtils'
import {
  getConfirmedRegistrationsCount,
  getEventRegistrations,
  getEventStatus,
} from '../utils/eventUtils'

export default function EventDetailsPage({
  event,
  onCreateRegistration,
  onDeleteRegistration,
  onSaveEvent,
  onUpdateRegistrationStatus,
}) {
  const { canEdit, openEvents, openParticipants, participants, registrations } = useWorkspace()
  const [eventFormValues, setEventFormValues] = useState(() => (event ? eventToForm(event) : null))
  const [eventFormState, setEventFormState] = useState({
    pending: false,
    error: '',
  })
  const [registrationForm, setRegistrationForm] = useState({
    participantId: '',
    status: 'confirmed',
  })
  const [formState, setFormState] = useState({
    pending: false,
    error: '',
  })
  const [activeRegistrationId, setActiveRegistrationId] = useState(null)

  useEffect(() => {
    setEventFormValues(event ? eventToForm(event) : null)
    setEventFormState({
      pending: false,
      error: '',
    })
    setRegistrationForm({
      participantId: '',
      status: 'confirmed',
    })
    setFormState({
      pending: false,
      error: '',
    })
    setActiveRegistrationId(null)
  }, [event])

  if (!event) {
    return (
      <section className={`${surfaceClassNames.card} simple-section`}>
        <EmptyStateCard
          actionLabel="Back to events"
          description="The selected event could not be found in the loaded dataset."
          onAction={openEvents}
          title="Unknown event"
        />
      </section>
    )
  }

  const canManageCurrentEvent = canEdit
  const eventRegistrations = getEventRegistrations(registrations, event.id)
  const registeredParticipantIds = new Set(eventRegistrations.map((registration) => registration.participant))
  const availableParticipants = participants.filter(
    (participant) => !registeredParticipantIds.has(participant.id),
  )
  const confirmedCount = getConfirmedRegistrationsCount(event, registrations)
  const status = getEventStatus(event, registrations)

  function updateField(eventData) {
    const { name, value } = eventData.target
    setRegistrationForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  function updateEventField(eventData) {
    const { name, value } = eventData.target
    setEventFormValues((currentFormValues) => ({
      ...currentFormValues,
      [name]: value,
    }))
  }

  function resetEventForm() {
    setEventFormValues(eventToForm(event))
    setEventFormState({
      pending: false,
      error: '',
    })
  }

  async function handleEventSave(submitEvent) {
    submitEvent.preventDefault()
    setEventFormState({
      pending: true,
      error: '',
    })

    try {
      await onSaveEvent(eventFormValues, event.id)
    } catch (error) {
      setEventFormState({
        pending: false,
        error: error.message,
      })
      return
    }

    setEventFormState({
      pending: false,
      error: '',
    })
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault()
    setFormState({
      pending: true,
      error: '',
    })

    try {
      await onCreateRegistration({
        eventId: event.id,
        participantId: registrationForm.participantId,
        status: registrationForm.status,
      })
      setRegistrationForm({
        participantId: '',
        status: 'confirmed',
      })
    } catch (error) {
      setFormState({
        pending: false,
        error: error.message,
      })
      return
    }

    setFormState({
      pending: false,
      error: '',
    })
  }

  async function toggleStatus(registration) {
    setActiveRegistrationId(registration.id)

    try {
      await onUpdateRegistrationStatus(
        registration,
        registration.status === 'confirmed' ? 'cancelled' : 'confirmed',
      )
    } finally {
      setActiveRegistrationId(null)
    }
  }

  async function removeRegistration(registration) {
    if (!window.confirm('Delete this registration entry?')) {
      return
    }

    setActiveRegistrationId(registration.id)

    try {
      await onDeleteRegistration(registration)
    } finally {
      setActiveRegistrationId(null)
    }
  }

  return (
    <section className="details-grid">
      <section className={`${surfaceClassNames.hero} surface-card--wide simple-section`}>
        <div className="section-heading section-heading--wrap">
          <button className={buttonClassNames.ghost} onClick={openEvents} type="button">
            Back to events
          </button>
          <div className="button-row">
            <StatusBadge label={status.label} tone={status.tone} />
          </div>
        </div>

        <h3 className="surface-title surface-title--large">{event.title}</h3>
        <p className="surface-copy">{event.description || 'No event description was provided.'}</p>

        <div className="detail-chip-row">
          <span className="detail-chip">{formatDateTime(event.date)}</span>
          <span className="detail-chip">{event.location}</span>
          <span className="detail-chip">
            {confirmedCount}/{event.capacity} confirmed seats
          </span>
        </div>
      </section>

      <section className={`${surfaceClassNames.card} simple-section`}>
        <div className="section-heading">
          <div>
            <p className="panel-label">Participants</p>
            <h3 className="surface-title">
              {canManageCurrentEvent ? 'Manage registrations for this event' : 'Registration access'}
            </h3>
          </div>
        </div>
        <p className="surface-copy">
          {canManageCurrentEvent
            ? 'Use this section to manage participants and keep registration statuses up to date.'
            : 'Viewer accounts can browse this event in read-only mode. Registration changes are reserved for admins.'}
        </p>
        <ul className="rule-list">
          <li>One participant can register for many events.</li>
          <li>One event can include many participants.</li>
          <li>Duplicate registrations for the same participant and event are not allowed.</li>
        </ul>

        <EventRegistrationForm
          availableParticipants={availableParticipants}
          canManageEvent={canManageCurrentEvent}
          formState={formState}
          formClassName="event-details-form-grid"
          onChange={updateField}
          onGoToParticipants={openParticipants}
          onSubmit={handleSubmit}
          values={registrationForm}
        />
      </section>

      <section className={`${surfaceClassNames.card} simple-section`}>
        <EventCrudForm
          canEdit={canManageCurrentEvent}
          editingEventId={event.id}
          formState={eventFormState}
          formValues={eventFormValues || eventToForm(event)}
          formClassName="event-details-form-grid"
          helperText={
            canManageCurrentEvent
              ? 'Update the event title, time, location, description, or capacity from here.'
              : ''
          }
          onChange={updateEventField}
          onReset={resetEventForm}
          onSubmit={handleEventSave}
          panelLabel={canManageCurrentEvent ? 'Schedule' : 'View only'}
          readOnlyDescription="Only admins can update the event title, time, location, description, or capacity."
          readOnlyTitle="Schedule editing"
          titleOverride="Edit schedule"
        />
      </section>

      <section className={`${surfaceClassNames.wide} simple-section`}>
        <div className="section-heading">
          <div>
            <p className="panel-label">{canManageCurrentEvent ? 'Current list' : 'Privacy protected'}</p>
            <h3 className="surface-title">
              {canManageCurrentEvent ? 'People registered for this event' : 'Registration visibility'}
            </h3>
          </div>
        </div>
        {!canManageCurrentEvent ? (
          <p className="surface-copy">
            To protect participant privacy, viewers cannot browse the attendee list for an event.
            If an admin registered you for this event, your own record appears below.
          </p>
        ) : null}

        <EventRegistrationList
          activeRegistrationId={activeRegistrationId}
          canDeleteOwnRegistration={false}
          canManageEvent={canManageCurrentEvent}
          emptyDescription={
            canManageCurrentEvent
              ? 'Registrations will appear here once an admin adds attendees to this event.'
              : 'No registration linked to your account was found for this event.'
          }
          emptyTitle={canManageCurrentEvent ? 'No registrations yet' : 'No personal registration'}
          eventRegistrations={eventRegistrations}
          onDelete={removeRegistration}
          onToggleStatus={toggleStatus}
          participants={participants}
        />
      </section>
    </section>
  )
}
