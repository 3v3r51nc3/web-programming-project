// Frontend developer: Mehdi AGHAEI
import { startTransition, useEffect, useState } from 'react'
import withSessionGuard from './HOC/withSessionGuard'
import LoadingState from './components/common/LoadingState'
import AppShell from './components/header/AppShell'
import { API_BASE_URL, EDITABLE_ROLES } from './constants/appConstants'
import { getPageMeta } from './constants/pageMeta'
import { APP_ROUTES, DEFAULT_ROUTE } from './constants/routes'
import DashboardPage from './pages/DashboardPage'
import EventDetailsPage from './pages/EventDetailsPage'
import EventsPage from './pages/EventsPage'
import LoginPage from './pages/LoginPage'
import ParticipantsPage from './pages/ParticipantsPage'
import { requestJson } from './services/api'
import { loginUser, logoutUser } from './services/authService'
import { deleteEventRequest, saveEventRequest } from './services/eventService'
import { deleteParticipantRequest, saveParticipantRequest } from './services/participantService'
import {
  createRegistrationRequest,
  deleteRegistrationRequest,
  updateRegistrationStatusRequest,
} from './services/registrationService'
import { fetchWorkspace } from './services/workspaceService'
import { toApiDateTime } from './utils/dateUtils'
import { navigateTo, parseRouteFromHash } from './utils/routeUtils'
import { readStoredSession, writeStoredSession } from './utils/storage'
import { createEmptyWorkspace } from './utils/workspaceUtils'

const ProtectedWorkspaceShell = withSessionGuard(function WorkspaceShell({ renderContent, ...shellProps }) {
  return <AppShell {...shellProps}>{renderContent()}</AppShell>
})

function App() {
  const [session, setSession] = useState(() => readStoredSession())
  const [route, setRoute] = useState(() => parseRouteFromHash(window.location.hash))
  const token = session?.token || ''
  const hasSession = Boolean(token)
  const [authState, setAuthState] = useState({ pending: false, error: '' })
  const [banner, setBanner] = useState(null)
  const [workspace, setWorkspace] = useState(() => createEmptyWorkspace())
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    writeStoredSession(session)
  }, [session])

  useEffect(() => {
    const syncRoute = () => {
      startTransition(() => {
        setRoute(parseRouteFromHash(window.location.hash))
      })
    }

    if (!window.location.hash) {
      navigateTo(hasSession ? DEFAULT_ROUTE : APP_ROUTES.login)
    } else {
      syncRoute()
    }

    window.addEventListener('hashchange', syncRoute)

    return () => {
      window.removeEventListener('hashchange', syncRoute)
    }
  }, [hasSession])

  useEffect(() => {
    if (!hasSession && route.name !== 'login') {
      navigateTo(APP_ROUTES.login)
      return
    }

    if (hasSession && route.name === 'login') {
      navigateTo(DEFAULT_ROUTE)
    }
  }, [hasSession, route.name])

  useEffect(() => {
    if (!token) {
      setWorkspace(createEmptyWorkspace())
      return
    }

    const controller = new AbortController()
    let isCancelled = false

    async function loadWorkspace() {
      setWorkspace((currentWorkspace) => ({
        ...currentWorkspace,
        status: currentWorkspace.lastUpdated ? 'refreshing' : 'loading',
        error: '',
      }))

      try {
        const data = await fetchWorkspace(token, controller.signal)

        if (isCancelled) {
          return
        }

        setSession((currentSession) => {
          if (!currentSession || currentSession.token !== token) {
            return currentSession
          }

          return {
            ...currentSession,
            user: data.user,
          }
        })

        setWorkspace({
          status: 'ready',
          error: '',
          events: data.events,
          participants: data.participants,
          registrations: data.registrations,
          lastUpdated: new Date().toISOString(),
        })
      } catch (error) {
        if (isCancelled || error.name === 'AbortError') {
          return
        }

        if (error.status === 401) {
          setWorkspace(createEmptyWorkspace())
          setBanner({
            tone: 'error',
            text: 'Your session expired. Please sign in again.',
          })
          setSession(null)
          navigateTo(APP_ROUTES.login)
          return
        }

        setWorkspace((currentWorkspace) => ({
          ...currentWorkspace,
          status: 'error',
          error: error.message,
        }))
      }
    }

    loadWorkspace()

    return () => {
      isCancelled = true
      controller.abort()
    }
  }, [refreshTick, token])

  const user = session?.user || null
  const canEdit = EDITABLE_ROLES.includes(user?.role)
  const pageMeta = getPageMeta(route, workspace.events)
  const isInitialLoading = workspace.status === 'loading' && !workspace.lastUpdated
  const selectedEvent =
    route.name === 'event-details'
      ? workspace.events.find((event) => event.id === route.eventId)
      : null

  async function handleLogin(credentials) {
    setAuthState({ pending: true, error: '' })

    try {
      const response = await loginUser(credentials)

      setSession(response)
      setBanner({
        tone: 'success',
        text: `Signed in as ${response.user.full_name}.`,
      })
      setAuthState({ pending: false, error: '' })
      navigateTo(DEFAULT_ROUTE)
    } catch (error) {
      setAuthState({
        pending: false,
        error: error.message,
      })
    }
  }

  async function handleLogout() {
    try {
      if (token) {
        await logoutUser(token)
      }
    } catch {
      // Ignore logout failures locally and still clear the stale session.
    }

    setSession(null)
    setWorkspace(createEmptyWorkspace())
    setBanner({
      tone: 'neutral',
      text: 'The session was cleared on this browser.',
    })
    navigateTo(APP_ROUTES.login)
  }

  async function requestWithAuth(path, options = {}) {
    try {
      return await requestJson(path, {
        ...options,
        token,
      })
    } catch (error) {
      if (error.status === 401) {
        setWorkspace(createEmptyWorkspace())
        setBanner({
          tone: 'error',
          text: 'Your session expired. Please sign in again.',
        })
        setSession(null)
        navigateTo(APP_ROUTES.login)
      }

      throw error
    }
  }

  function refreshWorkspace() {
    setRefreshTick((currentValue) => currentValue + 1)
  }

  async function handleSaveEvent(formValues, eventId) {
    const payload = {
      title: formValues.title.trim(),
      description: formValues.description.trim(),
      location: formValues.location.trim(),
      date: toApiDateTime(formValues.date),
      capacity: Number(formValues.capacity),
    }

    if (!payload.title || !payload.location || !payload.date || !payload.capacity) {
      throw new Error('Title, location, date, and capacity are required.')
    }

    await saveEventRequest(requestWithAuth, payload, eventId)

    setBanner({
      tone: 'success',
      text: eventId ? 'The event was updated.' : 'A new event was created.',
    })
    refreshWorkspace()
  }

  async function handleDeleteEvent(event) {
    await deleteEventRequest(requestWithAuth, event.id)

    setBanner({
      tone: 'success',
      text: `${event.title} was removed from the calendar.`,
    })
    refreshWorkspace()
  }

  async function handleSaveParticipant(formValues, participantId) {
    const payload = {
      first_name: formValues.first_name.trim(),
      last_name: formValues.last_name.trim(),
      email: formValues.email.trim(),
    }

    if (!payload.first_name || !payload.last_name || !payload.email) {
      throw new Error('First name, last name, and email are required.')
    }

    await saveParticipantRequest(requestWithAuth, payload, participantId)

    setBanner({
      tone: 'success',
      text: participantId ? 'The participant profile was updated.' : 'A new participant was added.',
    })
    refreshWorkspace()
  }

  async function handleDeleteParticipant(participant) {
    await deleteParticipantRequest(requestWithAuth, participant.id)

    setBanner({
      tone: 'success',
      text: `${participant.first_name} ${participant.last_name} was removed.`,
    })
    refreshWorkspace()
  }

  async function handleCreateRegistration({ eventId, participantId, status }) {
    if (!participantId) {
      throw new Error('Select a participant before submitting the registration.')
    }

    await createRegistrationRequest(requestWithAuth, {
      event: eventId,
      participant: Number(participantId),
      status,
    })

    setBanner({
      tone: 'success',
      text: 'The participant was registered to the event.',
    })
    refreshWorkspace()
  }

  async function handleUpdateRegistrationStatus(registration, status) {
    await updateRegistrationStatusRequest(requestWithAuth, registration.id, status)

    setBanner({
      tone: 'success',
      text: 'The registration status was updated.',
    })
    refreshWorkspace()
  }

  async function handleDeleteRegistration(registration) {
    await deleteRegistrationRequest(requestWithAuth, registration.id)

    setBanner({
      tone: 'success',
      text: 'The registration entry was removed.',
    })
    refreshWorkspace()
  }

  function dismissBanner() {
    setBanner(null)
  }

  function renderWorkspace() {
    if (isInitialLoading) {
      return <LoadingState />
    }

    if (route.name === 'events') {
      return (
        <EventsPage
          canEdit={canEdit}
          events={workspace.events}
          onDeleteEvent={handleDeleteEvent}
          onOpenEvent={(eventId) => navigateTo(`/events/${eventId}`)}
          onSaveEvent={handleSaveEvent}
          registrations={workspace.registrations}
        />
      )
    }

    if (route.name === 'participants') {
      return (
        <ParticipantsPage
          canEdit={canEdit}
          onDeleteParticipant={handleDeleteParticipant}
          onSaveParticipant={handleSaveParticipant}
          participants={workspace.participants}
          registrations={workspace.registrations}
        />
      )
    }

    if (route.name === 'event-details') {
      return (
        <EventDetailsPage
          canEdit={canEdit}
          event={selectedEvent}
          onBack={() => navigateTo(APP_ROUTES.events)}
          onCreateRegistration={handleCreateRegistration}
          onDeleteRegistration={handleDeleteRegistration}
          onGoToParticipants={() => navigateTo(APP_ROUTES.participants)}
          onUpdateRegistrationStatus={handleUpdateRegistrationStatus}
          participants={workspace.participants}
          registrations={workspace.registrations}
        />
      )
    }

    return (
      <DashboardPage
        canEdit={canEdit}
        events={workspace.events}
        onNavigateToEvent={(eventId) => navigateTo(`/events/${eventId}`)}
        onNavigateToEvents={() => navigateTo(APP_ROUTES.events)}
        onNavigateToParticipants={() => navigateTo(APP_ROUTES.participants)}
        participants={workspace.participants}
        registrations={workspace.registrations}
        user={user}
      />
    )
  }

  return (
    <ProtectedWorkspaceShell
      apiBaseUrl={API_BASE_URL}
      banner={banner}
      canEdit={canEdit}
      error={workspace.error}
      fallback={
        <LoginPage
          authState={authState}
          banner={banner}
          onDismissBanner={dismissBanner}
          onSubmit={handleLogin}
        />
      }
      lastUpdated={workspace.lastUpdated}
      onDismissBanner={dismissBanner}
      onLogout={handleLogout}
      onNavigate={navigateTo}
      onRefresh={refreshWorkspace}
      pageMeta={pageMeta}
      renderContent={renderWorkspace}
      routeName={route.name}
      session={session}
      user={user}
      workspaceStatus={workspace.status}
    />
  )
}

export default App
