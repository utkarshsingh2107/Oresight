/**
 * SatelliteView — Space Intelligence (Stitch "Industrial Telemetry & Mineral Ops")
 * Direct implementation matching stitch_oresight_ui_redesign/screens/stage02_space_intelligence.html
 * Preserves dynamic API data from /api/satellite and /api/satellite/grid.
 */
import React, { useEffect, useState } from 'react'
import { getSatellite, getSatelliteGrid } from '../services/api.js'

/* Layer options matching Stitch */
const LAYERS = [
  { id: 'iron_oxide_idx',       label: 'Iron Oxide Absorption',  symbol: 'layers' },
  { id: 'clay_alter_idx',       label: 'Clay Alteration',        symbol: 'texture' },
  { id: 'ndvi',                 label: 'NDVI Surface Stress',    symbol: 'eco' },
  { id: 'soil_moisture',        label: 'Soil Moisture (NDWI)',   symbol: 'water_drop' },
  { id: 'slope_deg',            label: 'SRTM Elevation Slope',   symbol: 'landscape' },
  { id: 'mineralisation_score', label: 'Composite EO Anomaly',   symbol: 'auto_graph' },
]

export default function SatelliteView() {
  const [data, setData]       = useState(null)
  const [gridData, setGridData] = useState(null)
  const [activeLayer, setActiveLayer] = useState('iron_oxide_idx')
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSatellite(), getSatelliteGrid()])
      .then(([sat, grid]) => {
        setData(sat)
        setGridData(grid)
        if (sat?.top_eo_targets?.length) {
          setSelectedTarget(sat.top_eo_targets[0])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = data?.layer_statistics ?? {}
  const targets = data?.top_eo_targets ?? []

  // Values from API with safe defaults
  const ironVal = stats.iron_oxide_idx?.mean ? stats.iron_oxide_idx.mean.toFixed(3) : '0.411'
  const clayVal = stats.clay_alter_idx?.mean ? stats.clay_alter_idx.mean.toFixed(3) : '0.412'
  const ndviVal = stats.ndvi?.mean ? stats.ndvi.mean.toFixed(3) : '0.451'
  const ndwiVal = stats.soil_moisture?.mean ? stats.soil_moisture.mean.toFixed(3) : '0.384'
  const reflVal = stats.surface_reflectance?.mean ? stats.surface_reflectance.mean.toFixed(3) : '0.251'
  const anomalyVal = stats.spectral_anomaly?.mean ? stats.spectral_anomaly.mean.toFixed(3) : '0.289'

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1720px] mx-auto pb-12">

      {/* ── 1. Top Context Header Area ── */}
      <div className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-1.5 text-secondary text-xs font-label-telemetry uppercase tracking-wider mb-1">
            <span className="material-symbols-outlined text-[16px]">satellite_alt</span>
            <span>GEO-SPECTRAL OBSERVATION PLATFORM</span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-3xl text-on-surface font-bold tracking-tight">
            Space Intelligence
          </h1>
          <p className="text-secondary text-sm md:text-base mt-0.5">
            Satellite &amp; Remote Sensing Evidence · What does Earth observation reveal?
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-surface-container-high border border-border flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
            <div className="flex flex-col">
              <span className="font-label-telemetry text-[9px] uppercase text-secondary font-bold">SURFACE INDICES ENGINE</span>
              <span className="font-label-code text-[11px] text-on-surface-variant">SECTOR 04 · JODA-NOAMUNDI TRENCH</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Scientifically Responsible Banner (Stitch Rule) ── */}
      <div className="w-full bg-surface-container-low border border-border rounded-xl p-3.5 flex items-start sm:items-center gap-3 shadow-sm">
        <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 text-primary">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full text-xs">
          <p className="text-on-surface-variant leading-relaxed">
            <strong className="text-on-surface font-semibold">Methodological Protocol:</strong> Earth observation provides surface spatial indicators and anomaly context. Subsurface resource estimation is strictly supported by geological, borehole, and assay evidence.
          </p>
          <span className="font-label-telemetry text-[9px] uppercase text-outline shrink-0 font-semibold px-2 py-0.5 rounded bg-surface-container">
            JORC / UNFC PROTOCOL ALIGNED
          </span>
        </div>
      </div>

      {/* ── 3. Main 2-Column Analytic Worksurface (Stitch 7:5 Ratio) ── */}
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-5">

        {/* LEFT COLUMN: Spatial Intelligence Map Viewport (7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          <div className="relative w-full rounded-xl bg-surface-container-lowest border border-border overflow-hidden shadow-xl min-h-[580px] flex flex-col justify-between">
            {/* Visual Imagery Map Canvas Background */}
            <div className="absolute inset-0 z-0">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCxjSiCOPn_t6Q4KJMKsukrCPNTJXUzE4pMaANJDeTL-I74I3qDdhY-lVDRVqVcR4PpgwW4wusY4Sp-0fyw01WG9CI97xkQgUqDbcqGT0Ltp6HgLLceIKxuVFGVh6hoFy5PoH1-bY58zXtWZHGbeJFAuby_s7Gf9P0G7sIDCdgBZiVD51W_Tt19psoLlrE8oqCbjZrKKfLZoqoX-rQ6WSpcXecep1RrcmX-iacTyRjQud7viZdsef-8gg')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-surface-container-lowest/60" />

              {/* High-Tech Vector Grid & Boundaries Overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="cartoGrid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(39, 54, 71, 0.4)" strokeWidth="0.5" />
                    <circle cx="0" cy="0" r="1.5" fill="rgba(123, 208, 255, 0.4)" />
                  </pattern>
                  <linearGradient id="anomalyGlow" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#a078ff" stopOpacity="0.55" />
                    <stop offset="60%" stopColor="#3198dc" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#7bd0ff" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#cartoGrid)" />

                {/* Concession Mining Lease Perimeter Polygon */}
                <polygon
                  points="120,80 340,65 480,180 430,380 260,460 90,320"
                  fill="none"
                  stroke="#7bd0ff"
                  strokeWidth="1.5"
                  strokeDasharray="6,4"
                />
                <polygon
                  points="135,95 325,82 460,190 415,365 260,440 108,310"
                  fill="none"
                  stroke="#7bd0ff"
                  strokeOpacity="0.3"
                  strokeWidth="0.5"
                />

                {/* Lineament Fault Traces */}
                <path d="M 70,140 Q 220,210 380,260 T 520,380" fill="none" stroke="#d0bcff" strokeWidth="2" strokeDasharray="4,6" />
                <path d="M 180,90 Q 290,260 360,490" fill="none" stroke="#d0bcff" strokeWidth="1.5" strokeDasharray="3,5" strokeOpacity="0.8" />
                <path d="M 40,310 Q 240,340 460,290" fill="none" stroke="#d0bcff" strokeWidth="1" strokeDasharray="2,4" strokeOpacity="0.6" />

                {/* High Spectral Alteration Heatmap Zones */}
                <path
                  d="M 210,160 C 270,140 330,190 320,250 C 310,310 240,320 200,280 C 160,240 180,180 210,160 Z"
                  fill="url(#anomalyGlow)"
                />
                <circle cx="255" cy="225" r="28" fill="#a078ff" fillOpacity="0.4" />
                <circle cx="255" cy="225" r="8" fill="#d0bcff" fillOpacity="0.9" />

                <path
                  d="M 370,120 C 410,110 440,140 430,170 C 420,200 380,210 360,180 C 345,155 350,130 370,120 Z"
                  fill="url(#anomalyGlow)"
                />
                <circle cx="395" cy="155" r="4" fill="#7bd0ff" fillOpacity="0.9" />
              </svg>

              {/* Target Reticle Center Marker */}
              <div className="absolute top-[225px] left-[255px] -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border border-secondary/50 flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                </div>
                <div className="mt-1 px-1.5 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm border border-secondary/30 shadow-md">
                  <span className="font-label-telemetry text-[9px] text-secondary tracking-widest uppercase font-bold">
                    ANOMALY-ALPHA
                  </span>
                </div>
              </div>
            </div>

            {/* GIS Viewport Top HUD Controls Bar */}
            <div className="relative z-10 p-3.5 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-surface-container-lowest/95 via-surface-container-lowest/70 to-transparent">
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-border flex items-center gap-2 text-on-surface shadow-sm">
                  <span className="material-symbols-outlined text-[16px] text-secondary">layers</span>
                  <span className="font-headline-sm text-xs font-bold">Sector 04 Viewport</span>
                </div>
                <span className="font-label-telemetry text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant uppercase font-semibold">
                  SIMULATED S2-MSI
                </span>
              </div>

              {/* Coordinates Telemetry Ribbon */}
              <div className="flex items-center gap-2 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-xl border border-border text-xs">
                <span className="font-label-code text-primary tabular-nums">21°42'18"N · 86°14'02"E</span>
                <span className="w-1 h-3 rounded-full bg-surface-variant" />
                <span className="font-label-telemetry text-on-surface-variant uppercase text-[10px]">WGS84</span>
                <span className="w-1 h-3 rounded-full bg-surface-variant" />
                <span className="font-label-telemetry text-secondary uppercase text-[10px]">GSD: 10M</span>
              </div>
            </div>

            {/* GIS Viewport Interactive Overlays & Controls Bottom Panel */}
            <div className="relative z-10 p-3.5 flex flex-col gap-3 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/95 to-transparent">
              {/* Layer Toggle Matrix Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {LAYERS.map((ly) => {
                  const isActive = activeLayer === ly.id
                  return (
                    <button
                      key={ly.id}
                      onClick={() => setActiveLayer(ly.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                          : 'bg-surface-container-high hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-border'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {isActive ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className="font-label-telemetry uppercase tracking-wider text-[10px]">{ly.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Bottom Status & Spectral Gradient Scale Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-label-telemetry text-[10px] text-on-surface-variant uppercase font-semibold">
                    BAND RATIO CONFIDENCE:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    <span className="font-label-code text-on-surface">SWIR-1 / NIR (B11/B8A)</span>
                  </div>
                </div>

                {/* Gradient Legend Scale */}
                <div className="flex items-center gap-2 bg-surface-container-low border border-border px-3 py-1 rounded-xl shadow-sm">
                  <span className="font-label-telemetry uppercase text-outline text-[9px]">Low Anomaly</span>
                  <div className="w-28 sm:w-36 h-2 rounded-full bg-gradient-to-r from-surface-variant via-primary-container to-tertiary shadow-inner" />
                  <span className="font-label-telemetry uppercase text-tertiary text-[9px] font-bold">High Anomaly</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick GIS Viewport Sub-metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-container-low border border-border rounded-xl p-3 flex flex-col shadow-sm">
              <span className="font-label-telemetry text-[9px] uppercase text-outline font-semibold">LEASE ENCLOSURE</span>
              <span className="font-headline-md text-base text-on-surface font-bold mt-1">4.82 km²</span>
              <span className="font-label-code text-on-surface-variant text-[10px]">Mining Lease ML-084</span>
            </div>
            <div className="bg-surface-container-low border border-border rounded-xl p-3 flex flex-col shadow-sm">
              <span className="font-label-telemetry text-[9px] uppercase text-outline font-semibold">CLOUD COVERAGE</span>
              <span className="font-headline-md text-base text-secondary font-bold mt-1">&lt; 0.8%</span>
              <span className="font-label-code text-on-surface-variant text-[10px]">Epoch 2024-Q4 Mosaic</span>
            </div>
            <div className="bg-surface-container-low border border-border rounded-xl p-3 flex flex-col shadow-sm">
              <span className="font-label-telemetry text-[9px] uppercase text-outline font-semibold">TERRAIN ELEVATION</span>
              <span className="font-headline-md text-base text-on-surface font-bold mt-1">542 – 688 m</span>
              <span className="font-label-code text-on-surface-variant text-[10px]">DEM Topo Gradient</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EO Spectral Indicators & Surface Metrics (5 cols) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          <div className="bg-surface-container-low border border-border rounded-xl p-5 shadow-md flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
                <div>
                  <div className="flex items-center gap-1.5 text-primary text-[10px] font-label-telemetry uppercase tracking-wider mb-0.5 font-bold">
                    <span className="material-symbols-outlined text-[15px]">equalizer</span>
                    <span>SPECTRAL DECOMPOSITION</span>
                  </div>
                  <h2 className="font-headline-md text-base text-on-surface font-bold">EO Spectral Indicators &amp; Surface Metrics</h2>
                </div>
                <span className="material-symbols-outlined text-outline cursor-pointer hover:text-on-surface transition-colors" title="Satellite-derived information about surface conditions">info</span>
              </div>

              {/* Indicators Stack */}
              <div className="flex flex-col gap-2.5">
                {/* 1. Iron Oxide Index */}
                <div className="bg-surface-container border border-border/50 rounded-xl p-3 transition-all hover:bg-surface-container-high">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-headline-sm text-xs font-semibold text-on-surface">Iron Oxide Index</span>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">SWIR band ratio indicating gossan &amp; ferric mineralisation</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-headline-lg text-lg font-bold text-secondary tabular-nums">{ironVal}</span>
                      <span className="font-label-telemetry text-[9px] text-primary uppercase font-bold">B4 / B2 Normalized</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-variant mt-2 overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.min(100, Number(ironVal) * 200)}%` }} />
                  </div>
                </div>

                {/* 2. Clay Index */}
                <div className="bg-surface-container border border-border/50 rounded-xl p-3 transition-all hover:bg-surface-container-high">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-headline-sm text-xs font-semibold text-on-surface">Clay Alteration Index</span>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">Al-OH absorption signature highlighting hydrothermal alteration</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-headline-lg text-lg font-bold text-tertiary tabular-nums">{clayVal}</span>
                      <span className="font-label-telemetry text-[9px] text-tertiary uppercase font-bold">B11 / B12 SWIR2</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-variant mt-2 overflow-hidden">
                    <div className="h-full bg-tertiary rounded-full" style={{ width: `${Math.min(100, Number(clayVal) * 200)}%` }} />
                  </div>
                </div>

                {/* 3. NDVI */}
                <div className="bg-surface-container border border-border/50 rounded-xl p-3 transition-all hover:bg-surface-container-high">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-headline-sm text-xs font-semibold text-on-surface">NDVI (Vegetation Index)</span>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">Normalised difference vegetation index showing clearing zones</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-headline-lg text-lg font-bold text-on-surface tabular-nums">{ndviVal}</span>
                      <span className="font-label-telemetry text-[9px] text-outline uppercase">(B8 − B4) / (B8 + B4)</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-variant mt-2 overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full" style={{ width: `${Math.min(100, Number(ndviVal) * 100)}%` }} />
                  </div>
                </div>

                {/* 4. NDWI / Soil Moisture */}
                <div className="bg-surface-container border border-border/50 rounded-xl p-3 transition-all hover:bg-surface-container-high">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-headline-sm text-xs font-semibold text-on-surface">NDWI / Moisture</span>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">Surface soil and drainage moisture levels</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-headline-lg text-lg font-bold text-on-surface tabular-nums">{ndwiVal}</span>
                      <span className="font-label-telemetry text-[9px] text-outline uppercase">(B3 − B8) / (B3 + B8)</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-variant mt-2 overflow-hidden">
                    <div className="h-full bg-secondary-fixed-dim rounded-full" style={{ width: `${Math.min(100, Number(ndwiVal) * 100)}%` }} />
                  </div>
                </div>

                {/* 5. Surface Reflectance */}
                <div className="bg-surface-container border border-border/50 rounded-xl p-3 transition-all hover:bg-surface-container-high">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-headline-sm text-xs font-semibold text-on-surface">Surface Reflectance</span>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">Visible band albedo across target outcrop</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-headline-lg text-lg font-bold text-on-surface tabular-nums">{reflVal}</span>
                      <span className="font-label-telemetry text-[9px] text-outline uppercase">Top-of-Canopy BOA</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-variant mt-2 overflow-hidden">
                    <div className="h-full bg-outline rounded-full" style={{ width: `${Math.min(100, Number(reflVal) * 100)}%` }} />
                  </div>
                </div>

                {/* 6. Spectral Anomaly Score (Highlighted) */}
                <div className="bg-surface-container-high border border-primary/30 rounded-xl p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-headline-sm text-xs font-bold text-primary">Spectral Anomaly Score</span>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">High-confidence deviation from regional baseline</p>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                      <span className="font-headline-lg text-lg font-bold text-primary tabular-nums">{anomalyVal}</span>
                      <span className="font-label-telemetry text-[9px] text-secondary uppercase font-bold">HIGH SIGNIFICANCE</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-variant mt-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${Math.min(100, Number(anomalyVal) * 200)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Telemetry Audit Caption */}
            <div className="mt-3 pt-2 bg-surface-container-lowest/50 rounded-lg p-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px]">
                <span className="material-symbols-outlined text-[14px]">tune</span>
                <span className="font-label-code">CALIBRATION MATRIX: S2A_OPER_MSI_L2A</span>
              </div>
              <span className="font-label-telemetry text-secondary text-[10px] font-bold">QA_CHECK_PASSED</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── 4. Integration-Ready Earth Observation Feeds (Stitch) ── */}
      <div className="w-full bg-surface-container-low border border-border rounded-xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-secondary text-[10px] font-label-telemetry uppercase tracking-wider mb-0.5 font-bold">
              <span className="material-symbols-outlined text-[16px]">sensors</span>
              <span>ORBITAL CONSTELLATION PIPELINE</span>
            </div>
            <h2 className="font-headline-lg text-lg text-on-surface font-bold">Integration-Ready Earth Observation Feeds</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span className="font-label-telemetry text-on-surface-variant text-[10px] uppercase font-semibold">
              5 FEEDS CONFIGURED &amp; CALIBRATED
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {/* Feed 1: Sentinel-2 */}
          <div className="bg-surface-container border border-border rounded-xl p-3 flex flex-col justify-between shadow-sm hover:bg-surface-container-high transition-colors">
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="font-headline-sm text-xs font-bold text-on-surface">Sentinel-2 (ESA)</span>
                <span className="px-1.5 py-0.5 rounded font-label-telemetry text-[9px] bg-secondary-container text-on-secondary-container uppercase font-bold">Ready</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-3">10m Multi-spectral / 5-day revisit cycle. VNIR-SWIR mineral band ratios.</p>
            </div>
            <div className="bg-surface-container-lowest/50 rounded-lg p-2 flex items-center justify-between text-xs">
              <span className="font-label-telemetry text-[9px] text-outline uppercase font-semibold">RESOLUTION</span>
              <span className="font-label-code text-primary text-[11px]">10m / 20m</span>
            </div>
          </div>

          {/* Feed 2: Landsat 8/9 */}
          <div className="bg-surface-container border border-border rounded-xl p-3 flex flex-col justify-between shadow-sm hover:bg-surface-container-high transition-colors">
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="font-headline-sm text-xs font-bold text-on-surface">Landsat-8/9 (USGS)</span>
                <span className="px-1.5 py-0.5 rounded font-label-telemetry text-[9px] bg-surface-container-high text-secondary uppercase font-bold">Ready</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-3">OLI/TIRS sensor suite providing 30m multispectral + thermal infrared bands.</p>
            </div>
            <div className="bg-surface-container-lowest/50 rounded-lg p-2 flex items-center justify-between text-xs">
              <span className="font-label-telemetry text-[9px] text-outline uppercase font-semibold">RESOLUTION</span>
              <span className="font-label-code text-secondary text-[11px]">30m / 100m</span>
            </div>
          </div>

          {/* Feed 3: Sentinel-1 InSAR */}
          <div className="bg-surface-container border border-border rounded-xl p-3 flex flex-col justify-between shadow-sm hover:bg-surface-container-high transition-colors">
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="font-headline-sm text-xs font-bold text-on-surface">Sentinel-1 InSAR</span>
                <span className="px-1.5 py-0.5 rounded font-label-telemetry text-[9px] bg-tertiary-container text-on-tertiary-container uppercase font-bold">Ready</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-3">C-band Synthetic Aperture Radar. Sub-centimeter surface slope deformation.</p>
            </div>
            <div className="bg-surface-container-lowest/50 rounded-lg p-2 flex items-center justify-between text-xs">
              <span className="font-label-telemetry text-[9px] text-outline uppercase font-semibold">DRIFT PRECISION</span>
              <span className="font-label-code text-tertiary text-[11px]">±1.4 mm/yr</span>
            </div>
          </div>

          {/* Feed 4: SRTM / ALOS DEM */}
          <div className="bg-surface-container border border-border rounded-xl p-3 flex flex-col justify-between shadow-sm hover:bg-surface-container-high transition-colors">
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="font-headline-sm text-xs font-bold text-on-surface">SRTM / ALOS DEM</span>
                <span className="px-1.5 py-0.5 rounded font-label-telemetry text-[9px] bg-surface-container-high text-primary uppercase font-bold">Ready</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-3">Global 30m Digital Elevation Model for catchment slope &amp; haul route grade feasibility.</p>
            </div>
            <div className="bg-surface-container-lowest/50 rounded-lg p-2 flex items-center justify-between text-xs">
              <span className="font-label-telemetry text-[9px] text-outline uppercase font-semibold">GRID SPACING</span>
              <span className="font-label-code text-primary text-[11px]">30m Voxel</span>
            </div>
          </div>

          {/* Feed 5: ISRO Bhuvan / Resourcesat */}
          <div className="bg-surface-container border border-border rounded-xl p-3 flex flex-col justify-between shadow-sm hover:bg-surface-container-high transition-colors">
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="font-headline-sm text-xs font-bold text-on-surface">ISRO Bhuvan</span>
                <span className="px-1.5 py-0.5 rounded font-label-telemetry text-[9px] bg-secondary-container text-on-secondary-container uppercase font-bold">Ready</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mb-3">Resourcesat LISS-4 regional geocoded imagery for Indian concession boundaries.</p>
            </div>
            <div className="bg-surface-container-lowest/50 rounded-lg p-2 flex items-center justify-between text-xs">
              <span className="font-label-telemetry text-[9px] text-outline uppercase font-semibold">INDIA NATIVE</span>
              <span className="font-label-code text-secondary text-[11px]">5.8m High-Res</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
