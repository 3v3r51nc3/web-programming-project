// Frontend developer: Mehdi AGHAEI
import { buttonClassNames } from '../../styles'

export default function EmptyStateCard({ actionLabel, description, onAction, title }) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <button className={buttonClassNames.secondary} onClick={onAction} type="button">
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
