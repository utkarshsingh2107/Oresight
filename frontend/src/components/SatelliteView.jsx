/**
 * SatelliteView — Space Intelligence
 * OBSERVE → DETECT → PRIORITISE → VALIDATE → MODEL
 * All values from /api/satellite + /api/satellite/grid
 * Disclaimer: synthetic EO, not real satellite imagery.
 */
import React, { useEffect, useState } from 'react'
import { getSatellite, getSatelliteGrid } from '../services/api.js'

/* Colour helpers */
const scoreColor = v => v >= 0.65 ? 'var(--red)' : v >= 0.50 ? 'var(--primary)' : v >= 0.35 ? 'var(--yellow)' : 'var(--green)'

/* EO indicators — what + why per design.md */
const EO_INDICATORS = [
  { icon: '🔴', label: 'Iron Oxide Index',      key: 'iron_oxide_idx',
    what: 'Surface iron-oxide spectral signal',  why: 'Alteration / mineralisation proxy',  band: 'B11/B4' },
  { icon: '🟡', label: 'Clay Index',             key: 'clay_alter_idx',
    what: 'Clay-related spectral signal',        why: 'Surface alteration indicator',        band: 'B12/B11' },
  { icon: '🟢', label: 'NDVI',                   key: 'ndvi',
    what: 'Vegetation condition',                why: 'Surface / environmental context',     band: 'B8/B4' },
  { icon: '💧', label: 'NDWI / Moisture',        key: 'soil_moisture',
    what: 'Surface moisture signal',             why: 'Drainage / moisture context',         band: 'B3/B8' },
  { icon: '🌫', label: 'Surface Reflectance',    key: 'surface_reflectance',
    what: 'Broadband albedo response',           why: 'Bare soil / rock characterisation',   band: 'B2–B4' },
  { icon: '⛰',  label: 'Slope (DEM)',            key: 'slope_deg',
    what: 'Terrain steepness in degrees',        why: 'Terrain and accessibility context',   band: 'SRTM' },
  { icon: '🔵', label: 'Spectral Anomaly',       key: 'spectral_anomaly',
    what: 'Unusual multispectral response',      why: 'EO anomaly target detection',         band: 'Derived' },
  { icon: '⭐', label: 'EO Mineralisation Signal', key: 'mineralisation_score',
    what: 'Composite surface EO signal (0–1)',   why: 'Combined score for target ranking',   band: 'Derived',
    warning: 'Does not confirm subsurface ore — requires geological validation.' },
]

/* Layer toggle options */
const LAYERS = [
  { id: 'mineralisation_score', label: 'EO Anomaly',    icon: '⭐' },
  { id: 'iron_oxide_idx',       label: 'Iron Oxide',    icon: '🔴' },
  { id: 'clay_alter_idx',       label: 'Clay Index',    icon: '🟡' },
  { id: 'ndvi',                 label: 'Vegetation',    icon: '🟢' },
  { id: 'slope_deg',            label: 'Terrain',       icon: '⛰' },
  { id: 'spectral_anomaly',     label: 'Spectral',      icon: '🔵' },
]

/* SVG choropleth */
function EoMap({ grid, activeLayer }) {
  if (!grid?.length) return null
  const xs = [...new Set(grid.map(c => c.grid_x))].sort((a, b) => a - b)
  const ys = [...new Set(grid.map(c => c.grid_y))].sort((a, b) => b - a)
  const cellMap = {}
  grid.forEach(c => { cellMap[`${c.grid_x}_${c.grid_y}`] = c })
  const cellSz = Math.min(Math.floor(360 / xs.length), Math.floor(210 / ys.length), 22)
  const vals = grid.map(c => c[activeLayer] ?? 0)
  const vMin = Math.min(...vals), vMax = Math.max(...vals) + 1e-9
  const fill = (val) => {
    const t = (val - vMin) / (vMax - vMin)
    if (activeLayer === 'ndvi') return `rgb(${Math.round(30+t*60)},${Math.round(100+(1-t)*80)},30)`
    return `rgb(${Math.round(40+t*200)},${Math.round(180-t*120)},40)`
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={xs.length*cellSz+2} height={ys.length*cellSz+2} style={{ display:'block' }}
        role="img" aria-label="EO anomaly grid map">
        {ys.map((y, yi) => xs.map((x, xi) => {
          const cell = cellMap[`${x}_${y}`]
          if (!cell) return null
          const v = cell[activeLayer] ?? 0
          return (
            <g key={`${x}_${y}`}>
              <rect x={xi*cellSz+1} y={yi*cellSz+1} width={cellSz-1} height={cellSz-1}
                fill={fill(v)} opacity={0.72+(v-vMin)/(vMax-vMin)*0.28}>
                <title>Score: {cell.mineralisation_score?.toFixed(3)} · {activeLayer}: {v.toFixed(3)}</title>
              </rect>
              {cell.surface_target && cellSz>=12 && (
                <text x={xi*cellSz+cellSz/2} y={yi*cellSz+cellSz/2+4}
                  textAnchor="middle" fontSize={cellSz*0.6} fill="#fff"
                  style={{ pointerEvents:'none', fontWeight:'bold' }}>★</text>
              )}
            </g>
          )
        }))}
      </svg>
      <div style={{ display:'flex', gap:12, marginTop:6, flexWrap:'wrap',
        fontSize:'0.68rem', color:'var(--text-muted)' }}>
        <span>■ Low</span>
        <span style={{ color:'var(--yellow)' }}>■ Moderate</span>
        <span style={{ color:'var(--red)' }}>■ High anomaly</span>
        <span>★ Target</span>
      </div>
    </div>
  )
}

export default function SatelliteView() {
  const [summary, setSummary] = useState(null)
  const [grid,    setGrid]    = useState(null)
  const [active,  setActive]  = useState('mineralisation_score')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    Promise.all([getSatellite(), getSatelliteGrid()])
      .then(([s, g]) => { setSummary(s); setGrid(g.grid) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="stage-view"><p style={{ color:'var(--text-muted)', padding:40, textAlign:'center' }}>Loading Earth-observation data…</p></div>
  if (error)   return <div className="stage-view"><p style={{ color:'var(--red)', padding:20 }}>Could not load EO data: {error}</p></div>
  if (!summary) return null

  const stats   = summary.layer_statistics ?? {}
  const targets = summary.top_eo_targets   ?? []

  return (
    <div className="stage-view">

      {/* Header */}
      <div className="stage-header">
        <div className="stage-tag" style={{ color:'var(--purple)' }}>🛰 Space Intelligence</div>
        <h2>Where are the surface signals associated with mineralisation?</h2>
        <p>Earth-observation data identifies surface spectral and terrain anomalies.
          These targets are prioritised for validation using geological and borehole evidence.</p>
      </div>

      {/* Demo status bar */}
      <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:12,
        background:'rgba(188,140,255,.06)', border:'1px solid rgba(188,140,255,.25)',
        borderRadius:'var(--radius-sm)', padding:'7px 14px', fontSize:'0.75rem', marginBottom:'var(--gap-lg)' }}>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:7,height:7,borderRadius:'50%',background:'var(--yellow)',display:'inline-block' }}/>
          <strong style={{ color:'var(--yellow)' }}>DEMO EO DATA — DEMO-01</strong>
        </span>
        <span style={{ color:'var(--border)' }}>|</span>
        <span style={{ color:'var(--text-secondary)' }}>{summary.grid_cells} cells · 50 m grid · {summary.surface_targets} anomaly targets</span>
        <span style={{ color:'var(--border)' }}>|</span>
        <span style={{ color:'var(--text-muted)', fontStyle:'italic' }}>Integration-ready: Sentinel-2 · ISRO Bhuvan · Sentinel-1 · SRTM DEM</span>
      </div>

      {/* OBSERVE → DETECT → PRIORITISE → VALIDATE → MODEL */}
      <div style={{ display:'flex', alignItems:'stretch', overflowX:'auto',
        background:'var(--bg-card-alt)', border:'1px solid var(--border)',
        borderRadius:'var(--radius-md)', marginBottom:'var(--gap-lg)' }}>
        {[
          { icon:'🛰', label:'EO DATA',            sub:'Satellite imagery\n& terrain data' },
          { icon:'📡', label:'SURFACE INDICATORS', sub:'Spectral indices\n& DEM layers' },
          { icon:'🔍', label:'ANOMALY DETECTION',  sub:'Unusual surface\nresponses' },
          { icon:'🎯', label:'TARGET RANKING',     sub:'Locations ranked\nby EO signal' },
          { icon:'⛏',  label:'GEOLOGICAL VALIDATION', sub:'Boreholes + assays\nconfirm evidence' },
        ].map((s, i) => (
          <React.Fragment key={s.label}>
            {i > 0 && <div style={{ width:1, background:'var(--border-light)', flexShrink:0 }}/>}
            <div style={{ flex:1, padding:'12px 10px', textAlign:'center', minWidth:90 }}>
              <div style={{ fontSize:'1.1rem', marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontSize:'0.6rem', fontWeight:700, color:'var(--purple)',
                textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', whiteSpace:'pre-line',
                lineHeight:1.4 }}>{s.sub}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Two-column */}
      <div className="grid-2" style={{ gap:'var(--gap-lg)', alignItems:'start' }}>

        {/* LEFT — map + targets */}
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--gap-md)' }}>

          {/* Map card */}
          <div className="card">
            <div className="flex-between mb-sm">
              <div>
                <div style={{ fontWeight:600, fontSize:'0.9rem' }}>EO Anomaly Map</div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>
                  Surface signals from simulated Earth-observation indicators
                </div>
              </div>
              <span style={{ fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase',
                letterSpacing:'0.05em', color:'var(--yellow)', background:'rgba(245,158,11,.12)',
                border:'1px solid rgba(245,158,11,.25)', padding:'2px 7px', borderRadius:'var(--radius-sm)' }}>
                Demo EO
              </span>
            </div>

            {/* Layer toggles */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:'var(--gap-sm)' }}>
              {LAYERS.map(l => (
                <button key={l.id} onClick={() => setActive(l.id)} style={{
                  padding:'3px 9px', fontSize:'0.72rem', borderRadius:'var(--radius-sm)',
                  border: active===l.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: active===l.id ? 'rgba(147,204,255,.14)' : 'var(--bg-card-alt)',
                  color: active===l.id ? 'var(--accent)' : 'var(--text-secondary)',
                  fontWeight: active===l.id ? 700 : 400,
                }}>
                  {l.icon} {l.label}
                </button>
              ))}
            </div>

            <EoMap grid={grid} activeLayer={active} />
            <div style={{ marginTop:8, padding:'6px 10px', background:'rgba(188,140,255,.05)',
              borderRadius:'var(--radius-sm)', fontSize:'0.68rem', color:'var(--text-muted)' }}>
              Hover cells for values · ★ marks EO anomaly targets
            </div>
          </div>

          {/* Top EO targets */}
          <div className="card">
            <div style={{ marginBottom:'var(--gap-sm)' }}>
              <div style={{ fontWeight:600 }}>Top EO Anomaly Targets</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>
                Highest-ranked surface EO signals — for ground-truth investigation
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {targets.map(t => <TargetCard key={t.rank} t={t} />)}
            </div>
            <div className="disclaimer">
              EO signal scores represent relative surface anomaly strength — not confirmed mineralisation.
            </div>
          </div>
        </div>

        {/* RIGHT — indicators + transition */}
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--gap-md)' }}>

          {/* EO indicators */}
          <div className="card">
            <div className="flex-between mb-md">
              <div style={{ fontWeight:600 }}>EO Indicators</div>
              <span style={{ fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase',
                letterSpacing:'0.05em', color:'var(--purple)', background:'rgba(188,140,255,.12)',
                border:'1px solid rgba(188,140,255,.25)', padding:'2px 7px', borderRadius:'var(--radius-sm)' }}>
                Multispectral
              </span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {EO_INDICATORS.map(ind => <IndicatorCard key={ind.key} ind={ind} stats={stats} />)}
            </div>
          </div>

          {/* EO coverage stats */}
          <div className="card">
            <div style={{ fontWeight:600, marginBottom:'var(--gap-md)', fontSize:'0.88rem' }}>EO Coverage</div>
            <div className="grid-2" style={{ gap:12 }}>
              <Stat label="Grid cells"      value={summary.grid_cells} />
              <Stat label="Anomaly targets" value={summary.surface_targets} color="var(--primary)" />
              <Stat label="Mean EO signal"  value={`${(summary.mean_mineralisation*100).toFixed(1)}%`} color="var(--accent)" />
              <Stat label="Resolution"      value="50 m" />
            </div>
          </div>

          {/* → Resource Mapping transition */}
          <div style={{ background:'rgba(147,204,255,.05)', border:'1px solid rgba(147,204,255,.2)',
            borderRadius:'var(--radius-md)', padding:'var(--gap-md)' }}>
            <div style={{ fontSize:'0.62rem', fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.07em', color:'var(--accent)', marginBottom:6 }}>
              Next → Resource Mapping
            </div>
            <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6 }}>
              EO targets are combined with borehole and geological evidence to build the spatial resource model.
              Space Intelligence prioritises where to investigate; Resource Mapping determines what the evidence means.
            </p>
          </div>

          {/* Integration-ready */}
          <div className="card" style={{ borderColor:'rgba(188,140,255,.2)',
            background:'rgba(188,140,255,.03)' }}>
            <div style={{ fontWeight:600, color:'var(--purple)', marginBottom:'var(--gap-sm)',
              fontSize:'0.85rem' }}>Integration-Ready EO Sources</div>
            {(summary.integration_ready ?? []).map((src, i) => (
              <div key={i} style={{ display:'flex', gap:8, marginBottom:5 }}>
                <span style={{ color:'var(--purple)', fontSize:'0.78rem' }}>◎</span>
                <span style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>{src}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Sub-components ─────────────────────────────────────────── */

function TargetCard({ t }) {
  const sc = scoreColor(t.mineralisation_score)
  return (
    <div style={{ background:'var(--bg-card-alt)', border:`1px solid ${sc}40`,
      borderRadius:'var(--radius-sm)', padding:'10px 12px',
      display:'flex', alignItems:'flex-start', gap:10 }}>
      <div style={{ width:24, height:24, borderRadius:'50%', flexShrink:0,
        background:sc, display:'flex', alignItems:'center', justifyContent:'center',
        fontWeight:800, fontSize:'0.75rem', color:'#fff' }}>{t.rank}</div>
      <div style={{ flex:1 }}>
        <div className="flex-between" style={{ marginBottom:4, flexWrap:'wrap', gap:4 }}>
          <span style={{ fontWeight:700, fontSize:'0.8rem' }}>
            {t.latitude?.toFixed(4)}°N, {t.longitude?.toFixed(4)}°E
          </span>
          <span style={{ fontSize:'0.72rem', fontWeight:700, color:sc,
            background:`${sc}18`, padding:'1px 7px', borderRadius:'var(--radius-sm)' }}>
            {(t.mineralisation_score*100).toFixed(0)}% EO signal
          </span>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto 1fr', gap:'2px 10px',
          fontSize:'0.7rem' }}>
          {[
            ['IOI',  t.iron_oxide_idx?.toFixed(3)],
            ['Clay', t.clay_alter_idx?.toFixed(3)],
            ['NDVI', t.ndvi?.toFixed(3)],
            ['Conf', t.satellite_confidence?.toFixed(2)],
          ].map(([k, v]) => (
            <React.Fragment key={k}>
              <span style={{ color:'var(--text-muted)' }}>{k}</span>
              <span style={{ fontWeight:600 }}>{v}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

function IndicatorCard({ ind, stats }) {
  const s = stats?.[ind.key]
  if (!s) return null
  const raw = s.mean
  const isSlopeDeg = ind.key === 'slope_deg'
  const barPct = isSlopeDeg ? Math.min((raw/45)*100,100) : Math.min(raw*100,100)
  const display = isSlopeDeg ? `${raw.toFixed(1)}°` : raw.toFixed(3)
  return (
    <div style={{ background:'var(--bg-card-alt)', border:'1px solid var(--border)',
      borderRadius:'var(--radius-sm)', padding:'10px 12px' }}>
      <div className="flex-between" style={{ marginBottom:5 }}>
        <span style={{ fontSize:'0.8rem', fontWeight:600 }}>{ind.icon} {ind.label}</span>
        <span style={{ fontSize:'0.8rem', fontWeight:700, color:'var(--accent)',
          fontVariantNumeric:'tabular-nums' }}>{display}</span>
      </div>
      <div className="progress-bar-track" style={{ marginBottom:5, height:3 }}>
        <div className="progress-bar-fill" style={{ width:`${barPct}%`, background:'var(--accent)' }}/>
      </div>
      <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', lineHeight:1.4 }}>
        <strong style={{ color:'var(--text-secondary)' }}>What: </strong>{ind.what}<br/>
        <strong style={{ color:'var(--text-secondary)' }}>Use: </strong>{ind.why}
        {ind.warning && <><br/><span style={{ color:'var(--yellow)' }}>⚠ {ind.warning}</span></>}
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginBottom:2 }}>{label}</div>
      <div style={{ fontWeight:700, fontSize:'1rem', color:color??'var(--text-primary)' }}>{value??'—'}</div>
    </div>
  )
}
