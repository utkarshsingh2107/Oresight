import React from 'react'

/* OreSight logo — from Stitch code.html (satellite orbit + ore block + crosshair) */
function OresightLogo({ size = 32 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Orbital trajectory */}
      <ellipse
        cx="50" cy="50" rx="42" ry="18"
        stroke="#93ccff" strokeWidth="2" strokeDasharray="4 2"
        transform="rotate(-28 50 50)" opacity="0.85"
      />
      <circle cx="82" cy="33" r="3" fill="#93ccff" />
      {/* Ore block — top face */}
      <polygon points="50,22 74,36 50,50 26,36"
        fill="#d97707" fillOpacity="0.9"
        stroke="#ffb77d" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Ore block — left face */}
      <polygon points="26,36 50,50 50,78 26,64"
        fill="#92400e" fillOpacity="0.95"
        stroke="#ffb77d" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Ore block — right face */}
      <polygon points="50,50 74,36 74,64 50,78"
        fill="#b45309" fillOpacity="0.9"
        stroke="#ffb77d" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Crosshair */}
      <circle cx="50" cy="50" r="7" stroke="#fff" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="50" r="2.5" fill="#ffb77d" />
      <line x1="50" y1="40" x2="50" y2="44" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="56" x2="50" y2="60" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="50" x2="44" y2="50" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="50" x2="60" y2="50" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function Header({ onRefresh, loading }) {
  return (
    <header style={{
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      padding: '0 var(--gap-lg)',
      marginBottom: 'var(--gap-lg)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div
        className="flex-between page-wrapper"
        style={{ padding: '12px var(--gap-lg)', maxWidth: 1400 }}
      >
        {/* Brand */}
        <div className="flex-row" style={{ gap: 12 }}>
          <OresightLogo size={34} />
          <div>
            <div className="flex-row" style={{ gap: 8 }}>
              <span style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--primary)',
                letterSpacing: '-0.01em',
              }}>
                OreSight
              </span>
              {/* Stitch status chip — square-edged amber */}
              <span style={{
                fontSize: '0.62rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                background: 'rgba(217,119,6,.15)',
                color: 'var(--primary)',
                border: '1px solid rgba(217,119,6,.35)',
                padding: '2px 7px',
                borderRadius: 'var(--radius-sm)',
              }}>
                MVP
              </span>
            </div>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.72rem',
              marginTop: 2,
              letterSpacing: '0.01em',
            }}>
              Space-Enabled Mine Intelligence
            </p>
          </div>
        </div>

        {/* Refresh — Stitch secondary button style */}
        <button
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh data"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.8rem',
            fontWeight: 500,
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            background: 'var(--bg-card-alt)',
            color: loading ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={ev => {
            if (!loading) {
              ev.currentTarget.style.borderColor = 'var(--border-active)'
              ev.currentTarget.style.background  = 'var(--border-light)'
            }
          }}
          onMouseLeave={ev => {
            ev.currentTarget.style.borderColor = 'var(--border)'
            ev.currentTarget.style.background  = 'var(--bg-card-alt)'
          }}
        >
          <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>↻</span>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </header>
  )
}
