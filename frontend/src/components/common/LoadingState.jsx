// Frontend developer: Mehdi AGHAEI
export default function LoadingState() {
  return (
    <section className="loading-panel">
      <div className="loading-ripple" />
      <h3>Loading EventHub data...</h3>
      <p>Fetching the authenticated dashboard, events, participants, and registrations.</p>
    </section>
  )
}
