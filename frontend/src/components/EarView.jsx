/**
 * EarView — Accessibility & Operational Constraints (Stitch "Industrial Telemetry & Mineral Ops")
 * Direct implementation matching stitch_oresight_ui_redesign/screens/stage04_accessibility.html
 * Preserves dynamic API data from /api/overview ear prop and /api/ear/blocks.
 */
import React, { useEffect, useRef, useState } from 'react'
import { getEarBlocks } from '../services/api.js'

export default function EarView({ ear }) {
  const plotRef = useRef(null)
  const [blocks, setBlocks] = useState(null)
  const [loadErr, setLoadErr] = useState(null)

  const e = ear ?? {}
  const declaredMt = (Number(e.declared_reserve_t ?? 48271696.4) / 1e6).toFixed(2)
  const accessibleMt = (Number(e.effective_accessible_reserve_t ?? 32736929.4) / 1e6).toFixed(2)
  const lockedMt = (Number(declaredMt) - Number(accessibleMt)).toFixed(2)
  const accessRatio = (Number(e.accessibility_ratio ?? 0.6782) * 100).toFixed(1)
  const accBlocks = e.accessible_blocks ?? 339
  const lockedBlocks = e.inaccessible_blocks ?? 159
  const totalOreBlocks = e.total_ore_blocks ?? 498
  const c = e.constraints ?? {}
  const zThreshold = c.development_ready_z_threshold_m ?? 192
  const wxScore = (Number(c.weather_feasibility_score ?? 0.9434) * 100).toFixed(1)

  useEffect(() => {
    getEarBlocks()
      .then((d) => setBlocks(d.blocks))
      .catch((err) => setLoadErr(err.message))
  }, [])

  useEffect(() => {
    if (!blocks || !plotRef.current) return

    import('plotly.js-basic-dist-min').then((mod) => {
      const Plotly = mod.default ?? mod
      const acc = blocks.filter((b) => b.operationally_accessible)
      const inacc = blocks.filter((b) => !b.operationally_accessible)

      Plotly.newPlot(
        plotRef.current,
        [
          {
            type: 'scatter3d',
            mode: 'markers',
            name: `Accessible (${acc.length} blks)`,
            x: acc.map((b) => b.x),
            y: acc.map((b) => b.y),
            z: acc.map((b) => b.z),
            text: acc.map((b) => `<b>${b.block_id}</b> — ACCESSIBLE<br>Elevation: ${b.z} mRL<br>Grade: ${b.estimated_mn_pct?.toFixed(1)}% Mn`),
            hovertemplate: '%{text}<extra></extra>',
            marker: { size: 4, color: '#7bd0ff', opacity: 0.95 },
          },
          {
            type: 'scatter3d',
            mode: 'markers',
            name: `Restricted (${inacc.length} blks)`,
            x: inacc.map((b) => b.x),
            y: inacc.map((b) => b.y),
            z: inacc.map((b) => b.z),
            text: inacc.map((b) => `<b>${b.block_id}</b> — RESTRICTED<br>Elevation: ${b.z} mRL (below ${zThreshold}mRL)`),
            hovertemplate: '%{text}<extra></extra>',
            marker: { size: 3.5, color: '#ffb4ab', opacity: 0.75 },
          },
        ],
        {
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { family: 'Inter, sans-serif', color: '#d4e4fa' },
          margin: { l: 0, r: 0, t: 0, b: 0 },
          scene: {
            xaxis: { title: { text: 'Easting (m)', font: { size: 10, color: '#89929b' } }, tickfont: { size: 9, color: '#89929b' }, gridcolor: '#1c2b3c', backgroundcolor: 'transparent' },
            yaxis: { title: { text: 'Northing (m)', font: { size: 10, color: '#89929b' } }, tickfont: { size: 9, color: '#89929b' }, gridcolor: '#1c2b3c', backgroundcolor: 'transparent' },
            zaxis: { title: { text: 'Elevation (mRL)', font: { size: 10, color: '#89929b' } }, tickfont: { size: 9, color: '#89929b' }, gridcolor: '#1c2b3c', backgroundcolor: 'transparent' },
            camera: { eye: { x: 1.5, y: -1.7, z: 1.2 } },
          },
          legend: { x: 0.02, y: 0.98, font: { size: 11, color: '#d4e4fa' }, bgcolor: 'rgba(13, 28, 45, 0.85)', bordercolor: '#1c2b3c', borderwidth: 1 },
        },
        { responsive: true, displayModeBar: false }
      )
    })
  }, [blocks, zThreshold])

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1720px] mx-auto pb-12">

      {/* ── 1. Header Section with Operational Context & Definition Banner ── */}
      <div className="flex flex-col gap-3 pb-2 border-b border-border/40">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-sm" />
            <span className="font-label-telemetry uppercase text-secondary tracking-widest font-bold">
              LAYER 04 // OPERATIONAL FEASIBILITY
            </span>
            <span className="font-label-code text-on-surface-variant">• GEO-BLOCK FILTER ENGINE ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-lg border border-border">
            <span className="font-label-telemetry text-outline uppercase font-semibold">CURRENT BENCHMARK RULESET:</span>
            <span className="font-label-code text-primary font-bold">JORC-2012 / CLAUSE 49 MINEABILITY</span>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-label-code text-secondary font-semibold uppercase text-xs">
                Question 04: "What can actually be accessed?"
              </span>
            </div>
            <h1 className="font-headline-lg text-2xl md:text-3xl text-on-surface font-bold tracking-tight">
              Accessibility &amp; Operational Constraints
            </h1>
            <p className="text-secondary text-sm md:text-base max-w-3xl">
              Mineability Filter · What part of the modelled resource can realistically be accessed under active subterranean constraints?
            </p>
          </div>

          {/* Definition Callout */}
          <div className="xl:max-w-md w-full bg-surface-container-high/80 border border-border p-3 rounded-xl shadow-md text-xs">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">verified_user</span>
              <div className="flex flex-col gap-0.5">
                <span className="font-label-telemetry uppercase text-secondary font-bold text-[10px]">
                  Standard Definition: Accessibility
                </span>
                <p className="text-on-surface-variant leading-relaxed">
                  How much of the modelled resource can be reached under current operational, geotechnical, and environmental constraints.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Top Core Metrics Row (5 cards from Stitch) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1 */}
        <div className="bg-surface-container border border-border p-4 rounded-xl shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-telemetry text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold">Modelled Resource</span>
            <span className="material-symbols-outlined text-outline text-[18px]">layers</span>
          </div>
          <div className="my-2">
            <span className="font-display-metric text-2xl md:text-3xl text-on-surface font-bold tracking-tight">{declaredMt}</span>
            <span className="text-sm text-outline ml-1 font-semibold">Mt</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
            <span className="font-label-code text-on-surface-variant">Declared in-situ reserve</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container border border-border p-4 rounded-xl shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-telemetry text-[10px] uppercase text-secondary tracking-wider font-semibold">Accessible Resource</span>
            <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
          </div>
          <div className="my-2">
            <span className="font-display-metric text-2xl md:text-3xl text-secondary font-bold tracking-tight">{accessibleMt}</span>
            <span className="text-sm text-secondary/70 ml-1 font-semibold">Mt</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="font-label-code text-secondary font-semibold">67.8% net extraction yield</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container border border-border p-4 rounded-xl shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-telemetry text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold">Accessibility Ratio</span>
            <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
          </div>
          <div className="my-2">
            <span className="font-display-metric text-2xl md:text-3xl text-on-surface font-bold tracking-tight">{accessRatio}%</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-label-telemetry text-[9px] uppercase px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-bold">PASS</span>
            <span className="font-label-code text-on-surface-variant">Benchmark: ≥65.0%</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container border border-border p-4 rounded-xl shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-telemetry text-[10px] uppercase text-on-surface-variant tracking-wider font-semibold">Accessible Blocks</span>
            <span className="material-symbols-outlined text-secondary text-[18px]">grid_view</span>
          </div>
          <div className="my-2">
            <span className="font-display-metric text-2xl md:text-3xl text-on-surface font-bold tracking-tight">{accBlocks}</span>
            <span className="text-sm text-outline ml-1">blks</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="font-label-code text-on-surface-variant">Cleared for extraction</span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="bg-surface-container border border-border p-4 rounded-xl shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-telemetry text-[10px] uppercase text-error tracking-wider font-bold">Restricted / Locked</span>
            <span className="material-symbols-outlined text-error text-[18px]">lock</span>
          </div>
          <div className="my-2">
            <span className="font-display-metric text-2xl md:text-3xl text-error font-bold tracking-tight">{lockedBlocks}</span>
            <span className="text-sm text-error/70 ml-1">blks</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-error" />
            <span className="font-label-code text-error font-semibold">−{lockedMt} Mt active barriers</span>
          </div>
        </div>
      </div>

      {/* ── 3. Operational Gating Cascade Cards (Stitch) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-surface-container-low border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-xs font-bold text-on-surface">1. Geotechnical Slope</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-secondary text-[10px] font-bold">STABLE</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Bench slope angle constrained to &le; 45° across pit walls. Radar satellite InSAR interferometry confirms zero active slope displacement.
          </p>
          <div className="bg-surface-container p-2 rounded-lg text-xs font-label-code flex justify-between">
            <span className="text-outline">Max Bench Angle</span>
            <span className="text-secondary font-bold">45.0°</span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-xs font-bold text-on-surface">2. Development Depth (Z)</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary text-[10px] font-bold">GATE ACTIVE</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Blocks below {zThreshold} mRL elevation require secondary incline advance before stope stoping can commence.
          </p>
          <div className="bg-surface-container p-2 rounded-lg text-xs font-label-code flex justify-between">
            <span className="text-outline">Active Threshold</span>
            <span className="text-primary font-bold">&ge; {zThreshold} mRL</span>
          </div>
        </div>

        <div className="bg-surface-container-low border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="font-headline-sm text-xs font-bold text-on-surface">3. Weather &amp; Moisture</span>
            <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-secondary text-[10px] font-bold">NOMINAL</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Monsoon rainfall threshold &le; 30 mm/d. Surface moisture tracking confirms haul road clearance and pit drainage readiness.
          </p>
          <div className="bg-surface-container p-2 rounded-lg text-xs font-label-code flex justify-between">
            <span className="text-outline">Feasibility Index</span>
            <span className="text-secondary font-bold">{wxScore}%</span>
          </div>
        </div>
      </div>

      {/* ── 4. Spatial 3D Accessibility Model (Stitch) ── */}
      <div className="w-full bg-surface-container-lowest border border-border rounded-xl overflow-hidden shadow-xl p-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-label-telemetry uppercase text-on-surface font-bold tracking-wider">
              3D SPATIAL ACCESSIBILITY MATRIX
            </span>
          </div>
          <span className="font-label-code text-outline">
            {accBlocks} Accessible / {totalOreBlocks} Ore Blocks ({accessRatio}%)
          </span>
        </div>

        <div className="w-full h-[520px] relative my-2" ref={plotRef}>
          {loadErr && (
            <div className="p-4 text-error text-center text-xs">
              Could not load accessibility blocks: {loadErr}
            </div>
          )}
          {!blocks && !loadErr && (
            <div className="flex items-center justify-center h-full text-secondary text-xs">
              Filtering 498 mineralised ore blocks through operational constraints…
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
