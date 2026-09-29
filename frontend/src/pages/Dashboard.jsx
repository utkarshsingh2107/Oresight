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
  const [stage,   setStage]   = useState('overview')

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

  return (
    <>
      <Header onRefresh={load} loading={loading} />

      <main className="page-wrapper">
        {/* Demo disclaimer */}
        <div role="note" aria-label="Demo disclaimer" style={{
          background: 'rgba(210,153,34,.06)', border: '1px solid rgba(210,153,34,.2)',
          borderRadius: 'var(--radius-sm)', padding: '6px 14px',
          fontSize: '0.75rem', color: 'rgba(210,153,34,.85)', marginBottom: 'var(--gap-md)',
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
            <PipelineStrip activeStage={stage} onSelect={setStage} />

            {stage === 'overview' && (
              <OverviewPanel
                overview={data.overview}
                onNavigate={setStage}
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
    </>
  )
}
