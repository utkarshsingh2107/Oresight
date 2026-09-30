import React, { useEffect, useState } from 'react'
import { fmtT, fmtPct } from '../utils/labels.js'
import { getSatellite } from '../services/api.js'

/* Stitch semantic risk colours (updated palette) */
const RISK_COLORS = {
  LOW:      'var(--risk-low)',
  MEDIUM:   'var(--risk-medium)',
  HIGH:     'var(--risk-high)',
  CRITICAL: 'var(--risk-critical)',
}

export default function OverviewPanel({ overview, onNavigate }) {
  if (!overview) return null

  const p  = overview.prism
  const e  = overview.ear
  const pu = overview.pulse
  const rl = overview.risk_level
  const n  = overview.nudge
  const rc = RISK_COLORS[rl] ?? 'var(--risk-critical)'

  // Lazy-load satellite summary for the Space Intelligence KPI card
  const [eoStats, setEoStats] = useState(null)
  useEffect(() => {
    getSatellite()
      .then(s => setEoStats(s))
      .catch(() => setEoStats(null))
  }, [])

  return (
    <div className="stage-view">

      {/* ── Hero ── */}
      <div style={{ marginBottom: 'var(--gap-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: '1.2rem' }}>🛰</span>
          <h1 style={{ marginBottom: 0 }}>Space-Enabled Mine Intelligence</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: 680, lineHeight: 1.65 }}>
          Integrates Earth-observation data, geological evidence and operational AI to identify
          resources, assess accessibility, forecast production and support mine decisions.
        </p>
      </div>

      {/* ── Evidence chain — compact single card ── */}
      <div className="card" style={{ marginBottom: 'var(--gap-lg)', background: 'var(--bg-card-alt)' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap' }}>

          <EvidenceBlock
            icon="🛰" label="SPACE INTELLIGENCE" color="var(--purple)"
            desc="Satellite spectral indicators · Terrain / DEM · Spatial anomaly detection"
            note="Surface spatial context"
          />

          <ChainOp op="+" />

          <EvidenceBlock
            icon="⛏" label="GEOLOGICAL VALIDATION" color="var(--green)"
            desc="Boreholes · Assays · Kriging · 3D block model"
            note="Subsurface grade evidence"
          />

          <ChainOp op="→" />

          <EvidenceBlock
            icon="📦" label="RESOURCE INTELLIGENCE" color="var(--primary)"
            desc="Spatially modelled mineral resource · Accessible reserve · Production forecast"
            note="Integrated output"
            highlight
          />
        </div>
        <p style={{
          marginTop: 10, paddingTop: 8,
          borderTop: '1px solid var(--border-light)',
          fontSize: '0.68rem', color: 'var(--text-muted)',
          textAlign: 'center', fontStyle: 'italic',
        }}>
          Satellite observations provide surface indicators and spatial context only —
          subsurface resource estimation is supported by borehole and assay data.
        </p>
      </div>

      {/* ── 6 KPI cards — Stitch Command KPI Metric Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--gap-md)',
        marginBottom: 'var(--gap-lg)',
      }}>

        {/* Geological resource */}
        <KpiCard
          label="Geological Resource"
          source="Borehole + Kriging"
          sourceColor="var(--accent)"
          onClick={() => onNavigate('prism')}
        >
          <MetricValue value={`${(p.declared_reserve_t / 1e6).toFixed(2)} Mt`} color="var(--accent)" />
          <MetricSub text={`${p.ore_blocks} mineralised blocks · avg Mn ${p.average_mn_pct}%`} />
        </KpiCard>

        {/* Accessible resource */}
        <KpiCard
          label="Accessible Resource"
          source="EAR Analysis"
          sourceColor="var(--green)"
          onClick={() => onNavigate('ear')}
        >
          <MetricValue value={`${(e.effective_accessible_reserve_t / 1e6).toFixed(2)} Mt`} color="var(--green)" />
          <div style={{ marginTop: 6 }}>
            <div style={{
              background: 'var(--border-light)',
              borderRadius: 2, height: 4, overflow: 'hidden',
            }}>
              <div style={{
                width: `${(e.accessibility_ratio * 100).toFixed(1)}%`,
                height: '100%',
                background: 'var(--green)',
                borderRadius: 2,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <MetricSub text={`${(e.accessibility_ratio * 100).toFixed(1)}% of modelled resource accessible`} />
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
            <MetricValue value={fmtPct(pu.shortfall_probability)} color={rc} />
            <span
              className={`badge badge--${rl.toLowerCase()}`}
              style={{ fontSize: '0.68rem', padding: '2px 7px' }}
            >
              {rl}
            </span>
          </div>
          <MetricSub text="Probability of missing production target" />
        </KpiCard>

        {/* P50 forecast */}
        <KpiCard
          label="P50 Production Forecast"
          source="Forecast Model"
          sourceColor="var(--yellow)"
          onClick={() => onNavigate('pulse')}
        >
          <MetricValue value={`${fmtT(pu.expected_production_t)} t`} color="var(--accent)" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 6 }}>
            <KpiRow label="Planned target"  value={`${fmtT(pu.planned_production_t)} t`} />
            <KpiRow label="P10 pessimistic" value={`${fmtT(pu.p10_production_t)} t`} />
            <KpiRow label="P90 optimistic"  value={`${fmtT(pu.p90_production_t)} t`} />
          </div>
        </KpiCard>

        {/* Expected shortfall */}
        <KpiCard
          label="Expected Shortfall"
          source="Forecast Model"
          sourceColor="var(--risk-high)"
          borderColor="rgba(255,183,125,.25)"
          onClick={() => onNavigate('pulse')}
        >
          <MetricValue value={`−${fmtT(pu.expected_shortfall_t)} t`} color="var(--risk-high)" />
          <MetricSub
            text={`${((pu.expected_shortfall_t / pu.planned_production_t) * 100).toFixed(1)}% below planned · 30-day horizon`}
          />
        </KpiCard>

        {/* Space intelligence summary */}
        <KpiCard
          label="Space Intelligence"
          source="Synthetic EO"
          sourceColor="var(--purple)"
          ariaLabel="View Space Intelligence"
          onClick={() => onNavigate('satellite')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
            <KpiRow label="EO anomaly targets"  value={eoStats ? `${eoStats.surface_targets} flagged` : '—'} color="var(--purple)" />
            <KpiRow label="Mean EO signal"       value={eoStats ? `${(eoStats.mean_mineralisation * 100).toFixed(1)}%` : '—'} color="var(--accent)" />
            <KpiRow label="Integration-ready"    value="Sentinel-2 · Bhuvan" />
          </div>
          <MetricSub text="Simulated EO — not real satellite imagery" italic />
        </KpiCard>
      </div>

      {/* ── NUDGE recommendation — Stitch primary amber CTA ── */}
      <div
        role="button"
        aria-label="View Decision Engine recommendation"
        onClick={() => onNavigate('nudge')}
        style={{
          background: 'rgba(217,119,6,.06)',
          border: '1px solid rgba(217,119,6,.3)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--gap-md)',
          cursor: 'pointer',
          transition: 'background 0.15s, border-color 0.15s',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--gap-md)',
          flexWrap: 'wrap',
        }}
        onMouseEnter={ev => {
          ev.currentTarget.style.background    = 'rgba(217,119,6,.11)'
          ev.currentTarget.style.borderColor   = 'rgba(217,119,6,.5)'
        }}
        onMouseLeave={ev => {
          ev.currentTarget.style.background    = 'rgba(217,119,6,.06)'
          ev.currentTarget.style.borderColor   = 'rgba(217,119,6,.3)'
        }}
      >
        {/* Action label + name */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{
            fontSize: '0.65rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.07em',
            color: 'var(--primary)', marginBottom: 5,
          }}>
            ⚡ Decision Engine — Recommended Action
          </p>
          <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: 4 }}>
            {n.action_name}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Derived from integrated spatial, geological and operational intelligence
          </p>
        </div>

        {/* Before → After + impact stats */}
        <div style={{
          display: 'flex', gap: 'var(--gap-md)',
          flexShrink: 0, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <NudgeStat label="Current"          value={`${Number(n.baseline_value).toFixed(2)} m/day`} />
          <span style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>→</span>
          <NudgeStat label="Recommended"      value={`${Number(n.recommended_value).toFixed(2)} m/day`} accent="var(--primary)" />
          <div style={{ width: 1, height: 36, background: 'var(--border)' }} />
          <NudgeStat label="Production gain"       value={`+${fmtT(n.expected_production_gain_t)} t`}       accent="var(--green)" />
          <NudgeStat label="Shortfall reduction"   value={`−${fmtT(n.expected_shortfall_reduction_t)} t`}   accent="var(--green)" />
        </div>

        <span style={{ color: 'var(--primary)', fontSize: '1.2rem', alignSelf: 'center', flexShrink: 0 }}>→</span>
      </div>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */

function EvidenceBlock({ icon, label, color, desc, note, highlight }) {
  return (
    <div style={{
      flex: 1, minWidth: 160, padding: '12px 14px',
      background: highlight ? `rgba(217,119,6,.05)` : 'transparent',
      borderRight: '1px solid var(--border-light)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
        <span style={{ fontSize: '0.95rem' }}>{icon}</span>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 5 }}>
        {desc}
      </p>
      <p style={{ fontSize: '0.67rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{note}</p>
    </div>
  )
}

function ChainOp({ op }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 10px', color: 'var(--text-muted)',
      fontWeight: 300, fontSize: '1.1rem', flexShrink: 0,
    }}>
      {op}
    </div>
  )
}

/* Stitch Command KPI Metric Card */
function KpiCard({ label, source, sourceColor, borderColor, ariaLabel, onClick, children }) {
  return (
    <div
      className="card"
      onClick={onClick}
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
      {/* Stitch KPI top row: micro-label + source badge */}
      <div className="flex-between" style={{ marginBottom: 8 }}>
        <span style={{
          fontSize: '0.65rem', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          color: 'var(--text-secondary)',
        }}>
          {label}
        </span>
        <SourceChip label={source} color={sourceColor} />
      </div>
      {children}
    </div>
  )
}

/* Stitch numeric-metric token */
function MetricValue({ value, color }) {
  return (
    <p style={{
      fontSize: '1.5rem', fontWeight: 700, lineHeight: 1,
      letterSpacing: '-0.02em',
      color: color ?? 'var(--text-primary)',
      marginBottom: 4,
      fontVariantNumeric: 'tabular-nums',
    }}>
      {value}
    </p>
  )
}

function MetricSub({ text, italic }) {
  return (
    <p style={{
      fontSize: '0.7rem', color: 'var(--text-muted)',
      marginTop: 4, lineHeight: 1.4,
      fontStyle: italic ? 'italic' : 'normal',
    }}>
      {text}
    </p>
  )
}

function KpiRow({ label, value, color }) {
  return (
    <div className="flex-between" style={{ fontSize: '0.75rem' }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: color ?? 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  )
}

/* Stitch Telemetry Advisory chip */
function SourceChip({ label, color }) {
  return (
    <span style={{
      fontSize: '0.58rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.05em',
      color, background: `${color}15`,
      border: `1px solid ${color}30`,
      padding: '2px 6px',
      borderRadius: 'var(--radius-sm)',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

function NudgeStat({ label, value, accent }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 80 }}>
      <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 3 }}>{label}</p>
      <p style={{
        fontWeight: 700, fontSize: '0.9rem',
        color: accent ?? 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </p>
    </div>
  )
}
