# OreSight — Full System Architecture

**Hackathon:** Smart India Hackathon 2026 — Problem Statement SIH26009
**Domain:** Manganese mine reserve intelligence and production decision support
**Operator context:** MOIL Limited (Govt. of India Enterprise) — Balaghat-type mine
**Prototype data:** Synthetic calibrated dataset (DEMO-01, seed 42)

---

## The Problem OreSight Solves

A manganese mine has a geological survey that says it holds millions of tonnes of ore. That number alone is misleading — it says nothing about:

1. **Where exactly** the ore is concentrated spatially, and what surface signals point to it
2. **How much** of it can actually be mined today under operational constraints
3. **Whether** the mine will hit its monthly production target
4. **What single action** will most reduce the risk of missing that target

OreSight answers all four in sequence across two connected intelligence tracks.

---

## The One-Sentence Story

> **"OreSight combines geological and space-based surface intelligence to identify and understand potential manganese reserves, then connects accessible reserves with operational AI to forecast production shortfalls, explain their causes, and recommend feasible actions."**

---

## Two-Track Architecture

```
┌─────────────────────────────┐    ┌─────────────────────────────────────┐
│  TRACK 1                    │    │  TRACK 2                            │
│  Reserve Identification     │    │  Production Intelligence            │
│  Space + Geology            │    │  Operations + AI/ML                 │
│                             │    │                                     │
│  🛰 Satellite imagery       │    │  ⚙ Production history              │
│  🗺 GIS / spatial data      │    │  🔧 Equipment telemetry            │
│  ⛏ Borehole assays         │    │  💨 Blast / development data        │
│  🧱 Block model             │    │  👷 Manpower & shifts               │
│                             │    │  🌧 Weather / rainfall              │
│  Surface indicators         │    │                                     │
│  + Kriging reserve model    │    │  Forecast → Risk → SHAP → Action    │
└──────────────┬──────────────┘    └──────────────┬──────────────────────┘
               │                                   │
               └──────────────┬────────────────────┘
                              │
                     Accessible Reserve
                    (EAR — the bridge between
                     what exists and what can
                     be produced today)
                              │
                       Production Forecast
                              │
                         Risk Analysis
                              │
                        Recommended Action
```

---

## End-to-End System Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           DATA INPUTS                                    │
│                                                                          │
│  Geological:          Satellite / Remote Sensing:    Operational:        │
│  boreholes.csv        weather.csv (NDVI, LST,        production.csv      │
│  blocks.csv           soil_moisture proxy)           equipment.csv       │
│  assay data           [Integration-ready:            blast.csv           │
│                        Sentinel-2, ISRO Bhuvan,      development.csv     │
│                        Landsat-8/9, SRTM DEM]        manpower.csv        │
└────────────┬─────────────────────┬───────────────────────┬───────────────┘
             │                     │                       │
             ▼                     ▼                       │
┌────────────────────┐  ┌─────────────────────────────┐   │
│  PRISM             │  │  REMOTE SENSING              │   │
│  Ordinary Kriging  │  │  Surface Indicator Module    │   │
│  Reserve Estimate  │  │  (remote_sensing.py)         │   │
│                    │  │                              │   │
│  48.27 Mt declared │  │  NDVI · Iron Oxide Index     │   │
│  498 ore blocks    │  │  Clay/Alteration Index       │   │
│  Mn cutoff 20%     │  │  Soil Moisture · Prosp Score │   │
│                    │  │  5 surface anomaly targets   │   │
└────────┬───────────┘  └──────────────┬──────────────┘   │
         │                             │                   │
         └─────────────┬───────────────┘                   │
                       │                                   │
                       ▼                                   │
          ┌────────────────────────┐                       │
          │  Integrated Reserve    │                       │
          │  Identification        │                       │
          │                        │                       │
          │  Spatial surface       │                       │
          │  evidence + subsurface │                       │
          │  geological evidence   │                       │
          └────────────┬───────────┘                       │
                       │                                   │
                       ▼                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      EAR — Effective Accessible Reserve                  │
│                                                                          │
│   Constraint 1: Development depth  ≤ 192 m                              │
│   Constraint 2: Equipment availability  ≥ 85%                           │
│   Constraint 3: Weather feasibility  rainfall ≤ 30 mm/day               │
│                                                                          │
│   48.27 Mt declared  →  32.74 Mt accessible  (67.8% ratio)              │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     PULSE — Production Forecasting                       │
│                                                                          │
│   LightGBM quantile regression · 38 features · 30-day horizon           │
│   P10 / P50 / P90 uncertainty bands                                      │
│   EAR constraint cap applied post-forecast                               │
│                                                                          │
│   Planned: 71,989 t  │  P50: 68,593 t  │  Shortfall prob: 88.4%         │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                  RISK + SHAP — Risk & Root-Cause Attribution             │
│                                                                          │
│   Risk classification: LOW / MEDIUM / HIGH / CRITICAL (≥75%)            │
│   TreeExplainer on P50 LightGBM model                                   │
│   38 features ranked by mean |SHAP| — ACTIONABLE vs CONTEXTUAL          │
│                                                                          │
│   Result: CRITICAL (88.4%)                                               │
│   Top drivers: fleet_availability · development_m · delay_h             │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      NUDGE — Prescriptive Optimization                   │
│                                                                          │
│   Counterfactual scoring: 4 levers × 5 candidate values                 │
│   PuLP CBC binary integer program: select 1 best feasible action        │
│   EAR constraint enforced on 30-day counterfactual total                │
│                                                                          │
│   Best action: development_m  18.53 → 19.24 m/day  (+606.6 t gain)     │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND (read-only)                         │
│                    http://127.0.0.1:8000                                 │
│                                                                          │
│   /api/satellite      /api/satellite/grid                                │
│   /api/prism          /api/prism/blocks                                  │
│   /api/ear            /api/ear/blocks                                    │
│   /api/pulse          /api/risk    /api/shap                             │
│   /api/nudge          /api/nudge/candidates    /api/health               │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ JSON over HTTP
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND DASHBOARD                              │
│                    http://localhost:5173                                  │
│                                                                          │
│   Overview → Space & GIS → Reserve ID → Accessibility → Forecast → Action│
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Pipeline Stages in Detail

### Stage 0 — Remote Sensing / Space Technology (`models/remote_sensing.py`)

**Question:** What do satellite-derived surface indicators tell us about potential mineralisation?

**What it does:**
Generates synthetic surface indicator layers across a 50 m spatial grid covering the mine area. Indicators are spatially calibrated from the borehole grade distribution (IDW interpolation) to simulate the real-world correlation between surface spectral features and subsurface grade.

**Surface indicators produced:**

| Indicator | Acronym | Real remote-sensing basis |
|---|---|---|
| Normalised Difference Vegetation Index | NDVI | Vegetation stress over mineralised / altered zones |
| Iron Oxide Index | IOI | Fe-rich surface soils and gossans associated with Mn deposits |
| Clay / Alteration Index | CAI | Hydroxyl absorption in SWIR — weathered profile above ore |
| Soil Moisture Proxy | NDWI | Soil drainage anomalies over buried ore zones |
| Composite Prospectivity Score | — | Weighted combination of IOI + CAI − NDVI (0–1) |

**Critical disclaimer:**
> Surface indicators provide **spatial context and surface-level evidence only**. They do NOT directly detect subsurface manganese ore. Subsurface reserve estimation is based on borehole composites and Ordinary Kriging.

**Prototype vs production:**

| | Current prototype | Production / integration-ready |
|---|---|---|
| Data source | Synthetic, calibrated from boreholes | Sentinel-2 Level-2A · ISRO Bhuvan Resourcesat-2A · Landsat-8/9 OLI · SRTM DEM |
| Processing | NumPy / Pandas | GDAL · Rasterio · GeoPandas · Google Earth Engine |
| Status | ✅ Implemented (synthetic) | ◎ Integration-ready |

**Outputs:** `satellite_indicators.json` · `satellite_grid.csv` (208 cells, 50 m resolution)

---

### Stage 1 — PRISM: Geological Reserve Estimation (`models/prism.py`)

**Question:** Where is the ore and how much tonnage does it represent?

**Method:** Ordinary Kriging — the industry-standard geostatistical interpolation technique for mineral grade estimation. Estimates Mn grade at every block from sparse borehole samples.

```
Borehole composites (sparse, known Mn grades)
         │
         ▼  Spherical variogram fitted by grid search
         │  Z-anisotropy ×5 (shorter vertical correlation)
         ▼
Ordinary Kriging — 20 nearest neighbours per block
Solves: [γ matrix | 1] × [weights | λ] = [γ(h) | 1]
         │
         ▼  Mn ≥ 20% cutoff
         498 ore blocks / 1,742 waste blocks
         Tonnage = volume × density × ore_flag
```

**Key numbers:** 2,240 blocks → 498 ore → **48.27 Mt declared reserve** (avg Mn 25.2%)

**Outputs:** `reserve_blocks.csv` · `reserve_summary.json`

**Integration with remote sensing:**
The spatial footprint of PRISM's ore blocks overlaps with the surface target grid from remote sensing. High-prospectivity surface cells (IOI > 0.65) tend to overlie ore-bearing blocks — providing mutual reinforcement between the two evidence streams.

---

### Stage 2 — EAR: Effective Accessible Reserve (`models/ear.py`)

**Question:** How much of the declared ore can actually be mined under today's operational constraints?

**Three constraints (ALL must pass):**

| Constraint | Threshold | Blocks blocked |
|---|---|---|
| Development depth | z ≤ 192 m | ~25% of ore blocks |
| Equipment availability | fleet mean ≥ 85% (actual: 90.6%) | Passes mine-wide |
| Weather feasibility | rainfall ≤ 30 mm/day | Probabilistic per block |

**Result:** 48.27 Mt → **32.74 Mt accessible** (67.8% ratio, 339/498 blocks accessible)

**Outputs:** `ear_blocks.csv` · `ear_summary.json`

---

### Stage 3 — PULSE: Production Forecasting (`models/pulse.py`)

**Question:** Will we hit our planned production target over the next 30 days?

**Method:** LightGBM quantile regression — three separate models (α = 0.10, 0.50, 0.90)

**38 features:** lag features (1/2/3/7/14/30 days), rolling stats, equipment telemetry, blast, development, manpower, weather, temporal calendar

**Chronological split — no data leakage:**
```
2023-01-31 ─────── 2025-10-02 ─── 2025-12-01 ── 2025-12-31
│   Training (976 days)        │  Validation  │  Forecast  │
```

**Result:** P50 = 68,593 t vs planned 71,989 t · Shortfall prob: **88.4% (CRITICAL)** · MAPE: 2.66%

**Outputs:** `pulse_forecast.csv` · `pulse_summary.json`

---

### Stage 4 — RISK + SHAP (`models/risk_shap.py`)

**Question:** How severe is the risk and which operational factors are driving it?

**RISK thresholds:** LOW <25% · MEDIUM 25–50% · HIGH 50–75% · **CRITICAL ≥75%**

**SHAP:** `TreeExplainer` on the P50 LightGBM model. Features labelled ACTIONABLE (mine can control) vs CONTEXTUAL (weather, calendar).

**Top 5 drivers:**

| Rank | Feature | Mean \|SHAP\| | Type |
|---|---|---|---|
| 1 | planned_t | 97.16 | ACTIONABLE |
| 2 | rainfall_mm | 41.93 | CONTEXTUAL |
| 3 | fleet_availability | 24.24 | ACTIONABLE |
| 4 | development_m | 17.55 | ACTIONABLE |
| 5 | delay_h | 16.98 | ACTIONABLE |

**Outputs:** `risk_summary.json` · `shap_importance.csv`

---

### Stage 5 — NUDGE: Prescriptive Optimization (`models/nudge.py`)

**Question:** What one action should the mine manager take right now?

**Method:** Counterfactual scoring on 4 levers × 5 candidate values → PuLP CBC binary integer program selects 1 best feasible action.

**Levers:** `fleet_availability` · `fleet_downtime_h` · `development_m` · `available_workers`

**Best result:** Increase `development_m` from 18.53 → 19.24 m/day · **+606.6 t gain** · New shortfall: 2,789 t

**Outputs:** `nudge_recommendation.json` · `nudge_candidates.csv`

---

## Precomputed Output Files

All 12 files in `models/output/` — backend reads these; no model logic runs at request time.

```
models/output/
├── satellite_indicators.json   ← Remote Sensing: summary + 5 surface targets
├── satellite_grid.csv          ← Remote Sensing: 208-cell spatial indicator grid
├── reserve_blocks.csv          ← PRISM: 2,240 blocks with Mn grade + ore flag
├── reserve_summary.json        ← PRISM: 48.27 Mt declared, variogram params
├── ear_blocks.csv              ← EAR: 498 ore blocks with accessibility flags
├── ear_summary.json            ← EAR: 32.74 Mt accessible, 67.8% ratio
├── pulse_forecast.csv          ← PULSE: 30-day daily P10/P50/P90
├── pulse_summary.json          ← PULSE: 88.4% shortfall prob, 3,396 t gap
├── risk_summary.json           ← RISK+SHAP: CRITICAL, top drivers
├── shap_importance.csv         ← SHAP: 38 features ranked by mean |SHAP|
├── nudge_recommendation.json   ← NUDGE: best action, +606.6 t gain
└── nudge_candidates.csv        ← NUDGE: all 4 levers × multiple levels ranked
```

---

## FastAPI Backend

**Location:** `backend/main.py` · **Version:** 0.2.0
**Framework:** FastAPI + Uvicorn + Pydantic v2
**Start:** `uvicorn backend.main:app --reload`

Pure read-only presentation layer. No model logic, no retraining.

**Full API surface:**

| Method | Endpoint | Track | Description |
|---|---|---|---|
| GET | `/api/health` | — | Phase file availability (6 phases including remote_sensing) |
| GET | `/api/overview` | Both | Combined summary for main dashboard |
| GET | `/api/satellite` | Track 1 | Surface indicator summary + top 5 targets |
| GET | `/api/satellite/grid` | Track 1 | Full 208-cell spatial indicator grid |
| GET | `/api/prism` | Track 1 | Geological reserve summary |
| GET | `/api/prism/blocks` | Track 1 | Full 2,240-block model for 3D visualisation |
| GET | `/api/ear` | Bridge | Accessible reserve summary |
| GET | `/api/ear/blocks` | Bridge | 498 ore blocks with accessibility flags |
| GET | `/api/pulse` | Track 2 | 30-day P10/P50/P90 forecast |
| GET | `/api/risk` | Track 2 | Risk level + SHAP top drivers |
| GET | `/api/shap` | Track 2 | All 38 features by SHAP importance |
| GET | `/api/nudge` | Track 2 | Best recommended action |
| GET | `/api/nudge/candidates` | Track 2 | All ranked intervention candidates |

---

## React Frontend

**Location:** `frontend/src/` · **Start:** `npm run dev` → `http://localhost:5173`

**6-stage navigation (PipelineStrip):**

| Tab | Stage ID | Track | What it shows |
|---|---|---|---|
| Overview | `overview` | Both | Two-track banner + 5-stage pipeline flow + KPI cards |
| Space & GIS | `satellite` | Track 1 | Prospectivity heat map · surface targets · layer stats · integration info |
| Reserve ID | `prism` | Track 1 | Dual-evidence banner (satellite + borehole) · 3D block model · kriging stats |
| Accessibility | `ear` | Bridge | 3D accessibility scatter · constraint funnel · EAR breakdown |
| Forecast | `pulse` | Track 2 | P10/P50/P90 fan chart · risk badge · SHAP bar chart |
| Action | `nudge` | Track 2 | Before/after comparison · recommended action · all candidates |

---

## How to Run the Full System

**Step 1 — Run the intelligence pipeline (once):**
```powershell
python models/remote_sensing.py   # Track 1 — satellite surface indicators
python models/prism.py            # Track 1 — geological reserve (Kriging)
python models/ear.py              # Bridge  — operational accessibility
python models/pulse.py            # Track 2 — production forecast
python models/risk_shap.py        # Track 2 — risk classification + SHAP
python models/nudge.py            # Track 2 — prescriptive optimization
```

**Step 2 — Backend (Terminal 1):**
```powershell
uvicorn backend.main:app --reload
# → http://127.0.0.1:8000  |  Swagger: /docs
```

**Step 3 — Frontend (Terminal 2):**
```powershell
cd frontend && npm run dev
# → http://localhost:5173
```

---

## Key Design Decisions

**Why offline pipeline, not live inference?**
Pipeline stages (Kriging, LightGBM training, SHAP) take seconds on a laptop. Pre-computing lets the backend be instant (file I/O only). For production, a scheduled re-run on new data is straightforward.

**Why synthetic surface indicators instead of real satellite imagery?**
Acquiring and preprocessing real Sentinel-2 scenes requires internet access, GDAL installation, and careful atmospheric correction — out of scope for a hackathon prototype. The synthetic indicators are spatially calibrated from the borehole grade field (IDW) so the statistical relationship between surface anomaly and grade is physically motivated. The architecture is fully integration-ready for real imagery.

**Why label geospatial tools as "integration-ready"?**
Honesty. GDAL, Rasterio, GeoPandas, and GEE are not installed or exercised in this prototype. Listing them as implemented would be misleading. Marking them as integration-ready is accurate and still demonstrates architectural awareness.

**Why PuLP for NUDGE?**
Provides a formally auditable decision record. Even though the current problem is trivially a "pick the best of 4" selection, framing it as a MILP means it can be extended to multi-action, budget-constrained, or sequence-constrained optimisation without rearchitecting.

---

## Numbers at a Glance

| Metric | Value |
|---|---|
| Surface indicator grid cells | 208 |
| Surface anomaly targets | 5 |
| Mean prospectivity score | 0.446 |
| 3D model blocks | 2,240 |
| Ore blocks (Mn ≥ 20%) | 498 |
| Declared reserve (PRISM) | 48.27 Mt |
| Accessible reserve (EAR) | 32.74 Mt |
| Accessibility ratio | 67.8% |
| PULSE forecast horizon | 30 days |
| P50 forecast | 68,593 t |
| Planned production | 71,989 t |
| Expected shortfall | 3,396 t (4.7%) |
| Shortfall probability | 88.4% → CRITICAL |
| Best NUDGE action | +606.6 t (+17.9% shortfall reduction) |
| API endpoints | 13 |
| Frontend stages | 6 |

---

## Prototype vs Production

| Capability | Prototype (current) | Production |
|---|---|---|
| Satellite data | Synthetic calibrated indicators | Sentinel-2 Level-2A via ESA or ISRO Bhuvan |
| Raster processing | NumPy/Pandas | GDAL · Rasterio · GeoPandas |
| Borehole data | Synthetic (seed 42) | Real MOIL / GSI drillhole assays |
| Production data | Synthetic (calibrated to MOIL scale) | Real mine ERP / SCADA data |
| Database | Flat files (JSON/CSV) | SQLite or PostgreSQL with seeding |
| Multi-mine | Single DEMO-01 | Mine-scoped API (mine_id parameter) |
| Authentication | None | JWT / API key |
| Retraining | Manual pipeline re-run | Scheduled job on new data |
