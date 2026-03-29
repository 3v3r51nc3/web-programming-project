// Frontend developer: Mehdi AGHAEI
export default function NavButton({ active, description, label, onClick }) {
  return (
    <button className={`nav-button ${active ? 'nav-button--active' : ''}`} onClick={onClick} type="button">
      <span className="nav-button__label">{label}</span>
      <small className="nav-button__description">{description}</small>
    </button>
  )
}
