import React from 'react'

const STAGES = [
  { id: 'overview',   label: 'Mission Overview',    q: 'What does the system know?' },
  { id: 'satellite',  label: 'Space Intelligence',  q: 'What does EO reveal?' },
  { id: 'prism',      label: 'Resource Mapping',    q: 'Where are the mineralised zones?' },
  { id: 'ear',        label: 'Accessibility',       q: 'What can be accessed?' },
  { id: 'pulse',      label: 'Production Forecast', q: 'What can we produce?' },
  { id: 'nudge',      label: 'Decision Engine',     q: 'What should we do?' },
]

export default function PipelineStrip({ activeStage, onSelect }) {
  return (
    <nav
      aria-label="Intelligence pipeline stages"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        overflowX: 'auto',        /* design.md §21 — horizontal scroll on mobile */
        marginBottom: 'var(--gap-lg)',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {STAGES.map((s, i) => {
        const active  = activeStage === s.id
        const isSat   = s.id === 'satellite'
        const isFinal = s.id === 'nudge'

        /* Active accent: amber for decision/action stages, blue for EO, amber default */
        const activeColor = isSat
          ? 'var(--accent)'           /* blue for space intelligence */
          : isFinal
          ? 'var(--primary)'          /* amber for decision engine */
          : 'var(--primary)'          /* amber primary for all others */

        const activeBg = isSat
          ? 'rgba(147,204,255,.07)'
          : 'rgba(217,119,6,.07)'

        return (
          <React.Fragment key={s.id}>
            {i > 0 && (
              <div style={{
                width: 1,
                background: 'var(--border)',
                flexShrink: 0,
                alignSelf: 'stretch',
              }} />
            )}
            <button
              onClick={() => onSelect(s.id)}
              aria-pressed={active}
              aria-label={`Stage: ${s.label}`}
              style={{
                flex: 1,
                padding: '10px 8px',
                border: 'none',
                borderRadius: 0,
                textAlign: 'center',
                cursor: 'pointer',
                borderBottom: active
                  ? `2px solid ${activeColor}`
                  : '2px solid transparent',
                backgroundColor: active ? activeBg : 'transparent',
                transition: 'background-color 0.15s',
                minWidth: 0,
              }}
              onMouseEnter={ev => {
                if (!active) ev.currentTarget.style.backgroundColor = 'rgba(255,255,255,.03)'
              }}
              onMouseLeave={ev => {
                if (!active) ev.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {/* Stage name */}
              <div style={{
                fontWeight: 600,
                fontSize: '0.8rem',
                color: active ? activeColor : 'var(--text-primary)',
                letterSpacing: '-0.005em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {isSat && (
                  <span style={{ marginRight: 4, fontSize: '0.7rem' }}>🛰</span>
                )}
                {s.label}
              </div>
              {/* Sub-question */}
              <div style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                marginTop: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {s.q}
              </div>
            </button>
          </React.Fragment>
        )
      })}
    </nav>
  )
}
