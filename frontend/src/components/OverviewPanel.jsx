import React from 'react'
import { fmtT, fmtPct } from '../utils/labels.js'

const RISK_COLORS = {
  LOW: 'var(--risk-low)', MEDIUM: 'var(--risk-medium)',
  HIGH: 'var(--risk-high)', CRITICAL: 'var(--risk-critical)',
}

/* ── OBSERVE → INTERPRET → PREDICT → DECIDE pipeline ─────────── */
const PIPELINE_STEPS = [
  {
    id: 'satellite', phase: 'OBSERVE',
    icon: '🛰', color: 'var(--purple)',
    title: 'Earth Observation',
    desc:  'Satellite spectral intelligence',
  },
  {
    id: 'prism', phase: 'INTERPRET',
    icon: '⛏', color: 'var(--accent)',
    title: 'Resource Mapping',
    desc:  'Geological + EO fusion',
  },
  {
    id: 'ear', phase: 'ASSESS',
    icon: '📍', color: 'var(--green)',
    title: 'Accessibility',
    desc:  'Terrain + operational constraints',
  },
  {
    id: 'pulse', phase: 'PREDICT',
    icon: '📈', color: 'var(--yellow)',
    title: 'Production Forecast',
    desc:  'LightGBM P10/P50/P90',
  },
  {
    id: 'nudge', phase: 'DECIDE',
    icon: '⚡', color: 'var(--orange)',
    title: 'Decision Engine',
    desc:  'MILP optimisation',
  },
]

/* ── System architecture flow (compact) ─────────────────────── */
const ARCH_LAYERS = [
  { icon: '🛰', label: 'EARTH OBSERVATION',    sub: 'Sentinel-2 · Bhuvan · DEM · Spectral data',      color: 'var(--purple)' },
  { icon: '🗺', label: 'SPATIAL INTELLIGENCE', sub: 'Spectral indices · Terrain · Anomaly detection',  color: 'var(--accent)' },
  { icon: '⛏', label: 'GEOLOGICAL FUSION',     sub: 'Boreholes · Assays · Kriging · Block model',      color: 'var(--green)' },
  { icon: '📦', label: 'RESOURCE INTELLIGENCE',sub: 'Mineralised zones · Spatially modelled resource', color: 'var(--yellow)' },
  { icon: '⚙', label: 'OPERATIONAL INTEL',     sub: 'Accessibility · Equipment · Weather',             color: 'var(--orange)' },
  { icon: '📈', label: 'PREDICTIVE INTEL',     sub: 'LightGBM · P10-P50-P90 · Risk & SHAP',           color: 'var(--red)' },
  { icon: '⚡', label: 'DECISION INTEL',        sub: 'MILP / NUDGE · Recommended actions',              color: 'var(--purple)' },
]

export default function OverviewPanel({ overview, onNavigate }) {
  if (!overview) return null
  const p  = overview.prism
  const e  = overview.ear
  const pu = overview.pulse
  const rl = overview.risk_level
  const n  = overview.nudge
  const rc = RISK_COLORS[rl] ?? 'var(--risk-critical)'

  return (
    <div className="stage-view">

      {/* ── Hero heading ── */}
      <div style={{ marginBottom: 'var(--gap-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: '1.4rem' }}>🛰</span>
          <h1 style={{ marginBottom: 0 }}>Space-Enabled Mine Intelligence</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 760 }}>
          Earth observation and spatial intelligence identify where mineral resources are.
          Geological fusion estimates the resource. Operational AI forecasts production,
          quantifies risk, and recommends the optimal intervention.
        </p>
      </div>

      {/* ── System architecture compact diagram ── */}
      <div className="card" style={{ marginBottom: 'var(--gap-lg)', background: 'var(--bg-card-alt)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--gap-md)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            System Architecture
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>DEMO-01 · Synthetic EO data</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, overflowX: 'auto' }}>
          {ARCH_LAYERS.map((layer, i) => (
            <React.Fragment key={layer.label}>
              <div style={{
                flex: 1, minWidth: 110, padding: '10px 8px', textAlign: 'center',
                borderLeft: i === 0 ? 'none' : '1px solid var(--border-light)',
              }}>
                <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{layer.icon}</div>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, color: layer.color,
                  textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.3, marginBottom: 3 }}>
                  {layer.label}
                </p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {layer.sub}
                </p>
              </div>
              {i < ARCH_LAYERS.length - 1 && (
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0 2px', flexShrink: 0 }}>↓</div>
              )}
            </React.Fragment>
          ))}
        </div>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic', textAlign: 'center' }}>
          Integration-ready: Sentinel-2 · Sentinel-1 SAR · ISRO Bhuvan · Landsat · SRTM DEM
        </p>
      </div>

      {/* ── OBSERVE → INTERPRET → PREDICT → DECIDE clickable pipeline ── */}
      <div className="card" style={{ marginBottom: 'var(--gap-lg)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 'var(--gap-md)' }}>
          Intelligence Pipeline — click any stage to explore
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', overflowX: 'auto', gap: 0 }}>
          {PIPELINE_STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              {i > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '1rem', padding: '0 4px', flexShrink: 0 }}>→</div>
              )}
              <button
                onClick={() => onNavigate(s.id)}
                style={{
                  flex: 1, background: 'none', border: 'none',
                  borderRadius: 'var(--radius-sm)', padding: 'var(--gap-md) var(--gap-sm)',
                  textAlign: 'center', cursor: 'pointer', minWidth: 120,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = `rgba(88,166,255,.05)`}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                aria-label={`Navigate to ${s.title}`}
              >
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: s.color,
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                  {s.phase}
                </div>
                <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{s.icon}</div>
                <p style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                  {s.title}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.desc}</p>
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--gap-md)', marginBottom: 'var(--gap-lg)' }}>

        {/* Resource */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--gap-sm)' }}>
            <div className="section-label">Mineral Resource</div>
            <SourceBadge label="Spatial Model" color="var(--accent)" />
          </div>
          <div style={{ display: 'flex', gap: 'var(--gap-lg)', marginTop: 4 }}>
            <div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Modelled resource</p>
              <p style={{ fontWeight: 800, fontSize: '1.35rem', color: 'var(--accent)' }}>
                {(p.declared_reserve_t / 1e6).toFixed(2)} Mt
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>→</div>
            <div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Accessible</p>
              <p style={{ fontWeight: 800, fontSize: '1.35rem', color: 'var(--green)' }}>
                {(e.effective_accessible_reserve_t / 1e6).toFixed(2)} Mt
              </p>
            </div>
          </div>
          <p className="text-muted text-small" style={{ marginTop: 'var(--gap-sm)' }}>
            {(e.accessibility_ratio * 100).toFixed(1)}% accessible under current constraints
          </p>
        </div>

        {/* Forecast */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--gap-sm)' }}>
            <div className="section-label">30-Day Production Forecast</div>
            <SourceBadge label="Forecast Model" color="var(--yellow)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
            <div className="flex-between">
              <span className="text-muted text-small">Planned target</span>
              <span style={{ fontWeight: 600 }}>{fmtT(pu.planned_production_t)} t</span>
            </div>
            <div className="flex-between">
              <span className="text-muted text-small">P50 expected</span>
              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{fmtT(pu.expected_production_t)} t</span>
            </div>
            <div className="flex-between">
              <span className="text-muted text-small">Expected shortfall</span>
              <span style={{ fontWeight: 700, color: 'var(--risk-high)' }}>−{fmtT(pu.expected_shortfall_t)} t</span>
            </div>
          </div>
        </div>

        {/* Risk */}
        <div className="card" style={{ borderColor: rc }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--gap-sm)' }}>
            <div className="section-label">Shortfall Risk</div>
            <SourceBadge label="SHAP Attribution" color={rc} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
            <span style={{ fontWeight: 900, fontSize: '2rem', color: rc, lineHeight: 1 }}>
              {fmtPct(pu.shortfall_probability)}
            </span>
            <span className={`badge badge--${rl.toLowerCase()}`} style={{ fontSize: '0.78rem', padding: '2px 10px' }}>
              {rl}
            </span>
          </div>
          <p className="text-muted text-small" style={{ marginTop: 6 }}>
            Probability of missing production target
          </p>
        </div>
      </div>

      {/* ── Best action CTA ── */}
      <div
        onClick={() => onNavigate('nudge')}
        role="button"
        aria-label="View Decision Engine recommendation"
        style={{
          background: 'rgba(88,166,255,.05)', border: '1px solid var(--accent-dim)',
          borderRadius: 'var(--radius-md)', padding: 'var(--gap-md)',
          cursor: 'pointer', transition: 'background 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--gap-md)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(88,166,255,.1)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(88,166,255,.05)'}
      >
        <div>
          <p style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>
            ⚡ Decision Engine — recommended action
          </p>
          <p style={{ fontWeight: 700, fontSize: '1rem' }}>{n.action_name}</p>
          <p className="text-muted text-small" style={{ marginTop: 2 }}>
            Expected: +{fmtT(n.expected_production_gain_t)} t ·
            Shortfall reduction: −{fmtT(n.expected_shortfall_reduction_t)} t ·
            Derived from integrated spatial, geological and operational intelligence
          </p>
        </div>
        <div style={{ color: 'var(--accent)', fontSize: '1.4rem', flexShrink: 0 }}>→</div>
      </div>
    </div>
  )
}

function SourceBadge({ label, color }) {
  return (
    <span style={{
      fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.05em', color, background: `${color}18`,
      padding: '2px 7px', borderRadius: 10, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}
