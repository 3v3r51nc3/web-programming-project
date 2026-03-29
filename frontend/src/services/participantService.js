// Frontend developer: Mehdi AGHAEI
export function saveParticipantRequest(requester, payload, participantId) {
  return requester(participantId ? `/participants/${participantId}/` : '/participants/', {
    method: participantId ? 'PATCH' : 'POST',
    data: payload,
  })
}

export function deleteParticipantRequest(requester, participantId) {
  return requester(`/participants/${participantId}/`, {
    method: 'DELETE',
  })
}
