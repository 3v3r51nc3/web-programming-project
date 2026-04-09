// Frontend developer: Mehdi AGHAEI
import { useEffect, useState } from 'react'
import EmptyStateCard from '../components/cards/EmptyStateCard'
import EventCrudForm from '../components/event/EventCrudForm'
import EventRegistrationForm from '../components/event/EventRegistrationForm'
import EventRegistrationList from '../components/event/EventRegistrationList'
import StatusBadge from '../components/common/StatusBadge'
import { buttonClassNames, surfaceClassNames } from '../styles'
import { formatDateTime } from '../utils/dateUtils'
import { eventToForm } from '../utils/formUtils'
import {
  getConfirmedRegistrationsCount,
  getEventRegistrations,
  getEventStatus,
} from '../utils/eventUtils'

export default function EventDetailsPage({
  canEdit,
  event,
  onBack,
  onCreateRegistration,
  onDeleteRegistration,
  onGoToParticipants,
  onSaveEvent,
  onUpdateRegistrationStatus,
  participants,
  registrations,
}) {
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
          onAction={onBack}
          title="Unknown event"
        />
      </section>
    )
  }

  const isViewerMode = !canEdit
  const eventRegistrations = getEventRegistrations(registrations, event.id)
  const registeredParticipantIds = new Set(eventRegistrations.map((registration) => registration.participant))
  const availableParticipants = participants.filter(
    (participant) => !registeredParticipantIds.has(participant.id),
  )
  const confirmedCount = getConfirmedRegistrationsCount(event, registrations)
  const status = getEventStatus(event, registrations)
  const viewerParticipant = isViewerMode ? participants[0] || null : null
  const viewerRegistration = viewerParticipant
    ? eventRegistrations.find((registration) => registration.participant === viewerParticipant.id) || null
    : null

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
      const participantId = canEdit
        ? registrationForm.participantId
        : availableParticipants[0]?.id || viewerParticipant?.id || ''

      await onCreateRegistration({
        eventId: event.id,
        participantId,
        status: canEdit ? registrationForm.status : 'confirmed',
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
          <button className={buttonClassNames.ghost} onClick={onBack} type="button">
            Back to events
          </button>
          <StatusBadge label={status.label} tone={status.tone} />
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
            <h3 className="surface-title">Add people to this event</h3>
          </div>
        </div>
        <p className="surface-copy">
          Use this section to connect participants to the event. Each participant can join
          multiple events, but only once per event.
        </p>
        <ul className="rule-list">
          <li>One participant can register for many events.</li>
          <li>One event can include many participants.</li>
          <li>Duplicate registrations for the same participant and event are not allowed.</li>
        </ul>

        <EventRegistrationForm
          availableParticipants={availableParticipants}
          canEdit={canEdit}
          currentParticipant={viewerParticipant}
          currentRegistration={viewerRegistration}
          formState={formState}
          formClassName="event-details-form-grid"
          isEventFull={status.label === 'Full'}
          onChange={updateField}
          onGoToParticipants={onGoToParticipants}
          onSubmit={handleSubmit}
          values={registrationForm}
        />
      </section>

      <section className={`${surfaceClassNames.card} simple-section`}>
        <EventCrudForm
          canEdit={canEdit}
          editingEventId={event.id}
          formState={eventFormState}
          formValues={eventFormValues || eventToForm(event)}
          formClassName="event-details-form-grid"
          helperText={
            canEdit
              ? 'Update the event title, time, location, description, or capacity from here.'
              : ''
          }
          onChange={updateEventField}
          onReset={resetEventForm}
          onSubmit={handleEventSave}
          panelLabel={canEdit ? 'Schedule' : 'View only'}
          readOnlyDescription="Only admins can update the event title, time, location, description, or capacity."
          readOnlyTitle="Schedule editing"
          titleOverride="Edit schedule"
        />
      </section>

      <section className={`${surfaceClassNames.wide} simple-section`}>
        <div className="section-heading">
          <div>
            <p className="panel-label">{isViewerMode ? 'Your registration' : 'Current list'}</p>
            <h3 className="surface-title">
              {isViewerMode ? 'Your registration for this event' : 'People registered for this event'}
            </h3>
          </div>
        </div>

        <EventRegistrationList
          activeRegistrationId={activeRegistrationId}
          canEdit={canEdit}
          eventRegistrations={eventRegistrations}
          onDelete={removeRegistration}
          onToggleStatus={toggleStatus}
          participants={participants}
        />
      </section>
    </section>
  )
}
