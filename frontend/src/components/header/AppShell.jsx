// Frontend developer: Mehdi AGHAEI
import { APP_ROUTES } from '../../constants/routes'
import { buttonClassNames } from '../../styles'
import { formatLastUpdated } from '../../utils/dateUtils'
import Banner from '../common/Banner'
import InlineNotice from '../common/InlineNotice'
import StatusBadge from '../common/StatusBadge'
import NavButton from './NavButton'

export default function AppShell({
  apiBaseUrl,
  banner,
  canEdit,
  children,
  error,
  lastUpdated,
  onDismissBanner,
  onLogout,
  onNavigate,
  onRefresh,
  pageMeta,
  routeName,
  user,
  workspaceStatus,
}) {
  const accessLabel = user?.role === 'admin' ? 'Admin' : canEdit ? 'Editor' : 'Viewer'

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-card">
          <p className="eyebrow">Web Programming 2026</p>
          <h1>EventHub</h1>
          <p className="sidebar-copy">
            A protected React control center for events, participants, and registrations.
          </p>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          <NavButton
            active={routeName === 'dashboard'}
            description="See the live project summary."
            label="Dashboard"
            onClick={() => onNavigate(APP_ROUTES.dashboard)}
          />
          <NavButton
            active={routeName === 'events' || routeName === 'event-details'}
            description="Create, filter, and inspect each event."
            label="Events"
            onClick={() => onNavigate(APP_ROUTES.events)}
          />
          <NavButton
            active={routeName === 'participants'}
            description="Maintain attendee profiles."
            label="Participants"
            onClick={() => onNavigate(APP_ROUTES.participants)}
          />
        </nav>

        <section className="sidebar-panel">
          <p className="panel-label">Current session</p>
          <div className="profile-card">
            <div>
              <p className="profile-name">{user?.full_name}</p>
              <p className="profile-meta">@{user?.username}</p>
            </div>
            <StatusBadge label={accessLabel} tone={canEdit ? 'accent' : 'neutral'} />
          </div>
          <p className="micro-copy">
            Admins and editors can create, update, and delete data. Viewers can inspect the full
            application in read-only mode.
          </p>
        </section>

        <section className="sidebar-panel sidebar-panel--soft">
          <p className="panel-label">API target</p>
          <p className="sidebar-copy sidebar-copy--small">{apiBaseUrl}</p>
          <p className="micro-copy">{formatLastUpdated(lastUpdated)}</p>
        </section>
      </aside>

      <section className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow eyebrow--dark">Operations view</p>
            <h2>{pageMeta.title}</h2>
            <p className="workspace-copy">{pageMeta.subtitle}</p>
          </div>

          <div className="header-actions">
            <button className={buttonClassNames.secondary} onClick={onRefresh} type="button">
              {workspaceStatus === 'refreshing' ? 'Refreshing...' : 'Refresh data'}
            </button>
            <button className={buttonClassNames.ghost} onClick={onLogout} type="button">
              Log out
            </button>
          </div>
        </header>

        {banner ? <Banner {...banner} onDismiss={onDismissBanner} /> : null}
        {error ? <InlineNotice message={error} tone="error" /> : null}

        {children}
      </section>
    </main>
  )
}
