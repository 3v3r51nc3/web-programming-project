// Frontend developer: Mehdi AGHAEI
export default function StatusBadge({ label, tone }) {
  return <span className={`status-badge status-badge--${tone}`}>{label}</span>
}
