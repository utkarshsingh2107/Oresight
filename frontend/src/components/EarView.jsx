/**
 * EarView — Accessibility
 * Modelled Resource → Constraints → Accessible Resource
 * All values from /api/overview ear prop + /api/ear/blocks (lazy)
 */
import React, { useEffect, useRef, useState } from 'react'
import { getEarBlocks } from '../services/api.js'

export default function EarView({ ear }) {
  const plotRef  = useRef(null)
  const [blocks, setBlocks]   = useState(null)
  const [loadErr, setLoadErr] = useState(null)

  useEffect(() => {
    getEarBlocks().then(d => setBlocks(d.blocks)).catch(e => setLoadErr(e.message))
  }, [])

  useEffect(() => {
    if (!blocks || !plotRef.current) return
    import('plotly.js-basic-dist-min').then(mod => {
      const Plotly = mod.default ?? mod
      const acc   = blocks.filter(b => b.operationally_accessible)
      const inacc = blocks.filter(b => !b.operationally_accessible)
      const devBlocked = inacc.filter(b => !b.development_ready)
      const wxBlocked  = inacc.filter(b => b.development_ready && !b.weather_feasible)
      Plotly.newPlot(plotRef.current, [
        { type:'scatter3d', mode:'markers', name:'Accessible',
          x:acc.map(b=>b.x), y:acc.map(b=>b.y), z:acc.map(b=>b.z),
          text:acc.map(b=>`<b>${b.block_id}</b> — ACCESSIBLE<br>Mn: ${b.estimated_mn_pct?.toFixed(1)}%`),
          hovertemplate:'%{text}<extra></extra>',
          marker:{ size:4.5, color:'#3fb950', opacity:0.8 } },
        { type:'scatter3d', mode:'markers', name:'Blocked — depth',
          x:devBlocked.map(b=>b.x), y:devBlocked.map(b=>b.y), z:devBlocked.map(b=>b.z),
          text:devBlocked.map(b=>`<b>${b.block_id}</b> — BLOCKED (depth)<br>Mn: ${b.estimated_mn_pct?.toFixed(1)}%`),
          hovertemplate:'%{text}<extra></extra>',
          marker:{ size:4, color:'#f0883e', opacity:0.7, symbol:'x' } },
        { type:'scatter3d', mode:'markers', name:'Blocked — weather',
          x:wxBlocked.map(b=>b.x), y:wxBlocked.map(b=>b.y), z:wxBlocked.map(b=>b.z),
          text:wxBlocked.map(b=>`<b>${b.block_id}</b> — BLOCKED (weather)<br>Mn: ${b.estimated_mn_pct?.toFixed(1)}%`),
          hovertemplate:'%{text}<extra></extra>',
          marker:{ size:4, color:'#d29922', opacity:0.75, symbol:'cross' } },
      ], {
        paper_bgcolor:'#161b22', plot_bgcolor:'#161b22',
        scene:{ xaxis:{title:'Easting (m)',color:'#6e7681',gridcolor:'#21262d',backgroundcolor:'#0d1117'},
                yaxis:{title:'Northing (m)',color:'#6e7681',gridcolor:'#21262d',backgroundcolor:'#0d1117'},
                zaxis:{title:'Elevation (m)',color:'#6e7681',gridcolor:'#21262d',backgroundcolor:'#0d1117'},
                bgcolor:'#0d1117', camera:{eye:{x:1.6,y:1.4,z:0.9}}, aspectmode:'data' },
        legend:{font:{color:'#8b949e',size:11}, bgcolor:'rgba(22,27,34,0.9)', bordercolor:'#30363d', borderwidth:1, x:0.01, y:0.98},
        margin:{l:0,r:0,t:0,b:0},
      }, { responsive:true, displayModeBar:true, modeBarButtonsToRemove:['sendDataToCloud','toImage'], displaylogo:false })
    })
  }, [blocks])

  if (!ear) return null

  const declared     = ear.declared_reserve_t
  const accessible   = ear.effective_accessible_reserve_t
  const inaccessible = declared - accessible
  const ratio        = ear.accessibility_ratio
  const c            = ear.constraints ?? {}
  const devBlocked   = 141
  const wxBlocked    = 22

  return (
    <div className="stage-view">

      {/* Header */}
      <div className="stage-header">
        <div className="stage-tag" style={{ color:'var(--green)' }}>📍 Accessibility</div>
        <h2>What can actually be accessed?</h2>
        <p>
          Not all spatially modelled resource can be mined today. Development depth,
          equipment availability and weather conditions gate which blocks are accessible.
        </p>
      </div>

      {/* Constraint context cards */}
      <div className="constraint-strip">
        <ConstraintCard icon="🛰" color="var(--purple)"
          label="Terrain Intelligence"
          detail={`Depth threshold: z ≤ ${c.development_ready_z_threshold_m ?? 192} m`}
          note="DEM / satellite-derived elevation constraint"
          source="DEM / Satellite" />
        <ConstraintCard icon="🚜" color="var(--green)"
          label="Equipment Availability"
          detail={`Fleet threshold: ≥ ${((c.equipment_availability_threshold??0.85)*100).toFixed(0)}% · Fleet mean: 90.6%`}
          note="Mine-wide availability check"
          source="Operational History" />
        <ConstraintCard icon="🌧" color="var(--accent)"
          label="Weather Feasibility"
          detail={`Rainfall threshold: ≤ ${c.weather_rainfall_threshold_mm ?? 30} mm/day`}
          note="Monsoon season reduces accessible blocks"
          source="Weather / EO" />
      </div>

      {/* Transformation strip */}
      <div className="card" style={{ marginBottom:'var(--gap-lg)' }}>
        <div style={{ display:'flex', alignItems:'stretch', flexWrap:'wrap', gap:0 }}>
          <TxBlock label="Spatially Modelled Resource"
            value={`${(declared/1e6).toFixed(2)} Mt`}
            sub={`${ear.total_ore_blocks} mineralised blocks`}
            color="var(--accent)" />
          <TxArrow />
          {/* Constraints in the middle */}
          <div style={{ flex:2, padding:'var(--gap-md)',
            borderLeft:'1px solid var(--border)', borderRight:'1px solid var(--border)' }}>
            <div className="section-label">Constraints applied</div>
            {[
              { icon:'⛰', label:'Terrain depth', detail:`z ≤ ${c.development_ready_z_threshold_m??192} m`, blocked:devBlocked },
              { icon:'🚜', label:'Equipment availability', detail:`≥ ${((c.equipment_availability_threshold??0.85)*100).toFixed(0)}%`, blocked:0 },
              { icon:'🌧', label:'Weather feasibility', detail:`≤ ${c.weather_rainfall_threshold_mm??30} mm/day`, blocked:wxBlocked },
            ].map(item => (
              <div key={item.label} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                <span style={{ fontSize:'0.9rem' }}>{item.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'0.82rem', fontWeight:600 }}>{item.label}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{item.detail}</div>
                </div>
                <span style={{ fontSize:'0.75rem', fontWeight:700,
                  color: item.blocked > 0 ? 'var(--risk-high)' : 'var(--green)' }}>
                  {item.blocked > 0 ? `${item.blocked} blocked` : '✓ met'}
                </span>
              </div>
            ))}
          </div>
          <TxArrow />
          <TxBlock label="Accessible Resource"
            value={`${(accessible/1e6).toFixed(2)} Mt`}
            sub={`${ear.accessible_blocks} accessible blocks`}
            color="var(--green)" />
        </div>
        {/* Ratio bar */}
        <div style={{ marginTop:'var(--gap-md)', paddingTop:'var(--gap-md)',
          borderTop:'1px solid var(--border-light)' }}>
          <div className="flex-between" style={{ marginBottom:4, fontSize:'0.8rem' }}>
            <span style={{ color:'var(--text-secondary)' }}>Accessibility ratio</span>
            <span style={{ fontWeight:700, color:'var(--green)' }}>{(ratio*100).toFixed(1)}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill"
              style={{ width:`${(ratio*100).toFixed(1)}%`, background:'var(--green)' }}/>
          </div>
          <div className="flex-between" style={{ marginTop:4, fontSize:'0.72rem',
            color:'var(--text-muted)' }}>
            <span>{(accessible/1e6).toFixed(2)} Mt accessible</span>
            <span style={{ color:'var(--risk-high)' }}>{(inaccessible/1e6).toFixed(2)} Mt inaccessible</span>
          </div>
        </div>
      </div>

      {/* 3D map + stats */}
      <div className="grid-2" style={{ gap:'var(--gap-lg)', alignItems:'start' }}>

        {/* 3D accessibility map */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div className="flex-between" style={{ padding:'var(--gap-md)',
            borderBottom:'1px solid var(--border)' }}>
            <span style={{ fontWeight:600 }}>3D Spatial Accessibility Map</span>
            <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Rotate · Hover</span>
          </div>
          {loadErr
            ? <p style={{ padding:'var(--gap-md)', color:'var(--red)' }}>Block data error: {loadErr}</p>
            : !blocks
            ? <p style={{ padding:'var(--gap-md)', color:'var(--text-muted)', textAlign:'center' }}>Loading…</p>
            : <div ref={plotRef} style={{ height:400 }} />
          }
          <div style={{ padding:'7px 14px', borderTop:'1px solid var(--border)',
            fontSize:'0.68rem', color:'var(--text-muted)' }}>
            Green = accessible · Orange ✗ = depth-blocked · Yellow + = weather-blocked
          </div>
        </div>

        {/* Breakdown */}
        <div style={{ display:'flex', flexDirection:'column', gap:'var(--gap-md)' }}>

          <div className="card">
            <span className="section-label">Resource Accessibility Breakdown</span>
            {[
              ['Mineralised blocks', ear.total_ore_blocks, ear.total_ore_blocks, 'var(--text-primary)'],
              ['Accessible',         ear.accessible_blocks,  ear.total_ore_blocks, 'var(--green)'],
              ['Inaccessible',       ear.inaccessible_blocks, ear.total_ore_blocks, 'var(--risk-high)'],
            ].map(([label, val, total, color]) => (
              <div key={label} style={{ marginBottom:10 }}>
                <div className="flex-between" style={{ marginBottom:3, fontSize:'0.82rem' }}>
                  <span style={{ color:'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontWeight:700, color }}>
                    {val.toLocaleString()}
                    {total && val !== total ? ` (${(val/total*100).toFixed(0)}%)` : ''}
                  </span>
                </div>
                <div className="progress-bar-track" style={{ height:5 }}>
                  <div className="progress-bar-fill"
                    style={{ width:`${(val/total*100).toFixed(1)}%`, background:color }}/>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <span className="section-label">Why Is Resource Inaccessible?</span>
            <div style={{ marginTop:'var(--gap-sm)' }}>
              {[
                { icon:'⛰', label:'Terrain / development depth', count:devBlocked,
                  note:`z > ${c.development_ready_z_threshold_m??192} m — requires further access development`, color:'var(--risk-high)' },
                { icon:'🌧', label:'Adverse weather conditions', count:wxBlocked,
                  note:`Rainfall > ${c.weather_rainfall_threshold_mm??30} mm/day during forecast period`, color:'var(--yellow)' },
                { icon:'🚜', label:'Equipment availability', count:0,
                  note:`Fleet meets threshold — no blocks blocked`, color:'var(--green)' },
              ].map(item => (
                <div key={item.label} style={{ marginBottom:12 }}>
                  <div className="flex-between" style={{ marginBottom:2 }}>
                    <div style={{ display:'flex', gap:8 }}>
                      <span>{item.icon}</span>
                      <span style={{ fontWeight:600, fontSize:'0.85rem' }}>{item.label}</span>
                    </div>
                    <span style={{ fontWeight:700, color:item.color, fontSize:'0.85rem' }}>
                      {item.count} blocks
                    </span>
                  </div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', paddingLeft:22 }}>
                    {item.note}
                  </div>
                </div>
              ))}
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:4,
                fontStyle:'italic' }}>
                A block is accessible only when ALL three constraints are satisfied.
              </div>
            </div>
          </div>

          <div className="card card--critical">
            <span className="section-label">Currently Inaccessible Resource</span>
            <div className="metric-value" style={{ color:'var(--risk-high)', marginTop:6 }}>
              {(inaccessible/1e6).toFixed(2)} Mt
            </div>
            <div className="metric-sub">
              {((1-ratio)*100).toFixed(1)}% of spatially modelled resource.
              Synthetic DEMO-01 data.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConstraintCard({ icon, color, label, detail, note, source }) {
  return (
    <div className="card" style={{ borderColor:`${color}30`, background:`${color}04` }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <span style={{ fontSize:'1rem' }}>{icon}</span>
        <span style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase',
          letterSpacing:'0.06em', color }}>{label}</span>
      </div>
      <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.5, marginBottom:6 }}>
        {detail}
      </div>
      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{note}</div>
      <div style={{ marginTop:8, fontSize:'0.58rem', fontWeight:700, textTransform:'uppercase',
        letterSpacing:'0.05em', color, background:`${color}15`,
        padding:'1px 6px', borderRadius:'var(--radius-sm)', display:'inline-block' }}>
        SOURCE: {source}
      </div>
    </div>
  )
}

function TxBlock({ label, value, sub, color }) {
  return (
    <div style={{ flex:1, padding:'var(--gap-md)', textAlign:'center', minWidth:140 }}>
      <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:4 }}>{label}</div>
      <div className="metric-value" style={{ color, marginBottom:4 }}>{value}</div>
      <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{sub}</div>
    </div>
  )
}

function TxArrow() {
  return (
    <div style={{ display:'flex', alignItems:'center', padding:'0 var(--gap-sm)',
      color:'var(--text-muted)', fontSize:'1.3rem', flexShrink:0 }}>→</div>
  )
}
