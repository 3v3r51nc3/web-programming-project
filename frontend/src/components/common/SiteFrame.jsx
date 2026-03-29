// Frontend developer: Mehdi AGHAEI
import { useState } from 'react'
import EventHubLogo from './EventHubLogo'
import { readStoredVisitorCount, trackVisitorCount } from '../../utils/storage'

const DEFAULT_VISITOR_COUNT = 982
const CONTACT_EMAIL = 'soroosh77aghaei@yahoo.com'
const HTML4_REFERENCE_URL = 'https://www.w3.org/TR/html401/'
const WEB_RING_REFERENCE_URL = 'https://en.wikipedia.org/wiki/Webring'

export default function SiteFrame({
  children,
  footerItems = [],
  footerNote,
  headerLabel,
  headerActions = null,
  meta,
  onLogoClick = null,
  onToggleTheme,
  themeMode = 'light',
  themeToggleLabel,
  utilityItems = ['Live events', 'Member access', 'Online registration'],
}) {
  const resolvedUtilityItems = utilityItems
    .map((item) => {
      if (typeof item === 'string') {
        return { label: item }
      }

      return item && typeof item === 'object' ? item : null
    })
    .filter(Boolean)
  const resolvedFooterItems = footerItems
    .map((item) => {
      if (typeof item === 'string') {
        return { label: item }
      }

      return item && typeof item === 'object' ? item : null
    })
    .filter(Boolean)
  const marqueeItems = [headerLabel, meta, ...resolvedFooterItems.map((item) => item.label)].filter(Boolean)
  const isDarkTheme = themeMode === 'dark'
  const [visitorCount] = useState(() => {
    const currentCount = readStoredVisitorCount(DEFAULT_VISITOR_COUNT)
    const trackedCount = trackVisitorCount(DEFAULT_VISITOR_COUNT)
    return trackedCount > 0 ? trackedCount : currentCount
  })
  const logoMarkup = <EventHubLogo className="site-header__mark" />

  return (
    <div className="site-frame">
      <div className="retro-utility-bar" aria-label="Retro utility bar">
        {resolvedUtilityItems.map((item) =>
          item.href ? (
            <a className="retro-utility-bar__link" href={item.href} key={item.label}>
              {item.label}
            </a>
          ) : item.onClick ? (
            <button className="retro-utility-bar__link" key={item.label} onClick={item.onClick} type="button">
              {item.label}
            </button>
          ) : (
            <span key={item.label}>{item.label}</span>
          ),
        )}
      </div>

      <marquee className="retro-marquee" scrollamount="5">
        {marqueeItems.length
          ? `${marqueeItems.join(' *** ')} *** Browse events *** Manage registrations *** Welcome to EventHub Online ***`
          : 'Welcome to EventHub Online'}
      </marquee>

      <header className="site-header">
        <div className="site-header__brand">
          <p className="site-header__label">{headerLabel}</p>
          <div className="site-header__identity">
            {onLogoClick ? (
              <button
                aria-label="Go to home"
                className="site-header__brand-link"
                onClick={onLogoClick}
                type="button"
              >
                {logoMarkup}
              </button>
            ) : (
              logoMarkup
            )}
            {meta ? <span className="site-header__meta">{meta}</span> : null}
          </div>
        </div>

        <div className="site-header__actions">
          <button
            aria-label={themeToggleLabel}
            className={`site-header__theme-toggle ${isDarkTheme ? 'site-header__theme-toggle--dark' : ''}`}
            onClick={onToggleTheme}
            title={themeToggleLabel}
            type="button"
          >
            <span className="site-header__theme-toggle-track" aria-hidden="true">
              <span className="site-header__theme-toggle-icon site-header__theme-toggle-icon--sun">☀</span>
              <span className="site-header__theme-toggle-icon site-header__theme-toggle-icon--moon">☾</span>
              <span className="site-header__theme-toggle-thumb" />
            </span>
          </button>
          {headerActions ? <div className="site-header__quick-actions">{headerActions}</div> : null}
        </div>
      </header>

      <div className="site-frame__content">{children}</div>

      <footer className="site-footer">
        <p className="site-footer__note">{footerNote}</p>

        {resolvedFooterItems.length ? (
          <div className="site-footer__links" aria-label="Footer">
            {resolvedFooterItems.map((item) =>
              item.href ? (
                <a className="site-footer__link-button" href={item.href} key={item.label}>
                  {item.label}
                </a>
              ) : item.onClick ? (
                <button className="site-footer__link-button" key={item.label} onClick={item.onClick} type="button">
                  {item.label}
                </button>
              ) : (
                <span key={item.label}>{item.label}</span>
              ),
            )}
          </div>
        ) : null}

        <div className="site-footer__extras">
          <div className="retro-badge-strip" aria-label="Retro badges">
            <a
              className="retro-badge retro-badge--link"
              href={HTML4_REFERENCE_URL}
              rel="noreferrer"
              target="_blank"
            >
              HTML 4.0
            </a>
            <a
              className="retro-badge retro-badge--link"
              href={WEB_RING_REFERENCE_URL}
              rel="noreferrer"
              target="_blank"
            >
              WEB RING
            </a>
            <a className="retro-badge retro-badge--link" href={`mailto:${CONTACT_EMAIL}?subject=EventHub%20Website`}>
              EMAIL ME
            </a>
          </div>
          <div className="retro-counter" aria-label="Visitor counter">
            <span className="retro-counter__label">Visitors</span>
            <span className="retro-counter__digits">{String(visitorCount).padStart(6, '0')}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
