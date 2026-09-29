import React from 'react'
import { fmtT, fmtPct } from '../utils/labels.js'

const RISK_COLORS = {
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
  const rc = RISK_COLORS[rl] ?? 'var(--risk-critical)'

  return (
    <div className="stage-view">

      {/* ── Hero ── */}
      <div style={{ marginBottom: 'var(--gap-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: '1.3rem' }}>🛰</span>
          <h1 style={{ marginBottom: 0 }}>Space-Enabled Mine Intelligence</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: 720 }}>
          Integrates Earth-observation data, geological evidence and operational AI to identify
          resources, assess accessibility, forecast production and support mine decisions.
        </p>
      </div>

      {/* ── Evidence chain — ONE compact card ── */}
      <div className="card" style={{ marginBottom: 'var(--gap-lg)', background: 'var(--bg-card-alt)' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>

          {/* Space intelligence */}
          <div style={{
            flex: 1, padding: '12px 16px',
            borderRight: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: '1rem' }}>🛰</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--purple)' }}>
                SPACE INTELLIGENCE
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Satellite spectral indicators · Terrain / DEM · Spatial anomaly detection
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
              Provides surface spatial context
            </p>
          </div>

          {/* Plus / fusion operator */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px',
            color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 300 }}>
            +
          </div>

          {/* Geological validation */}
          <div style={{
            flex: 1, padding: '12px 16px',
            borderRight: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: '1rem' }}>⛏</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--green)' }}>
                GEOLOGICAL VALIDATION
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Boreholes · Assays · Kriging · 3D block model
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
              Subsurface reserve estimation
            </p>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px',
            color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            →
          </div>

          {/* Result */}
          <div style={{ flex: 1, padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: '1rem' }}>📦</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--orange)' }}>
                RESOURCE INTELLIGENCE
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Spatially modelled mineral resource · Accessible reserve · Production forecast
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
              Integrated evidence output
            </p>
          </div>
        </div>

        {/* Disclaimer line */}
        <div style={{
          marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-light)',
          fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic',
        }}>
          Satellite observations provide surface indicators and spatial context only —
          subsurface reserve estimation is supported by borehole and assay data.
        </div>
      </div>

      {/* ── 6 KPI metrics ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        gap: 'var(--gap-md)', marginBottom: 'var(--gap-lg)',
      }}>

        {/* Geological resource */}
        <KpiCard
          label="Geological Resource"
          source="Spatial Model"
          sourceColor="var(--accent)"
          onClick={() => onNavigate('prism')}
        >
          <BigVal value={`${(p.declared_reserve_t / 1e6).toFixed(2)} Mt`} color="var(--accent)" />
          <SubVal text={`${p.ore_blocks} mineralised blocks · avg Mn ${p.average_mn_pct}%`} />
        </KpiCard>

        {/* Accessible resource */}
        <KpiCard
          label="Accessible Resource"
          source="EAR Analysis"
          sourceColor="var(--green)"
          onClick={() => onNavigate('ear')}
        >
          <BigVal value={`${(e.effective_accessible_reserve_t / 1e6).toFixed(2)} Mt`} color="var(--green)" />
          <div style={{ marginTop: 6 }}>
            <div style={{ background: 'var(--border)', borderRadius: 3, height: 5, overflow: 'hidden' }}>
              <div style={{
                width: `${(e.accessibility_ratio * 100).toFixed(1)}%`,
                height: '100%', background: 'var(--green)', borderRadius: 3,
              }} />
            </div>
            <SubVal text={`${(e.accessibility_ratio * 100).toFixed(1)}% of modelled resource accessible`} />
          </div>
        </KpiCard>

        {/* Shortfall risk */}
        <KpiCard
          label="Shortfall Risk"
          source="SHAP Attribution"
          sourceColor={rc}
          borderColor={rc}
          onClick={() => onNavigate('pulse')}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <BigVal value={fmtPct(pu.shortfall_probability)} color={rc} />
            <span className={`badge badge--${rl.toLowerCase()}`} style={{ fontSize: '0.75rem', padding: '2px 9px' }}>
              {rl}
            </span>
          </div>
          <SubVal text="Probability of missing production target" />
        </KpiCard>

        {/* P50 forecast */}
        <KpiCard
          label="P50 Production Forecast"
          source="Forecast Model"
          sourceColor="var(--yellow)"
          onClick={() => onNavigate('pulse')}
        >
          <BigVal value={`${fmtT(pu.expected_production_t)} t`} color="var(--accent)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6 }}>
            <Row label="Planned target" value={`${fmtT(pu.planned_production_t)} t`} />
            <Row label="P10 pessimistic" value={`${fmtT(pu.p10_production_t)} t`} />
            <Row label="P90 optimistic" value={`${fmtT(pu.p90_production_t)} t`} />
          </div>
        </KpiCard>

        {/* Expected shortfall */}
        <KpiCard
          label="Expected Shortfall"
          source="Forecast Model"
          sourceColor="var(--risk-high)"
          borderColor="rgba(240,136,62,.3)"
          onClick={() => onNavigate('pulse')}
        >
          <BigVal value={`−${fmtT(pu.expected_shortfall_t)} t`} color="var(--risk-high)" />
          <SubVal text={`${((pu.expected_shortfall_t / pu.planned_production_t) * 100).toFixed(1)}% below planned target · 30-day horizon`} />
        </KpiCard>

        {/* Space intelligence summary */}
        <KpiCard
          label="Space Intelligence"
          source="Satellite / Synthetic EO"
          sourceColor="var(--purple)"
          onClick={() => onNavigate('satellite')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
            <Row label="EO anomaly targets"   value="5 flagged" color="var(--purple)" />
            <Row label="Mean mineralisation"  value="44.6%" color="var(--accent)" />
            <Row label="Integration-ready"    value="Sentinel-2 · Bhuvan" />
          </div>
          <SubVal text="Simulated EO — not real satellite imagery" italic />
        </KpiCard>
      </div>

      {/* ── NUDGE recommendation card ── */}
      <div
        onClick={() => onNavigate('nudge')}
        role="button"
        aria-label="View Decision Engine recommendation"
        style={{
          background: 'rgba(63,185,80,.04)', border: '1px solid rgba(63,185,80,.25)',
          borderRadius: 'var(--radius-md)', padding: 'var(--gap-md)',
          cursor: 'pointer', transition: 'background 0.15s',
        }}
        onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(63,185,80,.08)'}
        onMouseLeave={ev => ev.currentTarget.style.background = 'rgba(63,185,80,.04)'}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--gap-md)', flexWrap: 'wrap' }}>

          {/* Left — label + action name */}
          <div style={{ flex: 1, minWidth: 220 }}>
            <p style={{
              fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.07em', color: 'var(--green)', marginBottom: 4,
            }}>
              ⚡ Decision Engine — Recommended Action
            </p>
            <p style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
              {n.action_name}
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Derived from integrated spatial, geological and operational intelligence
            </p>
          </div>

          {/* Right — before/after + impact */}
          <div style={{ display: 'flex', gap: 'var(--gap-lg)', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
            <NudgeStat label="Current" value={`${n.baseline_value?.toFixed(2)} m/day`} />
            <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>→</div>
            <NudgeStat label="Recommended" value={`${n.recommended_value?.toFixed(2)} m/day`} accent="var(--green)" />
            <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
            <NudgeStat label="Production gain" value={`+${fmtT(n.expected_production_gain_t)} t`} accent="var(--green)" />
            <NudgeStat label="Shortfall reduction" value={`−${fmtT(n.expected_shortfall_reduction_t)} t`} accent="var(--green)" />
          </div>

          <div style={{ color: 'var(--green)', fontSize: '1.3rem', alignSelf: 'center', flexShrink: 0 }}>→</div>
        </div>
      </div>
    </div>
  )
}

/* ── small helpers ────────────────────────────────────────────── */

function KpiCard({ label, source, sourceColor, borderColor, onClick, children }) {
  return (
    <div
      className="card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        borderColor: borderColor ?? 'var(--border)',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={ev => onClick && (ev.currentTarget.style.borderColor = sourceColor)}
      onMouseLeave={ev => onClick && (ev.currentTarget.style.borderColor = borderColor ?? 'var(--border)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
          {label}
        </span>
        <span style={{
          fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.04em', color: sourceColor,
          background: `${sourceColor}15`, padding: '2px 6px', borderRadius: 8,
        }}>
          {source}
        </span>
      </div>
      {children}
    </div>
  )
}

function BigVal({ value, color }) {
  return (
    <p style={{ fontWeight: 800, fontSize: '1.55rem', color: color ?? 'var(--text-primary)', lineHeight: 1, marginBottom: 4 }}>
      {value}
    </p>
  )
}

function SubVal({ text, italic }) {
  return (
    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4,
      fontStyle: italic ? 'italic' : 'normal', lineHeight: 1.4 }}>
      {text}
    </p>
  )
}

function Row({ label, value, color }) {
  return (
    <div className="flex-between" style={{ fontSize: '0.78rem' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: color ?? 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

function NudgeStat({ label, value, accent }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 80 }}>
      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 3 }}>{label}</p>
      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: accent ?? 'var(--text-primary)' }}>{value}</p>
    </div>
  )
}
