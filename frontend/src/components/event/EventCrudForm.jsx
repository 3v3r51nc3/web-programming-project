// Frontend developer: Mehdi AGHAEI
import { buttonClassNames } from '../../styles'
import EmptyStateCard from '../cards/EmptyStateCard'
import InlineNotice from '../common/InlineNotice'

export default function EventCrudForm({
  canEdit,
  editingEventId,
  formState,
  formValues,
  onChange,
  onReset,
  onSubmit,
}) {
  return (
    <>
      <div className="section-heading">
        <div>
          <p className="panel-label">{canEdit ? 'CRUD form' : 'Read-only mode'}</p>
          <h3 className="surface-title">{editingEventId ? 'Edit event' : 'Create event'}</h3>
        </div>
        {canEdit ? (
          <button className={buttonClassNames.ghost} onClick={onReset} type="button">
            Reset
          </button>
        ) : null}
      </div>

      {canEdit ? (
        <form className="form-grid" onSubmit={onSubmit}>
          <label className="field">
            <span>Title</span>
            <input name="title" onChange={onChange} placeholder="Paris Product Hackathon" value={formValues.title} />
          </label>

          <label className="field">
            <span>Location</span>
            <input name="location" onChange={onChange} placeholder="UP Cité campus" value={formValues.location} />
          </label>

          <label className="field field--full">
            <span>Description</span>
            <textarea
              name="description"
              onChange={onChange}
              placeholder="Add the event scope, audience, and outcomes."
              value={formValues.description}
            />
          </label>

          <label className="field">
            <span>Date and time</span>
            <input name="date" onChange={onChange} type="datetime-local" value={formValues.date} />
          </label>

          <label className="field">
            <span>Capacity</span>
            <input min="1" name="capacity" onChange={onChange} type="number" value={formValues.capacity} />
          </label>

          {formState.error ? <InlineNotice message={formState.error} tone="error" /> : null}

          <button className={buttonClassNames.primaryWide} disabled={formState.pending} type="submit">
            {formState.pending
              ? editingEventId
                ? 'Saving event...'
                : 'Creating event...'
              : editingEventId
                ? 'Save event'
                : 'Create event'}
          </button>
        </form>
      ) : (
        <EmptyStateCard
          description="This account can inspect event data but cannot change the event catalogue."
          title="Viewer account"
        />
      )}
    </>
  )
}
