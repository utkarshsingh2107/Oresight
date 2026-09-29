/**
 * SatelliteView — Space Intelligence panel
 *
 * PRIMARY intelligence layer of OreSight.
 * Shows synthetic EO surface indicators with layer toggle, anomaly targets,
 * and spectral band cards.
 *
 * DISCLAIMER: All data is SYNTHETIC, calibrated from boreholes via IDW.
 * NOT real Sentinel-2 / ISRO Bhuvan imagery.
 */
import React, { useEffect, useState } from 'react'
import { getSatellite, getSatelliteGrid } from '../services/api.js'

/* ── colour scales ───────────────────────────────────────────── */
const scoreColor  = v => v >= 0.65 ? '#f85149' : v >= 0.50 ? '#f0883e' : v >= 0.35 ? '#d29922' : '#3fb950'
const ndviColor   = v => v < 0.25  ? '#f0883e' : v < 0.40  ? '#d29922' : '#3fb950'
const ioiColor    = v => v >= 0.65 ? '#f85149' : v >= 0.50 ? '#f0883e' : v >= 0.35 ? '#d29922' : '#8b949e'
const confColor   = v => v >= 0.7  ? '#3fb950' : v >= 0.5  ? '#d29922' : '#f0883e'

/* ── layer definitions ───────────────────────────────────────── */
const LAYERS = [
  { id: 'mineralisation_score', label: 'Mineralisation anomaly', unit: '',     icon: '🔴', desc: 'Composite EO mineralisation score' },
  { id: 'iron_oxide_idx',       label: 'Iron oxide index',       unit: '',     icon: '🟠', desc: 'Fe-rich gossans / altered soils' },
  { id: 'clay_alter_idx',       label: 'Clay / alteration',      unit: '',     icon: '🟡', desc: 'Hydroxyl SWIR absorption' },
  { id: 'ndvi',                 label: 'Vegetation stress',       unit: '',     icon: '🟢', desc: 'NDVI — depressed over ore zones' },
  { id: 'slope_deg',            label: 'Terrain / slope',         unit: '°',   icon: '⛰', desc: 'DEM-derived slope (degrees)' },
  { id: 'spectral_anomaly',     label: 'Spectral anomaly',        unit: '',     icon: '🔵', desc: 'Multiband deviation from background' },
]

/* ── EO band info cards ──────────────────────────────────────── */
const EO_BANDS = [
  { icon: '🔴', label: 'Iron Oxide Index', key: 'iron_oxide_idx',    note: 'SWIR / Red ratio — Fe-Mn gossans', source: 'Sentinel-2 B11/B4' },
  { icon: '🟡', label: 'Clay Index',       key: 'clay_alter_idx',    note: 'SWIR hydroxyl bands — altered zones', source: 'Sentinel-2 B12/B11' },
  { icon: '🟢', label: 'NDVI',             key: 'ndvi',              note: 'Vegetation stress anomaly', source: 'Sentinel-2 B8/B4' },
  { icon: '💧', label: 'NDWI / Moisture',  key: 'soil_moisture',     note: 'Soil drainage proxy', source: 'Sentinel-2 B3/B8' },
  { icon: '🌫', label: 'Surface Refl.',    key: 'surface_reflectance', note: 'Broadband albedo — bare rock', source: 'Sentinel-2 B2-B4' },
  { icon: '⛰', label: 'Slope (DEM)',      key: 'slope_deg',         note: 'Terrain steepness (degrees)', source: 'SRTM / ALOS DEM' },
  { icon: '🔵', label: 'Spectral Anomaly', key: 'spectral_anomaly',  note: 'Multiband deviation', source: 'Derived' },
  { icon: '⭐', label: 'Mineralisation',   key: 'mineralisation_score', note: 'Composite EO score (0–1)', source: 'Derived' },
]

/* ── Spatial grid (SVG choropleth with layer toggle) ──────────── */
function SpatialGrid({ grid, activeLayer }) {
  if (!grid?.length) return null
  const xs = [...new Set(grid.map(c => c.grid_x))].sort((a, b) => a - b)
  const ys = [...new Set(grid.map(c => c.grid_y))].sort((a, b) => b - a)
  const cellMap = {}
  grid.forEach(c => { cellMap[`${c.grid_x}_${c.grid_y}`] = c })
  const cellSize = Math.min(Math.floor(380 / xs.length), Math.floor(220 / ys.length), 24)
  const layerDef  = LAYERS.find(l => l.id === activeLayer) ?? LAYERS[0]
  const vals = grid.map(c => c[activeLayer] ?? 0)
  const vMin = Math.min(...vals), vMax = Math.max(...vals) + 1e-9

  function cellFill(val) {
    const t = (val - vMin) / (vMax - vMin)
    if (activeLayer === 'ndvi') {
      // green gradient — lower = more anomalous
      const g = Math.round(100 + (1 - t) * 80)
      const r = Math.round(30  + t * 60)
      return `rgb(${r},${g},30)`
    }
    // red-yellow-green: high = anomalous
    const r = Math.round(40  + t * 200)
    const g = Math.round(180 - t * 120)
    const b = Math.round(40)
    return `rgb(${r},${g},${b})`
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {layerDef.icon} {layerDef.label}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>— {layerDef.desc}</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <svg
          width={xs.length * cellSize + 2}
          height={ys.length * cellSize + 2}
          style={{ display: 'block' }}
          aria-label={`${layerDef.label} spatial grid`}
          role="img"
        >
          {ys.map((y, yi) =>
            xs.map((x, xi) => {
              const cell = cellMap[`${x}_${y}`]
              if (!cell) return null
              const val  = cell[activeLayer] ?? 0
              const fill = cellFill(val)
              const isTgt = cell.surface_target
              return (
                <g key={`${x}_${y}`}>
                  <rect
                    x={xi * cellSize + 1} y={yi * cellSize + 1}
                    width={cellSize - 1} height={cellSize - 1}
                    fill={fill} opacity={0.75 + (val - vMin) / (vMax - vMin) * 0.25}
                  >
                    <title>{`(${x},${y})\n${layerDef.label}: ${val.toFixed(3)}\nScore: ${cell.mineralisation_score?.toFixed(3)}\nConf: ${cell.satellite_confidence?.toFixed(2)}`}</title>
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
      <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
        <span>■ Low anomaly</span>
        <span style={{ color: 'var(--yellow)' }}>■ Moderate</span>
        <span style={{ color: 'var(--risk-critical)' }}>■ High anomaly</span>
        <span>★ EO target flagged</span>
      </div>
    </div>
  )
}

/* ── Layer toggle buttons ─────────────────────────────────────── */
function LayerToggle({ layers, active, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {layers.map(l => (
        <button
          key={l.id}
          onClick={() => onToggle(l.id)}
          style={{
            padding: '4px 10px', fontSize: '0.75rem', borderRadius: 14,
            border: active === l.id ? '1px solid var(--accent)' : '1px solid var(--border)',
            background: active === l.id ? 'rgba(88,166,255,.15)' : 'var(--bg-card-alt)',
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

/* ── EO target card ───────────────────────────────────────────── */
function TargetCard({ t }) {
  const sc = scoreColor(t.mineralisation_score)
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, flexWrap: 'wrap', gap: 4 }}>
          <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>
            {t.latitude?.toFixed(4)}°N, {t.longitude?.toFixed(4)}°E
          </span>
          <span style={{
            fontSize: '0.74rem', fontWeight: 700, color: sc,
            background: `${sc}18`, padding: '1px 8px', borderRadius: 10,
          }}>
            {(t.mineralisation_score * 100).toFixed(0)}% score
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '2px 10px', fontSize: '0.72rem' }}>
          {[
            ['IOI',   t.iron_oxide_idx?.toFixed(3),  ioiColor(t.iron_oxide_idx)],
            ['Clay',  t.clay_alter_idx?.toFixed(3),  'var(--accent)'],
            ['NDVI',  t.ndvi?.toFixed(3),             ndviColor(t.ndvi)],
            ['Slope', `${t.slope_deg?.toFixed(1)}°`,  'var(--text-secondary)'],
            ['Conf',  t.satellite_confidence?.toFixed(2), confColor(t.satellite_confidence)],
            ['Elev',  `${t.elevation_m?.toFixed(0)} m`, 'var(--text-secondary)'],
          ].map(([k, v, c]) => (
            <React.Fragment key={k}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span style={{ fontWeight: 600, color: c }}>{v}</span>
              <span />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Band card ────────────────────────────────────────────────── */
function BandCard({ band, stats }) {
  const s = stats?.[band.key]
  if (!s) return null
  const pct = Math.round(s.mean * 100)
  return (
    <div style={{
      background: 'var(--bg-card-alt)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: '10px 12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{band.icon} {band.label}</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)' }}>
          {s.mean.toFixed(3)}
        </span>
      </div>
      <div style={{ background: 'var(--border)', borderRadius: 3, height: 4, overflow: 'hidden', marginBottom: 5 }}>
        <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
        <span>{band.note}</span>
        <span style={{ color: 'var(--border)', fontFamily: 'monospace' }}>{band.source}</span>
      </div>
    </div>
  )
}

/* ── main component ───────────────────────────────────────────── */
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
  const targets = summary.top_eo_targets ?? []
  const geo     = summary.geological_integration ?? {}

  return (
    <div className="stage-view">

      {/* Header */}
      <div style={{ marginBottom: 'var(--gap-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--purple)' }}>
            🛰 OBSERVE — Space Intelligence
          </span>
        </div>
        <h2 style={{ marginBottom: 6 }}>What does Earth observation reveal?</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 760, fontSize: '0.9rem' }}>
          Satellite multispectral analysis identifies surface spectral anomalies —
          iron-oxide enrichment, clay alteration, vegetation stress, terrain structure —
          that correlate with known mineralisation patterns. These EO indicators form
          the primary spatial evidence layer, complemented by subsurface borehole assays.
        </p>
      </div>

      {/* EO status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        background: 'rgba(188,140,255,.06)', border: '1px solid rgba(188,140,255,.25)',
        borderRadius: 'var(--radius-sm)', padding: '8px 14px',
        fontSize: '0.78rem', marginBottom: 'var(--gap-lg)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d29922', display: 'inline-block' }} />
          <span style={{ color: 'var(--yellow)', fontWeight: 700 }}>Simulated Earth Observation — DEMO-01</span>
        </span>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span style={{ color: 'var(--text-muted)' }}>
          {summary.grid_cells} cells · {GRID_RESOLUTION_LABEL} grid · {summary.surface_targets} anomaly targets
        </span>
        <span style={{ color: 'var(--border)' }}>|</span>
        <span style={{ color: 'var(--text-muted)' }}>
          Integration-ready: Sentinel-2 · ISRO Bhuvan · Landsat · SRTM DEM
        </span>
      </div>

      <div className="grid-2" style={{ gap: 'var(--gap-lg)', alignItems: 'start' }}>

        {/* LEFT — map + layer controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gap-sm)' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Spatial Intelligence Map</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Simulated EO Layer
              </span>
            </div>
            <div style={{ marginBottom: 'var(--gap-sm)' }}>
              <LayerToggle layers={LAYERS} active={activeLayer} onToggle={setActiveLayer} />
            </div>
            <SpatialGrid grid={grid} activeLayer={activeLayer} />
            <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(188,140,255,.05)',
              borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--purple)' }}>EO Intelligence:</strong>{' '}
              Hover cells for values · ★ marks EO anomaly targets · Toggle layers above to switch indicator
            </div>
          </div>

          {/* EO anomaly targets */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gap-sm)' }}>
              <span style={{ fontWeight: 700 }}>Top EO Anomaly Targets</span>
              <SourceBadge label="Satellite / Synthetic EO" />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--gap-sm)' }}>
              Grid cells with strongest combined spectral surface signal — flagged for ground-truth investigation.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {targets.map(t => <TargetCard key={t.rank} t={t} />)}
            </div>
          </div>
        </div>

        {/* RIGHT — band cards + stats + integration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>

          {/* EO band cards */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gap-md)' }}>
              <span style={{ fontWeight: 700 }}>Spectral Band Intelligence</span>
              <SourceBadge label="Multispectral Imagery" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {EO_BANDS.map(b => <BandCard key={b.key} band={b} stats={stats} />)}
            </div>
          </div>

          {/* Mine-level stats */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gap-md)' }}>
              <span style={{ fontWeight: 700 }}>EO Coverage Statistics</span>
              <SourceBadge label="Spatial Model" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-md)' }}>
              <StatItem label="Grid cells" value={summary.grid_cells} />
              <StatItem label="Anomaly targets" value={summary.surface_targets} color="var(--orange)" />
              <StatItem label="Mean mineralisation" value={(summary.mean_mineralisation * 100).toFixed(1) + '%'} color="var(--accent)" />
              <StatItem label="Mean confidence" value={(summary.mean_confidence * 100).toFixed(1) + '%'} color={confColor(summary.mean_confidence)} />
              <StatItem label="Boreholes (subsurface)" value={geo.borehole_count} />
              <StatItem label="Ore boreholes" value={geo.ore_boreholes} color="var(--green)" />
            </div>
          </div>

          {/* Evidence relationship */}
          <div className="card" style={{ background: 'var(--bg-card-alt)' }}>
            <div style={{ fontWeight: 700, marginBottom: 'var(--gap-md)' }}>EO + Geology Evidence Fusion</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <EvidenceRow
                icon="🛰" label="Earth Observation"
                color="var(--purple)" badge="PRIMARY LAYER"
                items={['Spectral anomalies', 'Surface alteration', 'Vegetation stress', 'Terrain / DEM']}
              />
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>⊕</div>
              <EvidenceRow
                icon="⛏" label="Subsurface Geology"
                color="var(--green)" badge="VALIDATION LAYER"
                items={['Borehole Mn/Fe assays', 'Spatial Kriging', 'Grade continuity', '3D block model']}
              />
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>↓</div>
              <div style={{
                background: 'rgba(240,136,62,.08)', border: '1px solid rgba(240,136,62,.25)',
                borderRadius: 'var(--radius-sm)', padding: '8px 12px', textAlign: 'center',
              }}>
                <p style={{ fontWeight: 700, color: 'var(--orange)', fontSize: '0.85rem' }}>
                  Integrated Resource Intelligence
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Spatial + geological evidence → Spatially modelled mineral resource
                </p>
              </div>
            </div>
          </div>

          {/* Integration-ready */}
          <div className="card" style={{ borderColor: 'rgba(188,140,255,.25)', background: 'rgba(188,140,255,.03)' }}>
            <div style={{ fontWeight: 700, color: 'var(--purple)', marginBottom: 'var(--gap-sm)', fontSize: '0.85rem' }}>
              Integration-Ready EO Sources
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(summary.integration_ready ?? []).map((src, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--purple)', fontSize: '0.8rem', marginTop: 1 }}>◎</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{src}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
              Processing stack (integration-ready):{' '}
              {(summary.processing_stack_integration_ready ?? []).join(' · ')}
            </p>
          </div>

          {/* Disclaimer */}
          <div style={{
            background: 'rgba(248,81,73,.04)', border: '1px solid rgba(248,81,73,.2)',
            borderRadius: 'var(--radius-sm)', padding: '8px 12px',
            fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--text-primary)' }}>Important:</strong>{' '}
            {summary.key_disclaimer}
          </div>
        </div>
      </div>
    </div>
  )
}

const GRID_RESOLUTION_LABEL = '50 m'

function SourceBadge({ label }) {
  return (
    <span style={{
      fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.05em', color: 'var(--purple)', background: 'rgba(188,140,255,.12)',
      padding: '2px 7px', borderRadius: 10, whiteSpace: 'nowrap',
    }}>
      {label}
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

function EvidenceRow({ icon, label, color, badge, items }) {
  return (
    <div style={{
      background: `${color}08`, border: `1px solid ${color}25`,
      borderRadius: 'var(--radius-sm)', padding: '8px 10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: '1rem' }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: '0.82rem', color }}>{label}</span>
        <span style={{
          marginLeft: 'auto', fontSize: '0.62rem', fontWeight: 700,
          color, background: `${color}18`, padding: '1px 7px', borderRadius: 10,
        }}>
          {badge}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {items.map(item => (
          <span key={item} style={{
            fontSize: '0.68rem', color: 'var(--text-secondary)',
            background: 'var(--bg-card)', padding: '2px 7px',
            borderRadius: 10, border: '1px solid var(--border)',
          }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
