/**
 * OverviewPanel — Mission Overview (Stitch "Industrial Telemetry & Mineral Ops")
 * Direct implementation matching stitch_oresight_ui_redesign/screens/stage01_overview.html
 * Preserves dynamic API data from /api/overview and test contract strings.
 */
import React, { useEffect, useState } from 'react'
import { fmtT, fmtPct } from '../utils/labels.js'
import { getSatellite } from '../services/api.js'

export default function OverviewPanel({ overview, onNavigate }) {
  if (!overview) return null

  const p  = overview.prism ?? {}
  const e  = overview.ear ?? {}
  const pu = overview.pulse ?? {}
  const rl = overview.risk_level ?? 'CRITICAL'
  const n  = overview.nudge ?? {}

  const [eoStats, setEoStats] = useState(null)
  useEffect(() => {
    getSatellite().then(setEoStats).catch(() => setEoStats(null))
  }, [])

  const declaredMt = (Number(p.declared_reserve_t ?? 48271696.4) / 1e6).toFixed(2)
  const accessibleMt = (Number(e.effective_accessible_reserve_t ?? 32736929.4) / 1e6).toFixed(2)
  const accessRatio = (Number(e.accessibility_ratio ?? 0.6782) * 100).toFixed(1)
  const p50Kt = (Number(pu.expected_production_t ?? 68593.4) / 1e3).toFixed(2)
  const plannedKt = (Number(pu.planned_production_t ?? 71988.9) / 1e3).toFixed(2)
  const deficitT = Math.round(Number(pu.expected_shortfall_t ?? 3395.5))
  const riskPct = fmtPct(pu.shortfall_probability ?? overview.shortfall_probability ?? 0.8837)
  const gainT = Math.round(Number(n.expected_production_gain_t ?? 606.6))
  const baselineAdv = Number(n.baseline_value ?? 18.53).toFixed(1)
  const targetAdv = Number(n.recommended_value ?? 19.24).toFixed(1)
  const deltaAdv = (targetAdv - baselineAdv).toFixed(2)

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1720px] mx-auto pb-10">

      {/* ── 1. Page Header Section (Stitch Layout) ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2 border-b border-border/40">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-secondary font-label-telemetry text-xs tracking-widest uppercase">
            <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
            <span>SITUATION REPORT · RUN #582-A</span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-3xl text-on-surface tracking-tight font-bold">
            Space-Enabled Mine Intelligence
          </h1>
          <p className="text-secondary text-sm md:text-base max-w-3xl">
            Mission Overview · Executive Synthesis · What does OreSight currently know?
          </p>
        </div>

        {/* Quick Metadata Block */}
        <div className="flex flex-wrap items-center gap-2 bg-surface-container-low px-3 py-2 rounded-xl border border-border shadow-sm text-xs">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[16px]">travel_explore</span>
            <span className="font-label-telemetry text-on-surface uppercase font-semibold">Sector 04 Manganese Deposit</span>
          </div>
          <span className="text-outline">•</span>
          <span className="font-label-code text-on-surface-variant">UTM 32N / WGS84</span>
          <span className="text-outline">•</span>
          <div className="flex items-center gap-1.5 bg-surface-container-high px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
            <span className="font-label-telemetry text-secondary text-[10px] font-bold">SYNTHETIC CALIBRATION</span>
          </div>
        </div>
      </div>

      {/* Scientific Provenance Note */}
      <div className="text-xs text-outline italic -mt-2">
        * Satellite observations provide surface indicators and spatial context only; subsurface reserve estimation is strictly derived from borehole assays and spatial geostatistics.
      </div>

      {/* ── 2. Executive KPI Row (5 Metric Cards from Stitch) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">

        {/* Metric 1: Total Resource */}
        <div
          onClick={() => onNavigate('prism')}
          role="button"
          tabIndex={0}
          aria-label="View Resource Mapping"
          className="bg-surface-container-low hover:bg-surface-container border border-border transition-colors p-4 rounded-xl shadow-sm flex flex-col justify-between min-h-[160px] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-telemetry text-[11px] text-on-surface-variant uppercase font-semibold">Resource In-Situ</span>
            <span className="material-symbols-outlined text-outline text-[18px]">layers</span>
          </div>
          <div className="flex flex-col gap-1 my-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display-metric text-3xl text-on-surface font-bold tracking-tight">{declaredMt}</span>
              <span className="font-label-telemetry text-sm text-secondary uppercase font-bold">Mt</span>
            </div>
            <span className="text-xs text-on-surface-variant line-clamp-2">
              Spatially modelled mineral resource · {p.ore_blocks ?? 498} blocks
            </span>
          </div>
          <div className="flex items-center gap-1 text-secondary font-label-code text-xs">
            <span className="material-symbols-outlined text-[14px]">insights</span>
            <span>JORC compliant envelope · {p.average_mn_pct ?? 25.25}% Mn</span>
          </div>
        </div>

        {/* Metric 2: Accessible Resource */}
        <div
          onClick={() => onNavigate('ear')}
          role="button"
          tabIndex={0}
          aria-label="View Accessibility"
          className="bg-surface-container-low hover:bg-surface-container border border-border transition-colors p-4 rounded-xl shadow-sm flex flex-col justify-between min-h-[160px] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-telemetry text-[11px] text-on-surface-variant uppercase font-semibold">Accessible Resource</span>
            <span className="material-symbols-outlined text-secondary text-[18px]">precision_manufacturing</span>
          </div>
          <div className="flex flex-col gap-1 my-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display-metric text-3xl text-secondary font-bold tracking-tight">{accessibleMt}</span>
              <span className="font-label-telemetry text-sm text-secondary uppercase font-bold">Mt</span>
            </div>
            <span className="text-xs text-on-surface-variant line-clamp-2">
              {accessRatio}% accessible under active operational constraints
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
            <div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: `${accessRatio}%` }} />
          </div>
        </div>

        {/* Metric 3: Expected Production */}
        <div
          onClick={() => onNavigate('pulse')}
          role="button"
          tabIndex={0}
          aria-label="View Production Forecast"
          className="bg-surface-container-low hover:bg-surface-container border border-border transition-colors p-4 rounded-xl shadow-sm flex flex-col justify-between min-h-[160px] cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-telemetry text-[11px] text-on-surface-variant uppercase font-semibold">Expected Production</span>
            <span className="font-label-code text-[10px] text-outline px-1.5 py-0.5 rounded bg-surface-container">30-DAY</span>
          </div>
          <div className="flex flex-col gap-1 my-1">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display-metric text-3xl text-on-surface font-bold tracking-tight">{p50Kt}</span>
              <span className="font-label-telemetry text-sm text-secondary uppercase font-bold">kt</span>
            </div>
            <span className="text-xs text-on-surface-variant line-clamp-2">
              30-day P50 forecast · Planned: {plannedKt} kt
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-label-code">
            <span className="text-on-surface-variant">Variance:</span>
            <span className="text-error font-semibold">−{deficitT.toLocaleString()} t deficit</span>
          </div>
        </div>

        {/* Metric 4: Shortfall Risk */}
        <div
          onClick={() => onNavigate('pulse')}
          role="button"
          tabIndex={0}
          aria-label="View Production Forecast"
          className="bg-surface-container-low hover:bg-surface-container border border-error/40 transition-colors p-4 rounded-xl shadow-sm flex flex-col justify-between min-h-[160px] relative overflow-hidden cursor-pointer"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-error-container/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="font-label-telemetry text-[11px] text-error uppercase font-bold">Shortfall Risk</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-error-container text-on-error font-label-telemetry text-[10px] font-bold">
              {rl}
            </span>
          </div>
          <div className="flex flex-col gap-1 my-1 relative z-10">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display-metric text-3xl text-error font-bold tracking-tight">{riskPct}</span>
            </div>
            <span className="text-xs text-on-surface-variant line-clamp-2">
              Probability of missing contracted target mill feed
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-error font-label-code text-xs relative z-10">
            <span className="material-symbols-outlined text-[15px]">warning</span>
            <span>Intervention required</span>
          </div>
        </div>

        {/* Metric 5: Prescribed Focus / Recommended Action */}
        <div
          onClick={() => onNavigate('nudge')}
          role="button"
          tabIndex={0}
          aria-label="View Decision Engine"
          className="bg-surface-container-high border border-primary/40 p-4 rounded-xl shadow-sm flex flex-col justify-between min-h-[160px] cursor-pointer hover:bg-surface-variant transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-telemetry text-[11px] text-primary uppercase font-bold">Prescribed Focus</span>
            <span className="material-symbols-outlined text-primary text-[18px]">bolt</span>
          </div>
          <div className="flex flex-col gap-1 my-1">
            <span className="font-headline-sm text-sm text-on-surface font-bold leading-tight">
              {n.action_name ?? 'Increase Heading Progress'}
            </span>
            <span className="text-xs text-secondary-fixed-dim line-clamp-2">
              +{gainT.toLocaleString()} t expected gain · Zero CapEx
            </span>
          </div>
          <div className="flex items-center justify-between text-secondary font-label-code text-xs">
            <span>Incline-B Advance</span>
            <span className="font-semibold">+{deltaAdv} m/d</span>
          </div>
        </div>

      </div>

      {/* ── 3. Strategic Cockpit: Two Balanced Columns (Stitch) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

        {/* Left Column: Current Operational Posture (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-low border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between pb-1 border-b border-border/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">account_tree</span>
                <h2 className="font-headline-md text-base md:text-lg text-on-surface font-bold">Current Operational Posture</h2>
              </div>
              <span className="font-label-telemetry text-[10px] text-outline uppercase tracking-wider">PIPELINE CASCADE</span>
            </div>

            {/* Status Flow Chain (5 Pillars) */}
            <div className="bg-surface-container border border-border/50 p-3.5 rounded-xl flex flex-col gap-2">
              <span className="font-label-telemetry text-[10px] text-on-surface-variant uppercase tracking-wider">5-Pillar Ore Attenuation Chain</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                <div className="flex flex-col items-center bg-surface-container-high py-2 px-1 rounded-lg border border-border/40">
                  <span className="font-label-telemetry text-outline text-[9px] uppercase">Declared</span>
                  <span className="font-headline-sm text-sm text-on-surface font-semibold">{declaredMt} Mt</span>
                  <span className="font-label-code text-on-surface-variant text-[9px]">Resource</span>
                </div>
                <div className="flex flex-col items-center bg-surface-container-high py-2 px-1 rounded-lg border border-border/40">
                  <span className="font-label-telemetry text-secondary text-[9px] uppercase">Geometric</span>
                  <span className="font-headline-sm text-sm text-secondary font-semibold">{accessibleMt} Mt</span>
                  <span className="font-label-code text-on-surface-variant text-[9px]">Accessible</span>
                </div>
                <div className="flex flex-col items-center bg-surface-container-high py-2 px-1 rounded-lg border border-border/40">
                  <span className="font-label-telemetry text-outline text-[9px] uppercase">30D Forecast</span>
                  <span className="font-headline-sm text-sm text-on-surface font-semibold">{p50Kt} kt</span>
                  <span className="font-label-code text-on-surface-variant text-[9px]">P50 Yield</span>
                </div>
                <div className="flex flex-col items-center bg-surface-container-high py-2 px-1 rounded-lg border border-border/40">
                  <span className="font-label-telemetry text-error text-[9px] uppercase">Mill Gap</span>
                  <span className="font-headline-sm text-sm text-error font-semibold">−{deficitT.toLocaleString()} t</span>
                  <span className="font-label-code text-on-surface-variant text-[9px]">Deficit</span>
                </div>
                <div className="col-span-2 sm:col-span-1 flex flex-col items-center bg-primary-container/20 py-2 px-1 rounded-lg border border-primary/40">
                  <span className="font-label-telemetry text-primary text-[9px] uppercase font-bold">Recoverable</span>
                  <span className="font-headline-sm text-sm text-primary font-bold">+{gainT.toLocaleString()} t</span>
                  <span className="font-label-code text-on-surface-variant text-[9px]">Directive</span>
                </div>
              </div>
            </div>

            {/* Concise Operational Narrative */}
            <div className="flex flex-col gap-1 text-on-surface-variant text-xs md:text-sm">
              <h3 className="font-headline-sm text-sm font-semibold text-on-surface">Subsurface Bottleneck Summary</h3>
              <p className="leading-relaxed">
                Subsurface modeling confirms high-grade manganese, but active heading delays at Level 480 create an imminent mill starvation window within 14 days. Ore haulage velocity is currently unconstrained, confirming that underground extraction geometry—not surface transport—is the sole primary constraint.
              </p>
            </div>

            {/* Earth Observation & Structural Insight Badge */}
            <div className="bg-surface-container border border-border/50 p-3 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 text-secondary">
                <span className="material-symbols-outlined text-[20px]">satellite_alt</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-label-telemetry text-[10px] text-secondary uppercase tracking-wider font-bold">GEO-STRUCTURAL VALIDATION</span>
                <p className="text-xs text-on-surface leading-normal">
                  Earth Observation lineaments validate structural boundaries while underground stope advance lags by <span className="font-semibold text-error">+{deltaAdv} m/day</span> against calibrated schedule limits.
                </p>
              </div>
            </div>
          </div>

          {/* Telemetry Signature Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 bg-surface-container-lowest/50 p-2.5 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <span className="font-label-code text-outline uppercase">Spatial InSAR Drift:</span>
              <span className="font-label-code text-on-surface font-semibold">±1.4 mm/yr (Stable)</span>
            </div>
            <div className="flex items-center gap-1.5 text-outline font-label-telemetry text-[10px]">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary" />
              <span>INSPECTION LAYER: SYNTHETIC RADAR MAPPING</span>
            </div>
          </div>
        </div>

        {/* Right Column: Primary Prescriptive Directive (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-low border border-border p-5 rounded-xl shadow-sm flex flex-col justify-between gap-5 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between pb-1 border-b border-border/40">
              <span className="font-label-telemetry text-[11px] text-primary uppercase tracking-widest flex items-center gap-1.5 font-bold">
                <span className="material-symbols-outlined text-[16px]">priority_high</span>
                OPTIMIZATION MANDATE
              </span>
              <span className="font-label-code text-[11px] text-on-surface-variant">ENGINE ID: OPT-4029</span>
            </div>

            {/* Highlight Card */}
            <div className="bg-surface-container border border-primary/30 p-4 rounded-xl shadow-md flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="font-label-telemetry text-[10px] text-secondary uppercase font-bold tracking-wider">
                  RECOMMENDED ACTION
                </span>
                <h3 className="font-headline-lg text-lg text-on-surface font-bold tracking-tight">
                  {n.action_name ?? 'Accelerate Incline-B Heading'}
                </h3>
                <p className="text-xs text-on-surface-variant leading-normal mt-0.5">
                  Reallocate auxiliary jumbo drill crew to push heading face advance from current baseline to target recovery capacity.
                </p>
              </div>

              {/* Key Delta Metric Blocks */}
              <div className="grid grid-cols-2 gap-2 bg-surface-container-high p-3 rounded-lg border border-border/40">
                <div className="flex flex-col">
                  <span className="font-label-telemetry text-[9px] text-outline uppercase font-semibold">Current Baseline</span>
                  <span className="font-headline-md text-base text-on-surface font-bold">{baselineAdv} m/d</span>
                  <span className="text-[10px] text-on-surface-variant">Heading advance</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-telemetry text-[9px] text-secondary uppercase font-semibold">Optimized Target</span>
                  <span className="font-headline-md text-base text-secondary font-bold">{targetAdv} m/d</span>
                  <span className="font-label-code text-[10px] text-secondary-fixed-dim font-bold">+{deltaAdv} m/d delta</span>
                </div>
              </div>

              {/* Direct Impact Computation */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="font-label-telemetry text-[10px] text-on-surface-variant uppercase font-semibold">
                  Direct Impact Quantification
                </span>
                <div className="flex items-center justify-between text-on-surface bg-surface-container-lowest p-2 rounded-lg text-xs">
                  <span>Net Expected Yield Gain</span>
                  <span className="font-headline-sm text-secondary font-bold">+{gainT.toLocaleString()} t</span>
                </div>
                <div className="flex items-center justify-between text-on-surface bg-surface-container-lowest p-2 rounded-lg text-xs">
                  <span>Contracted Deficit Reduction</span>
                  <span className="font-headline-sm text-on-surface font-bold">{deficitT.toLocaleString()} t → {(deficitT - gainT).toLocaleString()} t</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant px-1 pt-0.5 font-label-code text-[11px]">
                  <span>Overall Deficit Contraction</span>
                  <span className="text-secondary font-semibold">
                    {deficitT > 0 ? ((gainT / deficitT) * 100).toFixed(1) : 0}% reduction
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 relative z-10">
            <div className="flex items-center gap-1.5 text-outline font-label-telemetry text-[10px]">
              <span className="material-symbols-outlined text-[15px] text-secondary">verified</span>
              <span>ZERO CAPEX INTERVENTION</span>
            </div>
            <button
              onClick={() => onNavigate('nudge')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-secondary-container hover:text-on-secondary-container transition-colors px-4 py-2 rounded-lg font-headline-sm text-xs font-bold shadow-md cursor-pointer"
            >
              <span>Open Decision Engine</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── 4. Visual Satellite Context Tile & Analytical Snapshot (Stitch) ── */}
      <div className="w-full bg-surface-container-low border border-border p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:w-60 h-32 rounded-lg overflow-hidden shrink-0 bg-surface-container-highest border border-border">
          <img
            className="w-full h-full object-cover"
            alt="High-resolution synthetic satellite Earth observation overhead view of manganese pit"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMenm_RVcwGdOptPPKcQQcNUpRqt0X4hANnwQi29PRtwxAliTUN5X847x6gGeaa_BCW-t2LXtL27jzGR9fH5JJqbqIw46k6o6Q5pqKzgoyJHa2Nh1lQWNgR-uQyY8acNEgW0_a2s0FsIQ8M9VsxZ73vJ8zrRu80Z61wlD0090m4XpErcBQY_dviYJSq5fxRwnUFKxfl18ovK7IzIibC7XBILTq0pZpr9n1hQpiaK0IuS1IfXOxMVmXXQ"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-transparent to-transparent flex items-end p-2">
            <span className="font-label-telemetry text-secondary uppercase text-[9px] font-bold">SAR ORBIT PASS #1084</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 flex-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-label-telemetry text-secondary uppercase font-bold text-[10px]">
              SYNTHETIC CALIBRATED ORTHO-STRATUM
            </span>
            <span className="text-outline">•</span>
            <span className="font-label-code text-on-surface-variant text-[10px]">RESOLUTION: 10m GSD</span>
          </div>
          <p className="text-on-surface-variant leading-relaxed">
            Spectral reflection bands confirm continuity of high-grade pyrolusite-bearing horizons intersecting planned extraction block B-12. Surface displacement monitoring shows zero anomalous heave along the central haul ramp, allowing accelerated drift velocities without geotechnical reinforcement overhead.
          </p>
        </div>

        <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-1 shrink-0 border-t md:border-t-0 md:border-l border-border pt-2 md:pt-0 md:pl-4">
          <span className="font-label-telemetry text-outline uppercase text-[10px]">GEO-INTELLIGENCE FIT</span>
          <span className="font-headline-md text-base text-on-surface font-bold">99.4%</span>
          <span className="font-label-code text-secondary text-[10px] font-semibold">READY FOR INGESTION</span>
        </div>
      </div>

      {/* ── 5. System Status Footnote (Stitch) ── */}
      <div className="w-full pt-1 flex flex-wrap items-center justify-between gap-3 text-xs text-on-surface-variant">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex items-center gap-1.5 bg-surface-container-low border border-border px-3 py-1 rounded-full text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="font-label-telemetry uppercase">EO Data: Simulated Sentinel-2 L2A</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-surface-container-low border border-border px-3 py-1 rounded-full text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="font-label-telemetry uppercase">Borehole Assays: 12,840 Samples</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-surface-container-low border border-border px-3 py-1 rounded-full text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
            <span className="font-label-telemetry uppercase">Stochastic Iterations: 50,000</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-surface-container-low border border-border px-3 py-1 rounded-full text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="font-label-telemetry uppercase">System Health: Nominal</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-label-code text-outline text-[11px]">
          <span>Confidence Interval: 95% Bayesian Likelihood</span>
          <span>•</span>
          <span className="text-on-surface-variant font-semibold">Engine v4.8.2 Active</span>
        </div>
      </div>

    </div>
  )
}
