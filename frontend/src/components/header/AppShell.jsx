// Frontend developer: Mehdi AGHAEI
import { useEffect, useState } from 'react'
import { APP_ROUTES } from '../../constants/routes'
import { buttonClassNames } from '../../styles'
import { formatLastUpdated } from '../../utils/dateUtils'
import Banner from '../common/Banner'
import InlineNotice from '../common/InlineNotice'
import SiteFrame from '../common/SiteFrame'
import NavButton from './NavButton'

const MOBILE_SIDEBAR_MEDIA_QUERY = '(max-width: 780px)'

export default function AppShell({
  banner,
  canEdit,
  children,
  error,
  lastUpdated,
  onDismissBanner,
  onLogout,
  onLogoClick,
  onNavigate,
  onRefresh,
  onToggleTheme,
  pageMeta,
  routeName,
  themeMode,
  themeToggleLabel,
  user,
  workspaceStatus,
}) {
  const accessLabel = user?.role === 'admin' ? 'Admin' : canEdit ? 'Editor' : 'Viewer'
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return !window.matchMedia(MOBILE_SIDEBAR_MEDIA_QUERY).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const mediaQuery = window.matchMedia(MOBILE_SIDEBAR_MEDIA_QUERY)
    const syncSidebar = (event) => {
      setIsSidebarOpen(!event.matches)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncSidebar)

      return () => {
        mediaQuery.removeEventListener('change', syncSidebar)
      }
    }

    mediaQuery.addListener(syncSidebar)

    return () => {
      mediaQuery.removeListener(syncSidebar)
    }
  }, [])

  function handleSidebarNavigate(path) {
    onNavigate(path)

    if (typeof window !== 'undefined' && window.matchMedia(MOBILE_SIDEBAR_MEDIA_QUERY).matches) {
      setIsSidebarOpen(false)
    }
  }

  return (
    <SiteFrame
      utilityItems={[
        {
          label: 'Live events',
          onClick: () => handleSidebarNavigate(APP_ROUTES.events),
        },
        {
          label: 'Member access',
          onClick: () => handleSidebarNavigate(APP_ROUTES.dashboard),
        },
        {
          label: 'Online registration',
          onClick: () => handleSidebarNavigate(APP_ROUTES.participants),
        },
      ]}
      footerItems={[
        {
          label: 'Dashboard',
          onClick: () => handleSidebarNavigate(APP_ROUTES.dashboard),
        },
        {
          label: 'Events',
          onClick: () => handleSidebarNavigate(APP_ROUTES.events),
        },
        {
          label: 'Participants',
          onClick: () => handleSidebarNavigate(APP_ROUTES.participants),
        },
      ]}
      footerNote="Plan and join events online."
      headerLabel="EventHub Online"
      headerActions={
        <>
          <button className={`${buttonClassNames.secondary} site-header__action-button`} onClick={onRefresh} type="button">
            {workspaceStatus === 'refreshing' ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className={`${buttonClassNames.ghost} site-header__action-button`} onClick={onLogout} type="button">
            Log out
          </button>
        </>
      }
      meta={pageMeta.title}
      onLogoClick={onLogoClick}
      onToggleTheme={onToggleTheme}
      themeMode={themeMode}
      themeToggleLabel={themeToggleLabel}
    >
      <main className="app-shell">
        <aside className="sidebar">
          <button
            aria-expanded={isSidebarOpen}
            className="sidebar__toggle"
            onClick={() => setIsSidebarOpen((currentState) => !currentState)}
            type="button"
          >
            {isSidebarOpen ? 'Close menu' : 'Open menu'}
          </button>

          <div className={`sidebar__content ${isSidebarOpen ? 'sidebar__content--open' : ''}`}>
            <nav className="sidebar-nav" aria-label="Primary">
              <NavButton
                active={routeName === 'dashboard'}
                description="Overview, schedule, and quick totals."
                label="Dashboard"
                onClick={() => handleSidebarNavigate(APP_ROUTES.dashboard)}
              />
              <NavButton
                active={routeName === 'events' || routeName === 'event-details'}
                description="Browse, create, and update events."
                label="Events"
                onClick={() => handleSidebarNavigate(APP_ROUTES.events)}
              />
              <NavButton
                active={routeName === 'participants'}
                description={canEdit ? 'Keep participant records up to date.' : 'See your participant profile and registrations.'}
                label="Participants"
                onClick={() => handleSidebarNavigate(APP_ROUTES.participants)}
              />
            </nav>

            <section className="sidebar-panel">
              <p className="panel-label">Signed in as</p>
              <div className="profile-card">
                <p className="profile-name">{user?.full_name}</p>
                <p className="profile-meta">
                  @{user?.username}
                  {accessLabel ? ` · ${accessLabel}` : ''}
                </p>
              </div>
              <p className="micro-copy">
                Admins can edit events, participants, and registrations. Viewers can see only their
                own participant profile and register themselves for events.
              </p>
            </section>

            <section className="sidebar-panel sidebar-panel--soft">
              <p className="panel-label">Workspace</p>
              <p className="sidebar-copy sidebar-copy--small">{formatLastUpdated(lastUpdated)}</p>
              <p className="micro-copy">Use Refresh to load the latest updates.</p>
            </section>
          </div>
        </aside>

        <section className="workspace">
          <header className="workspace-header">
            <div>
              <p className="eyebrow eyebrow--dark">Event management</p>
              <p className="retro-status-line">Now loading fresh community happenings and sign-ups.</p>
              <h2>{pageMeta.title}</h2>
              <p className="workspace-copy">{pageMeta.subtitle}</p>
            </div>
          </header>

          {banner ? <Banner {...banner} onDismiss={onDismissBanner} /> : null}
          {error ? <InlineNotice message={error} tone="error" /> : null}

          {children}
        </section>
      </main>
    </SiteFrame>
  )
}
