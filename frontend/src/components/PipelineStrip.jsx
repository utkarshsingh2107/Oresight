import React from 'react'

/**
 * Stitch Intelligence Pipeline Strip
 * Orchestrates the 6-stage analytical pipeline:
 * OBSERVE (EO) → INTERPRET (Prism) → ASSESS (EAR) → PREDICT (Pulse) → DECIDE (Nudge)
 */
const STAGES = [
  { id: 'overview',  num: '01', label: 'Mission Overview',    q: 'What does the system know?' },
  { id: 'satellite', num: '02', label: 'Space Intelligence',  q: 'What does EO reveal?', isSat: true },
  { id: 'prism',     num: '03', label: 'Resource Mapping',    q: 'Where are the mineralised zones?' },
  { id: 'ear',       num: '04', label: 'Accessibility',       q: 'What can be accessed?' },
  { id: 'pulse',     num: '05', label: 'Production Forecast', q: 'What can we produce?' },
  { id: 'nudge',     num: '06', label: 'Decision Engine',     q: 'What should we do?', isAction: true },
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
        overflowX: 'auto',
        marginBottom: 'var(--gap-lg)',
        WebkitOverflowScrolling: 'touch',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}
    >
      {STAGES.map((s, i) => {
        const active  = activeStage === s.id
        const isSat   = s.isSat
        const isFinal = s.isAction

        // Active accent: Amber for operational decisions, Cyan for Earth Observation
        const activeColor = isSat
          ? 'var(--accent-bright)'
          : isFinal
          ? 'var(--primary)'
          : 'var(--primary)'

        const activeBorder = isSat
          ? 'var(--accent-dim)'
          : 'var(--primary-dim)'

        const activeBg = isSat
          ? 'rgba(56, 189, 248, 0.08)'
          : 'rgba(217, 119, 7, 0.08)'

        return (
          <React.Fragment key={s.id}>
            {i > 0 && (
              <div
                style={{
                  width: 1,
                  background: 'var(--border)',
                  flexShrink: 0,
                  alignSelf: 'stretch',
                }}
              />
            )}
            <button
              onClick={() => onSelect(s.id)}
              aria-pressed={active}
              aria-label={`Stage: ${s.label}`}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 8px 8px',
                border: 'none',
                borderRadius: 0,
                textAlign: 'center',
                cursor: 'pointer',
                background: active ? activeBg : 'transparent',
                borderBottom: active
                  ? `3px solid ${activeBorder}`
                  : '3px solid transparent',
                transition: 'all 0.15s ease',
                minWidth: 130,
                position: 'relative',
              }}
              onMouseEnter={ev => {
                if (!active) ev.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'
              }}
              onMouseLeave={ev => {
                if (!active) ev.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              {/* Micro Step Index */}
              <div
                style={{
                  fontSize: '0.58rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: active ? activeColor : 'var(--text-muted)',
                  marginBottom: 3,
                }}
              >
                STAGE {s.num}
              </div>

              {/* Stage Title */}
              <div
                style={{
                  fontWeight: active ? 700 : 600,
                  fontSize: '0.82rem',
                  color: active ? activeColor : 'var(--text-primary)',
                  letterSpacing: '-0.005em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                {isSat && <span style={{ fontSize: '0.75rem' }}>🛰</span>}
                {isFinal && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>⚡</span>}
                {s.label}
              </div>

              {/* Sub-question */}
              <div
                style={{
                  fontSize: '0.66rem',
                  color: active ? 'var(--text-secondary)' : 'var(--text-muted)',
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {s.q}
              </div>
            </button>
          </React.Fragment>
        )
      })}
    </nav>
  )
}
