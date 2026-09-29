/**
 * PrismView — Resource Mapping section
 *
 * TECHNICAL NOTE:
 * Earth Observation provides surface spatial context and anomaly indicators.
 * Borehole assays provide subsurface Mn grade observations.
 * Ordinary Kriging interpolates the borehole-derived grades across the 3D block model.
 * EO data is NOT directly fed into Kriging — it provides independent surface evidence.
 */
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
        name: `Mineralised (Mn ≥ ${CUTOFF}%)`,
        x: ore.map(b => b.x), y: ore.map(b => b.y), z: ore.map(b => b.z),
        text: ore.map(b =>
          `<b>${b.block_id}</b><br>` +
          `Easting: ${b.x} m · Northing: ${b.y} m · Elev: ${b.z} m<br>` +
          `Kriging Mn estimate: ${b.estimated_mn_pct?.toFixed(1)}%<br>` +
          `Tonnage: ${Math.round(b.tonnage_t).toLocaleString()} t<br>` +
          `Kriging variance: ${b.kriging_variance?.toFixed(0)}`
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
          `<b>${b.block_id}</b><br>Kriging Mn: ${b.estimated_mn_pct?.toFixed(1)}% (below ${CUTOFF}% cutoff)`
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

  const v = prism.variogram ?? {}

  return (
    <div className="stage-view">

      {/* ── Section header ── */}
      <div style={{ marginBottom: 'var(--gap-lg)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 4 }}>
          🗺 INTERPRET — Resource Mapping
        </div>
        <h2 style={{ marginBottom: 6 }}>Where are the mineralised zones?</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 760, fontSize: '0.9rem', lineHeight: 1.65 }}>
          Earth observation provides surface spatial indicators, while borehole assays provide
          subsurface grade evidence. Ordinary Kriging interpolates borehole-derived Mn grades
          across the 3D block model to estimate the spatial distribution of mineralisation.
        </p>
      </div>

      {/* ── Evidence flow — vertical, technically correct ── */}
      <div className="card" style={{ marginBottom: 'var(--gap-lg)', background: 'var(--bg-card-alt)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 'var(--gap-md)' }}>
          How the resource model is built
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr 40px 1fr 40px 1fr', alignItems: 'center', gap: 0 }}>

          {/* EO — surface context only */}
          <EvidenceCol
            icon="🛰" label="Earth Observation"
            role="Surface spatial context"
            color="var(--purple)"
            items={['Surface spectral anomalies', 'Iron oxide index', 'Clay alteration index', 'NDVI / terrain']}
            note="Prioritises where to investigate"
          />

          <FlowArrow label="informs" />

          {/* Borehole — direct subsurface grades */}
          <EvidenceCol
            icon="⛏" label="Borehole + Assay"
            role="Subsurface grade evidence"
            color="var(--green)"
            items={['Mn / Fe / SiO₂ assays', 'Composite grades', 'Depth / collar coords', 'Spatial sample locations']}
            note="Direct subsurface measurement"
          />

          <FlowArrow label="input to" />

          {/* Kriging */}
          <EvidenceCol
            icon="📐" label="Ordinary Kriging"
            role="Spatial interpolation"
            color="var(--accent)"
            items={['Spherical variogram fit', '20 nearest neighbours', 'Grade estimated per block', 'Kriging variance output']}
            note="Interpolates borehole grades"
          />

          <FlowArrow label="produces" />

          {/* Resource model */}
          <EvidenceCol
            icon="🗺" label="Resource Model"
            role="Modelled mineral resource"
            color="var(--orange)"
            items={[
              `${(prism.declared_reserve_t / 1e6).toFixed(2)} Mt modelled`,
              `${prism.ore_blocks} mineralised blocks`,
              `${prism.average_mn_pct}% average Mn`,
              `${prism.mn_cutoff_pct}% Mn cutoff`,
            ]}
            note="Passes to Accessibility stage"
            highlight
          />
        </div>

        {/* Accuracy note */}
        <div style={{
          marginTop: 'var(--gap-md)', paddingTop: 'var(--gap-sm)',
          borderTop: '1px solid var(--border-light)',
          fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.6,
          fontStyle: 'italic', textAlign: 'center',
        }}>
          EO provides independent surface evidence; resource estimation is derived from
          borehole assays and spatial interpolation. Synthetic DEMO-01 data — not real MOIL mine data.
        </div>
      </div>

      {/* ── Main content: 3D model + stats ── */}
      <div className="grid-2" style={{ gap: 'var(--gap-lg)', alignItems: 'start' }}>

        {/* 3D block model */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--gap-md)', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontWeight: 600 }}>3D Resource Block Model</span>
              <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Rotate · Zoom · Hover for values
              </span>
            </div>
            <SourceBadge label="Borehole + Kriging" />
          </div>

          {loadErr ? (
            <p style={{ padding: 'var(--gap-md)', color: 'var(--risk-high)' }}>
              Could not load block data: {loadErr}
            </p>
          ) : !blocks ? (
            <p style={{ padding: 'var(--gap-md)', color: 'var(--text-muted)', textAlign: 'center' }}>
              Loading resource model…
            </p>
          ) : (
            <div ref={plotRef} style={{ height: 420 }} />
          )}

          <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border)',
            fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Colour scale: blue → green → orange with increasing Kriging-estimated Mn grade.
            Sub-cutoff blocks (Mn &lt; {CUTOFF}%) shown in dark grey.
            {' '}{prism.total_blocks?.toLocaleString()} total blocks · {prism.ore_blocks} mineralised.
          </div>
        </div>

        {/* Stats + Kriging params */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>

          {/* Resource summary */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gap-md)' }}>
              <span className="section-label">Modelled Mineral Resource</span>
              <SourceBadge label="Borehole + Kriging" />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1, marginBottom: 4 }}>
              {(prism.declared_reserve_t / 1e6).toFixed(2)} Mt
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 'var(--gap-md)' }}>
              Spatially modelled mineral resource — not a reserve statement
            </p>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: 'var(--gap-md)' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-sm)' }}>
              <StatItem label="Total blocks"       value={prism.total_blocks?.toLocaleString()} />
              <StatItem label="Mineralised blocks" value={prism.ore_blocks}      color="var(--accent)" />
              <StatItem label="Sub-cutoff blocks"  value={prism.waste_blocks} />
              <StatItem label="Average Mn grade"   value={`${prism.average_mn_pct}%`} color="var(--green)" />
              <StatItem label="Mn cutoff applied"  value={`${prism.mn_cutoff_pct}%`} />
              {prism.max_estimated_mn_pct != null && (
                <StatItem label="Max Mn (estimated)" value={`${Number(prism.max_estimated_mn_pct).toFixed(1)}%`} />
              )}
            </div>
          </div>

          {/* Kriging parameters — only fields confirmed in API response */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--gap-sm)' }}>
              <span className="section-label">Kriging Model Parameters</span>
              <SourceBadge label="Spatial Model" />
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 'var(--gap-sm)', lineHeight: 1.5 }}>
              Ordinary Kriging with a spherical variogram, using 20 nearest-neighbour boreholes
              per block to estimate Mn grade and kriging variance.
            </p>
            {v.nugget != null ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: '0.8rem' }}>
                <KrigRow k="Nugget"  v={Number(v.nugget).toFixed(2)} />
                <KrigRow k="Sill"    v={Number(v.sill).toFixed(2)} />
                <KrigRow k="Range"   v={`${Number(v.range).toFixed(0)} m`} />
                <KrigRow k="Partial" v={Number(v.partial).toFixed(2)} />
              </div>
            ) : (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Variogram parameters not available in current summary.
              </p>
            )}
          </div>

          {/* Key clarification card */}
          <div style={{
            background: 'rgba(88,166,255,.04)', border: '1px solid rgba(88,166,255,.18)',
            borderRadius: 'var(--radius-md)', padding: 'var(--gap-md)',
          }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: 'var(--accent)', marginBottom: 8 }}>
              How this connects to Space Intelligence
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <StoryRow icon="🛰" color="var(--purple)"
                text="Satellite data tells us WHERE surface anomalies and spatial patterns exist." />
              <StoryRow icon="⛏" color="var(--green)"
                text="Boreholes tell us WHAT is present below the surface." />
              <StoryRow icon="📐" color="var(--accent)"
                text="Kriging uses the borehole grades to estimate the 3D resource distribution." />
              <StoryRow icon="📍" color="var(--orange)"
                text="OreSight passes this resource model to Accessibility to determine what can realistically be mined." />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── sub-components ──────────────────────────────────────────── */

function EvidenceCol({ icon, label, role, color, items, note, highlight }) {
  return (
    <div style={{
      padding: '12px 10px', textAlign: 'center',
      background: highlight ? `${color}0c` : 'transparent',
      border: `1px solid ${highlight ? color + '30' : 'var(--border-light)'}`,
      borderRadius: 'var(--radius-sm)',
    }}>
      <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{icon}</div>
      <p style={{ fontSize: '0.72rem', fontWeight: 700, color, lineHeight: 1.3, marginBottom: 3 }}>
        {label}
      </p>
      <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: 6,
        fontStyle: 'italic', lineHeight: 1.3 }}>
        {role}
      </p>
      {items.map(item => (
        <p key={item} style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item}</p>
      ))}
      {note && (
        <div style={{
          marginTop: 6, fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.04em', color, background: `${color}15`,
          padding: '2px 6px', borderRadius: 8, display: 'inline-block',
        }}>
          {note}
        </div>
      )}
    </div>
  )
}

function FlowArrow({ label }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 4px' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: 2 }}>→</div>
      {label && (
        <p style={{ fontSize: '0.58rem', color: 'var(--text-muted)', textTransform: 'uppercase',
          letterSpacing: '0.04em', lineHeight: 1.2 }}>
          {label}
        </p>
      )}
    </div>
  )
}

function StoryRow({ icon, color, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{text}</p>
    </div>
  )
}

function SourceBadge({ label }) {
  return (
    <span style={{
      fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase',
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

function KrigRow({ k, v }) {
  return (
    <div className="flex-between" style={{ padding: '3px 0', borderBottom: '1px solid var(--border-light)' }}>
      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
      <span style={{ fontWeight: 600 }}>{v}</span>
    </div>
  )
}
