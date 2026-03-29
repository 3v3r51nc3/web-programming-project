// Frontend developer: Mehdi AGHAEI
export function createRegistrationRequest(requester, payload) {
  return requester('/registrations/', {
    method: 'POST',
    data: payload,
  })
}

export function updateRegistrationStatusRequest(requester, registrationId, status) {
  return requester(`/registrations/${registrationId}/`, {
    method: 'PATCH',
    data: { status },
  })
}

export function deleteRegistrationRequest(requester, registrationId) {
  return requester(`/registrations/${registrationId}/`, {
    method: 'DELETE',
  })
}
