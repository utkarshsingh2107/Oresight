/**
 * PrismView — Resource Mapping
 * Evidence flow: EO (surface context) + Borehole (subsurface) → Kriging → 3D Resource Model
 * All values from /api/overview prism prop + /api/prism/blocks (lazy)
 */
import React, { useEffect, useRef, useState } from 'react'
import { getPrismBlocks } from '../services/api.js'

const CUTOFF = 20.0

export default function PrismView({ prism }) {
  const plotRef = useRef(null)
  const [blocks, setBlocks] = useState(null)
  const [loadErr, setLoadErr] = useState(null)

  useEffect(() => {
    getPrismBlocks().then(d => setBlocks(d.blocks)).catch(e => setLoadErr(e.message))
  }, [])

  useEffect(() => {
    if (!blocks || !plotRef.current) return
    import('plotly.js-basic-dist-min').then(mod => {
      const Plotly = mod.default ?? mod
      const ore   = blocks.filter(b => b.is_ore === 1)
      const waste = blocks.filter(b => b.is_ore === 0)
      Plotly.newPlot(plotRef.current, [
        {
          type:'scatter3d', mode:'markers', name:`Mineralised (Mn≥${CUTOFF}%)`,
          x:ore.map(b=>b.x), y:ore.map(b=>b.y), z:ore.map(b=>b.z),
          text:ore.map(b=>`<b>${b.block_id}</b><br>Mn: ${b.estimated_mn_pct?.toFixed(1)}%<br>Tonnage: ${Math.round(b.tonnage_t).toLocaleString()} t`),
          hovertemplate:'%{text}<extra></extra>',
          marker:{ size:4, color:ore.map(b=>b.estimated_mn_pct),
            colorscale:[[0,'#1f6feb'],[0.5,'#3fb950'],[1,'#f0883e']],
            colorbar:{ title:{text:'Mn %',font:{color:'#8b949e',size:11}}, tickfont:{color:'#8b949e',size:10}, len:0.6, x:1.02, bgcolor:'rgba(0,0,0,0)', bordercolor:'#30363d' },
            cmin:CUTOFF, cmax:42, opacity:0.85 },
        },
        {
          type:'scatter3d', mode:'markers', name:'Sub-cutoff',
          x:waste.map(b=>b.x), y:waste.map(b=>b.y), z:waste.map(b=>b.z),
          text:waste.map(b=>`<b>${b.block_id}</b><br>Mn: ${b.estimated_mn_pct?.toFixed(1)}%`),
          hovertemplate:'%{text}<extra></extra>',
          marker:{ size:2.5, color:'#21262d', opacity:0.22 },
        },
      ], {
        paper_bgcolor:'#161b22', plot_bgcolor:'#161b22',
        scene:{
          xaxis:{title:'Easting (m)',  color:'#6e7681', gridcolor:'#21262d', backgroundcolor:'#0d1117'},
          yaxis:{title:'Northing (m)', color:'#6e7681', gridcolor:'#21262d', backgroundcolor:'#0d1117'},
          zaxis:{title:'Elevation (m)',color:'#6e7681', gridcolor:'#21262d', backgroundcolor:'#0d1117'},
          bgcolor:'#0d1117', camera:{eye:{x:1.6,y:1.4,z:0.9}}, aspectmode:'data',
        },
        legend:{font:{color:'#8b949e',size:11}, bgcolor:'rgba(22,27,34,0.9)', bordercolor:'#30363d', borderwidth:1, x:0.01, y:0.98},
        margin:{l:0,r:0,t:0,b:0},
      }, { responsive:true, displayModeBar:true, modeBarButtonsToRemove:['sendDataToCloud','toImage'], displaylogo:false })
    })
  }, [blocks])

  if (!prism) return null
  const v = prism.variogram ?? {}

  return (
    <div className="stage-view">

      {/* Header */}
      <div className="stage-header">
        <div className="stage-tag" style={{ color:'var(--accent)' }}>🗺 Resource Mapping</div>
        <h2>Where are the mineralised zones?</h2>
        <p>
          Earth observation provides surface spatial context. Borehole assays provide subsurface
          grade evidence. Ordinary Kriging interpolates borehole-derived Mn grades across the 3D
          block model to estimate the spatial distribution of mineralisation.
        </p>
      </div>

      {/* Evidence flow */}
      <div className="evidence-flow">
        <EvidenceCol icon="🛰" label="Earth Observation" color="var(--purple)"
          role="Surface spatial context"
          lines={['Spectral anomalies','Iron oxide index','Clay alteration','NDVI / terrain']}
          tag="EO" />
        <div className="evidence-flow__op">→</div>
        <EvidenceCol icon="⛏" label="Borehole + Assay" color="var(--green)"
          role="Direct subsurface measurement"
          lines={['Mn / Fe / SiO₂ grades','Assay composites','Depth / collar coords']}
          tag="Borehole + Assay" />
        <div className="evidence-flow__op">→</div>
        <EvidenceCol icon="📐" label="Ordinary Kriging" color="var(--accent)"
          role="Spatial interpolation of borehole grades"
          lines={['Spherical variogram fit','20 nearest neighbours','Grade estimated per block']}
          tag="Spatial Model" />
        <div className="evidence-flow__op">=</div>
        <EvidenceCol icon="🗺" label="Resource Model" color="var(--primary)"
          role="Modelled mineral resource"
          lines={[`${(prism.declared_reserve_t/1e6).toFixed(2)} Mt modelled`,`${prism.ore_blocks} mineralised blocks`,`${prism.average_mn_pct}% avg Mn`]}
          tag="Output" highlight />
      </div>

      {/* Disclaimer */}
      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontStyle:'italic',
        marginBottom:'var(--gap-lg)', lineHeight:1.5 }}>
        EO provides independent surface evidence; resource estimation is derived from borehole
        assays and spatial interpolation. Synthetic DEMO-01 data — not real MOIL mine data.
      </div>

      {/* 3D model + stats */}
      <div className="grid-2" style={{ gap:'var(--gap-lg)', alignItems:'start' }}>

        {/* 3D block model */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div className="flex-between" style={{ padding:'var(--gap-md)',
            borderBottom:'1px solid var(--border)' }}>
            <div>
              <span style={{ fontWeight:600 }}>3D Resource Block Model</span>
              <span style={{ marginLeft:8, fontSize:'0.72rem', color:'var(--text-muted)' }}>
                Rotate · Zoom · Hover
              </span>
            </div>
            <span style={{ fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase',
              letterSpacing:'0.05em', color:'var(--purple)', background:'rgba(188,140,255,.12)',
              border:'1px solid rgba(188,140,255,.25)', padding:'2px 7px',
              borderRadius:'var(--radius-sm)' }}>Borehole + Kriging</span>
          </div>
          {loadErr
            ? <p style={{ padding:'var(--gap-md)', color:'var(--red)' }}>Could not load blocks: {loadErr}</p>
            : !blocks
            ? <p style={{ padding:'var(--gap-md)', color:'var(--text-muted)', textAlign:'center' }}>Loading resource model…</p>
            : <div ref={plotRef} style={{ height:420 }} />
          }
          <div style={{ padding:'7px 14px', borderTop:'1px solid var(--border)',
            fontSize:'0.68rem', color:'var(--text-muted)' }}>
            Colour: blue → green → orange = increasing Mn grade.
            {' '}{prism.total_blocks?.toLocaleString()} blocks · {prism.ore_blocks} mineralised.
          </div>
        </div>

        {/* Stats column */}
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--gap-md)' }}>

          {/* Resource summary */}
          <div className="card">
            <div className="flex-between mb-md">
              <span className="section-label">Modelled Mineral Resource</span>
              <span style={{ fontSize:'0.6rem', fontWeight:700, textTransform:'uppercase',
                letterSpacing:'0.05em', color:'var(--accent)', background:'rgba(147,204,255,.12)',
                border:'1px solid rgba(147,204,255,.25)', padding:'2px 6px', borderRadius:'var(--radius-sm)' }}>
                Borehole + Kriging
              </span>
            </div>
            <div className="metric-value" style={{ color:'var(--accent)', marginBottom:3 }}>
              {(prism.declared_reserve_t/1e6).toFixed(2)} Mt
            </div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:'var(--gap-md)' }}>
              Spatially modelled — not a reserve statement
            </div>
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:'var(--gap-md)' }}>
              {[
                ['Total blocks',       prism.total_blocks?.toLocaleString()],
                ['Mineralised blocks', prism.ore_blocks,   'var(--accent)'],
                ['Sub-cutoff blocks',  prism.waste_blocks],
                ['Average Mn grade',   `${prism.average_mn_pct}%`, 'var(--green)'],
                ['Mn cutoff',          `${prism.mn_cutoff_pct}%`],
                ...(prism.max_estimated_mn_pct != null
                  ? [['Max Mn (estimated)', `${Number(prism.max_estimated_mn_pct).toFixed(1)}%`]]
                  : [])
              ].map(([k, val, c]) => (
                <div key={k} className="stat-row">
                  <span className="stat-row__label">{k}</span>
                  <span className="stat-row__value" style={{ color:c??'var(--text-primary)' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Kriging parameters — only API-confirmed fields */}
          {v.nugget != null && (
            <div className="card">
              <span className="section-label">Kriging Model Parameters</span>
              <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)', margin:'6px 0 10px',
                lineHeight:1.5 }}>
                Ordinary Kriging · Spherical variogram · 20 nearest neighbours
              </p>
              {[
                ['Nugget',  Number(v.nugget).toFixed(2)],
                ['Sill',    Number(v.sill).toFixed(2)],
                ['Range',   `${Number(v.range).toFixed(0)} m`],
                ['Partial', Number(v.partial).toFixed(2)],
              ].map(([k, val]) => (
                <div key={k} className="stat-row">
                  <span className="stat-row__label">{k}</span>
                  <span className="stat-row__value">{val}</span>
                </div>
              ))}
            </div>
          )}

          {/* 4-story card */}
          <div className="card" style={{ background:'rgba(147,204,255,.04)',
            borderColor:'rgba(147,204,255,.18)' }}>
            <span className="section-label" style={{ marginBottom:'var(--gap-sm)' }}>
              How this connects to Space Intelligence
            </span>
            {[
              ['🛰','var(--purple)','Satellite tells us WHERE surface anomalies exist.'],
              ['⛏','var(--green)', 'Boreholes tell us WHAT is present below the surface.'],
              ['📐','var(--accent)','Kriging uses borehole grades to estimate the 3D resource.'],
              ['📍','var(--primary)','This resource model passes to Accessibility to determine what can be mined.'],
            ].map(([icon, color, text]) => (
              <div key={text} style={{ display:'flex', gap:10, marginBottom:8, alignItems:'flex-start' }}>
                <span style={{ fontSize:'0.95rem', flexShrink:0 }}>{icon}</span>
                <p style={{ fontSize:'0.78rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EvidenceCol({ icon, label, color, role: roleLabel, lines, tag, highlight }) {
  return (
    <div className="evidence-flow__block"
      style={{ background: highlight ? 'rgba(217,119,6,.05)' : 'transparent' }}>
      <div style={{ fontSize:'1rem', marginBottom:4 }}>{icon}</div>
      <div style={{ fontSize:'0.65rem', fontWeight:700, textTransform:'uppercase',
        letterSpacing:'0.06em', color, marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:'0.67rem', color:'var(--text-muted)', fontStyle:'italic',
        marginBottom:6 }}>{roleLabel}</div>
      {lines.map(l => (
        <div key={l} style={{ fontSize:'0.72rem', color:'var(--text-secondary)',
          lineHeight:1.5 }}>{l}</div>
      ))}
      {tag && (
        <div style={{ marginTop:6, fontSize:'0.58rem', fontWeight:700, textTransform:'uppercase',
          letterSpacing:'0.05em', color, background:`${color}15`,
          padding:'1px 6px', borderRadius:'var(--radius-sm)', display:'inline-block' }}>
          {tag}
        </div>
      )}
    </div>
  )
}
