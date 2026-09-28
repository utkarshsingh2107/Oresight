# OreSight — Technology Stack

**Hackathon:** Smart India Hackathon 2026 — SIH26009
**Architecture:** Two-track — Space + Geology (Reserve Identification) + Operations + AI/ML (Production Intelligence)

---

## Stack Overview by Track

```
TRACK 1 — Reserve Identification          TRACK 2 — Production Intelligence
Space + Geology                           Operations + AI/ML
──────────────────────────────────        ──────────────────────────────────
NumPy / Pandas                            LightGBM 4.7   (quantile regression)
Custom Ordinary Kriging                   SHAP 0.52      (TreeExplainer)
Synthetic surface indicators              PuLP 2.9       (CBC integer optimizer)
                                          NumPy / Pandas
                  ↕ FastAPI + Uvicorn + Pydantic v2 ↕
                        React 18 + Vite 5
             Recharts (2D) + Plotly.js Basic (3D, lazy)
```

---

## 1. Backend

| Component | Library / Version | Purpose |
|---|---|---|
| API framework | FastAPI `≥0.100` (installed: 0.141.1) | REST API, request validation, auto OpenAPI docs |
| ASGI server | Uvicorn `≥0.20` (installed: 0.52.4) | Serves the FastAPI app |
| Data validation | Pydantic `≥2.0` (installed: v2) | Response models and schema enforcement |
| Data I/O | Pandas `≥2.1` (installed: 2.3.3) | Reads CSV output files for API responses |
| HTTP test client | HTTPX `≥0.24` | Integration testing of API routes |
| Language | Python `3.13` | Runtime |
| API version | `0.2.0` | Two-track architecture with remote_sensing phase |

**Design principle:** Pure read-only presentation layer. Reads 12 pre-computed files from `models/output/`. No model logic at request time. Missing file → HTTP 404; malformed file → HTTP 500.

**Health check phases (6):** `remote_sensing` · `prism` · `ear` · `pulse` · `risk_shap` · `nudge`

---

## 2. AI / ML Pipeline

### Track 1 — Reserve Identification

| Component | Technology | Status |
|---|---|---|
| Geological reserve estimation | **Custom Ordinary Kriging** (NumPy) | ✅ Implemented |
| Variogram fitting | Grid-search spherical variogram | ✅ Implemented |
| Spatial interpolation | 20-NN local kriging, Z-anisotropy ×5 | ✅ Implemented |
| Surface indicator generation | NumPy / Pandas (IDW from boreholes) | ✅ Implemented (synthetic) |
| Spectral index computation | NDVI · Iron Oxide Index · Clay/Alteration · NDWI | ✅ Implemented (synthetic) |
| Prospectivity scoring | Composite weighted score (0–1) | ✅ Implemented |
| Anomaly target detection | Top-N surface target flagging | ✅ Implemented |
| Real satellite image ingest | GDAL · Rasterio · GeoPandas | ◎ Integration-ready |
| Cloud-based EO processing | Google Earth Engine Python API | ◎ Integration-ready |

### Track 2 — Production Intelligence

| Component | Library / Version | Purpose |
|---|---|---|
| Production forecasting | **LightGBM** `≥4.0` (installed: 4.7.0) | Quantile regression — P10 / P50 / P90 |
| Feature engineering | Pandas `2.3.3` | 38 features: lags, rolling stats, ops, weather, calendar |
| Risk attribution | **SHAP** `≥0.46` (installed: 0.52.0) | `TreeExplainer` on P50 LightGBM model |
| Prescriptive optimization | **PuLP** `≥2.9` (installed: 2.9.0) | Binary integer program, CBC solver |
| Scientific computing | NumPy `2.4.2` | Matrix operations, kriging system solve |

---

## 3. Geospatial / Remote Sensing

| Component | Technology | Status |
|---|---|---|
| Surface indicator pipeline | NumPy + Pandas | ✅ **Implemented** (synthetic calibrated) |
| Spatial grid generation | NumPy meshgrid over block model extent | ✅ Implemented |
| IDW grade interpolation | NumPy inverse-distance weighting | ✅ Implemented |
| Raster file processing | **GDAL** | ◎ Integration-ready |
| Satellite image preprocessing | **Rasterio** | ◎ Integration-ready |
| Vector / spatial analysis | **GeoPandas** + Shapely | ◎ Integration-ready |
| Cloud EO platform | **Google Earth Engine** Python API | ◎ Integration-ready |

**Prototype data vs real satellite data:**

| | Current prototype | Integration-ready path |
|---|---|---|
| Source | Synthetic, calibrated from boreholes | ESA Copernicus Sentinel-2 Level-2A (10–20 m) |
| | | ISRO Bhuvan Resourcesat-2A LISS-IV (2.5 m) |
| | | USGS Landsat-8/9 OLI (30 m) |
| | | NASA SRTM / ALOS DEM (30 m terrain) |
| Band ratios | Simulated via NumPy | Computed from calibrated surface reflectance |
| Preprocessing | None needed | Atmospheric correction, cloud masking (sen2cor / GEE) |

> ◎ **Integration-ready** = the system architecture supports this component; it is not currently installed or exercised in the prototype.

---

## 4. Frontend

| Component | Library / Version | Purpose |
|---|---|---|
| UI framework | React `18.2.0` | Component-based dashboard |
| Build tool | Vite `5.2.13` | Dev server, HMR, production bundling |
| React plugin | `@vitejs/plugin-react` `4.2.1` | JSX transform, Fast Refresh |
| 2D charts | Recharts `2.12.7` | Forecast fan chart, SHAP bar chart, candidate progress bars |
| 3D visualisation | Plotly.js Basic `4.0.0` | Block model and accessibility 3D scatter (lazy-loaded) |
| Spatial heat map | SVG (custom React) | Prospectivity grid in `SatelliteView.jsx` |
| HTTP client | Native `fetch` | API calls via `services/api.js` |
| Language | JavaScript (JSX) | No TypeScript — plain `.jsx` |
| Styling | Custom CSS variables | Dark industrial theme in `global.css` |
| Dev port | `5173` (Vite default) | |

**Plotly strategy:** Lazy-loaded via dynamic `import('plotly.js-basic-dist-min')` to keep initial bundle small (~600 KB vs 1.8 MB).

**Prospectivity map strategy:** Custom SVG grid in `SatelliteView.jsx` — avoids a Leaflet dependency for this simple 2D heat map. Each cell coloured by `prosp_score`; anomaly targets marked with ★.

---

## 5. Testing

| Layer | Tool | Version | Coverage |
|---|---|---|---|
| Frontend | Vitest | `1.6.0` | `Dashboard.test.jsx` — component render |
| Frontend DOM | `@testing-library/react` | `14.3.1` | Component interaction assertions |
| Frontend matchers | `@testing-library/jest-dom` | `6.4.6` | DOM assertion helpers |
| Frontend env | jsdom | `24.1.1` | Browser simulation in Node |
| Backend | Pytest | `≥8.0` | `tests/` directory — data quality + model stages |
| Python model tests | Pytest | | 112 passing (22 data + 7 PRISM + 15 EAR + 23 PULSE + 21 RISK+SHAP + 24 NUDGE) |

---

## 6. Data Layer

All source data in `data/raw/` — synthetic, `seed=42`, mine `DEMO-01`, 2023-01-01 → 2025-12-31.

| File | Used by | Contents |
|---|---|---|
| `boreholes.csv` | PRISM + Remote Sensing | Mn / Fe / SiO₂ grades, x/y/z coordinates |
| `blocks.csv` | PRISM | 3D block centroids, volume, density |
| `production.csv` | PULSE | Daily planned / actual tonnes |
| `equipment.csv` | EAR + PULSE + NUDGE | Fleet availability, downtime, failures |
| `blast.csv` | PULSE | Blast count, delay hours |
| `development.csv` | EAR + PULSE + NUDGE | Daily advance metres |
| `manpower.csv` | PULSE + NUDGE | Workers, shifts |
| `weather.csv` | EAR + PULSE | Rainfall, soil moisture, NDVI, LST |

Pre-computed model outputs written to `models/output/` — **12 files** (previously 10; added `satellite_indicators.json` and `satellite_grid.csv`).

---

## 7. Dev Environment

| Tool | Version |
|---|---|
| Python | `3.13` (tested) |
| Node.js | `24.11.1` (tested) |
| npm | `11.6.2` |
| OS | Windows 11 / macOS / Linux |
| Database | None — flat files (JSON + CSV) |
| Docker | Not required |

---

## 8. API Surface (v0.2.0)

| Method | Endpoint | Track | Returns |
|---|---|---|---|
| GET | `/` | — | API identity |
| GET | `/api/health` | — | 6-phase file availability |
| GET | `/api/overview` | Both | Combined summary |
| GET | `/api/satellite` | Track 1 | Surface indicator summary + 5 targets |
| GET | `/api/satellite/grid` | Track 1 | 208-cell spatial grid |
| GET | `/api/prism` | Track 1 | Kriging reserve summary |
| GET | `/api/prism/blocks` | Track 1 | 2,240-block model for 3D viz |
| GET | `/api/ear` | Bridge | Accessible reserve summary |
| GET | `/api/ear/blocks` | Bridge | 498 blocks with accessibility flags |
| GET | `/api/pulse` | Track 2 | 30-day P10/P50/P90 forecast |
| GET | `/api/risk` | Track 2 | Risk level + SHAP top drivers |
| GET | `/api/shap` | Track 2 | All 38 features by SHAP importance |
| GET | `/api/nudge` | Track 2 | Best recommended action |
| GET | `/api/nudge/candidates` | Track 2 | All ranked candidates |

Interactive docs: `http://127.0.0.1:8000/docs`

---

## 9. Implemented vs Integration-Ready Summary

| Capability | Status |
|---|---|
| Ordinary Kriging geological reserve | ✅ Implemented |
| Surface indicator generation (synthetic) | ✅ Implemented |
| Prospectivity scoring and target flagging | ✅ Implemented |
| LightGBM quantile production forecasting | ✅ Implemented |
| SHAP TreeExplainer risk attribution | ✅ Implemented |
| PuLP CBC counterfactual optimization | ✅ Implemented |
| FastAPI REST backend (13 endpoints) | ✅ Implemented |
| React dashboard (6-stage navigation) | ✅ Implemented |
| Real Sentinel-2 / ISRO Bhuvan ingest | ◎ Integration-ready |
| GDAL / Rasterio raster processing | ◎ Integration-ready |
| GeoPandas spatial analysis | ◎ Integration-ready |
| Google Earth Engine pipeline | ◎ Integration-ready |
| SQLite / PostgreSQL database | ◎ Integration-ready |
| Multi-mine API (mine_id scoping) | ◎ Integration-ready |
| PDF report generation | ◎ Integration-ready |
| Authentication / rate limiting | ◎ Integration-ready |
