import React, { useEffect, useRef, useState } from 'react'
import { getPrismBlocks } from '../services/api.js'

const CUTOFF = 20.0

export default function PrismView({ prism }) {
  const plotRef  = useRef(null)
  const [blocks, setBlocks]   = useState(null)
  const [loadErr, setLoadErr] = useState(null)

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
        name: `Mineralised block (Mn ≥ ${CUTOFF}%)`,
        x: ore.map(b => b.x), y: ore.map(b => b.y), z: ore.map(b => b.z),
        text: ore.map(b =>
          `<b>${b.block_id}</b><br>` +
          `Easting: ${b.x} m · Northing: ${b.y} m · Elev: ${b.z} m<br>` +
          `Mn grade: ${b.estimated_mn_pct?.toFixed(1)}%<br>` +
          `Tonnage: ${Math.round(b.tonnage_t).toLocaleString()} t<br>` +
          `Kriging uncertainty: ±${b.kriging_variance?.toFixed(0)}`
        ),
        hovertemplate: '%{text}<extra></extra>',
        marker: {
          size: 4,
          color: ore.map(b => b.estimated_mn_pct),
          colorscale: [[0, '#1f6feb'], [0.5, '#3fb950'], [1, '#f0883e']],
          colorbar: {
            title: { text: 'Mn %', font: { color: '#8b949e', size: 11 } },
            tickfont: { color: '#8b949e', size: 10 },
            len: 0.6, x: 1.02,
            bgcolor: 'rgba(0,0,0,0)', bordercolor: '#30363d',
          },
          cmin: CUTOFF, cmax: 42,
          opacity: 0.85,
        },
      }

      const trace_waste = {
        type: 'scatter3d', mode: 'markers',
        name: 'Sub-cutoff block',
        x: waste.map(b => b.x), y: waste.map(b => b.y), z: waste.map(b => b.z),
        text: waste.map(b =>
          `<b>${b.block_id}</b><br>Mn: ${b.estimated_mn_pct?.toFixed(1)}% (below cutoff)`
        ),
        hovertemplate: '%{text}<extra></extra>',
        marker: { size: 2.5, color: '#21262d', opacity: 0.22 },
      }

      const layout = {
        paper_bgcolor: '#161b22', plot_bgcolor: '#161b22',
        scene: {
          xaxis: { title: 'Easting (m)',  color: '#6e7681', gridcolor: '#21262d', backgroundcolor: '#0d1117' },
          yaxis: { title: 'Northing (m)', color: '#6e7681', gridcolor: '#21262d', backgroundcolor: '#0d1117' },
          zaxis: { title: 'Elevation (m)',color: '#6e7681', gridcolor: '#21262d', backgroundcolor: '#0d1117' },
          bgcolor: '#0d1117',
          camera: { eye: { x: 1.6, y: 1.4, z: 0.9 } },
          aspectmode: 'data',
        },
        legend: {
          font: { color: '#8b949e', size: 11 },
          bgcolor: 'rgba(22,27,34,0.9)', bordercolor: '#30363d', borderwidth: 1,
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

      {/* Header */}
      <div style={{ marginBottom: 'var(--gap-lg)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 4 }}>
          🗺 INTERPRET — Resource Mapping
        </div>
        <h2 style={{ marginBottom: 6 }}>Where are the mineralised zones?</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 760, fontSize: '0.9rem' }}>
          Earth observation data identifies surface spectral anomalies, while borehole assays provide
          subsurface validation. Spatial interpolation (Ordinary Kriging) combines both evidence
          streams to estimate mineralised zones across the full 3D spatial resource model.
        </p>
      </div>

      {/* Evidence Fusion indicator */}
      <div className="card" style={{ marginBottom: 'var(--gap-lg)', background: 'var(--bg-card-alt)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 'var(--gap-md)' }}>
          Evidence Fusion
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr', alignItems: 'center', gap: 0 }}>
          <FusionBlock icon="🛰" label="Satellite Evidence" color="var(--purple)"
            items={['Spectral anomalies', 'Iron oxide index', 'Clay alteration', 'NDVI stress']}
            source="Earth Observation" />
          <FusionOp op="+" />
          <FusionBlock icon="⛏" label="Borehole Evidence" color="var(--green)"
            items={['Mn / Fe / SiO₂', 'Assay composites', 'Depth / collar z', 'Spatial coordinates']}
            source="Borehole + Assay" />
          <FusionOp op="+" />
          <FusionBlock icon="📐" label="Spatial Model" color="var(--accent)"
            items={['Ordinary Kriging', 'Spherical variogram', 'Z-anisotropy ×5', '20-NN estimation']}
            source="Spatial Model" />
          <FusionOp op="=" />
          <FusionBlock icon="🗺" label="Resource Intelligence" color="var(--orange)"
            items={[`${(prism.declared_reserve_t/1e6).toFixed(2)} Mt modelled`, `${prism.ore_blocks} mineralised blocks`, `${prism.average_mn_pct}% avg Mn`]}
            source="Spatial Model" highlight />
        </div>
      </div>

      {/* EO disclaimer */}
      <div style={{
        background: 'rgba(88,166,255,.04)', border: '1px solid rgba(88,166,255,.15)',
        borderRadius: 'var(--radius-sm)', padding: '8px 14px',
        fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 'var(--gap-lg)', lineHeight: 1.6,
      }}>
        <em>
          Satellite observations provide surface indicators and spatial context;
          subsurface reserve estimation is supported by geological, borehole and assay data.
          Results are based on synthetic DEMO-01 data calibrated to realistic Balaghat-type geology.
        </em>
      </div>

      <div className="grid-2" style={{ gap: 'var(--gap-lg)', alignItems: 'start' }}>

        {/* 3D Spatial Resource Model */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--gap-md)', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 600 }}>3D Spatial Resource Model</span>
              <span className="text-muted text-small" style={{ marginLeft: 8 }}>Rotate · Zoom · Hover</span>
            </div>
            <SourceBadge label="Spatial Model" />
          </div>
          {loadErr ? (
            <p style={{ padding: 'var(--gap-md)', color: 'var(--risk-high)' }}>
              Could not load block data: {loadErr}
            </p>
          ) : !blocks ? (
            <p style={{ padding: 'var(--gap-md)', color: 'var(--text-muted)', textAlign: 'center' }}>
              Loading spatial model…
            </p>
          ) : (
            <div ref={plotRef} style={{ height: 420 }} />
          )}
          <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Colour: blue → green → orange with increasing Mn grade. Sub-cutoff blocks in dark grey.
            {' '}{prism.total_blocks?.toLocaleString()} total blocks · {prism.ore_blocks} mineralised.
          </div>
        </div>

        {/* Stats column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gap-md)' }}>
              <div className="section-label">Spatially Modelled Mineral Resource</div>
              <SourceBadge label="Spatial Model" />
            </div>
            <div className="big-number" style={{ color: 'var(--accent)', marginBottom: 4 }}>
              {(prism.declared_reserve_t / 1e6).toFixed(2)} Mt
            </div>
            <p className="text-muted text-small">Spatially modelled mineral resource (synthetic)</p>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 'var(--gap-md) 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-md)' }}>
              <StatItem label="Total blocks"      value={prism.total_blocks?.toLocaleString()} />
              <StatItem label="Mineralised blocks"value={prism.ore_blocks}     color="var(--accent)" />
              <StatItem label="Sub-cutoff blocks" value={prism.waste_blocks} />
              <StatItem label="Average Mn"        value={`${prism.average_mn_pct}%`} color="var(--green)" />
              <StatItem label="Mn cutoff"         value={`${prism.mn_cutoff_pct}%`} />
              <StatItem label="Max Mn"            value={`${prism.max_estimated_mn_pct?.toFixed(1)}%`} />
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gap-sm)' }}>
              <div className="section-label">Spatial Interpolation Model</div>
              <SourceBadge label="Spatial Model" />
            </div>
            <p className="text-muted text-small" style={{ marginBottom: 'var(--gap-sm)' }}>
              Ordinary Kriging · Spherical variogram · 20 nearest neighbours
            </p>
            {prism.variogram && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: '0.8rem' }}>
                <KrigRow k="Nugget"       v={prism.variogram.nugget?.toFixed(2)} />
                <KrigRow k="Sill"         v={prism.variogram.sill?.toFixed(2)} />
                <KrigRow k="Range"        v={`${prism.variogram.range?.toFixed(0)} m`} />
                <KrigRow k="Z-anisotropy" v="×5" />
              </div>
            )}
          </div>

          <div className="card" style={{ background: 'rgba(88,166,255,.03)', borderColor: 'var(--border-light)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Resource estimate is derived from borehole composites and spatial interpolation —
              not direct measurement. EO-derived surface anomalies (Iron Oxide Index, Clay Index)
              correlate with grade patterns and provide independent spatial evidence.
              Results are based on synthetic DEMO-01 data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── helpers ──────────────────────────────────────────────────── */
function FusionBlock({ icon, label, color, items, source, highlight }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: highlight ? `${color}0d` : 'transparent',
      border: highlight ? `1px solid ${color}30` : '1px solid var(--border-light)',
      borderRadius: 'var(--radius-sm)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.1rem', marginBottom: 3 }}>{icon}</div>
      <p style={{ fontSize: '0.72rem', fontWeight: 700, color, marginBottom: 4, lineHeight: 1.3 }}>{label}</p>
      {items.map(item => (
        <p key={item} style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item}</p>
      ))}
      <div style={{
        marginTop: 6, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.05em', color, background: `${color}15`,
        padding: '1px 6px', borderRadius: 8, display: 'inline-block',
      }}>
        SOURCE: {source}
      </div>
    </div>
  )
}

function FusionOp({ op }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 6px', color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.1rem' }}>
      {op}
    </div>
  )
}

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
      <p style={{ fontWeight: 700, color: color ?? 'var(--text-primary)', fontSize: '1.02rem' }}>{value}</p>
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
