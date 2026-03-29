// Frontend developer: Mehdi AGHAEI
export default function EventHubLogo({ className = '', mode = 'compact' }) {
  const logoClassName = `eventhub-logo eventhub-logo--${mode} ${className}`.trim()

  return (
    <div className={logoClassName}>
      <span className="eventhub-logo__badge">WEB</span>
      <span className="eventhub-logo__lockup">
        <span aria-hidden="true" className="eventhub-logo__spark eventhub-logo__spark--left">
          *
        </span>
        <span className="eventhub-logo__wordmark">
          <span className="eventhub-logo__event">Event</span>
          <span className="eventhub-logo__hub">Hub</span>
        </span>
        <span aria-hidden="true" className="eventhub-logo__spark eventhub-logo__spark--right">
          *
        </span>
      </span>
      <span className="eventhub-logo__tag">click. meet. go.</span>
    </div>
  )
}
