// Frontend developer: Mehdi AGHAEI
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import SocialAuthButtons from './SocialAuthButtons'
import InlineNotice from '../common/InlineNotice'
import { buttonClassNames } from '../../styles'

export default function AuthModal({
  authState,
  mode,
  onClose,
  onRegister,
  onSocialUnavailable,
  onSubmit,
  onSwitchMode,
  registerState,
  socialNotice = '',
}) {
  const isRegisterMode = mode === 'register'
  const windowTitle = isRegisterMode ? 'EventHub Registration Center' : 'EventHub Member Access'
  const introPoints = isRegisterMode
    ? [
        'Create your account and start registering for events in minutes.',
        'Keep your profile, email, and sign-in details in one place.',
        'Use social sign-in when available or continue with email below.',
      ]
    : [
        'Return to your dashboard, registrations, and saved event activity.',
        'Review upcoming events and keep your profile up to date.',
        'Use social sign-in when available or continue with email below.',
      ]

  return (
    <div className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <div className="auth-modal__backdrop" onClick={onClose} />

      <section className="auth-modal__panel">
        <div className="auth-modal__window-bar">
          <div className="auth-modal__window-title">
            <span className="auth-modal__window-dot" aria-hidden="true" />
            <span>{windowTitle}</span>
          </div>

          <button
            aria-label="Close dialog"
            className="auth-modal__window-button"
            onClick={onClose}
            type="button"
          >
            X
          </button>
        </div>

        <div className="auth-modal__body">
          <aside className="auth-modal__intro">
            <p className="panel-label">{isRegisterMode ? 'Create account' : 'Sign in'}</p>
            <h2 className="surface-title" id="auth-modal-title">
              {isRegisterMode ? 'Join EventHub' : 'Welcome back'}
            </h2>
            <p className="surface-copy">
              {isRegisterMode
                ? 'Create an account to register for events and connect with people around you.'
                : 'Sign in to manage registrations, follow events, and keep your account up to date.'}
            </p>

            <ul className="auth-modal__feature-list">
              {introPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </aside>

          <div className="auth-modal__content">
            <div className="auth-modal__switch">
              <button
                className={`${buttonClassNames.secondary} ${!isRegisterMode ? 'auth-modal__tab--active' : ''}`}
                onClick={() => onSwitchMode('login')}
                type="button"
              >
                Sign in
              </button>
              <button
                className={`${buttonClassNames.secondary} ${isRegisterMode ? 'auth-modal__tab--active' : ''}`}
                onClick={() => onSwitchMode('register')}
                type="button"
              >
                Create account
              </button>
            </div>

            <div className="auth-modal__social">
              <p className="panel-label">Social sign-in</p>
              <SocialAuthButtons onUnavailableProvider={onSocialUnavailable} />
              <p className="micro-copy">Choose a social sign-in option when available, or continue with email below.</p>
              {socialNotice ? <InlineNotice message={socialNotice} tone="error" /> : null}
            </div>

            <div className="auth-modal__divider" aria-hidden="true">
              <span>or use email</span>
            </div>

            {authState.error && !isRegisterMode ? <InlineNotice message={authState.error} tone="error" /> : null}
            {registerState.error && isRegisterMode ? <InlineNotice message={registerState.error} tone="error" /> : null}

            <div className="auth-modal__form-shell">
              {isRegisterMode ? (
                <RegisterForm authState={registerState} onSubmit={onRegister} />
              ) : (
                <LoginForm authState={authState} onSubmit={onSubmit} />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
