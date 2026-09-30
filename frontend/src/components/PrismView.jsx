/**
 * PrismView — Resource Mapping (Stitch "Industrial Telemetry & Mineral Ops")
 * Direct implementation matching stitch_oresight_ui_redesign/screens/stage03_resource_mapping.html
 * Integrates interactive Plotly WebGL 3D block model with live API data.
 */
import React, { useEffect, useRef, useState } from 'react'
import { getPrismBlocks } from '../services/api.js'

const CUTOFF_GRADE = 20.0

export default function PrismView({ prism }) {
  const plotRef = useRef(null)
  const [blocks, setBlocks] = useState(null)
  const [showWaste, setShowWaste] = useState(true)
  const [loadErr, setLoadErr] = useState(null)

  const p = prism ?? {}
  const declaredMt = (Number(p.declared_reserve_t ?? 48271696.4) / 1e6).toFixed(2)
  const totalBlocks = p.total_blocks ?? 2240
  const oreBlocks = p.ore_blocks ?? 498
  const avgGrade = (p.average_mn_pct ?? 25.246).toFixed(3)
  const cutoff = p.mn_cutoff_pct ?? 20.0
  const variogram = p.variogram ?? { nugget: 9.9, sill: 197.97, range: 224.34, partial: 188.07 }

  useEffect(() => {
    getPrismBlocks()
      .then((d) => setBlocks(d.blocks))
      .catch((e) => setLoadErr(e.message))
  }, [])

  useEffect(() => {
    if (!blocks || !plotRef.current) return

    import('plotly.js-basic-dist-min').then((mod) => {
      const Plotly = mod.default ?? mod
      const ore = blocks.filter((b) => b.is_ore === 1)
      const waste = blocks.filter((b) => b.is_ore === 0)

      const traces = [
        {
          type: 'scatter3d',
          mode: 'markers',
          name: `Mineralised (Mn ≥ ${cutoff}%)`,
          x: ore.map((b) => b.x),
          y: ore.map((b) => b.y),
          z: ore.map((b) => b.z),
          text: ore.map(
            (b) =>
              `<b>${b.block_id}</b><br>Estimated Mn: ${b.estimated_mn_pct?.toFixed(1)}%<br>Tonnage: ${Math.round(
                b.tonnage_t
              ).toLocaleString()} t`
          ),
          hovertemplate: '%{text}<extra></extra>',
          marker: {
            size: 4,
            color: ore.map((b) => b.estimated_mn_pct),
            colorscale: [
              [0, '#0284c7'],
              [0.3, '#38bdf8'],
              [0.6, '#ffd165'],
              [1, '#eab308'],
            ],
            colorbar: {
              title: { text: 'Mn %', font: { color: '#d4e4fa', size: 11, family: 'Inter' } },
              tickfont: { color: '#89929b', size: 10, family: 'Inter' },
              len: 0.7,
              thickness: 12,
              x: 1.02,
            },
            opacity: 0.95,
          },
        },
      ]

      if (showWaste) {
        traces.push({
          type: 'scatter3d',
          mode: 'markers',
          name: `Waste (Mn < ${cutoff}%)`,
          x: waste.map((b) => b.x),
          y: waste.map((b) => b.y),
          z: waste.map((b) => b.z),
          hoverinfo: 'none',
          marker: {
            size: 2,
            color: 'rgba(57, 72, 90, 0.25)',
            opacity: 0.25,
          },
        })
      }

      Plotly.newPlot(
        plotRef.current,
        traces,
        {
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { family: 'Inter, sans-serif', color: '#d4e4fa' },
          margin: { l: 0, r: 0, t: 0, b: 0 },
          scene: {
            xaxis: {
              title: { text: 'Easting (m)', font: { size: 10, color: '#89929b' } },
              tickfont: { size: 9, color: '#89929b' },
              gridcolor: '#1c2b3c',
              zerolinecolor: '#3198dc',
              backgroundcolor: 'transparent',
            },
            yaxis: {
              title: { text: 'Northing (m)', font: { size: 10, color: '#89929b' } },
              tickfont: { size: 9, color: '#89929b' },
              gridcolor: '#1c2b3c',
              zerolinecolor: '#3198dc',
              backgroundcolor: 'transparent',
            },
            zaxis: {
              title: { text: 'Elevation (mRL)', font: { size: 10, color: '#89929b' } },
              tickfont: { size: 9, color: '#89929b' },
              gridcolor: '#1c2b3c',
              zerolinecolor: '#3198dc',
              backgroundcolor: 'transparent',
            },
            camera: {
              eye: { x: 1.45, y: -1.75, z: 1.2 },
            },
          },
          legend: {
            x: 0.02,
            y: 0.98,
            font: { size: 11, color: '#d4e4fa' },
            bgcolor: 'rgba(13, 28, 45, 0.85)',
            bordercolor: '#1c2b3c',
            borderwidth: 1,
          },
        },
        { responsive: true, displayModeBar: false }
      )
    })
  }, [blocks, showWaste, cutoff])

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1720px] mx-auto pb-12">

      {/* ── 1. Sub-Header & Methodological Clarification Scrim ── */}
      <div className="w-full flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-2 border-b border-border/40">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-label-telemetry">
            <span className="px-2 py-0.5 bg-primary-container/20 text-primary font-bold rounded">
              VOXEL ENGINE V4.2
            </span>
            <span className="text-outline font-label-code">SECTOR: TUKUR-KALAHARI CONCESSION</span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-3xl text-on-surface font-bold tracking-tight">
            Resource Mapping
          </h1>
          <p className="font-headline-sm text-sm md:text-base text-secondary">
            3D Spatial Resource Model · Where is mineralisation?
          </p>
        </div>

        {/* Methodological Transparency Callout */}
        <div className="max-w-2xl bg-surface-container-low border border-border p-3.5 rounded-xl flex items-start gap-3 shadow-sm text-xs">
          <span className="material-symbols-outlined text-secondary shrink-0 mt-0.5 text-[20px]">info</span>
          <div className="space-y-0.5">
            <span className="font-label-telemetry uppercase text-secondary tracking-wider font-bold block text-[10px]">
              METHODOLOGICAL CLARITY
            </span>
            <p className="text-on-surface-variant leading-relaxed">
              Earth observation provides surface spatial context, while borehole assays provide subsurface grade evidence. Ordinary Kriging interpolates borehole-derived grades across the 3D block model.
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. KPI Executive Telemetry Strip (4 cards) ── */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* KPI 1 */}
        <div className="bg-surface-container border border-border p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-secondary/5 rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-label-telemetry text-[10px] uppercase text-outline font-semibold">TOTAL RESOURCE</span>
            <span className="material-symbols-outlined text-outline text-[18px]">view_in_ar</span>
          </div>
          <div className="my-2">
            <div className="font-display-metric text-2xl md:text-3xl text-on-surface font-bold tracking-tight">
              {declaredMt} <span className="text-base text-secondary font-semibold">Mt</span>
            </div>
          </div>
          <div className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span>Spatially modelled mineral resource</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface-container border border-border p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-label-telemetry text-[10px] uppercase text-outline font-semibold">TOTAL MODELLED BLOCKS</span>
            <span className="material-symbols-outlined text-outline text-[18px]">grid_3x3</span>
          </div>
          <div className="my-2">
            <div className="font-display-metric text-2xl md:text-3xl text-on-surface font-bold tracking-tight">
              {totalBlocks.toLocaleString()} <span className="text-base text-outline font-normal">blocks</span>
            </div>
          </div>
          <div className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <span className="font-label-code text-secondary font-semibold">10m × 10m × 5m</span> voxel dimensions
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-container border border-border p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-secondary-container/10 rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-label-telemetry text-[10px] uppercase text-outline font-semibold">MINERALISED BLOCKS</span>
            <span className="material-symbols-outlined text-secondary text-[18px]">layers</span>
          </div>
          <div className="my-2">
            <div className="font-display-metric text-2xl md:text-3xl text-secondary font-bold tracking-tight">
              {oreBlocks.toLocaleString()} <span className="text-base text-outline font-normal">blocks</span>
            </div>
          </div>
          <div className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
            <span>Meeting cutoff · <strong className="text-secondary font-semibold">{((oreBlocks / totalBlocks) * 100).toFixed(1)}%</strong> of body</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-surface-container border border-border p-4 rounded-xl flex flex-col justify-between shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/10 rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="font-label-telemetry text-[10px] uppercase text-outline font-semibold">AVERAGE MN GRADE</span>
            <span className="material-symbols-outlined text-primary text-[18px]">analytics</span>
          </div>
          <div className="my-2">
            <div className="font-display-metric text-2xl md:text-3xl text-primary font-bold tracking-tight">
              {avgGrade}% <span className="text-base text-secondary font-semibold">Mn</span>
            </div>
          </div>
          <div className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <span className="font-label-code text-on-surface">Cutoff applied: {cutoff}% Mn</span>
          </div>
        </div>
      </div>

      {/* ── 3. Central Subterranean 3D Resource Viewport Area (Stitch) ── */}
      <div className="w-full bg-surface-container-lowest border border-border rounded-xl overflow-hidden shadow-xl flex flex-col xl:flex-row">
        {/* Interactive Spatial 3D Canvas */}
        <div className="relative flex-1 min-h-[580px] xl:min-h-[640px] bg-surface-container-lowest flex flex-col justify-between p-4 select-none">
          {/* Viewport Top Toolbar */}
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 bg-surface-container/85 backdrop-blur-md p-2.5 rounded-lg border border-border shadow-sm text-xs">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-label-telemetry uppercase text-on-surface tracking-wider font-bold">VOXEL MODEL: ACTIVE</span>
              <span className="font-label-code text-outline ml-2">EPSG:32734 / UTM ZONE 34S</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowWaste(!showWaste)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded font-label-code text-xs transition-colors cursor-pointer border ${
                  showWaste ? 'bg-surface-container-high text-on-surface border-border' : 'bg-secondary/20 text-secondary border-secondary/40'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">filter_alt</span>
                <span>{showWaste ? 'Hide Waste' : 'Show All Blocks'}</span>
              </button>
            </div>
          </div>

          {/* WebGL Plotly 3D Container */}
          <div className="w-full h-full min-h-[480px] relative my-2" ref={plotRef}>
            {loadErr && (
              <div className="p-4 text-error text-center text-xs">
                Could not load 3D blocks: {loadErr}
              </div>
            )}
            {!blocks && !loadErr && (
              <div className="flex items-center justify-center h-full text-secondary text-xs">
                Loading 2,240 voxel block model…
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Geostatistical Model Parameters (Stitch) */}
        <div className="w-full xl:w-80 bg-surface-container-low border-t xl:border-t-0 xl:border-l border-border p-5 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="pb-2 border-b border-border/40">
              <span className="font-label-telemetry uppercase text-[10px] text-secondary font-bold tracking-wider">
                KRIGING ESTIMATOR
              </span>
              <h3 className="font-headline-sm text-sm text-on-surface font-bold mt-0.5">
                Geostatistical Model
              </h3>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="bg-surface-container border border-border/50 p-2.5 rounded-lg flex items-center justify-between">
                <span className="text-on-surface-variant">Method</span>
                <span className="font-label-code text-secondary font-bold">Ordinary Kriging (3D)</span>
              </div>
              <div className="bg-surface-container border border-border/50 p-2.5 rounded-lg flex items-center justify-between">
                <span className="text-on-surface-variant">Model Type</span>
                <span className="font-label-code text-on-surface">Spherical Variogram</span>
              </div>
              <div className="bg-surface-container border border-border/50 p-2.5 rounded-lg flex items-center justify-between">
                <span className="text-on-surface-variant">Nugget (C₀)</span>
                <span className="font-label-code text-on-surface font-semibold">{variogram.nugget}</span>
              </div>
              <div className="bg-surface-container border border-border/50 p-2.5 rounded-lg flex items-center justify-between">
                <span className="text-on-surface-variant">Sill (C₀ + C)</span>
                <span className="font-label-code text-on-surface font-semibold">{variogram.sill}</span>
              </div>
              <div className="bg-surface-container border border-border/50 p-2.5 rounded-lg flex items-center justify-between">
                <span className="text-on-surface-variant">Range (a)</span>
                <span className="font-label-code text-primary font-bold">{variogram.range} m</span>
              </div>
            </div>

            <div className="bg-surface-container-high border border-border p-3 rounded-lg text-xs space-y-1">
              <span className="font-label-telemetry uppercase text-[9px] text-outline font-bold">SPATIAL EVIDENCE NOTE</span>
              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                Ordinary Kriging unbiasedly estimates block manganese grades by minimizing estimation variance. EO multispectral anomalies constrain perimeter lease exploration boundaries.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 p-2.5 rounded-lg border border-border/40 text-[11px] text-outline flex items-center justify-between">
            <span>Grid Resolution: 10m × 10m × 5m</span>
            <span className="text-secondary font-semibold">VALIDATED</span>
          </div>
        </div>
      </div>

    </div>
  )
}
