// Frontend developer: Mehdi AGHAEI
export default function FeatureCard({ description, title }) {
  return (
    <article className="feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}
