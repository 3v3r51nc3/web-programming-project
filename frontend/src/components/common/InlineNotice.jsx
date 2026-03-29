// Frontend developer: Mehdi AGHAEI
export default function InlineNotice({ message, tone }) {
  return <p className={`inline-notice inline-notice--${tone}`}>{message}</p>
}
