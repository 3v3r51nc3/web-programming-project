// Frontend developer: Mehdi AGHAEI
import { EVENT_STATUS_OPTIONS } from '../../constants/appConstants'

export default function EventFilters({ filters, onChange }) {
  return (
    <div className="filter-row">
      <label className="field field--compact">
        <span>Search</span>
        <input
          name="query"
          onChange={onChange}
          placeholder="Hackathon, Paris, workshop..."
          type="search"
          value={filters.query}
        />
      </label>

      <label className="field field--compact">
        <span>Status</span>
        <select name="status" onChange={onChange} value={filters.status}>
          {EVENT_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field field--compact">
        <span>Date</span>
        <input name="date" onChange={onChange} type="date" value={filters.date} />
      </label>
    </div>
  )
}
