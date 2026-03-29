// Frontend developer: Mehdi AGHAEI
import { useEffect, useState } from 'react'
import EmptyStateCard from '../components/cards/EmptyStateCard'
import EventRegistrationForm from '../components/event/EventRegistrationForm'
import EventRegistrationList from '../components/event/EventRegistrationList'
import StatusBadge from '../components/common/StatusBadge'
import { buttonClassNames, surfaceClassNames } from '../styles'
import { formatDateTime } from '../utils/dateUtils'
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
  onUpdateRegistrationStatus,
  participants,
  registrations,
}) {
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
    setRegistrationForm({
      participantId: '',
      status: 'confirmed',
    })
    setFormState({
      pending: false,
      error: '',
    })
    setActiveRegistrationId(null)
  }, [event?.id])

  if (!event) {
    return (
      <section className={surfaceClassNames.card}>
        <EmptyStateCard
          actionLabel="Back to events"
          description="The selected event could not be found in the loaded dataset."
          onAction={onBack}
          title="Unknown event"
        />
      </section>
    )
  }

  const eventRegistrations = getEventRegistrations(registrations, event.id)
  const registeredParticipantIds = new Set(eventRegistrations.map((registration) => registration.participant))
  const availableParticipants = participants.filter(
    (participant) => !registeredParticipantIds.has(participant.id),
  )
  const confirmedCount = getConfirmedRegistrationsCount(registrations, event.id)
  const status = getEventStatus(event, registrations)

  function updateField(eventData) {
    const { name, value } = eventData.target
    setRegistrationForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
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
      <section className={surfaceClassNames.hero}>
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

      <section className={surfaceClassNames.card}>
        <div className="section-heading">
          <div>
            <p className="panel-label">Registration workflow</p>
            <h3 className="surface-title">Add a participant</h3>
          </div>
        </div>

        <EventRegistrationForm
          availableParticipants={availableParticipants}
          canEdit={canEdit}
          formState={formState}
          onChange={updateField}
          onGoToParticipants={onGoToParticipants}
          onSubmit={handleSubmit}
          values={registrationForm}
        />
      </section>

      <section className={surfaceClassNames.wide}>
        <div className="section-heading">
          <div>
            <p className="panel-label">Current roster</p>
            <h3 className="surface-title">Registered participants</h3>
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
