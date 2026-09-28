# OreSight

> **"OreSight combines geological and space-based surface intelligence to identify and understand potential manganese reserves, then connects accessible reserves with operational AI to forecast production shortfalls, explain their causes, and recommend feasible actions."**

**Hackathon:** Smart India Hackathon 2026 — Problem Statement SIH26009
**Domain:** Manganese mining decision intelligence
**Operator context:** MOIL Limited (Govt. of India Enterprise) — Balaghat mine type
**Prototype status:** Synthetic calibrated data (DEMO-01) — not real MOIL operational data

---

## The Complete System Story

```
🛰 SPACE + GEOLOGY          ⚙ OPERATIONS + AI/ML
──────────────────          ──────────────────────
Satellite surface    ┐      Production history  ┐
indicators           │      Equipment telemetry  │
                     ├──▶   Blast / development  ├──▶  Forecast
Borehole assays      │      Manpower / shifts    │     Risk
Kriging reserve  ────┘      Weather / rainfall   ┘     Action
      │
      ▼
Reserve Identification
      │
      ▼
Operational Accessibility (EAR)
      │
      ▼
Production Forecast → Risk → SHAP → Optimization → Recommended Action
```

---

## Two-Track Architecture

OreSight solves two connected problems in sequence.

### Track 1 — Reserve Identification (Space + Geology)

**What it answers:** Where is the ore, and what can satellites tell us about potential mineralisation?

- **Remote sensing module** generates surface indicators from satellite-derived spectral features: vegetation anomaly (NDVI), iron-oxide enrichment index, clay/alteration index, soil moisture proxy, and a composite prospectivity score
- **PRISM module** estimates manganese grade across the 3D block model using Ordinary Kriging from borehole composites
- The two evidence streams are **complementary**: satellite data provides surface spatial context; boreholes provide subsurface grade evidence
- Five surface anomaly targets are flagged per mine area, ranked by prospectivity score

> **Important:** Satellite observations provide surface indicators and spatial context only. They do NOT directly detect subsurface manganese ore. Subsurface reserve estimation is grounded in borehole and assay data.

### Track 2 — Production Intelligence (Operations + AI/ML)

**What it answers:** Will we hit our production target, why are we at risk, and what one action fixes it?

- **EAR** converts the declared geological reserve into operationally accessible tonnage by applying three real-world constraints: development depth, equipment availability, weather feasibility
- **PULSE** forecasts 30-day production with P10/P50/P90 uncertainty bands using LightGBM quantile regression on 38 operational features
- **RISK + SHAP** classifies shortfall risk (LOW/MEDIUM/HIGH/CRITICAL) and explains which features drive the forecast using TreeExplainer
- **NUDGE** evaluates counterfactual interventions across four operational levers and uses PuLP integer optimization to select the single best feasible action

---

## What Is Implemented vs Integration-Ready

| Capability | Status |
|---|---|
| Surface indicator generation (synthetic calibrated) | ✅ Implemented |
| Prospectivity scoring and anomaly target flagging | ✅ Implemented |
| Ordinary Kriging geological reserve estimation | ✅ Implemented |
| EAR operational accessibility analysis | ✅ Implemented |
| LightGBM quantile production forecasting | ✅ Implemented |
| SHAP root-cause attribution | ✅ Implemented |
| PuLP counterfactual prescriptive optimization | ✅ Implemented |
| FastAPI REST backend (13 endpoints) | ✅ Implemented |
| React dashboard (6-stage navigation) | ✅ Implemented |
| Real Sentinel-2 / ISRO Bhuvan satellite ingest | ◎ Integration-ready |
| GDAL / Rasterio raster processing | ◎ Integration-ready |
| GeoPandas spatial analysis | ◎ Integration-ready |
| Live mine operational data (ERP/SCADA) | ◎ Integration-ready |

---

## Quick Start

### Prerequisites

- Python 3.11+ (tested on 3.13)
- Node.js 18+ and npm (tested on Node 24)
- No Docker, no database required

### One-Time Setup

**Python environment:**
```powershell
# Windows (PowerShell)
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

```bash
# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Frontend dependencies:**
```powershell
cd frontend
npm install
cd ..
```

### Run the Intelligence Pipeline (once, or when data changes)

```powershell
# Track 1 — Reserve Identification
python models/remote_sensing.py   # Satellite surface indicators
python models/prism.py            # Geological reserve (Ordinary Kriging)

# Bridge
python models/ear.py              # Operational accessibility

# Track 2 — Production Intelligence
python models/pulse.py            # LightGBM quantile forecast
python models/risk_shap.py        # Risk classification + SHAP
python models/nudge.py            # PuLP prescriptive optimization
```

All outputs are written to `models/output/` (12 files). This step only needs to be repeated if source data changes.

### Start the Application

**Terminal 1 — Backend:**
```powershell
uvicorn backend.main:app --reload
```
Verify: `http://127.0.0.1:8000/api/health` → `{"status":"healthy","phases":{...all true...}}`

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## Dashboard Navigation

The dashboard has 6 stages, navigable via the pipeline strip at the top:

| Stage | What it shows |
|---|---|
| **Overview** | Two-track architecture banner · 5-stage pipeline flow · KPI cards (reserve → forecast → risk → action) |
| **Space & GIS** | Prospectivity heat map · Top-5 surface anomaly targets · Spectral layer statistics · Integration-ready satellite sources |
| **Reserve ID** | Dual-evidence banner (satellite + borehole) · Interactive 3D block model (Plotly) · Kriging parameters |
| **Accessibility** | 3D accessibility scatter · EAR constraint funnel · 67.8% accessibility breakdown |
| **Forecast** | P10/P50/P90 fan chart (Recharts) · Risk badge · SHAP top-6 driver bar chart |
| **Action** | NUDGE recommendation before/after comparison · All 4 intervention candidates ranked |

---

## API Reference

Backend at `http://127.0.0.1:8000` · Interactive docs at `/docs`

| Method | Endpoint | Track | Description |
|---|---|---|---|
| GET | `/api/health` | — | 6-phase file availability check |
| GET | `/api/overview` | Both | Combined dashboard summary |
| GET | `/api/satellite` | Track 1 | Surface indicator summary + 5 anomaly targets |
| GET | `/api/satellite/grid` | Track 1 | 208-cell spatial prospectivity grid |
| GET | `/api/prism` | Track 1 | Geological reserve summary |
| GET | `/api/prism/blocks` | Track 1 | 2,240-block model for 3D visualisation |
| GET | `/api/ear` | Bridge | Accessible reserve summary |
| GET | `/api/ear/blocks` | Bridge | 498 ore blocks with accessibility flags |
| GET | `/api/pulse` | Track 2 | 30-day P10/P50/P90 forecast |
| GET | `/api/risk` | Track 2 | Risk level + SHAP top drivers |
| GET | `/api/shap` | Track 2 | All 38 features by SHAP importance |
| GET | `/api/nudge` | Track 2 | Best recommended action |
| GET | `/api/nudge/candidates` | Track 2 | All ranked intervention candidates |

---

## Key Results (DEMO-01)

| Metric | Value |
|---|---|
| Surface anomaly targets flagged | 5 |
| Mean prospectivity score | 0.446 |
| Declared geological reserve | 48.27 Mt |
| Effective accessible reserve | 32.74 Mt |
| Accessibility ratio | 67.8% |
| 30-day planned production | 71,989 t |
| 30-day P50 forecast | 68,593 t |
| Expected shortfall | 3,396 t (4.7%) |
| Shortfall probability | 88.4% → **CRITICAL** |
| Best action | `development_m` 18.53 → 19.24 m/day |
| Production gain | +606.6 t (17.9% of shortfall) |

---

## Project Structure

```
OreSight/
├── README.md                       ← This file
├── ARCHITECTURE.md                 ← Full two-track system architecture
├── ARCHITECTURE_DIAGRAM.md         ← Mermaid diagrams (6 diagrams)
├── TECH.md                         ← Technology stack with implemented/integration-ready labels
├── RESEARCH_AND_REFERENCES.md      ← Government data sources + research references (SIH)
├── requirements.txt
│
├── data/
│   ├── raw/                        ← Synthetic CSVs (8 files, seed 42, DEMO-01)
│   │   └── DATA_DICTIONARY.md
│   └── processed/
│
├── models/
│   ├── remote_sensing.py           ← Track 1: Surface indicator generation ← NEW
│   ├── prism.py                    ← Track 1: Ordinary Kriging reserve
│   ├── ear.py                      ← Bridge: Operational accessibility
│   ├── pulse.py                    ← Track 2: LightGBM quantile forecast
│   ├── risk_shap.py                ← Track 2: Risk + SHAP attribution
│   ├── nudge.py                    ← Track 2: PuLP prescriptive optimization
│   └── output/                     ← 12 pre-computed files
│       ├── satellite_indicators.json  ← NEW
│       ├── satellite_grid.csv         ← NEW
│       ├── reserve_blocks.csv / reserve_summary.json
│       ├── ear_blocks.csv / ear_summary.json
│       ├── pulse_forecast.csv / pulse_summary.json
│       ├── risk_summary.json / shap_importance.csv
│       └── nudge_recommendation.json / nudge_candidates.csv
│
├── backend/
│   └── main.py                     ← FastAPI v0.2.0 — 13 read-only endpoints
│
├── frontend/
│   └── src/
│       ├── pages/Dashboard.jsx     ← 6-stage routing
│       ├── components/
│       │   ├── SatelliteView.jsx   ← NEW — Space & GIS tab
│       │   ├── PrismView.jsx       ← Updated — dual-evidence banner
│       │   ├── PipelineStrip.jsx   ← Updated — 6 stages
│       │   ├── OverviewPanel.jsx   ← Updated — two-track banner
│       │   └── (existing components unchanged)
│       └── services/api.js         ← Updated — 12 fetch functions
│
├── tests/                          ← 112 pytest tests
└── scripts/
    └── generate_data.py
```

---

## Technology Stack Summary

| Layer | Technologies |
|---|---|
| API | FastAPI 0.141 · Uvicorn 0.52 · Pydantic v2 |
| ML — Reserve | Custom Ordinary Kriging (NumPy) |
| ML — Forecast | LightGBM 4.7 (quantile regression) |
| ML — Attribution | SHAP 0.52 (TreeExplainer) |
| ML — Optimization | PuLP 2.9 + CBC solver |
| Geospatial (prototype) | NumPy + Pandas (synthetic indicators) |
| Geospatial (integration-ready) | GDAL · Rasterio · GeoPandas · Google Earth Engine |
| Satellite sources (integration-ready) | Sentinel-2 · ISRO Bhuvan · Landsat-8/9 · SRTM DEM |
| Frontend | React 18 · Vite 5 · Recharts · Plotly.js Basic |
| Language | Python 3.13 · JavaScript (JSX) |

Full detail: see [`TECH.md`](TECH.md)

---

## Data Honesty

| Data | Status |
|---|---|
| Balaghat mine coordinates, mine type, district | ✅ Real — MOIL / IBM public sources |
| MOIL company-level annual production totals | ✅ Real — moil.nic.in annual reports |
| India Mn ore reserves and production statistics | ✅ Real — IBM IMYB 2022 (ibm.gov.in) |
| National Mineral Policy 2019 mandates | ✅ Real — Ministry of Mines / pmindia.gov.in |
| Daily production series (DEMO-01) | 🔶 Synthetic — calibrated to MOIL scale |
| 3D block model / borehole grades | 🔶 Synthetic — spatially correlated, IBM Mn% ranges |
| Surface indicator layers | 🔶 Synthetic — IDW-calibrated from boreholes |
| Equipment events, blast logs, manpower | 🔶 Synthetic — realistic operational patterns |
| Weather / rainfall | 🔶 Synthetic — Indian monsoon seasonal pattern |

The dashboard always shows a "Demo Mode" banner. The prototype demonstrates the full decision pipeline using calibrated synthetic data; the architecture is designed to incorporate real satellite imagery and operational data for deployment.

Full government sources and research references: [`RESEARCH_AND_REFERENCES.md`](RESEARCH_AND_REFERENCES.md)

---

## Troubleshooting

**Pipeline outputs missing (HTTP 404 from backend)**
Run all six model scripts in order. Each stage depends on the previous stage's outputs.

**`ModuleNotFoundError` when running models**
Run from the project root, not from inside the `models/` folder.

**Frontend "Could not reach API"**
Backend must be running. Test with: `curl http://127.0.0.1:8000/api/health`

**Space & GIS tab shows error**
Run `python models/remote_sensing.py` first. This generates `satellite_indicators.json` and `satellite_grid.csv`.

**SHAP takes long on first run**
SHAP runs `TreeExplainer` on the full training set. Expected ~15–30 s on first run, then writes output files.

---

## Project Rules

1. Hackathon MVP — not a production mining system
2. Never claim synthetic data is real MOIL data
3. Never claim satellite imagery directly detects subsurface manganese
4. Always distinguish **implemented** from **integration-ready**
5. Keep the stack CPU-friendly — no GPU, no Docker, no cloud required
6. Do not use an LLM as a scientific prediction model
