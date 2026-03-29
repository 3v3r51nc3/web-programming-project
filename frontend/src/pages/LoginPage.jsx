// Frontend developer: Mehdi AGHAEI
import { useEffect, useRef, useState } from 'react'
import AuthModal from '../components/auth/AuthModal'
import Banner from '../components/common/Banner'
import SiteFrame from '../components/common/SiteFrame'
import { buttonClassNames } from '../styles'
import { formatDateTime } from '../utils/dateUtils'
import { fetchPublicEventsRequest } from '../services/eventService'

export default function LoginPage({
  authState,
  banner,
  onDismissBanner,
  onLogoClick,
  onRegister,
  onSubmit,
  onToggleTheme,
  registerState,
  themeMode,
  themeToggleLabel,
}) {
  const [isEventWarningOpen, setIsEventWarningOpen] = useState(false)
  const [modalMode, setModalMode] = useState(null)
  const [socialNotice, setSocialNotice] = useState('')
  const publicEventsRef = useRef(null)
  const [publicEventsState, setPublicEventsState] = useState({
    status: 'loading',
    events: [],
    error: '',
  })

  useEffect(() => {
    const controller = new AbortController()
    let isCancelled = false

    async function loadPublicEvents() {
      try {
        const events = await fetchPublicEventsRequest(controller.signal)

        if (isCancelled) {
          return
        }

        const upcomingEvents = [...events]
          .sort((leftEvent, rightEvent) => new Date(leftEvent.date).getTime() - new Date(rightEvent.date).getTime())
          .slice(0, 4)

        setPublicEventsState({
          status: 'ready',
          events: upcomingEvents,
          error: '',
        })
      } catch (error) {
        if (isCancelled || error.name === 'AbortError') {
          return
        }

        setPublicEventsState({
          status: 'error',
          events: [],
          error: error.message,
        })
      }
    }

    loadPublicEvents()

    return () => {
      isCancelled = true
      controller.abort()
    }
  }, [])

  useEffect(() => {
    if (!isEventWarningOpen) {
      return undefined
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsEventWarningOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isEventWarningOpen])

  function openModal(mode) {
    setSocialNotice('')
    setModalMode(mode)
  }

  function closeModal() {
    setSocialNotice('')
    setModalMode(null)
  }

  function handleSocialUnavailable(providerLabel) {
    setSocialNotice(`${providerLabel} sign-in is not available right now. Please use email sign-in instead.`)
  }

  function handleJumpToPublicEvents() {
    publicEventsRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  function handleLogoClick() {
    setIsEventWarningOpen(false)
    closeModal()
    onLogoClick?.()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleOpenPublicEvent() {
    setIsEventWarningOpen(true)
  }

  function handleOpenLoginFromWarning() {
    setIsEventWarningOpen(false)
    openModal('login')
  }

  function handleOpenRegisterFromWarning() {
    setIsEventWarningOpen(false)
    openModal('register')
  }

  return (
    <SiteFrame
      utilityItems={[
        {
          label: 'Live events',
          onClick: handleJumpToPublicEvents,
        },
        {
          label: 'Member access',
          onClick: () => openModal('login'),
        },
        {
          label: 'Online registration',
          onClick: () => openModal('register'),
        },
      ]}
      footerItems={[
        {
          label: 'Discover',
          onClick: handleJumpToPublicEvents,
        },
        {
          label: 'Connect',
          onClick: () => openModal('login'),
        },
        {
          label: 'Register',
          onClick: () => openModal('register'),
        },
      ]}
      footerNote="Plan and join events online."
      headerLabel="EventHub Online"
      headerActions={
        <>
          <button className={`${buttonClassNames.ghost} site-header__action-button`} onClick={() => openModal('login')} type="button">
            Login
          </button>
          <button
            className={`${buttonClassNames.secondary} site-header__action-button`}
            onClick={() => openModal('register')}
            type="button"
          >
            Register
          </button>
        </>
      }
      hideFooter={Boolean(modalMode || isEventWarningOpen)}
      meta="Discover events"
      onLogoClick={handleLogoClick}
      onToggleTheme={onToggleTheme}
      themeMode={themeMode}
      themeToggleLabel={themeToggleLabel}
    >
      <main className="login-shell">
        <section className="login-story">
          <p className="eyebrow">EventHub</p>
          <h1>Find local events. Meet people.</h1>
          <p className="workspace-copy">
            EventHub is a simple place to discover events, follow what is coming next, and keep
            registration organized without duplicate sign-ups.
          </p>

          <marquee className="retro-story-marquee" behavior="alternate" scrollamount="4">
            Community meetups! Workshops! Guest lectures! Register online today!
          </marquee>

          <div className="retro-badge-strip" aria-label="Landing page badges">
            <button className="retro-badge retro-badge--action" onClick={handleJumpToPublicEvents} type="button">
              LIVE NOW
            </button>
            <button className="retro-badge retro-badge--action" onClick={() => openModal('login')} type="button">
              MEMBERS AREA
            </button>
            <button className="retro-badge retro-badge--action" onClick={() => openModal('register')} type="button">
              QUICK SIGN-UP
            </button>
          </div>

          <ul className="login-feature-list">
            <li>Browse upcoming events and quickly see where activity is happening.</li>
            <li>Keep participants linked across many events without duplicate registrations.</li>
            <li>Update time, place, capacity, and registrations from one shared flow.</li>
          </ul>
        </section>

        <section className="login-panel">
          {banner ? <Banner {...banner} compact onDismiss={onDismissBanner} /> : null}

          <div className="surface-card login-panel__section simple-section">
            <div className="login-panel__block">
              <p className="panel-label">About the app</p>
              <h2 className="surface-title">A hub for local events</h2>
              <p className="surface-copy">
                People come to EventHub to see upcoming events around them, follow schedules, and
                connect to the right event.
              </p>
              <ul className="rule-list rule-list--compact">
                <li>You can register for multiple events.</li>
              </ul>
            </div>

            <div aria-hidden="true" className="section-divider" />

            <div className="login-panel__block" ref={publicEventsRef}>
              <p className="panel-label">Public events</p>
              <h2 className="surface-title">What is coming up</h2>

              {publicEventsState.status === 'ready' && publicEventsState.events.length ? (
                <div className="landing-events landing-events--compact">
                  {publicEventsState.events.map((event) => (
                    <button
                      aria-label={`View full details for ${event.title}`}
                      className="landing-event-card landing-event-card--action"
                      key={event.id}
                      onClick={handleOpenPublicEvent}
                      type="button"
                    >
                      <span className="landing-event-card__date">{formatDateTime(event.date)}</span>
                      <span className="landing-event-card__title">{event.title}</span>
                      <span className="landing-event-card__location">{event.location}</span>
                      <span className="landing-event-card__copy">
                        {event.description || 'Preview available.'}
                      </span>
                    </button>
                  ))}
                </div>
              ) : publicEventsState.status === 'ready' ? (
                <p className="surface-copy">No public events are available yet.</p>
              ) : publicEventsState.status === 'error' ? (
                <p className="surface-copy">{publicEventsState.error}</p>
              ) : (
                <p className="surface-copy">Loading public events...</p>
              )}
            </div>
          </div>
        </section>
      </main>

      {isEventWarningOpen ? (
        <div className="event-warning-modal" role="dialog" aria-modal="true" aria-labelledby="event-warning-title">
          <div className="event-warning-modal__backdrop" onClick={() => setIsEventWarningOpen(false)} />

          <section className="event-warning-modal__panel">
            <div className="event-warning-modal__window-bar">
              <div className="event-warning-modal__window-title">
                <span className="event-warning-modal__window-dot" aria-hidden="true" />
                <span>Member access required</span>
              </div>

              <button
                aria-label="Close access warning"
                className="event-warning-modal__window-button"
                onClick={() => setIsEventWarningOpen(false)}
                type="button"
              >
                X
              </button>
            </div>

            <div className="event-warning-modal__body">
              <p className="panel-label">Warning</p>
              <h2 className="surface-title" id="event-warning-title">
                Sign in or register to view full details
              </h2>
              <p className="surface-copy">
                Log in or create an account to check out the full details of events.
              </p>

              <div className="button-row event-warning-modal__actions">
                <button className={buttonClassNames.ghost} onClick={() => setIsEventWarningOpen(false)} type="button">
                  Close
                </button>
                <button className={buttonClassNames.ghost} onClick={handleOpenLoginFromWarning} type="button">
                  Login
                </button>
                <button className={buttonClassNames.secondary} onClick={handleOpenRegisterFromWarning} type="button">
                  Register
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {modalMode ? (
        <AuthModal
          authState={authState}
          mode={modalMode}
          onClose={closeModal}
          onRegister={onRegister}
          onSocialUnavailable={handleSocialUnavailable}
          onSubmit={onSubmit}
          onSwitchMode={(mode) => {
            setSocialNotice('')
            setModalMode(mode)
          }}
          registerState={registerState}
          socialNotice={socialNotice}
        />
      ) : null}
    </SiteFrame>
  )
}
