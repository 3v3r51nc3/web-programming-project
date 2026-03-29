// Frontend developer: Mehdi AGHAEI
export default function NavButton({ active, description, label, onClick }) {
  return (
    <button className={`nav-button ${active ? 'nav-button--active' : ''}`} onClick={onClick} type="button">
      <span>{label}</span>
      <small>{description}</small>
    </button>
  )
}
