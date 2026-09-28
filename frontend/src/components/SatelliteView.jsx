/**
 * SatelliteView — Space & Geospatial Intelligence panel
 *
 * Displays synthetic surface indicators derived from satellite-style spectral
 * analysis, integrated with geological borehole context.
 *
 * IMPORTANT: This prototype uses synthetic, calibrated surface indicators —
 * NOT real satellite imagery. Architecture is integration-ready for
 * Sentinel-2 / ISRO Bhuvan / Landsat.
 */
import React, { useEffect, useState } from 'react'
import { getSatellite, getSatelliteGrid } from '../services/api.js'

/* ── colour helpers ─────────────────────────────────────────── */
function scoreColor(v) {
  if (v >= 0.65) return 'var(--risk-critical)'  // high anomaly → orange/red
  if (v >= 0.50) return 'var(--orange)'
  if (v >= 0.35) return 'var(--yellow)'
  return 'var(--green)'
}

function ndviColor(v) {
  // Low NDVI over mineralised zones → orange; high → green
  if (v < 0.25) return 'var(--orange)'
  if (v < 0.40) return 'var(--yellow)'
  return 'var(--green)'
}

function ioiColor(v) {
  if (v >= 0.65) return 'var(--risk-critical)'
  if (v >= 0.50) return 'var(--orange)'
  if (v >= 0.35) return 'var(--yellow)'
  return 'var(--text-secondary)'
}

/* ── sub-components ─────────────────────────────────────────── */
function LayerBar({ label, value, color, description }) {
  const pct = Math.round(value * 100)
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{value.toFixed(3)}</span>
      </div>
      <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.4s' }} />
      </div>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{description}</p>
    </div>
  )
}

function TargetCard({ target }) {
  const rank = target.rank
  const score = target.prosp_score
  return (
    <div style={{
      background: 'var(--bg-card-alt)', border: `1px solid ${scoreColor(score)}40`,
      borderRadius: 'var(--radius-sm)', padding: '10px 14px',
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: scoreColor(score), display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: '#fff',
      }}>
        {rank}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
            ({target.grid_x.toFixed(0)} m, {target.grid_y.toFixed(0)} m)
          </span>
          <span style={{
            fontSize: '0.78rem', fontWeight: 700, color: scoreColor(score),
            background: `${scoreColor(score)}18`, padding: '1px 8px', borderRadius: 10,
          }}>
            {(score * 100).toFixed(0)}% prospectivity
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px 12px', fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Iron oxide</span>
          <span style={{ color: 'var(--text-muted)' }}>Clay index</span>
          <span style={{ color: 'var(--text-muted)' }}>NDVI</span>
          <span style={{ fontWeight: 600, color: ioiColor(target.iron_oxide_idx) }}>
            {target.iron_oxide_idx.toFixed(3)}
          </span>
          <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
            {target.clay_alter_idx.toFixed(3)}
          </span>
          <span style={{ fontWeight: 600, color: ndviColor(target.ndvi) }}>
            {target.ndvi.toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  )
}

function SpatialGrid({ grid }) {
  if (!grid || grid.length === 0) return null

  const xs = [...new Set(grid.map(c => c.grid_x))].sort((a, b) => a - b)
  const ys = [...new Set(grid.map(c => c.grid_y))].sort((a, b) => b - a) // flip Y for display

  const cellMap = {}
  grid.forEach(c => { cellMap[`${c.grid_x}_${c.grid_y}`] = c })

  const cellSize = Math.min(Math.floor(340 / xs.length), Math.floor(200 / ys.length), 22)

  return (
    <div style={{ overflowX: 'auto' }}>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 6 }}>
        Prospectivity heat map — 50 m grid · colour = composite surface score · ★ = anomaly target
      </p>
      <svg
        width={xs.length * cellSize + 2}
        height={ys.length * cellSize + 2}
        style={{ display: 'block' }}
        aria-label="Surface prospectivity grid"
      >
        {ys.map((y, yi) =>
          xs.map((x, xi) => {
            const cell = cellMap[`${x}_${y}`]
            if (!cell) return null
            const s   = cell.prosp_score
            const r   = Math.round(80 + s * 120)
            const g   = Math.round(180 - s * 120)
            const b   = Math.round(60)
            const fill = `rgb(${r},${g},${b})`
            return (
              <g key={`${x}_${y}`}>
                <rect
                  x={xi * cellSize + 1} y={yi * cellSize + 1}
                  width={cellSize - 1} height={cellSize - 1}
                  fill={fill} opacity={0.7 + s * 0.3}
                >
                  <title>{`(${x},${y}) score=${s.toFixed(3)} IOI=${cell.iron_oxide_idx.toFixed(2)}`}</title>
                </rect>
                {cell.surface_target && cellSize >= 10 && (
                  <text
                    x={xi * cellSize + cellSize / 2}
                    y={yi * cellSize + cellSize / 2 + 4}
                    textAnchor="middle" fontSize={cellSize * 0.7}
                    fill="#fff" style={{ pointerEvents: 'none' }}
                  >★</text>
                )}
              </g>
            )
          })
        )}
      </svg>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <span>■ Low prospectivity</span>
        <span style={{ color: 'var(--yellow)' }}>■ Moderate</span>
        <span style={{ color: 'var(--risk-critical)' }}>■ High anomaly</span>
        <span>★ Flagged target</span>
      </div>
    </div>
  )
}

/* ── main component ─────────────────────────────────────────── */
export default function SatelliteView() {
  const [summary, setSummary] = useState(null)
  const [grid,    setGrid]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([getSatellite(), getSatelliteGrid()])
      .then(([s, g]) => { setSummary(s); setGrid(g.grid) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="stage-view">
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
        Loading satellite surface indicators…
      </p>
    </div>
  )

  if (error) return (
    <div className="stage-view">
      <p style={{ color: 'var(--risk-critical)', padding: 20 }}>
        Could not load satellite data: {error}
      </p>
    </div>
  )

  if (!summary) return null

  const stats = summary.layer_statistics ?? {}
  const targets = summary.top_surface_targets ?? []
  const geo = summary.geological_integration ?? {}

  return (
    <div className="stage-view">

      {/* Header */}
      <div style={{ marginBottom: 'var(--gap-lg)' }}>
        <div className="section-label" style={{ color: 'var(--purple)' }}>
          SPACE TECH — Surface & Geospatial Intelligence
        </div>
        <h2 style={{ marginBottom: 6 }}>What do satellites tell us about the surface?</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 760, fontSize: '0.9rem' }}>
          Satellite-derived spectral indices reveal surface anomalies — vegetation stress, iron-oxide
          enrichment, clay alteration — that correlate with known mineralisation patterns.
          These surface indicators complement borehole and assay data for integrated reserve identification.
        </p>
      </div>

      {/* Key disclaimer */}
      <div style={{
        background: 'rgba(188,140,255,.06)', border: '1px solid rgba(188,140,255,.25)',
        borderRadius: 'var(--radius-sm)', padding: '10px 14px',
        fontSize: '0.82rem', color: 'rgba(188,140,255,.9)', marginBottom: 'var(--gap-lg)',
        lineHeight: 1.6,
      }}>
        <strong>Satellite observations provide surface indicators and spatial context.</strong>{' '}
        They do NOT directly detect subsurface manganese ore.
        Subsurface reserve estimation is supported by geological borehole and assay data (see Reserve Identification tab).
        These two evidence streams are complementary, not substitutes.
      </div>

      {/* Prototype status badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(210,153,34,.08)', border: '1px solid rgba(210,153,34,.3)',
        borderRadius: 20, padding: '4px 14px', fontSize: '0.75rem',
        color: 'var(--yellow)', marginBottom: 'var(--gap-lg)',
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--yellow)', display: 'inline-block' }} />
        Prototype — Synthetic calibrated indicators · Integration-ready for Sentinel-2 / ISRO Bhuvan / Landsat
      </div>

      <div className="grid-2" style={{ gap: 'var(--gap-lg)', alignItems: 'start' }}>

        {/* LEFT — heat map + targets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>

          {/* Prospectivity grid */}
          <div className="card">
            <div className="section-label" style={{ marginBottom: 'var(--gap-md)' }}>
              Prospectivity Heat Map
            </div>
            <SpatialGrid grid={grid} />
          </div>

          {/* Surface anomaly targets */}
          <div className="card">
            <div className="section-label" style={{ marginBottom: 'var(--gap-md)' }}>
              Top Surface Anomaly Targets
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 'var(--gap-sm)' }}>
              Grid cells with strongest combined spectral surface signal — warrant ground-truth investigation.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {targets.map(t => <TargetCard key={t.rank} target={t} />)}
            </div>
          </div>
        </div>

        {/* RIGHT — layer stats + integration info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>

          {/* Spectral layer statistics */}
          <div className="card">
            <div className="section-label" style={{ marginBottom: 'var(--gap-md)' }}>
              Surface Indicator Layers
            </div>
            {stats.ndvi && (
              <LayerBar
                label="NDVI (Vegetation Index)"
                value={stats.ndvi.mean}
                color={ndviColor(stats.ndvi.mean)}
                description={stats.ndvi.description}
              />
            )}
            {stats.iron_oxide_idx && (
              <LayerBar
                label="Iron Oxide Index"
                value={stats.iron_oxide_idx.mean}
                color={ioiColor(stats.iron_oxide_idx.mean)}
                description={stats.iron_oxide_idx.description}
              />
            )}
            {stats.clay_alter_idx && (
              <LayerBar
                label="Clay / Alteration Index"
                value={stats.clay_alter_idx.mean}
                color="var(--accent)"
                description={stats.clay_alter_idx.description}
              />
            )}
            {stats.soil_moisture && (
              <LayerBar
                label="Soil Moisture (NDWI)"
                value={stats.soil_moisture.mean}
                color="var(--accent-dim)"
                description={stats.soil_moisture.description}
              />
            )}
            {stats.prosp_score && (
              <LayerBar
                label="Composite Prospectivity Score"
                value={stats.prosp_score.mean}
                color={scoreColor(stats.prosp_score.mean)}
                description={stats.prosp_score.description}
              />
            )}
          </div>

          {/* Geological context */}
          <div className="card">
            <div className="section-label" style={{ marginBottom: 'var(--gap-md)' }}>
              Geological Integration Context
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-md)' }}>
              <StatItem label="Total boreholes" value={geo.borehole_count} />
              <StatItem label="Ore boreholes (Mn ≥ 20%)" value={geo.ore_boreholes} color="var(--green)" />
              <StatItem label="Surface grid cells" value={summary.grid_cells} />
              <StatItem label="Anomaly targets flagged" value={summary.surface_targets_flagged} color="var(--orange)" />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 'var(--gap-md)', lineHeight: 1.6 }}>
              Surface targets are collocated with the borehole spatial footprint, enabling direct
              comparison of surface spectral anomalies with subsurface grade data.
            </p>
          </div>

          {/* Integration-ready sources */}
          <div className="card" style={{ borderColor: 'rgba(188,140,255,.2)', background: 'rgba(188,140,255,.03)' }}>
            <div className="section-label" style={{ marginBottom: 'var(--gap-sm)', color: 'var(--purple)' }}>
              Integration-Ready Data Sources
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(summary.data_sources_integration_ready ?? []).map((src, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ color: 'var(--purple)', marginTop: 1, fontSize: '0.8rem' }}>◎</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{src}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 'var(--gap-sm)', paddingTop: 'var(--gap-sm)', borderTop: '1px solid var(--border-light)' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Processing stack (integration-ready):{' '}
                {(summary.processing_stack_integration_ready ?? []).join(' · ')}
              </p>
            </div>
          </div>

          {/* Two-track explainer */}
          <div className="card" style={{ background: 'var(--bg-card-alt)' }}>
            <div className="section-label" style={{ marginBottom: 'var(--gap-md)' }}>
              How Space + Geology Work Together
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, background: 'rgba(88,166,255,.06)', border: '1px solid rgba(88,166,255,.2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
                  🛰 Satellite (Surface)
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Spectral anomalies · Surface alteration · Vegetation stress · Terrain
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '1.1rem' }}>+</div>
              <div style={{ flex: 1, background: 'rgba(63,185,80,.06)', border: '1px solid rgba(63,185,80,.2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>
                  ⛏ Boreholes (Subsurface)
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Mn grade · Fe / SiO₂ · Depth · Density · Spatial correlation
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '8px 0', fontSize: '0.9rem' }}>↓</div>
            <div style={{ background: 'rgba(240,136,62,.06)', border: '1px solid rgba(240,136,62,.2)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--orange)' }}>
                Integrated Reserve Identification
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                Spatial + geological evidence → Potential reserve understanding
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatItem({ label, value, color }) {
  return (
    <div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
      <p style={{ fontWeight: 700, color: color ?? 'var(--text-primary)', fontSize: '1.05rem' }}>
        {value ?? '—'}
      </p>
    </div>
  )
}
