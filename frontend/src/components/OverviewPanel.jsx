/**
 * OverviewPanel — Mission Overview
 * Executive command summary. Answers 4 questions in ≤10 s.
 * All values from /api/overview. Space Intelligence KPI from /api/satellite.
 */
import React, { useEffect, useState } from 'react'
import { fmtT, fmtPct } from '../utils/labels.js'
import { getSatellite } from '../services/api.js'

const RISK_COLOR = {
  LOW: 'var(--risk-low)', MEDIUM: 'var(--risk-medium)',
  HIGH: 'var(--risk-high)', CRITICAL: 'var(--risk-critical)',
}

export default function OverviewPanel({ overview, onNavigate }) {
  if (!overview) return null

  const p  = overview.prism
  const e  = overview.ear
  const pu = overview.pulse
  const rl = overview.risk_level
  const n  = overview.nudge
  const rc = RISK_COLOR[rl] ?? 'var(--risk-critical)'

  const [eoStats, setEoStats] = useState(null)
  useEffect(() => {
    getSatellite().then(setEoStats).catch(() => setEoStats(null))
  }, [])

  return (
    <div className="stage-view">

      {/* ── Hero ── */}
      <div className="stage-header">
        <h1>Space-Enabled Mine Intelligence</h1>
        <p>
          Integrates Earth-observation data, geological evidence and operational AI
          to identify resources, assess accessibility, forecast production and support decisions.
        </p>
      </div>

      {/* ── Evidence chain ── */}
      <div className="evidence-flow" style={{ marginBottom: 'var(--gap-lg)' }}>
        <EvidenceBlock icon="🛰" label="Space Intelligence" color="var(--purple)"
          lines={['Satellite spectral indicators', 'Terrain / DEM analysis', 'Anomaly detection']}
          note="Surface spatial context" />
        <div className="evidence-flow__op">+</div>
        <EvidenceBlock icon="⛏" label="Geological Validation" color="var(--green)"
          lines={['Boreholes + assays', 'Ordinary Kriging', '3D block model']}
          note="Subsurface grade evidence" />
        <div className="evidence-flow__op">→</div>
        <EvidenceBlock icon="📦" label="Resource Intelligence" color="var(--primary)"
          lines={['Modelled mineral resource', 'Accessible resource', 'Production forecast']}
          note="Integrated pipeline output" highlight />
      </div>

      {/* ── 6 KPI cards ── */}
      <div className="grid-3 mb-lg">
        <KpiCard label="Geological Resource" source="Borehole + Kriging" sourceColor="var(--accent)"
          onClick={() => onNavigate('prism')} aria-label="View Resource Mapping">
          <div className="metric-value" style={{ color: 'var(--accent)' }}>
            {(p.declared_reserve_t / 1e6).toFixed(2)} Mt
          </div>
          <div className="metric-sub">{p.ore_blocks} mineralised blocks · avg Mn {p.average_mn_pct}%</div>
        </KpiCard>

        <KpiCard label="Accessible Resource" source="EAR Analysis" sourceColor="var(--green)"
          onClick={() => onNavigate('ear')} aria-label="View Accessibility">
          <div className="metric-value" style={{ color: 'var(--green)' }}>
            {(e.effective_accessible_reserve_t / 1e6).toFixed(2)} Mt
          </div>
          <div style={{ marginTop: 8 }}>
            <div className="progress-bar-track" style={{ height: 4 }}>
              <div className="progress-bar-fill"
                style={{ width: `${(e.accessibility_ratio * 100).toFixed(1)}%`, background: 'var(--green)' }} />
            </div>
            <div className="metric-sub">{(e.accessibility_ratio * 100).toFixed(1)}% accessible</div>
          </div>
        </KpiCard>

        <KpiCard label="Shortfall Risk" source="SHAP Attribution" sourceColor={rc}
          borderColor={`${rc}60`} onClick={() => onNavigate('pulse')} aria-label="View Production Forecast">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div className="metric-value" style={{ color: rc }}>{fmtPct(pu.shortfall_probability)}</div>
            <span className={`badge badge--${rl.toLowerCase()}`}>{rl}</span>
          </div>
          <div className="metric-sub">probability of missing target</div>
        </KpiCard>

        <KpiCard label="P50 Production Forecast" source="Forecast Model" sourceColor="var(--yellow)"
          onClick={() => onNavigate('pulse')} aria-label="View Production Forecast">
          <div className="metric-value" style={{ color: 'var(--accent)' }}>
            {fmtT(pu.expected_production_t)} t
          </div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <StatRowInline label="Planned" value={`${fmtT(pu.planned_production_t)} t`} />
            <StatRowInline label="P10" value={`${fmtT(pu.p10_production_t)} t`} />
            <StatRowInline label="P90" value={`${fmtT(pu.p90_production_t)} t`} />
          </div>
        </KpiCard>

        <KpiCard label="Expected Shortfall" source="Forecast Model" sourceColor="var(--risk-high)"
          borderColor="rgba(255,183,125,.2)" onClick={() => onNavigate('pulse')} aria-label="View Production Forecast">
          <div className="metric-value" style={{ color: 'var(--risk-high)' }}>
            −{fmtT(pu.expected_shortfall_t)} t
          </div>
          <div className="metric-sub">
            {((pu.expected_shortfall_t / pu.planned_production_t) * 100).toFixed(1)}% below planned · 30-day horizon
          </div>
        </KpiCard>

        <KpiCard label="Space Intelligence" source="Synthetic EO" sourceColor="var(--purple)"
          onClick={() => onNavigate('satellite')} aria-label="View Space Intelligence">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
            <StatRowInline label="EO targets" value={eoStats ? `${eoStats.surface_targets} flagged` : '—'}
              valueColor="var(--purple)" />
            <StatRowInline label="Mean EO signal" value={eoStats ? `${(eoStats.mean_mineralisation * 100).toFixed(1)}%` : '—'}
              valueColor="var(--accent)" />
            <StatRowInline label="Data" value="Simulated DEMO-01" />
          </div>
        </KpiCard>
      </div>

      {/* ── NUDGE CTA ── */}
      <NudgeCta nudge={n} onNavigate={onNavigate} />
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */

function EvidenceBlock({ icon, label, color, lines, note, highlight }) {
  return (
    <div className="evidence-flow__block"
      style={{ background: highlight ? 'rgba(217,119,6,.04)' : 'transparent' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
        <span style={{ fontSize: '0.95rem' }}>{icon}</span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', color }}>{label}</span>
      </div>
      {lines.map(l => (
        <div key={l} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)',
          lineHeight: 1.6 }}>{l}</div>
      ))}
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic',
        marginTop: 6 }}>{note}</div>
    </div>
  )
}

function KpiCard({ label, source, sourceColor, borderColor, onClick, children, 'aria-label': ariaLabel }) {
  return (
    <div className="card" onClick={onClick}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? (ariaLabel ?? `View ${label}`) : undefined}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        borderColor: borderColor ?? 'var(--border)',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={ev => onClick && (ev.currentTarget.style.borderColor = sourceColor)}
      onMouseLeave={ev => onClick && (ev.currentTarget.style.borderColor = borderColor ?? 'var(--border)')}
    >
      <div className="flex-between mb-sm">
        <span className="metric-label">{label}</span>
        <span className="source-chip" style={{ color: sourceColor,
          background: `${sourceColor}18`, border: `1px solid ${sourceColor}30` }}>
          {source}
        </span>
      </div>
      {children}
    </div>
  )
}

function StatRowInline({ label, value, valueColor }) {
  return (
    <div className="flex-between" style={{ fontSize: '0.78rem' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: valueColor ?? 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  )
}

function NudgeCta({ nudge: n, onNavigate }) {
  if (!n?.action_name) return null
  return (
    <div role="button" aria-label="View Decision Engine recommendation"
      onClick={() => onNavigate('nudge')}
      style={{
        background: 'rgba(217,119,6,.05)',
        border: '1px solid rgba(217,119,6,.3)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--gap-md) var(--gap-lg)',
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--gap-lg)',
        flexWrap: 'wrap',
      }}
      onMouseEnter={ev => {
        ev.currentTarget.style.background = 'rgba(217,119,6,.09)'
        ev.currentTarget.style.borderColor = 'rgba(217,119,6,.5)'
      }}
      onMouseLeave={ev => {
        ev.currentTarget.style.background = 'rgba(217,119,6,.05)'
        ev.currentTarget.style.borderColor = 'rgba(217,119,6,.3)'
      }}
    >
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: 5 }}>
          ⚡ Decision Engine — Recommended Action
        </div>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 3 }}>{n.action_name}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Derived from integrated spatial, geological and operational intelligence
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-md)', flexWrap: 'wrap' }}>
        <NudgeStat label="Current" value={`${Number(n.baseline_value).toFixed(2)} m/day`} />
        <span style={{ color: 'var(--primary)', fontSize: '1rem' }}>→</span>
        <NudgeStat label="Recommended" value={`${Number(n.recommended_value).toFixed(2)} m/day`} color="var(--primary)" />
        <div style={{ width: 1, height: 32, background: 'var(--border)' }} />
        <NudgeStat label="Production gain" value={`+${fmtT(n.expected_production_gain_t)} t`} color="var(--green)" />
        <NudgeStat label="Shortfall reduction" value={`−${fmtT(n.expected_shortfall_reduction_t)} t`} color="var(--green)" />
      </div>

      <span style={{ color: 'var(--primary)', fontSize: '1.1rem', flexShrink: 0 }}>→</span>
    </div>
  )
}

function NudgeStat({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: '0.88rem',
        color: color ?? 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  )
}
