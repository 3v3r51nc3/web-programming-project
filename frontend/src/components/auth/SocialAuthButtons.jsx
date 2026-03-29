// Frontend developer: Mehdi AGHAEI
import { SOCIAL_AUTH_PROVIDERS } from '../../constants/appConstants'

function SocialProviderIcon({ providerId }) {
  switch (providerId) {
    case 'google':
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 18 18">
          <rect fill="#fff8ea" height="12" width="16" x="1" y="3" />
          <path
            d="M1 5l8 5 8-5"
            fill="none"
            shapeRendering="crispEdges"
            stroke="#d93025"
            strokeWidth="2"
          />
          <path
            d="M1 3v12"
            fill="none"
            shapeRendering="crispEdges"
            stroke="#4285f4"
            strokeWidth="2"
          />
          <path
            d="M17 3v12"
            fill="none"
            shapeRendering="crispEdges"
            stroke="#fbbc04"
            strokeWidth="2"
          />
          <path
            d="M1 15h16"
            fill="none"
            shapeRendering="crispEdges"
            stroke="#34a853"
            strokeWidth="2"
          />
          <path
            d="M1 3h16"
            fill="none"
            shapeRendering="crispEdges"
            stroke="#7d2020"
            strokeWidth="1"
          />
        </svg>
      )
    case 'github':
      return (
        <svg aria-hidden="true" focusable="false" shapeRendering="crispEdges" viewBox="0 0 18 18">
          <path d="M5 3h2v2H5zM11 3h2v2h-2z" fill="#111111" />
          <path d="M4 5h10v7H4z" fill="#111111" />
          <path d="M6 12h1v2H6zM11 12h1v2h-1z" fill="#111111" />
          <path d="M7 9h1v1H7zM10 9h1v1h-1z" fill="#fff8ea" />
          <path d="M7 11h4v1H7z" fill="#fff8ea" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 18 18">
          <rect fill="#1f63c6" height="16" rx="2" width="16" x="1" y="1" />
          <circle cx="5" cy="5" fill="#ffffff" r="1.2" />
          <rect fill="#ffffff" height="6.7" width="1.9" x="4.05" y="7.1" />
          <path
            d="M8 7.1h1.9v1c.5-.7 1.2-1.2 2.4-1.2 1.7 0 2.7 1.1 2.7 3.3v3.6h-2v-3.4c0-1-.4-1.6-1.3-1.6-.7 0-1.2.5-1.4 1.1-.1.2-.1.5-.1.7v3.2H8z"
            fill="#ffffff"
          />
        </svg>
      )
    case 'yahoo':
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 18 18">
          <rect fill="#6d21c8" height="16" rx="2" width="16" x="1" y="1" />
          <path d="M4.2 4h2.8L9 7.6 11 4h2.8L10.5 9v4H7.6V9z" fill="#ffffff" />
          <rect fill="#ffffff" height="5.8" width="1.6" x="12.4" y="4.2" />
          <rect fill="#ffffff" height="1.6" width="1.6" x="12.4" y="11.1" />
        </svg>
      )
    case 'discord':
      return (
        <svg aria-hidden="true" focusable="false" viewBox="0 0 18 18">
          <path
            d="M5 4.5h8l2 2.3v5.2l-2 1.5-1.4-1H6.4L5 13.5l-2-1.5V6.8z"
            fill="#5865f2"
          />
          <path d="M6.2 7.4h5.6l.9 2.1-.9 2H6.2l-.9-2z" fill="#ffffff" opacity="0.96" />
          <circle cx="7.7" cy="9.3" fill="#5865f2" r="0.8" />
          <circle cx="10.3" cy="9.3" fill="#5865f2" r="0.8" />
        </svg>
      )
    default:
      return null
  }
}

function SocialAuthButtonContent({ provider }) {
  return (
    <>
      <span aria-hidden="true" className={`social-auth__icon social-auth__icon--${provider.id}`}>
        <SocialProviderIcon providerId={provider.id} />
      </span>
      <span className="social-auth__label">Continue with {provider.label}</span>
    </>
  )
}

export default function SocialAuthButtons({ onUnavailableProvider }) {
  return (
    <div className="social-auth">
      {SOCIAL_AUTH_PROVIDERS.map((provider) =>
        provider.href ? (
          <a className="social-auth__button" href={provider.href} key={provider.id}>
            <SocialAuthButtonContent provider={provider} />
          </a>
        ) : (
          <button
            className="social-auth__button"
            key={provider.id}
            onClick={() => onUnavailableProvider(provider.label)}
            type="button"
          >
            <SocialAuthButtonContent provider={provider} />
          </button>
        ),
      )}
    </div>
  )
}
