// Frontend developer: Mehdi AGHAEI
import { createElement } from 'react'

export default function withSessionGuard(Component) {
  return function GuardedComponent({ fallback = null, session, ...props }) {
    if (!session?.token) {
      return fallback
    }

    return createElement(Component, props)
  }
}
