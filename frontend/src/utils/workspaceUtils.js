// Frontend developer: Mehdi AGHAEI
export function createEmptyWorkspace() {
  return {
    status: 'idle',
    error: '',
    events: [],
    participants: [],
    registrations: [],
    lastUpdated: '',
  }
}
