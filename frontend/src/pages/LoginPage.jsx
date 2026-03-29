// Frontend developer: Mehdi AGHAEI
import RegisterForm from '../components/auth/RegisterForm'
import LoginForm from '../components/auth/LoginForm'
import FeatureCard from '../components/cards/FeatureCard'
import Banner from '../components/common/Banner'

const registerPreviewState = Object.freeze({
  pending: false,
  error: '',
})

export default function LoginPage({ authState, banner, onDismissBanner, onSubmit }) {
  return (
    <main className="login-shell">
      <section className="login-story">
        <p className="eyebrow">EventHub SPA</p>
        <h1>Coordinate events with a dashboard that feels production-ready.</h1>
        <p className="workspace-copy">
          This frontend now uses a reusable structure with dedicated auth, header, event, cards,
          pages, services, constants, and utilities folders.
        </p>

        <div className="feature-stack">
          <FeatureCard
            description="The application keeps the token in localStorage and redirects unauthenticated users back to login."
            title="Protected navigation"
          />
          <FeatureCard
            description="Event pages are split into reusable forms, cards, filters, and registration components."
            title="Reusable structure"
          />
          <FeatureCard
            description="Each page handles loading, validation errors, and live refreshes instead of assuming happy-path requests."
            title="Real API states"
          />
        </div>
      </section>

      <section className="login-panel">
        {banner ? <Banner {...banner} compact onDismiss={onDismissBanner} /> : null}

        <div className="surface-card">
          <p className="panel-label">Sign in</p>
          <h2 className="surface-title">Open the EventHub workspace</h2>
          <p className="surface-copy">
            Use any Django account once the backend branch is merged and connected to this frontend.
          </p>

          <LoginForm authState={authState} onSubmit={onSubmit} />
        </div>

        <div className="surface-card">
          <p className="panel-label">Register component</p>
          <h2 className="surface-title">Reusable auth extension point</h2>
          <p className="surface-copy">
            The register UI is already isolated in `components/auth` so we can wire it to the backend
            after your merge without reshaping the frontend again.
          </p>

          <RegisterForm
            authState={registerPreviewState}
            disabled
            helperText="Registration submission is intentionally disabled until the backend registration endpoint is merged."
          />
        </div>
      </section>
    </main>
  )
}
