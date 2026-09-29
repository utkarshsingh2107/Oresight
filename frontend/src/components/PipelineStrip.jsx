import React from 'react'

const STAGES = [
  { id: 'overview',   label: 'Mission Overview',     q: 'What does the system know?' },
  { id: 'satellite',  label: 'Space Intelligence',   q: 'What does EO reveal?' },
  { id: 'prism',      label: 'Resource Mapping',     q: 'Where are the mineralised zones?' },
  { id: 'ear',        label: 'Accessibility',        q: 'What can be accessed?' },
  { id: 'pulse',      label: 'Production Forecast',  q: 'What can we produce?' },
  { id: 'nudge',      label: 'Decision Engine',      q: 'What should we do?' },
]

export default function PipelineStrip({ activeStage, onSelect }) {
  return (
    <nav aria-label="Intelligence pipeline stages" style={{
      display: 'flex', alignItems: 'stretch', gap: 0,
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', overflow: 'hidden',
      marginBottom: 'var(--gap-lg)',
    }}>
      {STAGES.map((s, i) => {
        const active = activeStage === s.id
        const isSat  = s.id === 'satellite'
        return (
          <React.Fragment key={s.id}>
            {i > 0 && (
              <div style={{ width: 1, background: 'var(--border)', flexShrink: 0, alignSelf: 'stretch' }} />
            )}
            <button
              onClick={() => onSelect(s.id)}
              aria-pressed={active}
              aria-label={`Stage: ${s.label}`}
              style={{
                flex: 1, padding: '10px 10px', border: 'none',
                borderRadius: 0, textAlign: 'center', cursor: 'pointer',
                borderBottom: active
                  ? `2px solid ${isSat ? 'var(--purple)' : 'var(--accent)'}`
                  : '2px solid transparent',
                backgroundColor: active
                  ? isSat ? 'rgba(188,140,255,.07)' : 'rgba(88,166,255,.06)'
                  : 'transparent',
                transition: 'background-color 0.15s',
              }}
            >
              <div style={{
                fontWeight: 700, fontSize: '0.82rem',
                color: active
                  ? isSat ? 'var(--purple)' : 'var(--accent)'
                  : 'var(--text-primary)',
              }}>
                {isSat && <span style={{ marginRight: 4, fontSize: '0.75rem' }}>🛰</span>}
                {s.label}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {s.q}
              </div>
            </button>
          </React.Fragment>
        )
      })}
    </nav>
  )
}
