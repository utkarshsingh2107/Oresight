/**
 * PulseView — Production Forecast
 * All values from /api/pulse + /api/risk + /api/shap
 */
import React from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { fmtT, fmtPct, featureLabel } from '../utils/labels.js'

const RISK_COLOR = {
  LOW:'var(--risk-low)', MEDIUM:'var(--risk-medium)',
  HIGH:'var(--risk-high)', CRITICAL:'var(--risk-critical)',
}
const EXCLUDE = new Set(['planned_t'])
const MAX_DRIVERS = 6

const fmtDate = d => { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth()+1}` }

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="card" style={{ padding:'10px 14px', fontSize:'0.78rem', minWidth:180 }}>
      <div style={{ fontWeight:700, marginBottom:6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color:p.color, marginBottom:2 }}>
          {p.name}: {p.value?.toLocaleString(undefined,{maximumFractionDigits:0})} t
        </div>
      ))}
    </div>
  )
}

export default function PulseView({ pulse, risk, shap }) {
  if (!pulse?.forecast || !risk || !shap) return null

  const fs  = pulse.summary?.forecast_summary ?? {}
  const vm  = pulse.summary?.validation_metrics?.P50 ?? {}
  const fp  = pulse.summary?.forecast_period ?? {}
  const rl  = risk.risk_level ?? 'CRITICAL'
  const rc  = RISK_COLOR[rl] ?? 'var(--risk-critical)'

  const planned  = fs.total_planned_production_t  ?? 0
  const expected = fs.total_expected_production_t ?? 0
  const shortfall= fs.total_expected_shortfall_t  ?? 0
  const prob     = fs.overall_shortfall_probability ?? 0
  const p10      = fs.total_p10_production_t ?? 0
  const p90      = fs.total_p90_production_t ?? 0

  const chartData = pulse.forecast.map(r => ({
    date: fmtDate(r.date), planned:r.planned_production_t,
    p10:r.p10_t, p50:r.p50_t, p90:r.p90_t,
  }))

  const drivers = shap.drivers.filter(d => !EXCLUDE.has(d.feature)).slice(0, MAX_DRIVERS)
  const maxShap = drivers[0]?.mean_absolute_shap ?? 1

  return (
    <div className="stage-view">

      {/* Header */}
      <div className="stage-header">
        <div className="stage-tag" style={{ color:'var(--yellow)' }}>📈 Production Forecast</div>
        <h2>What can we realistically produce?</h2>
        <p>
          LightGBM quantile regression trained on 3 years of operational data.
          P10 / P50 / P90 uncertainty bands over a 30-day horizon.
        </p>
      </div>

      {/* ── Forecast chart ── */}
      <div className="card mb-lg">
        <div className="flex-between mb-md" style={{ flexWrap:'wrap', gap:'var(--gap-sm)' }}>
          <div>
            <h3>30-Day Production Forecast</h3>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>
              {fp.start} → {fp.end}
            </div>
          </div>
          <div style={{ display:'flex', gap:'var(--gap-md)', flexWrap:'wrap' }}>
            <Legend color="var(--yellow)" dash label="Planned" />
            <Legend color="rgba(147,204,255,.3)" fill label="P10–P90 band" />
            <Legend color="var(--accent)" label="P50 expected" />
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={chartData} margin={{ top:4, right:12, bottom:0, left:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
            <XAxis dataKey="date" tick={{ fill:'#8b949e', fontSize:10 }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fill:'#8b949e', fontSize:10 }} axisLine={false} tickLine={false}
              tickFormatter={v=>v.toLocaleString()} width={56} />
            <Tooltip content={<ChartTooltip/>} />
            <Area dataKey="p90" stroke="none" fill="rgba(147,204,255,.1)" fillOpacity={1} legendType="none" name="P90 band" />
            <Area dataKey="p10" stroke="none" fill="var(--bg-page)" fillOpacity={1} legendType="none" name="P10 band" />
            <Line dataKey="planned" name="Planned" stroke="var(--yellow)" strokeDasharray="6 3" strokeWidth={1.5} dot={false} />
            <Line dataKey="p10" name="P10 (pessimistic)" stroke="var(--accent)" strokeOpacity={0.35} strokeWidth={1} dot={false} />
            <Line dataKey="p50" name="P50 (expected)" stroke="var(--accent)" strokeWidth={2.5} dot={false} activeDot={{ r:4 }} />
            <Line dataKey="p90" name="P90 (optimistic)" stroke="var(--green)" strokeOpacity={0.4} strokeWidth={1} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>

        {/* P10 / P50 / P90 scenario strip */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4,
          marginTop:'var(--gap-md)', paddingTop:'var(--gap-md)',
          borderTop:'1px solid var(--border-light)' }}>
          <ScenCard label="P10 — Pessimistic" value={`${(p10/1e3).toFixed(1)} kt`}
            sub="Lower bound" color="rgba(147,204,255,.5)" />
          <ScenCard label="P50 — Expected" value={`${(expected/1e3).toFixed(1)} kt`}
            sub="Median forecast" color="var(--accent)" bold />
          <ScenCard label="P90 — Optimistic" value={`${(p90/1e3).toFixed(1)} kt`}
            sub="Upper bound" color="var(--green)" />
        </div>
      </div>

      {/* ── Shortfall panel ── */}
      <div className="grid-2 mb-lg">

        {/* Production vs target */}
        <div className="card">
          <h3 className="mb-md">Production vs Target</h3>
          {[
            { label:'Planned target',    value:planned,  color:'var(--border)',         tc:'var(--text-secondary)' },
            { label:'P90 optimistic',    value:p90,      color:'var(--green)' },
            { label:'P50 expected',      value:expected, color:'var(--accent)',          bold:true },
            { label:'P10 pessimistic',   value:p10,      color:'rgba(147,204,255,.4)' },
          ].map(({ label, value, color, tc, bold }) => (
            <div key={label} style={{ marginBottom:10 }}>
              <div className="flex-between" style={{ marginBottom:3 }}>
                <span style={{ fontSize:'0.82rem', fontWeight:bold?700:400,
                  color:tc??(bold?'var(--text-primary)':'var(--text-secondary)') }}>{label}</span>
                <span style={{ fontSize:'0.85rem', fontWeight:bold?700:600,
                  color:tc??color, fontVariantNumeric:'tabular-nums' }}>
                  {value.toLocaleString(undefined,{maximumFractionDigits:0})} t
                </span>
              </div>
              <div className="progress-bar-track" style={{ height: bold?7:4 }}>
                <div className="progress-bar-fill"
                  style={{ width:`${Math.min((value/planned)*100,100)}%`, background:color }}/>
              </div>
            </div>
          ))}
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:'var(--gap-md)',
            marginTop:'var(--gap-sm)' }}>
            <div className="flex-between" style={{ marginBottom:3 }}>
              <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>Expected shortfall</span>
              <span style={{ fontWeight:700, color:'var(--risk-high)', fontSize:'1.05rem',
                fontVariantNumeric:'tabular-nums' }}>−{fmtT(shortfall)} t</span>
            </div>
            <div className="flex-between">
              <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>As % of planned</span>
              <span style={{ fontWeight:600, color:'var(--risk-high)' }}>
                {((shortfall/planned)*100).toFixed(1)}% below target
              </span>
            </div>
          </div>
        </div>

        {/* Shortfall risk */}
        <div className="card" style={{ borderColor:rc }}>
          <h3 className="mb-md">Shortfall Risk</h3>
          <div style={{ textAlign:'center', padding:'var(--gap-md) 0' }}>
            <div style={{ fontSize:'3rem', fontWeight:700, lineHeight:1, color:rc,
              letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums' }}>
              {fmtPct(prob)}
            </div>
            <div style={{ color:'var(--text-secondary)', marginTop:6, fontSize:'0.85rem' }}>
              probability of missing the production target
            </div>
            <div style={{ marginTop:10 }}>
              <span className={`badge badge--${rl.toLowerCase()}`}
                style={{ fontSize:'0.82rem', padding:'3px 12px' }}>{rl}</span>
            </div>
          </div>
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:'var(--gap-md)',
            fontSize:'0.75rem', color:'var(--text-muted)' }}>
            {pulse.summary?.model} · 30 days · P50 MAPE: {vm.MAPE?.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* ── SHAP attribution ── */}
      <div className="card">
        <div className="mb-md">
          <h3>What factors influence production uncertainty?</h3>
          <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:4 }}>
            Contextual factors include weather and terrain; actionable factors are within operational control.
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--gap-sm)' }}>
          {drivers.map(d => {
            const lbl = featureLabel(d.feature)
            if (!lbl) return null
            const isAction = d.driver_type === 'ACTIONABLE'
            return (
              <div key={d.feature} style={{ display:'flex', alignItems:'center',
                gap:'var(--gap-md)' }}>
                <div style={{ width:180, flexShrink:0 }}>
                  <span style={{ fontSize:'0.82rem', fontWeight:isAction?600:400 }}>{lbl}</span>
                </div>
                <div className="progress-bar-track" style={{ flex:1, height:8 }}>
                  <div className="progress-bar-fill" style={{
                    width:`${(d.mean_absolute_shap/maxShap)*100}%`,
                    background: isAction ? 'var(--accent)' : 'var(--purple)',
                  }}/>
                </div>
                <div style={{ width:50, textAlign:'right', fontSize:'0.75rem',
                  color:'var(--text-muted)', fontVariantNumeric:'tabular-nums' }}>
                  {d.mean_absolute_shap.toFixed(1)}
                </div>
                <span className={`pill pill--${isAction?'actionable':'contextual'}`}
                  style={{ flexShrink:0 }}>
                  {isAction ? 'Actionable' : 'Contextual'}
                </span>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop:'var(--gap-md)', fontSize:'0.72rem', color:'var(--text-muted)',
          fontStyle:'italic' }}>
          Model attribution signals — not proof of causality.
          Blue = actionable · Purple = contextual.
        </div>
      </div>
    </div>
  )
}

function Legend({ color, label, dash, fill }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
      <div style={{ width:dash?16:9, height:dash?2:9,
        background:color, borderRadius:dash?1:'50%', opacity:fill?.6:1 }}/>
      <span style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{label}</span>
    </div>
  )
}

function ScenCard({ label, value, sub, color, bold }) {
  return (
    <div style={{ textAlign:'center', padding:'8px 4px' }}>
      <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginBottom:3 }}>{label}</div>
      <div style={{ fontWeight:bold?800:600, color, fontSize:bold?'1.05rem':'0.9rem',
        fontVariantNumeric:'tabular-nums' }}>{value}</div>
      <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{sub}</div>
    </div>
  )
}
