// Frontend developer: Mehdi AGHAEI
import { useDeferredValue, useEffect, useEffectEvent, useState } from 'react'
import { createPortal } from 'react-dom'
import EmptyStateCard from '../components/cards/EmptyStateCard'
import EventCard from '../components/event/EventCard'
import EventCrudForm from '../components/event/EventCrudForm'
import EventFilters from '../components/event/EventFilters'
import { useWorkspace } from '../context/WorkspaceContext'
import { surfaceClassNames } from '../styles'
import { matchesEventFilter } from '../utils/eventUtils'
import { createEmptyEventForm, eventToForm } from '../utils/formUtils'

export default function EventsPage({ onDeleteEvent, onSaveEvent }) {
  const { canEdit, events, openEvent, registrations } = useWorkspace()
  const [filters, setFilters] = useState({
    query: '',
    status: 'all',
    date: '',
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createFormValues, setCreateFormValues] = useState(() => createEmptyEventForm())
  const [editingEventId, setEditingEventId] = useState(null)
  const [editFormValues, setEditFormValues] = useState(() => createEmptyEventForm())
  const [createFormState, setCreateFormState] = useState({
    pending: false,
    error: '',
  })
  const [editFormState, setEditFormState] = useState({
    pending: false,
    error: '',
  })
  const [deletingId, setDeletingId] = useState(null)
  const deferredQuery = useDeferredValue(filters.query)
  const activeEditingEvent =
    editingEventId === null ? null : events.find((event) => event.id === editingEventId) || null
  const canRenderModalPortal = typeof document !== 'undefined'

  const handleEscapeKey = useEffectEvent(() => {
    if (editingEventId !== null) {
      closeEditModal()
      return
    }

    if (isCreateModalOpen) {
      closeCreateModal()
    }
  })

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

  useEffect(() => {
    if (!isCreateModalOpen && editingEventId === null) {
      return undefined
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        handleEscapeKey()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [editingEventId, isCreateModalOpen])

  function updateCreateForm(event) {
    const { name, value } = event.target
    setCreateFormValues((currentFormValues) => ({
      ...currentFormValues,
      [name]: value,
    }))
  }

  function updateEditForm(event) {
    const { name, value } = event.target
    setEditFormValues((currentFormValues) => ({
      ...currentFormValues,
      [name]: value,
    }))
  }

  function startEditing(eventData) {
    setEditingEventId(eventData.id)
    setEditFormValues(eventToForm(eventData))
    setEditFormState({
      pending: false,
      error: '',
    })
  }

  function resetCreateForm() {
    setCreateFormValues(createEmptyEventForm())
    setCreateFormState({
      pending: false,
      error: '',
    })
  }

  function openCreateModal() {
    resetCreateForm()
    setIsCreateModalOpen(true)
  }

  function dismissCreateModal() {
    setIsCreateModalOpen(false)
    resetCreateForm()
  }

  function closeCreateModal() {
    if (createFormState.pending) {
      return
    }

    dismissCreateModal()
  }

  function closeEditModal() {
    if (editFormState.pending) {
      return
    }

    setEditingEventId(null)
    setEditFormValues(createEmptyEventForm())
    setEditFormState({
      pending: false,
      error: '',
    })
  }

  async function handleCreateSubmit(event) {
    event.preventDefault()
    setCreateFormState({
      pending: true,
      error: '',
    })

    try {
      await onSaveEvent(createFormValues, null)
      dismissCreateModal()
    } catch (error) {
      setCreateFormState({
        pending: false,
        error: error.message,
      })
      return
    }
  }

  async function handleEditSubmit(event) {
    event.preventDefault()
    setEditFormState({
      pending: true,
      error: '',
    })

    try {
      await onSaveEvent(editFormValues, editingEventId)
      closeEditModal()
    } catch (error) {
      setEditFormState({
        pending: false,
        error: error.message,
      })
      return
    }

    setEditFormState({
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
        closeEditModal()
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="content-grid content-grid--events">
      <section className={`${surfaceClassNames.wide} simple-section`}>
        <div className="section-heading section-heading--wrap">
          <div>
            <p className="panel-label">Discover</p>
            <h3 className="surface-title">Events around the community</h3>
            <p className="surface-copy section-note">
              Browse by title, place, or date. Admins can create and manage the schedule, while
              viewers can explore in read-only mode.
            </p>
          </div>
          <div className="section-heading__actions">
            <EventFilters filters={filters} onChange={updateFilter} />
            {canEdit ? (
              <button
                aria-label="Create event"
                className="ghost-button section-add-button"
                onClick={openCreateModal}
                title="Create event"
                type="button"
              >
                +
              </button>
            ) : null}
          </div>
        </div>

        {visibleEvents.length ? (
          <div className="event-grid event-directory">
            {visibleEvents.map((event) => (
              <EventCard
                canManage={canEdit}
                deletingId={deletingId}
                event={event}
                key={event.id}
                onDelete={removeEvent}
                onEdit={startEditing}
                onOpen={openEvent}
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

      {canEdit && isCreateModalOpen && canRenderModalPortal
        ? createPortal(
            <div className="event-edit-modal" role="dialog" aria-modal="true" aria-labelledby="event-create-title">
              <div className="event-edit-modal__backdrop" onClick={closeCreateModal} />

              <section className="event-edit-modal__panel">
                <div className="event-edit-modal__window-bar">
                  <div className="event-edit-modal__window-title">
                    <span className="event-edit-modal__window-dot" aria-hidden="true" />
                    <span id="event-create-title">Create event</span>
                  </div>

                  <button
                    aria-label="Close event creator"
                    className="event-edit-modal__window-button"
                    disabled={createFormState.pending}
                    onClick={closeCreateModal}
                    type="button"
                  >
                    X
                  </button>
                </div>

                <div className="event-edit-modal__body">
                  <EventCrudForm
                    canEdit={canEdit}
                    editingEventId={null}
                    formState={createFormState}
                    formValues={createFormValues}
                    helperText="Set the basics, then open the event to manage participants and registrations."
                    onChange={updateCreateForm}
                    onReset={closeCreateModal}
                    onSubmit={handleCreateSubmit}
                    panelLabel="New schedule"
                    resetLabel="Close"
                    titleOverride="Create an event"
                  />
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}

      {canEdit && activeEditingEvent && canRenderModalPortal
        ? createPortal(
            <div className="event-edit-modal" role="dialog" aria-modal="true" aria-labelledby="event-edit-title">
              <div className="event-edit-modal__backdrop" onClick={closeEditModal} />

              <section className="event-edit-modal__panel">
                <div className="event-edit-modal__window-bar">
                  <div className="event-edit-modal__window-title">
                    <span className="event-edit-modal__window-dot" aria-hidden="true" />
                    <span id="event-edit-title">Edit event</span>
                  </div>

                  <button
                    aria-label="Close event editor"
                    className="event-edit-modal__window-button"
                    disabled={editFormState.pending}
                    onClick={closeEditModal}
                    type="button"
                  >
                    X
                  </button>
                </div>

                <div className="event-edit-modal__body">
                  <EventCrudForm
                    canEdit={canEdit}
                    editingEventId={editingEventId}
                    formState={editFormState}
                    formValues={editFormValues}
                    helperText="Update the schedule details for the selected event."
                    onChange={updateEditForm}
                    onReset={closeEditModal}
                    onSubmit={handleEditSubmit}
                    panelLabel="Editing schedule"
                    resetLabel="Close"
                    titleOverride={activeEditingEvent.title}
                  />
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </section>
  )
}
