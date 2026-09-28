import React, { useEffect, useRef, useState } from 'react'
import { getPrismBlocks } from '../services/api.js'

const CUTOFF = 20.0

export default function PrismView({ prism }) {
  const plotRef = useRef(null)
  const [blocks, setBlocks] = useState(null)
  const [loadErr, setLoadErr] = useState(null)
  const [hoveredBlock, setHoveredBlock] = useState(null)

  useEffect(() => {
    getPrismBlocks()
      .then(d => setBlocks(d.blocks))
      .catch(e => setLoadErr(e.message))
  }, [])

  useEffect(() => {
    if (!blocks || !plotRef.current) return
    renderPlot()
  }, [blocks])

  function renderPlot() {
    if (!plotRef.current || typeof plotRef.current.getBoundingClientRect !== 'function') return
    import('plotly.js-basic-dist-min').then(mod => {
      const Plotly = mod.default ?? mod
      const ore   = blocks.filter(b => b.is_ore === 1)
      const waste = blocks.filter(b => b.is_ore === 0)

      const trace_ore = {
        type: 'scatter3d', mode: 'markers',
        name: `Ore (Mn ≥ ${CUTOFF}%)`,
        x: ore.map(b => b.x), y: ore.map(b => b.y), z: ore.map(b => b.z),
        text: ore.map(b =>
          `<b>${b.block_id}</b><br>X: ${b.x} Y: ${b.y} Z: ${b.z}<br>` +
          `Mn: ${b.estimated_mn_pct?.toFixed(1)}%<br>` +
          `Tonnage: ${Math.round(b.tonnage_t).toLocaleString()} t<br>` +
          `Uncertainty: ±${b.kriging_variance?.toFixed(0)}`
        ),
        hovertemplate: '%{text}<extra></extra>',
        marker: {
          size: 4,
          color: ore.map(b => b.estimated_mn_pct),
          colorscale: [
            [0,   '#1f6feb'],
            [0.5, '#3fb950'],
            [1,   '#f0883e'],
          ],
          colorbar: {
            title: { text: 'Mn %', font: { color: '#8b949e', size: 11 } },
            tickfont: { color: '#8b949e', size: 10 },
            len: 0.6, x: 1.02,
            bgcolor: 'rgba(0,0,0,0)',
            bordercolor: '#30363d',
          },
          cmin: CUTOFF, cmax: 42,
          opacity: 0.85,
        },
      }

      const trace_waste = {
        type: 'scatter3d', mode: 'markers',
        name: 'Waste',
        x: waste.map(b => b.x), y: waste.map(b => b.y), z: waste.map(b => b.z),
        text: waste.map(b =>
          `<b>${b.block_id}</b><br>X: ${b.x} Y: ${b.y} Z: ${b.z}<br>` +
          `Mn: ${b.estimated_mn_pct?.toFixed(1)}%<br>Waste block`
        ),
        hovertemplate: '%{text}<extra></extra>',
        marker: { size: 2.5, color: '#21262d', opacity: 0.25 },
      }

      const layout = {
        paper_bgcolor: '#161b22', plot_bgcolor: '#161b22',
        scene: {
          xaxis: { title: 'Easting (m)', color: '#6e7681', gridcolor: '#21262d', backgroundcolor: '#0d1117' },
          yaxis: { title: 'Northing (m)', color: '#6e7681', gridcolor: '#21262d', backgroundcolor: '#0d1117' },
          zaxis: { title: 'Elevation (m)', color: '#6e7681', gridcolor: '#21262d', backgroundcolor: '#0d1117' },
          bgcolor: '#0d1117',
          camera: { eye: { x: 1.6, y: 1.4, z: 0.9 } },
          aspectmode: 'data',
        },
        legend: {
          font: { color: '#8b949e', size: 11 },
          bgcolor: 'rgba(22,27,34,0.9)',
          bordercolor: '#30363d', borderwidth: 1,
          x: 0.01, y: 0.98,
        },
        margin: { l: 0, r: 0, t: 0, b: 0 },
      }

      Plotly.newPlot(plotRef.current, [trace_ore, trace_waste], layout, {
        responsive: true, displayModeBar: true,
        modeBarButtonsToRemove: ['sendDataToCloud', 'toImage'],
        displaylogo: false,
      })
    })
  }

  if (!prism) return null

  return (
    <div className="stage-view">
      <div style={{ marginBottom: 'var(--gap-lg)' }}>
        <div className="section-label">RESERVE IDENTIFICATION — Geology + Space</div>
        <h2 style={{ marginBottom: 6 }}>What ore exists and where is it?</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 760, fontSize: '0.9rem' }}>
          Reserve identification combines two complementary evidence streams: subsurface borehole and
          assay data (interpreted through Ordinary Kriging) and surface spatial indicators derived from
          satellite imagery. Together they build an integrated understanding of the deposit.
        </p>
      </div>

      {/* Two-evidence integration banner */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr',
        gap: 0, marginBottom: 'var(--gap-lg)',
        background: 'var(--bg-card-alt)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
      }}>
        <EvidenceBlock
          icon="🛰"
          label="Space-Based Evidence"
          color="var(--purple)"
          items={['Spectral surface anomalies', 'Iron oxide & clay indices', 'Vegetation stress patterns', 'Terrain / DEM analysis']}
          badge="Satellite / Remote Sensing"
          badgeColor="rgba(188,140,255,.15)"
        />
        <div style={{ width: 1, background: 'var(--border)' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--gap-md)', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: '1.4rem' }}>⊕</div>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 120 }}>
            Integrated spatial reserve understanding
          </p>
        </div>
        <div style={{ width: 1, background: 'var(--border)' }} />
        <EvidenceBlock
          icon="⛏"
          label="Geological Evidence"
          color="var(--green)"
          items={['Borehole composites & assays', 'Mn / Fe / SiO₂ grade data', 'Spatial kriging interpolation', '3D block model classification']}
          badge="Boreholes / PRISM Kriging"
          badgeColor="rgba(63,185,80,.12)"
        />
      </div>

      {/* Disclaimer */}
      <div style={{
        background: 'rgba(88,166,255,.04)', border: '1px solid rgba(88,166,255,.15)',
        borderRadius: 'var(--radius-sm)', padding: '8px 14px',
        fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 'var(--gap-lg)', lineHeight: 1.6,
      }}>
        <em>
          Satellite observations provide surface indicators and spatial context; subsurface reserve
          estimation is supported by geological, borehole and assay data.
        </em>
      </div>

      <div className="grid-2" style={{ gap: 'var(--gap-lg)', alignItems: 'start' }}>
        {/* ── 3D block model ── */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--gap-md)', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontWeight: 600 }}>3D Mine Block Model — Kriging Reserve Estimate</span>
            <span className="text-muted text-small" style={{ marginLeft: 8 }}>
              Rotate · Zoom · Hover for block details
            </span>
          </div>
          {loadErr ? (
            <p style={{ padding: 'var(--gap-md)', color: 'var(--risk-high)' }}>
              Could not load block data: {loadErr}
            </p>
          ) : !blocks ? (
            <p style={{ padding: 'var(--gap-md)', color: 'var(--text-muted)', textAlign: 'center' }}>
              Loading block model…
            </p>
          ) : (
            <div ref={plotRef} style={{ height: 420 }} />
          )}
          <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Colour scale: blue → green → orange with increasing Mn grade. Waste blocks shown in dark grey.
            Block model: {prism.total_blocks?.toLocaleString()} blocks ({prism.ore_blocks} ore).
          </div>
        </div>

        {/* ── Geological summary ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
          <div className="card">
            <div className="section-label" style={{ marginBottom: 'var(--gap-md)' }}>Reserve Summary</div>
            <div className="big-number" style={{ color: 'var(--accent)', marginBottom: 4 }}>
              {(prism.declared_reserve_t / 1e6).toFixed(2)} Mt
            </div>
            <p className="text-muted text-small">Declared geological reserve</p>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 'var(--gap-md) 0' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-md)' }}>
              <StatItem label="Total blocks"    value={prism.total_blocks?.toLocaleString()} />
              <StatItem label="Ore blocks"      value={prism.ore_blocks}    color="var(--accent)" />
              <StatItem label="Waste blocks"    value={prism.waste_blocks} />
              <StatItem label="Average Mn"      value={`${prism.average_mn_pct}%`} color="var(--green)" />
              <StatItem label="Mn cutoff"       value={`${prism.mn_cutoff_pct}%`} />
              <StatItem label="Max Mn"          value={`${prism.max_estimated_mn_pct?.toFixed(1)}%`} />
            </div>
          </div>

          <div className="card">
            <div className="section-label" style={{ marginBottom: 'var(--gap-sm)' }}>Kriging Model</div>
            <p className="text-muted text-small" style={{ marginBottom: 'var(--gap-sm)' }}>
              Ordinary Kriging · Spherical variogram · 20 nearest neighbours
            </p>
            {prism.variogram && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: '0.8rem' }}>
                <KrigRow k="Nugget"  v={prism.variogram.nugget?.toFixed(2)} />
                <KrigRow k="Sill"    v={prism.variogram.sill?.toFixed(2)} />
                <KrigRow k="Range"   v={`${prism.variogram.range?.toFixed(0)} m`} />
                <KrigRow k="Partial" v={prism.variogram.partial?.toFixed(2)} />
              </div>
            )}
          </div>

          <div className="card" style={{ borderColor: 'var(--border-light)', background: 'rgba(88,166,255,.03)' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Geological reserve is estimated from borehole composites, not direct measurement.
              Grade continuity is modelled spatially — nearby blocks tend to have similar Mn grades.
              Surface spectral anomalies (Iron Oxide Index, Clay Index) from satellite data
              correlate with these grade patterns and provide additional spatial context.
            </p>
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
      <p style={{ fontWeight: 700, color: color ?? 'var(--text-primary)', fontSize: '1.05rem' }}>{value}</p>
    </div>
  )
}

function KrigRow({ k, v }) {
  return (
    <div className="flex-between" style={{ padding: '3px 0', borderBottom: '1px solid var(--border-light)' }}>
      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
      <span style={{ fontWeight: 600 }}>{v}</span>
    </div>
  )
}

function EvidenceBlock({ icon, label, color, items, badge, badgeColor }) {
  return (
    <div style={{ padding: 'var(--gap-md)', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: '0.88rem', color }}>{label}</span>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
          <span style={{ color, marginTop: 1, fontSize: '0.75rem' }}>▸</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item}</span>
        </div>
      ))}
      <div style={{
        marginTop: 6, padding: '3px 10px', borderRadius: 12,
        background: badgeColor, fontSize: '0.7rem', color, fontWeight: 600,
        display: 'inline-block', alignSelf: 'flex-start',
      }}>
        {badge}
      </div>
    </div>
  )
}
