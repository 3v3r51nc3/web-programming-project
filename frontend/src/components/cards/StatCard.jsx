// Frontend developer: Mehdi AGHAEI
export default function StatCard({ description, label, value }) {
  return (
    <article className="stat-card">
      <p className="panel-label">{label}</p>
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__description">{description}</p>
    </article>
  )
}
