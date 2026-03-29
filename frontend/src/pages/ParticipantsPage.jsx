// Frontend developer: Mehdi AGHAEI
import { useDeferredValue, useEffect, useEffectEvent, useState } from 'react'
import EmptyStateCard from '../components/cards/EmptyStateCard'
import InlineNotice from '../components/common/InlineNotice'
import { buttonClassNames, surfaceClassNames } from '../styles'
import { getParticipantRegistrations } from '../utils/eventUtils'
import { createEmptyParticipantForm, participantToForm } from '../utils/formUtils'

export default function ParticipantsPage({
  canEdit,
  onDeleteParticipant,
  onSaveParticipant,
  participants,
  registrations,
}) {
  const [query, setQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createFormValues, setCreateFormValues] = useState(() => createEmptyParticipantForm())
  const [editingParticipantId, setEditingParticipantId] = useState(null)
  const [editFormValues, setEditFormValues] = useState(() => createEmptyParticipantForm())
  const [createFormState, setCreateFormState] = useState({
    pending: false,
    error: '',
  })
  const [editFormState, setEditFormState] = useState({
    pending: false,
    error: '',
  })
  const [deletingId, setDeletingId] = useState(null)
  const deferredQuery = useDeferredValue(query)
  const activeEditingParticipant =
    editingParticipantId === null
      ? null
      : participants.find((participant) => participant.id === editingParticipantId) || null

  const handleEscapeKey = useEffectEvent(() => {
    if (editingParticipantId !== null) {
      closeEditModal()
      return
    }

    if (isCreateModalOpen) {
      closeCreateModal()
    }
  })

  const visibleParticipants = [...participants]
    .filter((participant) => {
      const searchTarget = `${participant.first_name} ${participant.last_name} ${participant.email}`.toLowerCase()
      return searchTarget.includes(deferredQuery.trim().toLowerCase())
    })
    .sort((leftParticipant, rightParticipant) => {
      return leftParticipant.last_name.localeCompare(rightParticipant.last_name)
    })

  useEffect(() => {
    if (!isCreateModalOpen && editingParticipantId === null) {
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
  }, [editingParticipantId, isCreateModalOpen])

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

  function resetCreateForm() {
    setCreateFormValues(createEmptyParticipantForm())
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

  function startEditing(participant) {
    setEditingParticipantId(participant.id)
    setEditFormValues(participantToForm(participant))
    setEditFormState({
      pending: false,
      error: '',
    })
  }

  function closeEditModal() {
    if (editFormState.pending) {
      return
    }

    setEditingParticipantId(null)
    setEditFormValues(createEmptyParticipantForm())
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
      await onSaveParticipant(createFormValues, null)
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
      await onSaveParticipant(editFormValues, editingParticipantId)
      closeEditModal()
    } catch (error) {
      setEditFormState({
        pending: false,
        error: error.message,
      })
    }
  }

  async function removeParticipant(participant) {
    if (
      !window.confirm(
        `Delete ${participant.first_name} ${participant.last_name}? This also removes linked registrations.`,
      )
    ) {
      return
    }

    setDeletingId(participant.id)

    try {
      await onDeleteParticipant(participant)
      if (editingParticipantId === participant.id) {
        closeEditModal()
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="content-grid content-grid--participants">
      <section className={`${surfaceClassNames.wide} simple-section`}>
        <div className="section-heading section-heading--wrap">
          <div>
            <p className="panel-label">Directory</p>
            <h3 className="surface-title">Participants</h3>
          </div>

          <div className="section-heading__actions">
            <label className="field field--compact field--wide">
              <span>Search</span>
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or email"
                type="search"
                value={query}
              />
            </label>
            {canEdit ? (
              <button
                aria-label="Create participant"
                className={`${buttonClassNames.ghost} section-add-button`}
                onClick={openCreateModal}
                title="Create participant"
                type="button"
              >
                +
              </button>
            ) : null}
          </div>
        </div>

        {visibleParticipants.length ? (
          <div className="list-stack">
            {visibleParticipants.map((participant) => (
              <article className="list-row list-row--card" key={participant.id}>
                <div>
                  <p className="list-title">
                    {participant.first_name} {participant.last_name}
                  </p>
                  <p className="list-meta">{participant.email}</p>
                </div>

                <div className="list-row__actions">
                  <span className="metric-pill">
                    {getParticipantRegistrations(registrations, participant.id).length}{' '}
                    {getParticipantRegistrations(registrations, participant.id).length === 1
                      ? 'registration'
                      : 'registrations'}
                  </span>
                  {canEdit ? (
                    <>
                      <button className={buttonClassNames.ghost} onClick={() => startEditing(participant)} type="button">
                        Edit
                      </button>
                      <button
                        className={buttonClassNames.dangerGhost}
                        disabled={deletingId === participant.id}
                        onClick={() => removeParticipant(participant)}
                        type="button"
                      >
                        {deletingId === participant.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyStateCard
            description="Add a new profile or change the search term to reveal more attendees."
            title="No matching participants"
          />
        )}
      </section>

      {canEdit && isCreateModalOpen ? (
        <div className="participant-edit-modal" role="dialog" aria-modal="true" aria-labelledby="participant-create-title">
          <div className="participant-edit-modal__backdrop" onClick={closeCreateModal} />

          <section className="participant-edit-modal__panel">
            <div className="participant-edit-modal__window-bar">
              <div className="participant-edit-modal__window-title">
                <span className="participant-edit-modal__window-dot" aria-hidden="true" />
                <span>Create participant</span>
              </div>

              <button
                aria-label="Close participant creator"
                className="participant-edit-modal__window-button"
                disabled={createFormState.pending}
                onClick={closeCreateModal}
                type="button"
              >
                X
              </button>
            </div>

            <div className="participant-edit-modal__body">
              <div className="section-heading">
                <div>
                  <p className="panel-label">New profile</p>
                  <h3 className="surface-title" id="participant-create-title">
                    Create participant
                  </h3>
                </div>
              </div>

              <form className="form-grid" onSubmit={handleCreateSubmit}>
                <label className="field">
                  <span>First name</span>
                  <input
                    name="first_name"
                    onChange={updateCreateForm}
                    placeholder="Soroosh"
                    value={createFormValues.first_name}
                  />
                </label>

                <label className="field">
                  <span>Last name</span>
                  <input
                    name="last_name"
                    onChange={updateCreateForm}
                    placeholder="Aghaei"
                    value={createFormValues.last_name}
                  />
                </label>

                <label className="field field--full">
                  <span>Email</span>
                  <input
                    name="email"
                    onChange={updateCreateForm}
                    placeholder="soroosh@example.com"
                    type="email"
                    value={createFormValues.email}
                  />
                </label>

                {createFormState.error ? <InlineNotice message={createFormState.error} tone="error" /> : null}

                <div className="button-row participant-edit-modal__actions">
                  <button
                    className={buttonClassNames.ghost}
                    disabled={createFormState.pending}
                    onClick={closeCreateModal}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button className={buttonClassNames.primary} disabled={createFormState.pending} type="submit">
                    {createFormState.pending ? 'Creating...' : 'Create participant'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      ) : null}

      {canEdit && activeEditingParticipant ? (
        <div className="participant-edit-modal" role="dialog" aria-modal="true" aria-labelledby="participant-edit-title">
          <div className="participant-edit-modal__backdrop" onClick={closeEditModal} />

          <section className="participant-edit-modal__panel">
            <div className="participant-edit-modal__window-bar">
              <div className="participant-edit-modal__window-title">
                <span className="participant-edit-modal__window-dot" aria-hidden="true" />
                <span>Edit participant</span>
              </div>

              <button
                aria-label="Close participant editor"
                className="participant-edit-modal__window-button"
                disabled={editFormState.pending}
                onClick={closeEditModal}
                type="button"
              >
                X
              </button>
            </div>

            <div className="participant-edit-modal__body">
              <div className="section-heading">
                <div>
                  <p className="panel-label">Editing profile</p>
                  <h3 className="surface-title" id="participant-edit-title">
                    {activeEditingParticipant.first_name} {activeEditingParticipant.last_name}
                  </h3>
                </div>
              </div>

              <form className="form-grid" onSubmit={handleEditSubmit}>
                <label className="field">
                  <span>First name</span>
                  <input
                    name="first_name"
                    onChange={updateEditForm}
                    placeholder="Soroosh"
                    value={editFormValues.first_name}
                  />
                </label>

                <label className="field">
                  <span>Last name</span>
                  <input
                    name="last_name"
                    onChange={updateEditForm}
                    placeholder="Aghaei"
                    value={editFormValues.last_name}
                  />
                </label>

                <label className="field field--full">
                  <span>Email</span>
                  <input
                    name="email"
                    onChange={updateEditForm}
                    placeholder="soroosh@example.com"
                    type="email"
                    value={editFormValues.email}
                  />
                </label>

                {editFormState.error ? <InlineNotice message={editFormState.error} tone="error" /> : null}

                <div className="button-row participant-edit-modal__actions">
                  <button className={buttonClassNames.ghost} disabled={editFormState.pending} onClick={closeEditModal} type="button">
                    Cancel
                  </button>
                  <button className={buttonClassNames.primary} disabled={editFormState.pending} type="submit">
                    {editFormState.pending ? 'Saving...' : 'Save participant'}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}
