/**
 * SatelliteView — Space Intelligence module
 *
 * PURPOSE: Earth observation identifies surface spectral and terrain anomalies.
 * These signals prioritise targets for geological/borehole validation.
 * EO does NOT directly detect subsurface ore.
 *
 * DEMO STATUS: All data is synthetic/simulated for DEMO-01.
 * NOT real Sentinel-2 / ISRO Bhuvan imagery.
 */
import React, { useEffect, useState } from 'react'
import { getSatellite, getSatelliteGrid } from '../services/api.js'

/* ── colour helpers ──────────────────────────────────────────── */
const eoScoreColor = v => v >= 0.65 ? '#f85149' : v >= 0.50 ? '#f0883e' : v >= 0.35 ? '#d29922' : '#3fb950'
const ndviColor    = v => v < 0.25  ? '#f0883e' : v < 0.40  ? '#d29922' : '#3fb950'
const ioiColor     = v => v >= 0.65 ? '#f85149' : v >= 0.50 ? '#f0883e' : v >= 0.35 ? '#d29922' : '#8b949e'

/* ── layer toggle definitions ────────────────────────────────── */
const LAYERS = [
  { id: 'mineralisation_score', label: 'EO Anomaly Score',  icon: '🔴', desc: 'Composite surface EO signal (0–1)' },
  { id: 'iron_oxide_idx',       label: 'Iron Oxide Index',  icon: '🟠', desc: 'Surface iron-oxide spectral signal' },
  { id: 'clay_alter_idx',       label: 'Clay Index',        icon: '🟡', desc: 'Clay-related surface alteration signal' },
  { id: 'ndvi',                 label: 'Vegetation (NDVI)', icon: '🟢', desc: 'Vegetation condition — stress anomaly' },
  { id: 'slope_deg',            label: 'Terrain / Slope',   icon: '⛰', desc: 'DEM-derived slope — terrain context' },
  { id: 'spectral_anomaly',     label: 'Spectral Anomaly',  icon: '🔵', desc: 'Unusual multispectral response' },
]

/* ── EO indicator definitions (what + why) ───────────────────── */
const EO_INDICATORS = [
  {
    icon: '🔴', label: 'Iron Oxide Index', key: 'iron_oxide_idx',
    what: 'Surface iron-oxide spectral signal',
    why:  'Alteration / mineralisation proxy',
    source: 'Sentinel-2 B11/B4',
  },
  {
    icon: '🟡', label: 'Clay Index', key: 'clay_alter_idx',
    what: 'Clay-related spectral signal',
    why:  'Surface alteration indicator',
    source: 'Sentinel-2 B12/B11',
  },
  {
    icon: '🟢', label: 'NDVI', key: 'ndvi',
    what: 'Vegetation condition',
    why:  'Surface / environmental context',
    source: 'Sentinel-2 B8/B4',
  },
  {
    icon: '💧', label: 'NDWI / Moisture', key: 'soil_moisture',
    what: 'Surface moisture signal',
    why:  'Moisture / drainage context',
    source: 'Sentinel-2 B3/B8',
  },
  {
    icon: '🌫', label: 'Surface Reflectance', key: 'surface_reflectance',
    what: 'Surface reflectance response',
    why:  'Spectral surface characterisation',
    source: 'Sentinel-2 B2–B4',
  },
  {
    icon: '⛰', label: 'Slope (DEM)', key: 'slope_deg',
    what: 'Terrain steepness',
    why:  'Terrain and accessibility context',
    source: 'SRTM / ALOS DEM',
  },
  {
    icon: '🔵', label: 'Spectral Anomaly', key: 'spectral_anomaly',
    what: 'Unusual multispectral response',
    why:  'EO target detection signal',
    source: 'Derived',
  },
  {
    icon: '⭐', label: 'EO Mineralisation Signal', key: 'mineralisation_score',
    what: 'Composite surface EO signal (0–1)',
    why:  'Combined anomaly score for target ranking',
    source: 'Derived',
    note: 'Does not confirm subsurface ore — requires geological validation.',
  },
]

/* ── Choropleth map ──────────────────────────────────────────── */
function EoMap({ grid, activeLayer }) {
  if (!grid?.length) return null

  const xs      = [...new Set(grid.map(c => c.grid_x))].sort((a, b) => a - b)
  const ys      = [...new Set(grid.map(c => c.grid_y))].sort((a, b) => b - a)
  const cellMap = {}
  grid.forEach(c => { cellMap[`${c.grid_x}_${c.grid_y}`] = c })

  const cellSize = Math.min(Math.floor(380 / xs.length), Math.floor(220 / ys.length), 24)
  const layerDef = LAYERS.find(l => l.id === activeLayer) ?? LAYERS[0]
  const vals     = grid.map(c => c[activeLayer] ?? 0)
  const vMin     = Math.min(...vals)
  const vMax     = Math.max(...vals) + 1e-9

  function cellFill(val) {
    const t = (val - vMin) / (vMax - vMin)
    if (activeLayer === 'ndvi') {
      return `rgb(${Math.round(30 + t * 60)},${Math.round(100 + (1 - t) * 80)},30)`
    }
    return `rgb(${Math.round(40 + t * 200)},${Math.round(180 - t * 120)},40)`
  }

  return (
    <div>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>
        {layerDef.icon} <strong style={{ color: 'var(--text-secondary)' }}>{layerDef.label}</strong>
        {' '}— {layerDef.desc}
      </p>
      <div style={{ overflowX: 'auto' }}>
        <svg
          width={xs.length * cellSize + 2}
          height={ys.length * cellSize + 2}
          style={{ display: 'block' }}
          role="img"
          aria-label={`${layerDef.label} EO anomaly map`}
        >
          {ys.map((y, yi) =>
            xs.map((x, xi) => {
              const cell = cellMap[`${x}_${y}`]
              if (!cell) return null
              const val  = cell[activeLayer] ?? 0
              const isTgt = cell.surface_target
              return (
                <g key={`${x}_${y}`}>
                  <rect
                    x={xi * cellSize + 1} y={yi * cellSize + 1}
                    width={cellSize - 1} height={cellSize - 1}
                    fill={cellFill(val)}
                    opacity={0.72 + (val - vMin) / (vMax - vMin) * 0.28}
                  >
                    <title>
                      {`EO Anomaly Score: ${cell.mineralisation_score?.toFixed(3)}\n${layerDef.label}: ${val.toFixed(3)}\nConf: ${cell.satellite_confidence?.toFixed(2)}\n${isTgt ? '★ EO Target' : ''}`}
                    </title>
                  </rect>
                  {isTgt && cellSize >= 12 && (
                    <text
                      x={xi * cellSize + cellSize / 2}
                      y={yi * cellSize + cellSize / 2 + 4}
                      textAnchor="middle"
                      fontSize={cellSize * 0.65}
                      fill="#fff"
                      style={{ pointerEvents: 'none', fontWeight: 'bold' }}
                    >★</text>
                  )}
                </g>
              )
            })
          )}
        </svg>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <span>■ Low anomaly</span>
        <span style={{ color: 'var(--yellow)' }}>■ Moderate anomaly</span>
        <span style={{ color: '#f85149' }}>■ High anomaly</span>
        <span>★ EO target flagged</span>
      </div>
      <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
        EO anomalies indicate surface signals and require geological validation.
      </p>
    </div>
  )
}

/* ── Layer toggle ────────────────────────────────────────────── */
function LayerToggle({ layers, active, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {layers.map(l => (
        <button
          key={l.id}
          onClick={() => onToggle(l.id)}
          style={{
            padding: '4px 10px', fontSize: '0.74rem', borderRadius: 14,
            border: active === l.id ? '1px solid var(--accent)' : '1px solid var(--border)',
            background: active === l.id ? 'rgba(88,166,255,.14)' : 'var(--bg-card-alt)',
            color: active === l.id ? 'var(--accent)' : 'var(--text-secondary)',
            fontWeight: active === l.id ? 700 : 400, cursor: 'pointer',
          }}
        >
          {l.icon} {l.label}
        </button>
      ))}
    </div>
  )
}

/* ── Target card ─────────────────────────────────────────────── */
function TargetCard({ t }) {
  const sc = eoScoreColor(t.mineralisation_score)
  return (
    <div style={{
      background: 'var(--bg-card-alt)', border: `1px solid ${sc}40`,
      borderRadius: 'var(--radius-sm)', padding: '10px 12px',
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        background: sc, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem', color: '#fff',
      }}>
        {t.rank}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4, marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>
            {t.latitude?.toFixed(4)}°N, {t.longitude?.toFixed(4)}°E
          </span>
          <span style={{
            fontSize: '0.74rem', fontWeight: 700, color: sc,
            background: `${sc}18`, padding: '1px 8px', borderRadius: 10,
          }}>
            {(t.mineralisation_score * 100).toFixed(0)}% EO signal
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr', gap: '2px 10px', fontSize: '0.72rem' }}>
          {[
            ['IOI',  t.iron_oxide_idx?.toFixed(3), ioiColor(t.iron_oxide_idx)],
            ['Clay', t.clay_alter_idx?.toFixed(3), 'var(--accent)'],
            ['NDVI', t.ndvi?.toFixed(3),            ndviColor(t.ndvi)],
            ['Conf', t.satellite_confidence?.toFixed(2), '#8b949e'],
          ].map(([k, v, c]) => (
            <React.Fragment key={k}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ fontWeight: 600, color: c }}>{v}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── EO Indicator card (what + why + tooltip-style note) ─────── */
function IndicatorCard({ ind, stats }) {
  const s = stats?.[ind.key]
  if (!s) return null

  const raw  = s.mean
  // slope is in degrees (range 0–45), normalise bar differently
  const isSlopeDeg = ind.key === 'slope_deg'
  const barPct = isSlopeDeg
    ? Math.min((raw / 45) * 100, 100)
    : Math.min(raw * 100, 100)

  const displayVal = isSlopeDeg ? `${raw.toFixed(1)}°` : raw.toFixed(3)

  return (
    <div style={{
      background: 'var(--bg-card-alt)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '10px 12px',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>
          {ind.icon} {ind.label}
        </span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)' }}>
          {displayVal}
        </span>
      </div>

      {/* Bar */}
      <div style={{ background: 'var(--border)', borderRadius: 3, height: 4, overflow: 'hidden', marginBottom: 6 }}>
        <div style={{ width: `${barPct}%`, height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
      </div>

      {/* What + Why */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>What: </span>
          {ind.what}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Use: </span>
          {ind.why}
        </div>
        {ind.note && (
          <div style={{ fontSize: '0.65rem', color: 'var(--yellow)', marginTop: 3, fontStyle: 'italic' }}>
            ⚠ {ind.note}
          </div>
        )}
      </div>

      {/* Source tag */}
      <div style={{ marginTop: 5, fontSize: '0.6rem', color: 'var(--border)',
        fontFamily: 'monospace', textAlign: 'right' }}>
        {ind.source}
      </div>
    </div>
  )
}

/* ── main component ──────────────────────────────────────────── */
export default function SatelliteView() {
  const [summary,     setSummary]     = useState(null)
  const [grid,        setGrid]        = useState(null)
  const [activeLayer, setActiveLayer] = useState('mineralisation_score')
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    Promise.all([getSatellite(), getSatelliteGrid()])
      .then(([s, g]) => { setSummary(s); setGrid(g.grid) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="stage-view">
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 48 }}>
        Loading Earth-observation data…
      </p>
    </div>
  )
  if (error) return (
    <div className="stage-view">
      <p style={{ color: 'var(--risk-critical)', padding: 20 }}>
        Could not load EO data: {error}
      </p>
    </div>
  )
  if (!summary) return null

  const stats   = summary.layer_statistics ?? {}
  const targets = summary.top_eo_targets   ?? []

  return (
    <div className="stage-view">

      {/* ── Section header ── */}
      <div style={{ marginBottom: 'var(--gap-lg)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--purple)', marginBottom: 4 }}>
          🛰 SPACE INTELLIGENCE
        </div>
        <h2 style={{ marginBottom: 6 }}>
          Where are the surface signals associated with mineralisation?
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 720, fontSize: '0.9rem', lineHeight: 1.6 }}>
          Earth-observation data identifies surface spectral and terrain anomalies. These targets
          are prioritised for validation using geological and borehole evidence.
        </p>
      </div>

      {/* ── Demo EO status bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        background: 'rgba(188,140,255,.06)', border: '1px solid rgba(188,140,255,.3)',
        borderRadius: 'var(--radius-sm)', padding: '8px 14px',
        fontSize: '0.78rem', marginBottom: 'var(--gap-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--yellow)', display: 'inline-block' }} />
          <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>DEMO EO DATA — DEMO-01</span>
        </div>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span style={{ color: 'var(--text-muted)' }}>
          {summary.grid_cells} cells · 50 m grid · {summary.surface_targets} anomaly targets
        </span>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
          Integration-ready: Sentinel-2 · ISRO Bhuvan · Sentinel-1 · SRTM/ALOS DEM
        </span>
      </div>

      {/* ── Two-column main content ── */}
      <div className="grid-2" style={{ gap: 'var(--gap-lg)', alignItems: 'start' }}>

        {/* LEFT — EO anomaly map + targets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>

          {/* Map card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gap-sm)' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>EO Anomaly Map</span>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Surface signals detected from simulated Earth-observation indicators
                </p>
              </div>
              <DemoBadge />
            </div>

            <div style={{ marginBottom: 'var(--gap-sm)' }}>
              <LayerToggle layers={LAYERS} active={activeLayer} onToggle={setActiveLayer} />
            </div>

            <EoMap grid={grid} activeLayer={activeLayer} />

            <div style={{
              marginTop: 10, padding: '6px 10px',
              background: 'rgba(188,140,255,.05)', borderRadius: 'var(--radius-sm)',
              fontSize: '0.71rem', color: 'var(--text-muted)', lineHeight: 1.5,
            }}>
              Hover cells for values · ★ marks EO anomaly targets · Toggle layers to switch indicator
            </div>
          </div>

          {/* Top EO anomaly targets */}
          <div className="card">
            <div style={{ marginBottom: 'var(--gap-sm)' }}>
              <span style={{ fontWeight: 700 }}>Top EO Anomaly Targets</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>
                Highest-ranked surface EO signals selected for ground-truth investigation
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {targets.map(t => <TargetCard key={t.rank} t={t} />)}
            </div>
            <p style={{ fontSize: '0.68rem', color: 'var(--yellow)', marginTop: 10, fontStyle: 'italic' }}>
              ⚠ EO signal scores represent relative surface anomaly strength — not confirmed mineralisation.
            </p>
          </div>
        </div>

        {/* RIGHT — EO indicators + coverage + transition */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>

          {/* EO indicators grid */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gap-md)' }}>
              <span style={{ fontWeight: 700 }}>EO Indicators</span>
              <DemoBadge />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {EO_INDICATORS.map(ind => (
                <IndicatorCard key={ind.key} ind={ind} stats={stats} />
              ))}
            </div>
          </div>

          {/* EO coverage stats */}
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: 'var(--gap-md)', fontSize: '0.88rem' }}>
              EO Coverage
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-md)' }}>
              <StatItem label="Grid cells"         value={summary.grid_cells} />
              <StatItem label="Anomaly targets"    value={summary.surface_targets} color="var(--orange)" />
              <StatItem label="Mean EO signal"     value={(summary.mean_mineralisation * 100).toFixed(1) + '%'} color="var(--accent)" />
              <StatItem label="Grid resolution"    value="50 m" />
            </div>
          </div>

          {/* Compact transition → Resource Mapping */}
          <div style={{
            background: 'rgba(88,166,255,.05)', border: '1px solid rgba(88,166,255,.2)',
            borderRadius: 'var(--radius-md)', padding: 'var(--gap-md)',
          }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.07em', color: 'var(--accent)', marginBottom: 6 }}>
              NEXT → Resource Mapping
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              EO targets are combined with borehole and geological evidence to build the
              spatial resource model.
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
              Space Intelligence prioritises where to investigate.
              Resource Mapping determines what the combined evidence means for the mineral resource.
            </p>
          </div>

          {/* Integration-ready sources */}
          <div className="card" style={{ borderColor: 'rgba(188,140,255,.2)', background: 'rgba(188,140,255,.03)' }}>
            <div style={{ fontWeight: 700, color: 'var(--purple)', marginBottom: 'var(--gap-sm)', fontSize: '0.85rem' }}>
              Integration-Ready EO Sources
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {(summary.integration_ready ?? []).map((src, i) => (
                <div key={i} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: 'var(--purple)', fontSize: '0.78rem', marginTop: 1 }}>◎</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{src}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── OBSERVE → DETECT → PRIORITISE → VALIDATE → MODEL flow ── */}
      <div className="card" style={{ marginTop: 'var(--gap-lg)', background: 'var(--bg-card-alt)' }}>
        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 'var(--gap-md)' }}>
          How Space Intelligence Helps OreSight
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 4, overflowX: 'auto' }}>
          {[
            { icon: '🛰', phase: 'EO DATA',            sub: 'Satellite imagery\n& terrain data' },
            { icon: '📡', phase: 'SURFACE INDICATORS', sub: 'Spectral indices\n& DEM analysis' },
            { icon: '🔍', phase: 'ANOMALY DETECTION',  sub: 'Unusual surface\nresponses identified' },
            { icon: '🎯', phase: 'TARGET RANKING',     sub: 'Locations ranked\nby EO signal' },
            { icon: '⛏', phase: 'GEOLOGICAL VALIDATION', sub: 'Boreholes + assays\nconfirm evidence' },
          ].map((s, i) => (
            <React.Fragment key={s.phase}>
              {i > 0 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flexShrink: 0 }}>→</span>
              )}
              <div style={{ textAlign: 'center', minWidth: 90, padding: '4px 6px' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{s.icon}</div>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--purple)',
                  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                  {s.phase}
                </p>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                  {s.sub}
                </p>
              </div>
            </React.Fragment>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'var(--gap-md)',
          textAlign: 'center', lineHeight: 1.6, borderTop: '1px solid var(--border-light)', paddingTop: 10 }}>
          <strong>OreSight uses Earth Observation as an early spatial intelligence layer</strong>{' '}
          to decide where geological investigation should be focused.
          EO anomalies indicate surface signals only — not subsurface ore deposits.
        </p>
      </div>
    </div>
  )
}

/* ── helpers ─────────────────────────────────────────────────── */
function DemoBadge() {
  return (
    <span style={{
      fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.05em', color: 'var(--yellow)', background: 'rgba(210,153,34,.12)',
      padding: '2px 7px', borderRadius: 10, whiteSpace: 'nowrap',
    }}>
      Demo EO
    </span>
  )
}

function StatItem({ label, value, color }) {
  return (
    <div>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontWeight: 700, color: color ?? 'var(--text-primary)', fontSize: '1rem' }}>{value ?? '—'}</p>
    </div>
  )
}
