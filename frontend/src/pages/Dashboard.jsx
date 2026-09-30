import React, { useCallback, useEffect, useState } from 'react'
import Header          from '../components/Header.jsx'
import PipelineStrip   from '../components/PipelineStrip.jsx'
import OverviewPanel   from '../components/OverviewPanel.jsx'
import SatelliteView   from '../components/SatelliteView.jsx'
import PrismView       from '../components/PrismView.jsx'
import EarView         from '../components/EarView.jsx'
import PulseView       from '../components/PulseView.jsx'
import NudgeView       from '../components/NudgeView.jsx'
import LoadingSpinner  from '../components/LoadingSpinner.jsx'
import ErrorBanner     from '../components/ErrorBanner.jsx'
import {
  getOverview, getPulse, getRisk, getShap, getNudge, getNudgeCandidates,
} from '../services/api.js'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [data,    setData]    = useState(null)
  const [stage,   setStage]   = useState(() => {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      return 'overview'
    }
    if (typeof window !== 'undefined' && window.location?.search) {
      const p = new URLSearchParams(window.location.search).get('stage')
      if (['overview', 'satellite', 'prism', 'ear', 'pulse', 'nudge'].includes(p)) return p
    }
    return 'overview'
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [overview, pulse, risk, shap, nudge, nudgeCands] = await Promise.all([
        getOverview(), getPulse(), getRisk(), getShap(), getNudge(), getNudgeCandidates(),
      ])
      setData({ overview, pulse, risk, shap, nudge, nudgeCands })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleSelectStage = useCallback((newStage) => {
    setStage(newStage)
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      try {
        const url = new URL(window.location)
        url.searchParams.set('stage', newStage)
        window.history.replaceState({}, '', url)
      } catch {
        // no-op for mock environments
      }
    }
  }, [])

  return (
    <>
      <Header onRefresh={load} loading={loading} activeStage={stage} onSelectStage={handleSelectStage} />

      <main className="page-wrapper">
        {/* Demo disclaimer — design.md §24 data presentation rule: provenance always visible */}
        <div role="note" aria-label="Demo disclaimer" style={{
          background: 'rgba(245,158,11,.06)',
          border: '1px solid rgba(245,158,11,.22)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 14px',
          fontSize: '0.75rem',
          color: 'rgba(245,158,11,.85)',
          marginBottom: 'var(--gap-md)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>⚠</span>
          <span>
            <strong>DEMO MODE</strong> — Synthetic calibrated data (DEMO-01).
            Earth-observation layers are simulated for demonstration.
            Architecture is integration-ready for Sentinel-2, Sentinel-1, DEM and other real Earth-observation feeds.
          </span>
        </div>

        {loading && !data && <LoadingSpinner />}
        {error   && !data && <ErrorBanner error={error} onRetry={load} />}

        {data && (
          <>
            <PipelineStrip activeStage={stage} onSelect={handleSelectStage} />

            {stage === 'overview' && (
              <OverviewPanel
                overview={data.overview}
                onNavigate={handleSelectStage}
              />
            )}

            {/* Track 1 — Space Technology */}
            {stage === 'satellite' && (
              <SatelliteView />
            )}

            {/* Track 1 — Reserve Identification (Geology + Space integrated) */}
            {stage === 'prism' && (
              <PrismView prism={data.overview?.prism} />
            )}

            {/* Track 2 — Production Intelligence */}
            {stage === 'ear' && (
              <EarView ear={data.overview?.ear} />
            )}

            {stage === 'pulse' && (
              <PulseView
                pulse={data.pulse}
                risk={data.risk}
                shap={data.shap}
              />
            )}

            {stage === 'nudge' && (
              <NudgeView
                nudge={data.nudge}
                nudgeCands={data.nudgeCands}
              />
            )}
          </>
        )}
      </main>

      {/* Stitch Global Operational Footer */}
      <footer className="w-full bg-surface-container-lowest/90 border-t border-border py-3 mt-10">
        <div className="w-full max-w-[1720px] mx-auto px-4 md:px-6 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-label-telemetry uppercase text-secondary flex items-center gap-1.5 font-bold text-[10px]">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary" />
              SYS_SYNC: LOCKED
            </span>
            <span className="font-label-code text-on-surface-variant text-[11px]">
              PIPELINE: SAR_INTERFEROMETRY_STABLE
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-label-telemetry text-outline text-[10px] uppercase font-semibold">
              COMPLIANCE: JORC 2012 / UNFC 2009 READY
            </span>
            <span className="font-label-code text-on-surface-variant text-[11px]">
              © 2025 OreSight EO Core
            </span>
          </div>
        </div>
      </footer>
    </>
  )
}
