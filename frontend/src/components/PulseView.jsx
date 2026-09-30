/**
 * PulseView — Production Forecast & SHAP Explainability (Stitch "Industrial Telemetry & Mineral Ops")
 * Direct implementation matching stitch_oresight_ui_redesign/screens/stage05_production_forecast.html
 * Preserves dynamic API data from /api/pulse, /api/risk, and /api/shap.
 */
import React from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { fmtT, fmtPct, featureLabel } from '../utils/labels.js'

const EXCLUDE = new Set(['planned_t'])
const MAX_DRIVERS = 6

const fmtDate = (d) => {
  const dt = new Date(d)
  return `${dt.getDate()}/${dt.getMonth() + 1}`
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-container border border-border p-3 rounded-lg shadow-xl text-xs min-w-[200px]">
      <div className="font-bold text-on-surface pb-1 mb-1 border-b border-border/50">
        Date: {label}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-3 py-0.5">
          <span style={{ color: p.color ?? '#89929b' }}>{p.name}:</span>
          <span className="font-bold text-on-surface font-label-code">{Math.round(p.value).toLocaleString()} t</span>
        </div>
      ))}
    </div>
  )
}

export default function PulseView({ pulse, risk, shap }) {
  const summary = pulse?.summary?.forecast_summary ?? {}
  const planned = summary.total_planned_production_t ?? pulse?.planned_production_t ?? 71988.9
  const expected = summary.total_expected_production_t ?? pulse?.expected_production_t ?? 68593.4
  const shortfall = summary.total_expected_shortfall_t ?? (planned - expected)
  const p10 = summary.total_p10_production_t ?? pulse?.p10_production_t ?? 66322.2
  const p90 = summary.total_p90_production_t ?? pulse?.p90_production_t ?? 71073.7
  const prob = risk?.overall_shortfall_probability ?? summary.overall_shortfall_probability ?? 0.8837
  const riskLevel = risk?.risk_level ?? 'CRITICAL'
  const forecast = pulse?.forecast ?? []

  // Chart data formatting
  const chartData = forecast.map((d) => ({
    date: fmtDate(d.date),
    fullDate: d.date,
    planned: Math.round(d.planned_production_t ?? 2400),
    p10: Math.round(d.p10_t ?? 2200),
    p50: Math.round(d.p50_t ?? d.expected_production_t ?? 2290),
    p90: Math.round(d.p90_t ?? 2370),
    uncertaintyRange: [Math.round(d.p10_t ?? 2200), Math.round(d.p90_t ?? 2370)],
  }))

  const rawDrivers = shap?.drivers ?? risk?.top_risk_drivers ?? []
  const drivers = rawDrivers.filter((d) => !EXCLUDE.has(d.feature)).slice(0, MAX_DRIVERS)

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1720px] mx-auto pb-12">

      {/* ── 1. Context Breadcrumb & Live Simulation Bar (Stitch) ── */}
      <div className="w-full bg-surface-container-lowest border border-border px-4 py-2 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-label-telemetry text-outline uppercase tracking-wider font-semibold">PREDICTIVE ANALYTICS</span>
          <span className="text-outline-variant font-label-code">/</span>
          <span className="font-label-telemetry text-secondary uppercase tracking-wider font-bold">STOCHASTIC ENGINE 04</span>
          <span className="text-outline-variant font-label-code">/</span>
          <span className="font-label-code text-on-surface-variant">SEED: 884-JAX-ORBITAL</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse" />
            <span className="font-label-telemetry text-secondary font-bold text-[10px]">
              CALIBRATION: 10,000 MONTE CARLO ITERATIONS
            </span>
          </div>
          <div className="flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded border border-border">
            <span className="material-symbols-outlined text-secondary text-[14px]">tune</span>
            <span className="font-label-code text-on-surface text-[10px]">PULSE v4.8 ACTIVE</span>
          </div>
        </div>
      </div>

      {/* ── 2. Header Block: Title, Subtitle, & Methodological Note ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-2 border-b border-border/40">
        <div className="flex flex-col max-w-3xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-secondary-container/20 text-secondary font-label-telemetry text-[10px] uppercase tracking-wider font-bold rounded">
              HORIZON: D+30
            </span>
            <span className="font-label-code text-on-surface-variant text-xs">WINDOW: 30-DAY OPERATIONAL SPRINT</span>
          </div>
          <h1 className="font-headline-lg text-2xl md:text-3xl text-on-surface font-bold tracking-tight">
            30-Day Production Forecast &amp; Uncertainty Analysis
          </h1>
          <p className="text-secondary text-sm md:text-base mt-0.5">
            30-Day Predictive Horizon · What can we realistically produce?
          </p>
          <div className="mt-2 p-2.5 bg-surface-container-low border border-border rounded-lg shadow-sm flex items-start gap-2.5 text-xs">
            <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">info</span>
            <p className="text-on-surface-variant leading-relaxed">
              <strong className="text-on-surface font-semibold">Methodological Note:</strong> PULSE uses historical operational data, live haulage kinematics, and satellite environmental moisture indexes to forecast production and quantify uncertainty over the next 30 days.
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Primary KPIs Bento Grid (4 cards from Stitch) ── */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Card 1: Planned Target */}
        <div className="p-4 bg-surface-container-low border border-border rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-telemetry text-[10px] uppercase tracking-wider font-semibold">PLANNED TARGET</span>
            <span className="material-symbols-outlined text-[18px]">flag</span>
          </div>
          <div className="my-2">
            <div className="font-display-metric text-2xl md:text-3xl text-on-surface font-bold tracking-tight">
              {Math.round(planned).toLocaleString()} <span className="text-sm text-on-surface-variant font-normal">tonnes</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
            <span className="text-on-surface-variant">Contracted delivery quota</span>
            <span className="font-label-telemetry text-secondary bg-surface-container-high px-1.5 py-0.5 rounded font-bold text-[9px]">100.0%</span>
          </div>
        </div>

        {/* Card 2: Expected Production (P50) */}
        <div className="p-4 bg-surface-container-low border border-border rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="font-label-telemetry text-[10px] uppercase tracking-wider font-bold">EXPECTED PRODUCTION (P50)</span>
            </div>
            <span className="material-symbols-outlined text-[18px]">show_chart</span>
          </div>
          <div className="my-2">
            <div className="font-display-metric text-2xl md:text-3xl text-secondary font-bold tracking-tight">
              {Math.round(expected).toLocaleString()} <span className="text-sm text-on-surface-variant font-normal">tonnes</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
            <span className="text-on-surface-variant">Median stochastic forecast</span>
            <span className="font-label-telemetry text-secondary bg-surface-container-high px-1.5 py-0.5 rounded font-bold text-[9px]">
              {planned > 0 ? ((expected / planned) * 100).toFixed(1) : 95.3}% ATTAINMENT
            </span>
          </div>
        </div>

        {/* Card 3: Expected Shortfall */}
        <div className="p-4 bg-surface-container-low border border-border rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-error">
            <span className="font-label-telemetry text-[10px] uppercase tracking-wider font-bold">EXPECTED SHORTFALL</span>
            <span className="material-symbols-outlined text-[18px]">trending_down</span>
          </div>
          <div className="my-2">
            <div className="font-display-metric text-2xl md:text-3xl text-error font-bold tracking-tight">
              {Math.round(shortfall).toLocaleString()} <span className="text-sm text-on-surface-variant font-normal">tonnes</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
            <span className="text-on-surface-variant">Unmitigated Deficit</span>
            <span className="font-label-telemetry text-error bg-surface-container-high px-1.5 py-0.5 rounded font-bold text-[9px]">
              −{planned > 0 ? ((shortfall / planned) * 100).toFixed(1) : 4.7}% BELOW QUOTA
            </span>
          </div>
        </div>

        {/* Card 4: Shortfall Risk */}
        <div className="p-4 bg-surface-container-low border border-error/40 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-error">
            <span className="font-label-telemetry text-[10px] uppercase tracking-wider font-bold">SHORTFALL RISK</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-error-container text-on-error font-label-telemetry text-[9px] font-bold">
              {riskLevel}
            </span>
          </div>
          <div className="my-2">
            <div className="font-display-metric text-2xl md:text-3xl text-error font-bold tracking-tight">
              {fmtPct(prob)}
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
            <span className="text-on-surface-variant">Shortfall Probability</span>
            <span className="font-label-telemetry text-error font-bold text-[9px]">CRITICAL INTERVENTION</span>
          </div>
        </div>
      </div>

      {/* ── 4. 30-Day Uncertainty Predictive Chart ── */}
      <div className="w-full bg-surface-container-low border border-border rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40 text-xs">
          <div>
            <span className="font-label-telemetry text-[10px] text-secondary uppercase font-bold tracking-wider">
              QUANTILE REGRESSION TRAJECTORY
            </span>
            <h2 className="font-headline-sm text-sm md:text-base text-on-surface font-bold">
              30-Day Production Uncertainty Band (P10 · P50 · P90)
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs font-label-code">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-primary" />
              <span>Planned Target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-secondary" />
              <span className="text-secondary font-bold">P50 Expected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2 bg-secondary/20 border border-secondary/50 rounded-sm" />
              <span className="text-outline">P10–P90 Envelope</span>
            </div>
          </div>
        </div>

        <div className="w-full h-[320px] md:h-[380px] my-3">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2b3c" vertical={false} />
              <XAxis dataKey="date" stroke="#89929b" tick={{ fill: '#89929b', fontSize: 10 }} />
              <YAxis
                stroke="#89929b"
                tick={{ fill: '#89929b', fontSize: 10 }}
                domain={['auto', 'auto']}
                tickFormatter={(v) => `${(v / 1e3).toFixed(1)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              {/* Uncertainty Band */}
              <Area
                type="monotone"
                dataKey="uncertaintyRange"
                name="P10–P90 Confidence"
                stroke="none"
                fill="#7bd0ff"
                fillOpacity={0.15}
              />
              {/* Planned Target */}
              <Line
                type="monotone"
                dataKey="planned"
                name="Planned Target"
                stroke="#ffd165"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              {/* P50 Forecast Curve */}
              <Line
                type="monotone"
                dataKey="p50"
                name="P50 Expected"
                stroke="#7bd0ff"
                strokeWidth={2.5}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── 5. SHAP Feature Attribution Console (Stitch) ── */}
      <div className="w-full bg-surface-container-low border border-border rounded-xl p-5 shadow-sm">
        <div className="pb-3 mb-3 border-b border-border/40">
          <span className="font-label-telemetry text-[10px] text-primary uppercase font-bold tracking-wider">
            FEATURE ATTRIBUTION
          </span>
          <h3 className="font-headline-sm text-sm md:text-base text-on-surface font-bold mt-0.5">
            What spatial and operational factors influence production uncertainty?
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            SHAP (SHapley Additive exPlanations) isolates the contribution of each operational lever and environmental factor to the overall shortfall risk.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {drivers.map((d, idx) => {
            const isActionable = d.driver_type === 'ACTIONABLE'
            const impactVal = Number(d.mean_absolute_shap ?? d.shap_value ?? 0).toFixed(1)

            return (
              <div
                key={d.feature || idx}
                className="bg-surface-container border border-border/60 p-3 rounded-xl flex flex-col justify-between hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="font-headline-sm text-xs font-bold text-on-surface truncate">
                    {featureLabel(d.feature)}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-label-telemetry text-[9px] uppercase font-bold ${
                      isActionable ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-outline'
                    }`}
                  >
                    {isActionable ? 'Actionable' : 'Contextual'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between my-1">
                  <span className="text-xs text-on-surface-variant font-label-code">SHAP Impact</span>
                  <span className="font-headline-md text-base font-bold text-secondary">
                    {impactVal} <span className="text-xs text-outline font-normal">pts</span>
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-surface-variant mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isActionable ? 'bg-primary' : 'bg-secondary'}`}
                    style={{ width: `${Math.min(100, Number(impactVal) * 2)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
