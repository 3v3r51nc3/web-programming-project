// Frontend developer: Mehdi AGHAEI
import { buttonClassNames } from '../../styles'
import EmptyStateCard from '../cards/EmptyStateCard'
import InlineNotice from '../common/InlineNotice'

export default function EventCrudForm({
  canEdit,
  editingEventId,
  formState,
  formValues,
  formClassName = '',
  helperText = '',
  onChange,
  onReset,
  onSubmit,
  panelLabel,
  readOnlyDescription = 'This account can view events but cannot create or edit them.',
  readOnlyTitle = 'View only',
  resetLabel = 'Reset',
  titleOverride,
}) {
  const resolvedPanelLabel = panelLabel || (canEdit ? 'Event form' : 'View only')
  const resolvedTitle = titleOverride || (editingEventId ? 'Edit event' : 'Create event')

  return (
    <>
      <div className="section-heading">
        <div>
          <p className="panel-label">{resolvedPanelLabel}</p>
          <h3 className="surface-title">{resolvedTitle}</h3>
        </div>
        {canEdit ? (
          <button className={buttonClassNames.ghost} onClick={onReset} type="button">
            {resetLabel}
          </button>
        ) : null}
      </div>

      {canEdit ? (
        <form className={`form-grid ${formClassName}`.trim()} onSubmit={onSubmit}>
          <label className="field">
            <span>Title</span>
            <input name="title" onChange={onChange} placeholder="Spring Design Workshop" value={formValues.title} />
          </label>

          <label className="field">
            <span>Location</span>
            <input name="location" onChange={onChange} placeholder="Main Hall" value={formValues.location} />
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

          {helperText ? <p className="micro-copy field--full">{helperText}</p> : null}
          {formState.error ? <InlineNotice message={formState.error} tone="error" /> : null}

          <button className={`${buttonClassNames.primaryWide} field--full`} disabled={formState.pending} type="submit">
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
        <EmptyStateCard description={readOnlyDescription} title={readOnlyTitle} />
      )}
    </>
  )
}
