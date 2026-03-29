// Frontend developer: Mehdi AGHAEI
import { useDeferredValue, useState } from 'react'
import EmptyStateCard from '../components/cards/EmptyStateCard'
import EventCard from '../components/event/EventCard'
import EventCrudForm from '../components/event/EventCrudForm'
import EventFilters from '../components/event/EventFilters'
import { surfaceClassNames } from '../styles'
import { matchesEventFilter } from '../utils/eventUtils'
import { createEmptyEventForm, eventToForm } from '../utils/formUtils'

export default function EventsPage({
  canEdit,
  events,
  onDeleteEvent,
  onOpenEvent,
  onSaveEvent,
  registrations,
}) {
  const [filters, setFilters] = useState({
    query: '',
    status: 'all',
    date: '',
  })
  const [formValues, setFormValues] = useState(() => createEmptyEventForm())
  const [editingEventId, setEditingEventId] = useState(null)
  const [formState, setFormState] = useState({
    pending: false,
    error: '',
  })
  const [deletingId, setDeletingId] = useState(null)
  const deferredQuery = useDeferredValue(filters.query)

  const visibleEvents = [...events]
    .filter((event) =>
      matchesEventFilter(event, registrations, {
        ...filters,
        query: deferredQuery,
      }),
    )
    .sort(
      (leftEvent, rightEvent) =>
        new Date(leftEvent.date).getTime() - new Date(rightEvent.date).getTime(),
    )

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  function updateForm(event) {
    const { name, value } = event.target
    setFormValues((currentFormValues) => ({
      ...currentFormValues,
      [name]: value,
    }))
  }

  function startEditing(eventData) {
    setEditingEventId(eventData.id)
    setFormValues(eventToForm(eventData))
    setFormState({
      pending: false,
      error: '',
    })
  }

  function resetForm() {
    setEditingEventId(null)
    setFormValues(createEmptyEventForm())
    setFormState({
      pending: false,
      error: '',
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormState({
      pending: true,
      error: '',
    })

    try {
      await onSaveEvent(formValues, editingEventId)
      resetForm()
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

  async function removeEvent(eventData) {
    if (!window.confirm(`Delete "${eventData.title}"? This also removes its registrations.`)) {
      return
    }

    setDeletingId(eventData.id)

    try {
      await onDeleteEvent(eventData)
      if (editingEventId === eventData.id) {
        resetForm()
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="content-grid content-grid--events">
      <section className={surfaceClassNames.card}>
        <div className="section-heading section-heading--wrap">
          <div>
            <p className="panel-label">Browse</p>
            <h3 className="surface-title">Event list</h3>
          </div>
          <EventFilters filters={filters} onChange={updateFilter} />
        </div>

        {visibleEvents.length ? (
          <div className="event-grid">
            {visibleEvents.map((event) => (
              <EventCard
                canEdit={canEdit}
                deletingId={deletingId}
                event={event}
                key={event.id}
                onDelete={removeEvent}
                onEdit={startEditing}
                onOpen={onOpenEvent}
                registrations={registrations}
              />
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="Try a different date, clear the search box, or create a new event."
            title="No events match the current filters"
          />
        )}
      </section>

      <section className={surfaceClassNames.card}>
        <EventCrudForm
          canEdit={canEdit}
          editingEventId={editingEventId}
          formState={formState}
          formValues={formValues}
          onChange={updateForm}
          onReset={resetForm}
          onSubmit={handleSubmit}
        />
      </section>
    </section>
  )
}
