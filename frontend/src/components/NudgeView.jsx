/**
 * NudgeView — Decision Engine
 * All values from /api/nudge + /api/nudge/candidates
 */
import React from 'react'
import { fmtT, fmtPct, formatFeatureValue } from '../utils/labels.js'

export default function NudgeView({ nudge, nudgeCands }) {
  if (!nudge?.best_action) return null

  const ba    = nudge.best_action
  const base  = nudge.baseline
  const cands = nudgeCands?.candidates ?? []

  const beforeProd     = base?.expected_production_t  ?? 0
  const beforeShortfall= base?.expected_shortfall_t   ?? 0
  const beforeProb     = base?.shortfall_probability  ?? 0
  const afterShortfall = ba.new_expected_shortfall_t  ?? 0
  const afterProb      = ba.new_shortfall_probability ?? 0
  const afterProd      = beforeProd + ba.expected_production_gain_t

  return (
    <div className="stage-view">

      {/* Header */}
      <div className="stage-header">
        <div className="stage-tag" style={{ color:'var(--primary)' }}>⚡ Decision Engine</div>
        <h2>What should we do?</h2>
        <p>
          {nudge.optimization?.candidates_evaluated ?? cands.length} feasible interventions evaluated.
          The best action is selected by maximising expected shortfall reduction.
        </p>
      </div>

      {/* OBSERVE → INTERPRET → PREDICT → DECIDE */}
      <div className="pipeline-flow mb-lg">
        {[
          { phase:'OBSERVE',   icon:'🛰', label:'Earth Observation',  sub:'Satellite / EO',         color:'var(--purple)' },
          { phase:'INTERPRET', icon:'⛏', label:'Resource Mapping',    sub:'Geology + Kriging',      color:'var(--accent)' },
          { phase:'PREDICT',   icon:'📈', label:'Production Forecast', sub:'LightGBM + uncertainty', color:'var(--yellow)' },
          { phase:'DECIDE',    icon:'⚡', label:'Decision Engine',      sub:'MILP / NUDGE',           color:'var(--primary)' },
        ].map(s => (
          <div key={s.phase} className="pipeline-flow__step">
            <div className="pipeline-flow__phase" style={{ color:s.color }}>{s.phase}</div>
            <div className="pipeline-flow__icon">{s.icon}</div>
            <div className="pipeline-flow__title">{s.label}</div>
            <div className="pipeline-flow__sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Before / after */}
      <div className="card card--highlight mb-lg" style={{ borderWidth:2 }}>
        <div className="section-label mb-md">Modelled Impact</div>
        <div className="before-after">
          <div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:700,
              textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'var(--gap-sm)' }}>
              Current forecast
            </div>
            <ImpRow label="Expected production"  value={`${fmtT(beforeProd)} t`} />
            <ImpRow label="Expected shortfall"   value={`${fmtT(beforeShortfall)} t`} color="var(--risk-high)" />
            <ImpRow label="Shortfall probability" value={fmtPct(beforeProb)} color="var(--risk-critical)" />
          </div>

          <div className="arrow-col">↓</div>

          <div>
            <div style={{ fontSize:'0.72rem', color:'var(--green)', fontWeight:700,
              textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'var(--gap-sm)' }}>
              After intervention
            </div>
            <ImpRow label="Expected production"  value={`${fmtT(afterProd)} t`} color="var(--green)" />
            <ImpRow label="Expected shortfall"   value={`${fmtT(afterShortfall)} t`} color="var(--green)" />
            <ImpRow label="Shortfall probability" value={fmtPct(afterProb)} color="var(--yellow)" />
          </div>
        </div>
        <div style={{ marginTop:'var(--gap-md)', background:'rgba(74,225,118,.08)',
          border:'1px solid rgba(74,225,118,.2)', borderRadius:'var(--radius-sm)',
          padding:'9px 14px', textAlign:'center' }}>
          <span style={{ fontWeight:700, color:'var(--green)', fontSize:'1rem',
            fontVariantNumeric:'tabular-nums' }}>
            +{fmtT(ba.expected_production_gain_t)} t production gain
          </span>
          <span style={{ color:'var(--text-muted)', margin:'0 12px' }}>·</span>
          <span style={{ fontWeight:700, color:'var(--green)', fontSize:'1rem',
            fontVariantNumeric:'tabular-nums' }}>
            −{fmtT(ba.expected_shortfall_reduction_t)} t shortfall reduction
          </span>
        </div>
        <div style={{ textAlign:'center', marginTop:6, fontSize:'0.7rem',
          color:'var(--text-muted)', fontStyle:'italic' }}>
          Modelled counterfactual impact — not an observed real-world result.
        </div>
      </div>

      {/* Best action hero */}
      <div style={{ background:'rgba(217,119,6,.06)', border:'2px solid var(--primary-dim)',
        borderRadius:'var(--radius-lg)', padding:'var(--gap-lg)', marginBottom:'var(--gap-lg)' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between',
          gap:'var(--gap-md)', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:240 }}>
            <div style={{ fontSize:'0.62rem', color:'var(--primary)', fontWeight:700,
              textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>
              ★ Recommended action
            </div>
            <h2 style={{ marginBottom:8 }}>{ba.action_name}</h2>
            {ba.rationale && (
              <p style={{ color:'var(--text-secondary)', fontSize:'0.85rem', lineHeight:1.6 }}>
                {ba.rationale}
              </p>
            )}
          </div>
          <div style={{ display:'flex', gap:'var(--gap-lg)', flexShrink:0 }}>
            <IntStat label="Current"     value={formatFeatureValue(ba.feature, ba.baseline_value)}
              sub={unitHint(ba.feature)} />
            <div style={{ display:'flex', alignItems:'center', fontSize:'1.4rem',
              color:'var(--primary)' }}>→</div>
            <IntStat label="Recommended" value={formatFeatureValue(ba.feature, ba.recommended_value)}
              sub="target value" accent="var(--green)" />
          </div>
        </div>
      </div>

      {/* Ranked candidates */}
      <div className="mb-md">
        <h3 style={{ marginBottom:'var(--gap-md)' }}>
          All Evaluated Interventions
          <span style={{ marginLeft:8, fontSize:'0.78rem', fontWeight:400,
            color:'var(--text-secondary)' }}>
            Ranked by expected shortfall reduction
          </span>
        </h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--gap-sm)' }}>
          {cands.map((c, i) => <CandCard key={c.rank} c={c} isBest={i===0} />)}
        </div>
        <div style={{ marginTop:'var(--gap-md)', fontSize:'0.75rem', color:'var(--text-muted)' }}>
          All {cands.length} candidates are feasible within historical operational bounds.
          Evaluated using PULSE model as response surface.
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ background:'rgba(147,204,255,.04)', border:'1px solid var(--border-light)',
        borderRadius:'var(--radius-md)', padding:'var(--gap-md)' }}>
        <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.7 }}>
          <strong style={{ color:'var(--text-primary)' }}>Decision support only.</strong>{' '}
          Decision derived from integrated spatial, geological and operational intelligence.
          Final operational decisions remain with the mine manager.
          Results are based on synthetic DEMO-01 data.
        </p>
      </div>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */

function ImpRow({ label, value, color }) {
  return (
    <div className="flex-between" style={{ marginBottom:6 }}>
      <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight:700, color:color??'var(--text-primary)', fontSize:'0.92rem',
        fontVariantNumeric:'tabular-nums' }}>{value}</span>
    </div>
  )
}

function IntStat({ label, value, sub, accent }) {
  return (
    <div style={{ textAlign:'center', minWidth:80 }}>
      <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:'1.35rem', fontWeight:800, lineHeight:1,
        color:accent??'var(--text-primary)', fontVariantNumeric:'tabular-nums' }}>{value}</div>
      <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginTop:2 }}>{sub}</div>
    </div>
  )
}

function CandCard({ c, isBest }) {
  const barW = Math.min((c.shortfall_reduction_t / 700) * 100, 100)
  return (
    <div className={`candidate-card${isBest?' candidate-card--best':''}`}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:'var(--gap-md)', flexWrap:'wrap' }}>
        {/* Rank badge */}
        <div style={{ width:30, height:30, borderRadius:'50%', flexShrink:0,
          background: isBest ? 'var(--primary-dim)' : 'var(--bg-card)',
          border:`2px solid ${isBest?'var(--primary)':'var(--border)'}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:800, fontSize:'0.88rem',
          color: isBest ? '#0f141b' : 'var(--text-secondary)' }}>
          #{c.rank}
        </div>
        {/* Action name */}
        <div style={{ flex:1, minWidth:180 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
            <span style={{ fontWeight:isBest?700:600, fontSize:'0.92rem' }}>{c.action_name}</span>
            {isBest && (
              <span className="badge badge--amber">RECOMMENDED</span>
            )}
            <span className="badge badge--feasible" style={{ marginLeft:'auto' }}>Feasible</span>
          </div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>
            {formatFeatureValue(c.feature, c.baseline_value)} → {formatFeatureValue(c.feature, c.recommended_value)}
          </div>
        </div>
        {/* Impact numbers */}
        <div style={{ display:'flex', gap:'var(--gap-lg)', flexShrink:0 }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Gain</div>
            <div style={{ fontWeight:700, color:'var(--green)', fontVariantNumeric:'tabular-nums' }}>
              +{fmtT(c.production_gain_t)} t
            </div>
          </div>
          <div style={{ textAlign:'right', minWidth:90 }}>
            <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Shortfall ↓</div>
            <div style={{ fontWeight:700, color:'var(--green)', fontVariantNumeric:'tabular-nums' }}>
              −{fmtT(c.shortfall_reduction_t)} t
            </div>
          </div>
        </div>
      </div>
      <div className="progress-bar-track" style={{ height:3, marginTop:6 }}>
        <div className="progress-bar-fill" style={{
          width:`${barW}%`,
          background: isBest ? 'var(--primary)' : 'var(--green)',
        }}/>
      </div>
    </div>
  )
}

function unitHint(feature) {
  return { fleet_availability:'daily fleet availability', fleet_downtime_h:'downtime per day',
    development_m:'advance per day', available_workers:'headcount on shift' }[feature] ?? 'current value'
}
