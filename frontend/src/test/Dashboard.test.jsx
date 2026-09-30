/**
 * Dashboard component tests — updated for Stitch design migration
 * Six stages: Mission Overview · Space Intelligence · Resource Mapping ·
 *             Accessibility · Production Forecast · Decision Engine
 * API calls are fully mocked so tests run without a live backend.
 */
import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import Dashboard from '../pages/Dashboard.jsx'

// ── Mock the api service ────────────────────────────────────────────────
vi.mock('../services/api.js', () => ({
  API_BASE:           'http://127.0.0.1:8000',
  getOverview:        vi.fn(),
  getPrismBlocks:     vi.fn(),
  getEarBlocks:       vi.fn(),
  getPulse:           vi.fn(),
  getRisk:            vi.fn(),
  getShap:            vi.fn(),
  getNudge:           vi.fn(),
  getNudgeCandidates: vi.fn(),
  getSatellite:       vi.fn(),
  getSatelliteGrid:   vi.fn(),
}))

// ── Stub Plotly ─────────────────────────────────────────────────────────
vi.mock('plotly.js-basic-dist-min', () => ({
  newPlot: () => Promise.resolve(),
  react:   () => Promise.resolve(),
  purge:   () => {},
  default: { newPlot: () => Promise.resolve() },
}))

import {
  getOverview, getPrismBlocks, getEarBlocks,
  getPulse, getRisk, getShap, getNudge, getNudgeCandidates,
  getSatellite, getSatelliteGrid,
} from '../services/api.js'

// ── Stub data ─────────────────────────────────────────────────────────────
const STUB_OVERVIEW = {
  prism: {
    declared_reserve_t: 48271696.4, ore_blocks: 498, waste_blocks: 1742,
    average_mn_pct: 25.246, mn_cutoff_pct: 20, total_blocks: 2240,
    max_estimated_mn_pct: 42.301, provenance: 'SYNTHETIC',
    variogram: { nugget: 9.9, partial: 188.07, range: 224.34, sill: 197.97 },
  },
  ear: {
    declared_reserve_t: 48271696.4, effective_accessible_reserve_t: 32736929.4,
    accessibility_ratio: 0.6782, accessible_blocks: 339, inaccessible_blocks: 159,
    total_ore_blocks: 498, provenance: 'SYNTHETIC',
    constraints: {
      development_ready_z_threshold_m: 192, equipment_availability_threshold: 0.85,
      weather_rainfall_threshold_mm: 30, equipment_available_mine_wide: true,
      weather_feasibility_score: 0.9434,
    },
  },
  pulse: {
    planned_production_t: 71988.9, expected_production_t: 68593.4,
    expected_shortfall_t: 3395.5, shortfall_probability: 0.8837,
    p10_production_t: 66322.2, p50_production_t: 68593.4, p90_production_t: 71073.7,
    forecast_horizon_days: 30, mae: 61.3, rmse: 77.4, mape: 2.66,
  },
  risk_level: 'CRITICAL',
  shortfall_probability: 0.8837,
  nudge: {
    action_name: 'Increase development progress', feature: 'development_m',
    baseline_value: 18.5323, recommended_value: 19.2374,
    expected_production_gain_t: 606.6, expected_shortfall_reduction_t: 606.6,
    new_shortfall_probability: 0.8803, feasible: true,
  },
  provenance: 'SYNTHETIC DEMO-01 data — not real MOIL operational data',
}

const STUB_PULSE = {
  summary: {
    model: 'LightGBM Quantile Regression', forecast_horizon_days: 30,
    forecast_period: { start: '2025-12-02', end: '2025-12-31' },
    validation_metrics: { P50: { MAE: 61.3, RMSE: 77.4, MAPE: 2.66 } },
    forecast_summary: {
      total_planned_production_t: 71988.9, total_expected_production_t: 68593.4,
      total_expected_shortfall_t: 3395.5, overall_shortfall_probability: 0.8837,
      total_p10_production_t: 66322.2, total_p50_production_t: 68593.4,
      total_p90_production_t: 71073.7,
    },
  },
  forecast: Array.from({ length: 30 }, (_, i) => ({
    date: `2025-12-${String(i + 1).padStart(2, '0')}`, mine_id: 'DEMO-01',
    planned_production_t: 2400, p10_t: 2200, p50_t: 2290, p90_t: 2370,
    expected_production_t: 2290, shortfall_t: 110, shortfall_probability: 0.88,
  })),
}

const STUB_RISK = {
  overall_shortfall_probability: 0.8837, risk_level: 'CRITICAL',
  forecast_horizon_days: 30, expected_production_t: 68593.4,
  planned_production_t: 71988.9, expected_shortfall_t: 3395.5,
  top_risk_drivers: [
    { feature: 'fleet_availability', mean_absolute_shap: 24.24,
      impact_direction: 'DOWN', importance_rank: 3, driver_type: 'ACTIONABLE' },
  ],
  actionable_drivers: [], contextual_drivers: [],
  shap_note: 'SHAP values measure model feature attribution.',
  risk_thresholds: { LOW:[0,0.25], MEDIUM:[0.25,0.5], HIGH:[0.5,0.75], CRITICAL:[0.75,1] },
}

const STUB_SHAP = {
  count: 5,
  drivers: [
    { feature: 'fleet_availability', mean_absolute_shap: 24.24, impact_direction: 'DOWN', importance_rank: 1, driver_type: 'ACTIONABLE' },
    { feature: 'rainfall_mm',        mean_absolute_shap: 41.93, impact_direction: 'DOWN', importance_rank: 2, driver_type: 'CONTEXTUAL' },
    { feature: 'development_m',      mean_absolute_shap: 17.55, impact_direction: 'DOWN', importance_rank: 3, driver_type: 'ACTIONABLE' },
    { feature: 'delay_h',            mean_absolute_shap: 16.98, impact_direction: 'DOWN', importance_rank: 4, driver_type: 'ACTIONABLE' },
    { feature: 'planned_t',          mean_absolute_shap: 97.16, impact_direction: 'DOWN', importance_rank: 5, driver_type: 'ACTIONABLE' },
  ],
}

const STUB_NUDGE = {
  status: 'success', provenance: 'SYNTHETIC',
  baseline: {
    expected_production_t: 68593.4, planned_production_t: 71988.9,
    expected_shortfall_t: 3395.5, shortfall_probability: 0.8837,
    fleet_availability: 0.9289, fleet_downtime_h: 15.36, delay_h: 0,
    development_m: 18.53, available_workers: 87.9,
  },
  best_action: {
    action_name: 'Increase development progress', feature: 'development_m',
    baseline_value: 18.5323, recommended_value: 19.2374,
    expected_production_t: 69200, expected_production_gain_t: 606.6,
    expected_shortfall_t: 2788.9, expected_shortfall_reduction_t: 606.6,
    new_expected_shortfall_t: 2788.9, new_shortfall_probability: 0.8803,
    feasible: true, rationale: 'Allocate additional development crews.',
  },
  optimization: {
    objective: 'minimize_expected_shortfall', method: 'PuLP CBC',
    candidates_evaluated: 4, feasible_candidates: 4,
  },
  constraints: [], excluded_levers: {}, assumptions: [],
}

const STUB_CANDIDATES = {
  count: 4,
  candidates: [
    { rank: 1, action_name: 'Increase development progress', feature: 'development_m',    baseline_value: 18.53, recommended_value: 19.24, expected_production_t: 69200,   production_gain_t: 606.6, expected_shortfall_t: 2788.9, shortfall_reduction_t: 606.6, feasible: true, constraint_notes: 'Within bounds' },
    { rank: 2, action_name: 'Improve fleet availability',    feature: 'fleet_availability',baseline_value: 0.929, recommended_value: 0.957, expected_production_t: 69008.6, production_gain_t: 415.2, expected_shortfall_t: 2980.3, shortfall_reduction_t: 415.2, feasible: true, constraint_notes: 'Within bounds' },
    { rank: 3, action_name: 'Reduce equipment downtime',     feature: 'fleet_downtime_h',  baseline_value: 15.36, recommended_value: 10.54, expected_production_t: 68756.9, production_gain_t: 163.5, expected_shortfall_t: 3232.0, shortfall_reduction_t: 163.5, feasible: true, constraint_notes: 'Within bounds' },
    { rank: 4, action_name: 'Increase available workforce',  feature: 'available_workers', baseline_value: 87.87, recommended_value: 90.97, expected_production_t: 68623.5, production_gain_t: 30.1,  expected_shortfall_t: 3365.4, shortfall_reduction_t: 30.1,  feasible: true, constraint_notes: 'Within bounds' },
  ],
}

const STUB_SATELLITE = {
  module: 'space_intelligence', mine_id: 'DEMO-01',
  status: 'prototype_synthetic', grid_cells: 208, surface_targets: 5,
  mean_mineralisation: 0.446, mean_confidence: 0.679,
  layer_statistics: {
    ndvi:               { mean: 0.451, std: 0.1, min: 0.05, max: 0.9,  description: 'NDVI' },
    iron_oxide_idx:     { mean: 0.411, std: 0.1, min: 0.05, max: 0.95, description: 'IOI' },
    clay_alter_idx:     { mean: 0.412, std: 0.1, min: 0.05, max: 0.85, description: 'CAI' },
    soil_moisture:      { mean: 0.384, std: 0.1, min: 0.05, max: 0.8,  description: 'NDWI' },
    surface_reflectance:{ mean: 0.251, std: 0.05,min: 0.05, max: 0.65, description: 'Refl' },
    slope_deg:          { mean: 13.83, std: 4,   min: 1,    max: 45,   description: 'Slope' },
    spectral_anomaly:   { mean: 0.289, std: 0.1, min: 0,    max: 1,    description: 'Anomaly' },
    mineralisation_score:{ mean:0.446, std: 0.1, min: 0,    max: 1,    description: 'Score' },
    satellite_confidence:{ mean:0.679, std: 0.1, min: 0.3,  max: 1,    description: 'Conf' },
  },
  top_eo_targets: [
    { rank:1, latitude:21.83, longitude:80.3483, grid_x:225, grid_y:320,
      elevation_m:185, mineralisation_score:0.703, iron_oxide_idx:0.722,
      clay_alter_idx:0.69, ndvi:0.31, spectral_anomaly:0.65,
      slope_deg:22.1, satellite_confidence:0.7, grade_proxy_mn:28.5 },
  ],
  geological_integration: { borehole_count: 50, ore_boreholes: 18, declared_reserve_t: 48271696.4 },
  key_disclaimer: 'EO surface indicators provide spatial context only.',
  integration_ready: ['Sentinel-2 MSI', 'ISRO Bhuvan'],
  processing_stack_integration_ready: ['GDAL', 'Rasterio'],
}

const STUB_SAT_GRID = {
  grid: [], count: 0, resolution_m: 50,
}

function setupMocks() {
  getOverview.mockResolvedValue(STUB_OVERVIEW)
  getPrismBlocks.mockResolvedValue({ blocks: [], count: 0 })
  getEarBlocks.mockResolvedValue({ blocks: [], count: 0 })
  getPulse.mockResolvedValue(STUB_PULSE)
  getRisk.mockResolvedValue(STUB_RISK)
  getShap.mockResolvedValue(STUB_SHAP)
  getNudge.mockResolvedValue(STUB_NUDGE)
  getNudgeCandidates.mockResolvedValue(STUB_CANDIDATES)
  getSatellite.mockResolvedValue(STUB_SATELLITE)
  getSatelliteGrid.mockResolvedValue(STUB_SAT_GRID)
}

// ── Tests ───────────────────────────────────────────────────────────────

describe('Dashboard', () => {

  it('shows loading state before data arrives', () => {
    const never = new Promise(() => {})
    getOverview.mockReturnValue(never)
    getPulse.mockReturnValue(never)
    getRisk.mockReturnValue(never)
    getShap.mockReturnValue(never)
    getNudge.mockReturnValue(never)
    getNudgeCandidates.mockReturnValue(never)
    getSatellite.mockReturnValue(never)
    getSatelliteGrid.mockReturnValue(never)
    render(<Dashboard />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows error state when backend is unavailable', async () => {
    const err = new Error('Network Error')
    ;[getOverview, getPulse, getRisk, getShap, getNudge, getNudgeCandidates,
      getSatellite, getSatelliteGrid].forEach(m => m.mockRejectedValue(err))
    render(<Dashboard />)
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/unable to connect/i)).toBeInTheDocument()
    })
  })

  describe('with data loaded', () => {
    beforeEach(() => { vi.clearAllMocks(); setupMocks() })

    it('renders Space-Enabled Mine Intelligence heading on overview', async () => {
      render(<Dashboard />)
      await waitFor(() => {
        expect(screen.getByText(/Space-Enabled Mine Intelligence/i)).toBeInTheDocument()
      }, { timeout: 8000 })
    })

    it('loads API data and displays 48.27 Mt geological resource', async () => {
      render(<Dashboard />)
      await waitFor(() =>
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(), { timeout: 8000 }
      )
      const els = screen.getAllByText((c) => c.includes('48.27'))
      expect(els.length).toBeGreaterThan(0)
    })

    it('shows CRITICAL risk level badge on the overview', async () => {
      render(<Dashboard />)
      await waitFor(() => {
        const criticals = screen.getAllByText(/CRITICAL/i)
        expect(criticals.length).toBeGreaterThan(0)
      }, { timeout: 8000 })
    })

    it('navigates to Production Forecast stage and shows chart', async () => {
      render(<Dashboard />)
      await waitFor(() =>
        screen.getByText(/Space-Enabled Mine Intelligence/i), { timeout: 8000 }
      )
      fireEvent.click(screen.getByRole('button', { name: /Stage: Production Forecast/i }))
      await waitFor(() => {
        expect(screen.getByText(/30-Day Production Forecast/i)).toBeInTheDocument()
      })
    })

    it('shows SHAP risk drivers inside Production Forecast stage', async () => {
      render(<Dashboard />)
      await waitFor(() =>
        screen.getByText(/Space-Enabled Mine Intelligence/i), { timeout: 8000 }
      )
      fireEvent.click(screen.getByRole('button', { name: /Stage: Production Forecast/i }))
      await waitFor(() => {
        expect(screen.getByText(/spatial and operational factors/i)).toBeInTheDocument()
      })
    })

    it('renders Decision Engine with best action and 4 candidates', async () => {
      render(<Dashboard />)
      await waitFor(() =>
        screen.getByText(/Space-Enabled Mine Intelligence/i), { timeout: 8000 }
      )
      fireEvent.click(screen.getByRole('button', { name: /Stage: Decision Engine/i }))
      await waitFor(() => {
        expect(screen.getByText(/Recommended action/i)).toBeInTheDocument()
        expect(screen.getAllByText(/Increase development progress/i).length).toBeGreaterThan(0)
        expect(screen.getByText(/Improve fleet availability/i)).toBeInTheDocument()
        expect(screen.getByText(/Reduce equipment downtime/i)).toBeInTheDocument()
        expect(screen.getByText(/Increase available workforce/i)).toBeInTheDocument()
      })
    })

    it('shows the DEMO MODE synthetic data disclaimer', async () => {
      render(<Dashboard />)
      await waitFor(() => {
        expect(screen.getByRole('note')).toBeInTheDocument()
        expect(screen.getByText(/Demo Mode/i)).toBeInTheDocument()
      })
    })

    it('navigates to Resource Mapping stage', async () => {
      render(<Dashboard />)
      await waitFor(() =>
        screen.getByText(/Space-Enabled Mine Intelligence/i), { timeout: 8000 }
      )
      fireEvent.click(screen.getByRole('button', { name: /Stage: Resource Mapping/i }))
      await waitFor(() => {
        // PrismView renders this section label; getAllByText because PipelineStrip also shows it
        const matches = screen.getAllByText(/Resource Mapping/i)
        expect(matches.length).toBeGreaterThan(1)
      }, { timeout: 8000 })
    })

    it('navigates to Accessibility stage', async () => {
      render(<Dashboard />)
      await waitFor(() =>
        screen.getByText(/Space-Enabled Mine Intelligence/i), { timeout: 8000 }
      )
      fireEvent.click(screen.getByRole('button', { name: /Stage: Accessibility/i }))
      await waitFor(() => {
        expect(screen.getByText(/What can actually be accessed/i)).toBeInTheDocument()
      })
    })

    it('shows consistent 88.4% shortfall probability from API', async () => {
      render(<Dashboard />)
      await waitFor(() =>
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument(), { timeout: 8000 }
      )
      const probs = screen.getAllByText((c) => c.includes('88.4'))
      expect(probs.length).toBeGreaterThan(0)
    })

    it('renders before/after shortfall comparison in Decision Engine', async () => {
      render(<Dashboard />)
      await waitFor(() =>
        screen.getByText(/Space-Enabled Mine Intelligence/i), { timeout: 8000 }
      )
      fireEvent.click(screen.getByRole('button', { name: /Stage: Decision Engine/i }))
      await waitFor(() => {
        expect(screen.getByText(/Current forecast/i)).toBeInTheDocument()
        expect(screen.getByText(/After intervention/i)).toBeInTheDocument()
      })
    })

    it('pipeline strip has 6 stage buttons', async () => {
      render(<Dashboard />)
      await waitFor(() =>
        screen.getByText(/Space-Enabled Mine Intelligence/i), { timeout: 8000 }
      )
      const stageButtons = screen.getAllByRole('button', {
        name: /Stage: (Mission Overview|Space Intelligence|Resource Mapping|Accessibility|Production Forecast|Decision Engine)/i,
      })
      expect(stageButtons.length).toBe(6)
    })
  })
})
