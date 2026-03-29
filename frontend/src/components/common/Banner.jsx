// Frontend developer: Mehdi AGHAEI
export default function Banner({ compact = false, onDismiss, text, tone }) {
  return (
    <div className={`banner banner--${tone} ${compact ? 'banner--compact' : ''}`}>
      <p>{text}</p>
      <button className="banner__dismiss" onClick={onDismiss} type="button">
        Dismiss
      </button>
    </div>
  )
}
