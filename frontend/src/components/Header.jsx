import React from 'react'

/**
 * Stitch Brand Logo — Satellite orbital trajectory + 3D isometric ore block + precision reticle
 * Direct source vector from stitch_oresight_ui_redesign/code.html
 */
export function OresightLogo({ size = 34 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {/* Outer orbital trajectory representing satellite / remote sensing */}
      <ellipse
        cx="50"
        cy="50"
        rx="42"
        ry="18"
        stroke="#38bdf8"
        strokeWidth="2"
        strokeDasharray="4 2"
        transform="rotate(-28 50 50)"
        opacity="0.85"
      />
      <circle cx="82" cy="33" r="3" fill="#38bdf8" />

      {/* Subsurface Geological Hex-Cube / Ore Block */}
      {/* Top Face */}
      <polygon
        points="50,22 74,36 50,50 26,36"
        fill="#d97707"
        fillOpacity="0.9"
        stroke="#ffb77d"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Left Face */}
      <polygon
        points="26,36 50,50 50,78 26,64"
        fill="#92400e"
        fillOpacity="0.95"
        stroke="#ffb77d"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Right Face */}
      <polygon
        points="50,50 74,36 74,64 50,78"
        fill="#b45309"
        fillOpacity="0.9"
        stroke="#ffb77d"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Sight / Reticle Target Precision Crosshair */}
      <circle cx="50" cy="50" r="7" stroke="#ffffff" strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="50" r="2.5" fill="#f59e0b" />
      <line x1="50" y1="40" x2="50" y2="44" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="56" x2="50" y2="60" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="40" y1="50" x2="44" y2="50" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="56" y1="50" x2="60" y2="50" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export default function Header({ onRefresh, loading, activeStage = 'overview', onSelectStage }) {
  const STAGES = [
    { id: 'overview',  label: 'Mission Overview' },
    { id: 'satellite', label: 'Space Intelligence' },
    { id: 'prism',     label: 'Resource Mapping' },
    { id: 'ear',       label: 'Accessibility' },
    { id: 'pulse',     label: 'Production Forecast' },
    { id: 'nudge',     label: 'Decision Engine' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/95 backdrop-blur-md border-b border-border shadow-[0_1px_8px_rgba(0,0,0,0.2)]">
      {/* Stitch Top Telemetry & Operational Link Bar */}
      <div className="w-full bg-surface-container-high px-4 md:px-6 py-1 flex items-center justify-between text-xs border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-secondary-container animate-pulse" />
          <span className="font-label-telemetry uppercase tracking-wider text-secondary font-bold text-[10px]">
            CALIBRATED TELEMETRY
          </span>
          <span className="font-label-code text-on-surface-variant text-[11px] hidden sm:inline">
            — Synthetic calibrated data • Earth-observation layers are simulated for demonstration • Architecture is integration-ready for real EO feeds.
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="font-label-telemetry text-outline hidden md:inline">
            TELEMETRY LINK: <span className="text-secondary font-semibold">NOMINAL</span>
          </span>
          <span className="font-label-code text-on-surface-variant">LATENCY 14ms</span>
        </div>
      </div>

      {/* Main Command Navigation Bar */}
      <div className="h-14 w-full px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Brandmark Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <OresightLogo size={34} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-base md:text-lg tracking-tight text-on-surface font-bold leading-none">
                OreSight
              </span>

              {/* Status Chips */}
              <span className="status-chip chip--amber">
                MVP
              </span>
              <span
                className="status-chip chip--feasible"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                title="System Operational — Phase 1–8 Active"
              >
                <span className="pulse-beacon" />
                ONLINE
              </span>
            </div>

            <p className="text-outline text-[11px] mt-0.5 tracking-wide leading-none">
              Space-Enabled Mine Intelligence Console
            </p>
          </div>
        </div>

        {/* Desktop Pipeline Stage Navigation from Stitch */}
        {onSelectStage && (
          <nav className="hidden xl:flex items-center gap-1">
            {STAGES.map((s) => {
              const isActive = activeStage === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => onSelectStage(s.id)}
                  className={`px-3 py-1.5 text-xs transition-colors rounded-lg font-medium cursor-pointer ${
                    isActive
                      ? 'bg-surface-container-high text-secondary border border-secondary/30'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  {s.label}
                </button>
              )
            })}
          </nav>
        )}

        {/* Right Telemetry Indicators & Action Control */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="status-chip" style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)' }}>
            MINE: <span style={{ color: 'var(--text-primary)', marginLeft: 3 }}>DEMO-01</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-surface-container-low px-2 py-0.5 rounded-lg border border-border">
            <span className="flex h-1.5 w-1.5 rounded-full bg-secondary-container" />
            <span className="font-label-telemetry text-[9px] text-secondary uppercase font-semibold">
              SENTINEL-2 / ISRO READY
            </span>
          </div>

          <div className="hidden md:flex flex-col items-end text-right">
            <span className="font-label-code text-on-surface tabular-nums text-[11px]">
              UTC 14:32:08.41
            </span>
            <span className="font-label-telemetry text-outline text-[9px]">
              ORBITAL EPOCH 582.1
            </span>
          </div>

          {/* Refresh Action — Stitch Secondary Utility Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh data"
            className="btn-secondary flex items-center gap-1.5"
            style={{
              fontSize: '0.8rem',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              minWidth: 96,
            }}
          >
            <span
              className="material-symbols-outlined text-[15px]"
              style={{
                display: 'inline-block',
                animation: loading ? 'spin 1s linear infinite' : 'none',
              }}
            >
              refresh
            </span>
            <span>{loading ? 'Updating…' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
