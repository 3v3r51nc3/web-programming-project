// Frontend developer: Mehdi AGHAEI
import { useDeferredValue, useState } from 'react'
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
  const [formValues, setFormValues] = useState(() => createEmptyParticipantForm())
  const [editingParticipantId, setEditingParticipantId] = useState(null)
  const [formState, setFormState] = useState({
    pending: false,
    error: '',
  })
  const [deletingId, setDeletingId] = useState(null)
  const deferredQuery = useDeferredValue(query)

  const visibleParticipants = [...participants]
    .filter((participant) => {
      const searchTarget = `${participant.first_name} ${participant.last_name} ${participant.email}`.toLowerCase()
      return searchTarget.includes(deferredQuery.trim().toLowerCase())
    })
    .sort((leftParticipant, rightParticipant) => {
      return leftParticipant.last_name.localeCompare(rightParticipant.last_name)
    })

  function updateForm(event) {
    const { name, value } = event.target
    setFormValues((currentFormValues) => ({
      ...currentFormValues,
      [name]: value,
    }))
  }

  function resetForm() {
    setEditingParticipantId(null)
    setFormValues(createEmptyParticipantForm())
    setFormState({
      pending: false,
      error: '',
    })
  }

  function startEditing(participant) {
    setEditingParticipantId(participant.id)
    setFormValues(participantToForm(participant))
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
      await onSaveParticipant(formValues, editingParticipantId)
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
        resetForm()
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="content-grid content-grid--participants">
      <section className={surfaceClassNames.card}>
        <div className="section-heading section-heading--wrap">
          <div>
            <p className="panel-label">Directory</p>
            <h3 className="surface-title">Participants</h3>
          </div>

          <label className="field field--compact field--wide">
            <span>Search</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or email"
              type="search"
              value={query}
            />
          </label>
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
                    {getParticipantRegistrations(registrations, participant.id).length} reg.
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

      <section className={surfaceClassNames.card}>
        <div className="section-heading">
          <div>
            <p className="panel-label">{canEdit ? 'CRUD form' : 'Read-only mode'}</p>
            <h3 className="surface-title">{editingParticipantId ? 'Edit participant' : 'Create participant'}</h3>
          </div>
          {canEdit ? (
            <button className={buttonClassNames.ghost} onClick={resetForm} type="button">
              Reset
            </button>
          ) : null}
        </div>

        {canEdit ? (
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>First name</span>
              <input name="first_name" onChange={updateForm} placeholder="Leila" value={formValues.first_name} />
            </label>

            <label className="field">
              <span>Last name</span>
              <input name="last_name" onChange={updateForm} placeholder="Rahmani" value={formValues.last_name} />
            </label>

            <label className="field field--full">
              <span>Email</span>
              <input
                name="email"
                onChange={updateForm}
                placeholder="leila.rahmani@example.com"
                type="email"
                value={formValues.email}
              />
            </label>

            {formState.error ? <InlineNotice message={formState.error} tone="error" /> : null}

            <button className={buttonClassNames.primaryWide} disabled={formState.pending} type="submit">
              {formState.pending
                ? editingParticipantId
                  ? 'Saving participant...'
                  : 'Creating participant...'
                : editingParticipantId
                  ? 'Save participant'
                  : 'Create participant'}
            </button>
          </form>
        ) : (
          <EmptyStateCard
            description="This account can inspect participant data but cannot modify profiles."
            title="Viewer account"
          />
        )}
      </section>
    </section>
  )
}
